import crypto from 'crypto';
import { WebhookPayload } from '../types/webhook.types';

export function verifyWebhook(secretKey: string, webhookData: WebhookPayload): boolean {
    try {
        const { sign: receivedSignature, ...dataWithoutSign } = webhookData;
        
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