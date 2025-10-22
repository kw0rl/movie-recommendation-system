# AI Chat Feature Setup Guide

## ✅ What's Been Implemented

### Backend (movie-backend/)
1. **OpenAI SDK installed** - `npm install openai` (already done)
2. **AI Controller** - `controllers/aiController.js` - handles chat requests and movie suggestions
3. **AI Routes** - `routes/ai.js` - defines `/api/ai/chat` endpoint
4. **Server Integration** - `server.js` updated to include AI routes

### Frontend (movie-frontend/)
1. **ChatBox Component** - `src/components/ChatBox.tsx` - full-featured chat UI
2. **Layout Integration** - `src/app/layout.tsx` - ChatBox added globally

## 🔧 Final Setup Steps

### 1. Add Groq API Key to Backend

**UPDATE:** Now using Groq instead of OpenAI (faster and free!)

Add your Groq API key to your backend `.env` file:

```bash
# Open movie-backend/.env and add this line:
GROQ_API_KEY=your-groq-api-key-here
```

Your `.env` file should now have:
```
TMDB_API_KEY=your-tmdb-key
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=movie_recommendation
```

### 2. Restart Backend Server

```bash
cd movie-backend
npm run dev
```

### 3. Restart Frontend (if running)

```bash
cd movie-frontend
npm run dev
```

## 🎯 How to Use

1. **Log in** to your account (AI chat only works for logged-in users)
2. Look for the **blue chat button** in the bottom-right corner
3. Click it to open the chat window
4. Ask questions like:
   - "Suggest action movies like John Wick"
   - "I want a romantic comedy"
   - "Movies similar to Inception"
   - "What should I watch tonight?"

## 🎬 Features

- **Personalized Suggestions** - AI considers your favorite movies
- **TMDB Integration** - Suggested movies are linked to real TMDB data
- **Clickable Movie Cards** - Click suggested movies to view details
- **Conversation History** - Maintains context throughout the chat
- **Auth Protection** - Only available to logged-in users
- **Session Handling** - Gracefully handles expired tokens

## 🔍 Testing

1. Open your app at `http://localhost:3000`
2. Log in with your account
3. Click the chat button (bottom-right)
4. Try these test prompts:
   - "Suggest 3 sci-fi movies"
   - "I like Marvel movies, what else should I watch?"
   - "Recommend something based on my favorites"

## 🐛 Troubleshooting

### Chat button doesn't appear
- Make sure you're logged in
- Check browser console for errors

### "Groq API key is invalid" error
- Verify the key is correctly added to `.env` as `GROQ_API_KEY`
- Make sure you restarted the backend after adding the key
- Check that the key is active at https://console.groq.com

### Movies not showing in suggestions
- This is normal if the AI response doesn't contain recognizable movie titles
- The AI will still provide text recommendations

### 403 Forbidden errors
- Your session may have expired - log in again
- Check that the JWT_SECRET matches between login and chat requests

## 📝 API Endpoint

**POST** `/api/ai/chat`

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Suggest action movies",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "response": "AI text response...",
  "movies": [
    {
      "id": 123,
      "title": "Movie Title",
      "poster_path": "/path.jpg",
      "vote_average": 8.5,
      "release_date": "2024-01-01"
    }
  ],
  "conversationHistory": [...]
}
```

## 🎨 Customization

### Change AI Model
Edit `controllers/aiController.js` line 59:
```javascript
model: 'llama-3.1-70b-versatile',  // Other options: 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'
```

### Adjust Response Length
Edit `controllers/aiController.js` line 56:
```javascript
max_tokens: 500,  // Increase for longer responses
```

### Modify System Prompt
Edit the `systemPrompt` in `controllers/aiController.js` to change AI behavior

## ✅ Checklist

- [x] Groq SDK installed (`npm install groq-sdk`)
- [x] Code updated to use Groq instead of OpenAI
- [ ] Groq API key added to `movie-backend/.env` as `GROQ_API_KEY`
- [ ] Backend server restarted
- [ ] Frontend running
- [ ] Logged in to test account
- [ ] Chat button visible in bottom-right
- [ ] Test prompt sent successfully

## 🎉 You're Done!

The AI chat feature is now fully integrated into your movie recommendation system!
