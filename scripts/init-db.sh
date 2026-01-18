#!/bin/bash

# Database Initialization Script
# This script helps initialize the database after deployment

echo "🚀 Fitura Database Initialization Script"
echo "=========================================="
echo ""

# Check if URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Vercel deployment URL"
    echo ""
    echo "Usage: ./scripts/init-db.sh https://your-app.vercel.app"
    echo ""
    exit 1
fi

DEPLOYMENT_URL=$1
INIT_ENDPOINT="${DEPLOYMENT_URL}/api/init-db"

echo "📍 Deployment URL: $DEPLOYMENT_URL"
echo "🔗 Initialization endpoint: $INIT_ENDPOINT"
echo ""
echo "⏳ Initializing database..."
echo ""

# Make the request
response=$(curl -s -w "\n%{http_code}" "$INIT_ENDPOINT")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo "✅ Database initialized successfully!"
    echo ""
    echo "📊 Response:"
    echo "$body"
    echo ""
    echo "✨ Your database tables are now ready!"
    echo ""
    echo "📋 Tables created:"
    echo "   - FT_PRD_memberships (or FT_STG_/FT_LCL_ based on NODE_ENV)"
    echo "   - FT_PRD_clients"
    echo "   - FT_PRD_attendance"
    echo ""
    echo "🔍 Verify in Supabase Dashboard → Table Editor"
else
    echo "❌ Error: Failed to initialize database"
    echo "HTTP Status: $http_code"
    echo "Response: $body"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Check if the deployment URL is correct"
    echo "   2. Verify environment variables are set in Vercel"
    echo "   3. Check Vercel function logs for errors"
    exit 1
fi





