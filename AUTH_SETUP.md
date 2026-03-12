# 🔐 Authentication Setup Guide

## Overview

This project now uses environment-based configuration for seamless authentication across **localhost**, **dev**, and **prod** environments. No more manual code switching!

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────┐
│  Your Local Machine (localhost:3000)                │
│  ↓                                                   │
│  1. User clicks "Login"                             │
│  ↓                                                   │
│  2. Redirects to: auth-dev.golfguiders.com          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Centralized Auth Portal                            │
│  (auth-dev.golfguiders.com)                         │
│  ↓                                                   │
│  3. User enters credentials                         │
│  4. Auth portal validates                           │
│  5. Generates JWT token                             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Back to Your Local Machine                         │
│  ↓                                                   │
│  6. Redirects to: localhost:3000/en/auth/callback   │
│  7. Token stored in cookie                          │
│  8. Redirects to dashboard                          │
└─────────────────────────────────────────────────────┘
```

## 📁 Environment Files

### **`.env.local`** (Localhost Development)
```env
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_APP_DOMAIN=http://local.app.golfguiders.com:3000
NEXT_PUBLIC_AUTH_URL=https://auth-dev.golfguiders.com/auth/login?app_client_id=gg-app&redirect_uri=http://local.app.golfguiders.com:3000
```

**Important:** Add to your hosts file (Windows: `C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1   local.app.golfguiders.com
```

### **`.env`** (Development/Staging)
```env
NEXT_PUBLIC_ENV=dev
NEXT_PUBLIC_APP_DOMAIN=https://app-dev.golfguiders.com
NEXT_PUBLIC_AUTH_URL=https://auth-dev.golfguiders.com/auth/login?app_client_id=gg-app
```

### **`.env.production`** (Production)
```env
NEXT_PUBLIC_ENV=prod
NEXT_PUBLIC_APP_DOMAIN=https://app.golfguiders.com
NEXT_PUBLIC_AUTH_URL=https://auth.golfguiders.com/auth/login?app_client_id=gg-app
```

## 🚀 Running Locally

### Standard Development
```bash
# Uses .env.local automatically
yarn dev
# or
npm run dev
```

Then open: **http://local.app.golfguiders.com:3000**

This domain allows cookies from `*.golfguiders.com` to work properly! ✅

### Option 2: Custom Port
```bash
yarn dev -p 3001
```

Then open: **http://localhost:3001**
*(Update .env.local redirect_uri to match)*

## 🔑 Auth Flow Details

### Login Flow
1. User navigates to protected route (e.g., `/dashboard`)
2. `proxy.ts` middleware checks for auth token cookie
3. If no token → redirects to `NEXT_PUBLIC_AUTH_URL`
4. Auth portal authenticates user
5. Auth portal redirects to `/en/auth/callback?token=xxx`
6. Callback page stores token in cookie
7. User is redirected to dashboard

### Token Management
- **Storage**: HTTP-only cookies (secure)
- **Access Token**: Expires in 2 days
- **Refresh Token**: Expires in 30 days
- **Cookie Names**:
  - `golfguiders.auth-token` (access token)
  - `golfguiders.refresh-token` (refresh token)

## 📝 Configuration Checklist

✅ **Auth Portal Configuration**
Make sure your centralized auth portal (auth-dev.golfguiders.com) has these redirect URIs whitelisted:
- `http://local.app.golfguiders.com:3000` (for localhost development)
- `http://local.app.golfguiders.com:3001` (if using custom port)
- `https://app-dev.golfguiders.com` (for dev environment)
- `https://app.golfguiders.com` (for production)

✅ **CORS Configuration**
Backend GraphQL API should allow:
- `http://local.app.golfguiders.com:3000`
- `https://app-dev.golfguiders.com`
- `https://app.golfguiders.com`

## 🛠️ Troubleshooting

### Issue: "No token received from auth portal"
**Solution**: Check auth portal redirect URI configuration

### Issue: "Authentication error"
**Solution**: Check browser console for specific error, verify auth portal is running

### Issue: Infinite redirect loop
**Solution**:
1. Clear cookies: `Cookies.remove('golfguiders.auth-token')`
2. Verify `NEXT_PUBLIC_AUTH_URL` is set correctly
3. Check auth portal is accessible

### Issue: Token not persisting
**Solution**:
1. Make sure you're accessing via `http://local.app.golfguiders.com:3000` (not `localhost:3000`)
2. Check that cookies from `*.golfguiders.com` domain are enabled in browser
3. Verify your hosts file has `127.0.0.1 local.app.golfguiders.com`

## 🎨 Development Tips

### Test Different Environments
```bash
# Test with dev environment
NEXT_PUBLIC_ENV=dev yarn dev

# Test with prod environment
NEXT_PUBLIC_ENV=prod yarn dev
```

### Clear Auth State
```javascript
// In browser console:
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Debug Auth Flow
Check these files for logging:
- `src/proxy.ts` - Middleware checks
- `src/app/[locale]/(app)/auth/callback/page.tsx` - Token handling
- `src/lib/hooks/use-auth/index.ts` - User fetch

## 📚 Key Files Modified

| File | Changes |
|------|---------|
| `.env.local` | ✨ NEW - Localhost configuration |
| `.env` | Added `NEXT_PUBLIC_ENV=dev` |
| `src/lib/constants/index.ts` | Removed hardcoded `Token` |
| `src/proxy.ts` | Removed commented code |
| `src/lib/apollo-config.ts` | Removed commented code |
| `src/lib/hooks/use-auth/index.ts` | Removed commented code |
| `src/app/[locale]/(app)/auth/callback/page.tsx` | ✨ NEW - Auth callback handler |

## ✅ Benefits

✅ **No more code changes** for localhost development
✅ **Environment-aware** configuration
✅ **Seamless auth flow** with centralized portal
✅ **Proper token management** via cookies
✅ **Multi-environment support** (local/dev/prod)
✅ **Clean codebase** - no commented-out code

---

**Last Updated**: February 12, 2026
**Environment Setup Complete** 🎉
