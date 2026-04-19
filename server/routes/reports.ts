import { RequestHandler } from "express";
import { ReportsResponse, GenerateReportResponse, GenerateReportRequest } from "@shared/api";

const recentReports = [
  {
    id: "RPT-2024-001",
    title: "Weekly Fraud Detection Report",
    type: "COMPREHENSIVE",
    dateRange: "Dec 10 - Dec 16, 2024",
    fileSize: "2.4 MB",
    status: "Completed",
    createdAt: "2024-12-16T10:30:00Z",
  },
  {
    id: "RPT-2024-002",
    title: "Daily Anomaly Summary",
    type: "DAILY",
    dateRange: "Dec 17, 2024",
    fileSize: "856 KB",
    status: "Completed",
    createdAt: "2024-12-17T08:00:00Z",
  },
  {
    id: "RPT-2024-003",
    title: "Monthly Compliance Report",
    type: "COMPLIANCE",
    dateRange: "November 2024",
    fileSize: "5.2 MB",
    status: "Completed",
    createdAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "RPT-2024-004",
    title: "System Performance Analysis",
    type: "PERFORMANCE",
    dateRange: "Last 30 Days",
    fileSize: "1.8 MB",
    status: "Completed",
    createdAt: "2024-12-15T14:20:00Z",
  },
  {
    id: "RPT-2024-005",
    title: "Risk Assessment Report",
    type: "RISK ANALYSIS",
    dateRange: "Dec 1 - Dec 16, 2024",
    fileSize: "3.1 MB",
    status: "Completed",
    createdAt: "2024-12-16T16:45:00Z",
  },
  {
    id: "RPT-2024-006",
    title: "Executive Summary",
    type: "EXECUTIVE",
    dateRange: "Q4 2024",
    fileSize: "1.2 MB",
    status: "Completed",
    createdAt: "2024-12-10T11:00:00Z",
  },
];

export const handleReports: RequestHandler = (req, res) => {
  const response: ReportsResponse = {
    reports: recentReports,
    stats: {
      weeklyReports: 4,
      dailyReports: 30,
      monthlyReports: 3,
      customReports: 12,
    },
  };

  res.status(200).json(response);
};

export const handleGenerateReport: RequestHandler = async (req, res) => {
  const { reportType, dateRange, format } = req.body as GenerateReportRequest;

  // Validate request
  if (!reportType || !dateRange || !format) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: reportType, dateRange, format",
    });
  }

  // Simulate report generation processing (2-3 seconds)
  const processingTime = 2000 + Math.random() * 1000; // 2-3 seconds
  await new Promise(resolve => setTimeout(resolve, processingTime));

  // Generate a new report ID
  const reportId = `RPT-2024-${String(recentReports.length + 1).padStart(3, "0")}`;

  const response: GenerateReportResponse = {
    success: true,
    reportId,
    message: `Report ${reportId} generated successfully`,
  };

  res.status(200).json(response);
};

export const handleDownloadReport: RequestHandler = (req, res) => {
  const { id } = req.params;

  const report = recentReports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  // In a real app, this would stream the actual file
  res.status(200).json({
    success: true,
    message: `Download initiated for ${report.title}`,
    report,
  });
};
