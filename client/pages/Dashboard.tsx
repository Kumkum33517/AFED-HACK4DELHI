import { useApp } from "@/lib/context";
import { Layout } from "@/components/Layout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Activity, AlertTriangle, CheckCircle, Clock, Shield, Zap } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardResponse } from "@shared/api";

const ROLE_SECTIONS: Record<string, string[]> = {
  administrator: ["kpis", "charts", "events", "alerts", "health", "quickStats"],
  analyst:       ["kpis", "charts", "events", "alerts", "health", "quickStats"],
  auditor:       ["kpis", "charts", "alerts", "quickStats"],
  guest:         ["kpis", "charts", "events", "alerts", "health", "quickStats"],
};

function canView(role: string | null, section: string) {
  if (!role) return true;
  return ROLE_SECTIONS[role]?.includes(section) ?? false;
}

export default function Dashboard() {
  const { t, theme, userRole, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [recentEvents, setRecentEvents] = useState<Array<{ id: number; title: string; time: string }>>([]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json: DashboardResponse = await res.json();
      setData(json);
      setRecentEvents(generateRecentEvents());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (!isAuthenticated) return null;

  return (
    <Layout showNav={true}>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-1">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("dashboard.subtitle")}</p>
        </div>
        {canView(userRole, "kpis") && (
          <button
            onClick={() => setShowKpiModal(true)}
            className="px-4 py-2 rounded-lg bg-afed-cyan/20 border border-afed-cyan/40 text-afed-cyan hover:bg-afed-cyan/30 transition-colors text-sm font-medium"
          >
            {t("dashboard.viewDetails")}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      {canView(userRole, "kpis") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: t("dashboard.totalEvents"),
              value: data?.stats.totalEvents ?? "—",
              icon: Activity,
              color: "text-afed-cyan",
              border: "border-afed-cyan",
            },
            {
              label: t("dashboard.anomalies"),
              value: data?.stats.anomalies ?? "—",
              icon: AlertTriangle,
              color: "text-pink-500",
              border: "border-pink-500",
            },
            {
              label: t("dashboard.eventsAnalyzed"),
              value: data?.stats.eventsAnalyzed ?? "—",
              icon: CheckCircle,
              color: "text-green-500",
              border: "border-green-500",
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-xl border-2 ${card.border} ${
                  theme === "dark" ? "bg-slate-800/50" : "bg-white/80"
                } p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-4xl font-bold">{card.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {canView(userRole, "charts") && (
        <div className={`rounded-xl border border-border ${
          theme === "dark" ? "bg-slate-800/50" : "bg-white/80"
        } p-6 mb-8`}>
          <h3 className="text-lg font-bold mb-6">{t("dashboard.eventsOverTime")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.eventsOverTime ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke={theme === "dark" ? "#64748b" : "#94a3b8"} />
              <YAxis tick={{ fontSize: 12 }} stroke={theme === "dark" ? "#64748b" : "#94a3b8"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="normal" stroke="#06b6d4" strokeWidth={2} dot={false} name="Normal" />
              <Line type="monotone" dataKey="anomalies" stroke="#ec4899" strokeWidth={2} dot={false} name="Anomalies" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Events + Alerts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {canView(userRole, "events") && (
          <div className={`rounded-xl border border-border ${
            theme === "dark" ? "bg-slate-800/50" : "bg-white/80"
          } p-6`}>
            <h3 className="text-lg font-bold mb-4">{t("dashboard.recentEvents")}</h3>
            <div className="space-y-3">
              {recentEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-afed-cyan" />
                    <span className="text-sm">{event.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canView(userRole, "alerts") && (
          <div className={`rounded-xl border-l-4 border-l-pink-500 border border-border ${
            theme === "dark" ? "bg-slate-800/50" : "bg-white/80"
          } p-6`}>
            <h3 className="text-lg font-bold mb-4">{t("dashboard.recentAlerts")}</h3>
            <div className="space-y-3">
              {(data?.recentAlerts ?? []).map(alert => (
                <div key={alert.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span className="text-sm">{alert.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats + System Health */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {canView(userRole, "quickStats") && (
          <div className={`rounded-xl border border-border ${
            theme === "dark" ? "bg-slate-800/50" : "bg-white/80"
          } p-6`}>
            <h3 className="text-lg font-bold mb-4">{t("dashboard.quickStats")}</h3>
            <div className="space-y-4">
              {[
                { label: t("dashboard.riskScore"), value: data?.stats.riskScore ?? "—", color: "text-yellow-500" },
                { label: t("dashboard.activeAlerts"), value: data?.stats.activeAlerts ?? "—", color: "text-pink-500" },
                { label: t("dashboard.mediumRisk"), value: data?.stats.mediumRisk ?? "—", color: "text-orange-500" },
                { label: t("dashboard.highRisk"), value: data?.stats.highRisk ?? "—", color: "text-red-500" },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canView(userRole, "health") && (
          <div className={`rounded-xl border border-border ${
            theme === "dark" ? "bg-slate-800/50" : "bg-white/80"
          } p-6`}>
            <h3 className="text-lg font-bold mb-4">{t("dashboard.systemHealth")}</h3>
            <div className="space-y-4">
              {(data?.systemHealth ?? []).map((item, idx) => {
                const IconComp = item.icon === "Activity" ? Activity : item.icon === "CheckCircle" ? CheckCircle : Clock;
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComp className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-green-500">{item.status}</p>
                      <p className="text-xs text-muted-foreground">{item.lastChecked}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resources Footer */}
      <div className={`rounded-xl border border-border ${
        theme === "dark" ? "bg-slate-800/50" : "bg-white/80"
      } p-6 mb-8`}>
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: t("dashboard.processingRate"), value: data?.stats.processingRate ?? "—", icon: Zap, color: "text-afed-cyan" },
            { label: t("dashboard.detectionAccuracy"), value: data?.stats.detectionAccuracy ?? "—", icon: Shield, color: "text-green-500" },
            { label: t("dashboard.avgResponseTime"), value: data?.stats.avgResponseTime ?? "—", icon: Clock, color: "text-yellow-500" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx}>
                <Icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
                <p className="text-xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Modal */}
      {showKpiModal && data && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl border border-border w-full max-w-md p-6 ${
            theme === "dark" ? "bg-slate-800" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{t("dashboard.systemMetrics")}</h3>
              <button onClick={() => setShowKpiModal(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="space-y-4">
              {[
                { label: t("dashboard.totalEvents"), value: data.stats.totalEvents },
                { label: t("dashboard.anomalies"), value: data.stats.anomalies },
                { label: t("dashboard.eventsAnalyzed"), value: data.stats.eventsAnalyzed },
                { label: t("dashboard.processingRate"), value: data.stats.processingRate },
                { label: t("dashboard.detectionAccuracy"), value: data.stats.detectionAccuracy },
                { label: t("dashboard.avgResponseTime"), value: data.stats.avgResponseTime },
                { label: t("dashboard.riskScore"), value: data.stats.riskScore },
                { label: t("dashboard.activeAlerts"), value: data.stats.activeAlerts },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-8 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground">© 2026 AFED. Automated Fraud & Event Detection.</p>
      </div>
    </Layout>
  );
}

function generateRecentEvents() {
  const titles = [
    "Transaction processed",
    "Procurement record ingested",
    "Batch processing completed",
    "Data validation passed",
    "Anomaly scan finished",
    "Report generated",
    "Vendor record updated",
  ];
  return titles.slice(0, 4).map((title, i) => ({
    id: i + 1,
    title,
    time: `${Math.floor(Math.random() * 20) + i * 5 + 1} min ago`,
  }));
}
