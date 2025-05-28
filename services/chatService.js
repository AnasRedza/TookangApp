// Enhanced services/chatService.js - Support for project negotiations
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { userService } from './userService';

export const chatService = {
  // Create or get existing conversation with enhanced project support
  createOrGetConversation: async (currentUserId, otherUserId, projectData = null) => {
    try {
      // Create conversation ID (sorted to ensure consistency)
      const participants = [currentUserId, otherUserId].sort();
      const conversationId = participants.join('_');
      
      // Check if conversation exists
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      
      if (!conversationDoc.exists) {
        // Get participant details
        const currentUser = await userService.getUserById(currentUserId);
        const otherUser = await userService.getUserById(otherUserId);
        
        // Create new conversation with participant details
        const conversationData = {
          id: conversationId,
          participants: participants,
          participantDetails: {
            [currentUserId]: {
              id: currentUserId,
              name: currentUser?.name || 'User',
              avatar: currentUser?.profilePicture,
              role: currentUser?.role || 'customer'
            },
            [otherUserId]: {
              id: otherUserId,
              name: otherUser?.name || 'User',
              avatar: otherUser?.profilePicture,
              role: otherUser?.role || 'customer'
            }
          },
          lastMessage: null,
          lastMessageTimestamp: null,
          lastMessageSender: null,
          projectId: projectData?.id || null,
          projectTitle: projectData?.title || null,
          projectStatus: projectData?.status || null,
          conversationType: projectData ? 'project' : 'general',
          unreadCount: {
            [currentUserId]: 0,
            [otherUserId]: 0
          },
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await conversationRef.set(conversationData);
      } else {
        // Update existing conversation with project info if provided
        if (projectData && !conversationDoc.data().projectId) {
          await conversationRef.update({
            projectId: projectData.id,
            projectTitle: projectData.title,
            projectStatus: projectData.status,
            conversationType: 'project',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Send a message with enhanced types
  sendMessage: async (conversationId, senderId, senderName, messageText, messageType = 'text', additionalData = {}) => {
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
        type: messageType, // 'text', 'offer', 'system', 'negotiation'
        imageUrl: null,
        edited: false,
        editedAt: null,
        ...additionalData
      };
      batch.set(messageRef, messageData);
      
      // Update conversation with last message info and increment unread count
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      const conversationData = conversationDoc.data();
      
      // Get the other participant
      const otherParticipantId = conversationData.participants.find(p => p !== senderId);
      
      const conversationUpdate = {
        lastMessage: messageText.trim(),
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageSender: senderId,
        [`unreadCount.${otherParticipantId}`]: firebase.firestore.FieldValue.increment(1),
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

  // Send system message for project updates
  sendSystemMessage: async (conversationId, messageText, systemData = {}) => {
    try {
      const messageRef = db.collection('conversations').doc(conversationId).collection('messages').doc();
      const messageData = {
        id: messageRef.id,
        senderId: 'system',
        senderName: 'System',
        text: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false,
        type: 'system',
        systemData: systemData,
        imageUrl: null,
        edited: false,
        editedAt: null
      };
      
      await messageRef.set(messageData);
      
      // Update conversation last message
      await db.collection('conversations').doc(conversationId).update({
        lastMessage: messageText,
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageSender: 'system',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return messageRef.id;
    } catch (error) {
      console.error('Error sending system message:', error);
      throw error;
    }
  },

  // Send offer message
  sendOfferMessage: async (conversationId, senderId, senderName, offerData) => {
    try {
      const offerMessage = `💼 **New Offer Submitted**\n\n` +
        `💰 **Amount:** RM ${offerData.amount}\n` +
        `⏱️ **Duration:** ${offerData.estimatedDuration}\n` +
        `🛠️ **Materials:** ${offerData.materialsIncluded ? 'Included' : 'Not included'}\n\n` +
        `📝 **Message:** ${offerData.message}`;
      
      return await chatService.sendMessage(
        conversationId, 
        senderId, 
        senderName, 
        offerMessage, 
        'offer',
        {
          offerData: offerData,
          offerType: offerData.offerType || 'counter',
          projectId: offerData.projectId
        }
      );
    } catch (error) {
      console.error('Error sending offer message:', error);
      throw error;
    }
  },

  // Get user conversations with enhanced project info
  getUserConversations: async (userId) => {
    try {
      const snapshot = await db.collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString(),
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate()?.toISOString()
        };
      });
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
            const conversations = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate()?.toISOString(),
                updatedAt: data.updatedAt?.toDate()?.toISOString(),
                lastMessageTimestamp: data.lastMessageTimestamp?.toDate()?.toISOString()
              };
            });
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
            const messages = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate()?.toISOString()
              };
            });
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
  },

  // Mark messages as read
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      const batch = db.batch();
      
      // Mark all unread messages from other participants as read
      const messagesSnapshot = await db.collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .where('read', '==', false)
        .where('senderId', '!=', userId)
        .get();
      
      messagesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      
      // Reset unread count for this user
      const conversationRef = db.collection('conversations').doc(conversationId);
      batch.update(conversationRef, {
        [`unreadCount.${userId}`]: 0
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get conversation by ID
  getConversation: async (conversationId) => {
    try {
      const doc = await db.collection('conversations').doc(conversationId).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString(),
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate()?.toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  // Update conversation project status
  updateConversationProjectStatus: async (conversationId, newStatus) => {
    try {
      await db.collection('conversations').doc(conversationId).update({
        projectStatus: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating conversation project status:', error);
      throw error;
    }
  },

  // Get conversations for a specific project
  getProjectConversations: async (projectId) => {
    try {
      const snapshot = await db.collection('conversations')
        .where('projectId', '==', projectId)
        .orderBy('updatedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString(),
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate()?.toISOString()
        };
      });
    } catch (error) {
      console.error('Error getting project conversations:', error);
      throw error;
    }
  }
};