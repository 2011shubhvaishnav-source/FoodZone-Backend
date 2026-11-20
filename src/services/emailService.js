const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendEmail(to, subject, text) {
    return transporter.sendMail({
        from: `"Food Zone" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text
    });
}

module.exports = { sendEmail, transporter };
