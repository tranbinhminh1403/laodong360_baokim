// import axios from 'axios';
// import { generateMD5Hash, DataToHash } from '../utils/MD5Encode';
// import { PaymentOrderRequest, PaymentOrderSuccess, PaymentOrderError } from '../types/PaymentOrder';

// const PAYMENT_API = process.env.PAYMENT_API_URL || '';
// const SECRET_KEY = process.env.PAYMENT_SECRET_KEY || '';

// export const createPaymentOrder = async (orderReference: string, amount: string): Promise<PaymentOrderSuccess | PaymentOrderError> => {
//     const requestData: PaymentOrderRequest = {
//         amount: amount,
//         currency: process.env.PAYMENT_CURRENCY || "VND",
//         access_code: process.env.PAYMENT_ACCESS_CODE || "",
//         mac_type: process.env.PAYMENT_MAC_TYPE || "",
//         merchant_id: process.env.PAYMENT_MERCHANT_ID || "",
//         order_info: "Test",
//         order_reference: orderReference,
//         return_url: process.env.PAYMENT_RETURN_URL || "",
//         ipn_url: process.env.PAYMENT_IPN_URL || "",
//         pay_type: "pay",
//         ip_address: "192.168.1.1",
//         payment_method: "QR",
//         mac: ""
//     };

//     requestData.mac = generateMD5Hash(requestData as unknown as DataToHash, SECRET_KEY);
//     console.log(requestData);

//     try {
//         const response = await axios.post(PAYMENT_API, requestData);
//         console.log(response.data);
//         return response.data;
//     } catch (error: any) {
//         return {
//             message: error.response?.data?.message,
//             error_code: error.response?.data?.error_code
//         };
//     }
// }; 

import axios from 'axios';
import { generateMD5Hash, DataToHash } from '../utils/MD5Encode';
import { PaymentOrderRequest, PaymentOrderSuccess, PaymentOrderError } from '../types/PaymentOrder';
import { verifyResponseMAC } from '../utils/VerifyMAC';

const PAYMENT_API = process.env.PAYMENT_API_URL || '';
const SECRET_KEY = process.env.PAYMENT_SECRET_KEY || '';

export const createPaymentOrder = async (
    orderReference: string, 
    amount: string,
    ip_address: string
): Promise<PaymentOrderSuccess | PaymentOrderError> => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Start payment order process for reference: ${orderReference}`);

    try {
        const prepareStart = Date.now();
        const requestData: PaymentOrderRequest = {
            amount: amount,
            currency: process.env.PAYMENT_CURRENCY || "VND",
            access_code: process.env.PAYMENT_ACCESS_CODE || "",
            mac_type: process.env.PAYMENT_MAC_TYPE || "",
            merchant_id: process.env.PAYMENT_MERCHANT_ID || "",
            order_info: `${orderReference}`,
            order_reference: orderReference,
            return_url: process.env.PAYMENT_RETURN_URL || "",
            ipn_url: process.env.PAYMENT_IPN_URL || "",
            pay_type: process.env.PAYMENT_PAY_TYPE || "",
            ip_address: ip_address,
            payment_method: process.env.PAYMENT_METHOD || "",
            mac: ""
        };
        const prepareTime = Date.now() - prepareStart;
        console.log(`[${new Date().toISOString()}] Prepare request data took ${prepareTime}ms`);

        const macStart = Date.now();
        requestData.mac = generateMD5Hash(requestData as unknown as DataToHash, SECRET_KEY);
        const macTime = Date.now() - macStart;
        console.log(`[${new Date().toISOString()}] Generate MAC took ${macTime}ms`);

        console.log('Request data:', {requestData});

        const apiCallStart = Date.now();
        const response = await axios.post(PAYMENT_API, requestData);
        const apiCallTime = Date.now() - apiCallStart;
        console.log(`[${new Date().toISOString()}] Payment API call took ${apiCallTime}ms`);

        // Verify MAC của response
        const isValidMAC = verifyResponseMAC(response.data, SECRET_KEY);
        if (!isValidMAC) {
            console.error('Invalid MAC in payment response');
            throw new Error('Invalid payment response MAC');
        }

        console.log('Payment API response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });

        const totalTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Complete payment order process. Total time: ${totalTime}ms`);
        console.log('Payment order performance breakdown:');
        console.log(`- Prepare request data: ${prepareTime}ms`);
        console.log(`- Generate MAC: ${macTime}ms`);
        console.log(`- API call: ${apiCallTime}ms`);

        return response.data;
    } catch (error: any) {
        const errorTime = Date.now() - startTime;
        console.error(`[${new Date().toISOString()}] Payment order failed after ${errorTime}ms:`, error.message);
        console.error('Error details:', {
            status: error.response?.status,
            data: error.response?.data
        });
        
        return {
            message: error.message === 'Invalid payment response MAC' 
                ? 'Payment response validation failed' 
                : error.response?.data?.message || 'Payment API call failed',
            error_code: error.message === 'Invalid payment response MAC'
                ? 'INVALID_MAC'
                : error.response?.data?.error_code || 'UNKNOWN'
        };
    }
};