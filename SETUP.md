# OpenClaw Mission Control - GitHub Codespaces Setup

## 🚀 Quick Setup (4 Commands)

### Step 1: Navigate to Project
```powershell
cd "C:\Users\anas\.openclaw\workspace\openclaw-mission-control"
```

### Step 2: Push to GitHub (If you have push access)
```powershell
git add .
git commit -m "ready"
git push
```

If permission denied, you'll need to:
1. Create a new GitHub repository named `openclaw-mission-control`
2. Set up a new remote:
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/openclaw-mission-control.git
git push -u origin main
```

### Step 3: Create Codespace
1. Open: https://github.com/YOUR_USERNAME/openclaw-mission-control
2. Click **"Code"** → **"Codespaces"** → **"Create codespace on main"**
3. Wait for the environment to load (2-5 minutes)

### Step 4: Start Development
In the Codespaces terminal:
```bash
npm install
npm run dev
```

## 🎯 What You Get
- **Full Mission Control UI** working in browser
- **Complete authentication system** 
- **OpenClaw webhook integration**
- **Development environment** without Windows restrictions

## 🚀 Expected Result
- Dev server starts on port 5173
- Browser preview shows working login page
- Can test authentication with test@example.com / testpassword123