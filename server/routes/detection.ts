import { RequestHandler } from "express";

interface CaseEvent {
  id: string;
  department: "Finance" | "Procurement" | "Welfare" | "HR";
  type: string;
  title: string;
  description: string;
  normalBehavior: string;
  severity: "High" | "Medium" | "Low";
  riskScore: number;
  amount: number;
  status: "New" | "Under Review" | "Approved" | "Dismissed";
  time: string;
  source: string;
  featureImportance: Array<{ feature: string; value: string; multiplier: number }>;
}

// Seed cases — always present
const seedCases: CaseEvent[] = [
  {
    id: "EVT-2024-88842",
    department: "Finance",
    type: "Payment",
    title: "Unusual Login Pattern",
    description: "Five consecutive failed login attempts detected from IP 192.168.1.x within 2 minutes, which deviates from normal authentication patterns.",
    normalBehavior: "User typically logs in once per day from IP 10.0.0.x with 100% success rate",
    severity: "High",
    riskScore: 92,
    amount: 4700000,
    status: "New",
    time: "2 min ago",
    source: "auth-monitor",
    featureImportance: [
      { feature: "Login Frequency", value: "5× in 2 min", multiplier: 5.0 },
      { feature: "IP Deviation", value: "New subnet", multiplier: 3.2 },
    ],
  },
  {
    id: "EVT-2024-88841",
    department: "Procurement",
    type: "Procurement",
    title: "High Transaction Amount",
    description: "Transaction amount 4.7× above department average for this vendor category.",
    normalBehavior: "Average procurement transaction is ₹2.1L for this category",
    severity: "Medium",
    riskScore: 77,
    amount: 1250000,
    status: "Under Review",
    time: "8 min ago",
    source: "procurement-pipeline",
    featureImportance: [
      { feature: "Amount", value: "₹12,50,000", multiplier: 4.7 },
      { feature: "Vendor Repeat", value: "3× this month", multiplier: 3.0 },
    ],
  },
  {
    id: "EVT-2024-88648",
    department: "Welfare",
    type: "Welfare",
    title: "Geographic Anomaly",
    description: "Beneficiary claim submitted from location 800km away from registered address.",
    normalBehavior: "All previous claims submitted within 50km of registered address",
    severity: "Medium",
    riskScore: 65,
    amount: 85000,
    status: "Under Review",
    time: "15 min ago",
    source: "welfare-system",
    featureImportance: [
      { feature: "Location Deviation", value: "800km", multiplier: 4.2 },
      { feature: "Claim Frequency", value: "2× normal", multiplier: 2.0 },
    ],
  },
  {
    id: "EVT-2024-88639",
    department: "HR",
    type: "Payment",
    title: "API Usage Spike",
    description: "API call volume 8× above baseline — possible automated scraping or credential stuffing.",
    normalBehavior: "Average 120 API calls/hour from this account",
    severity: "Low",
    riskScore: 35,
    amount: 0,
    status: "Dismissed",
    time: "41 min ago",
    source: "api-gateway",
    featureImportance: [
      { feature: "API Rate", value: "960 calls/hr", multiplier: 8.0 },
    ],
  },
  {
    id: "EVT-2024-88638",
    department: "Finance",
    type: "Procurement",
    title: "Normal Activity",
    description: "Transaction flagged by rule engine but confirmed within normal parameters after review.",
    normalBehavior: "Consistent with historical patterns",
    severity: "Low",
    riskScore: 5,
    amount: 32000,
    status: "Dismissed",
    time: "1 hr ago",
    source: "rule-engine",
    featureImportance: [],
  },
  {
    id: "EVT-2024-88637",
    department: "Finance",
    type: "Payment",
    title: "Bulk Transfer Detected",
    description: "14 payments totalling ₹58L sent to same account within 6 minutes — threshold avoidance pattern.",
    normalBehavior: "Single transfers averaging ₹4.1L with 24hr gaps",
    severity: "High",
    riskScore: 88,
    amount: 5800000,
    status: "New",
    time: "1.5 hr ago",
    source: "payment-monitor",
    featureImportance: [
      { feature: "Transfer Count", value: "14 in 6 min", multiplier: 7.0 },
      { feature: "Threshold Proximity", value: "₹49,800 avg", multiplier: 3.2 },
      { feature: "Amount Total", value: "₹58,00,000", multiplier: 4.1 },
    ],
  },
  {
    id: "EVT-2024-88601",
    department: "Procurement",
    type: "Procurement",
    title: "Vendor Concentration Risk",
    description: "Single vendor accounts for 71% of recent procurement spend — concentration risk.",
    normalBehavior: "No single vendor exceeds 25% of category spend",
    severity: "Medium",
    riskScore: 71,
    amount: 3200000,
    status: "Under Review",
    time: "2 hr ago",
    source: "procurement-pipeline",
    featureImportance: [
      { feature: "Vendor Share", value: "71%", multiplier: 6.8 },
      { feature: "Amount", value: "₹32,00,000", multiplier: 2.1 },
    ],
  },
  {
    id: "EVT-2024-88590",
    department: "Welfare",
    type: "Welfare",
    title: "Duplicate Beneficiary",
    description: "Same beneficiary registered with 3 slight name variations across different schemes.",
    normalBehavior: "Each beneficiary should appear once per scheme",
    severity: "High",
    riskScore: 89,
    amount: 255000,
    status: "New",
    time: "3 hr ago",
    source: "welfare-system",
    featureImportance: [
      { feature: "Name Similarity", value: "94%", multiplier: 9.4 },
      { feature: "Address Match", value: "100%", multiplier: 10.0 },
    ],
  },
  {
    id: "EVT-2024-88571",
    department: "HR",
    type: "HR",
    title: "Ghost Employee Detected",
    description: "Salary disbursed to employee ID with no attendance records for 3 consecutive months.",
    normalBehavior: "All active employees have at least 18 attendance days per month",
    severity: "High",
    riskScore: 94,
    amount: 720000,
    status: "New",
    time: "3.5 hr ago",
    source: "hr-payroll",
    featureImportance: [
      { feature: "Attendance Days", value: "0 days", multiplier: 0.0 },
      { feature: "Salary Amount", value: "₹2,40,000/mo", multiplier: 1.2 },
    ],
  },
  {
    id: "EVT-2024-88543",
    department: "Finance",
    type: "Payment",
    title: "Round Number Structuring",
    description: "38 transactions of exactly ₹49,000 over 4 days — just below ₹50,000 approval threshold.",
    normalBehavior: "Transactions vary between ₹12,000–₹85,000 with no clustering",
    severity: "High",
    riskScore: 91,
    amount: 1862000,
    status: "Under Review",
    time: "4 hr ago",
    source: "payment-monitor",
    featureImportance: [
      { feature: "Threshold Proximity", value: "₹49,000 avg", multiplier: 9.8 },
      { feature: "Transaction Count", value: "38 in 4 days", multiplier: 5.4 },
      { feature: "Round Number Rate", value: "100%", multiplier: 10.0 },
    ],
  },
  {
    id: "EVT-2024-88512",
    department: "Procurement",
    type: "Procurement",
    title: "Split Purchase Order",
    description: "Single procurement need split into 6 POs to avoid tender requirement above ₹5L.",
    normalBehavior: "Similar requirements processed as single PO with tender",
    severity: "High",
    riskScore: 86,
    amount: 2940000,
    status: "New",
    time: "5 hr ago",
    source: "procurement-pipeline",
    featureImportance: [
      { feature: "PO Split Count", value: "6 POs", multiplier: 6.0 },
      { feature: "Total Value", value: "₹29,40,000", multiplier: 5.9 },
      { feature: "Vendor", value: "Same vendor", multiplier: 8.0 },
    ],
  },
  {
    id: "EVT-2024-88489",
    department: "Welfare",
    type: "Welfare",
    title: "Deceased Beneficiary Payment",
    description: "Pension payment processed for beneficiary whose death was registered 4 months ago.",
    normalBehavior: "Payments should cease within 30 days of death registration",
    severity: "High",
    riskScore: 97,
    amount: 48000,
    status: "New",
    time: "6 hr ago",
    source: "welfare-system",
    featureImportance: [
      { feature: "Death Registration", value: "4 months ago", multiplier: 10.0 },
      { feature: "Payments After Death", value: "4 payments", multiplier: 10.0 },
    ],
  },
  {
    id: "EVT-2024-88461",
    department: "HR",
    type: "HR",
    title: "Overtime Anomaly",
    description: "Employee claimed 312 overtime hours in a single month — physically impossible.",
    normalBehavior: "Maximum possible overtime is 120 hours/month per policy",
    severity: "High",
    riskScore: 99,
    amount: 156000,
    status: "Under Review",
    time: "7 hr ago",
    source: "hr-payroll",
    featureImportance: [
      { feature: "Overtime Hours", value: "312 hrs", multiplier: 2.6 },
      { feature: "Policy Max", value: "120 hrs", multiplier: 1.0 },
    ],
  },
  {
    id: "EVT-2024-88430",
    department: "Finance",
    type: "Payment",
    title: "Dormant Account Reactivated",
    description: "Account inactive for 2 years suddenly received ₹18L transfer and was immediately emptied.",
    normalBehavior: "Dormant accounts require manual reactivation with KYC verification",
    severity: "High",
    riskScore: 95,
    amount: 1800000,
    status: "New",
    time: "8 hr ago",
    source: "payment-monitor",
    featureImportance: [
      { feature: "Dormancy Period", value: "2 years", multiplier: 8.0 },
      { feature: "Withdrawal Speed", value: "< 1 hour", multiplier: 9.5 },
      { feature: "Amount", value: "₹18,00,000", multiplier: 4.3 },
    ],
  },
  {
    id: "EVT-2024-88401",
    department: "Procurement",
    type: "Procurement",
    title: "Inflated Invoice",
    description: "Vendor invoice 340% above market rate for standard office supplies.",
    normalBehavior: "Market rate for this category is ₹850–₹1,200 per unit",
    severity: "Medium",
    riskScore: 74,
    amount: 425000,
    status: "Under Review",
    time: "9 hr ago",
    source: "procurement-pipeline",
    featureImportance: [
      { feature: "Price Deviation", value: "+340%", multiplier: 4.4 },
      { feature: "Market Rate", value: "₹1,050 avg", multiplier: 1.0 },
    ],
  },
  {
    id: "EVT-2024-88372",
    department: "Welfare",
    type: "Welfare",
    title: "Multiple Scheme Overlap",
    description: "Beneficiary enrolled in 4 mutually exclusive welfare schemes simultaneously.",
    normalBehavior: "Each beneficiary eligible for maximum 1 scheme per category",
    severity: "Medium",
    riskScore: 68,
    amount: 192000,
    status: "Under Review",
    time: "10 hr ago",
    source: "welfare-system",
    featureImportance: [
      { feature: "Scheme Count", value: "4 schemes", multiplier: 4.0 },
      { feature: "Overlap Type", value: "Mutually exclusive", multiplier: 8.0 },
    ],
  },
  {
    id: "EVT-2024-88341",
    department: "Finance",
    type: "Payment",
    title: "Weekend Large Transfer",
    description: "₹42L transfer initiated on Sunday at 11:47 PM without weekend authorization code.",
    normalBehavior: "Large transfers on weekends require dual authorization",
    severity: "Medium",
    riskScore: 62,
    amount: 4200000,
    status: "Approved",
    time: "Yesterday",
    source: "payment-monitor",
    featureImportance: [
      { feature: "Day/Time", value: "Sun 11:47 PM", multiplier: 3.5 },
      { feature: "Auth Code", value: "Missing", multiplier: 5.0 },
    ],
  },
  {
    id: "EVT-2024-88310",
    department: "HR",
    type: "HR",
    title: "Salary Advance Abuse",
    description: "Employee requested maximum salary advance 11 times in 12 months.",
    normalBehavior: "Policy allows maximum 2 salary advances per year",
    severity: "Low",
    riskScore: 44,
    amount: 330000,
    status: "Dismissed",
    time: "Yesterday",
    source: "hr-payroll",
    featureImportance: [
      { feature: "Advance Count", value: "11 in 12 months", multiplier: 5.5 },
      { feature: "Policy Limit", value: "2 per year", multiplier: 1.0 },
    ],
  },
];

// Live pool — new cases get prepended here
const livePool: CaseEvent[] = [
  {
    id: "EVT-2026-10021",
    department: "Finance",
    type: "Payment",
    title: "Cross-Border Transfer Spike",
    description: "Sudden spike in cross-border transfers to previously unseen accounts in 3 countries.",
    normalBehavior: "No international transfers in past 6 months",
    severity: "High",
    riskScore: 93,
    amount: 8500000,
    status: "New",
    time: "just now",
    source: "payment-monitor",
    featureImportance: [
      { feature: "New Countries", value: "3 new destinations", multiplier: 9.0 },
      { feature: "Amount", value: "₹85,00,000", multiplier: 5.1 },
    ],
  },
  {
    id: "EVT-2026-10019",
    department: "Procurement",
    type: "Procurement",
    title: "Fictitious Vendor Registration",
    description: "Vendor registered with address matching a residential plot — no business premises.",
    normalBehavior: "All vendors should have verified commercial addresses",
    severity: "High",
    riskScore: 88,
    amount: 650000,
    status: "New",
    time: "just now",
    source: "vendor-registry",
    featureImportance: [
      { feature: "Address Type", value: "Residential", multiplier: 8.0 },
      { feature: "GST Verification", value: "Failed", multiplier: 9.0 },
    ],
  },
  {
    id: "EVT-2026-10017",
    department: "Welfare",
    type: "Welfare",
    title: "Mass Beneficiary Update",
    description: "Bank account details changed for 847 beneficiaries in a single batch by one operator.",
    normalBehavior: "Bulk updates require supervisor approval above 50 records",
    severity: "High",
    riskScore: 96,
    amount: 4235000,
    status: "New",
    time: "just now",
    source: "welfare-system",
    featureImportance: [
      { feature: "Records Changed", value: "847 in one batch", multiplier: 16.9 },
      { feature: "Approval", value: "Missing", multiplier: 10.0 },
    ],
  },
  {
    id: "EVT-2026-10015",
    department: "HR",
    type: "HR",
    title: "Backdated Salary Revision",
    description: "Salary revision backdated 18 months resulting in ₹12L arrear payment.",
    normalBehavior: "Backdating allowed maximum 3 months per policy",
    severity: "Medium",
    riskScore: 73,
    amount: 1200000,
    status: "New",
    time: "just now",
    source: "hr-payroll",
    featureImportance: [
      { feature: "Backdating Period", value: "18 months", multiplier: 6.0 },
      { feature: "Arrear Amount", value: "₹12,00,000", multiplier: 3.0 },
    ],
  },
  {
    id: "EVT-2026-10013",
    department: "Finance",
    type: "Payment",
    title: "Rapid Account Cycling",
    description: "Funds transferred through 7 internal accounts within 90 seconds — layering pattern.",
    normalBehavior: "Inter-account transfers settle within 24 hours with audit trail",
    severity: "High",
    riskScore: 97,
    amount: 2300000,
    status: "New",
    time: "just now",
    source: "payment-monitor",
    featureImportance: [
      { feature: "Account Hops", value: "7 accounts", multiplier: 7.0 },
      { feature: "Time Span", value: "90 seconds", multiplier: 9.5 },
    ],
  },
  {
    id: "EVT-2026-10011",
    department: "Procurement",
    type: "Procurement",
    title: "Sole Source Justification Abuse",
    description: "Same vendor awarded 9 sole-source contracts in 6 months totalling ₹1.8Cr.",
    normalBehavior: "Sole-source contracts require fresh justification each time",
    severity: "High",
    riskScore: 85,
    amount: 18000000,
    status: "New",
    time: "just now",
    source: "procurement-pipeline",
    featureImportance: [
      { feature: "Contract Count", value: "9 sole-source", multiplier: 9.0 },
      { feature: "Total Value", value: "₹1.8 Cr", multiplier: 6.0 },
    ],
  },
];

// In-memory live cases list — starts empty, gets populated over time
const liveCases: CaseEvent[] = [];
let livePoolIndex = 0;
let lastInjectTime = Date.now();

// Inject a new case every 20–40 seconds
function maybeInjectNewCase() {
  const now = Date.now();
  const elapsed = now - lastInjectTime;
  const interval = 20000 + Math.random() * 20000; // 20–40s

  if (elapsed >= interval && livePoolIndex < livePool.length) {
    const newCase = {
      ...livePool[livePoolIndex],
      time: "just now",
    };
    liveCases.unshift(newCase);
    livePoolIndex++;
    lastInjectTime = now;
  }
}

// Age the "just now" / "X min ago" labels
function ageLabel(injectedAt: number): string {
  const mins = Math.floor((Date.now() - injectedAt) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

// Track inject times for live cases
const liveInjectTimes: Map<string, number> = new Map();

export const handleDetectionEvents: RequestHandler = (req, res) => {
  maybeInjectNewCase();

  // Track inject times for newly added live cases
  for (const c of liveCases) {
    if (!liveInjectTimes.has(c.id)) {
      liveInjectTimes.set(c.id, Date.now());
    }
  }

  const { severity, department, status } = req.query;

  // Combine live (newest first) + seed cases
  const allEvents: CaseEvent[] = [
    ...liveCases.map(c => ({
      ...c,
      time: ageLabel(liveInjectTimes.get(c.id) ?? Date.now()),
    })),
    ...seedCases,
  ];

  let events = allEvents;
  if (severity && severity !== "All") events = events.filter(e => e.severity === severity);
  if (department && department !== "All") events = events.filter(e => e.department === department);
  if (status && status !== "All Cases") events = events.filter(e => e.status === status);

  res.json({ events, total: events.length });
};

export const handleIngestCases: RequestHandler = (req, res) => {
  const { cases, source } = req.body as { cases: any[]; source: string };
  if (!Array.isArray(cases) || cases.length === 0) {
    return res.status(400).json({ error: "No cases provided" });
  }

  const depts: CaseEvent["department"][] = ["Finance", "Procurement", "Welfare", "HR"];
  let injected = 0;

  for (const c of cases) {
    const id = `EVT-UPLOAD-${Date.now()}-${injected}`;
    const newCase: CaseEvent = {
      id,
      department: c.department ?? depts[injected % depts.length],
      type: c.type ?? "ML Anomaly",
      title: c.description?.slice(0, 60) ?? "Uploaded Anomaly",
      description: c.description ?? "Anomaly detected via document upload",
      normalBehavior: "Baseline derived from historical data",
      severity: c.severity ?? "Medium",
      riskScore: c.riskScore ?? 50,
      amount: c.amount ?? 0,
      status: "New",
      time: "just now",
      source: source ?? "upload",
      featureImportance: c.featureImportance ?? [],
    };
    liveCases.unshift(newCase);
    liveInjectTimes.set(id, Date.now());
    injected++;
  }

  res.json({ success: true, injected });
};

export const handleDetectionEventDetails: RequestHandler = (req, res) => {
  const { id } = req.params;
  const all = [...liveCases, ...seedCases];
  const event = all.find(e => e.id === id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ event });
};
