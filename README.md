# AFED Fraud Detection System

A production-ready fraud detection and anomaly analysis platform powered by Machine Learning (Isolation Forest) and modern web technologies.

## 🚀 Features

### ML-Powered Anomaly Detection
- **Isolation Forest Algorithm** - Unsupervised learning for fraud detection
- **Automatic Pattern Recognition** - Detects fraud indicators without training data
- **Multi-dimensional Analysis** - Analyzes relationships across all numeric columns
- **Real-time Processing** - Instant analysis of uploaded documents

### Intelligent Problem Detection
- **Data Quality Issues** - Missing values, duplicates, invalid data
- **Fraud Patterns** - Round number bias, threshold avoidance, vendor concentration
- **Statistical Outliers** - IQR-based outlier detection
- **Behavioral Anomalies** - Rapid transactions, repeated amounts

### Comprehensive Dashboard
- Real-time KPIs and metrics
- Event timeline visualization
- System health monitoring
- Risk scoring and alerts

### Detection Management
- Filterable detection events
- Severity-based categorization
- Detailed event analysis
- Actionable recommendations

### Report Generation
- Multiple report formats (PDF, CSV, Excel, JSON)
- Automated report scheduling
- Document upload and analysis
- Historical report archive

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS 3 (styling)
- Radix UI (components)
- Recharts (data visualization)
- React Router 6 (SPA routing)

**Backend:**
- Node.js + Express 5
- TypeScript
- Python 3.8+ (ML engine)

**Machine Learning:**
- scikit-learn (Isolation Forest)
- pandas (data processing)
- numpy (numerical computing)

## 📦 Installation

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.8+
- pip3

### Quick Start

```bash
# 1. Install Node dependencies
pnpm install

# 2. Install Python ML dependencies
./server/python/setup.sh

# 3. Start development server
pnpm dev

# 4. Open browser
# Navigate to http://localhost:8080
```

## 🎯 Usage

### Upload & Analyze Documents

1. Navigate to **Reports** page
2. Drag & drop or select a CSV/Excel file
3. Wait for ML analysis (1-5 seconds)
4. Review findings and recommendations

### Supported File Formats
- CSV (.csv)
- Excel (.xlsx, .xls)

### Sample Data
Test with included sample: `server/python/sample_data.csv`

## 🔍 What Gets Analyzed

### Data Quality Checks
- ✅ Missing values detection
- ✅ Duplicate record identification
- ✅ Constant column detection
- ✅ Invalid value validation
- ✅ ID sequence gap analysis

### Fraud Pattern Detection
- ✅ Round number bias
- ✅ Repeated exact amounts
- ✅ Rapid transaction sequences
- ✅ Threshold avoidance patterns
- ✅ Vendor concentration analysis

### ML Anomaly Detection
- ✅ Multi-dimensional outliers
- ✅ Statistical deviations
- ✅ Behavioral pattern analysis
- ✅ Risk scoring (0-100)

## 📊 API Endpoints

### Dashboard
```
GET /api/dashboard
```

### Detection Events
```
GET /api/detection/events?severity=High&type=Payment&status=New
GET /api/detection/events/:id
```

### Reports
```
GET /api/reports
POST /api/reports/generate
GET /api/reports/:id/download
```

### Document Analysis
```
POST /api/upload/analyze
Headers:
  X-File-Name: document.csv
  Content-Length: <size>
Body: <file-binary>
```

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── pages/             # Route components
│   ├── components/        # Reusable components
│   ├── lib/               # Utilities & context
│   └── global.css         # Global styles
├── server/                # Express backend
│   ├── routes/            # API handlers
│   ├── python/            # ML engine
│   │   ├── anomaly_detector.py
│   │   ├── requirements.txt
│   │   └── sample_data.csv
│   └── index.ts           # Server entry
├── shared/                # Shared types
│   └── api.ts             # TypeScript interfaces
└── public/                # Static assets
```

## 🧪 Development

```bash
# Run tests
pnpm test

# Type checking
pnpm typecheck

# Format code
pnpm format.fix

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
PING_MESSAGE=pong
PORT=8080
```

### Python Configuration
Adjust ML parameters in `server/python/anomaly_detector.py`:
```python
iso_forest = IsolationForest(
    contamination=0.1,      # Expected anomaly rate (10%)
    n_estimators=100,       # Number of trees
    random_state=42         # Reproducibility
)
```

## 📈 Performance

- **Small files** (<1MB): ~1-2 seconds
- **Medium files** (1-10MB): ~3-5 seconds
- **Large files** (10-50MB): ~10-20 seconds

## 🚀 Deployment

### Standard Deployment
```bash
pnpm build
pnpm start
```

### Docker (Optional)
```bash
docker build -t fraud-detection .
docker run -p 8080:8080 fraud-detection
```

### Cloud Platforms
- Netlify (recommended)
- Vercel
- AWS / GCP / Azure

## 🔒 Security

- File type validation
- Size limits (50MB)
- Temporary file cleanup
- No persistent storage of uploaded data
- CORS protection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Python not found
```bash
# Check Python installation
python3 --version

# Install Python 3.8+
# macOS: brew install python3
# Ubuntu: sudo apt install python3
```

### Dependencies not installed
```bash
pip3 install --upgrade -r server/python/requirements.txt
```

### Port already in use
```bash
# Change port in vite.config.ts
export default defineConfig({
  server: { port: 3000 }
})
```

## 📚 Documentation

- [ML Setup Guide](ML_SETUP.md)
- [Python Module Docs](server/python/README.md)
- [API Documentation](docs/API.md)

## 🎓 Learn More

- [Isolation Forest Paper](https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf)
- [scikit-learn Documentation](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

## 💡 Tips

- Use CSV format for faster processing
- Include column headers in your data
- Numeric columns are required for ML analysis
- More data = better anomaly detection
- Review high-severity findings first

## 🌟 Acknowledgments

Built with modern web technologies and powered by scikit-learn's Isolation Forest algorithm.

---

**Made with ❤️ for fraud detection and data quality analysis**
