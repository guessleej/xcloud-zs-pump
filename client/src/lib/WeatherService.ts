const API_KEY = import.meta.env.CWA_API_KEY || "CWA-19B86670-A564-4C52-8503-689300A30262"; // Fallback for demo if env not set
const BASE_URL = "https://opendata.cwa.gov.tw/api";

export interface WeatherData {
  locationName: string;
  temperature: string;
  weatherPhenomenon: string;
  pop: string; // Probability of Precipitation
  windSpeed: string;
}

export interface ObservationData {
  stationName: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  obsTime: string;
}

export interface RainfallData {
  stationId: string;
  stationName: string;
  rain10min: number;
  rain1hr: number;
  rain24hr: number;
  obsTime: string;
}

export interface ForecastData {
  startTime: string;
  endTime: string;
  pop: string; // Probability of Precipitation
  temperature: string;
  weather: string;
}

export const WeatherService = {
  // 取得一般天氣預報 (今明 36 小時)
  async getGeneralForecast(locationName: string = "臺北市"): Promise<WeatherData | null> {
    try {
      const url = `${BASE_URL}/v1/rest/datastore/F-C0032-001?Authorization=${API_KEY}&format=JSON&locationName=${encodeURIComponent(locationName)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success === "true" && data.records.location.length > 0) {
        const location = data.records.location[0];
        const weatherElements = location.weatherElement;

        // Extract elements: Wx (天氣現象), PoP (降雨機率), MinT (最低溫), CI (舒適度), MaxT (最高溫)
        const wx = weatherElements.find((e: any) => e.elementName === "Wx")?.time[0].parameter.parameterName || "N/A";
        const pop = weatherElements.find((e: any) => e.elementName === "PoP")?.time[0].parameter.parameterName || "0";
        const minT = weatherElements.find((e: any) => e.elementName === "MinT")?.time[0].parameter.parameterName || "N/A";
        const maxT = weatherElements.find((e: any) => e.elementName === "MaxT")?.time[0].parameter.parameterName || "N/A";

        return {
          locationName: location.locationName,
          temperature: `${minT} - ${maxT}`,
          weatherPhenomenon: wx,
          pop: pop,
          windSpeed: "N/A" // 一般預報無風速，需從觀測資料取得
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch general forecast:", error);
      return null;
    }
  },

  // 取得鄉鎮天氣預報 (未來 3 天) - 針對中山區
  async getDistrictForecast(districtName: string = "中山區"): Promise<ForecastData[]> {
    try {
      // F-D0047-061: 臺北市未來 3 天天氣預報
      const url = `${BASE_URL}/v1/rest/datastore/F-D0047-061?Authorization=${API_KEY}&format=JSON&locationName=${encodeURIComponent(districtName)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success === "true" && data.records.locations[0].location.length > 0) {
        const location = data.records.locations[0].location[0];
        const weatherElements = location.weatherElement;
        
        // PoP12h (12小時降雨機率), T (平均溫度), Wx (天氣現象)
        const popElement = weatherElements.find((e: any) => e.elementName === "PoP12h");
        const tElement = weatherElements.find((e: any) => e.elementName === "T");
        const wxElement = weatherElements.find((e: any) => e.elementName === "Wx");

        const forecasts: ForecastData[] = [];
        
        // 取前 6 筆資料 (約 3 天)
        for (let i = 0; i < 6; i++) {
          if (popElement?.time[i]) {
            forecasts.push({
              startTime: popElement.time[i].startTime,
              endTime: popElement.time[i].endTime,
              pop: popElement.time[i].elementValue[0].value,
              temperature: tElement?.time[i].elementValue[0].value || "N/A",
              weather: wxElement?.time[i].elementValue[0].value || "N/A"
            });
          }
        }
        return forecasts;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch district forecast:", error);
      return [];
    }
  },

  // 取得即時氣象觀測資料 (溫度、濕度、風速)
  async getRealtimeObservation(stationName: string = "臺北"): Promise<ObservationData | null> {
    try {
      // O-A0003-001: 氣象觀測站-10分鐘綜觀氣象資料 (局屬測站，資料較完整)
      // 備用: O-A0001-001 (自動氣象站)
      const url = `${BASE_URL}/v1/rest/datastore/O-A0003-001?Authorization=${API_KEY}&format=JSON&StationName=${encodeURIComponent(stationName)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success === "true" && data.records.Station.length > 0) {
        const station = data.records.Station[0];
        const weatherElement = station.WeatherElement;

        return {
          stationName: station.StationName,
          temperature: parseFloat(weatherElement.AirTemperature) || 0,
          humidity: parseFloat(weatherElement.RelativeHumidity) || 0,
          windSpeed: parseFloat(weatherElement.WindSpeed) || 0,
          obsTime: station.ObsTime.DateTime
        };
      }
      
      // 如果找不到局屬測站，嘗試自動測站 (O-A0001-001)
      const autoUrl = `${BASE_URL}/v1/rest/datastore/O-A0001-001?Authorization=${API_KEY}&format=JSON&StationName=${encodeURIComponent(stationName)}`;
      const autoResponse = await fetch(autoUrl);
      const autoData = await autoResponse.json();

      if (autoData.success === "true" && autoData.records.Station.length > 0) {
        const station = autoData.records.Station[0];
        const weatherElement = station.WeatherElement;

        return {
          stationName: station.StationName,
          temperature: parseFloat(weatherElement.AirTemperature) || 0,
          humidity: parseFloat(weatherElement.RelativeHumidity) || 0,
          windSpeed: parseFloat(weatherElement.WindSpeed) || 0,
          obsTime: station.ObsTime.DateTime
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch realtime observation:", error);
      return null;
    }
  },

  // 取得即時雨量觀測資料 (針對中山區最近測站)
  async getRealtimeRainfall(stationName: string = "中山"): Promise<RainfallData | null> {
    try {
      // O-A0002-001: 雨量觀測資料
      const url = `${BASE_URL}/v1/rest/datastore/O-A0002-001?Authorization=${API_KEY}&format=JSON`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success === "true") {
        // 尋找包含 "中山" 的測站，優先選取台北市的
        const station = data.records.station.find((s: any) => 
          s.stationName.includes(stationName) && s.geoInfo.CountyName === "臺北市"
        );

        if (station) {
          return {
            stationId: station.stationId,
            stationName: station.stationName,
            rain10min: parseFloat(station.weatherElement.Now.Precipitation) || 0, // 修正欄位路徑
            rain1hr: parseFloat(station.weatherElement.RainfallElement.Past1hr.Precipitation) || 0, // 修正欄位路徑
            rain24hr: parseFloat(station.weatherElement.RainfallElement.Past24hr.Precipitation) || 0, // 修正欄位路徑
            obsTime: station.obsTime.DateTime
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch realtime rainfall:", error);
      return null;
    }
  }
};
