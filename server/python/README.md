# Python Anomaly Detection Module

Advanced ML-powered anomaly detection using Isolation Forest algorithm.

## Features

### 1. Data Quality Analysis
- **Missing Values**: Detects columns with >5% missing data
- **Duplicates**: Identifies duplicate rows
- **Constant Columns**: Finds columns with no variance
- **Statistical Outliers**: IQR-based outlier detection
- **Invalid Values**: Detects negative amounts/prices
- **ID Gaps**: Identifies gaps in sequential IDs

### 2. Fraud Pattern Detection
- **Round Number Bias**: Detects suspicious concentration of round amounts
- **Repeated Amounts**: Identifies same values appearing too frequently
- **Rapid Transactions**: Flags transactions within 60 seconds
- **Vendor Concentration**: Detects vendors with too many anomalies
- **Threshold Avoidance**: Identifies amounts just below approval limits

### 3. ML-Based Anomaly Detection
- **Isolation Forest**: Unsupervised learning algorithm
- **Multi-dimensional**: Analyzes all numeric columns together
- **Adaptive**: Adjusts contamination rate based on data
- **Scalable**: Efficient for large datasets

## Algorithm Details

### Isolation Forest

**How it works:**
1. Randomly selects features and split values
2. Creates isolation trees
3. Anomalies are easier to isolate (fewer splits)
4. Returns anomaly scores (lower = more anomalous)

**Parameters:**
```python
IsolationForest(
    contamination=0.1,      # Expected % of anomalies
    n_estimators=100,       # Number of trees
    max_samples='auto',     # Samples per tree
    random_state=42,        # Reproducibility
    n_jobs=-1              # Use all CPU cores
)
```

**Why Isolation Forest?**
- ✅ No training data needed
- ✅ Fast and scalable
- ✅ Handles high-dimensional data
- ✅ Detects complex patterns
- ✅ Robust to noise

## Installation

```bash
# Automatic
./server/python/setup.sh

# Manual
pip3 install pandas numpy scikit-learn openpyxl
```

## Usage

### Command Line
```bash
python3 server/python/anomaly_detector.py path/to/file.csv
```

### From Node.js
```typescript
import { exec } from 'child_process';

exec(`python3 anomaly_detector.py ${filePath}`, (error, stdout) => {
  const result = JSON.parse(stdout);
  console.log(result);
});
```

## Input Format

### CSV Example
```csv
transaction_id,amount,quantity,price,vendor_id
1001,15000,5,3000,101
1002,250000,10,25000,103  # Anomaly
1003,18500,6,3083,102
```

### Excel Example
Any .xlsx or .xls file with numeric columns

## Output Format

```json
{
  "success": true,
  "total_records": 5000,
  "anomalies_detected": 342,
  "risk_score": 65,
  "high_risk_items": 12,
  "medium_risk_items": 85,
  "low_risk_items": 245,
  "findings": [
    {
      "type": "Amount Anomaly (ML)",
      "severity": "High",
      "column": "amount",
      "description": "ML detected anomalies...",
      "affected_records": 12,
      "recommendation": "Review flagged records..."
    }
  ],
  "data_quality_issues": 3,
  "fraud_patterns": 2,
  "ml_anomalies": 5
}
```

## Detection Logic

### Data Quality Thresholds
- Missing data: >5% triggers warning
- Duplicates: Any duplicates flagged
- Outliers: 3x IQR from quartiles
- Negative values: In amount/price/quantity fields

### Fraud Pattern Thresholds
- Round numbers: >30% of transactions
- Repeated amounts: Same value >5% of time
- Rapid transactions: <60 seconds apart
- Vendor concentration: >30% of anomalies
- Threshold avoidance: >5% just below limit

### ML Thresholds
- Contamination: 5-15% adaptive
- High risk: Bottom 5th percentile
- Medium risk: 5th-15th percentile
- Low risk: 15th percentile and above

## Performance Optimization

### For Large Files
```python
# Increase max_samples for faster processing
iso_forest = IsolationForest(
    max_samples=1000,  # Limit samples per tree
    n_jobs=-1          # Use all CPU cores
)
```

### For Better Accuracy
```python
# Increase n_estimators for better detection
iso_forest = IsolationForest(
    n_estimators=200,  # More trees = better accuracy
    contamination=0.05 # Lower if fewer anomalies expected
)
```

## Customization

### Adjust Contamination Rate
```python
# If you expect more/fewer anomalies
contamination = 0.15  # 15% expected anomalies
```

### Add Custom Fraud Patterns
```python
def detect_custom_pattern(df):
    # Your custom logic here
    if condition:
        patterns.append({
            "type": "Custom Pattern",
            "severity": "High",
            "description": "...",
            "affected_records": count,
            "recommendation": "..."
        })
    return patterns
```

### Filter Specific Columns
```python
# Only analyze specific columns
numeric_cols = ['amount', 'quantity', 'price']
X = df[numeric_cols]
```

## Testing

### Test with Sample Data
```bash
python3 anomaly_detector.py sample_data.csv
```

### Expected Output
- Total records: 50
- Anomalies: 3-5 (rows with 250000, 320000, 450000)
- Risk score: 40-60
- Findings: Amount anomalies, possible threshold avoidance

## Troubleshooting

### Import Errors
```bash
pip3 install --upgrade pandas numpy scikit-learn openpyxl
```

### Memory Issues
```python
# Reduce max_samples for large files
iso_forest = IsolationForest(max_samples=500)
```

### Slow Performance
```python
# Use fewer estimators
iso_forest = IsolationForest(n_estimators=50)
```

### No Anomalies Detected
```python
# Increase contamination rate
iso_forest = IsolationForest(contamination=0.15)
```

## Best Practices

1. **Data Preparation**
   - Include column headers
   - Use consistent data types
   - Remove completely empty columns

2. **Column Naming**
   - Use descriptive names
   - Include keywords: amount, price, quantity, vendor, id
   - Helps pattern detection

3. **Data Volume**
   - Minimum: 100 records
   - Optimal: 1000+ records
   - More data = better detection

4. **Interpretation**
   - Review high-severity findings first
   - Consider business context
   - Validate with domain experts

## References

- [Isolation Forest Paper](https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf)
- [scikit-learn Docs](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html)
- [Anomaly Detection Guide](https://scikit-learn.org/stable/modules/outlier_detection.html)

## Support

For issues or questions:
1. Check this documentation
2. Review error messages
3. Test with sample_data.csv
4. Check Python/package versions
