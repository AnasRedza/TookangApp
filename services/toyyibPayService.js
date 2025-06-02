// services/toyyibPayService.js
import axios from 'axios';

class ToyyibPayService {
  constructor() {
    // Sandbox configuration
    this.baseURL = 'https://dev.toyyibpay.com/index.php/api/';
    
    // Replace these with your actual sandbox credentials
    this.userSecretKey = '6ky8wsg5-xv1r-xilv-woq7-xh59vxf7k7bl';
    this.categoryCode = 'feoj9mk8';
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log('toyyibPay API Request:', {
          url: config.url,
          method: config.method,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('toyyibPay Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        console.log('toyyibPay API Response:', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('toyyibPay Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Helper method to truncate text to specified length
  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Create Bill for payment
  async createBill(billData) {
    try {
      const payload = {
        userSecretKey: this.userSecretKey,
        categoryCode: this.categoryCode,
        billName: this.truncateText(billData.billName, 30), // Max 30 characters
        billDescription: this.truncateText(billData.billDescription, 200), // Max 200 characters
        billPriceSetting: 1, // Fixed amount
        billPayorInfo: 1, // Require payer info
        billAmount: Math.round(billData.amount * 100), // Convert to cents
        billReturnUrl: billData.returnUrl || 'https://yourapp.com/payment/success',
        billCallbackUrl: billData.callbackUrl || 'https://yourapp.com/api/payment/callback',
        billExternalReferenceNo: billData.referenceNo,
        billTo: this.truncateText(billData.customerName, 30), // Max 30 characters
        billEmail: billData.customerEmail,
        billPhone: billData.customerPhone,
        billSplitPayment: 0,
        billSplitPaymentArgs: '',
        billPaymentChannel: billData.paymentChannel || '0', // 0=All, 1=E-Wallet, 2=Banking
        billContentEmail: billData.emailContent || `Payment for ${billData.billName}`,
        billChargeToCustomer: 1, // Charge processing fee to customer
        billExpiryDate: billData.expiryDate || '',
        billExpiryDays: billData.expiryDays || 3
      };

      console.log('Creating toyyibPay bill with payload:', payload);

      const response = await this.api.post('createBill', payload);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const result = response.data[0];
        if (result.BillCode) {
          console.log('Bill created successfully:', result);
          return response.data;
        } else {
          throw new Error(result.msg || 'Failed to create bill');
        }
      } else {
        throw new Error('Invalid response format from toyyibPay');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      if (error.response?.data) {
        throw new Error(`toyyibPay Error: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Failed to create payment bill: ${error.message}`);
    }
  }

  // Get Bill Transactions
  async getBillTransactions(billCode) {
    try {
      const payload = {
        userSecretKey: this.userSecretKey,
        billCode: billCode
      };

      const response = await this.api.post('getBillTransactions', payload);
      return response.data;
    } catch (error) {
      console.error('Error getting bill transactions:', error);
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  // Check Bill Status
  async getBillStatus(billCode) {
    try {
      const payload = {
        userSecretKey: this.userSecretKey,
        billCode: billCode
      };

      const response = await this.api.post('getBill', payload);
      return response.data;
    } catch (error) {
      console.error('Error getting bill status:', error);
      throw new Error(`Failed to get bill status: ${error.message}`);
    }
  }

  // Get all bills for user (optional)
  async getAllBills() {
    try {
      const payload = {
        userSecretKey: this.userSecretKey
      };

      const response = await this.api.post('getAllBill', payload);
      return response.data;
    } catch (error) {
      console.error('Error getting all bills:', error);
      throw new Error(`Failed to get bills: ${error.message}`);
    }
  }

  // Verify payment callback (for server-side use)
  verifyCallback(callbackData) {
    // Basic verification - in production, you should implement proper signature verification
    const requiredFields = ['refno', 'status', 'billcode', 'order_id'];
    
    for (const field of requiredFields) {
      if (!callbackData[field]) {
        return {
          isValid: false,
          error: `Missing required field: ${field}`
        };
      }
    }

    return {
      isValid: true,
      status: callbackData.status,
      billCode: callbackData.billcode,
      transactionId: callbackData.transaction_id,
      amount: callbackData.amount,
      referenceNo: callbackData.refno
    };
  }

  // Helper method to format amount for display
  formatAmount(amount) {
    return (amount / 100).toFixed(2);
  }

  // Helper method to get payment status description
  getStatusDescription(statusId) {
    const statuses = {
      '1': 'Successful',
      '2': 'Pending',
      '3': 'Failed'
    };
    return statuses[statusId] || 'Unknown';
  }

  // Helper method to validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to validate phone number (Malaysian format)
  isValidPhone(phone) {
    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Malaysian phone number validation (basic)
    const phoneRegex = /^(\+?6?0?1[0-9]{8,9}|0[1-9][0-9]{7,8})$/;
    return phoneRegex.test(cleanPhone);
  }

  // Method to update configuration (useful for switching between sandbox and production)
  updateConfig(config) {
    if (config.baseURL) {
      this.baseURL = config.baseURL;
      this.api.defaults.baseURL = config.baseURL;
    }
    if (config.userSecretKey) {
      this.userSecretKey = config.userSecretKey;
    }
    if (config.categoryCode) {
      this.categoryCode = config.categoryCode;
    }
  }
}

// Export singleton instance
export const toyyibPayService = new ToyyibPayService();
export default toyyibPayService;

// Switch to dev environment at runtime
toyyibPayService.updateConfig({
  baseURL: 'https://dev.toyyibpay.com/index.php/api/'
});