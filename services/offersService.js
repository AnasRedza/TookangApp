// Enhanced services/offersService.js - Complete negotiation support
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { chatService } from './chatService';
import { projectService } from './projectService';

export const offersService = {
  // Create a new offer with enhanced negotiation support
  createOffer: async (offerData) => {
    try {
      const batch = db.batch();
      
      // Create offer document
      const offerRef = db.collection('offers').doc();
      const offerDoc = {
        id: offerRef.id,
        ...offerData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        negotiationRound: 1,
        isCounterOffer: offerData.offerType === 'counter'
      };
      
      batch.set(offerRef, offerDoc);
      
      // Update project status
      const projectRef = db.collection('projects').doc(offerData.projectId);
      const projectUpdate = {
        status: offerData.offerType === 'accept' ? 'pending_customer_acceptance' : 'has_offers',
        hasOffers: true,
        lastOfferAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastOfferBy: offerData.handymanId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      batch.update(projectRef, projectUpdate);
      
      await batch.commit();
      
      // Send system message to conversation if it exists
      try {
        const conversationId = await chatService.createOrGetConversation(
          offerData.handymanId,
          offerData.customerId,
          {
            id: offerData.projectId,
            title: offerData.projectTitle,
            status: projectUpdate.status
          }
        );
        
        // Send offer message to chat
        await chatService.sendOfferMessage(
          conversationId,
          offerData.handymanId,
          offerData.handymanName,
          offerData
        );
        
      } catch (chatError) {
        console.error('Error sending offer message to chat:', chatError);
        // Don't fail the entire operation if chat fails
      }
      
      return {
        id: offerRef.id,
        ...offerDoc,
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
          acceptedAt: offerData.acceptedAt?.toDate()?.toISOString(),
          rejectedAt: offerData.rejectedAt?.toDate()?.toISOString(),
          withdrawnAt: offerData.withdrawnAt?.toDate()?.toISOString(),
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
        acceptedAt: doc.data().acceptedAt?.toDate()?.toISOString(),
        rejectedAt: doc.data().rejectedAt?.toDate()?.toISOString(),
        withdrawnAt: doc.data().withdrawnAt?.toDate()?.toISOString(),
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
        acceptedAt: doc.data().acceptedAt?.toDate()?.toISOString(),
        rejectedAt: doc.data().rejectedAt?.toDate()?.toISOString(),
        withdrawnAt: doc.data().withdrawnAt?.toDate()?.toISOString(),
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
        acceptedAt: doc.data().acceptedAt?.toDate()?.toISOString(),
        rejectedAt: doc.data().rejectedAt?.toDate()?.toISOString(),
        withdrawnAt: doc.data().withdrawnAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting customer offers:', error);
      throw error;
    }
  },

  // Update offer status with enhanced tracking
  updateOfferStatus: async (offerId, status, additionalData = {}) => {
    try {
      const updateData = {
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData,
      };
      
      // Add timestamp for specific status changes
      if (status === 'accepted') {
        updateData.acceptedAt = firebase.firestore.FieldValue.serverTimestamp();
      } else if (status === 'rejected') {
        updateData.rejectedAt = firebase.firestore.FieldValue.serverTimestamp();
      } else if (status === 'withdrawn') {
        updateData.withdrawnAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      await db.collection('offers').doc(offerId).update(updateData);
      return true;
    } catch (error) {
      console.error('Error updating offer status:', error);
      throw error;
    }
  },

  // Accept an offer with full workflow
  acceptOffer: async (offerId, projectId, customerId) => {
    try {
      // Use a batch to update both the offer and project atomically
      const batch = db.batch();
      
      // Get the offer details first
      const offerDoc = await db.collection('offers').doc(offerId).get();
      if (!offerDoc.exists) {
        throw new Error('Offer not found');
      }
      
      const offerData = offerDoc.data();
      
      // Update the accepted offer
      const offerRef = db.collection('offers').doc(offerId);
      batch.update(offerRef, {
        status: 'accepted',
        acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // Update project with accepted offer details
      const projectRef = db.collection('projects').doc(projectId);
      batch.update(projectRef, {
        status: 'agreed_scheduled',
        handymanId: offerData.handymanId,
        handymanName: offerData.handymanName,
        handymanAvatar: offerData.handymanAvatar,
        agreedBudget: offerData.amount,
        agreedDuration: offerData.estimatedDuration,
        materialsIncluded: offerData.materialsIncluded,
        acceptedOfferId: offerId,
        acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // Reject all other pending offers for this project
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
            rejectionReason: 'Another offer was accepted'
          });
        }
      });
      
      await batch.commit();
      
      // Send system messages to all relevant conversations
      try {
        // Message to accepted handyman
        const acceptedConversationId = await chatService.createOrGetConversation(
          offerData.handymanId,
          customerId,
          { id: projectId, title: offerData.projectTitle }
        );
        
        await chatService.sendSystemMessage(
          acceptedConversationId,
          `🎉 Great news! Your offer for "${offerData.projectTitle}" has been accepted! The customer has agreed to your terms of RM${offerData.amount}. You can now coordinate the work schedule.`,
          { type: 'offer_accepted', offerId: offerId }
        );
        
        // Messages to rejected handymen
        for (const rejectedDoc of otherOffersSnapshot.docs) {
          if (rejectedDoc.id !== offerId) {
            const rejectedOfferData = rejectedDoc.data();
            const rejectedConversationId = await chatService.createOrGetConversation(
              rejectedOfferData.handymanId,
              customerId,
              { id: projectId, title: rejectedOfferData.projectTitle }
            );
            
            await chatService.sendSystemMessage(
              rejectedConversationId,
              `Thank you for your interest in "${rejectedOfferData.projectTitle}". The customer has chosen to go with another offer. Keep an eye out for more opportunities!`,
              { type: 'offer_rejected', offerId: rejectedDoc.id }
            );
          }
        }
        
      } catch (chatError) {
        console.error('Error sending acceptance messages:', chatError);
        // Don't fail the entire operation if chat fails
      }
      
      return true;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  },

  // Reject an offer with reason
  rejectOffer: async (offerId, reason = null, customerId = null) => {
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
      
      // Send system message if customer ID is provided
      if (customerId) {
        try {
          const offerDoc = await db.collection('offers').doc(offerId).get();
          if (offerDoc.exists) {
            const offerData = offerDoc.data();
            
            const conversationId = await chatService.createOrGetConversation(
              offerData.handymanId,
              customerId,
              { id: offerData.projectId, title: offerData.projectTitle }
            );
            
            const systemMessage = reason 
              ? `Your offer for "${offerData.projectTitle}" was not accepted. Reason: ${reason}. Feel free to discuss alternatives or submit a new offer.`
              : `Your offer for "${offerData.projectTitle}" was not accepted this time. Feel free to discuss alternatives or submit a new offer.`;
            
            await chatService.sendSystemMessage(
              conversationId,
              systemMessage,
              { type: 'offer_rejected', offerId: offerId, reason: reason }
            );
          }
        } catch (chatError) {
          console.error('Error sending rejection message:', chatError);
        }
      }
      
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
      
      // Send system message
      try {
        const offerDoc = await db.collection('offers').doc(offerId).get();
        if (offerDoc.exists) {
          const offerData = offerDoc.data();
          
          const conversationId = await chatService.createOrGetConversation(
            offerData.handymanId,
            offerData.customerId,
            { id: offerData.projectId, title: offerData.projectTitle }
          );
          
          await chatService.sendSystemMessage(
            conversationId,
            `The handyman has withdrawn their offer for "${offerData.projectTitle}". They may submit a new offer or continue the discussion.`,
            { type: 'offer_withdrawn', offerId: offerId }
          );
        }
      } catch (chatError) {
        console.error('Error sending withdrawal message:', chatError);
      }
      
      return true;
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      throw error;
    }
  },

  // Create counter-offer (customer response to handyman offer)
  createCounterOffer: async (originalOfferId, counterOfferData) => {
    try {
      const batch = db.batch();
      
      // Get original offer to determine negotiation round
      const originalOfferDoc = await db.collection('offers').doc(originalOfferId).get();
      if (!originalOfferDoc.exists) {
        throw new Error('Original offer not found');
      }
      
      const originalOffer = originalOfferDoc.data();
      
      // Create counter-offer
      const counterOfferRef = db.collection('offers').doc();
      const counterOfferDoc = {
        id: counterOfferRef.id,
        ...counterOfferData,
        status: 'pending',
        isCounterOffer: true,
        parentOfferId: originalOfferId,
        negotiationRound: (originalOffer.negotiationRound || 1) + 1,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      
      batch.set(counterOfferRef, counterOfferDoc);
      
      // Update original offer status
      batch.update(db.collection('offers').doc(originalOfferId), {
        status: 'countered',
        counteredAt: firebase.firestore.FieldValue.serverTimestamp(),
        counterOfferId: counterOfferRef.id,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // Update project status
      batch.update(db.collection('projects').doc(counterOfferData.projectId), {
        status: 'in_negotiation',
        lastOfferAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastOfferBy: counterOfferData.customerId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      await batch.commit();
      
      // Send counter-offer message
      try {
        const conversationId = await chatService.createOrGetConversation(
          counterOfferData.handymanId,
          counterOfferData.customerId,
          {
            id: counterOfferData.projectId,
            title: counterOfferData.projectTitle,
            status: 'in_negotiation'
          }
        );
        
        await chatService.sendOfferMessage(
          conversationId,
          counterOfferData.customerId,
          counterOfferData.customerName,
          {
            ...counterOfferData,
            offerType: 'counter',
            isCounterOffer: true,
            negotiationRound: counterOfferDoc.negotiationRound
          }
        );
        
      } catch (chatError) {
        console.error('Error sending counter-offer message:', chatError);
      }
      
      return {
        id: counterOfferRef.id,
        ...counterOfferDoc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating counter-offer:', error);
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
              acceptedAt: doc.data().acceptedAt?.toDate()?.toISOString(),
              rejectedAt: doc.data().rejectedAt?.toDate()?.toISOString(),
              withdrawnAt: doc.data().withdrawnAt?.toDate()?.toISOString(),
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
              acceptedAt: doc.data().acceptedAt?.toDate()?.toISOString(),
              rejectedAt: doc.data().rejectedAt?.toDate()?.toISOString(),
              withdrawnAt: doc.data().withdrawnAt?.toDate()?.toISOString(),
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
        countered: offers.filter(o => o.status === 'countered').length,
        averageAmount: offers.length > 0 ? 
          offers.reduce((sum, o) => sum + (o.amount || 0), 0) / offers.length : 0,
        acceptanceRate: offers.length > 0 ? 
          (offers.filter(o => o.status === 'accepted').length / offers.length) * 100 : 0,
        activeNegotiations: offers.filter(o => ['pending', 'countered'].includes(o.status)).length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting handyman offer stats:', error);
      throw error;
    }
  },

  // Get customer offer statistics
  getCustomerOfferStats: async (customerId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('customerId', '==', customerId)
        .get();

      const offers = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        total: offers.length,
        pending: offers.filter(o => o.status === 'pending').length,
        accepted: offers.filter(o => o.status === 'accepted').length,
        rejected: offers.filter(o => o.status === 'rejected').length,
        withdrawn: offers.filter(o => o.status === 'withdrawn').length,
        countered: offers.filter(o => o.status === 'countered').length,
        averageAmount: offers.length > 0 ? 
          offers.reduce((sum, o) => sum + (o.amount || 0), 0) / offers.length : 0,
        projectsWithOffers: [...new Set(offers.map(o => o.projectId))].length,
        activeNegotiations: offers.filter(o => ['pending', 'countered'].includes(o.status)).length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting customer offer stats:', error);
      throw error;
    }
  },

  // Get negotiation history for a project
  getNegotiationHistory: async (projectId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('projectId', '==', projectId)
        .orderBy('createdAt', 'asc')
        .get();

      const offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
        acceptedAt: doc.data().acceptedAt?.toDate()?.toISOString(),
        rejectedAt: doc.data().rejectedAt?.toDate()?.toISOString(),
        withdrawnAt: doc.data().withdrawnAt?.toDate()?.toISOString(),
      }));

      // Group by negotiation chains
      const chains = [];
      const processedOffers = new Set();

      for (const offer of offers) {
        if (!processedOffers.has(offer.id)) {
          const chain = [offer];
          processedOffers.add(offer.id);

          // Find all related offers in this chain
          let currentOffer = offer;
          while (currentOffer.counterOfferId) {
            const nextOffer = offers.find(o => o.id === currentOffer.counterOfferId);
            if (nextOffer && !processedOffers.has(nextOffer.id)) {
              chain.push(nextOffer);
              processedOffers.add(nextOffer.id);
              currentOffer = nextOffer;
            } else {
              break;
            }
          }

          chains.push({
            id: offer.id,
            handymanId: offer.handymanId,
            handymanName: offer.handymanName,
            offers: chain,
            status: chain[chain.length - 1].status,
            negotiationRounds: chain.length,
            finalAmount: chain[chain.length - 1].amount,
            startedAt: chain[0].createdAt,
            lastActivity: chain[chain.length - 1].updatedAt
          });
        }
      }

      return {
        totalOffers: offers.length,
        negotiationChains: chains,
        activeNegotiations: chains.filter(c => ['pending', 'countered'].includes(c.status)).length,
        acceptedOffers: chains.filter(c => c.status === 'accepted').length
      };
    } catch (error) {
      console.error('Error getting negotiation history:', error);
      throw error;
    }
  },

  // Delete offer (admin function)
  deleteOffer: async (offerId) => {
    try {
      await db.collection('offers').doc(offerId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  },

  // Get pending offers for notifications
  getPendingOffersForHandyman: async (handymanId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('handymanId', '==', handymanId)
        .where('status', 'in', ['pending', 'countered'])
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting pending offers for handyman:', error);
      throw error;
    }
  },

  // Get pending offers for customer
  getPendingOffersForCustomer: async (customerId) => {
    try {
      const snapshot = await db.collection('offers')
        .where('customerId', '==', customerId)
        .where('status', 'in', ['pending', 'countered'])
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting pending offers for customer:', error);
      throw error;
    }
  }
};