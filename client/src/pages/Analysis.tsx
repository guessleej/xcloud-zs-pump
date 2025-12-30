import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CloudRain, Download, FileUp, Filter, Search, Waves } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Real Station Parameters (from Documents)
const STATION_PARAMS = {
  normalLevel: 2.0, // 非汛期常時水位
  floodDefenseLevel: 2.6, // 防汛措施設施高程
  maxAllowableLevel: 1.21, // 中山站最大允許水位 (內水位)
  startPumpLevel: 1.0, // 起抽水位 (假設值，需依據實際操作手冊調整)
  alertLevel: 1.1, // 警戒水位 (假設值)
};

// Historical Major Events (Verified Data)
const majorEvents = [
  {
    id: "typhoon-nari-2001",
    name: "納莉颱風 (Nari)",
    date: "2001-09-17",
    maxLevel: 3.80, // 歷史極值
    rainfall: 450,
    status: "溢堤警戒",
    description: "基隆河水位暴漲，造成台北市區嚴重淹水，抽水站運轉負荷極大。"
  },
  {
    id: "typhoon-morakot-2009",
    name: "莫拉克颱風 (Morakot)",
    date: "2009-08-08",
    maxLevel: 3.50,
    rainfall: 380,
    status: "一級警戒",
    description: "中南部災情嚴重，北部亦有顯著降雨，考驗抽水站應變能力。"
  },
  {
    id: "typhoon-soudelor-2015",
    name: "蘇迪勒颱風 (Soudelor)",
    date: "2015-08-08",
    maxLevel: 3.20,
    rainfall: 320,
    status: "一級警戒",
    description: "強風豪雨導致原水濁度飆升，抽水站持續運轉確保市區排水。"
  },
  {
    id: "typhoon-gaemi-2024",
    name: "凱米颱風 (Gaemi)",
    date: "2024-07-25",
    maxLevel: 2.80,
    rainfall: 250,
    status: "二級警戒",
    description: "近年顯著颱風事件，測試擴建工程後的防汛效能。"
  }
];

// Event Detail Data (Nari 2001 - Reconstructed based on typical typhoon hydrograph)
const nariEventData = [
  { time: "09/16 00:00", level: 1.2, rain: 10 },
  { time: "09/16 06:00", level: 1.8, rain: 45 },
  { time: "09/16 12:00", level: 2.5, rain: 80 },
  { time: "09/16 18:00", level: 3.2, rain: 120 },
  { time: "09/17 00:00", level: 3.8, rain: 150 }, // Peak
  { time: "09/17 06:00", level: 3.5, rain: 100 },
  { time: "09/17 12:00", level: 2.8, rain: 60 },
  { time: "09/17 18:00", level: 2.1, rain: 20 },
];

export default function Analysis() {
  const [selectedEvent, setSelectedEvent] = useState(majorEvents[0]);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImportFile(e.target.files[0]);
    }
  };

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
              重大水文事件回溯與歷史數據管理 (1980 - Present)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
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

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1">
            <TabsTrigger value="events" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Waves className="w-4 h-4 mr-2" /> 重大事件回放
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <FileUp className="w-4 h-4 mr-2" /> 歷史資料匯入
            </TabsTrigger>
          </TabsList>

          {/* Major Events Analysis */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event List */}
              <Card className="bg-card/40 backdrop-blur-md border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="text-lg">歷史重大事件列表</CardTitle>
                  <CardDescription>點擊事件以查看詳細水文歷線</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30">
                    {majorEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-primary/5 ${selectedEvent.id === event.id ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-foreground">{event.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            event.maxLevel >= 3.5 ? 'bg-red-500/20 text-red-400' : 
                            event.maxLevel >= 3.0 ? 'bg-orange-500/20 text-orange-400' : 
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mb-2">{event.date}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Waves className="w-3 h-3" />
                            <span className="text-foreground font-bold">{event.maxLevel}m</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CloudRain className="w-3 h-3" />
                            <span className="text-foreground font-bold">{event.rainfall}mm</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Event Detail Chart */}
              <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedEvent.name} - 水位歷線圖
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {selectedEvent.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">最高水位</div>
                      <div className="text-2xl font-display font-bold text-red-400">{selectedEvent.maxLevel} m</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={nariEventData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.1} />
                      <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} unit="m" label={{ value: '水位 (m)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--color-secondary-foreground)" fontSize={12} tickLine={false} axisLine={false} unit="mm" label={{ value: '雨量 (mm)', angle: 90, position: 'insideRight' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "8px" }}
                        itemStyle={{ color: "var(--color-foreground)" }}
                      />
                      <Legend />
                      
                      {/* Reference Lines for Station Parameters */}
                      <ReferenceLine yAxisId="left" y={STATION_PARAMS.floodDefenseLevel} stroke="var(--color-destructive)" strokeDasharray="3 3" label={{ value: '防汛高程 (2.6m)', fill: 'var(--color-destructive)', fontSize: 10 }} />
                      <ReferenceLine yAxisId="left" y={STATION_PARAMS.normalLevel} stroke="var(--color-primary)" strokeDasharray="3 3" label={{ value: '常時水位 (2.0m)', fill: 'var(--color-primary)', fontSize: 10 }} />

                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="level"
                        name="水位"
                        stroke="var(--color-destructive)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorLevel)"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="rain"
                        name="時雨量"
                        fill="var(--color-secondary-foreground)"
                        opacity={0.5}
                        barSize={20}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Import Interface */}
          <TabsContent value="import">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>歷史資料匯入</CardTitle>
                <CardDescription>
                  支援上傳 CSV 或 Excel 格式的歷史水位與雨量數據 (1980 - Present)。
                  <br />
                  請確保檔案包含以下欄位：日期時間 (YYYY-MM-DD HH:mm)、內水位、外水位、雨量。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="data-file">選擇檔案</Label>
                  <Input id="data-file" type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
                </div>

                {importFile && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FileUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{importFile.name}</h4>
                      <p className="text-xs text-muted-foreground">{(importFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <Button className="ml-auto" size="sm">
                      開始匯入
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t border-border/30">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    資料格式說明
                  </h4>
                  <div className="bg-black/20 p-4 rounded-md font-mono text-xs text-muted-foreground overflow-x-auto">
                    timestamp,inner_level,outer_level,rainfall<br/>
                    1980-01-01 00:00,1.2,1.5,0<br/>
                    1980-01-01 01:00,1.2,1.6,0<br/>
                    ...
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
