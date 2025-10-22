const Groq = require('groq-sdk');
const axios = require('axios');
const db = require('../config/database');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// AI Chat endpoint
const chat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Get user's favorites for context
        const [favorites] = await db.execute(
            `SELECT movie_title, movie_genres, movie_rating, movie_year 
             FROM favorites 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 10`,
            [userId]
        );

        // Build context about user preferences
        let userContext = '';
        if (favorites.length > 0) {
            const favoriteTitles = favorites.map(f => f.movie_title).join(', ');
            userContext = `\n\nUser's favorite movies include: ${favoriteTitles}`;
        }

        // System prompt for the AI
        const systemPrompt = `You are a helpful movie recommendation assistant. Your job is to suggest movies based on user queries.
        
Guidelines:
- Suggest 3-5 relevant movies based on the user's request
- Consider genres, themes, actors, directors, or moods mentioned
- For each movie, provide: title, brief reason why it matches, and year if known
- Be conversational and friendly
- If the user asks about their favorites or preferences, use the context provided${userContext}
- Keep responses concise but informative`;

        // Prepare messages for Groq
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        // Call Groq API (using Llama 3.3 70B model - fast and powerful)
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = completion.choices[0].message.content;

        // Try to extract movie titles from the response and search TMDB
        const movieSuggestions = await extractAndSearchMovies(aiResponse);

        res.json({
            response: aiResponse,
            movies: movieSuggestions,
            conversationHistory: [
                ...conversationHistory,
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            ]
        });

    } catch (error) {
        console.error('AI Chat error:', error);
        
        if (error.status === 401) {
            return res.status(500).json({ 
                message: 'Groq API key is invalid or missing. Please check your configuration.' 
            });
        }
        
        res.status(500).json({ 
            message: 'Failed to process chat request',
            error: error.message 
        });
    }
};

// Helper function to extract movie titles and search TMDB
async function extractAndSearchMovies(aiResponse) {
    try {
        // Simple regex to find quoted movie titles or titles followed by year
        const titlePattern = /"([^"]+)"|(\w+[^()\n]+)\s*\((\d{4})\)/g;
        const matches = [...aiResponse.matchAll(titlePattern)];
        
        const moviePromises = matches.slice(0, 5).map(async (match) => {
            const title = match[1] || match[2];
            if (!title || title.length < 3) return null;

            try {
                const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                    params: { 
                        api_key: API_KEY, 
                        query: title.trim(),
                        page: 1
                    }
                });

                if (response.data.results && response.data.results.length > 0) {
                    return response.data.results[0]; // Return first match
                }
            } catch (error) {
                console.error(`Error searching for movie: ${title}`, error.message);
            }
            return null;
        });

        const movies = await Promise.all(moviePromises);
        return movies.filter(movie => movie !== null);

    } catch (error) {
        console.error('Error extracting movies:', error);
        return [];
    }
}

module.exports = {
    chat
};
