#!/bin/bash
# Setup script for Python anomaly detection

echo "Setting up Python environment for anomaly detection..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install pip3."
    exit 1
fi

echo "Installing Python dependencies..."
pip3 install -r server/python/requirements.txt

echo "✓ Python environment setup complete!"
echo ""
echo "You can now upload CSV or Excel files for ML-powered anomaly detection."
