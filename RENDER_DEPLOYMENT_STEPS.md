# Render Deployment - Exact Steps to Fix

## Current Problem
Your Render Web Service is using `npm run dev` which runs the development server. This causes the blank page with `_jsxDEV is not a function` error.

## Solution Summary
Change the Start Command from `npm run dev` to `npm start` and redeploy.

---

## Step-by-Step Instructions

### Step 1: Push Latest Changes to GitHub

```bash
cd /Users/user/projects/Uncle_kapasa_project/kapasa-laptop-plans

git add .
git commit -m "Fix: Add serve package and proper start command for production"
git push origin main
```

### Step 2: Update Render Settings

1. Go to: https://dashboard.render.com
2. Click on your service: **fitech-laptop-plans** (or whatever you named it)
3. Click **Settings** in the left sidebar

### Step 3: Verify/Update Build Settings

Scroll to **Build & Deploy** section and verify:

**Build Command:**
```
npm install && npm run build
```

**Start Command:** (THIS IS THE KEY FIX!)
```
npm start
```

If it says `npm run dev`, change it to `npm start`

### Step 4: Verify Environment Variables

Scroll to **Environment Variables** section and verify these exist:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://rbgbttfxipzkjezekadd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full key) |
| `NODE_ENV` | `production` |

If any are missing, click **Add Environment Variable** and add them.

### Step 5: Save and Deploy

1. Scroll to the bottom and click **Save Changes**
2. Go to **Manual Deploy** (top right)
3. Click **Clear build cache & deploy**
4. Wait 3-5 minutes for deployment

### Step 6: Monitor Deployment Logs

Click on **Logs** tab and watch for:

✅ **SUCCESS - You should see:**
```
==> Cloning from GitHub...
==> Building...
npm install
npm run build
vite v5.4.19 building for production...
✓ 2741 modules transformed.
✓ built in 5s
==> Build successful!
==> Starting service with 'npm start'...
Serving!
- Local:    http://localhost:8080
- Network:  http://0.0.0.0:8080
==> Your service is live at https://fitech-cjyj.onrender.com
```

❌ **WRONG - If you see this, the start command is still wrong:**
```
npm run dev
VITE v5.4.19 ready in 500 ms
```

### Step 7: Test Your Site

1. Visit: https://fitech-cjyj.onrender.com
2. Open browser DevTools (F12)
3. Check Console - should be NO errors
4. The landing page should load properly

---

## What We Changed

### 1. Added `serve` package
**File:** `package.json`
```json
"devDependencies": {
  "serve": "^14.2.4"
}
```

### 2. Added `start` script
**File:** `package.json`
```json
"scripts": {
  "start": "serve -s dist -l 8080"
}
```

### 3. Updated Vite config
**File:** `vite.config.ts`
- Forced production JSX runtime
- Added proper build settings

### 4. Updated Render config
**File:** `render.yaml`
- Changed env from `static` to `node`
- Added `startCommand: npm start`

---

## Troubleshooting

### Issue: Still seeing blank page
**Solution:** 
- Check Render logs - make sure it says "npm start" not "npm run dev"
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Try incognito/private window

### Issue: Environment variables not working
**Solution:**
- In Render Settings → Environment, verify all 3 variables are set
- After adding variables, click "Save Changes"
- Redeploy the service

### Issue: Build fails
**Solution:**
- Check Render logs for specific error
- Make sure you pushed all changes to GitHub
- Try "Clear build cache & deploy"

### Issue: Port error
**Solution:**
- Render auto-detects port 8080 from the serve command
- If it doesn't work, add environment variable: `PORT=8080`

---

## Quick Reference

**Correct Commands:**
- Build: `npm run build` (creates production files in `dist/`)
- Start: `npm start` (serves files from `dist/` on port 8080)

**Wrong Commands:**
- ❌ `npm run dev` (development server - causes the error)
- ❌ `vite` (same as npm run dev)

**File Structure:**
```
kapasa-laptop-plans/
├── dist/              ← Production build (created by npm run build)
│   ├── index.html
│   └── assets/
├── src/               ← Source code
├── package.json       ← Has "start": "serve -s dist -l 8080"
└── vite.config.ts     ← Production build config
```

---

## After Successful Deployment

1. ✅ Site loads at https://fitech-cjyj.onrender.com
2. ✅ No console errors
3. ✅ Can register/login
4. ✅ Can view laptops catalog

Next steps:
- Create admin account (see ADMIN_CREDENTIALS.md)
- Add laptops to catalog
- Test payment plan workflow
- Update Supabase Site URL to your Render URL
