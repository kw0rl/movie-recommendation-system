# Deployment Configuration

## Environment Variables

### Frontend (Render/Vercel)
Set this environment variable in your deployment platform:

```
NEXT_PUBLIC_API_URL=https://movie-recommendation-system-075d.onrender.com
```

### Backend (Render)
Make sure these environment variables are set:

```
PORT=5000
TMDB_API_KEY=your_tmdb_api_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=movie_recommendation
DB_PORT=3306
DB_SSL=true
```

## Deployment Steps

### 1. Backend on Render
- Already deployed at: https://movie-recommendation-system-075d.onrender.com
- Make sure database is connected
- Check logs for any errors

### 2. Frontend on Render
- Set environment variable: `NEXT_PUBLIC_API_URL=https://movie-recommendation-system-075d.onrender.com`
- Build command: `npm run build`
- Start command: `npm start`

### 3. CORS Configuration
Your backend needs to allow your frontend domain. Update `server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

## Troubleshooting

### Network Error on Registration
- Check backend is running: Visit https://movie-recommendation-system-075d.onrender.com/api/movies/popular
- Check CORS: Backend must allow your frontend domain
- Check database: Backend logs should show database connection status
- Check environment variables: All required vars must be set in Render dashboard
