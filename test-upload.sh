#!/bin/bash
# Test script for document upload and analysis

echo "🧪 Testing Document Upload & Analysis"
echo "======================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:8080/api/ping > /dev/null; then
    echo "❌ Server is not running!"
    echo "Please start the server with: pnpm dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test with sample data
SAMPLE_FILE="server/python/sample_data.csv"

if [ ! -f "$SAMPLE_FILE" ]; then
    echo "❌ Sample file not found: $SAMPLE_FILE"
    exit 1
fi

echo "📤 Uploading sample file: $SAMPLE_FILE"
echo ""

# Upload and analyze
RESPONSE=$(curl -s -X POST http://localhost:8080/api/upload/analyze \
  -H "X-File-Name: sample_data.csv" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@$SAMPLE_FILE")

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Upload successful!"
    echo ""
    echo "📊 Analysis Results:"
    echo "$RESPONSE" | python3 -m json.tool | head -50
    echo ""
    echo "✅ Test completed successfully!"
else
    echo "❌ Upload failed!"
    echo "$RESPONSE"
    exit 1
fi
