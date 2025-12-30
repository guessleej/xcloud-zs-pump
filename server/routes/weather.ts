import { Router } from "express";
import { getDb } from "../db";
import { weatherObservations, alertLogs, alertThresholds } from "../../drizzle/schema";
import { desc, eq, gte, and } from "drizzle-orm";

const router = Router();

// ============================================
// 多測站氣象資料 API
// ============================================

// 定義中山區周邊測站
const NEARBY_STATIONS = [
  { id: "466920", name: "臺北", town: "中正區" },
  { id: "C0A980", name: "社子", town: "士林區" },
  { id: "C0A9F0", name: "內湖", town: "內湖區" },
];

// 警報閾值預設值
const DEFAULT_THRESHOLDS = {
  RAIN_1HR: { warning: 15, danger: 40, critical: 80, unit: "mm" },
  RAIN_24HR: { warning: 80, danger: 200, critical: 350, unit: "mm" },
  WIND_GUST: { warning: 10, danger: 15, critical: 20, unit: "m/s" },
  WATER_LEVEL: { warning: 2.0, danger: 2.4, critical: 2.6, unit: "m" },
};

// GET /api/weather/stations - 取得可用測站列表
router.get("/stations", (_req, res) => {
  res.json({
    success: true,
    data: NEARBY_STATIONS,
  });
});

// GET /api/weather/realtime - 取得多測站即時資料 (從 CWA API)
router.get("/realtime", async (_req, res) => {
  try {
    const apiKey = process.env.VITE_CWA_API_KEY || process.env.CWA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "CWA API Key not configured" });
    }

    const stationNames = NEARBY_STATIONS.map(s => s.name).join(",");
    
    // 抓取雨量資料 (O-A0002-001)
    const rainfallUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization=${apiKey}&StationName=${encodeURIComponent(stationNames)}&WeatherElement=Now,Past1hr,Past24hr`;
    
    const rainfallResponse = await fetch(rainfallUrl);
    const rainfallData = await rainfallResponse.json();

    if (rainfallData.success !== "true") {
      return res.status(500).json({ success: false, error: "Failed to fetch rainfall data" });
    }

    const stations = rainfallData.records?.Station || [];
    
    // 計算平均值
    let totalRain1hr = 0;
    let totalRain24hr = 0;
    let validCount = 0;
    const stationDetails: any[] = [];

    for (const station of stations) {
      const rain1hr = parseFloat(station.RainfallElement?.Past1hr?.Precipitation) || 0;
      const rain24hr = parseFloat(station.RainfallElement?.Past24hr?.Precipitation) || 0;
      
      if (rain1hr >= 0 && rain24hr >= 0) {
        totalRain1hr += rain1hr;
        totalRain24hr += rain24hr;
        validCount++;
        
        stationDetails.push({
          stationId: station.StationId,
          stationName: station.StationName,
          townName: station.GeoInfo?.TownName,
          rain1hr,
          rain24hr,
          observationTime: station.ObsTime?.DateTime,
        });
      }
    }

    const avgRain1hr = validCount > 0 ? totalRain1hr / validCount : 0;
    const avgRain24hr = validCount > 0 ? totalRain24hr / validCount : 0;

    // 檢查是否需要觸發警報
    const alerts = [];
    if (avgRain1hr >= DEFAULT_THRESHOLDS.RAIN_1HR.critical) {
      alerts.push({ type: "RAIN_1HR", severity: "CRITICAL", value: avgRain1hr, threshold: DEFAULT_THRESHOLDS.RAIN_1HR.critical });
    } else if (avgRain1hr >= DEFAULT_THRESHOLDS.RAIN_1HR.danger) {
      alerts.push({ type: "RAIN_1HR", severity: "DANGER", value: avgRain1hr, threshold: DEFAULT_THRESHOLDS.RAIN_1HR.danger });
    } else if (avgRain1hr >= DEFAULT_THRESHOLDS.RAIN_1HR.warning) {
      alerts.push({ type: "RAIN_1HR", severity: "WARNING", value: avgRain1hr, threshold: DEFAULT_THRESHOLDS.RAIN_1HR.warning });
    }

    res.json({
      success: true,
      data: {
        average: {
          rain1hr: Math.round(avgRain1hr * 10) / 10,
          rain24hr: Math.round(avgRain24hr * 10) / 10,
        },
        stations: stationDetails,
        alerts,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching realtime weather:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/weather/observation - 取得氣象觀測站即時資料 (含陣風)
router.get("/observation", async (_req, res) => {
  try {
    const apiKey = process.env.VITE_CWA_API_KEY || process.env.CWA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "CWA API Key not configured" });
    }

    // 抓取氣象觀測資料 (O-A0003-001)
    const obsUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${apiKey}&StationName=${encodeURIComponent("臺北")}&WeatherElement=AirTemperature,RelativeHumidity,WindSpeed,WindDirection,GustInfo,AirPressure,Weather`;
    
    const obsResponse = await fetch(obsUrl);
    const obsData = await obsResponse.json();

    if (obsData.success !== "true") {
      return res.status(500).json({ success: false, error: "Failed to fetch observation data" });
    }

    const station = obsData.records?.Station?.[0];
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    const weatherElement = station.WeatherElement || {};
    const gustInfo = weatherElement.GustInfo || {};
    const gustSpeed = parseFloat(gustInfo.PeakGustSpeed) || 0;

    // 檢查陣風警報
    const alerts = [];
    if (gustSpeed >= DEFAULT_THRESHOLDS.WIND_GUST.critical) {
      alerts.push({ type: "WIND_GUST", severity: "CRITICAL", value: gustSpeed, threshold: DEFAULT_THRESHOLDS.WIND_GUST.critical });
    } else if (gustSpeed >= DEFAULT_THRESHOLDS.WIND_GUST.danger) {
      alerts.push({ type: "WIND_GUST", severity: "DANGER", value: gustSpeed, threshold: DEFAULT_THRESHOLDS.WIND_GUST.danger });
    } else if (gustSpeed >= DEFAULT_THRESHOLDS.WIND_GUST.warning) {
      alerts.push({ type: "WIND_GUST", severity: "WARNING", value: gustSpeed, threshold: DEFAULT_THRESHOLDS.WIND_GUST.warning });
    }

    res.json({
      success: true,
      data: {
        stationId: station.StationId,
        stationName: station.StationName,
        observationTime: station.ObsTime?.DateTime,
        temperature: parseFloat(weatherElement.AirTemperature) || null,
        humidity: parseFloat(weatherElement.RelativeHumidity) || null,
        windSpeed: parseFloat(weatherElement.WindSpeed) || null,
        windDirection: parseFloat(weatherElement.WindDirection) || null,
        gustSpeed,
        gustOccurredAt: gustInfo.Occurred_at?.DateTime,
        airPressure: parseFloat(weatherElement.AirPressure) || null,
        weather: weatherElement.Weather,
        alerts,
      },
    });
  } catch (error) {
    console.error("Error fetching observation:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/weather/save - 儲存觀測資料到資料庫
router.post("/save", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ success: false, error: "Database not available" });
    }

    const { stationId, stationName, townName, observationTime, temperature, humidity, windSpeed, windDirection, gustSpeed, airPressure, rain1hr, rain24hr, weather } = req.body;

    await db.insert(weatherObservations).values({
      stationId,
      stationName,
      townName,
      observationTime: new Date(observationTime),
      temperature,
      humidity,
      windSpeed,
      windDirection,
      gustSpeed,
      airPressure,
      rain1hr,
      rain24hr,
      weather,
    });

    res.json({ success: true, message: "Observation saved" });
  } catch (error) {
    console.error("Error saving observation:", error);
    res.status(500).json({ success: false, error: "Failed to save observation" });
  }
});

// GET /api/weather/history - 取得歷史資料
router.get("/history", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ success: false, error: "Database not available" });
    }

    const { stationId, hours = 24 } = req.query;
    const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

    let results;
    if (stationId) {
      results = await db.select().from(weatherObservations).where(and(eq(weatherObservations.stationId, String(stationId)), gte(weatherObservations.observationTime, since))).orderBy(desc(weatherObservations.observationTime)).limit(500);
    } else {
      results = await db.select().from(weatherObservations).where(gte(weatherObservations.observationTime, since)).orderBy(desc(weatherObservations.observationTime)).limit(500);
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ success: false, error: "Failed to fetch history" });
  }
});

// GET /api/weather/thresholds - 取得警報閾值設定
router.get("/thresholds", async (_req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({
        success: true,
        data: DEFAULT_THRESHOLDS,
        isDefault: true,
      });
    }

    const thresholds = await db.select().from(alertThresholds);
    
    // 如果資料庫沒有設定，返回預設值
    if (thresholds.length === 0) {
      return res.json({
        success: true,
        data: DEFAULT_THRESHOLDS,
        isDefault: true,
      });
    }

    const result: Record<string, any> = {};
    for (const t of thresholds) {
      result[t.alertType] = {
        warning: t.warningThreshold,
        danger: t.dangerThreshold,
        critical: t.criticalThreshold,
        unit: t.unit,
        isEnabled: t.isEnabled,
      };
    }

    res.json({
      success: true,
      data: result,
      isDefault: false,
    });
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    res.status(500).json({ success: false, error: "Failed to fetch thresholds" });
  }
});

// POST /api/weather/thresholds - 更新警報閾值
router.post("/thresholds", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ success: false, error: "Database not available" });
    }

    const { alertType, warningThreshold, dangerThreshold, criticalThreshold, unit, isEnabled } = req.body;

    // 使用 upsert 邏輯
    const existing = await db.select().from(alertThresholds).where(eq(alertThresholds.alertType, alertType));

    if (existing.length > 0) {
      await db.update(alertThresholds).set({
        warningThreshold,
        dangerThreshold,
        criticalThreshold,
        unit,
        isEnabled,
      }).where(eq(alertThresholds.alertType, alertType));
    } else {
      await db.insert(alertThresholds).values({
        alertType,
        warningThreshold,
        dangerThreshold,
        criticalThreshold,
        unit,
        isEnabled,
      });
    }

    res.json({ success: true, message: "Threshold updated" });
  } catch (error) {
    console.error("Error updating threshold:", error);
    res.status(500).json({ success: false, error: "Failed to update threshold" });
  }
});

// POST /api/weather/alert - 記錄警報
router.post("/alert", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ success: false, error: "Database not available" });
    }

    const { alertType, severity, stationId, stationName, triggerValue, threshold, message } = req.body;

    await db.insert(alertLogs).values({
      alertType,
      severity,
      stationId,
      stationName,
      triggerValue,
      threshold,
      message,
      triggeredAt: new Date(),
    });

    res.json({ success: true, message: "Alert logged" });
  } catch (error) {
    console.error("Error logging alert:", error);
    res.status(500).json({ success: false, error: "Failed to log alert" });
  }
});

// GET /api/weather/alerts - 取得警報紀錄
router.get("/alerts", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({ success: true, data: [] });
    }

    const { active, limit = 50 } = req.query;

    let results;
    if (active === "true") {
      results = await db.select().from(alertLogs).where(eq(alertLogs.isActive, true)).orderBy(desc(alertLogs.triggeredAt)).limit(Number(limit));
    } else {
      results = await db.select().from(alertLogs).orderBy(desc(alertLogs.triggeredAt)).limit(Number(limit));
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch alerts" });
  }
});

export default router;
