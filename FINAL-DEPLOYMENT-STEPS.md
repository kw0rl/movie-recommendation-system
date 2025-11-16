# 🚀 Final Deployment Steps

## ✅ All Code Changes Complete!

Your frontend URL `https://filmpilot.onrender.com` is already configured in the backend CORS.

## 🔧 Required Actions in Render Dashboard

### 1. Backend Environment Variables
Go to: Render Dashboard → movie-recommendation-system-075d → Environment

Ensure these variables are set:
```
PORT=5000
TMDB_API_KEY=your_tmdb_api_key_here
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_here
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=movie_recommendation
DB_PORT=3306
DB_SSL=true
FRONTEND_URL=https://filmpilot.onrender.com
NODE_ENV=production
```

### 2. Frontend Environment Variables
Go to: Render Dashboard → filmpilot → Environment

Add this variable:
```
NEXT_PUBLIC_API_URL=https://movie-recommendation-system-075d.onrender.com
```

## 📦 Deployment Steps

### Step 1: Commit and Push Changes
```bash
cd c:\Users\lenovo\movierecommendation

# Add all changes
git add .

# Commit
git commit -m "Fix API endpoints to use Render backend URL"

# Push to your repository
git push origin main
```

### Step 2: Redeploy Backend
1. Go to Render Dashboard → movie-recommendation-system-075d
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete
4. Check logs for any errors

### Step 3: Redeploy Frontend
1. Go to Render Dashboard → filmpilot
2. Make sure `NEXT_PUBLIC_API_URL` environment variable is set
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

## 🧪 Testing

### Test 1: Backend Health Check
Visit: https://movie-recommendation-system-075d.onrender.com/api/movies/popular

**Expected:** JSON response with movie data
**If error:** Check backend logs in Render

### Test 2: Frontend Registration
1. Visit: https://filmpilot.onrender.com/register
2. Fill in the registration form
3. Click "Create account"

**Expected:** Account created, redirected to home page
**If "Network error":** 
- Check browser console (F12) for detailed error
- Check backend logs for CORS or database errors
- Verify environment variables are set

### Test 3: Login
1. Visit: https://filmpilot.onrender.com/login
2. Login with your account
3. Should redirect to home page

### Test 4: Favorites
1. Click heart icon on any movie
2. Should add to favorites
3. Visit favorites page to verify

## 🐛 Troubleshooting

### Still Getting "Network error"?

**Check 1: Backend Logs**
```
Render Dashboard → movie-recommendation-system-075d → Logs
```
Look for:
- Database connection errors
- CORS errors
- Missing environment variables

**Check 2: Frontend Console**
```
Open browser → F12 → Console tab
```
Look for:
- Failed fetch requests
- CORS errors
- 404 or 500 errors

**Check 3: Database Connection**
Most common issue! Ensure:
- Database is running and accessible
- All DB_* environment variables are correct
- Database allows connections from Render IPs
- SSL is enabled if required (`DB_SSL=true`)

### Common Database Issues

**Error: "connect ETIMEDOUT"**
- Database host is unreachable
- Check firewall/security group settings
- Ensure database allows Render IP addresses

**Error: "Access denied for user"**
- Wrong DB_USER or DB_PASSWORD
- User doesn't have permissions on the database

**Error: "Unknown database"**
- DB_NAME is incorrect
- Database doesn't exist - run schema.sql first

### CORS Errors

If you see CORS errors in browser console:
1. Backend logs should show which origin was blocked
2. Verify `https://filmpilot.onrender.com` is in allowedOrigins
3. Redeploy backend after changes

## 📊 Database Setup

If database is not set up yet:

1. **Create MySQL Database** (use Render, PlanetScale, or other provider)

2. **Run Schema**
```sql
-- Copy contents from movie-backend/database/schema.sql
-- Run in your MySQL database
```

3. **Update Environment Variables** with database credentials

## ✨ Success Checklist

- [ ] All code changes committed and pushed
- [ ] Backend environment variables set in Render
- [ ] Frontend environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Backend redeployed
- [ ] Frontend redeployed
- [ ] Backend health check passes (returns movies)
- [ ] Can register new account
- [ ] Can login
- [ ] Can add favorites
- [ ] AI chat works (if GROQ_API_KEY is set)

## 🆘 Need Help?

If still having issues, provide:
1. Backend logs from Render
2. Browser console errors (F12)
3. Which step is failing (registration, login, etc.)

---

**Current Status:**
- ✅ Frontend URL: https://filmpilot.onrender.com
- ✅ Backend URL: https://movie-recommendation-system-075d.onrender.com
- ✅ All code updated to use correct URLs
- ✅ CORS configured for your frontend
- ⏳ Waiting for: Environment variables + Redeployment
