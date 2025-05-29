// services/scheduleService.js
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

export const scheduleService = {
  /**
   * Check if a handyman has scheduling conflicts for a project
   * @param {string} handymanId - The handyman's ID
   * @param {Date} startDate - Project start date
   * @param {Date} endDate - Project end date (optional, defaults to same day)
   * @param {string} excludeProjectId - Project ID to exclude from conflict check
   * @returns {Promise<{hasConflict: boolean, conflictingProjects: Array}>}
   */
  checkScheduleConflict: async (handymanId, startDate, endDate = null, excludeProjectId = null) => {
    try {
      // If no end date specified, assume same day work
      const effectiveEndDate = endDate || new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // +8 hours default
      
      // Get all active projects for this handyman
      let query = db.collection('projects')
        .where('handymanId', '==', handymanId)
        .where('status', 'in', [
          'agreed_scheduled', 
          'awaiting_payment', 
          'in_progress', 
          'payment_processing'
        ]);
      
      const snapshot = await query.get();
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const conflictingProjects = [];
      
      // Check each project for time conflicts
      for (const project of projects) {
        // Skip the project we're excluding (for updates)
        if (excludeProjectId && project.id === excludeProjectId) {
          continue;
        }
        
        // Parse project dates
        let projectStartDate;
        let projectEndDate;
        
        if (project.scheduledStartDate) {
          projectStartDate = project.scheduledStartDate.toDate ? 
            project.scheduledStartDate.toDate() : 
            new Date(project.scheduledStartDate);
        } else if (project.preferredDate) {
          projectStartDate = project.preferredDate.toDate ? 
            project.preferredDate.toDate() : 
            new Date(project.preferredDate);
        } else {
          continue; // Skip projects without dates
        }
        
        // Use scheduled end date or estimate based on duration
        if (project.scheduledEndDate) {
          projectEndDate = project.scheduledEndDate.toDate ? 
            project.scheduledEndDate.toDate() : 
            new Date(project.scheduledEndDate);
        } else {
          // Estimate end time based on duration or default to 8 hours
          const durationHours = project.estimatedDurationHours || 4;
          projectEndDate = new Date(projectStartDate.getTime() + durationHours * 60 * 60 * 1000);
        }
        
        // Check for overlap
        const hasOverlap = (startDate < projectEndDate) && (effectiveEndDate > projectStartDate);
        
        if (hasOverlap) {
          conflictingProjects.push({
            id: project.id,
            title: project.title,
            startDate: projectStartDate,
            endDate: projectEndDate,
            status: project.status
          });
        }
      }
      
      return {
        hasConflict: conflictingProjects.length > 0,
        conflictingProjects: conflictingProjects
      };
      
    } catch (error) {
      console.error('Error checking schedule conflict:', error);
      throw error;
    }
  },

  /**
   * Get handyman's availability for a specific date range
   * @param {string} handymanId - The handyman's ID
   * @param {Date} startDate - Start of date range
   * @param {Date} endDate - End of date range
   * @returns {Promise<Array>} Array of available time slots
   */
  getAvailability: async (handymanId, startDate, endDate) => {
    try {
      // Get handyman's working hours (default 8 AM to 6 PM)
      const userDoc = await db.collection('users').doc(handymanId).get();
      const userData = userDoc.data();
      
      const workingHours = userData.workingHours || {
        start: 8, // 8 AM
        end: 18,   // 6 PM
        daysOff: [0] // Sunday off by default
      };
      
      // Get all scheduled projects in the date range
      const query = db.collection('projects')
        .where('handymanId', '==', handymanId)
        .where('status', 'in', [
          'agreed_scheduled', 
          'awaiting_payment', 
          'in_progress', 
          'payment_processing'
        ]);
      
      const snapshot = await query.get();
      const projects = snapshot.docs.map(doc => doc.data());
      
      // Generate available time slots
      const availableSlots = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        
        // Skip days off
        if (!workingHours.daysOff.includes(dayOfWeek)) {
          // Check if this day has any conflicts
          const dayStart = new Date(currentDate);
          dayStart.setHours(workingHours.start, 0, 0, 0);
          
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(workingHours.end, 0, 0, 0);
          
          const dayConflicts = projects.filter(project => {
            const projectDate = project.preferredDate?.toDate ? 
              project.preferredDate.toDate() : 
              new Date(project.preferredDate);
            
            return projectDate && 
              projectDate.toDateString() === currentDate.toDateString();
          });
          
          if (dayConflicts.length === 0) {
            availableSlots.push({
              date: new Date(currentDate),
              startTime: new Date(dayStart),
              endTime: new Date(dayEnd),
              available: true
            });
          } else {
            // Calculate available time slots around conflicts
            // This is a simplified version - you might want more sophisticated scheduling
            availableSlots.push({
              date: new Date(currentDate),
              startTime: new Date(dayStart),
              endTime: new Date(dayEnd),
              available: false,
              conflicts: dayConflicts.length
            });
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return availableSlots;
      
    } catch (error) {
      console.error('Error getting availability:', error);
      throw error;
    }
  },

  /**
   * Update handyman's working hours and availability preferences
   * @param {string} handymanId - The handyman's ID
   * @param {Object} workingHours - Working hours configuration
   * @returns {Promise<boolean>}
   */
  updateWorkingHours: async (handymanId, workingHours) => {
    try {
      await db.collection('users').doc(handymanId).update({
        workingHours: workingHours,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating working hours:', error);
      throw error;
    }
  },

  /**
   * Format conflict information for user display
   * @param {Array} conflictingProjects - Array of conflicting projects
   * @returns {string} Formatted conflict message
   */
  formatConflictMessage: (conflictingProjects) => {
    if (conflictingProjects.length === 0) return '';
    
    if (conflictingProjects.length === 1) {
      const conflict = conflictingProjects[0];
      return `You already have "${conflict.title}" scheduled for ${conflict.startDate.toLocaleDateString()}`;
    } else {
      return `You have ${conflictingProjects.length} other projects scheduled during this time`;
    }
  },

  /**
   * Suggest alternative dates when there's a conflict
   * @param {string} handymanId - The handyman's ID
   * @param {Date} preferredDate - Originally preferred date
   * @param {number} daysToCheck - Number of days to check for alternatives
   * @returns {Promise<Array>} Array of alternative available dates
   */
  suggestAlternativeDates: async (handymanId, preferredDate, daysToCheck = 7) => {
    try {
      const alternatives = [];
      const checkDate = new Date(preferredDate);
      
      for (let i = 1; i <= daysToCheck; i++) {
        // Check next day
        const nextDate = new Date(checkDate);
        nextDate.setDate(checkDate.getDate() + i);
        
        const conflict = await scheduleService.checkScheduleConflict(
          handymanId, 
          nextDate
        );
        
        if (!conflict.hasConflict) {
          alternatives.push(nextDate);
        }
        
        // Check previous day
        const prevDate = new Date(checkDate);
        prevDate.setDate(checkDate.getDate() - i);
        
        // Don't suggest dates in the past
        if (prevDate > new Date()) {
          const prevConflict = await scheduleService.checkScheduleConflict(
            handymanId, 
            prevDate
          );
          
          if (!prevConflict.hasConflict) {
            alternatives.push(prevDate);
          }
        }
        
        // Stop if we found enough alternatives
        if (alternatives.length >= 3) break;
      }
      
      // Sort alternatives by date
      return alternatives.sort((a, b) => a - b);
      
    } catch (error) {
      console.error('Error suggesting alternative dates:', error);
      return [];
    }
  }
};