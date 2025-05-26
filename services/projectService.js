// services/projectService.js
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

export const projectService = {
  // Create a new project
  createProject: async (projectData) => {
    try {
      const docRef = await db.collection('projects').add({
        ...projectData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // Return the project with the generated ID
      return {
        id: docRef.id,
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (projectId) => {
    try {
      const doc = await db.collection('projects').doc(projectId).get();
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
          // Convert timestamps to ISO strings
          createdAt: doc.data().createdAt?.toDate()?.toISOString(),
          updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
          preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
          completedAt: doc.data().completedAt?.toDate()?.toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  },

  // Get projects for a specific user (customer or handyman)
  getUserProjects: async (userId, userType) => {
    try {
      const field = userType === 'customer' ? 'customerId' : 'handymanId';
      const snapshot = await db.collection('projects')
        .where(field, '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
        preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
        completedAt: doc.data().completedAt?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting user projects:', error);
      throw error;
    }
  },

  // Get open projects (for handymen to browse)
  getOpenProjects: async (filters = {}) => {
    try {
      let query = db.collection('projects').where('status', '==', 'open');
      
      // Apply filters
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      
      // Order by creation date (newest first)
      query = query.orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
        preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting open projects:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, updates) => {
    try {
      const updateData = {
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      
      // Convert date strings to Firestore timestamps if needed
      if (updates.preferredDate && typeof updates.preferredDate === 'string') {
        updateData.preferredDate = firebase.firestore.Timestamp.fromDate(new Date(updates.preferredDate));
      }
      if (updates.completedAt && typeof updates.completedAt === 'string') {
        updateData.completedAt = firebase.firestore.Timestamp.fromDate(new Date(updates.completedAt));
      }
      
      await db.collection('projects').doc(projectId).update(updateData);
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Update project status
  updateProjectStatus: async (projectId, status, additionalData = {}) => {
    try {
      const updateData = {
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData,
      };
      
      await db.collection('projects').doc(projectId).update(updateData);
      return true;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  },

  // Assign handyman to project
  assignHandymanToProject: async (projectId, handymanId, agreedBudget) => {
    try {
      await db.collection('projects').doc(projectId).update({
        handymanId,
        agreedBudget,
        status: 'agreed_scheduled',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error assigning handyman to project:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      await db.collection('projects').doc(projectId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Subscribe to real-time updates for user projects
  subscribeToUserProjects: (userId, userType, onUpdate, onError) => {
    try {
      const field = userType === 'customer' ? 'customerId' : 'handymanId';
      
      const unsubscribe = db.collection('projects')
        .where(field, '==', userId)
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          (snapshot) => {
            const projects = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Convert timestamps to ISO strings
              createdAt: doc.data().createdAt?.toDate()?.toISOString(),
              updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
              preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
              completedAt: doc.data().completedAt?.toDate()?.toISOString(),
            }));
            onUpdate(projects);
          },
          (error) => {
            console.error('Error in projects subscription:', error);
            if (onError) onError(error);
          }
        );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up projects subscription:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Subscribe to real-time updates for open projects (for handymen)
  subscribeToOpenProjects: (onUpdate, onError, filters = {}) => {
    try {
      let query = db.collection('projects').where('status', '==', 'open');
      
      // Apply filters
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      
      query = query.orderBy('createdAt', 'desc');
      
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert timestamps to ISO strings
            createdAt: doc.data().createdAt?.toDate()?.toISOString(),
            updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
            preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
          }));
          onUpdate(projects);
        },
        (error) => {
          console.error('Error in open projects subscription:', error);
          if (onError) onError(error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up open projects subscription:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Search projects by criteria
  searchProjects: async (searchCriteria) => {
    try {
      let query = db.collection('projects');
      
      // Apply search filters
      if (searchCriteria.status) {
        query = query.where('status', '==', searchCriteria.status);
      }
      
      if (searchCriteria.category) {
        query = query.where('category', '==', searchCriteria.category);
      }
      
      if (searchCriteria.location) {
        // For location search, we might need to implement geo-queries
        // For now, we'll do a simple text match
        query = query.where('location', '>=', searchCriteria.location)
                    .where('location', '<=', searchCriteria.location + '\uf8ff');
      }
      
      // Apply budget range filter
      if (searchCriteria.minBudget) {
        query = query.where('initialBudget', '>=', searchCriteria.minBudget);
      }
      
      if (searchCriteria.maxBudget) {
        query = query.where('initialBudget', '<=', searchCriteria.maxBudget);
      }
      
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
        preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
      }));
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  },

  // Get project statistics for a user
  getUserProjectStats: async (userId, userType) => {
    try {
      const field = userType === 'customer' ? 'customerId' : 'handymanId';
      const snapshot = await db.collection('projects')
        .where(field, '==', userId)
        .get();

      const projects = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        total: projects.length,
        active: projects.filter(p => !['completed', 'cancelled', 'disputed'].includes(p.status)).length,
        completed: projects.filter(p => p.status === 'completed').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.agreedBudget || p.initialBudget || 0), 0),
      };
      
      if (userType === 'handyman') {
        // Additional stats for handymen
        const completedProjects = projects.filter(p => p.status === 'completed');
        stats.totalEarnings = completedProjects.reduce((sum, p) => sum + (p.agreedBudget || 0), 0);
        stats.averageRating = 4.5; // This would come from reviews
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting user project stats:', error);
      throw error;
    }
  }
};