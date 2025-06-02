// services/toyyibPayService.js - ToyybPay Integration with Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PAYMENT_CONFIG, getCurrentConfig, validateConfig } from '../config/paymentConfig';

// Get current environment configuration
const getConfig = () => {
  const envConfig = getCurrentConfig();
  const credentials = PAYMENT_CONFIG.TOYYIBPAY.CREDENTIALS;
  const callbacks = PAYMENT_CONFIG.TOYYIBPAY.CALLBACKS;
  
  return {
    ...envConfig,
    ...credentials,
    ...callbacks
  };
};

export const toyyibPayService = {
  /**
   * Initialize and validate configuration
   * @returns {Object} Validation result
   */
  validateConfiguration: () => {
    return validateConfig();
  },

  /**
   * Create a bill for payment
   * @param {Object} billData - Bill information
   * @returns {Promise<Object>} - Bill creation response
   */
  createBill: async (billData) => {
    try {
      console.log('Creating ToyybPay bill:', billData);
      
      // Validate configuration first
      const configValidation = validateConfig();
      if (!configValidation.valid) {
        throw new Error(`Configuration issues: ${configValidation.issues.join(', ')}`);
      }
      
      const config = getConfig();
      const settings = PAYMENT_CONFIG.TOYYIBPAY.SETTINGS;
      
      const requestBody = {
        userSecretKey: config.USER_SECRET_KEY,
        categoryCode: config.CATEGORY_CODE,
        billName: billData.billName,
        billDescription: billData.billDescription,
        billPriceSetting: 1, // Fixed amount
        billPayorInfo: settings.COLLECT_PAYER_INFO,
        billAmount: (billData.amount * 100).toString(), // Convert to sen (multiply by 100)
        billReturnUrl: config.RETURN_URL,
        billCallbackUrl: config.CALLBACK_URL,
        billExternalReferenceNo: billData.referenceNo,
        billTo: billData.payerName,
        billEmail: billData.payerEmail,
        billPhone: billData.payerPhone || '',
        billSplitPayment: settings.SPLIT_PAYMENT,
        billSplitPaymentArgs: '',
        billPaymentChannel: billData.paymentChannel || settings.PAYMENT_CHANNELS,
        billContentEmail: billData.billDescription,
        billChargeToCustomer: settings.CHARGE_TO_CUSTOMER,
        billExpiryDate: billData.expiryDate || '', // Optional: YYYY-MM-DD format
        billExpiryDays: billData.expiryDays || settings.DEFAULT_EXPIRY_DAYS,
      };

      console.log('ToyybPay request:', requestBody);

      const response = await fetch(config.CREATE_BILL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: Object.keys(requestBody)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(requestBody[key])}`)
          .join('&'),
      });

      const responseText = await response.text();
      console.log('ToyybPay raw response:', responseText);

      // ToyybPay returns different response formats
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If not JSON, treat as bill code (successful response)
        if (responseText && !responseText.includes('ERROR')) {
          result = {
            success: true,
            billCode: responseText.trim(),
            paymentUrl: `${config.PAYMENT_URL}${responseText.trim()}`,
          };
        } else {
          throw new Error(`ToyybPay Error: ${responseText}`);
        }
      }

      if (result.success || result.billCode || (!result.error && result)) {
        const billCode = result.billCode || result[0]?.BillCode || responseText.trim();
        const paymentUrl = `${config.PAYMENT_URL}${billCode}`;
        
        // Store bill information locally
        await AsyncStorage.setItem(`toyyibpay_bill_${billData.referenceNo}`, JSON.stringify({
          billCode,
          amount: billData.amount,
          referenceNo: billData.referenceNo,
          paymentUrl,
          paymentChannel: billData.paymentChannel,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }));

        return {
          success: true,
          billCode,
          paymentUrl,
          data: result
        };
      } else {
        throw new Error(result.error || result.msg || 'Failed to create bill');
      }
    } catch (error) {
      console.error('ToyybPay createBill error:', error);
      throw error;
    }
  },IBPAY_CONFIG.CATEGORY_CODE,
        billName: billData.billName,
        billDescription: billData.billDescription,
        billPriceSetting: 1, // Fixed amount
        billPayorInfo: 1, // Collect payer info
        billAmount: (billData.amount * 100).toString(), // Convert to sen (multiply by 100)
        billReturnUrl: TOYYIBPAY_CONFIG.RETURN_URL,
        billCallbackUrl: TOYYIBPAY_CONFIG.CALLBACK_URL,
        billExternalReferenceNo: billData.referenceNo,
        billTo: billData.payerName,
        billEmail: billData.payerEmail,
        billPhone: billData.payerPhone || '',
        billSplitPayment: 0,
        billSplitPaymentArgs: '',
        billPaymentChannel: '0', // 0 = FPX, 1 = Credit Card, 2 = Both
        billContentEmail: billData.billDescription,
        billChargeToCustomer: 1, // Customer pays the fee
        billExpiryDate: billData.expiryDate || '', // Optional: YYYY-MM-DD format
        billExpiryDays: billData.expiryDays || 3, // Bill expires in 3 days
      };

      console.log('ToyybPay request:', requestBody);

      const response = await fetch(TOYYIBPAY_CONFIG.CREATE_BILL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: Object.keys(requestBody)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(requestBody[key])}`)
          .join('&'),
      });

      const responseText = await response.text();
      console.log('ToyybPay raw response:', responseText);

      // ToyybPay returns different response formats
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If not JSON, treat as bill code (successful response)
        if (responseText && !responseText.includes('ERROR')) {
          result = {
            success: true,
            billCode: responseText.trim(),
            paymentUrl: `${TOYYIBPAY_CONFIG.PAYMENT_URL}${responseText.trim()}`,
          };
        } else {
          throw new Error(`ToyybPay Error: ${responseText}`);
        }
      }

      if (result.success || result.billCode || (!result.error && result)) {
        const billCode = result.billCode || result[0]?.BillCode || responseText.trim();
        const paymentUrl = `${TOYYIBPAY_CONFIG.PAYMENT_URL}${billCode}`;
        
        // Store bill information locally
        await AsyncStorage.setItem(`toyyibpay_bill_${billData.referenceNo}`, JSON.stringify({
          billCode,
          amount: billData.amount,
          referenceNo: billData.referenceNo,
          paymentUrl,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }));

        return {
          success: true,
          billCode,
          paymentUrl,
          data: result
        };
      } else {
        throw new Error(result.error || result.msg || 'Failed to create bill');
      }
    } catch (error) {
      console.error('ToyybPay createBill error:', error);
      throw error;
    }
  },

  /**
   * Get bill transaction status
   * @param {string} billCode - Bill code from ToyybPay
   * @returns {Promise<Object>} - Transaction status
   */
  getBillStatus: async (billCode) => {
    try {
      const config = getConfig();
      
      const requestBody = {
        billCode: billCode,
      };

      const response = await fetch(config.GET_BILL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: Object.keys(requestBody)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(requestBody[key])}`)
          .join('&'),
      });

      const result = await response.json();
      console.log('ToyybPay status response:', result);

      if (result && Array.isArray(result) && result.length > 0) {
        const transaction = result[0];
        return {
          success: true,
          status: transaction.billpaymentStatus, // 1 = Success, 2 = Pending, 3 = Failed
          amount: parseFloat(transaction.billpaymentAmount) / 100, // Convert from sen
          paidDate: transaction.billpaymentDate,
          invoiceNo: transaction.billpaymentInvoiceNo,
          data: transaction
        };
      } else {
        return {
          success: false,
          status: 'not_found',
          message: 'No transaction found'
        };
      }
    } catch (error) {
      console.error('ToyybPay getBillStatus error:', error);
      throw error;
    }
  },

  /**
   * Process payment for a project with enhanced options
   * @param {Object} projectDetails - Project information
   * @param {Object} customerDetails - Customer information
   * @param {number} amount - Payment amount in RM
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Payment processing result
   */
  processProjectPayment: async (projectDetails, customerDetails, amount, options = {}) => {
    try {
      const appSettings = PAYMENT_CONFIG.APP_SETTINGS;
      
      // Validate amount
      if (amount < appSettings.MINIMUM_PAYMENT || amount > appSettings.MAXIMUM_PAYMENT) {
        throw new Error(`Amount must be between ${appSettings.CURRENCY_SYMBOL}${appSettings.MINIMUM_PAYMENT} and ${appSettings.CURRENCY_SYMBOL}${appSettings.MAXIMUM_PAYMENT}`);
      }
      
      const referenceNo = `PROJECT_${projectDetails.id}_${Date.now()}`;
      
      const billData = {
        billName: `Deposit for ${projectDetails.title}`,
        billDescription: `Deposit payment for project: ${projectDetails.title}. Handyman: ${projectDetails.handymanName}`,
        amount: amount,
        referenceNo: referenceNo,
        payerName: customerDetails.name,
        payerEmail: customerDetails.email,
        payerPhone: customerDetails.phone || '',
        paymentChannel: options.paymentChannel || PAYMENT_CONFIG.TOYYIBPAY.SETTINGS.PAYMENT_CHANNELS,
        expiryDays: options.expiryDays || PAYMENT_CONFIG.TOYYIBPAY.SETTINGS.DEFAULT_EXPIRY_DAYS,
      };

      const result = await toyyibPayService.createBill(billData);
      
      if (result.success) {
        return {
          success: true,
          billCode: result.billCode,
          paymentUrl: result.paymentUrl,
          referenceNo: referenceNo,
          expiresAt: new Date(Date.now() + (billData.expiryDays * 24 * 60 * 60 * 1000)).toISOString(),
        };
      } else {
        throw new Error('Failed to create payment bill');
      }
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  },

  /**
   * Verify payment status and update project
   * @param {string} billCode - ToyybPay bill code
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} - Verification result
   */
  verifyPayment: async (billCode, projectId) => {
    try {
      const status = await toyyibPayService.getBillStatus(billCode);
      
      if (status.success && status.status === '1') {
        // Payment successful
        return {
          success: true,
          verified: true,
          amount: status.amount,
          paidDate: status.paidDate,
          invoiceNo: status.invoiceNo,
          transactionData: status.data
        };
      } else if (status.success && status.status === '2') {
        // Payment pending
        return {
          success: true,
          verified: false,
          status: 'pending',
          message: 'Payment is still pending'
        };
      } else {
        // Payment failed or not found
        return {
          success: false,
          verified: false,
          status: 'failed',
          message: 'Payment not completed or failed'
        };
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  },

  /**
   * Get stored bill information
   * @param {string} referenceNo - Reference number
   * @returns {Promise<Object|null>} - Stored bill data
   */
  getStoredBill: async (referenceNo) => {
    try {
      const billData = await AsyncStorage.getItem(`toyyibpay_bill_${referenceNo}`);
      return billData ? JSON.parse(billData) : null;
    } catch (error) {
      console.error('Get stored bill error:', error);
      return null;
    }
  },

  /**
   * Update stored bill status
   * @param {string} referenceNo - Reference number
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  updateStoredBillStatus: async (referenceNo, status) => {
    try {
      const billData = await toyyibPayService.getStoredBill(referenceNo);
      if (billData) {
        billData.status = status;
        billData.updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(`toyyibpay_bill_${referenceNo}`, JSON.stringify(billData));
      }
    } catch (error) {
      console.error('Update stored bill status error:', error);
    }
  },

  /**
   * Clean up expired bills from storage
   * @returns {Promise<void>}
   */
  cleanupExpiredBills: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const billKeys = keys.filter(key => key.startsWith('toyyibpay_bill_'));
      const cleanupDays = PAYMENT_CONFIG.APP_SETTINGS.STORAGE.CLEANUP_DAYS;
      
      for (const key of billKeys) {
        const billData = await AsyncStorage.getItem(key);
        if (billData) {
          const bill = JSON.parse(billData);
          const createdAt = new Date(bill.createdAt);
          const expiryTime = new Date(createdAt.getTime() + cleanupDays * 24 * 60 * 60 * 1000);
          
          if (new Date() > expiryTime) {
            await AsyncStorage.removeItem(key);
            console.log(`Cleaned up expired bill: ${key}`);
          }
        }
      }
    } catch (error) {
      console.error('Cleanup expired bills error:', error);
    }
  },

  /**
   * Format amount for display
   * @param {number} amount - Amount in RM
   * @returns {string} - Formatted amount
   */
  formatAmount: (amount) => {
    const { CURRENCY_SYMBOL } = PAYMENT_CONFIG.APP_SETTINGS;
    return `${CURRENCY_SYMBOL} ${parseFloat(amount).toFixed(2)}`;
  },

  /**
   * Generate reference number
   * @param {string} prefix - Reference prefix
   * @returns {string} - Generated reference number
   */
  generateReferenceNo: (prefix = 'TK') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}_${timestamp}_${random}`;
  },

  /**
   * Get payment method options
   * @returns {Array} - Available payment methods
   */
  getPaymentMethods: () => {
    return Object.values(PAYMENT_CONFIG.PAYMENT_METHODS);
  },

  /**
   * Get payment method by ID
   * @param {string} methodId - Payment method ID
   * @returns {Object|null} - Payment method details
   */
  getPaymentMethodById: (methodId) => {
    return PAYMENT_CONFIG.PAYMENT_METHODS[methodId.toUpperCase()] || null;
  },

  /**
   * Check if service is properly configured
   * @returns {Object} - Configuration status
   */
  checkConfiguration: () => {
    const validation = validateConfig();
    const config = getConfig();
    
    return {
      isConfigured: validation.valid,
      issues: validation.issues,
      environment: PAYMENT_CONFIG.TOYYIBPAY.ENVIRONMENT,
      hasCredentials: !!(config.USER_SECRET_KEY && config.CATEGORY_CODE),
      isProduction: PAYMENT_CONFIG.TOYYIBPAY.ENVIRONMENT === 'PRODUCTION'
    };
  },

  /**
   * Get service status and health check
   * @returns {Promise<Object>} - Service status
   */
  healthCheck: async () => {
    try {
      const configCheck = toyyibPayService.checkConfiguration();
      
      if (!configCheck.isConfigured) {
        return {
          healthy: false,
          status: 'misconfigured',
          issues: configCheck.issues
        };
      }

      // Try a simple API call to check connectivity
      const config = getConfig();
      const testResponse = await fetch(config.CREATE_BILL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'userSecretKey=test' // This will fail but tells us if API is reachable
      });

      return {
        healthy: true,
        status: 'operational',
        environment: configCheck.environment,
        apiReachable: testResponse.status !== 0
      };
    } catch (error) {
      return {
        healthy: false,
        status: 'api_error',
        error: error.message
      };
    }
  }
};