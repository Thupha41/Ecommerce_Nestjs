#!/usr/bin/env bash
set -euxo pipefail

########################
# CONFIGURE THESE:
DOMAIN="api.ezgroups.com.vn"
EMAIL="hntvy23@gmail.com" 
UPSTREAM="http://127.0.0.1:3000"
########################

SUDO="sudo"

# 0) Quick sanity: DNS should resolve
getent hosts "$DOMAIN" >/dev/null || { echo "DNS for $DOMAIN not resolving yet. Point your domain first."; exit 1; }

# 1) Install Nginx
$SUDO apt-get update -y
$SUDO apt-get install -y nginx

# 2) Enable & check Nginx
$SUDO systemctl enable nginx
$SUDO systemctl start nginx
$SUDO systemctl --no-pager -l status nginx || true

# 3) Prepare Nginx server block (HTTP) that reverse-proxies to your app
APP_CONF="/etc/nginx/sites-available/app.conf"
$SUDO bash -c "cat > '$APP_CONF' <<'NGINX'
server {
    listen 80;
    listen [::]:80;

    server_name DOMAIN_PLACEHOLDER;

    # Increase if you upload big payloads
    client_max_body_size 50m;

    # ACME challenge (Certbot will handle, but this keeps it simple)
    location ~ /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # Health endpoint (optional)
    location = /healthz {
        add_header Content-Type text/plain;
        return 200 'ok';
    }

    # ---- WebSocket helper (no 'map' needed) ----
    set \$connection_upgrade '';
    if (\$http_upgrade != '') { set \$connection_upgrade 'upgrade'; }

    # Reverse proxy to the app
    location / {
        proxy_pass UPSTREAM_PLACEHOLDER;

        # Timeouts (tune as needed)
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Real IP / headers
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade           \$http_upgrade;
        proxy_set_header Connection        \$connection_upgrade;

        # Gzip (optional)
        gzip on;
        gzip_types text/plain text/css application/json application/javascript application/xml application/rss+xml text/xml image/svg+xml;
    }
}
NGINX"

# 3.1) Inject domain & upstream
$SUDO sed -i "s|DOMAIN_PLACEHOLDER|$DOMAIN|g" "$APP_CONF"
$SUDO sed -i "s|UPSTREAM_PLACEHOLDER|$UPSTREAM|g" "$APP_CONF"

# 3.2) Disable default site, enable ours
if [ -e /etc/nginx/sites-enabled/default ]; then
  $SUDO rm -f /etc/nginx/sites-enabled/default
fi
$SUDO ln -sf "$APP_CONF" /etc/nginx/sites-enabled/app.conf

sudo rm -f /etc/nginx/conf.d/websocket_map.conf
sudo nginx -t
sudo systemctl reload nginx

# 3.3) Lint & reload
$SUDO nginx -t
$SUDO systemctl reload nginx

# 4) Install certbot (prefer snap, fallback to apt)
install_certbot_snap() {
  $SUDO apt-get install -y snapd
  $SUDO snap install core
  $SUDO snap refresh core
  $SUDO snap install --classic certbot
  $SUDO ln -sf /snap/bin/certbot /usr/bin/certbot
}
if ! command -v certbot >/dev/null 2>&1; then
  install_certbot_snap || {
    echo "snap method failed, trying apt..."
    $SUDO apt-get install -y certbot python3-certbot-nginx
  }
fi

# 5) Obtain & install TLS cert (adds 443 + redirect)
$SUDO certbot --nginx \
  -d "$DOMAIN" \
  -m "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --redirect \
  --non-interactive

# 6) Final checks
$SUDO nginx -t
$SUDO systemctl reload nginx
$SUDO systemctl --no-pager -l status nginx || true

echo "✅ Done.
- HTTP:  http://$DOMAIN  (will redirect to HTTPS)
- HTTPS: https://$DOMAIN  (proxied to $UPSTREAM)

Certbot renewal is handled by a systemd timer (snap). Check with:
  systemctl list-timers | grep certbot"
