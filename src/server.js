require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
    res.json({
        company: 'Food Zone',
        status: 'running'
    });
});

app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/password', require('./routes/passwordResetRoutes'));

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodZone Backend running on port ${PORT}`);
});
