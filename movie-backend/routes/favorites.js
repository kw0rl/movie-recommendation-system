const express = require('express');
const { 
    addToFavorites, 
    removeFromFavorites, 
    getUserFavorites, 
    checkFavoriteStatus 
} = require('../controllers/favoritesController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/favorites - Add movie to favorites
router.post('/', addToFavorites);

// DELETE /api/favorites/:movieId - Remove movie from favorites
router.delete('/:movieId', removeFromFavorites);

// GET /api/favorites - Get user's favorites
router.get('/', getUserFavorites);

// GET /api/favorites/check/:movieId - Check if movie is favorite
router.get('/check/:movieId', checkFavoriteStatus);

module.exports = router;