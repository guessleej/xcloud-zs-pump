import DashboardLayout from "@/components/DashboardLayout";
import { MapView } from "@/components/Map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Droplets, MapPin, Navigation, Search, Waves, Video, RefreshCw, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// 抽水站資料介面
interface PumpStation {
  stn_id: string;
  stn_name: string;
  lon: number;
  lat: number;
  obs_time: string;
  inner_value: string;
  outer_value: string;
  pumb_num: number;
  door_num: number;
  pumb_status: string;
  door_status: string | null;
  max_allowable_water_level: number | null;
}

// CCTV 監控點資料
const cctvStations = [
  { id: 1, name: "中山抽水站-站房", url: "https://cctv.bote.gov.taipei/cctvn/CCTV-M-003.jpg", status: "online" },
  { id: 2, name: "中山抽水站-抽水機房", url: "https://cctv.bote.gov.taipei/cctvn/CCTV-M-004.jpg", status: "online" },
  { id: 3, name: "基隆河-大直橋", url: "https://cctv.bote.gov.taipei/cctvn/CCTV-W-001.jpg", status: "online" },
  { id: 4, name: "基隆河-圓山", url: "https://cctv.bote.gov.taipei/cctvn/CCTV-W-002.jpg", status: "online" },
];

export default function Hydrology() {
  const [activeTab, setActiveTab] = useState("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<PumpStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<PumpStation | null>(null);
  const [cctvRefreshKey, setCctvRefreshKey] = useState(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // 從 API 獲取抽水站資料
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("https://heopublic.gov.taipei/taipei-heo-api/openapi/pumb/latest");
        const data: PumpStation[] = await response.json();
        setStations(data);
        // 預設選中中山抽水站
        const zhongshan = data.find(s => s.stn_id === "108");
        if (zhongshan) setSelectedStation(zhongshan);
      } catch (error) {
        console.error("Failed to fetch pump stations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
    // 每 5 分鐘更新一次
    const interval = setInterval(fetchStations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 過濾測站
  const filteredStations = stations.filter(s =>
    s.stn_name.includes(searchQuery) || s.stn_id.includes(searchQuery)
  );

  // 判斷測站狀態
  const getStationStatus = (station: PumpStation) => {
    const innerLevel = parseFloat(station.inner_value);
    const maxLevel = station.max_allowable_water_level;
    if (maxLevel && innerLevel >= maxLevel * 0.8) return "Warning";
    if (station.pumb_status === "運轉") return "Active";
    return "Normal";
  };

  // 點擊測站時移動地圖
  const handleStationClick = useCallback((station: PumpStation) => {
    setSelectedStation(station);
    if (mapRef.current && station.lat && station.lon) {
      mapRef.current.panTo({ lat: station.lat, lng: station.lon });
      mapRef.current.setZoom(16);
    }
  }, []);

  // 初始化地圖
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    // 設定初始中心為中山抽水站
    map.setCenter({ lat: 25.07398, lng: 121.5341 });
    map.setZoom(13);
  }, []);

  // 當測站資料更新時，更新地圖標記
  useEffect(() => {
    if (!mapRef.current || stations.length === 0) return;

    // 清除舊標記
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 建立新標記
    stations.forEach(station => {
      if (!station.lat || !station.lon) return;

      const status = getStationStatus(station);
      const isSelected = selectedStation?.stn_id === station.stn_id;
      
      // 根據狀態設定標記顏色
      let iconColor = "#22c55e"; // 綠色 - 正常
      if (status === "Warning") iconColor = "#f97316"; // 橙色 - 警告
      if (status === "Active") iconColor = "#3b82f6"; // 藍色 - 運轉中
      if (isSelected) iconColor = "#06b6d4"; // 青色 - 選中

      const marker = new google.maps.Marker({
        position: { lat: station.lat, lng: station.lon },
        map: mapRef.current!,
        title: `${station.stn_name}抽水站`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 8,
          fillColor: iconColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        label: isSelected ? {
          text: station.stn_name,
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "bold",
        } : undefined,
      });

      // 點擊標記時顯示資訊視窗
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #0891b2;">${station.stn_name}抽水站</h3>
            <div style="font-size: 12px; color: #374151;">
              <p style="margin: 4px 0;"><strong>內水位:</strong> ${station.inner_value} m</p>
              <p style="margin: 4px 0;"><strong>外水位:</strong> ${station.outer_value} m</p>
              <p style="margin: 4px 0;"><strong>泵浦數:</strong> ${station.pumb_num} 台 (${station.pumb_status})</p>
              <p style="margin: 4px 0;"><strong>閘門數:</strong> ${station.door_num} 座</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 11px;">更新: ${station.obs_time}</p>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        setSelectedStation(station);
        infoWindow.open(mapRef.current!, marker);
      });

      markersRef.current.push(marker);
    });
  }, [stations, selectedStation]);

  // 重新整理 CCTV
  const refreshCctv = () => {
    setCctvRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
              水文資訊 <span className="text-primary">Hydrology Map</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              整合 GIS 地圖與即時水文測站資訊 (共 {stations.length} 座抽水站)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋測站..."
                className="pl-8 bg-card/50 border-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="bg-card/50 border-primary/20"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.setCenter({ lat: 25.07398, lng: 121.5341 });
                  mapRef.current.setZoom(13);
                }
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              回到中山站
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Station List Sidebar */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50 flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                抽水站列表 ({filteredStations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="text-center text-muted-foreground py-8">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                      載入中...
                    </div>
                  ) : filteredStations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      無符合條件的測站
                    </div>
                  ) : (
                    filteredStations.map((station) => {
                      const status = getStationStatus(station);
                      const isSelected = selectedStation?.stn_id === station.stn_id;
                      return (
                        <div
                          key={station.stn_id}
                          onClick={() => handleStationClick(station)}
                          className={`p-4 rounded-lg border transition-all cursor-pointer group ${
                            isSelected 
                              ? "bg-primary/10 border-primary/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                              : "bg-background/40 border-border/40 hover:bg-primary/5 hover:border-primary/30"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Droplets className={`w-4 h-4 ${isSelected ? "text-primary" : "text-cyan-400"}`} />
                              <span className={`font-medium transition-colors ${isSelected ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                                {station.stn_name}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                status === 'Warning'
                                  ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                  : status === 'Active'
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-green-500/10 text-green-400 border-green-500/20"
                              }
                            >
                              {status === 'Warning' ? '警戒' : status === 'Active' ? '運轉' : '正常'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">內水位</span>
                              <div className="font-mono font-bold text-foreground">{station.inner_value} m</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">外水位</span>
                              <div className="font-mono font-bold text-foreground">{station.outer_value} m</div>
                            </div>
                          </div>
                          <div className="mt-2 text-[10px] text-muted-foreground">
                            泵浦: {station.pumb_num}台 | 閘門: {station.door_num}座
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Map View */}
          <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-border/50 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-6 pt-4 border-b border-border/30 flex justify-between items-center">
                <TabsList className="bg-background/30">
                  <TabsTrigger value="map">GIS 地圖</TabsTrigger>
                  <TabsTrigger value="satellite">衛星影像</TabsTrigger>
                  <TabsTrigger value="cctv">CCTV 監控</TabsTrigger>
                </TabsList>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> 正常</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> 運轉</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> 警戒</span>
                </div>
              </div>

              <TabsContent value="map" className="flex-1 m-0 p-0 relative min-h-[400px]">
                <MapView
                  className="w-full h-full"
                  initialCenter={{ lat: 25.07398, lng: 121.5341 }}
                  initialZoom={13}
                  onMapReady={handleMapReady}
                />
              </TabsContent>

              <TabsContent value="satellite" className="flex-1 m-0 p-0 relative min-h-[400px]">
                <MapView
                  className="w-full h-full"
                  initialCenter={selectedStation ? { lat: selectedStation.lat, lng: selectedStation.lon } : { lat: 25.07398, lng: 121.5341 }}
                  initialZoom={16}
                  onMapReady={(map) => {
                    // 切換為衛星影像模式
                    map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                    
                    // 如果有選中的測站，標記位置
                    if (selectedStation && selectedStation.lat && selectedStation.lon) {
                      new google.maps.Marker({
                        position: { lat: selectedStation.lat, lng: selectedStation.lon },
                        map: map,
                        title: `${selectedStation.stn_name}抽水站`,
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 12,
                          fillColor: "#06b6d4",
                          fillOpacity: 0.9,
                          strokeColor: "#ffffff",
                          strokeWeight: 3,
                        },
                        label: {
                          text: selectedStation.stn_name,
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "bold",
                        },
                      });
                    }
                  }}
                />
                {selectedStation && (
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
                    <div className="font-bold text-primary">{selectedStation.stn_name}抽水站</div>
                    <div className="text-xs text-gray-300">
                      座標: {selectedStation.lat.toFixed(5)}, {selectedStation.lon.toFixed(5)}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cctv" className="flex-1 m-0 p-0 flex flex-col bg-black">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Video className="w-4 h-4" /> 即時監控畫面
                  </span>
                  <Button variant="ghost" size="sm" onClick={refreshCctv} className="text-gray-400 hover:text-white">
                    <RefreshCw className="w-4 h-4 mr-1" /> 重新整理
                  </Button>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-1 p-1">
                  {cctvStations.map((cctv) => (
                    <div key={cctv.id} className="relative bg-gray-900 flex items-center justify-center border border-gray-800 overflow-hidden">
                      <img
                        src={`${cctv.url}?t=${cctvRefreshKey}`}
                        alt={cctv.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <span className="text-gray-500 text-xs">訊號中斷</span>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono rounded">
                        {cctv.name}
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded">
                        <div className={`w-1.5 h-1.5 rounded-full ${cctv.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] text-gray-300">{cctv.status === 'online' ? 'LIVE' : 'OFFLINE'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
