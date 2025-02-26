import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: 'pro57.emailserver.vn',
    port: 465,
    secure: true, // use SSL/TLS
    pool: true,
    maxConnections: 5,
    maxMessages: Infinity,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
}); 