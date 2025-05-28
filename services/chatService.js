// services/chatService.js
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

export const chatService = {
  // Create or get existing conversation
  createOrGetConversation: async (currentUserId, otherUserId, projectData = null) => {
    try {
      // Create conversation ID (sorted to ensure consistency)
      const participants = [currentUserId, otherUserId].sort();
      const conversationId = participants.join('_');
      
      // Check if conversation exists
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      
      if (!conversationDoc.exists) {
        // Create new conversation
        const conversationData = {
          id: conversationId,
          participants: participants,
          participantDetails: {}, // Will be filled when we get user data
          lastMessage: null,
          lastMessageTimestamp: null,
          lastMessageSender: null,
          projectId: projectData?.id || null,
          projectTitle: projectData?.title || null,
          unreadCount: {
            [currentUserId]: 0,
            [otherUserId]: 0
          },
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await conversationRef.set(conversationData);
      }
      
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (conversationId, senderId, senderName, messageText) => {
    try {
      const batch = db.batch();
      
      // Add message to messages subcollection
      const messageRef = db.collection('conversations').doc(conversationId).collection('messages').doc();
      const messageData = {
        id: messageRef.id,
        senderId: senderId,
        senderName: senderName,
        text: messageText.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false,
        type: 'text',
        imageUrl: null,
        edited: false,
        editedAt: null
      };
      batch.set(messageRef, messageData);
      
      // Update conversation with last message info
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationUpdate = {
        lastMessage: messageText.trim(),
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageSender: senderId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      batch.update(conversationRef, conversationUpdate);
      
      await batch.commit();
      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get user conversations
  getUserConversations: async (userId) => {
    try {
      const snapshot = await db.collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
        lastMessageTimestamp: doc.data().lastMessageTimestamp?.toDate()?.toISOString()
      }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  // Subscribe to conversations (real-time)
  subscribeToConversations: (userId, onUpdate, onError) => {
    try {
      const unsubscribe = db.collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .onSnapshot(
          (snapshot) => {
            const conversations = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate()?.toISOString(),
              updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
              lastMessageTimestamp: doc.data().lastMessageTimestamp?.toDate()?.toISOString()
            }));
            onUpdate(conversations);
          },
          (error) => {
            console.error('Error in conversations subscription:', error);
            if (onError) onError(error);
          }
        );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up conversations subscription:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Subscribe to messages (real-time)
  subscribeToMessages: (conversationId, onUpdate, onError) => {
    try {
      const unsubscribe = db.collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(
          (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate()?.toISOString()
            }));
            onUpdate(messages);
          },
          (error) => {
            console.error('Error in messages subscription:', error);
            if (onError) onError(error);
          }
        );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up messages subscription:', error);
      if (onError) onError(error);
      return null;
    }
  }
};