import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.MAIL_USERNAME;
const password = process.env.MAIL_PASSWORD;

console.log(username + '\n' + password);

export const transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: 'pro57.emailserver.vn',
    port: 465,
    secure: true,
    pool: true, 
    maxConnections: 5, 
    maxMessages: Infinity,
    auth: {
        user: username,
        pass: password
    }
}); 