import axios from 'axios';
import { generateMD5Hash, DataToHash } from '../utils/MD5Encode';
import { PaymentDetailRequest, PaymentDetailSuccess, PaymentDetailError } from '../types/PaymentDetail';
import { ServiceResponse } from '../types/ServiceResponse';
import { verifyResponseMAC } from '../utils/VerifyMAC';

const PAYMENT_DETAIL_API = process.env.PAYMENT_DETAIL_API || '';
const SECRET_KEY = process.env.PAYMENT_SECRET_KEY || '';

export const getPaymentDetail = async (orderReference: string): Promise<ServiceResponse> => {
    try {
        const requestData: PaymentDetailRequest = {
            mac_type: process.env.PAYMENT_MAC_TYPE || '',
            merchant_id: process.env.PAYMENT_MERCHANT_ID || '',
            order_reference: orderReference,
            mac: ''
        };

        // Tạo MAC cho request
        requestData.mac = generateMD5Hash(requestData as unknown as DataToHash, SECRET_KEY);

        const response = await axios.post(PAYMENT_DETAIL_API, requestData);

        // Verify MAC của response nếu là success response
        if (response.data.error_code === '00') {
            const isValidMAC = verifyResponseMAC(response.data, SECRET_KEY);
            if (!isValidMAC) {
                return {
                    success: false,
                    error: 'Invalid response MAC',
                    statusCode: 400
                };
            }
        }

        return {
            success: response.data.error_code === '00',
            data: response.data,
            statusCode: response.data.error_code === '00' ? 200 : 400
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Internal server error',
            statusCode: 500
        };
    }
}; 