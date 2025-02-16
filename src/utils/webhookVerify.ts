import crypto from 'crypto';

export function verifyWebhook(secretKey: string, webhookData: string): boolean {
    try {
        const webhookObj = JSON.parse(webhookData);
        const { sign: receivedSignature, ...dataWithoutSign } = webhookObj;
        
        // Create signature from the data
        const dataString = JSON.stringify(dataWithoutSign);
        const calculatedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(dataString)
            .digest('hex');

        // Compare signatures
        return calculatedSignature === receivedSignature;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}