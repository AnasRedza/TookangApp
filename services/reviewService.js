// services/reviewService.js
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { userService } from './userService';

export const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    try {
      const batch = db.batch();
      
      // Create review document
      const reviewRef = db.collection('reviews').doc();
      const reviewDoc = {
        id: reviewRef.id,
        ...reviewData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true
      };
      
      batch.set(reviewRef, reviewDoc);
      
      // Update the reviewee's rating and review count
      const revieweeRef = db.collection('users').doc(reviewData.revieweeId);
      
      // Get current user data to calculate new rating
      const revieweeDoc = await revieweeRef.get();
      const revieweeData = revieweeDoc.data();
      
      const currentRating = revieweeData.rating || 0;
      const currentReviewCount = revieweeData.reviewCount || 0;
      const newReviewCount = currentReviewCount + 1;
      const newRating = ((currentRating * currentReviewCount) + reviewData.rating) / newReviewCount;
      
      batch.update(revieweeRef, {
        rating: Number(newRating.toFixed(1)),
        reviewCount: newReviewCount,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await batch.commit();
      
      return {
        id: reviewRef.id,
        ...reviewDoc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get reviews for a specific user (reviewee)
  getUserReviews: async (userId, limit = 10) => {
    try {
      const snapshot = await db.collection('reviews')
        .where('revieweeId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString(),
        };
      });
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  },

  // Get reviews written by a specific user (reviewer)
  getReviewsByUser: async (userId, limit = 10) => {
    try {
      const snapshot = await db.collection('reviews')
        .where('reviewerId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString(),
        };
      });
    } catch (error) {
      console.error('Error getting reviews by user:', error);
      throw error;
    }
  },

  // Get review statistics for a user
  getUserReviewStats: async (userId) => {
    try {
      const snapshot = await db.collection('reviews')
        .where('revieweeId', '==', userId)
        .where('isActive', '==', true)
        .get();

      const reviews = snapshot.docs.map(doc => doc.data());
      
      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
      }

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;

      reviews.forEach(review => {
        totalRating += review.rating;
        ratingDistribution[review.rating]++;
      });

      return {
        totalReviews: reviews.length,
        averageRating: Number((totalRating / reviews.length).toFixed(1)),
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting user review stats:', error);
      throw error;
    }
  },

  // Check if user has already reviewed for a specific project
  hasUserReviewedProject: async (reviewerId, projectId) => {
    try {
      const snapshot = await db.collection('reviews')
        .where('reviewerId', '==', reviewerId)
        .where('projectId', '==', projectId)
        .where('isActive', '==', true)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking if user reviewed project:', error);
      return false;
    }
  },

  // Subscribe to real-time updates for user reviews
  subscribeToUserReviews: (userId, onUpdate, onError) => {
    try {
      const unsubscribe = db.collection('reviews')
        .where('revieweeId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          (snapshot) => {
            const reviews = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate()?.toISOString(),
                updatedAt: data.updatedAt?.toDate()?.toISOString(),
              };
            });
            onUpdate(reviews);
          },
          (error) => {
            console.error('Error in reviews subscription:', error);
            if (onError) onError(error);
          }
        );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up reviews subscription:', error);
      if (onError) onError(error);
      return null;
    }
  }
};