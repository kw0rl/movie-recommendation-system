const db = require('../config/database');

// Add movie to favorites
const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { 
            movieId, 
            movieTitle, 
            moviePoster, 
            movieGenres, 
            movieRating, 
            movieYear,
            movieOverview 
        } = req.body;

        // Check if already in favorites
        const [existing] = await db.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Movie already in favorites' });
        }

        // Add to favorites
        const [result] = await db.execute(
            `INSERT INTO favorites 
             (user_id, movie_id, movie_title, movie_poster, movie_genres, movie_rating, movie_year, movie_overview) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, movieId, movieTitle, moviePoster, JSON.stringify(movieGenres), movieRating, movieYear, movieOverview]
        );

        res.status(201).json({
            message: 'Movie added to favorites',
            favoriteId: result.insertId
        });

    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove movie from favorites
const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { movieId } = req.params;

        const [result] = await db.execute(
            'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found in favorites' });
        }

        res.json({ message: 'Movie removed from favorites' });

    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's favorites
const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [favorites] = await db.execute(
            `SELECT movie_id, movie_title, movie_poster, movie_genres, movie_rating, movie_year, movie_overview, created_at 
             FROM favorites 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );

        // Parse JSON genres back to array
        const favoritesWithGenres = favorites.map(fav => ({
            ...fav,
            movie_genres: JSON.parse(fav.movie_genres || '[]')
        }));

        res.json(favoritesWithGenres);

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if movie is in favorites
const checkFavoriteStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { movieId } = req.params;

        const [result] = await db.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        res.json({ isFavorite: result.length > 0 });

    } catch (error) {
        console.error('Check favorite status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    checkFavoriteStatus
};