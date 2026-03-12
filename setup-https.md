# 🔒 Setting Up HTTPS for Localhost Development

## Why HTTPS is Needed

The centralized auth portal (`auth-dev.golfguiders.com`) sets cookies with the `Secure` flag. These cookies can only be accessed via HTTPS connections, not HTTP.

## Option 1: Using mkcert (Recommended)

### Step 1: Install mkcert

**Windows (using Chocolatey):**
```bash
choco install mkcert
```

**Windows (using Scoop):**
```bash
scoop bucket add extras
scoop install mkcert
```

**Mac:**
```bash
brew install mkcert
```

### Step 2: Create Local CA

```bash
mkcert -install
```

This installs a local Certificate Authority in your system trust store.

### Step 3: Generate Certificate

Navigate to your project root and run:

```bash
cd c:\xampp\htdocs\golfguiders-web-app
mkcert local.app.golfguiders.com localhost 127.0.0.1 ::1
```

This creates two files:
- `local.app.golfguiders.com+3.pem` (certificate)
- `local.app.golfguiders.com+3-key.pem` (private key)

### Step 4: Create .certs Directory

```bash
mkdir .certs
move local.app.golfguiders.com+3.pem .certs/cert.pem
move local.app.golfguiders.com+3-key.pem .certs/key.pem
```

### Step 5: Update package.json

Add a new dev script:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https --experimental-https-key .certs/key.pem --experimental-https-cert .certs/cert.pem",
    "build": "next build",
    "start": "next start"
  }
}
```

### Step 6: Update .env.local

```env
NEXT_PUBLIC_APP_DOMAIN=https://local.app.golfguiders.com:3000
NEXT_PUBLIC_AUTH_URL=https://auth-dev.golfguiders.com/auth/login?app_client_id=gg-app&redirect_uri=https://local.app.golfguiders.com:3000
NEXT_PUBLIC_AUTH_LOGOUT_URL=https://auth-dev.golfguiders.com/auth/logout?app_client_id=gg-app&redirect_uri=https://local.app.golfguiders.com:3000
```

### Step 7: Run with HTTPS

```bash
yarn dev:https
```

### Step 8: Access App

Open: **https://local.app.golfguiders.com:3000**

---

## Option 2: Using OpenSSL (Manual)

### Step 1: Generate Self-Signed Certificate

```bash
# Create .certs directory
mkdir .certs
cd .certs

# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=local.app.golfguiders.com"
```

### Step 2: Trust the Certificate (Windows)

1. Double-click `cert.pem`
2. Click "Install Certificate"
3. Select "Current User" → Next
4. Select "Place all certificates in the following store"
5. Click "Browse" → Select "Trusted Root Certification Authorities"
6. Click Next → Finish

### Step 3: Follow Steps 5-8 from Option 1

---

## Add .certs to .gitignore

```bash
echo ".certs/" >> .gitignore
```

---

## Troubleshooting

### Issue: Browser shows "Not Secure"
**Solution:** Make sure you ran `mkcert -install` to install the local CA

### Issue: ERR_CERT_AUTHORITY_INVALID
**Solution:** Trust the certificate in your system (see Step 2 of Option 2)

### Issue: Port already in use
**Solution:** Stop other Next.js instances or use a different port:
```bash
yarn dev:https -- -p 3001
```

---

## Production Note

These certificates are ONLY for local development. Production should use real SSL certificates from Let's Encrypt or your hosting provider.
