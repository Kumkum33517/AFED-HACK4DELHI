#!/usr/bin/env python3
"""
AFED Anomaly Detector — Isolation Forest on real uploaded data
Outputs JSON to stdout, progress to stderr
"""

import sys
import json
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def progress(stage, msg):
    print(json.dumps({"stage": stage, "message": msg}), file=sys.stderr, flush=True)

def severity_from_score(norm_score, contamination_rate):
    """
    Severity depends on both the anomaly score AND how anomalous the dataset is overall.
    In a clean dataset, even the 'worst' rows shouldn't all be High.
    """
    # Scale thresholds based on contamination — higher contamination = more lenient High threshold
    high_threshold = 75 + (contamination_rate * 50)   # 75 at 0% → 87.5 at 25%
    med_threshold  = 45 + (contamination_rate * 30)   # 45 at 0% → 52.5 at 25%
    if norm_score >= high_threshold:
        return "High"
    elif norm_score >= med_threshold:
        return "Medium"
    return "Low"

def detect_fraud_patterns(df, numeric_cols):
    """Rule-based fraud pattern detection on top of ML"""
    patterns = []

    amount_cols = [c for c in numeric_cols if any(k in c.lower() for k in ["amount", "price", "value", "cost", "total", "sum"])]

    for col in amount_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue

        # Round number bias
        round_count = int((series % 1000 == 0).sum())
        if round_count > len(series) * 0.3:
            patterns.append({
                "type": "Round Number Bias",
                "severity": "Medium",
                "description": f"{round_count} of {len(series)} values in '{col}' are exact round numbers — common in fabricated data",
                "affected_records": round_count,
                "recommendation": "Investigate for manually entered or fabricated transactions."
            })

        # Threshold avoidance
        for threshold in [10000, 50000, 100000, 500000, 1000000]:
            just_below = int(((series >= threshold * 0.95) & (series < threshold)).sum())
            if just_below > len(series) * 0.05:
                patterns.append({
                    "type": "Threshold Avoidance",
                    "severity": "High",
                    "description": f"{just_below} transactions in '{col}' are just below {threshold:,} — possible structuring",
                    "affected_records": just_below,
                    "recommendation": "Review for deliberate splitting to avoid approval thresholds."
                })

        # Repeated exact amounts
        top_val = series.value_counts().iloc[0] if len(series) > 0 else 0
        if top_val > len(series) * 0.08:
            patterns.append({
                "type": "Repeated Exact Amounts",
                "severity": "Medium",
                "description": f"Amount {series.value_counts().index[0]:,.2f} appears {top_val} times in '{col}'",
                "affected_records": int(top_val),
                "recommendation": "Investigate repeated identical amounts — may indicate template fraud."
            })

    # Duplicate rows
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        patterns.append({
            "type": "Duplicate Records",
            "severity": "High" if dup_count / len(df) > 0.05 else "Medium",
            "description": f"{dup_count} fully duplicate rows found ({dup_count/len(df)*100:.1f}% of data)",
            "affected_records": dup_count,
            "recommendation": "Remove duplicates and investigate data entry process."
        })

    return patterns

def analyze(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    progress("parsing", "Reading file...")
    try:
        if ext == ".csv":
            df = pd.read_csv(file_path)
        elif ext in (".xlsx", ".xls"):
            df = pd.read_excel(file_path)
        else:
            return {"success": False, "error": f"Unsupported format: {ext}"}
    except Exception as e:
        return {"success": False, "error": f"Could not read file: {e}"}

    total_records = len(df)
    if total_records == 0:
        return {"success": False, "error": "File is empty"}

    progress("normalising", f"Normalising {total_records} rows across {len(df.columns)} columns...")

    # Select numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    if len(numeric_cols) == 0:
        return {
            "success": True,
            "total_records": total_records,
            "anomalies_detected": 0,
            "risk_score": 0,
            "high_risk_items": 0,
            "medium_risk_items": 0,
            "low_risk_items": 0,
            "numeric_columns_analyzed": [],
            "findings": [],
            "row_results": [],
            "anomaly_indices": [],
            "summary": "No numeric columns found — only structural checks performed."
        }

    # Fill missing with median
    X = df[numeric_cols].fillna(df[numeric_cols].median())

    progress("running_ml", f"Running Isolation Forest on {len(numeric_cols)} features...")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Adaptive contamination based on actual data spread
    # Use IQR-based outlier estimate to set contamination dynamically
    from scipy.stats import iqr as scipy_iqr
    try:
        iqr_outlier_fracs = []
        for col in numeric_cols:
            q1, q3 = np.percentile(X[:, numeric_cols.index(col)], [25, 75])
            iq = q3 - q1
            if iq > 0:
                outliers = np.sum((X[:, numeric_cols.index(col)] < q1 - 1.5 * iq) |
                                  (X[:, numeric_cols.index(col)] > q3 + 1.5 * iq))
                iqr_outlier_fracs.append(outliers / len(X))
        estimated = float(np.median(iqr_outlier_fracs)) if iqr_outlier_fracs else 0.10
        contamination = float(min(0.25, max(0.03, estimated)))
    except Exception:
        contamination = 0.10

    # Use a seed derived from the data itself so same file = same result,
    # but different files = different results
    data_seed = int(abs(hash(str(X_scaled[:5].tolist()))) % (2**31))

    model = IsolationForest(
        contamination=contamination,
        n_estimators=200,
        random_state=data_seed,
        n_jobs=-1
    )
    predictions = model.fit_predict(X_scaled)
    raw_scores = model.score_samples(X_scaled)  # More negative = more anomalous

    # Normalise scores to 0-100 (100 = most anomalous)
    min_s, max_s = raw_scores.min(), raw_scores.max()
    if max_s > min_s:
        norm_scores = ((raw_scores - max_s) / (min_s - max_s)) * 100
    else:
        norm_scores = np.zeros(len(raw_scores))

    df["_anomaly"] = predictions
    df["_score"] = norm_scores

    anomaly_mask = predictions == -1
    anomalies_df = df[anomaly_mask].copy()
    anomalies_detected = int(anomaly_mask.sum())

    # Severity counts
    high_risk = int((anomalies_df["_score"] >= (75 + contamination * 50)).sum())
    medium_risk = int(((anomalies_df["_score"] >= (45 + contamination * 30)) & (anomalies_df["_score"] < (75 + contamination * 50))).sum())
    low_risk = anomalies_detected - high_risk - medium_risk

    # Risk score: weighted blend of anomaly rate + severity mix, capped at 100
    # A clean file with only low-risk anomalies should score low
    severity_weight = (high_risk * 3 + medium_risk * 1.5 + low_risk * 0.5)
    risk_score = min(int((anomalies_detected / total_records) * 60 + (severity_weight / max(anomalies_detected, 1)) * 15), 100)

    progress("analysing", "Analysing feature deviations and fraud patterns...")

    # Per-column stats for normal rows
    normal_df = df[~anomaly_mask]
    col_stats = {}
    for col in numeric_cols:
        col_stats[col] = {
            "mean": float(normal_df[col].mean()) if len(normal_df) > 0 else 0,
            "std": float(normal_df[col].std()) if len(normal_df) > 0 else 1,
        }

    # Build row-level results for anomalies
    row_results = []
    for idx, row in anomalies_df.iterrows():
        score = float(row["_score"])
        sev = severity_from_score(score, contamination)

        # Find the most deviant feature for this row
        deviations = []
        for col in numeric_cols:
            mean = col_stats[col]["mean"]
            std = col_stats[col]["std"] if col_stats[col]["std"] > 0 else 1
            val = float(row[col]) if pd.notna(row[col]) else mean
            z = abs(val - mean) / std
            multiplier = round(val / mean, 2) if mean != 0 else 1.0
            deviations.append({
                "feature": col,
                "value": f"{val:,.2f}",
                "z_score": round(z, 2),
                "multiplier": abs(multiplier),
                "mean": round(mean, 2),
            })

        deviations.sort(key=lambda x: x["z_score"], reverse=True)
        top = deviations[:3]

        # Build description from top deviation
        if top:
            t = top[0]
            desc = f"Row {int(idx)+1}: '{t['feature']}' is {t['value']} ({t['multiplier']}× dept avg of {t['mean']:,.2f})"
        else:
            desc = f"Row {int(idx)+1}: statistical anomaly detected"

        # Infer amount from first amount-like column
        amount = 0
        for col in numeric_cols:
            if any(k in col.lower() for k in ["amount", "price", "value", "cost", "total"]):
                v = row.get(col, 0)
                if pd.notna(v):
                    amount = float(v)
                    break
        if amount == 0 and len(numeric_cols) > 0:
            v = row.get(numeric_cols[0], 0)
            amount = float(v) if pd.notna(v) else 0

        row_results.append({
            "row": int(idx) + 1,
            "risk_score": round(score),
            "severity": sev,
            "description": desc,
            "amount": round(amount, 2),
            "feature_importance": [
                {"feature": d["feature"], "value": d["value"], "multiplier": round(d["multiplier"], 2)}
                for d in top
            ],
        })

    # Sort by risk score descending
    row_results.sort(key=lambda x: x["risk_score"], reverse=True)

    # Fraud pattern findings
    fraud_patterns = detect_fraud_patterns(df, numeric_cols)

    # ML-level findings (column-level summary)
    ml_findings = []
    for col in numeric_cols:
        normal_mean = col_stats[col]["mean"]
        if len(anomalies_df) > 0:
            anom_mean = float(anomalies_df[col].mean())
            if normal_mean != 0:
                deviation_pct = abs((anom_mean - normal_mean) / normal_mean * 100)
                if deviation_pct > 50:
                    sev = "High" if deviation_pct > 200 else "Medium" if deviation_pct > 100 else "Low"
                    direction = "above" if anom_mean > normal_mean else "below"
                    ml_findings.append({
                        "type": f"{col} Anomaly",
                        "severity": sev,
                        "description": f"Anomalous rows have '{col}' values {deviation_pct:.0f}% {direction} normal average ({normal_mean:,.2f} → {anom_mean:,.2f})",
                        "affected_records": anomalies_detected,
                        "recommendation": f"Investigate '{col}' values in flagged rows — significant deviation from baseline."
                    })

    all_findings = fraud_patterns + ml_findings
    severity_order = {"High": 0, "Medium": 1, "Low": 2}
    all_findings.sort(key=lambda x: severity_order.get(x.get("severity", "Low"), 3))

    # Summary
    high_rows = [r for r in row_results if r["severity"] == "High"]
    high_row_nums = [str(r["row"]) for r in high_rows[:5]]
    summary = (
        f"Isolation Forest analysed {total_records:,} rows. "
        f"Found {anomalies_detected} anomalies ({anomalies_detected/total_records*100:.1f}%) — "
        f"{high_risk} high-risk, {medium_risk} medium-risk, {low_risk} low-risk. "
    )
    if high_row_nums:
        summary += f"High-risk rows: {', '.join(high_row_nums)}. "
    if high_rows:
        top = high_rows[0]
        summary += f"Top anomaly: {top['description']}."

    progress("done", "Analysis complete")

    return {
        "success": True,
        "total_records": total_records,
        "anomalies_detected": anomalies_detected,
        "risk_score": risk_score,
        "high_risk_items": high_risk,
        "medium_risk_items": medium_risk,
        "low_risk_items": low_risk,
        "numeric_columns_analyzed": numeric_cols,
        "findings": all_findings[:12],
        "row_results": row_results[:50],  # Top 50 anomalous rows
        "anomaly_indices": [r["row"] - 1 for r in row_results],
        "summary": summary,
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
    result = analyze(sys.argv[1])
    print(json.dumps(result))
