import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, BarChart3, Droplets, Home, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "總覽", href: "/" },
    { icon: Activity, label: "即時監控", href: "/monitoring" },
    { icon: BarChart3, label: "歷史分析", href: "/analysis" },
    { icon: AlertTriangle, label: "預警中心", href: "/alerts" },
    { icon: Droplets, label: "水文資訊", href: "/hydrology" },
    { icon: Settings, label: "系統設定", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-sidebar/50 backdrop-blur-xl flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-border/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-[0_0_15px_var(--color-primary)]">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider text-foreground">xCloud-ZS-PUMP</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">War Room</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="font-medium tracking-wide">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--color-primary)] animate-pulse" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/40">
          <div className="bg-card/50 rounded-lg p-4 border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">系統狀態</span>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                正常運作
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              v1.0.0-beta
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative overflow-y-auto h-screen bg-[url('/images/hero-bg.png')] bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" /> {/* Overlay to darken bg */}
        <div className="relative z-10 p-8 container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
