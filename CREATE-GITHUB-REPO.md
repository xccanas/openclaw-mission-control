# Create New GitHub Repository for OpenClaw Mission Control

## 🚀 Manual Setup Instructions

### Step 1: Create New GitHub Repository
1. Go to: https://github.com
2. Click **"+"** → **"New repository"**
3. Repository name: `openclaw-mission-control`
4. Make it **Public** (free)
5. **DO NOT** check "Add README" (we already have one)
6. Click **"Create repository"**

### Step 2: Set Up Git Remote
Open PowerShell and run these commands:
```powershell
cd "C:\Users\anas\.openclaw\workspace\openclaw-mission-control"
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/openclaw-mission-control.git
git branch -M main
git push -u origin main
```

**Replace YOUR_USERNAME with your actual GitHub username**

### Step 3: Create GitHub Codespace
1. Go to: https://github.com/YOUR_USERNAME/openclaw-mission-control
2. Click **"Code"** button
3. Click **"Codespaces"** tab
4. Click **"Create codespace on main"**
5. Wait for environment to load (2-5 minutes)

### Step 4: Start Development
In the Codespaces terminal:
```bash
npm install
npm run dev
```

## 🎯 Expected Result
- Dev server starts on port 5173
- Browser preview shows working login page
- Can test authentication with test@example.com / testpassword123
- Full Mission Control UI accessible in browser

## 🚀 What You Get
- **Complete development environment** (no Windows restrictions)
- **Working authentication system**
- **OpenClaw integration**
- **Frontend and backend fully functional**