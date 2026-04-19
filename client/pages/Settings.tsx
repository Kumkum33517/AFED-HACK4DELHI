import { useApp } from "@/lib/context";
import { Layout } from "@/components/Layout";
import { Lock, Users, Sliders, ClipboardList, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DEPTS = ["Finance", "Procurement", "Welfare", "HR"] as const;
type Dept = typeof DEPTS[number];

interface Threshold { department: Dept; riskCutoff: number; }
interface AuditEntry { id: string; action: string; target: string; user: string; timestamp: string; }

const Toggle = ({ checked, onChange, theme }: { checked: boolean; onChange: () => void; theme: string }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${checked ? "bg-afed-cyan" : theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`}
  >
    <span className={`inline-block h-6 w-6 rounded-full bg-white transition-transform mt-1 ${checked ? "translate-x-7" : "translate-x-1"}`} />
  </button>
);

export default function Settings() {
  const { t, theme, userRole, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("security");
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true, ipWhitelist: false, sessionTimeout: true, apiKeyRotation: true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [thresholds, setThresholds] = useState<Threshold[]>([
    { department: "Finance", riskCutoff: 70 },
    { department: "Procurement", riskCutoff: 65 },
    { department: "Welfare", riskCutoff: 60 },
    { department: "HR", riskCutoff: 75 },
  ]);
  const [thresholdSaved, setThresholdSaved] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (activeTab === "audit") fetchAuditLog();
    if (activeTab === "thresholds") fetchThresholds();
  }, [activeTab]);

  const fetchThresholds = async () => {
    try {
      const res = await fetch("/api/settings/thresholds");
      const data = await res.json();
      if (data.thresholds) setThresholds(data.thresholds);
    } catch (e) { console.error(e); }
  };

  const fetchAuditLog = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/settings/audit-log");
      const data = await res.json();
      setAuditLog(data.log ?? []);
    } catch (e) { console.error(e); } finally { setAuditLoading(false); }
  };

  const saveSecuritySettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const saveThresholds = async () => {
    try {
      await fetch("/api/settings/thresholds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thresholds, user: userRole ?? "admin" }),
      });
      setThresholdSaved(true);
      setTimeout(() => setThresholdSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  if (!isAuthenticated) return null;

  const tabs = [
    { id: "security", label: t("settings.security"), icon: <Lock className="w-5 h-5" /> },
    { id: "thresholds", label: "Alert Thresholds", icon: <Sliders className="w-5 h-5" /> },
    { id: "audit", label: "Audit Log", icon: <ClipboardList className="w-5 h-5" /> },
    { id: "access", label: t("settings.accessControl"), icon: <Users className="w-5 h-5" /> },
    { id: "preferences", label: t("settings.preferences"), icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <Layout showNav={true}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} overflow-hidden`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 border-b border-border last:border-b-0 transition-colors ${
                  activeTab === tab.id
                    ? `${theme === "dark" ? "bg-slate-700/50" : "bg-blue-50"} text-afed-cyan border-l-4 border-l-afed-cyan`
                    : "hover:bg-muted"
                }`}
              >
                {tab.icon}
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {/* Security */}
          {activeTab === "security" && (
            <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-8`}>
              <h2 className="text-2xl font-bold mb-2">{t("settings.securitySettings")}</h2>
              <p className="text-muted-foreground mb-8">{t("settings.securityDesc")}</p>
              <div className="space-y-4">
                {[
                  { key: "twoFactor" as const, label: t("settings.twoFactor"), desc: "Add extra layer of security to your account" },
                  { key: "ipWhitelist" as const, label: t("settings.ipWhitelist"), desc: "Only allow access from specific IP addresses" },
                  { key: "sessionTimeout" as const, label: t("settings.sessionTimeout"), desc: "Automatically log out after inactivity" },
                  { key: "apiKeyRotation" as const, label: t("settings.apiKeyRotation"), desc: "Periodically refresh API keys" },
                ].map(s => (
                  <div key={s.key} className={`flex items-center justify-between p-4 rounded-lg border border-border ${theme === "dark" ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <div>
                      <p className="font-medium">{s.label}</p>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                    <Toggle checked={securitySettings[s.key]} onChange={() => setSecuritySettings(p => ({ ...p, [s.key]: !p[s.key] }))} theme={theme} />
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-border flex items-center gap-4">
                <button onClick={saveSecuritySettings} className="px-6 py-2 rounded-lg bg-afed-cyan text-slate-900 font-medium hover:opacity-90 transition-opacity">
                  {t("common.save")}
                </button>
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Settings saved
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alert Thresholds */}
          {activeTab === "thresholds" && (
            <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-8`}>
              <h2 className="text-2xl font-bold mb-2">Alert Thresholds</h2>
              <p className="text-muted-foreground mb-8">Set the minimum risk score to trigger alerts per department</p>
              <div className="space-y-6">
                {thresholds.map((t, i) => (
                  <div key={t.department} className={`p-5 rounded-lg border border-border ${theme === "dark" ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">{t.department}</p>
                      <span className={`text-lg font-bold ${t.riskCutoff >= 70 ? "text-red-500" : t.riskCutoff >= 50 ? "text-yellow-500" : "text-green-500"}`}>
                        {t.riskCutoff}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={t.riskCutoff}
                      onChange={e => setThresholds(prev => prev.map((x, j) => j === i ? { ...x, riskCutoff: Number(e.target.value) } : x))}
                      className="w-full accent-afed-cyan"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0 — Low</span>
                      <span>50 — Medium</span>
                      <span>100 — High</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-border flex items-center gap-4">
                <button onClick={saveThresholds} className="px-6 py-2 rounded-lg bg-afed-cyan text-slate-900 font-medium hover:opacity-90 transition-opacity">
                  Save Thresholds
                </button>
                {thresholdSaved && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Thresholds saved
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Log */}
          {activeTab === "audit" && (
            <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-8`}>
              <h2 className="text-2xl font-bold mb-2">Audit Log</h2>
              <p className="text-muted-foreground mb-6">Real-time log of all actions taken in this session</p>
              {auditLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : auditLog.length === 0 ? (
                <p className="text-muted-foreground text-sm">No audit entries yet. Approve/dismiss cases or upload documents to generate log entries.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {auditLog.map(entry => (
                    <div key={entry.id} className={`p-4 rounded-lg border border-border ${theme === "dark" ? "bg-slate-700/30" : "bg-slate-50"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">Target: {entry.target} · User: {entry.user}</p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Access Control */}
          {activeTab === "access" && (
            <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-8`}>
              <h2 className="text-2xl font-bold mb-2">{t("settings.accessControl")}</h2>
              <p className="text-muted-foreground mb-8">Role-based access management</p>
              <div className={`rounded-xl border border-dashed border-border p-12 text-center ${theme === "dark" ? "bg-slate-700/20" : "bg-slate-50"}`}>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground">User management and permission matrix will be available in a future release.</p>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === "preferences" && (
            <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-8`}>
              <h2 className="text-2xl font-bold mb-2">{t("settings.preferences")}</h2>
              <p className="text-muted-foreground mb-8">Notification and system behavior preferences</p>
              <div className={`p-6 rounded-lg border border-border ${theme === "dark" ? "bg-slate-700/30" : "bg-slate-50"}`}>
                <p className="font-bold mb-4">Notification Preferences</p>
                <div className="space-y-4">
                  {[
                    { label: "Email Alerts", desc: "High-risk anomalies via email", on: true },
                    { label: "SMS Notifications", desc: "Critical alerts via SMS", on: false },
                    { label: "High Risk Alerts", desc: "Instant notifications for high-severity events", on: true },
                    { label: "Daily Summary", desc: "Daily summary of events and anomalies", on: true },
                    { label: "Weekly Report Digest", desc: "Weekly fraud detection reports", on: true },
                    { label: "System Maintenance Alerts", desc: "System updates and maintenance", on: false },
                  ].map((n, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${n.on ? "border-l-afed-cyan" : "border-l-slate-500"}`}>
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                      <Toggle checked={n.on} onChange={() => {}} theme={theme} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border">
                <button className="px-6 py-2 rounded-lg bg-afed-cyan text-slate-900 font-medium hover:opacity-90 transition-opacity">
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
