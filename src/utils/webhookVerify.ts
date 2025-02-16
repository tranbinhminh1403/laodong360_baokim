import crypto from 'crypto';
import { WebhookPayload } from '../types/webhook.types';

export function verifyWebhook(secretKey: string, webhookData: string | WebhookPayload): boolean {
    try {
        let dataToVerify: WebhookPayload;
        let receivedSignature: string;

        // Handle string input (like Java example)
        if (typeof webhookData === 'string') {
            const parsedData = JSON.parse(webhookData);
            dataToVerify = parsedData;
            receivedSignature = parsedData.sign;
        } 
        // Handle direct JSON payload
        else {
            dataToVerify = webhookData;
            receivedSignature = webhookData.sign;
        }

        const { sign, ...dataWithoutSign } = dataToVerify;
        
        // Create signature from the data
        const dataString = JSON.stringify(dataWithoutSign);
        const calculatedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(dataString)
            .digest('hex');

        return calculatedSignature === receivedSignature;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}