const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        const exists = await pool.query(
            'SELECT id FROM users WHERE username=$1 OR email=$2',
            [cleanUsername, cleanEmail]
        );

        if (exists.rowCount) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        const hash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users(name,username,email,password_hash,role)
             VALUES($1,$2,$3,$4,'customer')
             RETURNING id,name,username,email,role`,
            [name.trim(), cleanUsername, cleanEmail, hash]
        );

        res.status(201).json({
            message: 'Account created successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE username=$1 AND is_active=TRUE',
            [username.trim().toLowerCase()]
        );

        if (!result.rowCount) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Login failed' });
    }
};
