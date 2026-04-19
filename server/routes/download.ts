import { RequestHandler } from "express";
import ExcelJS from "exceljs";

// In-memory store keyed by reportId — populated when upload analysis completes
export const reportStore = new Map<string, { fileName: string; rows: any[] }>();

export const handleDownloadReport: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const stored = reportStore.get(id);

  if (!stored || stored.rows.length === 0) {
    return res.status(404).json({ error: "Report not found or has no rows" });
  }

  const { fileName, rows } = stored;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Anomaly Report");

  // Header row
  ws.columns = [
    { header: "Row #",        key: "row",         width: 8  },
    { header: "Risk Score",   key: "riskScore",   width: 12 },
    { header: "Severity",     key: "severity",    width: 12 },
    { header: "Description",  key: "description", width: 60 },
    { header: "Amount (₹)",   key: "amount",      width: 16 },
    { header: "Top Feature",  key: "feature",     width: 20 },
    { header: "Value",        key: "value",       width: 16 },
    { header: "Multiplier",   key: "multiplier",  width: 12 },
  ];

  // Style header
  ws.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Data rows
  for (const r of rows) {
    const top = r.feature_importance?.[0];
    const row = ws.addRow({
      row:         r.row,
      riskScore:   r.risk_score,
      severity:    r.severity,
      description: r.description,
      amount:      r.amount ?? 0,
      feature:     top?.feature ?? "",
      value:       top?.value ?? "",
      multiplier:  top?.multiplier ?? "",
    });

    // Colour by severity
    const bg =
      r.severity === "High"   ? "FFFEE2E2" :   // red-100
      r.severity === "Medium" ? "FFFEF9C3" :   // yellow-100
                                "FFF0FDF4";    // green-100

    const accent =
      r.severity === "High"   ? "FFEF4444" :
      r.severity === "Medium" ? "FFCA8A04" :
                                "FF16A34A";

    row.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
    });

    // Bold the risk score cell and colour it
    const scoreCell = row.getCell("riskScore");
    scoreCell.font = { bold: true, color: { argb: accent } };

    const sevCell = row.getCell("severity");
    sevCell.font = { bold: true, color: { argb: accent } };
  }

  ws.autoFilter = { from: "A1", to: "H1" };

  const baseName = fileName.replace(/\.[^.]+$/, "");
  const outName = `${baseName}_anomalies.xlsx`;

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${outName}"`);

  await wb.xlsx.write(res);
  res.end();
};
