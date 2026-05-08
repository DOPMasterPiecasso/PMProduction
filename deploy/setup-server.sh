#!/bin/bash
#=============================================
# CreativeOS - Server Setup Script
# Target: VPS (Ubuntu 22.04/24.04)
# Database: MySQL 8
#=============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  CreativeOS Server Setup${NC}"
echo -e "${GREEN}============================================${NC}"

# ---- Konfigurasi (isi sesuai server kamu) ----
MYSQL_ROOT_PASS="rootpassword123"
MYSQL_DB="creativeos"
MYSQL_USER="creativeos_user"
MYSQL_PASS="creativeos_pass123"
APP_DIR="/var/www/creativeos"
NODE_VERSION="20"
DOMAIN="creativeos.parama-studio.com"

# ---- 1. Update System ----
echo -e "${YELLOW}[1/8] Update system packages...${NC}"
apt update && apt upgrade -y

# ---- 2. Install Node.js 20 ----
echo -e "${YELLOW}[2/8] Install Node.js $NODE_VERSION...${NC}"
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
apt install -y nodejs git
corepack enable
node -v && npm -v

# ---- 3. Install MySQL 8 ----
echo -e "${YELLOW}[3/8] Install MySQL 8...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# ---- 4. Setup Database & User ----
echo -e "${YELLOW}[4/8] Create database & user...${NC}"
mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASS';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS \`$MYSQL_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASS';
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASS';
GRANT ALL PRIVILEGES ON \`$MYSQL_DB\`.* TO '$MYSQL_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`$MYSQL_DB\`.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
EOF

mysql_secure_installation <<EOF
n
y
y
y
y
EOF

echo -e "${GREEN}  Database: $MYSQL_DB${NC}"
echo -e "${GREEN}  User: $MYSQL_USER${NC}"
echo -e "${GREEN}  Password: $MYSQL_PASS${NC}"

# ---- 5. Install Nginx & PM2 ----
echo -e "${YELLOW}[5/8] Install Nginx & PM2...${NC}"
apt install -y nginx
npm install -g pm2

# ---- 6. Clone / Deploy Aplikasi ----
echo -e "${YELLOW}[6/8] Setup aplikasi...${NC}"
if [ ! -d "$APP_DIR" ]; then
  git clone <REPO_URL> "$APP_DIR"
fi

cp /tmp/.env.production "$APP_DIR/PMProduction/creativeos/.env"

cd "$APP_DIR/PMProduction/creativeos"
npm install
npx prisma generate
npx prisma db push
npm run build

# ---- 7. Setup PM2 ----
echo -e "${YELLOW}[7/8] Setup PM2...${NC}"
pm2 delete creativeos 2>/dev/null || true
pm2 start npm --name "creativeos" -- start -p 3000
pm2 save
pm2 startup systemd

# ---- 8. Setup Nginx Reverse Proxy ----
echo -e "${YELLOW}[8/8] Setup Nginx...${NC}"
cat > /etc/nginx/sites-available/creativeos <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/creativeos /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ---- Selesai ----
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Setup Selesai!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Akses: http://$DOMAIN"
echo ""
echo "=== INFO DATABASE ==="
echo "Database : $MYSQL_DB"
echo "User     : $MYSQL_USER"
echo "Password : $MYSQL_PASS"
echo "Host     : localhost:3306"
echo ""
echo "=== DATABASE URL ==="
echo "mysql://$MYSQL_USER:$MYSQL_PASS@localhost:3306/$MYSQL_DB"
echo ""
echo "=== FILE .ENV ==="
echo "Upload .env.production ke /tmp/.env.production sebelum jalankan script"
echo "atau copy manual ke: $APP_DIR/PMProduction/creativeos/.env"
