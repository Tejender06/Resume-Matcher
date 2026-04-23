const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.post('/match', matchController.analyzeMatch);

module.exports = router;
