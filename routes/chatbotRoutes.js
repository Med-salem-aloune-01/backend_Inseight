const express = require('express');
const router = express.Router();
const { sendMessage, getHistory } = require('../controllers/chatbotController');
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post('/message', protect, sendMessage);
router.get('/history', protect, getHistory);

module.exports = router;