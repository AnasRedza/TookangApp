// services/offersService.js
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

export const offersService = {
  // Create a new offer
  createOffer: async (offerData) => {
    try {
      const docRef = await db.collection('offers').add({
        ...offerData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      return {
        id: docRef.id,
        ...offerData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  },

  // Get offer by ID
  getOfferById: async (offerId) => {
    try {
      const doc = await db.collection('offers').doc(offerId).get();
      if (doc.exists) {
        const offerData = doc.data();
        return {
          id: doc.id,
          ...offerData,
          // Convert timestamps to ISO strings
          createdAt: offerData.createdAt?.toDate()?.toISOString(),
          updatedAt: offerData.updatedAt?.toDate()?.toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting offer:', error);
      throw error;
    }
  },

  // Get offers for a specific project
  getProjectOffers: async (projectId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('projectId', '==', projectId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting project offers:', error);
      throw error;
    }
  },

  // Get offers made by a handyman
  getHandymanOffers: async (handymanId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('handymanId', '==', handymanId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting handyman offers:', error);
      throw error;
    }
  },

  // Get offers received by a customer
  getCustomerOffers: async (customerId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting customer offers:', error);
      throw error;
    }
  },

  // Update offer status
  updateOfferStatus: async (offerId, status, additionalData = {}) => {
    try {
      const updateData = {
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData,
      };
      
      await db.collection('offers').doc(offerId).update(updateData);
      return true;
    } catch (error) {
      console.error('Error updating offer status:', error);
      throw error;
    }
  },

  // Accept an offer
  acceptOffer: async (offerId, projectId) => {
    try {
      // Use a batch to update both the offer and project atomically
      const batch = db.batch();
      
      // Update the offer status
      const offerRef = db.collection('offers').doc(offerId);
      batch.update(offerRef, {
        status: 'accepted',
        acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // Reject all other offers for this project
      const otherOffersSnapshot = await db.collection('offers')
        .where('projectId', '==', projectId)
        .where('status', '==', 'pending')
        .get();
      
      otherOffersSnapshot.docs.forEach(doc => {
        if (doc.id !== offerId) {
          batch.update(doc.ref, {
            status: 'rejected',
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  },

  // Reject an offer
  rejectOffer: async (offerId, reason = null) => {
    try {
      const updateData = {
        status: 'rejected',
        rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      
      if (reason) {
        updateData.rejectionReason = reason;
      }
      
      await db.collection('offers').doc(offerId).update(updateData);
      return true;
    } catch (error) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  },

  // Withdraw an offer (by handyman)
  withdrawOffer: async (offerId) => {
    try {
      await db.collection('offers').doc(offerId).update({
        status: 'withdrawn',
        withdrawnAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      throw error;
    }
  },

  // Subscribe to real-time updates for project offers
  subscribeToProjectOffers: (projectId, onUpdate, onError) => {
    try {
      const unsubscribe = db.collection('offers')
        .where('projectId', '==', projectId)
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          (snapshot) => {
            const offers = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Convert timestamps to ISO strings
              createdAt: doc.data().createdAt?.toDate()?.toISOString(),
              updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
            }));
            onUpdate(offers);
          },
          (error) => {
            console.error('Error in offers subscription:', error);
            if (onError) onError(error);
          }
        );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up offers subscription:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Subscribe to real-time updates for handyman offers
  subscribeToHandymanOffers: (handymanId, onUpdate, onError) => {
    try {
      const unsubscribe = db.collection('offers')
        .where('handymanId', '==', handymanId)
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          (snapshot) => {
            const offers = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Convert timestamps to ISO strings
              createdAt: doc.data().createdAt?.toDate()?.toISOString(),
              updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
            }));
            onUpdate(offers);
          },
          (error) => {
            console.error('Error in handyman offers subscription:', error);
            if (onError) onError(error);
          }
        );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up handyman offers subscription:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Get offer statistics for a handyman
  getHandymanOfferStats: async (handymanId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('handymanId', '==', handymanId)
        .get();

      const offers = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        total: offers.length,
        pending: offers.filter(o => o.status === 'pending').length,
        accepted: offers.filter(o => o.status === 'accepted').length,
        rejected: offers.filter(o => o.status === 'rejected').length,
        withdrawn: offers.filter(o => o.status === 'withdrawn').length,
        averageAmount: offers.length > 0 ? 
          offers.reduce((sum, o) => sum + (o.amount || 0), 0) / offers.length : 0,
        acceptanceRate: offers.length > 0 ? 
          (offers.filter(o => o.status === 'accepted').length / offers.length) * 100 : 0,
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting handyman offer stats:', error);
      throw error;
    }
  },

  // Delete offer
  deleteOffer: async (offerId) => {
    try {
      await db.collection('offers').doc(offerId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  },

  // Get pending offers for a handyman (notifications)
  getPendingOffersForHandyman: async (handymanId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('handymanId', '==', handymanId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting pending offers for handyman:', error);
      throw error;
    }
  }
};