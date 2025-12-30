import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, Bot, BrainCircuit, CheckCircle2, Cpu, RefreshCw, Settings2, ShieldAlert, Zap } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Mock Prediction Data
const predictionData = [
  { time: "Now", actual: 1.2, predicted: 1.2, confidence: 100 },
  { time: "+1h", actual: null, predicted: 1.35, confidence: 95 },
  { time: "+2h", actual: null, predicted: 1.52, confidence: 88 },
  { time: "+3h", actual: null, predicted: 1.68, confidence: 82 },
  { time: "+4h", actual: null, predicted: 1.85, confidence: 75 },
  { time: "+5h", actual: null, predicted: 1.92, confidence: 70 },
  { time: "+6h", actual: null, predicted: 1.88, confidence: 65 },
];

export default function Alerts() {
  const [threshold, setThreshold] = useState([2.5]);
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
              預警中心 <span className="text-primary">Alerts & AI</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              地端 AI 模型監控與即時預警參數設定
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              System Normal
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              <Bot className="w-3 h-3 mr-1" />
              AI Model Active
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Model Status Panel */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BrainCircuit className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                地端 AI 模型狀態 (Local LLM)
              </CardTitle>
              <CardDescription>
                Model: Llama-3-8B-Instruct (Quantized)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inference Latency</span>
                  <span className="font-mono text-primary">45ms</span>
                </div>
                <Progress value={15} className="h-1 bg-primary/10" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GPU Memory Usage</span>
                  <span className="font-mono text-primary">4.2GB / 8GB</span>
                </div>
                <Progress value={52} className="h-1 bg-primary/10" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prediction Confidence</span>
                  <span className="font-mono text-green-400">92.5%</span>
                </div>
                <Progress value={92} className="h-1 bg-green-500/20" />
              </div>

              <div className="pt-4 border-t border-border/30 flex gap-2">
                <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/10 hover:text-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重啟模型
                </Button>
                <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/10 hover:text-primary">
                  <Settings2 className="w-4 h-4 mr-2" />
                  參數微調
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Chart */}
          <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                未來 6 小時水位預測
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
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
                    dataKey="predicted"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    name="預測水位"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--color-foreground)"
                    strokeWidth={2}
                    fill="transparent"
                    name="實際水位"
                  />
                  {/* Threshold Line */}
                  <Area
                    type="monotone"
                    dataKey={() => threshold[0]}
                    stroke="var(--color-destructive)"
                    strokeWidth={1}
                    fill="transparent"
                    name="警戒線"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alert Settings */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              預警規則設定
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-base font-medium text-foreground">AI 智慧預警</label>
                  <p className="text-sm text-muted-foreground">啟用後將根據預測模型自動發送警報</p>
                </div>
                <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-foreground">水位警戒值 (Threshold)</label>
                  <span className="text-sm font-mono text-primary">{threshold[0]} m</span>
                </div>
                <Slider
                  value={threshold}
                  onValueChange={setThreshold}
                  max={5}
                  step={0.1}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  當預測水位超過此數值時，系統將立即觸發警報並通知相關人員。
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground mb-4">警報通知對象</h4>
              <div className="space-y-3">
                {['值班主管 (Station Manager)', '水利處監控中心 (Central Control)', '防災應變小組 (Emergency Team)'].map((role, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-400' : 'bg-gray-400'}`} />
                      <span className="text-sm">{role}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts Log */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              近期警報紀錄
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "10:45 AM", type: "AI Prediction", msg: "預測 2 小時後水位將達 2.8m (信心度 88%)", level: "warning" },
                { time: "09:30 AM", type: "System", msg: "抽水機 #3 震動異常，建議檢查", level: "info" },
                { time: "Yesterday", type: "Threshold", msg: "外水位超過警戒值 (2.5m)", level: "critical" },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-background/30 border border-border/30 hover:bg-background/50 transition-colors">
                  <div className={cn(
                    "p-2 rounded-full",
                    alert.level === 'critical' ? "bg-red-500/20 text-red-400" :
                    alert.level === 'warning' ? "bg-orange-500/20 text-orange-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-foreground">{alert.type}</h4>
                      <span className="text-xs text-muted-foreground font-mono">{alert.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
