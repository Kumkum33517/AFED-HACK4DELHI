import { RequestHandler } from "express";
import { DashboardResponse } from "@shared/api";

function addFluctuation(baseValue: number, variationPercent: number = 2): number {
  const variation = baseValue * (variationPercent / 100);
  const randomChange = (Math.random() - 0.5) * 2 * variation;
  return Math.round(baseValue + randomChange);
}

function fluctuateChartData(baseData: Array<{ time: string; normal: number; anomalies: number }>) {
  return baseData.map(point => ({
    time: point.time,
    normal: addFluctuation(point.normal, 3),
    anomalies: addFluctuation(point.anomalies, 5),
  }));
}

export const handleDashboard: RequestHandler = (_req, res) => {
  const totalEvents = addFluctuation(2847392, 1);
  const anomalies = addFluctuation(342, 3);
  const eventsAnalyzed = addFluctuation(156847, 2);
  const riskScore = addFluctuation(65, 5);

  const response: DashboardResponse = {
    stats: {
      totalEvents: totalEvents.toLocaleString(),
      anomalies: anomalies.toString(),
      eventsAnalyzed: eventsAnalyzed.toLocaleString(),
      processingRate: `${addFluctuation(45231, 2).toLocaleString()}/sec`,
      detectionAccuracy: `${(98.5 + (Math.random() - 0.5) * 0.4).toFixed(1)}%`,
      avgResponseTime: `${124 + Math.floor((Math.random() - 0.5) * 20)}ms`,
      riskScore: Math.min(Math.max(riskScore, 50), 80),
      activeAlerts: addFluctuation(24, 8),
      mediumRisk: addFluctuation(12, 10),
      highRisk: addFluctuation(3, 15),
    },
    eventsOverTime: fluctuateChartData([
      { time: "02:00", normal: 1200, anomalies: 240 },
      { time: "04:00", normal: 1900, anomalies: 221 },
      { time: "06:00", normal: 2100, anomalies: 229 },
      { time: "08:00", normal: 2200, anomalies: 200 },
      { time: "10:00", normal: 2290, anomalies: 260 },
      { time: "12:00", normal: 2000, anomalies: 248 },
      { time: "14:00", normal: 2181, anomalies: 220 },
      { time: "16:00", normal: 2500, anomalies: 210 },
      { time: "18:00", normal: 2100, anomalies: 229 },
      { time: "20:00", normal: 2100, anomalies: 200 },
      { time: "22:00", normal: 2800, anomalies: 250 },
    ]),
    recentEvents: [
      { id: 1, title: "Transaction processed", time: `${Math.floor(Math.random() * 5) + 1} minutes ago` },
      { id: 2, title: "Procurement record ingested", time: `${Math.floor(Math.random() * 10) + 3} minutes ago` },
      { id: 3, title: "Batch processing completed", time: `${Math.floor(Math.random() * 15) + 10} minutes ago` },
      { id: 4, title: "Data validation passed", time: `${Math.floor(Math.random() * 20) + 15} minutes ago` },
    ],
    recentAlerts: [
      { id: 1, title: "High-risk anomaly detected", time: `${Math.floor(Math.random() * 3) + 1} minute ago` },
      { id: 2, title: "Repeated vendor pattern flagged", time: `${Math.floor(Math.random() * 10) + 5} minutes ago` },
      { id: 3, title: "Processing rate spike detected", time: `${Math.floor(Math.random() * 15) + 10} minutes ago` },
      { id: 4, title: "Unusual transaction volume", time: `${Math.floor(Math.random() * 20) + 20} minutes ago` },
    ],
    systemHealth: [
      {
        name: "Detection Engine",
        status: "Operational",
        lastChecked: `${Math.floor(Math.random() * 3) + 1} min ago`,
        icon: "Activity",
        color: "text-afed-cyan",
      },
      {
        name: "Data Pipeline",
        status: "Healthy",
        lastChecked: `${Math.floor(Math.random() * 2) + 1} min ago`,
        icon: "CheckCircle",
        color: "text-green-500",
      },
      {
        name: "API Services",
        status: "Responding",
        lastChecked: `${Math.floor(Math.random() * 60) + 20} sec ago`,
        icon: "Clock",
        color: "text-yellow-500",
      },
    ],
  };

  res.status(200).json(response);
};
