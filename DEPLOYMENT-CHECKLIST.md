# Deployment Checklist - Movie Recommendation System

## ✅ Changes Made

### Frontend Updates
All API endpoints have been updated from DigitalOcean URL to your Render backend:
- ✅ `src/config/api.ts` - Created centralized API configuration
- ✅ `src/app/register/page.tsx` - Updated registration endpoint
- ✅ `src/app/login/page.tsx` - Updated login endpoint
- ✅ `src/app/page.tsx` - Updated popular movies endpoint
- ✅ `src/app/search/page.tsx` - Updated search endpoint
- ✅ `src/app/movie/[id]/page.tsx` - Updated movie details endpoint
- ✅ `src/app/favorites/page.tsx` - Updated favorites & recommendations endpoints
- ✅ `src/components/FavoriteButton.tsx` - Updated favorite operations
- ✅ `src/components/ChatBox.tsx` - Updated AI chat endpoint

All endpoints now use: `https://movie-recommendation-system-075d.onrender.com`

### Backend Updates
- ✅ CORS configuration already in place (supports multiple origins)

## 🔧 Required Actions

### 1. Backend (Render) - CRITICAL
Your backend CORS needs to include your frontend URL. Update line 22 in `server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  'https://filmpilot.onrender.com', // Replace with your actual frontend URL
  'https://YOUR-FRONTEND-APP.onrender.com' // Add your frontend URL here
].filter(Boolean);
```

**OR** set environment variable in Render:
```
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### 2. Frontend (Render) - Environment Variable
In your Render dashboard for the frontend, add:
```
NEXT_PUBLIC_API_URL=https://movie-recommendation-system-075d.onrender.com
```

### 3. Database Connection - CHECK THIS
Verify your backend can connect to the database:
1. Go to Render dashboard → Your backend service → Logs
2. Look for database connection errors
3. Ensure these environment variables are set:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME=movie_recommendation`
   - `DB_PORT=3306`
   - `DB_SSL=true` (if using managed MySQL)

### 4. Other Backend Environment Variables
Ensure these are set in Render:
- `TMDB_API_KEY` - Your TMDB API key
- `GROQ_API_KEY` - Your Groq API key for AI features
- `JWT_SECRET` - Secret for JWT tokens
- `PORT=5000` (optional, Render sets this automatically)

## 🧪 Testing Steps

### Test Backend
1. Visit: https://movie-recommendation-system-075d.onrender.com/api/movies/popular
   - Should return JSON with movies
   - If error, check backend logs

### Test Frontend After Redeployment
1. Visit your frontend URL
2. Try to register a new account
3. Check browser console (F12) for errors
4. If "Network error" persists:
   - Check backend logs for CORS errors
   - Verify frontend URL is in `allowedOrigins`
   - Check database connection

## 📝 What's Your Frontend URL?

Please provide your frontend Render URL so I can:
1. Add it to the backend CORS configuration
2. Verify the connection works

Format: `https://your-app-name.onrender.com`

## 🐛 Common Issues

### "Network error. Please try again."
**Causes:**
1. Backend not running
2. CORS blocking the request
3. Database not connected
4. Wrong backend URL in frontend

**Solution:**
1. Check backend is running and responding
2. Add frontend URL to CORS allowlist
3. Check database connection in logs
4. Verify `NEXT_PUBLIC_API_URL` is set correctly

### Backend Logs Show "CORS Error"
**Solution:** Add your frontend URL to `allowedOrigins` array in `server.js`

### "Database connection failed"
**Solution:** 
- Check all DB environment variables are set
- If using managed MySQL, enable SSL with `DB_SSL=true`
- Check database host allows connections from Render IPs

## 📦 Deployment Commands

### Frontend
```bash
npm install
npm run build
npm start
```

### Backend
```bash
npm install
node server.js
```

## ✨ Next Steps
1. Tell me your frontend URL
2. Redeploy backend after adding frontend URL to CORS
3. Redeploy frontend with environment variable set
4. Test registration/login
