import { BaoKimDataToken, WebhookPayload } from '../types/webhook.types';
import { Orders } from '../entities/Orders';
import { AppDataSource } from '../config/data-source';

export class WebhookService {
    private orderRepository = AppDataSource.getRepository(Orders);

    async processWebhook(payload: WebhookPayload): Promise<boolean> {
        const { order, txn, dataToken } = payload;

        // 1. Verify order status
        if (order.stat !== 'c' || txn.stat !== 1) {
            console.log('Order not completed or transaction not successful');
            return false;
        }

        // 2. Verify order exists and matches
        const existingOrder = await this.orderRepository.findOne({
            where: { mrc_order_id: order.mrc_order_id }
        });

        if (!existingOrder) {
            console.log('Order not found in database');
            return false;
        }

        // 3. Update order status
        existingOrder.status = 'Completed';
        await this.orderRepository.save(existingOrder);

        // 4. Process card token if exists
        if (dataToken && dataToken.length > 0) {
            await this.processCardToken(dataToken[0], order.mrc_order_id);
        }

        return true;
    }

    private async processCardToken(tokenData: BaoKimDataToken, orderId: string) {
        // Implement card token storage logic if needed
        console.log('Processing card token for order:', orderId);
    }
} 