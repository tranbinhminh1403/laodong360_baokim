import { Request, Response } from 'express';
import { contactCenterLogin } from '../services/ContactCenterService';

export const testContactCenterLogin = async (req: Request, res: Response) => {
    try {
        console.log('Testing Contact Center Login...');
        
        const loginResponse = await contactCenterLogin();
        
        console.log('Login Response:', {
            token: loginResponse.access_token,
            status: loginResponse.status,
            hasToken: !!loginResponse.access_token,
            tokenLength: loginResponse.access_token?.length
        });
        
        return res.status(200).json({
            success: true,
            data: {
                status: loginResponse.status,
                hasToken: !!loginResponse.access_token,
                tokenLength: loginResponse.access_token?.length
            }
        });
    } catch (error: any) {
        console.error('Login Test Failed:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
            response: error.response?.data
        });
    }
}; 