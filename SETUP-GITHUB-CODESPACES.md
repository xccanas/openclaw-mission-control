# GitHub Codespaces Setup - Quick Guide

## 🚀 GitHub CLI Setup Complete!

GitHub CLI v2.87.0 is now installed at `C:\Program Files\GitHub CLI\gh.exe`

### Step 1: Authenticate with GitHub
Run this command and follow the prompts:
```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login
```
Choose:
- **GitHub.com**
- **HTTPS**
- **Login with web browser** (recommended)
- **Yes** for authentication

### Step 2: Create New Repository
After logging in, run:
```powershell
& "C:\Program Files\GitHub CLI\gh.exe" repo create openclaw-mission-control --public --source=. --remote=origin --push
```

### Step 3: Create Codespace
Open your browser and go to:
https://github.com/YOUR_USERNAME/openclaw-mission-control

Then click:
1. **"Code"** button
2. **"Codespaces"** tab  
3. **"Create codespace on main"**

### Step 4: Start Development
In the Codespaces terminal:
```bash
npm install
npm run dev
```

## 🎯 What You Get
- **Full Mission Control UI** in browser
- **Working authentication** with test@example.com
- **OpenClaw webhook integration**
- **No Windows restrictions**

## ⚠️ Alternative: Manual Repository Creation
If the CLI command fails, do it manually:
1. Go to https://github.com → New repository
2. Name: `openclaw-mission-control`
3. Click "Create repository"
4. Then run:
```powershell
cd "C:\Users\anas\.openclaw\workspace\openclaw-mission-control"
git remote set-url origin https://github.com/YOUR_USERNAME/openclaw-mission-control.git
git push -u origin main
```