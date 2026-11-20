const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
    forgotPassword,
    resetPassword
} = require('../controllers/passwordResetController');

const otpLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

router.post('/forgot-password', otpLimit, forgotPassword);
router.post('/reset-password', otpLimit, resetPassword);

module.exports = router;
