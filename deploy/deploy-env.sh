#!/bin/bash
#=============================================
# Deploy .env ke Server via SCP + SSH
#=============================================
# Cara pakai:
#   1. Edit variable SERVER, USER, PORT di bawah
#   2. chmod +x deploy-env.sh
#   3. ./deploy-env.sh
#=============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ===== KONFIGURASI =====
SERVER="203.xxx.xxx.xxx"     # ganti dengan IP VPS kamu
USER="root"                   # atau username SSH kamu
PORT="22"                     # port SSH (default 22)
ENV_FILE="deploy/.env.production"
REMOTE_PATH="/var/www/creativeos/PMProduction/creativeos/.env"
SSH_KEY=""                    # isi path jika pakai key: "/path/to/key.pem"

# ===== FUNCTION SSH =====
ssh_cmd() {
    if [ -n "$SSH_KEY" ]; then
        ssh -i "$SSH_KEY" -p "$PORT" "$USER@$SERVER" "$1"
    else
        ssh -p "$PORT" "$USER@$SERVER" "$1"
    fi
}

scp_cmd() {
    if [ -n "$SSH_KEY" ]; then
        scp -i "$SSH_KEY" -P "$PORT" "$1" "$2"
    else
        scp -P "$PORT" "$1" "$2"
    fi
}

echo -e "${YELLOW}Upload .env ke server...${NC}"

# Buat direktori remote
ssh_cmd "mkdir -p /var/www/creativeos/PMProduction/creativeos"

# Copy .env
scp_cmd "$ENV_FILE" "$USER@$SERVER:$REMOTE_PATH"

echo -e "${GREEN}Done! .env terupload ke $REMOTE_PATH${NC}"

# Optional: restart app
read -p "Restart PM2 app? (y/n): " restart
if [ "$restart" = "y" ]; then
    ssh_cmd "pm2 restart creativeos"
    echo -e "${GREEN}App restarted.${NC}"
fi
