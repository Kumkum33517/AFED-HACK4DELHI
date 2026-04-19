import { RequestHandler } from "express";
import { db } from "../db";

export const handleGetThresholds: RequestHandler = (_req, res) => {
  res.json({ thresholds: db.thresholds });
};

export const handleSaveThresholds: RequestHandler = (req, res) => {
  const { thresholds } = req.body;
  if (!Array.isArray(thresholds)) {
    return res.status(400).json({ error: "Invalid thresholds" });
  }
  db.saveThresholds(thresholds);
  db.addAuditLog({
    action: "Updated alert thresholds",
    target: "Settings",
    user: req.body.user || "Admin",
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
};

export const handleGetAuditLog: RequestHandler = (_req, res) => {
  res.json({ log: db.auditLog });
};
