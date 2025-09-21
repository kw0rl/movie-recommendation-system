const db = require('../config/database');
const { generateRecommendations } = require('../services/recommendationService');

// Get recommendations for user based on their favorites
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get user's favorites
        const [favorites] = await db.execute(
            'SELECT movie_id, movie_title, movie_genres, movie_rating, movie_year FROM favorites WHERE user_id = ?',
            [userId]
        );

        if (favorites.length === 0) {
            return res.json({
                message: 'No favorites found. Add some movies to your favorites to get recommendations!',
                recommendations: []
            });
        }

        // Get array of movie IDs to exclude from recommendations
        const excludeMovieIds = favorites.map(fav => fav.movie_id);

        // Generate recommendations
        const recommendations = await generateRecommendations(favorites, excludeMovieIds);

        res.json({
            message: `Found ${recommendations.length} recommendations based on your ${favorites.length} favorite movies`,
            favorites_count: favorites.length,
            recommendations: recommendations
        });

    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get recommendations with explanation of why they were recommended
const getRecommendationsWithExplanation = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get user's favorites with details
        const [favorites] = await db.execute(
            `SELECT movie_id, movie_title, movie_genres, movie_rating, movie_year, movie_overview 
             FROM favorites 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );

        if (favorites.length === 0) {
            return res.json({
                message: 'No favorites found. Add some movies to your favorites to get recommendations!',
                recommendations: [],
                user_preferences: null
            });
        }

        // Analyze user preferences
        const genresCount = {};
        let totalRating = 0;
        let ratingCount = 0;

        favorites.forEach(fav => {
            try {
                const genres = JSON.parse(fav.movie_genres || '[]');
                genres.forEach(genreId => {
                    genresCount[genreId] = (genresCount[genreId] || 0) + 1;
                });
            } catch (e) {
                console.error('Error parsing genres:', e);
            }

            if (fav.movie_rating) {
                totalRating += fav.movie_rating;
                ratingCount++;
            }
        });

        const topGenres = Object.entries(genresCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([genreId, count]) => ({ genreId: parseInt(genreId), count }));

        const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null;

        // Get array of movie IDs to exclude
        const excludeMovieIds = favorites.map(fav => fav.movie_id);

        // Generate recommendations
        const recommendations = await generateRecommendations(favorites, excludeMovieIds);

        res.json({
            message: `Found ${recommendations.length} recommendations based on your preferences`,
            favorites_count: favorites.length,
            user_preferences: {
                favorite_genres: topGenres,
                average_rating_preference: averageRating,
                total_favorites: favorites.length
            },
            recommendations: recommendations.map(movie => ({
                ...movie,
                explanation: `Recommended because it matches your taste in ${movie.genres?.slice(0, 2).map(g => g.name).join(' and ')} movies`
            }))
        });

    } catch (error) {
        console.error('Get recommendations with explanation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getRecommendations,
    getRecommendationsWithExplanation
};