import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download, Filter, Search } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Mock Data: Yearly Max Water Levels (1980-2024)
const yearlyData = Array.from({ length: 45 }, (_, i) => {
  const year = 1980 + i;
  // Simulate some trends and extreme events (e.g., typhoons)
  let baseLevel = 1.5 + Math.random() * 0.5;
  if (year === 2001) baseLevel = 3.8; // Typhoon Nari
  if (year === 2009) baseLevel = 3.5; // Typhoon Morakot
  if (year === 2015) baseLevel = 3.2; // Typhoon Soudelor
  
  return {
    year: year.toString(),
    maxLevel: parseFloat(baseLevel.toFixed(2)),
    avgLevel: parseFloat((baseLevel * 0.4).toFixed(2)),
    rainfall: Math.floor(Math.random() * 2000 + 1500),
  };
});

// Mock Data: Detailed Event Data (Typhoon Nari 2001)
const eventData = [
  { time: "09/16 00:00", level: 1.2, rain: 10 },
  { time: "09/16 06:00", level: 1.8, rain: 45 },
  { time: "09/16 12:00", level: 2.5, rain: 80 },
  { time: "09/16 18:00", level: 3.2, rain: 120 },
  { time: "09/17 00:00", level: 3.8, rain: 150 },
  { time: "09/17 06:00", level: 3.5, rain: 100 },
  { time: "09/17 12:00", level: 2.8, rain: 60 },
  { time: "09/17 18:00", level: 2.1, rain: 20 },
];

export default function Analysis() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
              歷史分析 <span className="text-primary">Analysis</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              長期水文數據回溯與極端氣候事件分析 (1980 - Present)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal bg-card/50 border-primary/20 hover:bg-primary/10 hover:text-primary",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-primary/20" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="bg-card text-foreground"
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" className="bg-card/50 border-primary/20 hover:bg-primary/10 hover:text-primary">
              <Filter className="w-4 h-4 mr-2" />
              篩選條件
            </Button>
            
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_var(--color-primary)]">
              <Download className="w-4 h-4 mr-2" />
              匯出報表
            </Button>
          </div>
        </div>

        {/* Main Chart: Long-term Trend */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              歷年最高水位與雨量趨勢 (1980-2024)
            </CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] bg-background/50 border-primary/20">
                <SelectValue placeholder="選擇區間" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部年份 (1980-2024)</SelectItem>
                <SelectItem value="10y">近 10 年</SelectItem>
                <SelectItem value="5y">近 5 年</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={30}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="var(--color-primary)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  unit="m"
                  label={{ value: '水位 (m)', angle: -90, position: 'insideLeft', fill: 'var(--color-primary)' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--color-secondary-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  unit="mm"
                  label={{ value: '年雨量 (mm)', angle: 90, position: 'insideRight', fill: 'var(--color-secondary-foreground)' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px" }}
                  itemStyle={{ color: "var(--color-foreground)" }}
                  cursor={{ fill: 'var(--color-primary)', opacity: 0.1 }}
                />
                <Legend />
                <Bar 
                  yAxisId="right"
                  dataKey="rainfall" 
                  name="年累積雨量" 
                  fill="var(--color-secondary-foreground)" 
                  opacity={0.3} 
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="maxLevel"
                  name="最高水位"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--color-primary)", strokeWidth: 0 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Analysis & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Extreme Events Table */}
          <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>歷史重大事件紀錄</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-primary/5">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">日期</th>
                      <th className="px-4 py-3">事件名稱</th>
                      <th className="px-4 py-3">最高水位</th>
                      <th className="px-4 py-3">累積雨量</th>
                      <th className="px-4 py-3 rounded-r-lg">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono">2001-09-17</td>
                      <td className="px-4 py-3 font-medium text-primary">納莉颱風 (Nari)</td>
                      <td className="px-4 py-3 text-red-400 font-bold">3.80 m</td>
                      <td className="px-4 py-3">450 mm</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">溢堤警戒</span></td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono">2009-08-08</td>
                      <td className="px-4 py-3 font-medium text-primary">莫拉克颱風 (Morakot)</td>
                      <td className="px-4 py-3 text-orange-400 font-bold">3.50 m</td>
                      <td className="px-4 py-3">380 mm</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">一級警戒</span></td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono">2015-08-08</td>
                      <td className="px-4 py-3 font-medium text-primary">蘇迪勒颱風 (Soudelor)</td>
                      <td className="px-4 py-3 text-orange-400 font-bold">3.20 m</td>
                      <td className="px-4 py-3">320 mm</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">一級警戒</span></td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono">2024-07-25</td>
                      <td className="px-4 py-3 font-medium text-primary">凱米颱風 (Gaemi)</td>
                      <td className="px-4 py-3 text-yellow-400 font-bold">2.80 m</td>
                      <td className="px-4 py-3">250 mm</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">二級警戒</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Event Detail Chart */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">納莉颱風 - 事件細節回放</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.1} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px" }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Line type="monotone" dataKey="level" stroke="var(--color-destructive)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="rain" stroke="var(--color-secondary-foreground)" strokeWidth={2} dot={false} yAxisId={1} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 text-xs text-muted-foreground text-center">
                紅色曲線：水位 (m) | 藍色曲線：時雨量 (mm)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
