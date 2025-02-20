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
    const response = await axios.post(`${process.env.CONTACT_CENTER_API_URL}/login`, {
      email: process.env.CONTACT_CENTER_ACCOUNT_EMAIL,
      password: process.env.CONTACT_CENTER_ACCOUNT_PASSWORD
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createContactCenterCustomer = async (customerData: ContactCenterCreateCustomer): Promise<ContactCenterCreateResponse> => {
  try {
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
    return response.data;
  } catch (error) {
    console.error(error);
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
