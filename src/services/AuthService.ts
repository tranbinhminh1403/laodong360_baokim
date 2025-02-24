import jwt from 'jsonwebtoken';
import { LoginRequest, LoginResponse } from '../types/AuthTypes';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    // Validate against environment variables
    if (
      credentials.username !== process.env.ADMIN_USERNAME ||
      credentials.password !== process.env.ADMIN_PASSWORD
    ) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: credentials.username },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      success: true,
      token
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}; 