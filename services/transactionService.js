// services/transactionService.js - Transaction Management Service with toyyibPay Integration
import { db } from '../firebase';
import firebase from '../firebase';

export const transactionService = {
  // Create a new transaction record
  createTransaction: async (transactionData) => {
    try {
      const transaction = {
        ...transactionData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('transactions').add(transaction);
      
      console.log('Transaction created with ID:', docRef.id);
      return { id: docRef.id, ...transaction };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Helper function to clean undefined values from object
  cleanUndefinedValues: (obj) => {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key] = obj[key];
      }
    });
    return cleaned;
  },

  // Record deposit payment (customer pays handyman) - Enhanced for toyyibPay
  recordDepositPayment: async (projectId, customerId, handymanId, amount, paymentData = {}) => {
    try {
      const batch = db.batch();

      // Base transaction data for customer (outgoing)
      const customerTransactionBase = {
        userId: customerId,
        type: 'deposit_paid',
        amount: amount,
        projectId: projectId,
        projectTitle: paymentData.projectTitle || 'Project Deposit',
        otherPartyId: handymanId,
        otherPartyName: paymentData.handymanName,
        description: `Deposit payment for ${paymentData.projectTitle || 'project'}`,
        status: paymentData.status || 'pending',
        paymentMethod: paymentData.paymentMethod || 'card',
        transactionId: paymentData.transactionId,
        paymentGateway: 'toyyibpay',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Add optional toyyibPay fields only if they exist
      const customerOptionalFields = {};
      if (paymentData.billCode || paymentData.toyyibPayBillCode) {
        customerOptionalFields.toyyibPayBillCode = paymentData.billCode || paymentData.toyyibPayBillCode;
      }
      if (paymentData.toyyibPayTransactionId) {
        customerOptionalFields.toyyibPayTransactionId = paymentData.toyyibPayTransactionId;
      }
      if (paymentData.toyyibPayReferenceNo) {
        customerOptionalFields.toyyibPayReferenceNo = paymentData.toyyibPayReferenceNo;
      }

      const customerTransaction = { ...customerTransactionBase, ...customerOptionalFields };

      const customerTransactionRef = db.collection('transactions').doc();
      batch.set(customerTransactionRef, customerTransaction);

      // Base transaction data for handyman (incoming)
      const handymanTransactionBase = {
        userId: handymanId,
        type: 'deposit_received',
        amount: amount,
        projectId: projectId,
        projectTitle: paymentData.projectTitle || 'Project Deposit',
        otherPartyId: customerId,
        otherPartyName: paymentData.customerName,
        description: `Deposit received for ${paymentData.projectTitle || 'project'}`,
        status: paymentData.status || 'pending',
        paymentMethod: paymentData.paymentMethod || 'card',
        transactionId: paymentData.transactionId,
        paymentGateway: 'toyyibpay',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Add optional toyyibPay fields only if they exist
      const handymanOptionalFields = {};
      if (paymentData.billCode || paymentData.toyyibPayBillCode) {
        handymanOptionalFields.toyyibPayBillCode = paymentData.billCode || paymentData.toyyibPayBillCode;
      }
      if (paymentData.toyyibPayTransactionId) {
        handymanOptionalFields.toyyibPayTransactionId = paymentData.toyyibPayTransactionId;
      }
      if (paymentData.toyyibPayReferenceNo) {
        handymanOptionalFields.toyyibPayReferenceNo = paymentData.toyyibPayReferenceNo;
      }

      const handymanTransaction = { ...handymanTransactionBase, ...handymanOptionalFields };

      const handymanTransactionRef = db.collection('transactions').doc();
      batch.set(handymanTransactionRef, handymanTransaction);

      await batch.commit();
      
      console.log('Deposit transactions recorded successfully');
      return {
        customerTransaction: { id: customerTransactionRef.id, ...customerTransaction },
        handymanTransaction: { id: handymanTransactionRef.id, ...handymanTransaction }
      };
    } catch (error) {
      console.error('Error recording deposit payment:', error);
      throw error;
    }
  },

  // Update transaction status using transaction ID (the original method)
  updateTransactionStatus: async (transactionId, status, additionalData = {}) => {
    try {
      // Clean undefined values from additionalData
      const cleanedAdditionalData = transactionService.cleanUndefinedValues(additionalData);

      const updateData = {
        status: status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...cleanedAdditionalData
      };

      console.log(`Updating transaction ${transactionId} to status: ${status}`);
      await db.collection('transactions').doc(transactionId).update(updateData);
      
      console.log('Transaction status updated:', transactionId, status);
      return transactionId;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },

  // NEW: Update transaction status using toyyibPay bill code
  updateTransactionStatusByBillCode: async (billCode, status, additionalData = {}) => {
    try {
      // Clean undefined values from additionalData
      const cleanedAdditionalData = transactionService.cleanUndefinedValues(additionalData);

      console.log(`Updating transactions for billCode: ${billCode} to status: ${status}`);
      
      const querySnapshot = await db.collection('transactions')
        .where('toyyibPayBillCode', '==', billCode)
        .get();

      if (querySnapshot.empty) {
        console.warn(`No transaction found for billCode: ${billCode}`);
        return null;
      }

      const updateData = {
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...cleanedAdditionalData
      };

      // Update all matching transactions using batch
      const batch = db.batch();
      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, updateData);
      });

      await batch.commit();
      console.log(`Updated ${querySnapshot.docs.length} transaction(s) for billCode: ${billCode}`);
      
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error updating transaction status by bill code:', error);
      throw error;
    }
  },

  // Record payout (handyman receives money to bank account)
  recordPayout: async (handymanId, amount, payoutData = {}) => {
    try {
      const transactionBase = {
        userId: handymanId,
        type: 'payout',
        amount: amount,
        description: payoutData.description || 'Payout to bank account',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Add optional fields only if they exist
      const optionalFields = {};
      if (payoutData.bankAccount) {
        optionalFields.bankAccount = payoutData.bankAccount;
      }
      if (payoutData.notes) {
        optionalFields.notes = payoutData.notes;
      }

      const transaction = { ...transactionBase, ...optionalFields };

      const docRef = await db.collection('transactions').add(transaction);
      
      console.log('Payout transaction recorded with ID:', docRef.id);
      return { id: docRef.id, ...transaction };
    } catch (error) {
      console.error('Error recording payout:', error);
      throw error;
    }
  },

  // Record refund (customer gets money back)
  recordRefund: async (projectId, customerId, handymanId, amount, refundData = {}) => {
    try {
      const batch = db.batch();

      // Create refund transaction for customer (incoming)
      const customerTransactionBase = {
        userId: customerId,
        type: 'refund',
        amount: amount,
        projectId: projectId,
        projectTitle: refundData.projectTitle || 'Project Refund',
        otherPartyId: handymanId,
        otherPartyName: refundData.handymanName,
        description: `Refund for ${refundData.projectTitle || 'project'}`,
        status: 'completed',
        paymentMethod: refundData.paymentMethod || 'card',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const customerOptionalFields = {};
      if (refundData.reason) {
        customerOptionalFields.reason = refundData.reason;
      }

      const customerTransaction = { ...customerTransactionBase, ...customerOptionalFields };
      const customerTransactionRef = db.collection('transactions').doc();
      batch.set(customerTransactionRef, customerTransaction);

      // Create refund transaction for handyman (outgoing/deduction)
      const handymanTransactionBase = {
        userId: handymanId,
        type: 'refund_deduction',
        amount: amount,
        projectId: projectId,
        projectTitle: refundData.projectTitle || 'Project Refund',
        otherPartyId: customerId,
        otherPartyName: refundData.customerName,
        description: `Refund issued for ${refundData.projectTitle || 'project'}`,
        status: 'completed',
        paymentMethod: refundData.paymentMethod || 'card',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const handymanOptionalFields = {};
      if (refundData.reason) {
        handymanOptionalFields.reason = refundData.reason;
      }

      const handymanTransaction = { ...handymanTransactionBase, ...handymanOptionalFields };
      const handymanTransactionRef = db.collection('transactions').doc();
      batch.set(handymanTransactionRef, handymanTransaction);

      await batch.commit();
      
      console.log('Refund transactions recorded successfully');
      return {
        customerTransaction: { id: customerTransactionRef.id, ...customerTransaction },
        handymanTransaction: { id: handymanTransactionRef.id, ...handymanTransaction }
      };
    } catch (error) {
      console.error('Error recording refund:', error);
      throw error;
    }
  },

  // Get transaction by toyyibPay bill code
  getTransactionByBillCode: async (billCode) => {
    try {
      const snapshot = await db.collection('transactions')
        .where('toyyibPayBillCode', '==', billCode)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const transactions = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      return transactions;
    } catch (error) {
      console.error('Error getting transaction by bill code:', error);
      throw error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    try {
      const doc = await db.collection('transactions').doc(transactionId).get();
      
      if (doc.exists) {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  },

  // Get transactions for a specific project
  getProjectTransactions: async (projectId) => {
    try {
      const snapshot = await db.collection('transactions')
        .where('projectId', '==', projectId)
        .orderBy('createdAt', 'desc')
        .get();

      const transactions = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      return transactions;
    } catch (error) {
      console.error('Error getting project transactions:', error);
      throw error;
    }
  },

  // Record payment completion from toyyibPay callback
  recordPaymentCompletion: async (billCode, toyyibPayData) => {
    try {
      const transactions = await transactionService.getTransactionByBillCode(billCode);
      
      if (!transactions || transactions.length === 0) {
        throw new Error(`Transaction not found for billCode: ${billCode}`);
      }

      const completionDataBase = {
        status: toyyibPayData.status === '1' ? 'completed' : 'failed',
        completedAt: firebase.firestore.FieldValue.serverTimestamp(),
        paymentCompletedAt: firebase.firestore.FieldValue.serverTimestamp(),
        paidAmount: parseFloat(toyyibPayData.amount) / 100, // Convert from cents
        toyyibPayCallback: toyyibPayData
      };

      // Add optional fields only if they exist
      const optionalFields = {};
      if (toyyibPayData.transaction_id) {
        optionalFields.toyyibPayTransactionId = toyyibPayData.transaction_id;
      }
      if (toyyibPayData.refno) {
        optionalFields.toyyibPayReferenceNo = toyyibPayData.refno;
      }

      const completionData = { ...completionDataBase, ...optionalFields };

      // Update all transactions with this bill code
      const batch = db.batch();
      transactions.forEach(transaction => {
        const transactionRef = db.collection('transactions').doc(transaction.id);
        batch.update(transactionRef, completionData);
      });

      await batch.commit();
      
      console.log('Payment completion recorded for bill code:', billCode);
      return transactions[0].id;
    } catch (error) {
      console.error('Error recording payment completion:', error);
      throw error;
    }
  },

  // Get user's transaction history
  getUserTransactions: async (userId, limit = 50) => {
    try {
      const snapshot = await db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const transactions = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      return transactions;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  },

  // Get user's earning statistics (for handymen)
  getUserEarningsStats: async (userId) => {
    try {
      const snapshot = await db.collection('transactions')
        .where('userId', '==', userId)
        .where('type', 'in', ['deposit_received', 'payout'])
        .get();

      let totalEarnings = 0;
      let availableBalance = 0;
      let totalPayouts = 0;
      let transactionCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount) || 0;
        
        if (data.type === 'deposit_received') {
          totalEarnings += amount;
          availableBalance += amount;
          transactionCount++;
        } else if (data.type === 'payout') {
          totalPayouts += amount;
          availableBalance -= amount;
        }
      });

      return {
        totalEarnings,
        availableBalance: Math.max(0, availableBalance),
        totalPayouts,
        transactionCount
      };
    } catch (error) {
      console.error('Error getting user earnings stats:', error);
      throw error;
    }
  },

  // Get user's spending statistics (for customers)
  getUserSpendingStats: async (userId) => {
    try {
      const snapshot = await db.collection('transactions')
        .where('userId', '==', userId)
        .where('type', 'in', ['deposit_paid', 'refund'])
        .get();

      let totalSpent = 0;
      let totalRefunds = 0;
      let transactionCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount) || 0;
        
        if (data.type === 'deposit_paid') {
          totalSpent += amount;
          transactionCount++;
        } else if (data.type === 'refund') {
          totalRefunds += amount;
        }
      });

      return {
        totalSpent,
        totalRefunds,
        netSpent: totalSpent - totalRefunds,
        transactionCount
      };
    } catch (error) {
      console.error('Error getting user spending stats:', error);
      throw error;
    }
  },

  // Subscribe to user's transactions (real-time)
  subscribeToUserTransactions: (userId, onUpdate, onError) => {
    try {
      const unsubscribe = db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .onSnapshot(
          (snapshot) => {
            const transactions = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              transactions.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
              });
            });
            onUpdate(transactions);
          },
          (error) => {
            console.error('Error in transactions subscription:', error);
            onError(error);
          }
        );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up transactions subscription:', error);
      onError(error);
      return () => {};
    }
  },

  // Subscribe to transaction updates by bill code (real-time)
  subscribeToTransactionUpdates: (billCode, onUpdate, onError) => {
    try {
      const unsubscribe = db.collection('transactions')
        .where('toyyibPayBillCode', '==', billCode)
        .onSnapshot(
          (snapshot) => {
            if (!snapshot.empty) {
              const transactions = [];
              snapshot.forEach(doc => {
                const data = doc.data();
                transactions.push({
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
                  updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
                });
              });
              onUpdate(transactions);
            }
          },
          (error) => {
            console.error('Error listening to transaction updates:', error);
            onError(error);
          }
        );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up transaction subscription:', error);
      onError(error);
      return () => {};
    }
  },

  // Helper method to format transaction for display
  formatTransactionForDisplay: (transaction) => {
    return {
      ...transaction,
      formattedAmount: `RM ${(parseFloat(transaction.amount) || 0).toFixed(2)}`,
      formattedDate: new Date(transaction.createdAt).toLocaleDateString(),
      statusDisplayName: transactionService.getStatusDisplayName(transaction.status),
      paymentMethodDisplayName: transactionService.getPaymentMethodDisplayName(transaction.paymentMethod)
    };
  },

  // Get status display name
  getStatusDisplayName: (status) => {
    const statusMap = {
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  },

  // Get payment method display name
  getPaymentMethodDisplayName: (method) => {
    const methodMap = {
      'card': 'Credit/Debit Card',
      'banking': 'Online Banking',
      'ewallet': 'E-Wallet',
      'direct_transfer': 'Direct Transfer',
      'bank_transfer': 'Bank Transfer'
    };
    return methodMap[method] || method;
  }
};