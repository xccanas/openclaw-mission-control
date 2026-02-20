# OpenClaw Mission Control - Important Learnings & Keys

## dY"< Repository Setup
- **Original Repository**: https://github.com/manish-raana/openclaw-mission-control
- **Fresh Copy**: Located in `openclaw-mission-control/` (just cloned)
- **Modified Copy**: Located in `openclaw-mission-control-workspace/` (our previous work)
- **Backup**: Located in `backup-mission-control/` (from earlier backup)

## dYZ_ Critical Learnings from Previous Mistakes

### 1. Authentication System (CONVEX)
**MISTAKE**: Using custom auth functions instead of Convex Auth Library
**LESSON**: Must use convexAuth() wrapper with @convex-dev/auth

**Correct Implementation**:
```typescript
// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password<DataModel>()],
});
```

**Required Files**:
- convex/auth.ts - Must use convexAuth() wrapper
- convex/auth.config.ts - Provider configuration
- VITE_AUTH_PASSWORD=true in .env.local

### 2. Convex URL Structure
**MISTAKE**: Using convex.cloud for both frontend and backend
**LESSON**: 
- convex.cloud = Backend APIs, WebSocket connections
- convex.site = Frontend hosting, HTTP endpoints, webhooks

**Correct URLs**:
- Backend: https://grandiose-sparrow-364.convex.cloud
- Frontend: https://grandiose-sparrow-364.convex.site
- Webhook: https://grandiose-sparrow-364.convex.site/openclaw/event

### 3. React Router Configuration
**MISTAKE**: BrowserRouter doesn't work well with Convex site hosting
**LESSON**: HashRouter is more reliable for static site hosting

**Alternative Solutions**:
1. Use HashRouter in main.tsx
2. Configure convex/http.ts with catch-all redirects
3. Deploy frontend separately to Vercel/Netlify

### 4. OpenClaw Hook Configuration
**CORRECT Setup**:
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "mission-control": {
          "enabled": true,
          "env": {
            "MISSION_CONTROL_URL": "https://grandiose-sparrow-364.convex.site/openclaw/event"
          }
        }
      }
    }
  }
}
```

## dY"< Environment Variables & Configuration

### OpenClaw Config
- MISSION_CONTROL_URL: https://grandiose-sparrow-364.convex.site/openclaw/event

### Convex Auth
- VITE_AUTH_PASSWORD=true
- VITE_CONVEX_URL=https://grandiose-sparrow-364.convex.cloud
- VITE_CONVEX_SITE_URL=https://grandiose-sparrow-364.convex.site

### Authentication
- **Provider**: @convex-dev/auth Password provider
- **Login**: xccanas@gmail.com / anas-0-0
- **Convex Project**: grandiose-sparrow-364

## dY" Deployment Commands

### Convex Backend
```bash
cd openclaw-mission-control
npx convex deploy
```

### Local Development
```bash
# Frontend
npm run dev

# Backend (if needed)
npx convex dev
```

### Testing Authentication
```bash
# Check Convex dashboard logs for auth issues
npx convex logs

# Test login in browser
# URL: https://grandiose-sparrow-364.convex.site
# Credentials: xccanas@gmail.com / anas-0-0
```

## dY"< Production URLs

### Current Project
- **Backend API**: https://grandiose-sparrow-364.convex.cloud
- **Frontend**: https://grandiose-sparrow-364.convex.site
- **Webhook**: https://grandiose-sparrow-364.convex.site/openclaw/event

### Access URLs
- **Dashboard**: https://grandiose-sparrow-364.convex.site
- **Auth Testing**: Use credentials above to test login

## dYZ_ Key Files to Check

### Convex Backend
- convex/auth.ts (Authentication)
- convex/auth.config.ts (Provider config)
- convex/openclaw.ts (Webhook handler)
- convex/http.ts (HTTP routing)

### Frontend
- src/main.tsx (Router setup)
- src/App.tsx (Main component)
- package.json (Dependencies)

### OpenClaw Integration
- ~/.openclaw/hooks/mission-control/ (Hook files)
- ~/.openclaw/openclaw.json (Configuration)

## dY" Next Steps for Fresh Setup

1. ✅ Fresh repository cloned
2. ⏳ Dependencies installing (npm install)
3. Verify configuration files
4. Test local development
5. Deploy to Convex
6. Configure OpenClaw webhook
7. Test integration

---

*This documentation preserves all the key learnings from our previous work to avoid repeating the same mistakes with the fresh repository installation.*