#!/bin/bash
set -e

echo "============================================"
echo "  Gloria Trade - Re-deploy"
echo "============================================"

APP_DIR="/home/ubuntu/gloria-trade-angular"
cd "$APP_DIR"

echo "[1/4] Pulling latest code..."
git pull origin main

echo "[2/4] Rebuilding Angular frontend..."
cd "$APP_DIR/client"
npm ci --silent
npx ng build --configuration production

echo "[3/4] Updating Python dependencies..."
cd "$APP_DIR/server"
source .venv/bin/activate
pip install --quiet -e .
deactivate

echo "[4/4] Restarting services..."
sudo systemctl restart gloria-trade
sudo systemctl restart nginx

echo ""
echo "Deploy complete!"
echo "Frontend: http://$(curl -s http://checkip.amazonaws.com)"
echo "============================================"
