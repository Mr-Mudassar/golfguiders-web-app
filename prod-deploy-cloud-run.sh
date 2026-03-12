#!/bin/bash
set -e

# ================================
# Configuration
# ================================
PROJECT_ID="gcp-golf-app"
SERVICE_NAME="golfguiders-webapp"
REGION="us-west1"
PORT=8080
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

# ================================
# Step 0: Check if service exists
# ================================
echo "🔍 Checking if service '$SERVICE_NAME' already exists..."

if gcloud run services describe $SERVICE_NAME --platform managed --region $REGION &>/dev/null; then
  EXISTING_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --format 'value(status.url)')

  echo "⚠️  Service '$SERVICE_NAME' already exists!"
  echo "   Current URL: $EXISTING_URL"
  echo ""
  read -p "Do you want to update the existing service? (y/n): " CONFIRM

  if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "❌ Deployment cancelled."
    exit 0
  fi

  echo "✅ Proceeding with update..."
else
  echo "ℹ️  Service '$SERVICE_NAME' does not exist. A new service will be created."
fi

# ================================
# Step 1: Build the Docker image
# ================================
echo "📦 Building Docker image with Cloud Build..."
gcloud builds submit --tag $IMAGE .

# ================================
# Step 2: Deploy to Cloud Run
# ================================
echo "🚀 Deploying to Cloud Run..."
# Uncomment the next line to set env vars: --set-env-vars $ENV_VARS
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --port $PORT \
  --allow-unauthenticated

# ================================
# Step 3: Print deployed URL
# ================================
URL=$(gcloud run services describe $SERVICE_NAME \
      --platform managed \
      --region $REGION \
      --format 'value(status.url)')

echo "✅ Deployment completed!"
echo "🌐 Your Next.js app is live at: $URL"






