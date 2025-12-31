# xCloud-ZS-PUMP WAR ROOM

## 中山抽水站智慧戰情室

即時監控與預警系統，整合台北市水利處 97 座抽水站即時水位資料、氣象資訊、AI 預測分析。

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC)

## 功能特色

### 戰情總覽 (Dashboard)
- 即時內/外水位監控
- 運轉泵浦狀態顯示
- 24 小時水位趨勢圖
- 氣象資訊整合（溫度、降雨機率、風速、濕度）
- AI 預警分析與風險評估

### 水文資訊 (Hydrology Map)
- GIS 地圖顯示 97 座抽水站位置
- 衛星影像切換
- CCTV 即時監控畫面
- 抽水站即時水位列表

### 歷史分析 (Analysis)
- 重大水文事件回放（納莉、莫拉克、蘇迪勒、凱米颱風）
- 歷史資料匯入（CSV/Excel）
- 水位歷線圖

### 預警中心 (Alerts & AI)
- 地端 AI 模型狀態監控 (Llama-3-8B)
- 未來 6 小時水位預測
- 預警規則設定
- 警報通知對象管理

### 系統設定 (Settings)
- 介面與顯示設定
- API 與資料庫連線設定
- 通知管理（LINE Notify、Email）
- 帳號安全設定

## 技術架構

| 類別 | 技術 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| UI 元件 | shadcn/ui + Tailwind CSS 4 |
| 地圖服務 | Google Maps API |
| 圖表 | Recharts |
| 資料來源 | 台北市水利處 Open API |
| 氣象資料 | 中央氣象署 CWA API |

## 快速開始

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置生產版本
pnpm build
```

## 環境變數

```env
VITE_CWA_API_KEY=your_cwa_api_key
```

## 資料來源

- [台北市水利處抽水站即時資訊](https://heopublic.gov.taipei/taipei-heo-api/openapi/pumb/latest)
- [中央氣象署開放資料平台](https://opendata.cwa.gov.tw/)

## 授權

MIT License

## 聯絡資訊

如有任何問題或建議，歡迎提出 Issue 或 Pull Request。
