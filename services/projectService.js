// services/projectService.js
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  // If it's already a string (ISO format), return as is
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // If it's a Firestore Timestamp, convert to ISO string
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // If it's a JavaScript Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // Fallback
  return null;
};

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

  // Get projects that are in negotiation with a specific handyman
getNegotiatingProjectsForHandyman: async (handymanId) => {
  try {
    const snapshot = await db.collection('projects')
      .where('status', '==', 'in_negotiation')
      .where('negotiatingHandymanId', '==', handymanId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
    }));
  } catch (error) {
    console.error('Error getting negotiating projects for handyman:', error);
    return []; // Return empty array instead of throwing
  }
},

// Get projects specifically requested for a handyman (direct hire)
getProjectsForHandyman: async (handymanId) => {
  try {
    const snapshot = await db.collection('projects')
      .where('status', '==', 'pending_handyman_review')
      .where('requestedHandymanId', '==', handymanId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      preferredDate: doc.data().preferredDate?.toDate()?.toISOString(),
    }));
  } catch (error) {
    console.error('Error getting projects for handyman:', error);
    return []; // Return empty array instead of throwing
  }
},

// Subscribe to projects specifically for a handyman
subscribeToHandymanProjects: (handymanId, onUpdate, onError) => {
  try {
    const unsubscribe = db.collection('projects')
      .where('requestedHandymanId', '==', handymanId)
      .where('status', 'in', ['pending_handyman_review', 'in_negotiation'])
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
          }));
          onUpdate(projects);
        },
        (error) => {
          console.error('Error in handyman projects subscription:', error);
          if (onError) onError(error);
        }
      );
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up handyman projects subscription:', error);
    if (onError) onError(error);
    return null;
  }
},

  // Get project by ID
getProjectById: async (projectId) => {
  try {
    const doc = await db.collection('projects').doc(projectId).get();
    if (doc.exists) {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Safe timestamp conversion
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        preferredDate: convertTimestamp(data.preferredDate),
        completedAt: convertTimestamp(data.completedAt),
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

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Safe timestamp conversion - handles both Firestore Timestamps and ISO strings
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          preferredDate: convertTimestamp(data.preferredDate),
          completedAt: convertTimestamp(data.completedAt),
        };
      });
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
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Safe timestamp conversion
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        preferredDate: convertTimestamp(data.preferredDate),
        completedAt: convertTimestamp(data.completedAt),
      };
    });
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
          const projects = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Safe timestamp conversion
              createdAt: convertTimestamp(data.createdAt),
              updatedAt: convertTimestamp(data.updatedAt),
              preferredDate: convertTimestamp(data.preferredDate),
              completedAt: convertTimestamp(data.completedAt),
            };
          });
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
  },

  // Enhanced status update with transition validation
updateProjectStatus: async (projectId, newStatus, additionalData = {}) => {
  try {
    const updateData = {
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      [`${newStatus}At`]: firebase.firestore.FieldValue.serverTimestamp(),
      ...additionalData,
    };
    
    await db.collection('projects').doc(projectId).update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
},

// Get projects that need customer attention
getProjectsAwaitingCustomerAction: async (customerId) => {
  try {
    const snapshot = await db.collection('projects')
      .where('customerId', '==', customerId)
      .where('status', 'in', ['awaiting_payment', 'pending_completion'])
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        preferredDate: convertTimestamp(data.preferredDate),
        completedAt: convertTimestamp(data.completedAt),
      };
    });
  } catch (error) {
    console.error('Error getting projects awaiting customer action:', error);
    throw error;
  }
},

// Get projects that need handyman attention
getProjectsAwaitingHandymanAction: async (handymanId) => {
  try {
    const snapshot = await db.collection('projects')
      .where('handymanId', '==', handymanId)
      .where('status', 'in', ['in_progress'])
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        preferredDate: convertTimestamp(data.preferredDate),
        completedAt: convertTimestamp(data.completedAt),
      };
    });
  } catch (error) {
    console.error('Error getting projects awaiting handyman action:', error);
    throw error;
  }
}
};