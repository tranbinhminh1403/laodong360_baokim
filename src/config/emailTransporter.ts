import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    pool: true, // Sử dụng connection pooling
    maxConnections: 5, // Số lượng kết nối tối đa
    maxMessages: Infinity,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
}); 