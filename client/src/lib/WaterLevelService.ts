const BASE_URL = "https://heopublic.gov.taipei/taipei-heo-api/openapi/pumb/latest";

export interface PumpStationData {
  stn_id: string;
  stn_name: string;
  district: string;
  address: string;
  inner_level: number; // 內水位
  outer_level: number; // 外水位
  pump_status: string; // 泵浦狀態 (運轉中/待機)
  pump_count: number; // 運轉泵浦數
  warning_status: string; // 預警狀態
  update_time: string;
}

export const WaterLevelService = {
  // 取得中山抽水站 (ID: 108) 即時資料
  async getZhongshanStationData(): Promise<PumpStationData | null> {
    try {
      const response = await fetch(BASE_URL);
      const data = await response.json();

      if (Array.isArray(data)) {
        // 尋找中山抽水站 (ID: 108)
        const station = data.find((s: any) => s.stn_id === "108" || s.stn_name.includes("中山"));

        if (station) {
          // 解析泵浦運轉狀態 (假設 API 回傳 pump_status 欄位，若無則需根據 pump_count 判斷)
          // 註: 實際 API 欄位需根據文件調整，此處先以通用欄位模擬
          const pumpCount = parseInt(station.pump_count || "0", 10);
          
          return {
            stn_id: station.stn_id,
            stn_name: station.stn_name,
            district: station.district,
            address: station.address,
            inner_level: parseFloat(station.inner_level) || 0,
            outer_level: parseFloat(station.outer_level) || 0,
            pump_status: pumpCount > 0 ? "運轉中" : "待機",
            pump_count: pumpCount,
            warning_status: this.calculateWarningStatus(parseFloat(station.inner_level)),
            update_time: station.time || new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch water level data:", error);
      return null;
    }
  },

  // 根據內水位計算預警狀態 (參考 Q&A 文件: 起抽水位 2.0m, 警戒水位 2.6m)
  calculateWarningStatus(innerLevel: number): string {
    if (innerLevel >= 2.6) return "危險 (Danger)";
    if (innerLevel >= 2.0) return "警戒 (Warning)";
    return "正常 (Normal)";
  }
};
