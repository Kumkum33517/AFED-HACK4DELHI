import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleDashboard } from "./routes/dashboard";
import { handleDetectionEvents, handleDetectionEventDetails, handleIngestCases } from "./routes/detection";
import { handleUploadDocument } from "./routes/upload";
import { handleReports, handleGenerateReport, handleDownloadReport } from "./routes/reports";
import { handleHealthCheck, handleReadiness, handleLiveness } from "./routes/health";
import { handleDownloadReport as handleDownloadAnalysis } from "./routes/download";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));

  // Health
  app.get("/api/health", handleHealthCheck);
  app.get("/api/ready", handleReadiness);
  app.get("/api/live", handleLiveness);

  app.get("/api/ping", (_req, res) => res.json({ message: process.env.PING_MESSAGE ?? "ping" }));
  app.get("/api/demo", handleDemo);

  // Dashboard
  app.get("/api/dashboard", handleDashboard);

  // Detection
  app.get("/api/detection/events", handleDetectionEvents);
  app.get("/api/detection/events/:id", handleDetectionEventDetails);
  app.post("/api/detection/ingest", handleIngestCases);

  // Reports
  app.get("/api/reports", handleReports);
  app.post("/api/reports/generate", handleGenerateReport);
  app.get("/api/reports/:id/download", handleDownloadReport);
  app.get("/api/download/:id", handleDownloadAnalysis);

  // Upload
  app.post("/api/upload/analyze", handleUploadDocument);

  return app;
}
