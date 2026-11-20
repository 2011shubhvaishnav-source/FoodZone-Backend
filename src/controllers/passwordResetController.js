const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { sendEmail } = require('../services/emailService');

async function forgotPassword(req, res) {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const result = await pool.query(
            'SELECT id, name FROM users WHERE email = $1 AND is_active = TRUE LIMIT 1',
            [email]
        );

        if (result.rows.length > 0) {
            const otp = crypto.randomInt(100000, 1000000).toString();
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            await pool.query(
                `UPDATE password_reset_otps
                 SET used = TRUE
                 WHERE email = $1 AND used = FALSE`,
                [email]
            );

            const saved = await pool.query(
                `INSERT INTO password_reset_otps
                 (email, otp_hash, expires_at)
                 VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
                 RETURNING id`,
                [email, otpHash]
            );

            try {
                await sendEmail(
                    email,
                    'Food Zone Password Reset OTP',
                    `Hello ${result.rows[0].name},

Your Food Zone password reset OTP is: ${otp}

This OTP expires in 10 minutes.
Do not share this OTP with anyone.

Food Zone Team`
                );
            } catch (emailError) {
                await pool.query(
                    'UPDATE password_reset_otps SET used = TRUE WHERE id = $1',
                    [saved.rows[0].id]
                );
                throw emailError;
            }
        }

        return res.json({
            message: 'If this email is registered, a password reset OTP has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        return res.status(500).json({ message: 'Unable to process request' });
    }
}

async function resetPassword(req, res) {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!email || !/^\d{6}$/.test(otp) || newPassword.length < 8) {
        return res.status(400).json({
            message: 'Enter a valid email, 6-digit OTP and password of at least 8 characters.'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `SELECT id, otp_hash
             FROM password_reset_otps
             WHERE email = $1 AND used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC
             LIMIT 1
             FOR UPDATE`,
            [email]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
        const savedHash = result.rows[0].otp_hash;

        const valid = crypto.timingSafeEqual(
            Buffer.from(submittedHash, 'hex'),
            Buffer.from(savedHash, 'hex')
        );

        if (!valid) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        const updated = await client.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 AND is_active = TRUE RETURNING id',
            [passwordHash, email]
        );

        if (updated.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Unable to reset password' });
        }

        await client.query(
            'UPDATE password_reset_otps SET used = TRUE WHERE id = $1',
            [result.rows[0].id]
        );

        await client.query('COMMIT');

        return res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Reset password error:', error.message);
        return res.status(500).json({ message: 'Unable to reset password' });
    } finally {
        client.release();
    }
}

module.exports = { forgotPassword, resetPassword };
