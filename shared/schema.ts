import { pgTable, text, integer, real, timestamp, boolean, serial, index } from "drizzle-orm/pg-core";

// ============================================
// 使用者相關表格 (由模板提供)
// ============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: text("open_id").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 氣象觀測資料表
// ============================================
export const weatherObservations = pgTable("weather_observations", {
  id: serial("id").primaryKey(),
  stationId: text("station_id").notNull(),
  stationName: text("station_name").notNull(),
  townName: text("town_name"),
  observationTime: timestamp("observation_time").notNull(),
  temperature: real("temperature"),           // 氣溫 (°C)
  humidity: real("humidity"),                 // 相對濕度 (%)
  windSpeed: real("wind_speed"),              // 風速 (m/s)
  windDirection: real("wind_direction"),      // 風向 (度)
  gustSpeed: real("gust_speed"),              // 陣風風速 (m/s)
  airPressure: real("air_pressure"),          // 氣壓 (hPa)
  rain1hr: real("rain_1hr"),                  // 1小時累積雨量 (mm)
  rain24hr: real("rain_24hr"),                // 24小時累積雨量 (mm)
  weather: text("weather"),                   // 天氣現象
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  stationTimeIdx: index("weather_station_time_idx").on(table.stationId, table.observationTime),
  timeIdx: index("weather_time_idx").on(table.observationTime),
}));

// ============================================
// 抽水站水位資料表
// ============================================
export const waterLevelObservations = pgTable("water_level_observations", {
  id: serial("id").primaryKey(),
  stationId: text("station_id").notNull(),    // 抽水站 ID (如 "108" 中山站)
  stationName: text("station_name").notNull(),
  observationTime: timestamp("observation_time").notNull(),
  innerLevel: real("inner_level"),            // 內水位 (m)
  outerLevel: real("outer_level"),            // 外水位 (m)
  pumpCount: integer("pump_count"),           // 運轉泵浦數
  gateStatus: text("gate_status"),            // 閘門狀態
  warningStatus: text("warning_status"),      // 預警狀態
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  stationTimeIdx: index("water_station_time_idx").on(table.stationId, table.observationTime),
  timeIdx: index("water_time_idx").on(table.observationTime),
}));

// ============================================
// 極端氣候警報紀錄表
// ============================================
export const alertLogs = pgTable("alert_logs", {
  id: serial("id").primaryKey(),
  alertType: text("alert_type").notNull(),    // 警報類型: "RAIN", "WIND", "WATER_LEVEL"
  severity: text("severity").notNull(),       // 嚴重程度: "WARNING", "DANGER", "CRITICAL"
  stationId: text("station_id"),
  stationName: text("station_name"),
  triggerValue: real("trigger_value"),        // 觸發值
  threshold: real("threshold"),               // 閾值
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true),
  triggeredAt: timestamp("triggered_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  activeIdx: index("alert_active_idx").on(table.isActive),
  typeIdx: index("alert_type_idx").on(table.alertType),
}));

// ============================================
// 系統設定表
// ============================================
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// 類型定義
// ============================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type WeatherObservation = typeof weatherObservations.$inferSelect;
export type NewWeatherObservation = typeof weatherObservations.$inferInsert;

export type WaterLevelObservation = typeof waterLevelObservations.$inferSelect;
export type NewWaterLevelObservation = typeof waterLevelObservations.$inferInsert;

export type AlertLog = typeof alertLogs.$inferSelect;
export type NewAlertLog = typeof alertLogs.$inferInsert;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
