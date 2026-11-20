const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const auth = require('../controllers/authController');

const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

router.post('/register', auth.register);
router.post('/login', loginLimit, auth.login);

module.exports = router;
