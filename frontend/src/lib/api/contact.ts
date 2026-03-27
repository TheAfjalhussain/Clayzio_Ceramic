/**
 * Contact API Service
 * 
 * Handles contact form submissions and newsletter signups
 */

import { api, ApiResponse } from './client';

// ============ Types ============

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface BusinessInquiryData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  service_type: string;
  message: string;
}

// ============ API Methods ============

export const contactApi = {
  /**
   * Submit contact form
   */
  submit: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      '/contact',
      data,
      { skipAuth: true }
    );
    return response.data || { success: true, message: 'Message sent successfully' };
  },

  /**
   * Submit business inquiry
   */
  submitBusinessInquiry: async (data: BusinessInquiryData): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      '/business/inquiry',
      data,
      { skipAuth: true }
    );
    return response.data || { success: true, message: 'Inquiry submitted successfully' };
  },

  /**
   * Subscribe to newsletter
   */
  subscribeNewsletter: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      '/contact/newsletter',
      { email },
      { skipAuth: true }
    );
    return response.data || { success: true, message: 'Subscribed successfully' };
  },
};

export default contactApi;
