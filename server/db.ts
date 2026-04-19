/**
 * In-memory store — acts as the session "DB"
 * All data lives here and is shared across routes
 */

export interface CaseEvent {
  id: string;
  department: "Finance" | "Procurement" | "Welfare" | "HR";
  type: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  riskScore: number;
  amount: number; // ₹ value
  status: "New" | "Under Review" | "Approved" | "Dismissed";
  time: string;
  createdAt: number; // timestamp ms
  source: string; // filename or "simulated"
  featureImportance?: Array<{ feature: string; value: string; multiplier: number }>;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
}

export interface AlertThreshold {
  department: "Finance" | "Procurement" | "Welfare" | "HR";
  riskCutoff: number;
}

// Seed with a few initial cases so the app isn't empty on first load
const seedCases: CaseEvent[] = [
  {
    id: "EVT-001",
    department: "Finance",
    type: "Amount Anomaly",
    description: "Transaction amount 4.7× department average",
    severity: "High",
    riskScore: 91,
    amount: 4700000,
    status: "New",
    time: "3 minutes ago",
    createdAt: Date.now() - 3 * 60 * 1000,
    source: "seed",
    featureImportance: [
      { feature: "Amount", value: "₹47,00,000", multiplier: 4.7 },
      { feature: "Frequency", value: "3× normal", multiplier: 3.0 },
    ],
  },
  {
    id: "EVT-002",
    department: "Procurement",
    type: "Vendor Concentration",
    description: "Single vendor accounts for 68% of flagged transactions",
    severity: "High",
    riskScore: 85,
    amount: 1250000,
    status: "Under Review",
    time: "18 minutes ago",
    createdAt: Date.now() - 18 * 60 * 1000,
    source: "seed",
    featureImportance: [
      { feature: "Vendor Repeat Rate", value: "68%", multiplier: 6.8 },
      { feature: "Amount", value: "₹12,50,000", multiplier: 2.1 },
    ],
  },
  {
    id: "EVT-003",
    department: "Welfare",
    type: "Duplicate Beneficiary",
    description: "Same beneficiary registered with 3 slight name variations",
    severity: "High",
    riskScore: 88,
    amount: 85000,
    status: "New",
    time: "32 minutes ago",
    createdAt: Date.now() - 32 * 60 * 1000,
    source: "seed",
    featureImportance: [
      { feature: "Name Similarity", value: "94%", multiplier: 9.4 },
      { feature: "Address Match", value: "100%", multiplier: 10.0 },
    ],
  },
  {
    id: "EVT-004",
    department: "HR",
    type: "Threshold Avoidance",
    description: "12 payments just below ₹50,000 approval threshold",
    severity: "Medium",
    riskScore: 72,
    amount: 588000,
    status: "Under Review",
    time: "1 hour ago",
    createdAt: Date.now() - 60 * 60 * 1000,
    source: "seed",
    featureImportance: [
      { feature: "Threshold Proximity", value: "₹49,800 avg", multiplier: 3.2 },
      { feature: "Frequency", value: "12 transactions", multiplier: 4.0 },
    ],
  },
  {
    id: "EVT-005",
    department: "Finance",
    type: "Round Number Bias",
    description: "38% of transactions are exact round numbers",
    severity: "Medium",
    riskScore: 61,
    amount: 200000,
    status: "Dismissed",
    time: "2 hours ago",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    source: "seed",
    featureImportance: [
      { feature: "Round Number Rate", value: "38%", multiplier: 3.8 },
    ],
  },
  {
    id: "EVT-006",
    department: "Procurement",
    type: "Price Variance",
    description: "Vendor quoted 45% above market rate",
    severity: "Medium",
    riskScore: 68,
    amount: 320000,
    status: "Approved",
    time: "3 hours ago",
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    source: "seed",
    featureImportance: [
      { feature: "Price Deviation", value: "+45%", multiplier: 4.5 },
      { feature: "Market Comparison", value: "5 vendors checked", multiplier: 1.0 },
    ],
  },
];

// In-memory store
export const db = {
  cases: [...seedCases] as CaseEvent[],
  auditLog: [] as AuditLogEntry[],
  thresholds: [
    { department: "Finance", riskCutoff: 70 },
    { department: "Procurement", riskCutoff: 65 },
    { department: "Welfare", riskCutoff: 60 },
    { department: "HR", riskCutoff: 75 },
  ] as AlertThreshold[],

  // Computed stats from real data
  getStats() {
    const cases = this.cases;
    const high = cases.filter(c => c.severity === "High" && c.status !== "Dismissed" && c.status !== "Approved");
    const medium = cases.filter(c => c.severity === "Medium" && c.status !== "Dismissed" && c.status !== "Approved");
    const active = cases.filter(c => c.status === "New" || c.status === "Under Review");
    const departments = new Set(cases.map(c => c.department)).size;
    const fraudValue = high.reduce((sum, c) => sum + c.amount, 0);
    const riskScore = cases.length > 0
      ? Math.min(Math.round((high.length * 3 + medium.length * 1) / cases.length * 100), 100)
      : 0;

    return {
      totalAnomalies: cases.length,
      highRiskCount: high.length,
      departmentsMonitored: departments,
      potentialFraudValue: fraudValue,
      riskScore,
      activeAlerts: active.length,
      mediumRisk: medium.length,
    };
  },

  addCase(c: CaseEvent) {
    this.cases.unshift(c);
  },

  updateCaseStatus(id: string, status: CaseEvent["status"]) {
    const c = this.cases.find(x => x.id === id);
    if (c) c.status = status;
    return c;
  },

  addAuditLog(entry: Omit<AuditLogEntry, "id">) {
    this.auditLog.unshift({
      ...entry,
      id: `LOG-${Date.now()}`,
    });
  },

  saveThresholds(thresholds: AlertThreshold[]) {
    this.thresholds = thresholds;
  },
};
