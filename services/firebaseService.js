// services/firebaseService.js
import firebase from '../firebase';
import { auth, db } from '../firebase';

export class FirebaseService {
  // USER OPERATIONS
  // ===============
  
  static async createUserProfile(userId, userData) {
    try {
      await db.collection('users').doc(userId).set({
        ...userData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async updateUserProfile(userId, updates) {
    try {
      await db.collection('users').doc(userId).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getUserProfile(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();
      if (doc.exists) {
        return { success: true, data: { id: doc.id, ...doc.data() } };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async searchHandymen(filters = {}) {
    try {
      let query = db.collection('users').where('role', '==', 'handyman').where('isActive', '==', true);
      
      // Add filters
      if (filters.category) {
        query = query.where('serviceCategories', 'array-contains', filters.category);
      }
      
      if (filters.minRating) {
        query = query.where('rating', '>=', filters.minRating);
      }
      
      // Add ordering
      query = query.orderBy('rating', 'desc').limit(20);
      
      const snapshot = await query.get();
      const handymen = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: handymen };
    } catch (error) {
      console.error('Error searching handymen:', error);
      return { success: false, error: error.message };
    }
  }

  // PROJECT OPERATIONS
  // ==================
  
  static async createProject(projectData) {
    try {
      const docRef = await db.collection('projects').add({
        ...projectData,
        status: 'open',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true, projectId: docRef.id };
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getProjectsByUser(userId, userRole) {
    try {
      const field = userRole === 'customer' ? 'customerId' : 'handymanId';
      const query = db.collection('projects')
        .where(field, '==', userId)
        .orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: projects };
    } catch (error) {
      console.error('Error getting user projects:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getAvailableProjects(handymanLocation = null) {
    try {
      let query = db.collection('projects')
        .where('status', '==', 'open')
        .orderBy('createdAt', 'desc')
        .limit(20);
      
      const snapshot = await query.get();
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: projects };
    } catch (error) {
      console.error('Error getting available projects:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async updateProjectStatus(projectId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData
      };
      
      if (status === 'completed') {
        updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      await db.collection('projects').doc(projectId).update(updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating project status:', error);
      return { success: false, error: error.message };
    }
  }

  // OFFER OPERATIONS
  // ================
  
  static async createOffer(offerData) {
    try {
      const docRef = await db.collection('offers').add({
        ...offerData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true, offerId: docRef.id };
    } catch (error) {
      console.error('Error creating offer:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getProjectOffers(projectId) {
    try {
      const query = db.collection('offers')
        .where('projectId', '==', projectId)
        .orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      const offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: offers };
    } catch (error) {
      console.error('Error getting project offers:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async updateOfferStatus(offerId, status) {
    try {
      await db.collection('offers').doc(offerId).update({
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating offer status:', error);
      return { success: false, error: error.message };
    }
  }

  // TRANSACTION OPERATIONS
  // ======================
  
  static async createTransaction(transactionData) {
    try {
      const docRef = await db.collection('transactions').add({
        ...transactionData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true, transactionId: docRef.id };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getUserTransactions(userId, userRole) {
    try {
      const field = userRole === 'customer' ? 'customerId' : 'handymanId';
      const query = db.collection('transactions')
        .where(field, '==', userId)
        .orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: transactions };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return { success: false, error: error.message };
    }
  }

  // REVIEW OPERATIONS
  // =================
  
  static async createReview(reviewData) {
    try {
      // Create the review
      const docRef = await db.collection('reviews').add({
        ...reviewData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Update the reviewee's rating (this should ideally be done in a Cloud Function)
      await this.updateUserRating(reviewData.revieweeId);
      
      return { success: true, reviewId: docRef.id };
    } catch (error) {
      console.error('Error creating review:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getUserReviews(userId) {
    try {
      const query = db.collection('reviews')
        .where('revieweeId', '==', userId)
        .orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: reviews };
    } catch (error) {
      console.error('Error getting user reviews:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async updateUserRating(userId) {
    try {
      const reviewsQuery = await db.collection('reviews')
        .where('revieweeId', '==', userId)
        .get();
      
      if (reviewsQuery.empty) return { success: true };
      
      const reviews = reviewsQuery.docs.map(doc => doc.data());
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await db.collection('users').doc(userId).update({
        rating: Number(averageRating.toFixed(1)),
        reviewCount: reviews.length,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user rating:', error);
      return { success: false, error: error.message };
    }
  }

  // MESSAGING OPERATIONS
  // ====================
  
  static async createConversation(participants) {
    try {
      const conversationId = participants.sort().join('_');
      
      await db.collection('conversations').doc(conversationId).set({
        participants,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessage: null
      });
      
      return { success: true, conversationId };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async sendMessage(conversationId, messageData) {
    try {
      // Add message to conversation
      const messageRef = await db.collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add({
          ...messageData,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      
      // Update conversation last message
      await db.collection('conversations').doc(conversationId).update({
        lastMessage: messageData.text,
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true, messageId: messageRef.id };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }
  
  static getMessagesListener(conversationId, callback) {
    try {
      const unsubscribe = db.collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(
          (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            callback(messages);
          },
          (error) => {
            console.error('Error listening to messages:', error);
            callback([]);
          }
        );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up messages listener:', error);
      return () => {};
    }
  }
  
  static async getUserConversations(userId) {
    try {
      const query = db.collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('updatedAt', 'desc');
      
      const snapshot = await query.get();
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: conversations };
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return { success: false, error: error.message };
    }
  }

  // UTILITY FUNCTIONS
  // =================
  
  static async batchWrite(operations) {
    try {
      const batch = db.batch();
      
      operations.forEach(operation => {
        const { type, ref, data } = operation;
        if (type === 'set') {
          batch.set(ref, data);
        } else if (type === 'update') {
          batch.update(ref, data);
        } else if (type === 'delete') {
          batch.delete(ref);
        }
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error in batch write:', error);
      return { success: false, error: error.message };
    }
  }
  
  static timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }
  
  static arrayUnion(value) {
    return firebase.firestore.FieldValue.arrayUnion(value);
  }
  
  static arrayRemove(value) {
    return firebase.firestore.FieldValue.arrayRemove(value);
  }
}

export default FirebaseService;