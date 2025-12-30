/**
 * 多測站氣象服務 - 整合臺北、社子、內湖三站資料
 * 提供平均降雨量計算與極端氣候警示功能
 */

export interface StationRainfall {
  stationId: string;
  stationName: string;
  townName: string;
  rain1hr: number;
  rain24hr: number;
  observationTime: string;
}

export interface MultiStationData {
  average: {
    rain1hr: number;
    rain24hr: number;
  };
  stations: StationRainfall[];
  alerts: WeatherAlert[];
  fetchedAt: string;
}

export interface ObservationWithGust {
  stationId: string;
  stationName: string;
  observationTime: string;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  gustSpeed: number;
  gustOccurredAt: string | null;
  airPressure: number | null;
  weather: string;
  alerts: WeatherAlert[];
}

export interface WeatherAlert {
  type: "RAIN_1HR" | "RAIN_24HR" | "WIND_GUST" | "WATER_LEVEL";
  severity: "WARNING" | "DANGER" | "CRITICAL";
  value: number;
  threshold: number;
}

// 警報閾值 (與後端同步)
export const ALERT_THRESHOLDS = {
  RAIN_1HR: { warning: 15, danger: 40, critical: 80, unit: "mm" },
  RAIN_24HR: { warning: 80, danger: 200, critical: 350, unit: "mm" },
  WIND_GUST: { warning: 10, danger: 15, critical: 20, unit: "m/s" },
  WATER_LEVEL: { warning: 2.0, danger: 2.4, critical: 2.6, unit: "m" },
};

const API_KEY = import.meta.env.VITE_CWA_API_KEY || "CWA-2A2F828D-6DE6-4EC1-9049-D972D8C89D01";
const BASE_URL = "https://opendata.cwa.gov.tw/api";

// 中山區周邊測站
const NEARBY_STATIONS = ["臺北", "社子", "內湖"];

export const MultiStationWeatherService = {
  /**
   * 取得多測站即時雨量資料並計算平均值
   */
  async getMultiStationRainfall(): Promise<MultiStationData | null> {
    try {
      const stationNames = NEARBY_STATIONS.join(",");
      const url = `${BASE_URL}/v1/rest/datastore/O-A0002-001?Authorization=${API_KEY}&StationName=${encodeURIComponent(stationNames)}&WeatherElement=Now,Past1hr,Past24hr`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success !== "true") {
        console.error("Failed to fetch multi-station rainfall:", data);
        return null;
      }

      const stations = data.records?.Station || [];
      
      let totalRain1hr = 0;
      let totalRain24hr = 0;
      let validCount = 0;
      const stationDetails: StationRainfall[] = [];

      for (const station of stations) {
        const rain1hr = parseFloat(station.RainfallElement?.Past1hr?.Precipitation) || 0;
        const rain24hr = parseFloat(station.RainfallElement?.Past24hr?.Precipitation) || 0;
        
        // 排除無效數據 (-998 表示無資料)
        if (rain1hr >= 0 && rain24hr >= 0) {
          totalRain1hr += rain1hr;
          totalRain24hr += rain24hr;
          validCount++;
          
          stationDetails.push({
            stationId: station.StationId,
            stationName: station.StationName,
            townName: station.GeoInfo?.TownName || "",
            rain1hr,
            rain24hr,
            observationTime: station.ObsTime?.DateTime || "",
          });
        }
      }

      const avgRain1hr = validCount > 0 ? totalRain1hr / validCount : 0;
      const avgRain24hr = validCount > 0 ? totalRain24hr / validCount : 0;

      // 檢查是否需要觸發警報
      const alerts: WeatherAlert[] = [];
      if (avgRain1hr >= ALERT_THRESHOLDS.RAIN_1HR.critical) {
        alerts.push({ type: "RAIN_1HR", severity: "CRITICAL", value: avgRain1hr, threshold: ALERT_THRESHOLDS.RAIN_1HR.critical });
      } else if (avgRain1hr >= ALERT_THRESHOLDS.RAIN_1HR.danger) {
        alerts.push({ type: "RAIN_1HR", severity: "DANGER", value: avgRain1hr, threshold: ALERT_THRESHOLDS.RAIN_1HR.danger });
      } else if (avgRain1hr >= ALERT_THRESHOLDS.RAIN_1HR.warning) {
        alerts.push({ type: "RAIN_1HR", severity: "WARNING", value: avgRain1hr, threshold: ALERT_THRESHOLDS.RAIN_1HR.warning });
      }

      if (avgRain24hr >= ALERT_THRESHOLDS.RAIN_24HR.critical) {
        alerts.push({ type: "RAIN_24HR", severity: "CRITICAL", value: avgRain24hr, threshold: ALERT_THRESHOLDS.RAIN_24HR.critical });
      } else if (avgRain24hr >= ALERT_THRESHOLDS.RAIN_24HR.danger) {
        alerts.push({ type: "RAIN_24HR", severity: "DANGER", value: avgRain24hr, threshold: ALERT_THRESHOLDS.RAIN_24HR.danger });
      } else if (avgRain24hr >= ALERT_THRESHOLDS.RAIN_24HR.warning) {
        alerts.push({ type: "RAIN_24HR", severity: "WARNING", value: avgRain24hr, threshold: ALERT_THRESHOLDS.RAIN_24HR.warning });
      }

      return {
        average: {
          rain1hr: Math.round(avgRain1hr * 10) / 10,
          rain24hr: Math.round(avgRain24hr * 10) / 10,
        },
        stations: stationDetails,
        alerts,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching multi-station rainfall:", error);
      return null;
    }
  },

  /**
   * 取得氣象觀測站即時資料 (含陣風警報)
   */
  async getObservationWithGust(stationName: string = "臺北"): Promise<ObservationWithGust | null> {
    try {
      const url = `${BASE_URL}/v1/rest/datastore/O-A0003-001?Authorization=${API_KEY}&StationName=${encodeURIComponent(stationName)}&WeatherElement=AirTemperature,RelativeHumidity,WindSpeed,WindDirection,GustInfo,AirPressure,Weather`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success !== "true") {
        console.error("Failed to fetch observation with gust:", data);
        return null;
      }

      const station = data.records?.Station?.[0];
      if (!station) {
        return null;
      }

      const weatherElement = station.WeatherElement || {};
      const gustInfo = weatherElement.GustInfo || {};
      const gustSpeed = parseFloat(gustInfo.PeakGustSpeed) || 0;

      // 檢查陣風警報
      const alerts: WeatherAlert[] = [];
      if (gustSpeed >= ALERT_THRESHOLDS.WIND_GUST.critical) {
        alerts.push({ type: "WIND_GUST", severity: "CRITICAL", value: gustSpeed, threshold: ALERT_THRESHOLDS.WIND_GUST.critical });
      } else if (gustSpeed >= ALERT_THRESHOLDS.WIND_GUST.danger) {
        alerts.push({ type: "WIND_GUST", severity: "DANGER", value: gustSpeed, threshold: ALERT_THRESHOLDS.WIND_GUST.danger });
      } else if (gustSpeed >= ALERT_THRESHOLDS.WIND_GUST.warning) {
        alerts.push({ type: "WIND_GUST", severity: "WARNING", value: gustSpeed, threshold: ALERT_THRESHOLDS.WIND_GUST.warning });
      }

      return {
        stationId: station.StationId,
        stationName: station.StationName,
        observationTime: station.ObsTime?.DateTime || "",
        temperature: parseFloat(weatherElement.AirTemperature) || null,
        humidity: parseFloat(weatherElement.RelativeHumidity) || null,
        windSpeed: parseFloat(weatherElement.WindSpeed) || null,
        windDirection: parseFloat(weatherElement.WindDirection) || null,
        gustSpeed,
        gustOccurredAt: gustInfo.Occurred_at?.DateTime || null,
        airPressure: parseFloat(weatherElement.AirPressure) || null,
        weather: weatherElement.Weather || "",
        alerts,
      };
    } catch (error) {
      console.error("Error fetching observation with gust:", error);
      return null;
    }
  },

  /**
   * 取得所有警報 (整合雨量與陣風)
   */
  async getAllAlerts(): Promise<WeatherAlert[]> {
    const [rainfallData, observationData] = await Promise.all([
      this.getMultiStationRainfall(),
      this.getObservationWithGust(),
    ]);

    const allAlerts: WeatherAlert[] = [];
    
    if (rainfallData?.alerts) {
      allAlerts.push(...rainfallData.alerts);
    }
    
    if (observationData?.alerts) {
      allAlerts.push(...observationData.alerts);
    }

    return allAlerts;
  },

  /**
   * 儲存觀測資料到資料庫 (透過後端 API)
   */
  async saveObservation(data: {
    stationId: string;
    stationName: string;
    temperature?: number | null;
    humidity?: number | null;
    windSpeed?: number | null;
    gustSpeed?: number | null;
    rain1hr?: number;
    rain24hr?: number;
  }): Promise<boolean> {
    try {
      const response = await fetch("/api/weather/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          observationTime: new Date().toISOString(),
        }),
      });
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error("Error saving observation:", error);
      return false;
    }
  },
};
