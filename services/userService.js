// services/userService.js - Fixed version with optional rating field
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

export const userService = {
  // Create a new user profile
  // Create a new user profile
createUser: async (userId, userData) => {
  try {
    // Remove any undefined values to prevent Firestore errors
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );

    const userDoc = {
      ...cleanUserData,
      isActive: true,
      profileComplete: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    
    await db.collection('users').doc(userId).set(userDoc);
    
    return {
      id: userId,
      ...userDoc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
},

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const doc = await db.collection('users').doc(userId).get();
      if (doc.exists) {
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
          // Safely convert timestamps to ISO strings
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : null,
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate().toISOString() : null,
          lastActiveAt: userData.lastActiveAt?.toDate ? userData.lastActiveAt.toDate().toISOString() : null,
          deactivatedAt: userData.deactivatedAt?.toDate ? userData.deactivatedAt.toDate().toISOString() : null,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    try {
      const updateData = {
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      
      await db.collection('users').doc(userId).update(updateData);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get top rated handymen - FIXED VERSION
  getTopRatedHandymen: async (limit = 10) => {
    try {
      // First, get all active handymen (without orderBy rating to avoid requiring rating field)
      const snapshot = await db.collection('users')
        .where('role', '==', 'handyman')
        .where('isActive', '==', true)
        .limit(limit * 2) // Get more to allow for sorting
        .get();

      const handymen = snapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
          // Ensure rating exists, default to 0 if missing
          rating: userData.rating || 0,
          reviewCount: userData.reviewCount || 0,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : null,
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate().toISOString() : null,
        };
      });

      // Sort by rating in JavaScript, then by reviewCount as tiebreaker
      const sortedHandymen = handymen.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating; // Higher rating first
        }
        return (b.reviewCount || 0) - (a.reviewCount || 0); // More reviews as tiebreaker
      });

      // Return only the requested limit
      return sortedHandymen.slice(0, limit);
    } catch (error) {
      console.error('Error getting top rated handymen:', error);
      throw error;
    }
  },

  // Search handymen by criteria
  searchHandymen: async (searchCriteria = {}) => {
    try {
      let query = db.collection('users').where('role', '==', 'handyman').where('isActive', '==', true);
      
      // Apply filters
      if (searchCriteria.category) {
        query = query.where('serviceCategories', 'array-contains', searchCriteria.category);
      }
      
      if (searchCriteria.location) {
        query = query.where('location', '>=', searchCriteria.location)
                    .where('location', '<=', searchCriteria.location + '\uf8ff');
      }
      
      const snapshot = await query.get();
      
      const handymen = snapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
          rating: userData.rating || 0,
          reviewCount: userData.reviewCount || 0,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : null,
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate().toISOString() : null,
        };
      });

      // Filter by minRating if specified, then sort
      let filteredHandymen = handymen;
      if (searchCriteria.minRating) {
        filteredHandymen = handymen.filter(h => (h.rating || 0) >= searchCriteria.minRating);
      }

      // Sort by rating
      return filteredHandymen.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (error) {
      console.error('Error searching handymen:', error);
      throw error;
    }
  },

  // Get handymen by category
  getHandymenByCategory: async (category) => {
    try {
      const snapshot = await db.collection('users')
        .where('role', '==', 'handyman')
        .where('serviceCategories', 'array-contains', category)
        .where('isActive', '==', true)
        .get();

      const handymen = snapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
          rating: userData.rating || 0,
          reviewCount: userData.reviewCount || 0,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : null,
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate().toISOString() : null,
        };
      });

      // Sort by rating
      return handymen.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (error) {
      console.error('Error getting handymen by category:', error);
      throw error;
    }
  },

  // Update handyman rating and review count
  updateHandymanRating: async (handymanId, newRating, incrementReviews = true) => {
    try {
      const updates = {
        rating: newRating,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      
      if (incrementReviews) {
        updates.reviewCount = firebase.firestore.FieldValue.increment(1);
      }
      
      await db.collection('users').doc(handymanId).update(updates);
      return true;
    } catch (error) {
      console.error('Error updating handyman rating:', error);
      throw error;
    }
  },

  // Increment completed jobs for handyman
  incrementCompletedJobs: async (handymanId) => {
    try {
      await db.collection('users').doc(handymanId).update({
        completedJobs: firebase.firestore.FieldValue.increment(1),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error incrementing completed jobs:', error);
      throw error;
    }
  },

  // Check if user exists by email
  getUserByEmail: async (email) => {
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', email.toLowerCase())
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
          rating: userData.rating || 0,
          reviewCount: userData.reviewCount || 0,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : null,
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate().toISOString() : null,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Update user's last active timestamp
  updateLastActive: async (userId) => {
    try {
      await db.collection('users').doc(userId).update({
        lastActiveAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating last active:', error);
      throw error;
    }
  },

  // Deactivate user account
  deactivateUser: async (userId) => {
    try {
      await db.collection('users').doc(userId).update({
        isActive: false,
        deactivatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (userId) => {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('User not found');
      
      const stats = {
        profileComplete: user.profileComplete || false,
        joinDate: user.createdAt,
        lastActive: user.lastActiveAt,
        isActive: user.isActive,
      };
      
      if (user.role === 'handyman') {
        stats.rating = user.rating || 0;
        stats.reviewCount = user.reviewCount || 0;
        stats.completedJobs = user.completedJobs || 0;
        stats.hourlyRate = user.hourlyRate || 0;
        stats.experience = user.experience || 0;
        stats.serviceCategories = user.serviceCategories || [];
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },

  // Update user service categories (for handymen)
  updateServiceCategories: async (handymanId, categories) => {
    try {
      await db.collection('users').doc(handymanId).update({
        serviceCategories: categories,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating service categories:', error);
      throw error;
    }
  },

  // Update user location
  updateUserLocation: async (userId, location, coordinates = null) => {
    try {
      const updates = {
        location,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      
      if (coordinates) {
        updates.coordinates = new firebase.firestore.GeoPoint(
          coordinates.latitude,
          coordinates.longitude
        );
      }
      
      await db.collection('users').doc(userId).update(updates);
      return true;
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  },

  // Update handyman services
updateHandymanServices: async (handymanId, services) => {
  try {
    await db.collection('users').doc(handymanId).update({
      services: services,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating handyman services:', error);
    throw error;
  }
},

// Get handyman services
getHandymanServices: async (handymanId) => {
  try {
    const userDoc = await db.collection('users').doc(handymanId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.services || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting handyman services:', error);
    return [];
  }
}

};