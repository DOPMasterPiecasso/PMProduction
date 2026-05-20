#!/bin/bash
#=============================================
# Fix: Nginx langsung serve /uploads/ dari filesystem
# Jalankan di VPS production sebagai root
#=============================================

APP_DIR="/var/www/htdocs/sales.studioparama.com"
DOMAIN="sales.studioparama.com"

echo "🔧 Updating nginx config untuk serve uploads langsung..."

cat > /etc/nginx/sites-available/creativeos <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    # ----------------------------------------------------------------
    # Serve uploaded files LANGSUNG dari filesystem (tanpa lewat Node)
    # File baru yang diupload langsung bisa diakses tanpa npm run build
    # ----------------------------------------------------------------
    location /uploads/ {
        alias $APP_DIR/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        try_files \$uri =404;
    }

    location / {
        proxy_pass http://127.0.0.1:3125;
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

echo "✅ Testing nginx config..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config valid, reloading nginx (TANPA restart app)..."
    systemctl reload nginx
    echo ""
    echo "🎉 Selesai! File yang diupload sekarang langsung bisa diakses."
    echo "   Path uploads: $APP_DIR/public/uploads/"
    echo "   Tidak perlu npm run build lagi untuk file baru."
else
    echo "❌ Nginx config error! Tidak jadi reload."
    exit 1
fi
