import axios from 'axios';
import { ContactCenterCreateCustomer, ContactCenterCreateResponse, ContactCenterCreateTicket, ContactCenterLoginResponse } from '../types/Types';

let accessToken: string | null = null;

const getAccessToken = async (): Promise<string> => {
  if (!accessToken) {
    const loginResponse = await contactCenterLogin();
    accessToken = loginResponse.access_token;
  }
  return accessToken;
};

export const contactCenterLogin = async (): Promise<ContactCenterLoginResponse> => {
  try {
    console.log('Attempting Contact Center login...');
    const response = await axios.post(`${process.env.CONTACT_CENTER_API_URL}/login`, {
      email: process.env.CONTACT_CENTER_ACCOUNT_EMAIL,
      password: process.env.CONTACT_CENTER_ACCOUNT_PASSWORD
    });
    console.log('Contact Center login successful');
    return response.data;
  } catch (error: any) {
    console.error('Contact Center login failed:', error.response?.data || error.message);
    throw error;
  }
};

export const createContactCenterCustomer = async (customerData: ContactCenterCreateCustomer): Promise<ContactCenterCreateResponse> => {
  try {
    console.log('Creating Contact Center customer:', customerData);
    const token = await getAccessToken();
    const response = await axios.post(
      `${process.env.CONTACT_CENTER_API_URL}/clients`, 
      customerData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Customer created successfully');
    return response.data;
  } catch (error: any) {
    console.error('Create customer failed:', error.response?.data || error.message);
    throw error;
  }
};

export const createContactCenterTicket = async (ticketData: ContactCenterCreateTicket): Promise<ContactCenterCreateResponse> => {
  try {
    const token = await getAccessToken();
    const response = await axios.post(
      `${process.env.CONTACT_CENTER_API_URL}/tickets`, 
      ticketData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
