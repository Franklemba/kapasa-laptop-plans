# URGENT FIX: Render Web Service Configuration

## Problem
You're using `npm run dev` as the start command, which runs the **development server** instead of serving the **production build**. This causes the `_jsxDEV is not a function` error.

## Solution for Web Service

### Step 1: Update Render Settings

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your service (fitech-laptop-plans)
3. Go to **Settings**
4. Update these settings:

   **Environment:** Node
   
   **Build Command:**
   ```
   npm install && npm run build
   ```
   
   **Start Command:**
   ```
   npm start
   ```
   
   **Port:** 8080 (should auto-detect)

5. Scroll down and click **Save Changes**

### Step 2: Clear Cache and Redeploy

1. Go to **Manual Deploy** → **Clear build cache & deploy**
2. Wait 3-5 minutes for deployment
3. Check the logs - you should see:
   ```
   ==> Building...
   npm install
   npm run build
   vite building for production...
   ✓ built in 5s
   ==> Starting service...
   npm start
   Serving dist on port 8080
   ```

## What Changed

We added the `serve` package and a proper `start` script:

**package.json:**
```json
"scripts": {
  "start": "serve -s dist -l 8080"
}
```

This serves the **production build** from the `dist` folder, NOT the development server.

## Environment Variables

Make sure these are set in Render → Settings → Environment:

- `VITE_SUPABASE_URL` = `https://rbgbttfxipzkjezekadd.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZ2J0dGZ4aXB6a2plemVrYWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDgxNzMsImV4cCI6MjA5NTI4NDE3M30.ppKahdOiIEExrMwsduGeo53iF_zeSCDruht9PZwhqB8`
- `NODE_ENV` = `production`

## Why This Happens

- **WRONG (`npm run dev`)**: Runs Vite dev server → uses `_jsxDEV` → causes error
- **CORRECT (`npm start`)**: Serves built files from `dist` → uses `_jsx` → works perfectly

## After Fixing

1. Push the changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix: Add serve package and proper start command for Render"
   git push origin main
   ```

2. In Render dashboard:
   - Update Start Command to `npm start`
   - Clear build cache & deploy

3. Wait 3-5 minutes

4. Visit your site - it should work!

## Verification

Check the Render logs. You should see:

✅ **CORRECT:**
```
npm run build
vite v5.4.19 building for production...
✓ built in 5s

npm start
Serving!
- Local:    http://localhost:8080
- Network:  http://0.0.0.0:8080
```

❌ **WRONG:**
```
npm run dev
VITE v5.4.19 ready in 500 ms
➜  Local:   http://localhost:8080/
```

If you see "npm run dev", change the Start Command to `npm start`!
