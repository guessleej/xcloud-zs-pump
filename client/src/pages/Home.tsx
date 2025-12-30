import { AlertBanner } from "@/components/AlertBanner";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiStationData, MultiStationWeatherService, ObservationWithGust, WeatherAlert } from "@/lib/MultiStationWeatherService";
import { PumpStationData, WaterLevelService } from "@/lib/WaterLevelService";
import { ForecastData, WeatherData, WeatherService } from "@/lib/WeatherService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertTriangle, ArrowDown, ArrowUp, CloudRain, Droplets, MapPin, Thermometer, Waves, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Mock Data for Charts (will be replaced with real data from DB)
const waterLevelData = [
  { time: "00:00", inner: 0.8, outer: 1.2, predict: 0.85 },
  { time: "04:00", inner: 0.7, outer: 1.1, predict: 0.75 },
  { time: "08:00", inner: 0.9, outer: 1.5, predict: 0.95 },
  { time: "12:00", inner: 1.2, outer: 2.1, predict: 1.3 },
  { time: "16:00", inner: 1.1, outer: 1.8, predict: 1.15 },
  { time: "20:00", inner: 0.8, outer: 1.4, predict: 0.85 },
  { time: "24:00", inner: 0.7, outer: 1.2, predict: 0.75 },
];

export default function Home() {
  // Weather States
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [observation, setObservation] = useState<ObservationWithGust | null>(null);
  const [multiStationData, setMultiStationData] = useState<MultiStationData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [stationData, setStationData] = useState<PumpStationData | null>(null);
  
  // Alert States
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  
  // Time State for live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Weather Data (General Forecast)
        const wData = await WeatherService.getGeneralForecast();
        if (wData) setWeather(wData);

        // Multi-station rainfall data (臺北、社子、內湖)
        const msData = await MultiStationWeatherService.getMultiStationRainfall();
        if (msData) setMultiStationData(msData);

        // Observation with gust data
        const oData = await MultiStationWeatherService.getObservationWithGust("臺北");
        if (oData) setObservation(oData);

        // District forecast
        const fData = await WeatherService.getDistrictForecast();
        if (fData) setForecast(fData);

        // Water Level Data
        const sData = await WaterLevelService.getZhongshanStationData();
        if (sData) setStationData(sData);

        // Collect all alerts
        const allAlerts: WeatherAlert[] = [];
        if (msData?.alerts) allAlerts.push(...msData.alerts);
        if (oData?.alerts) allAlerts.push(...oData.alerts);
        setAlerts(allAlerts);

        // Save observation to database (async, non-blocking)
        if (oData && msData) {
          MultiStationWeatherService.saveObservation({
            stationId: oData.stationId,
            stationName: oData.stationName,
            temperature: oData.temperature,
            humidity: oData.humidity,
            windSpeed: oData.windSpeed,
            gustSpeed: oData.gustSpeed,
            rain1hr: msData.average.rain1hr,
            rain24hr: msData.average.rain24hr,
          }).catch(console.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Update every 5 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Alert Banner */}
        <AlertBanner alerts={alerts} />

        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
              戰情總覽 <span className="text-primary">Dashboard</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              中山抽水站即時監控與預警系統
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground bg-card/50 px-4 py-2 rounded-full border border-border/50 backdrop-blur-md">
            <span>{format(currentTime, "yyyy-MM-dd")}</span>
            <span className="text-primary">|</span>
            <span>{format(currentTime, "HH:mm:ss")} GMT+8</span>
          </div>
        </div>

        {/* Key Metrics Grid (HUD Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="內水位 (Inner)"
            value={`${stationData?.inner_level.toFixed(2) || "0.00"} m`}
            trend={stationData ? "即時" : "--"}
            trendUp={true}
            icon={Waves}
            status={stationData?.warning_status.includes("正常") ? "normal" : "warning"}
          />
          <MetricCard
            title="外水位 (Outer)"
            value={`${stationData?.outer_level.toFixed(2) || "0.00"} m`}
            trend={stationData ? "即時" : "--"}
            trendUp={false}
            icon={Waves}
            status="normal"
          />
          <MetricCard
            title="運轉泵浦"
            value={`${stationData?.pump_count || "0"} / 7`}
            subValue="中山本站"
            icon={Droplets}
            status={stationData?.pump_count && stationData.pump_count > 0 ? "active" : "normal"}
          />
          <MetricCard
            title="預警狀態"
            value={stationData?.warning_status.split(" ")[0] || "正常"}
            subValue={stationData ? `更新: ${format(new Date(stationData.update_time), "HH:mm")}` : "--"}
            icon={AlertTriangle}
            status={stationData?.warning_status.includes("危險") ? "danger" : stationData?.warning_status.includes("警戒") ? "warning" : "safe"}
          />
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Water Level Chart */}
          <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon />
                水位趨勢監控 (24hr)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waterLevelData}>
                  <defs>
                    <linearGradient id="colorInner" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOuter" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-secondary-foreground)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-secondary-foreground)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.1} />
                  <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px" }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Area type="monotone" dataKey="inner" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorInner)" name="內水位" />
                  <Area type="monotone" dataKey="outer" stroke="var(--color-secondary-foreground)" strokeWidth={2} fillOpacity={1} fill="url(#colorOuter)" name="外水位" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Weather Info with Multi-Station Data */}
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wind className="w-4 h-4 text-primary" /> 氣象資訊 (中山區)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Weather */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-display font-bold text-foreground">
                      {observation?.temperature?.toFixed(1) || "--"}°C
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2">
                      {observation?.weather || weather?.weatherPhenomenon || "載入中..."}
                      {observation && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse">
                          實測
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">
                      降雨機率 <span className="text-blue-400 font-bold">{weather?.pop || "--"}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      累積雨量 <span className="text-foreground">{multiStationData?.average.rain24hr || 0} mm</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Station Rainfall Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <CloudRain className="w-3 h-3" /> 1hr 平均雨量
                    </div>
                    <div className={cn(
                      "text-xl font-bold",
                      (multiStationData?.average.rain1hr || 0) >= 40 ? "text-red-500" :
                      (multiStationData?.average.rain1hr || 0) >= 15 ? "text-orange-400" : "text-blue-400"
                    )}>
                      {multiStationData?.average.rain1hr || 0} <span className="text-xs text-muted-foreground">mm</span>
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Wind className="w-3 h-3" /> 陣風
                    </div>
                    <div className={cn(
                      "text-xl font-bold",
                      (observation?.gustSpeed || 0) >= 15 ? "text-red-500" :
                      (observation?.gustSpeed || 0) >= 10 ? "text-orange-400" : "text-foreground"
                    )}>
                      {observation?.gustSpeed?.toFixed(1) || "--"} <span className="text-xs text-muted-foreground">m/s</span>
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" /> 氣溫範圍
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {weather?.temperature || "--"} <span className="text-xs text-muted-foreground">°C</span>
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> 相對濕度
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {observation?.humidity || "--"} <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Station Details */}
                {multiStationData && multiStationData.stations.length > 0 && (
                  <div className="pt-3 border-t border-border/30">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> 周邊測站即時雨量
                    </h4>
                    <div className="space-y-1">
                      {multiStationData.stations.map((station) => (
                        <div key={station.stationId} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{station.stationName}</span>
                          <span className="font-mono">
                            <span className={cn(
                              station.rain1hr >= 40 ? "text-red-500" :
                              station.rain1hr >= 15 ? "text-orange-400" : "text-blue-400"
                            )}>
                              {station.rain1hr}
                            </span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-foreground">{station.rain24hr}</span>
                            <span className="text-muted-foreground ml-1">mm</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Prediction Widget */}
            <Card className="bg-primary/5 border-primary/20 backdrop-blur-md relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  AI 預警分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <span className="text-sm text-muted-foreground">預測 1hr 後水位</span>
                  <span className="font-mono text-lg font-bold text-foreground">
                    {stationData ? (stationData.inner_level + 0.07).toFixed(2) : "0.92"} m
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <span className="text-sm text-muted-foreground">建議操作</span>
                  <span className="text-sm font-medium text-primary">
                    {alerts.length > 0 ? "啟動預警程序" : "維持現狀"}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-1">風險指數</div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        alerts.some(a => a.severity === "CRITICAL") ? "bg-gradient-to-r from-red-500 to-red-700 w-[90%]" :
                        alerts.some(a => a.severity === "DANGER") ? "bg-gradient-to-r from-orange-500 to-red-500 w-[65%]" :
                        alerts.some(a => a.severity === "WARNING") ? "bg-gradient-to-r from-yellow-500 to-orange-500 w-[40%]" :
                        "bg-gradient-to-r from-green-500 to-yellow-500 w-[25%]"
                      )}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rainfall Forecast Chart */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-blue-400" />
              未來 36 小時降雨機率預測
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast.length > 0 ? forecast : [
                { startTime: new Date().toISOString(), pop: 30 },
                { startTime: new Date(Date.now() + 21600000).toISOString(), pop: 40 },
                { startTime: new Date(Date.now() + 43200000).toISOString(), pop: 20 },
                { startTime: new Date(Date.now() + 64800000).toISOString(), pop: 10 },
                { startTime: new Date(Date.now() + 86400000).toISOString(), pop: 60 },
                { startTime: new Date(Date.now() + 108000000).toISOString(), pop: 80 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="startTime" 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(time) => format(new Date(time), "MM/dd HH:mm")}
                />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  cursor={{fill: 'var(--color-primary)', opacity: 0.1}}
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px" }}
                  itemStyle={{ color: "var(--color-foreground)" }}
                  labelFormatter={(label) => format(new Date(label), "MM/dd HH:mm")}
                />
                <Bar dataKey="pop" name="降雨機率" fill="var(--color-blue-500)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Helper Components
function MetricCard({ title, value, subValue, trend, trendUp, icon: Icon, status }: any) {
  const statusColors: Record<string, string> = {
    normal: "text-foreground",
    active: "text-primary",
    safe: "text-green-400",
    warning: "text-orange-400",
    danger: "text-red-500",
  };

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-colors duration-300 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-background/50 border border-border/50 group-hover:border-primary/50 transition-colors">
            <Icon className={cn("w-5 h-5", statusColors[status] || "text-muted-foreground")} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full",
              trend === "即時" ? "bg-green-500/10 text-green-400" :
              trendUp ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
            )}>
              {trend !== "即時" && trend !== "--" && (trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-display font-bold tracking-tight", statusColors[status] || "text-foreground")}>
            {value}
          </p>
          {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityIcon() {
  return (
    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
