import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// 氣象觀測資料表
// ============================================
export const weatherObservations = mysqlTable("weather_observations", {
  id: int("id").autoincrement().primaryKey(),
  stationId: varchar("stationId", { length: 32 }).notNull(),
  stationName: varchar("stationName", { length: 64 }).notNull(),
  townName: varchar("townName", { length: 64 }),
  observationTime: timestamp("observationTime").notNull(),
  temperature: float("temperature"),           // 氣溫 (°C)
  humidity: float("humidity"),                 // 相對濕度 (%)
  windSpeed: float("windSpeed"),               // 風速 (m/s)
  windDirection: float("windDirection"),       // 風向 (度)
  gustSpeed: float("gustSpeed"),               // 陣風風速 (m/s)
  airPressure: float("airPressure"),           // 氣壓 (hPa)
  rain1hr: float("rain1hr"),                   // 1小時累積雨量 (mm)
  rain24hr: float("rain24hr"),                 // 24小時累積雨量 (mm)
  weather: varchar("weather", { length: 128 }),// 天氣現象
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  stationTimeIdx: index("weather_station_time_idx").on(table.stationId, table.observationTime),
  timeIdx: index("weather_time_idx").on(table.observationTime),
}));

export type WeatherObservation = typeof weatherObservations.$inferSelect;
export type InsertWeatherObservation = typeof weatherObservations.$inferInsert;

// ============================================
// 抽水站水位資料表
// ============================================
export const waterLevelObservations = mysqlTable("water_level_observations", {
  id: int("id").autoincrement().primaryKey(),
  stationId: varchar("stationId", { length: 32 }).notNull(),    // 抽水站 ID (如 "108" 中山站)
  stationName: varchar("stationName", { length: 64 }).notNull(),
  observationTime: timestamp("observationTime").notNull(),
  innerLevel: float("innerLevel"),            // 內水位 (m)
  outerLevel: float("outerLevel"),            // 外水位 (m)
  pumpCount: int("pumpCount"),                // 運轉泵浦數
  gateStatus: varchar("gateStatus", { length: 64 }),  // 閘門狀態
  warningStatus: varchar("warningStatus", { length: 64 }), // 預警狀態
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  stationTimeIdx: index("water_station_time_idx").on(table.stationId, table.observationTime),
  timeIdx: index("water_time_idx").on(table.observationTime),
}));

export type WaterLevelObservation = typeof waterLevelObservations.$inferSelect;
export type InsertWaterLevelObservation = typeof waterLevelObservations.$inferInsert;

// ============================================
// 極端氣候警報紀錄表
// ============================================
export const alertLogs = mysqlTable("alert_logs", {
  id: int("id").autoincrement().primaryKey(),
  alertType: varchar("alertType", { length: 32 }).notNull(),    // 警報類型: "RAIN", "WIND", "WATER_LEVEL"
  severity: varchar("severity", { length: 32 }).notNull(),       // 嚴重程度: "WARNING", "DANGER", "CRITICAL"
  stationId: varchar("stationId", { length: 32 }),
  stationName: varchar("stationName", { length: 64 }),
  triggerValue: float("triggerValue"),        // 觸發值
  threshold: float("threshold"),               // 閾值
  message: text("message").notNull(),
  isActive: boolean("isActive").default(true),
  triggeredAt: timestamp("triggeredAt").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  activeIdx: index("alert_active_idx").on(table.isActive),
  typeIdx: index("alert_type_idx").on(table.alertType),
}));

export type AlertLog = typeof alertLogs.$inferSelect;
export type InsertAlertLog = typeof alertLogs.$inferInsert;

// ============================================
// 系統設定表
// ============================================
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 128 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// ============================================
// 警報閾值設定
// ============================================
export const alertThresholds = mysqlTable("alert_thresholds", {
  id: int("id").autoincrement().primaryKey(),
  alertType: varchar("alertType", { length: 32 }).notNull(),    // "RAIN_1HR", "RAIN_24HR", "WIND_GUST", "WATER_LEVEL"
  warningThreshold: float("warningThreshold").notNull(),        // 警戒閾值
  dangerThreshold: float("dangerThreshold").notNull(),          // 危險閾值
  criticalThreshold: float("criticalThreshold"),                // 嚴重閾值
  unit: varchar("unit", { length: 16 }).notNull(),              // 單位 (mm, m/s, m)
  description: text("description"),
  isEnabled: boolean("isEnabled").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertThreshold = typeof alertThresholds.$inferSelect;
export type InsertAlertThreshold = typeof alertThresholds.$inferInsert;
