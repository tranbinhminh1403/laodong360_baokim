import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
    throw new Error('API_KEY and SECRET_KEY must be defined in environment variables');
}

// console.log(API_KEY, SECRET_KEY)

export function getJwtBaoKim(apiKey: string, secretKey: string) {
    // Create header
    const header = {
        typ: 'JWT',
        alg: 'HS256'
    };
    const base64UrlHeader = Buffer.from(JSON.stringify(header))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    // Create payload
    const timeSecs = Math.floor(Date.now());
    const payload = {
        iat: timeSecs,
        iss: apiKey,
        exp: timeSecs
    };
    const base64UrlPayload = Buffer.from(JSON.stringify(payload))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    try {
        // Create signature
        const signature = hmacEncode(base64UrlHeader + "." + base64UrlPayload, secretKey);
        return `${base64UrlHeader}.${base64UrlPayload}.${signature}`;
    } catch (error: any) {
        throw new Error("Unable to generate a JWT token: " + error.message);
    }
}

function hmacEncode(data: string, key: string) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return hmac.digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Sử dụng
// const jwt = getJwtBaoKim('your_api_key', 'your_secret_key');

console.log(getJwtBaoKim(API_KEY, SECRET_KEY))