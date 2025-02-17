import crypto from 'crypto';
import { WebhookPayload } from '../types/webhook.types';

export function verifyWebhook(secretKey: string, webhookData: string | WebhookPayload): boolean {
    try {
        let dataString: string;
        let receivedSignature: string;

        // Convert to string if object is passed
        if (typeof webhookData === 'string') {
            dataString = webhookData;
            const parsedData = JSON.parse(webhookData);
            receivedSignature = parsedData.sign;
        } else {
            dataString = JSON.stringify(webhookData);
            receivedSignature = webhookData.sign;
        }

        // Create dataHash by removing the last "sign" field similar to Java implementation
        const dataHash = dataString.substring(0, dataString.lastIndexOf('}')) + '}';

        // Calculate signature
        const calculatedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(dataHash)
            .digest('hex')
            .toLowerCase();

        return calculatedSignature === receivedSignature;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}