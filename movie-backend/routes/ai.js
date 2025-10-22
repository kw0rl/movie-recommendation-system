const express = require('express');
const { chat } = require('../controllers/aiController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All AI routes require authentication
router.use(authenticateToken);

// POST /api/ai/chat - Send message to AI assistant
router.post('/chat', chat);

module.exports = router;
