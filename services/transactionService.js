// services/transactionService.js - Transaction Management Service
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

  // Record deposit payment (customer pays handyman)
  recordDepositPayment: async (projectId, customerId, handymanId, amount, paymentData = {}) => {
    try {
      const batch = db.batch();

      // Create transaction for customer (outgoing)
      const customerTransactionRef = db.collection('transactions').doc();
      const customerTransaction = {
        userId: customerId,
        type: 'deposit_paid',
        amount: amount,
        projectId: projectId,
        projectTitle: paymentData.projectTitle || 'Project Deposit',
        otherPartyId: handymanId,
        otherPartyName: paymentData.handymanName,
        description: `Deposit payment for ${paymentData.projectTitle || 'project'}`,
        status: 'completed',
        paymentMethod: paymentData.paymentMethod || 'card',
        transactionId: paymentData.transactionId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      batch.set(customerTransactionRef, customerTransaction);

      // Create transaction for handyman (incoming)
      const handymanTransactionRef = db.collection('transactions').doc();
      const handymanTransaction = {
        userId: handymanId,
        type: 'deposit_received',
        amount: amount,
        projectId: projectId,
        projectTitle: paymentData.projectTitle || 'Project Deposit',
        otherPartyId: customerId,
        otherPartyName: paymentData.customerName,
        description: `Deposit received for ${paymentData.projectTitle || 'project'}`,
        status: 'completed',
        paymentMethod: paymentData.paymentMethod || 'card',
        transactionId: paymentData.transactionId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
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

  // Record payout (handyman receives money to bank account)
  recordPayout: async (handymanId, amount, payoutData = {}) => {
    try {
      const transaction = {
        userId: handymanId,
        type: 'payout',
        amount: amount,
        description: payoutData.description || 'Payout to bank account',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        bankAccount: payoutData.bankAccount,
        notes: payoutData.notes,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

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
      const customerTransactionRef = db.collection('transactions').doc();
      const customerTransaction = {
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
        reason: refundData.reason,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      batch.set(customerTransactionRef, customerTransaction);

      // Create refund transaction for handyman (outgoing/deduction)
      const handymanTransactionRef = db.collection('transactions').doc();
      const handymanTransaction = {
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
        reason: refundData.reason,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
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

  // Update transaction status
  updateTransactionStatus: async (transactionId, status, notes = '') => {
    try {
      await db.collection('transactions').doc(transactionId).update({
        status: status,
        notes: notes,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('Transaction status updated:', transactionId, status);
    } catch (error) {
      console.error('Error updating transaction status:', error);
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
  }
};