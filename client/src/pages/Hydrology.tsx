import DashboardLayout from "@/components/DashboardLayout";
import { MapView } from "@/components/Map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Droplets, MapPin, Navigation, Search, Waves } from "lucide-react";
import { useState } from "react";

// Mock Station Data
const stations = [
  { id: 1, name: "中山抽水站", type: "Pump", status: "Normal", level: 0.85, lat: 25.068, lng: 121.532 },
  { id: 2, name: "大直橋水位站", type: "WaterLevel", status: "Normal", level: 1.42, lat: 25.075, lng: 121.540 },
  { id: 3, name: "圓山雨量站", type: "Rainfall", status: "Normal", value: "0.5mm", lat: 25.071, lng: 121.525 },
  { id: 4, name: "新生北路監測點", type: "CCTV", status: "Active", lat: 25.065, lng: 121.530 },
  { id: 5, name: "百齡橋水位站", type: "WaterLevel", status: "Warning", level: 2.10, lat: 25.085, lng: 121.515 },
];

export default function Hydrology() {
  const [activeTab, setActiveTab] = useState("map");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStations = stations.filter(s => 
    s.name.includes(searchQuery) || s.type.includes(searchQuery)
  );

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
              整合 GIS 地圖與即時水文測站資訊
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
            <Button variant="outline" className="bg-card/50 border-primary/20">
              <Navigation className="w-4 h-4 mr-2" />
              定位目前位置
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Station List Sidebar */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50 flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                測站列表 ({filteredStations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {filteredStations.map((station) => (
                    <div
                      key={station.id}
                      className="p-4 rounded-lg bg-background/40 border border-border/40 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {station.type === 'Pump' && <Droplets className="w-4 h-4 text-primary" />}
                          {station.type === 'WaterLevel' && <Waves className="w-4 h-4 text-blue-400" />}
                          {station.type === 'Rainfall' && <CloudRain className="w-4 h-4 text-cyan-400" />}
                          {station.type === 'CCTV' && <MapPin className="w-4 h-4 text-orange-400" />}
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {station.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            station.status === 'Warning' 
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }
                        >
                          {station.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-xs text-muted-foreground font-mono">
                          {station.lat}, {station.lng}
                        </div>
                        <div className="text-lg font-bold font-mono text-foreground">
                          {station.level ? `${station.level} m` : station.value || '--'}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> 抽水站</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> 水位站</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> 異常</span>
                </div>
              </div>
              
              <TabsContent value="map" className="flex-1 m-0 p-0 relative min-h-[400px]">
                <MapView 
                  className="w-full h-full"
                  onMapReady={(map: google.maps.Map) => {
                    // Initialize map center to Zhongshan Pump Station
                    map.setCenter({ lat: 25.068, lng: 121.532 });
                    map.setZoom(14);
                    
                    // Add markers for stations
                    stations.forEach(station => {
                      new google.maps.Marker({
                        position: { lat: station.lat, lng: station.lng },
                        map: map,
                        title: station.name,
                        label: {
                          text: station.type[0],
                          color: "white",
                          fontSize: "10px"
                        }
                      });
                    });
                  }}
                />
              </TabsContent>
              
              <TabsContent value="satellite" className="flex-1 m-0 p-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>衛星影像圖層載入中...</p>
                </div>
              </TabsContent>

              <TabsContent value="cctv" className="flex-1 m-0 p-0 grid grid-cols-2 gap-1 bg-black">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative bg-gray-900 flex items-center justify-center border border-gray-800">
                    <span className="text-gray-500 text-xs">Camera Feed #{i} (Signal Lost)</span>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] font-mono">
                      CAM-{i.toString().padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
