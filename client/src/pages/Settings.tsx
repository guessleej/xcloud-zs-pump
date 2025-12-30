import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Database, Globe, Lock, RefreshCw, Save, Server, User } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
            系統設定 <span className="text-primary">Settings</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            管理系統參數、使用者權限與資料庫連線
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Globe className="w-4 h-4 mr-2" /> 一般設定
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Server className="w-4 h-4 mr-2" /> 系統參數
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Bell className="w-4 h-4 mr-2" /> 通知管理
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <User className="w-4 h-4 mr-2" /> 帳號安全
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>介面與顯示設定</CardTitle>
                <CardDescription>自訂戰情室的顯示語言、時區與主題風格</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>顯示語言 (Language)</Label>
                    <Select defaultValue="zh-TW">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-TW">繁體中文 (Traditional Chinese)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>時區 (Timezone)</Label>
                    <Select defaultValue="asia-taipei">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia-taipei">Asia/Taipei (GMT+8)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自動輪播模式 (Kiosk Mode)</Label>
                    <p className="text-sm text-muted-foreground">在無人操作時自動切換儀表板頁面，適合大螢幕展示</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Parameters */}
          <TabsContent value="system">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>API 與資料庫連線</CardTitle>
                <CardDescription>設定外部資料來源與地端資料庫參數</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>台北市水利處 API Endpoint</Label>
                    <div className="flex gap-2">
                      <Input defaultValue="https://heopublic.gov.taipei/taipei-heo-api/openapi/pumb/latest" className="font-mono text-sm" />
                      <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>地端 AI 模型 API (Ollama)</Label>
                    <div className="flex gap-2">
                      <Input defaultValue="http://localhost:11434/api/generate" className="font-mono text-sm" />
                      <Button variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10">Test</Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" /> 資料庫設定 (InfluxDB)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Host</Label>
                      <Input defaultValue="localhost" />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input defaultValue="8086" />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Input defaultValue="zhongshan_station" />
                    </div>
                    <div className="space-y-2">
                      <Label>Bucket</Label>
                      <Input defaultValue="sensor_data" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>個人檔案與安全</CardTitle>
                <CardDescription>管理您的登入憑證與個人資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src="/images/avatar-placeholder.png" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">Admin User</h3>
                    <p className="text-sm text-muted-foreground">System Administrator</p>
                  </div>
                  <Button variant="outline" className="ml-auto">Change Avatar</Button>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input defaultValue="admin@zhongshan-pump.gov.tw" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-yellow-500" />
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium text-yellow-500">Two-Factor Authentication</h4>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="ghost">Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_var(--color-primary)]">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}


