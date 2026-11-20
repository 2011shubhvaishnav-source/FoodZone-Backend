require('dotenv').config();
const { transporter, sendEmail } = require('./emailService');

async function test() {
    try {
        await transporter.verify();
        console.log('Gmail SMTP connection successful!');

        await sendEmail(
            process.env.SMTP_USER,
            'Food Zone Email Test',
            'Food Zone Gmail OTP service is connected successfully.'
        );

        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Email Error:', error.message);
    }
}

test();
