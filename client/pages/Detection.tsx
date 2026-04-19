import { useApp } from "@/lib/context";
import { Layout } from "@/components/Layout";
import { X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface CaseEvent {
  id: string;
  department: string;
  type: string;
  title: string;
  description: string;
  normalBehavior?: string;
  severity: "High" | "Medium" | "Low";
  riskScore: number;
  amount: number;
  status: "New" | "Under Review" | "Approved" | "Dismissed";
  time: string;
  source: string;
  featureImportance?: Array<{ feature: string; value: string; multiplier: number }>;
}

const severityColor = (s: string) =>
  s === "High" ? "text-red-500 bg-red-500/10 border-red-500/30"
  : s === "Medium" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
  : "text-green-500 bg-green-500/10 border-green-500/30";

const statusColor = (s: string) =>
  s === "New" ? "text-afed-cyan bg-afed-cyan/10 border-afed-cyan/30"
  : s === "Under Review" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
  : s === "Approved" ? "text-green-500 bg-green-500/10 border-green-500/30"
  : "text-slate-400 bg-slate-400/10 border-slate-400/30";

const riskBarColor = (score: number) =>
  score >= 75 ? "bg-red-500" : score >= 50 ? "bg-yellow-500" : "bg-green-500";

export default function Detection() {
  const { theme, userRole, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CaseEvent | null>(null);
  const [filters, setFilters] = useState({ severity: "All", department: "All", status: "All Cases" });

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.severity !== "All") params.set("severity", filters.severity);
      if (filters.department !== "All") params.set("department", filters.department);
      if (filters.status !== "All Cases") params.set("status", filters.status);
      const res = await fetch(`/api/detection/events?${params}`);
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (!isAuthenticated) return null;

  return (
    <Layout showNav={true}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Anomaly Detection Cases</h1>
        <p className="text-muted-foreground">Real-time ML-flagged events from all departments</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { key: "severity", label: "Severity Filter", options: ["All", "High", "Medium", "Low"] },
          { key: "department", label: "Department", options: ["All", "Finance", "Procurement", "Welfare", "HR"] },
          { key: "status", label: "Status", options: ["All Cases", "New", "Under Review", "Approved", "Dismissed"] },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-2">{f.label}</label>
            <select
              value={filters[f.key as keyof typeof filters]}
              onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border border-border ${
                theme === "dark" ? "bg-slate-800/50 text-foreground" : "bg-white text-foreground"
              }`}
            >
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b border-border ${theme === "dark" ? "bg-slate-700/50" : "bg-slate-50"}`}>
                {["Event ID", "Type", "Title", "Severity", "Risk Score", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No anomaly cases found.</td></tr>
              ) : events.map(ev => (
                <tr key={ev.id} className={`border-b border-border transition-colors ${theme === "dark" ? "hover:bg-slate-700/30" : "hover:bg-slate-50"}`}>
                  <td className="px-4 py-3 text-sm font-mono text-afed-cyan whitespace-nowrap">{ev.id}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{ev.type}</td>
                  <td className="px-4 py-3 text-sm max-w-[200px] truncate">{ev.title}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${severityColor(ev.severity)}`}>
                      {ev.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <div className="w-14 bg-slate-700/50 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${riskBarColor(ev.riskScore)}`} style={{ width: `${ev.riskScore}%` }} />
                      </div>
                      <span className="text-xs font-medium">{ev.riskScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${statusColor(ev.status)}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="px-3 py-1 rounded border border-afed-cyan text-afed-cyan hover:bg-afed-cyan/10 text-xs transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className={`w-full max-w-md h-full ${theme === "dark" ? "bg-slate-900" : "bg-white"} overflow-y-auto shadow-2xl`}>
            {/* Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b border-border ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}>
              <h2 className="text-xl font-bold">Detection Details</h2>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event ID */}
              <div>
                <p className="text-xs font-bold text-afed-cyan tracking-widest mb-1">EVENT ID</p>
                <p className="text-sm font-mono">{selectedEvent.id}</p>
              </div>

              {/* Alert */}
              <div>
                <p className="text-xs font-bold text-afed-cyan tracking-widest mb-2">ALERT</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${severityColor(selectedEvent.severity)}`}>
                    {selectedEvent.severity}
                  </span>
                  <span className="text-sm font-medium">{selectedEvent.title}</span>
                </div>
              </div>

              {/* Risk Score */}
              <div>
                <p className="text-xs font-bold text-afed-cyan tracking-widest mb-2">RISK SCORE</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${riskBarColor(selectedEvent.riskScore)}`}
                      style={{ width: `${selectedEvent.riskScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{selectedEvent.riskScore}%</span>
                </div>
              </div>

              {/* Why it was flagged */}
              <div>
                <p className="text-xs font-bold text-afed-cyan tracking-widest mb-2">WHY IT WAS FLAGGED</p>
                <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Normal Behavior */}
              {selectedEvent.normalBehavior && (
                <div>
                  <p className="text-xs font-bold text-afed-cyan tracking-widest mb-2">NORMAL BEHAVIOR COMPARISON</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.normalBehavior}</p>
                </div>
              )}

              {/* Feature Importance */}
              {selectedEvent.featureImportance && selectedEvent.featureImportance.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-afed-cyan tracking-widest mb-3">FEATURE IMPORTANCE</p>
                  <div className="space-y-3">
                    {selectedEvent.featureImportance.map((fi, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{fi.feature}</span>
                          <span className="text-muted-foreground">{fi.value} · {fi.multiplier}×</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-pink-500"
                            style={{ width: `${Math.min(fi.multiplier * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount */}
              {selectedEvent.amount > 0 && (
                <div>
                  <p className="text-xs font-bold text-afed-cyan tracking-widest mb-1">AMOUNT INVOLVED</p>
                  <p className="text-sm font-bold">₹{selectedEvent.amount.toLocaleString("en-IN")}</p>
                </div>
              )}

              {/* Suggested Action */}
              <div>
                <p className="text-xs font-bold text-afed-cyan tracking-widest mb-3">SUGGESTED ACTION</p>
                <div className="space-y-2">
                  {selectedEvent.status !== "Approved" && selectedEvent.status !== "Dismissed" ? (
                    <>
                      <button
                        className="w-full py-3 px-4 rounded-lg bg-afed-cyan text-slate-900 font-semibold hover:bg-afed-cyan/90 transition-colors"
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className={`w-full py-3 px-4 rounded-lg border border-border font-medium hover:bg-muted transition-colors ${theme === "dark" ? "bg-slate-800" : "bg-slate-50"}`}
                      >
                        Close Case
                      </button>
                    </>
                  ) : (
                    <div className={`p-3 rounded-lg border border-border text-sm text-muted-foreground text-center ${theme === "dark" ? "bg-slate-800" : "bg-slate-50"}`}>
                      Case is {selectedEvent.status.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
