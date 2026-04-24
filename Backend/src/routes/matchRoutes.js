const express = require('express');
const multer = require('multer');
const router = express.Router();
const matchController = require('../controllers/matchController');

// Set up multer to store uploaded files in memory
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

router.post('/match', upload.single('resumeFile'), matchController.analyzeMatch);

module.exports = router;
