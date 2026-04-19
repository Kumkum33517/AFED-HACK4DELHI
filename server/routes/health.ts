import { RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const handleHealthCheck: RequestHandler = async (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      api: "operational",
      python: "checking...",
    },
  };

  // Check if Python is available
  try {
    await execAsync("python3 --version");
    health.services.python = "operational";
  } catch (error) {
    health.services.python = "unavailable";
    health.status = "degraded";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(health);
};

export const handleReadiness: RequestHandler = (req, res) => {
  // Check if server is ready to accept requests
  const ready = {
    ready: true,
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(ready);
};

export const handleLiveness: RequestHandler = (req, res) => {
  // Simple liveness check
  res.status(200).json({ alive: true });
};
