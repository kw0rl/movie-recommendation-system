require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Import auth routes
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const recommendationsRoutes = require('./routes/recommendations');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(cors());
app.use(express.json());

// Use auth routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/genres', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: { api_key: API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching genres:', error.message);
        if (error.response) {
            console.error('TMDB error status:', error.response.status);
            console.error('TMDB error data:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

app.get('/api/movies/popular', async (req, res) => {
    const { genre } = req.query;

    try {
        console.log('API_KEY:', API_KEY ? 'Present' : 'Missing');
        console.log('Making request to TMDB...');
        
        let allMovies = [];

        if (genre) {
            // Fetch movies by genre
            const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: API_KEY,
                    with_genres: genre,
                    page: 1
                }
            });
            allMovies = response.data.results;
        } else {
            // Get multiple pages to increase number of movies
            const page1 = axios.get(`${TMDB_BASE_URL}/movie/popular`, {
                params: { api_key: API_KEY, page: 1 }
            });
            const page2 = axios.get(`${TMDB_BASE_URL}/movie/popular`, {
                params: { api_key: API_KEY, page: 2 }
            });
            const page3 = axios.get(`${TMDB_BASE_URL}/movie/popular`, {
                params: { api_key: API_KEY, page: 3 }
            });

            const [response1, response2, response3] = await Promise.all([page1, page2, page3]);

            // Combine results from all pages
            allMovies = [
                ...response1.data.results,
                ...response2.data.results,
                ...response3.data.results
            ];
        }
        
        console.log('Total number of movies:', allMovies.length);
        
        // Return combined results in the same format as TMDB
        res.json({
            page: 1,
            results: allMovies,
            total_results: allMovies.length
        });
    } catch (error) {
        console.error('Error details:', error.message);
        if (error.response) {
            console.error('TMDB error status:', error.response.status);
            console.error('TMDB error data:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch popular movies'});
    }
});

app.get('/api/movies/search', async (req, res) => {
    const { query } = req.query;
    
    try {
        console.log('Search query:', query);
        console.log('API_KEY:', API_KEY ? 'Present' : 'Missing');
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        
        // Get first 2 pages of search results for more movies
        const page1 = axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: { api_key: API_KEY, query, page: 1 }
        });
        const page2 = axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: { api_key: API_KEY, query, page: 2 }
        });
        
        const [response1, response2] = await Promise.all([page1, page2]);
        
        // Combine search results from both pages
        const allMovies = [
            ...response1.data.results,
            ...response2.data.results
        ];
        
        console.log('Search response status:', response1.status);
        console.log('Total number of search results:', allMovies.length);
        
        // Return combined results
        res.json({
            page: 1,
            results: allMovies,
            total_pages: response1.data.total_pages,
            total_results: allMovies.length
        });
    } catch (error) {
        console.error('Search error details:', error.message);
        if (error.response) {
            console.error('TMDB search error status:', error.response.status);
            console.error('TMDB search error data:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

// Get movie details by ID
app.get('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log('Fetching movie details for ID:', id);
        
        // Get movie details, credits, videos, and similar movies in parallel
        const movieDetails = axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
            params: { api_key: API_KEY }
        });
        const movieCredits = axios.get(`${TMDB_BASE_URL}/movie/${id}/credits`, {
            params: { api_key: API_KEY }
        });
        const movieVideos = axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
            params: { api_key: API_KEY }
        });
        const similarMovies = axios.get(`${TMDB_BASE_URL}/movie/${id}/similar`, {
            params: { api_key: API_KEY }
        });
        const movieReviews = axios.get(`${TMDB_BASE_URL}/movie/${id}/reviews`, {
            params: { api_key: API_KEY }
        });
        
        const [detailsRes, creditsRes, videosRes, similarRes, reviewsRes] = await Promise.all([
            movieDetails, movieCredits, movieVideos, similarMovies, movieReviews
        ]);
        
        // Combine all data
        const movieData = {
            ...detailsRes.data,
            credits: creditsRes.data,
            videos: videosRes.data,
            similar: similarRes.data,
            reviews: reviewsRes.data
        };
        
        console.log('Movie details fetched successfully');
        res.json(movieData);
    } catch (error) {
        console.error('Movie details error:', error.message);
        if (error.response) {
            console.error('TMDB movie details error status:', error.response.status);
        }
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

// Get detailed movie information
app.get('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log('Fetching movie details for ID:', id);
        
        // Get movie details, credits, and similar movies in parallel
        const movieDetails = axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
            params: { api_key: API_KEY }
        });
        
        const movieCredits = axios.get(`${TMDB_BASE_URL}/movie/${id}/credits`, {
            params: { api_key: API_KEY }
        });
        
        const similarMovies = axios.get(`${TMDB_BASE_URL}/movie/${id}/similar`, {
            params: { api_key: API_KEY }
        });
        
        const movieVideos = axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
            params: { api_key: API_KEY }
        });
        
        const [detailsResponse, creditsResponse, similarResponse, videosResponse] = await Promise.all([
            movieDetails, movieCredits, similarMovies, movieVideos
        ]);
        
        // Combine all data
        const movieData = {
            ...detailsResponse.data,
            credits: creditsResponse.data,
            similar: similarResponse.data.results?.slice(0, 6) || [], // Get first 6 similar movies
            videos: videosResponse.data.results?.filter(video => video.type === 'Trailer') || []
        };
        
        console.log('Movie details fetched successfully');
        res.json(movieData);
        
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        if (error.response) {
            console.error('TMDB error status:', error.response.status);
            console.error('TMDB error data:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 