import { ALERT_THRESHOLDS, WeatherAlert } from "@/lib/MultiStationWeatherService";
import { cn } from "@/lib/utils";
import { AlertTriangle, CloudRain, Wind, Waves, X } from "lucide-react";
import { useState } from "react";

interface AlertBannerProps {
  alerts: WeatherAlert[];
  className?: string;
}

const alertTypeLabels: Record<string, { label: string; icon: React.ElementType }> = {
  RAIN_1HR: { label: "時雨量警報", icon: CloudRain },
  RAIN_24HR: { label: "24小時累積雨量警報", icon: CloudRain },
  WIND_GUST: { label: "強陣風警報", icon: Wind },
  WATER_LEVEL: { label: "水位警報", icon: Waves },
};

const severityStyles: Record<string, { bg: string; border: string; text: string; pulse: string }> = {
  WARNING: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    pulse: "animate-pulse",
  },
  DANGER: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/50",
    text: "text-orange-400",
    pulse: "animate-pulse",
  },
  CRITICAL: {
    bg: "bg-red-500/20",
    border: "border-red-500/70",
    text: "text-red-500",
    pulse: "animate-[pulse_0.5s_ease-in-out_infinite]",
  },
};

export function AlertBanner({ alerts, className }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (alerts.length === 0) return null;

  const visibleAlerts = alerts.filter(
    (alert) => !dismissed.has(`${alert.type}-${alert.severity}`)
  );

  if (visibleAlerts.length === 0) return null;

  // 取得最高嚴重等級的警報
  const highestSeverity = visibleAlerts.reduce((highest, alert) => {
    const severityOrder = { CRITICAL: 3, DANGER: 2, WARNING: 1 };
    return severityOrder[alert.severity] > severityOrder[highest]
      ? alert.severity
      : highest;
  }, "WARNING" as "WARNING" | "DANGER" | "CRITICAL");

  const style = severityStyles[highestSeverity];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 mb-6 relative overflow-hidden",
        style.bg,
        style.border,
        style.pulse,
        className
      )}
    >
      {/* 閃爍背景效果 (僅 CRITICAL) */}
      {highestSeverity === "CRITICAL" && (
        <div className="absolute inset-0 bg-red-500/10 animate-[flash_1s_ease-in-out_infinite]" />
      )}

      <div className="relative z-10 flex items-start gap-4">
        {/* 警報圖示 */}
        <div
          className={cn(
            "p-2 rounded-full",
            highestSeverity === "CRITICAL"
              ? "bg-red-500/20 animate-[bounce_0.5s_ease-in-out_infinite]"
              : "bg-current/10"
          )}
        >
          <AlertTriangle className={cn("w-6 h-6", style.text)} />
        </div>

        {/* 警報內容 */}
        <div className="flex-1 space-y-2">
          <div className={cn("font-bold text-lg", style.text)}>
            {highestSeverity === "CRITICAL"
              ? "🚨 緊急警報"
              : highestSeverity === "DANGER"
              ? "⚠️ 危險警報"
              : "⚡ 注意警報"}
          </div>

          <div className="space-y-1">
            {visibleAlerts.map((alert, index) => {
              const typeInfo = alertTypeLabels[alert.type];
              const Icon = typeInfo?.icon || AlertTriangle;
              const threshold = ALERT_THRESHOLDS[alert.type as keyof typeof ALERT_THRESHOLDS];

              return (
                <div
                  key={`${alert.type}-${index}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <Icon className={cn("w-4 h-4", style.text)} />
                  <span className="text-foreground">
                    {typeInfo?.label || alert.type}：
                    <span className={cn("font-mono font-bold ml-1", style.text)}>
                      {alert.value.toFixed(1)} {threshold?.unit}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      (閾值: {alert.threshold} {threshold?.unit})
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* 建議操作 */}
          <div className="mt-3 pt-3 border-t border-current/10">
            <span className="text-sm text-muted-foreground">建議操作：</span>
            <span className={cn("text-sm font-medium ml-2", style.text)}>
              {highestSeverity === "CRITICAL"
                ? "立即啟動緊急應變程序，通知相關人員"
                : highestSeverity === "DANGER"
                ? "密切監控水位變化，準備啟動抽水機組"
                : "持續關注氣象變化，保持警戒"}
            </span>
          </div>
        </div>

        {/* 關閉按鈕 */}
        <button
          onClick={() => {
            const newDismissed = new Set(dismissed);
            visibleAlerts.forEach((alert) => {
              newDismissed.add(`${alert.type}-${alert.severity}`);
            });
            setDismissed(newDismissed);
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* CSS for flash animation */}
      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/**
 * 小型警報指示燈 - 用於儀表板卡片
 */
export function AlertIndicator({ alerts }: { alerts: WeatherAlert[] }) {
  if (alerts.length === 0) return null;

  const hasCritical = alerts.some((a) => a.severity === "CRITICAL");
  const hasDanger = alerts.some((a) => a.severity === "DANGER");

  return (
    <div
      className={cn(
        "absolute top-2 right-2 w-3 h-3 rounded-full",
        hasCritical
          ? "bg-red-500 animate-[ping_0.5s_ease-in-out_infinite]"
          : hasDanger
          ? "bg-orange-500 animate-pulse"
          : "bg-yellow-500 animate-pulse"
      )}
    />
  );
}
