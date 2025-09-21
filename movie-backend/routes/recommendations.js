const express = require('express');
const { 
    getRecommendations, 
    getRecommendationsWithExplanation 
} = require('../controllers/recommendationsController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/recommendations - Get basic recommendations
router.get('/', getRecommendations);

// GET /api/recommendations/detailed - Get recommendations with explanation
router.get('/detailed', getRecommendationsWithExplanation);

module.exports = router;