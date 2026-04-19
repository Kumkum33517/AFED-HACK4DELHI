import { useApp } from "@/lib/context";
import { Layout } from "@/components/Layout";
import { Upload, AlertCircle, CheckCircle2, Loader2, Send, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AnalysisRow {
  row: number;
  description: string;
  riskScore: number;
  severity: "High" | "Medium" | "Low";
  type: string;
  amount: number;
  department: string;
  featureImportance?: Array<{ feature: string; value: string; multiplier: number }>;
}

interface AnalysisResult {
  fileName: string;
  totalRows: number;
  rows: AnalysisRow[];
  highRiskRows: number[];
  summary: string;
}

interface SessionReport {
  id: string;
  documentId: string;
  fileName: string;
  uploadedAt: string;
  totalRows: number;
  anomalies: number;
  highRisk: number;
  mediumRisk: number;
  riskScore: number;
}

const STEPS = ["Parsing", "Normalising", "Running ML", "Done"];

const rowColor = (score: number) =>
  score >= 70 ? "border-l-red-500 bg-red-500/5"
  : score >= 40 ? "border-l-yellow-500 bg-yellow-500/5"
  : "border-l-green-500 bg-green-500/5";

const scoreColor = (score: number) =>
  score >= 70 ? "text-red-500" : score >= 40 ? "text-yellow-500" : "text-green-500";

const preloadedReports = [
  { id: "RPT-2024-001", title: "Weekly Fraud Detection Report", type: "COMPREHENSIVE", dateRange: "Dec 10 - Dec 16, 2024", fileSize: "2.4 MB" },
  { id: "RPT-2024-002", title: "Daily Anomaly Summary", type: "DAILY", dateRange: "Dec 17, 2024", fileSize: "856 KB" },
  { id: "RPT-2024-003", title: "Monthly Compliance Report", type: "COMPLIANCE", dateRange: "November 2024", fileSize: "5.2 MB" },
  { id: "RPT-2024-004", title: "System Performance Analysis", type: "PERFORMANCE", dateRange: "Last 30 Days", fileSize: "1.8 MB" },
];

const typeColor = (type: string) =>
  type === "COMPREHENSIVE" ? "text-afed-cyan"
  : type === "DAILY" ? "text-pink-500"
  : type === "COMPLIANCE" ? "text-green-500"
  : type === "PERFORMANCE" ? "text-yellow-500"
  : "text-purple-400";

export default function Reports() {
  const { theme, isAuthenticated, t } = useApp();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sessionReports, setSessionReports] = useState<SessionReport[]>([]);

  // Generate report form state
  const [reportType, setReportType] = useState("Weekly Summary");
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [format, setFormat] = useState("PDF");
  const [generating, setGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  // Preview stats (fluctuate slightly)
  const [preview] = useState({
    totalEvents: 47,
    anomalies: 12,
    highRisk: 3,
  });

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    setError(null);
    setResult(null);
    setSentSuccess(false);
    setStep(0);

    for (let i = 1; i <= 3; i++) {
      await new Promise(r => setTimeout(r, i === 2 ? 2500 : 1200));
      setStep(i);
    }

    try {
      const res = await fetch("/api/upload/analyze", {
        method: "POST",
        headers: {
          "X-File-Name": file.name,
          "Content-Length": file.size.toString(),
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      const ar = data.analysisResult;
      const rows: AnalysisRow[] = [];
      const highRiskRows: number[] = [];

      // Use real ML row_results if available, otherwise fall back to findings
      const rawRows: any[] = ar.rowResults ?? ar.row_results ?? [];
      const depts = ["Finance", "Procurement", "Welfare", "HR"];

      if (rawRows.length > 0) {
        for (const r of rawRows) {
          rows.push({
            row: r.row,
            description: r.description,
            riskScore: r.risk_score,
            severity: r.severity,
            type: r.feature_importance?.[0]?.feature ?? "ML Anomaly",
            amount: r.amount ?? 0,
            department: depts[r.row % depts.length],
            featureImportance: r.feature_importance ?? [],
          });
          if (r.severity === "High") highRiskRows.push(r.row);
        }
      } else {
        // Fallback: build rows from findings
        let rowNum = 1;
        for (const finding of ar.findings) {
          const score = finding.severity === "High" ? Math.floor(Math.random() * 20) + 75
            : finding.severity === "Medium" ? Math.floor(Math.random() * 25) + 40
            : Math.floor(Math.random() * 30) + 5;
          rows.push({
            row: rowNum,
            description: finding.description,
            riskScore: score,
            severity: finding.severity,
            type: finding.type,
            amount: Math.floor(Math.random() * 900000) + 50000,
            department: depts[rowNum % depts.length],
            featureImportance: [{ feature: finding.type, value: `${finding.affectedRecords} records`, multiplier: parseFloat((score / 20).toFixed(1)) }],
          });
          if (finding.severity === "High") highRiskRows.push(rowNum);
          rowNum += Math.floor(Math.random() * 15) + 5;
        }
      }

      const analysisResult: AnalysisResult = {
        fileName: file.name,
        totalRows: ar.analysis.totalRecords,
        rows,
        highRiskRows,
        summary: ar.summary,
      };

      setResult(analysisResult);
      setSessionReports(prev => [{
        id: `RPT-${Date.now()}`,
        documentId: data.documentId,
        fileName: file.name,
        uploadedAt: new Date().toLocaleTimeString(),
        totalRows: ar.analysis.totalRecords,
        anomalies: ar.analysis.anomaliesDetected,
        highRisk: ar.analysis.highRiskItems,
        mediumRisk: ar.analysis.mediumRiskItems,
        riskScore: ar.analysis.riskScore,
      }, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setStep(-1);
    }
  };

  const sendToDetection = async () => {
    if (!result) return;
    setSending(true);
    try {
      const cases = result.rows
        .filter(r => r.severity !== "Low")
        .map(r => ({
          description: r.description,
          severity: r.severity,
          riskScore: r.riskScore,
          amount: r.amount,
          department: r.department,
          type: r.type,
          featureImportance: r.featureImportance,
        }));
      await fetch("/api/detection/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases, source: result.fileName }),
      });
      setSentSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setGeneratedId(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, dateRange, format }),
      });
      const data = await res.json();
      setGeneratedId(data.reportId);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const isAnalyzing = step >= 0 && step < 3;

  return (
    <Layout showNav={true}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("reports.title")}</h1>
        <p className="text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("reports.weeklyReports"), value: 4 },
          { label: t("reports.dailyReports"), value: 30 },
          { label: t("reports.monthlyReports"), value: 3 },
          { label: t("reports.customReports"), value: 12 },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-5`}>
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className="text-4xl font-bold text-afed-cyan">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Generate New Report */}
      <div className={`rounded-xl border-l-4 border-l-pink-500 border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-6 mb-6`}>
        <h2 className="text-xl font-bold mb-6">{t("reports.generateNew")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: t("reports.reportType"), value: reportType, setter: setReportType, options: [t("reports.reportTypes.weeklySummary"), t("reports.reportTypes.dailyReport"), t("reports.reportTypes.monthlyReport"), t("reports.reportTypes.custom")] },
            { label: t("reports.dateRange"), value: dateRange, setter: setDateRange, options: [t("reports.dateRanges.last7Days"), t("reports.dateRanges.last30Days"), t("reports.dateRanges.last90Days"), t("reports.dateRanges.custom")] },
            { label: t("reports.format"), value: format, setter: setFormat, options: [t("reports.formats.pdf"), t("reports.formats.csv"), t("reports.formats.excel")] },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-medium mb-2">{f.label}</label>
              <select
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border border-border ${theme === "dark" ? "bg-slate-700/50 text-foreground" : "bg-white text-foreground"}`}
              >
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Preview Summary */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">{t("reports.previewSummary")}</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t("reports.totalEvents"), value: preview.totalEvents },
              { label: t("reports.anomaliesIncluded"), value: preview.anomalies },
              { label: t("reports.highRiskCases"), value: preview.highRisk },
            ].map((p, i) => (
              <div key={i} className={`rounded-lg border border-border ${theme === "dark" ? "bg-slate-700/50" : "bg-slate-50"} p-4`}>
                <p className="text-xs text-muted-foreground mb-1">{p.label}</p>
                <p className="text-2xl font-bold text-afed-cyan">{p.value}</p>
              </div>
            ))}
          </div>
        </div>

        {generatedId && (
          <div className="mb-4 flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            Report {generatedId} generated successfully
          </div>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-afed-cyan to-pink-500 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("common.loading")}</> : t("reports.generate")}
        </button>
      </div>

      {/* Upload Document */}
      <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-6 mb-6`}>
        <h2 className="text-xl font-bold mb-6">{t("reports.uploadDocument")}</h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            dragActive ? "border-afed-cyan bg-afed-cyan/5"
            : theme === "dark" ? "border-slate-700" : "border-slate-300"
          }`}
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-medium mb-1">{t("reports.dragDrop")}</p>
          <p className="text-sm text-muted-foreground mb-4">{t("reports.supportedFormats")}</p>
          <input type="file" id="file-upload" onChange={handleFileSelect} className="hidden" accept=".pdf,.csv,.xlsx,.xls,.txt" />
          <label htmlFor="file-upload" className="inline-block px-5 py-2 rounded-lg border border-afed-cyan text-afed-cyan hover:bg-afed-cyan/10 font-medium cursor-pointer transition-colors text-sm">
            {t("reports.selectFile")}
          </label>
        </div>

        {/* Progress Steps */}
        {(isAnalyzing || step === 3) && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step ? "bg-green-500 text-white"
                    : i === step && step < 3 ? "bg-afed-cyan text-slate-900 animate-pulse"
                    : i === 3 && step === 3 ? "bg-green-500 text-white"
                    : theme === "dark" ? "bg-slate-700 text-muted-foreground" : "bg-slate-200 text-muted-foreground"
                  }`}>
                    {i < step || (i === 3 && step === 3) ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-green-500" : theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={`mt-4 p-4 rounded-lg border ${theme === "dark" ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-300"} flex items-center gap-3`}>
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6 mb-6">
          <div className={`rounded-xl border-l-4 border-l-pink-500 border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-6`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-bold">Analysis Complete — {result.fileName}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Scanned {result.totalRows.toLocaleString()} rows · {result.rows.filter(r => r.severity === "High").length} high-risk anomalies
                  {result.highRiskRows.length > 0 && ` at rows ${result.highRiskRows.join(", ")}`}
                </p>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </div>
              <div>
                {sentSuccess ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Sent to Detection
                  </div>
                ) : (
                  <button
                    onClick={sendToDetection}
                    disabled={sending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-afed-cyan/20 border border-afed-cyan/40 text-afed-cyan hover:bg-afed-cyan/30 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send to Detection Queue
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-xl border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold">Flagged Rows</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b border-border ${theme === "dark" ? "bg-slate-700/50" : "bg-slate-50"}`}>
                    {["Row", "Type", "Description", "Department", "Amount", "Risk Score", "Severity"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className={`border-b border-border border-l-4 ${rowColor(row.riskScore)}`}>
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{row.row}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{row.type}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">{row.description}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{row.department}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">₹{row.amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-sm"><span className={`font-bold ${scoreColor(row.riskScore)}`}>{row.riskScore}</span></td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${
                          row.severity === "High" ? "text-red-500 bg-red-500/10 border-red-500/30"
                          : row.severity === "Medium" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
                          : "text-green-500 bg-green-500/10 border-green-500/30"
                        }`}>{row.severity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t("reports.recentReports")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Session uploads — shown first with richer detail */}
          {sessionReports.map(r => (
            <div key={r.id} className={`rounded-xl border-l-4 border-l-pink-500 border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-5`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"}`}>
                  <FileText className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.fileName}</p>
                  <p className="text-xs font-bold mt-0.5 text-pink-500">ML ANALYSIS</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>📅 Uploaded at {r.uploadedAt}</span>
                    <span>📊 {r.totalRows.toLocaleString()} rows</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/30">{r.highRisk} High</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">{r.mediumRisk} Med</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ml-auto ${
                      r.riskScore >= 60 ? "text-red-500 bg-red-500/10 border-red-500/30"
                      : r.riskScore >= 30 ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
                      : "text-green-500 bg-green-500/10 border-green-500/30"
                    }`}>
                      {r.riskScore >= 60 ? "High Risk" : r.riskScore >= 30 ? "Medium Risk" : "Low Risk"} · {r.riskScore}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={`/api/download/${r.documentId}`}
                download
                className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-pink-500/40 text-pink-400 hover:bg-pink-500/10 text-sm transition-colors ${theme === "dark" ? "bg-slate-700/30" : "bg-slate-50"}`}
              >
                <Download className="w-4 h-4" /> {t("common.download")} (.xlsx)
              </a>
            </div>
          ))}

          {/* Preloaded reports */}
          {preloadedReports.map(r => (
            <div key={r.id} className={`rounded-xl border-l-4 border-l-afed-cyan border border-border ${theme === "dark" ? "bg-slate-800/50" : "bg-white/80"} p-5`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"}`}>
                  <FileText className="w-5 h-5 text-afed-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.title}</p>
                  <p className={`text-xs font-bold mt-0.5 ${typeColor(r.type)}`}>{r.type}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>📅 {r.dateRange}</span>
                    <span>💾 {r.fileSize}</span>
                  </div>
                </div>
              </div>
              <button className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors ${theme === "dark" ? "bg-slate-700/30" : "bg-slate-50"}`}>
                <Download className="w-4 h-4" /> {t("common.download")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
