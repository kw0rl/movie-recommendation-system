# ⚡ Quick Fix Guide

## The Problem
❌ "Network error. Please try again." when registering

## The Cause
Frontend was calling old DigitalOcean URL instead of your Render backend

## The Solution (Already Done)
✅ Updated all 9 frontend files to use: `https://movie-recommendation-system-075d.onrender.com`

## What You Need To Do NOW

### 1️⃣ Set Frontend Environment Variable
**Render Dashboard → filmpilot → Environment → Add**
```
NEXT_PUBLIC_API_URL=https://movie-recommendation-system-075d.onrender.com
```

### 2️⃣ Check Backend Database Connection
**Render Dashboard → movie-recommendation-system-075d → Environment**

Make sure these are set:
```
DB_HOST=your_database_host
DB_USER=your_database_user  
DB_PASSWORD=your_database_password
DB_NAME=movie_recommendation
```

### 3️⃣ Commit & Push Code
```bash
git add .
git commit -m "Fix API endpoints"
git push
```

### 4️⃣ Redeploy Both Apps
- Backend: Click "Manual Deploy"
- Frontend: Click "Manual Deploy"

### 5️⃣ Test
Visit: https://filmpilot.onrender.com/register

## Most Likely Issue: Database Not Connected

Check backend logs in Render. If you see database errors:
1. Verify database is running
2. Check DB credentials in environment variables
3. Ensure database allows Render connections

## Quick Test
Visit this URL in browser:
```
https://movie-recommendation-system-075d.onrender.com/api/movies/popular
```

**Should return:** JSON with movies
**If error:** Database or API key issue - check backend logs
