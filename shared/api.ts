/**
 * Shared types between client and server
 */

export interface DemoResponse {
  message: string;
}

// Dashboard types
export interface DashboardStats {
  totalEvents: string;
  anomalies: string;
  eventsAnalyzed: string;
  processingRate: string;
  detectionAccuracy: string;
  avgResponseTime: string;
  riskScore: number;
  activeAlerts: number;
  mediumRisk: number;
  highRisk: number;
}

export interface DashboardEvent {
  id: number;
  title: string;
  time: string;
}

export interface DashboardAlert {
  id: number;
  title: string;
  time: string;
}

export interface SystemHealthItem {
  name: string;
  status: string;
  lastChecked: string;
  icon: string;
  color: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  eventsOverTime: Array<{ time: string; normal: number; anomalies: number }>;
  recentEvents: DashboardEvent[];
  recentAlerts: DashboardAlert[];
  systemHealth: SystemHealthItem[];
}

// Detection types
export interface DetectionEvent {
  id: string;
  title: string;
  type: string;
  severity: "High" | "Medium" | "Low";
  status: string;
  time: string;
  description: string;
  riskScore: number;
}

export interface DetectionResponse {
  events: DetectionEvent[];
  total: number;
}

// Upload / Analysis types
export interface DocumentAnalysisResult {
  documentId: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: "analyzing" | "completed" | "failed";
  analysis: {
    totalRecords: number;
    anomaliesDetected: number;
    riskScore: number;
    highRiskItems: number;
    mediumRiskItems: number;
    lowRiskItems: number;
    processingTime: string;
  };
  findings: Array<{
    id: string;
    type: string;
    severity: "High" | "Medium" | "Low";
    description: string;
    affectedRecords: number;
    recommendation: string;
  }>;
  summary: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  documentId: string;
  message: string;
  analysisResult?: DocumentAnalysisResult;
}

// Reports types
export interface ReportItem {
  id: string;
  title: string;
  type: string;
  dateRange: string;
  fileSize: string;
  status: string;
  createdAt: string;
}

export interface ReportsResponse {
  reports: ReportItem[];
  stats: {
    weeklyReports: number;
    dailyReports: number;
    monthlyReports: number;
    customReports: number;
  };
}

export interface GenerateReportRequest {
  reportType: string;
  dateRange: string;
  format: string;
}

export interface GenerateReportResponse {
  success: boolean;
  reportId: string;
  message: string;
}
