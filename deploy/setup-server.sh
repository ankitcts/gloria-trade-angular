#!/bin/bash
set -e

echo "============================================"
echo "  Gloria Trade - EC2 Server Setup"
echo "============================================"

APP_DIR="/home/ubuntu/gloria-trade-angular"
REPO_URL="https://github.com/ankitcts/gloria-trade-angular.git"

# --- System packages ---
echo "[1/7] Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq nginx python3.12 python3.12-venv python3-pip git curl software-properties-common

# --- Node.js 20 ---
echo "[2/7] Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
fi
echo "Node: $(node --version), npm: $(npm --version)"

# --- Clone repo ---
echo "[3/7] Cloning repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# --- Build Angular frontend ---
echo "[4/7] Building Angular frontend..."
cd "$APP_DIR/client"
npm ci --silent
npx ng build --configuration production
echo "Frontend built at: $APP_DIR/client/dist/gloria-trade-angular/browser"

# --- Setup Python backend ---
echo "[5/7] Setting up Python backend..."
cd "$APP_DIR/server"
python3.12 -m venv .venv
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -e .
pip install --quiet "bcrypt>=4.1.0,<5.0.0"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "[!] Creating .env from template - EDIT THIS with your credentials!"
    cat > .env << 'ENVEOF'
# MongoDB Atlas
MONGODB_URI=mongodb+srv://ankitcts_db_user:MZIJbvDBu86NTORy@tradingwarehouse.he55x3b.mongodb.net/?appName=tradingWarehouse
MONGODB_DB_NAME=gloria_trade_angular

# JWT
JWT_SECRET_KEY=change-this-to-a-long-random-string-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ankitcts@gmail.com
SMTP_PASSWORD=bsygpbzvrduwogsr
SMTP_FROM_NAME=Gloria Trade

# App
APP_ENV=production
APP_PORT=9000
ENVEOF
    echo "[!] .env created. Edit /home/ubuntu/gloria-trade-angular/server/.env if needed."
fi

deactivate

# --- Configure Nginx ---
echo "[6/7] Configuring Nginx..."
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/gloria-trade
sudo ln -sf /etc/nginx/sites-available/gloria-trade /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# --- Setup systemd service ---
echo "[7/7] Setting up FastAPI service..."
sudo cp "$APP_DIR/deploy/gloria-trade.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gloria-trade
sudo systemctl restart gloria-trade

# --- Done ---
echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "  Frontend: http://$(curl -s http://checkip.amazonaws.com)"
echo "  Backend:  http://$(curl -s http://checkip.amazonaws.com)/api/v1/health"
echo "  API Docs: http://$(curl -s http://checkip.amazonaws.com)/api/v1/docs"
echo ""
echo "  Logs: sudo journalctl -u gloria-trade -f"
echo "  Restart: sudo systemctl restart gloria-trade"
echo ""
echo "  To re-deploy after code changes:"
echo "  cd $APP_DIR && bash deploy/deploy.sh"
echo "============================================"
