import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowDown, ArrowUp, Droplets, Waves, Wind } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Mock Data for Charts
const waterLevelData = [
  { time: "00:00", inner: 0.5, outer: 1.2 },
  { time: "04:00", inner: 0.6, outer: 1.1 },
  { time: "08:00", inner: 0.8, outer: 1.5 },
  { time: "12:00", inner: 1.1, outer: 2.1 },
  { time: "16:00", inner: 0.9, outer: 1.8 },
  { time: "20:00", inner: 0.7, outer: 1.4 },
  { time: "24:00", inner: 0.6, outer: 1.3 },
];

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
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
            <span>2025-12-30</span>
            <span className="text-primary">|</span>
            <span>14:30:00 GMT+8</span>
          </div>
        </div>

        {/* Key Metrics Grid (HUD Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="內水位 (Inner)"
            value="0.85 m"
            trend="+0.12"
            trendUp={true}
            icon={Waves}
            status="normal"
          />
          <MetricCard
            title="外水位 (Outer)"
            value="1.42 m"
            trend="-0.05"
            trendUp={false}
            icon={Waves}
            status="normal"
          />
          <MetricCard
            title="運轉泵浦"
            value="2 / 7"
            subValue="中山本站"
            icon={Droplets}
            status="active"
          />
          <MetricCard
            title="預警狀態"
            value="正常"
            subValue="未來 2hr 無風險"
            icon={AlertTriangle}
            status="safe"
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
                  <Area
                    type="monotone"
                    dataKey="inner"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInner)"
                    name="內水位"
                  />
                  <Area
                    type="monotone"
                    dataKey="outer"
                    stroke="var(--color-secondary-foreground)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOuter)"
                    name="外水位"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <Card className="bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                  <Wind className="w-4 h-4" /> 氣象資訊
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-display font-bold text-foreground">24°C</div>
                    <div className="text-sm text-muted-foreground mt-1">多雲時陰</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs text-muted-foreground">降雨機率 <span className="text-primary font-bold">30%</span></div>
                    <div className="text-xs text-muted-foreground">風速 <span className="text-foreground font-mono">3.2 m/s</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Prediction Widget */}
            <Card className="bg-primary/5 border-primary/20 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <img src="/images/pump-icon.png" alt="AI" className="w-24 h-24" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  AI 預警分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <span className="text-sm text-muted-foreground">預測 1hr 後水位</span>
                  <span className="font-mono text-lg font-bold text-foreground">0.92 m</span>
                </div>
                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <span className="text-sm text-muted-foreground">建議操作</span>
                  <span className="text-sm font-medium text-primary">維持現狀</span>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-1">風險指數</div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 w-[25%]" />
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
      </div>
    </DashboardLayout>
  );
}

// Helper Components
function MetricCard({ title, value, subValue, trend, trendUp, icon: Icon, status }: any) {
  const statusColors = {
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
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-mono ${trendUp ? "text-red-400" : "text-green-400"}`}>
              {trendUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
          <div className={`text-2xl font-display font-bold ${statusColors[status as keyof typeof statusColors] || "text-foreground"}`}>
            {value}
          </div>
          {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityIcon() {
  return (
    <svg
      className="w-4 h-4 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
