// utils/scheduleUtils.js
import { db } from '../firebase';
import { scheduleService } from '../services/scheduleService';

/**
 * Check if a handyman is available at a specific time
 * @param {string} handymanId - The handyman's ID  
 * @param {Date} date - The date to check
 * @returns {Promise<boolean>} True if available, false if busy
 */
export const isHandymanAvailable = async (handymanId, date) => {
  try {
    const conflict = await scheduleService.checkScheduleConflict(handymanId, date);
    return !conflict.hasConflict;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false; // Assume not available if we can't check
  }
};

/**
 * Get handyman's busy dates for calendar display
 * @param {string} handymanId - The handyman's ID
 * @param {Date} startDate - Start date for the range
 * @param {Date} endDate - End date for the range
 * @returns {Promise<Array>} Array of busy dates with project info
 */
export const getHandymanBusyDates = async (handymanId, startDate, endDate) => {
  try {
    const query = db.collection('projects')
      .where('handymanId', '==', handymanId)
      .where('status', 'in', [
        'agreed_scheduled', 
        'awaiting_payment', 
        'in_progress', 
        'payment_processing'
      ]);
    
    const snapshot = await query.get();
    const busyDates = [];
    
    snapshot.docs.forEach(doc => {
      const project = doc.data();
      let projectDate = null;
      
      // Prefer scheduled start date, fall back to preferred date
      if (project.scheduledStartDate) {
        projectDate = project.scheduledStartDate.toDate ? 
          project.scheduledStartDate.toDate() : 
          new Date(project.scheduledStartDate);
      } else if (project.preferredDate) {
        projectDate = project.preferredDate.toDate ? 
          project.preferredDate.toDate() : 
          new Date(project.preferredDate);
      }
      
      if (projectDate && projectDate >= startDate && projectDate <= endDate) {
        busyDates.push({
          date: projectDate,
          projectTitle: project.title,
          projectId: doc.id,
          status: project.status,
          estimatedDuration: project.estimatedDurationHours || 4 // Changed from 8 to 4 hours default
        });
      }
    });
    
    return busyDates.sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Error getting busy dates:', error);
    return [];
  }
};

/**
 * Check if a specific date/time slot is available for a handyman
 * @param {string} handymanId - The handyman's ID
 * @param {Date} date - The date to check
 * @param {number} durationHours - Duration of the job in hours (default 8)
 * @returns {Promise<{available: boolean, conflicts: Array}>}
 */
export const checkTimeSlotAvailability = async (handymanId, date, durationHours = 4) => {
  try {
    const endTime = new Date(date.getTime() + durationHours * 60 * 60 * 1000);
    
    const query = db.collection('projects')
      .where('handymanId', '==', handymanId)
      .where('status', 'in', [
        'agreed_scheduled', 
        'awaiting_payment', 
        'in_progress', 
        'payment_processing'
      ]);
    
    const snapshot = await query.get();
    const conflicts = [];
    
    snapshot.docs.forEach(doc => {
      const project = doc.data();
      let projectStartDate = null;
      let projectEndDate = null;
      
      // Get project start date
      if (project.scheduledStartDate) {
        projectStartDate = project.scheduledStartDate.toDate ? 
          project.scheduledStartDate.toDate() : 
          new Date(project.scheduledStartDate);
      } else if (project.preferredDate) {
        projectStartDate = project.preferredDate.toDate ? 
          project.preferredDate.toDate() : 
          new Date(project.preferredDate);
      }
      
      if (!projectStartDate) return;
      
      // Get project end date
      if (project.scheduledEndDate) {
        projectEndDate = project.scheduledEndDate.toDate ? 
          project.scheduledEndDate.toDate() : 
          new Date(project.scheduledEndDate);
      } else {
        // Estimate based on duration
        const projectDuration = project.estimatedDurationHours || 4;
        projectEndDate = new Date(projectStartDate.getTime() + projectDuration * 60 * 60 * 1000);
      }
      
      // Check for time overlap
      const hasOverlap = (date < projectEndDate) && (endTime > projectStartDate);
      
      if (hasOverlap) {
        conflicts.push({
          projectId: doc.id,
          title: project.title,
          startDate: projectStartDate,
          endDate: projectEndDate,
          status: project.status
        });
      }
    });
    
    return {
      available: conflicts.length === 0,
      conflicts: conflicts
    };
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return {
      available: false,
      conflicts: []
    };
  }
};

/**
 * Get suggested alternative dates when there's a conflict
 * @param {string} handymanId - The handyman's ID
 * @param {Date} originalDate - The originally requested date
 * @param {number} daysToCheck - Number of days to check forward/backward
 * @param {number} durationHours - Duration of the job in hours
 * @returns {Promise<Array>} Array of available alternative dates
 */
export const getSuggestedAlternativeDates = async (handymanId, originalDate, daysToCheck = 7, durationHours = 4) => {
  try {
    const alternatives = [];
    const today = new Date();
    
    // Get handyman's working days (default excludes Sunday)
    const userDoc = await db.collection('users').doc(handymanId).get();
    const userData = userDoc.data();
    const workingHours = userData.workingHours || {
      daysOff: [0] // Sunday off by default
    };
    
    for (let i = 1; i <= daysToCheck; i++) {
      // Check future dates
      const futureDate = new Date(originalDate);
      futureDate.setDate(originalDate.getDate() + i);
      
      // Skip if it's a day off
      if (!workingHours.daysOff.includes(futureDate.getDay())) {
        const availability = await checkTimeSlotAvailability(handymanId, futureDate, durationHours);
        if (availability.available) {
          alternatives.push({
            date: futureDate,
            label: getDateLabel(futureDate),
            dayOfWeek: futureDate.toLocaleDateString('en-US', { weekday: 'long' })
          });
        }
      }
      
      // Check past dates (but not before today)
      const pastDate = new Date(originalDate);
      pastDate.setDate(originalDate.getDate() - i);
      
      if (pastDate > today && !workingHours.daysOff.includes(pastDate.getDay())) {
        const availability = await checkTimeSlotAvailability(handymanId, pastDate, durationHours);
        if (availability.available) {
          alternatives.push({
            date: pastDate,
            label: getDateLabel(pastDate),
            dayOfWeek: pastDate.toLocaleDateString('en-US', { weekday: 'long' })
          });
        }
      }
      
      // Stop if we have enough alternatives
      if (alternatives.length >= 5) break;
    }
    
    // Sort by date
    return alternatives.sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Error getting suggested alternatives:', error);
    return [];
  }
};

/**
 * Get a user-friendly date label
 * @param {Date} date - The date to format
 * @returns {string} Formatted date label
 */
export const getDateLabel = (date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
};

/**
 * Calculate working hours overlap between two time periods
 * @param {Date} start1 - Start of first period
 * @param {Date} end1 - End of first period
 * @param {Date} start2 - Start of second period
 * @param {Date} end2 - End of second period
 * @returns {number} Hours of overlap
 */
export const calculateTimeOverlap = (start1, end1, start2, end2) => {
  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
  
  if (overlapStart < overlapEnd) {
    return (overlapEnd - overlapStart) / (1000 * 60 * 60); // Convert to hours
  }
  
  return 0;
};

/**
 * Format duration in hours to a readable string
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration string
 */
export const formatDuration = (hours) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours === 1) {
    return '1 hour';
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours} hours`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (remainingHours === 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${days}d ${remainingHours}h`;
    }
  }
};

/**
 * Check if a date falls within working hours
 * @param {Date} date - The date to check
 * @param {Object} workingHours - Working hours configuration
 * @returns {boolean} Whether the date is within working hours
 */
export const isWithinWorkingHours = (date, workingHours = {}) => {
  const defaultWorkingHours = {
    start: 8, // 8 AM
    end: 18,  // 6 PM
    daysOff: [0] // Sunday
  };
  
  const hours = { ...defaultWorkingHours, ...workingHours };
  const dayOfWeek = date.getDay();
  const hourOfDay = date.getHours();
  
  // Check if it's a day off
  if (hours.daysOff.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if it's within working hours
  return hourOfDay >= hours.start && hourOfDay < hours.end;
};

/**
 * Get the next available working day
 * @param {Date} fromDate - Starting date
 * @param {Object} workingHours - Working hours configuration
 * @returns {Date} Next available working day
 */
export const getNextWorkingDay = (fromDate, workingHours = {}) => {
  const defaultWorkingHours = {
    daysOff: [0] // Sunday
  };
  
  const hours = { ...defaultWorkingHours, ...workingHours };
  const nextDay = new Date(fromDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Keep incrementing until we find a working day
  while (hours.daysOff.includes(nextDay.getDay())) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

/**
 * Get available time slots for a specific day
 * @param {string} handymanId - The handyman's ID
 * @param {Date} date - The date to check
 * @param {Object} workingHours - Working hours configuration
 * @returns {Promise<Array>} Array of available time slots
 */
export const getAvailableTimeSlots = async (handymanId, date, workingHours = {}) => {
  try {
    const defaultHours = {
      start: 8,  // 8 AM
      end: 18,   // 6 PM
      slotDuration: 2, // 2-hour slots
      daysOff: [0]
    };
    
    const hours = { ...defaultHours, ...workingHours };
    const dayOfWeek = date.getDay();
    
    // Check if it's a day off
    if (hours.daysOff.includes(dayOfWeek)) {
      return [];
    }
    
    // Get busy periods for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const busyPeriods = await getHandymanBusyDates(handymanId, startOfDay, endOfDay);
    
    // Generate time slots
    const timeSlots = [];
    const currentTime = new Date(date);
    currentTime.setHours(hours.start, 0, 0, 0);
    
    while (currentTime.getHours() < hours.end) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + hours.slotDuration * 60 * 60 * 1000);
      
      // Check if this slot conflicts with any busy periods
      const hasConflict = busyPeriods.some(busy => {
        const busyStart = busy.date;
        const busyEnd = new Date(busy.date.getTime() + busy.estimatedDuration * 60 * 60 * 1000);
        return (slotStart < busyEnd) && (slotEnd > busyStart);
      });
      
      timeSlots.push({
        start: new Date(slotStart),
        end: new Date(slotEnd),
        available: !hasConflict,
        label: `${slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
      
      currentTime.setHours(currentTime.getHours() + hours.slotDuration);
    }
    
    return timeSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
};

/**
 * Validate if a project can be scheduled at a specific time
 * @param {string} handymanId - The handyman's ID
 * @param {Date} startDate - Proposed start date
 * @param {number} durationHours - Project duration in hours
 * @param {string} excludeProjectId - Project ID to exclude from conflict check
 * @returns {Promise<{valid: boolean, conflicts: Array, suggestions: Array}>}
 */
export const validateProjectSchedule = async (handymanId, startDate, durationHours = 8, excludeProjectId = null) => {
  try {
    // Import scheduleService here to avoid circular dependency
    const { scheduleService } = await import('../services/scheduleService');
    
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    
    // Check for conflicts
    const conflict = await scheduleService.checkScheduleConflict(
      handymanId, 
      startDate, 
      endDate, 
      excludeProjectId
    );
    
    let suggestions = [];
    
    // If there are conflicts, get alternative suggestions
    if (conflict.hasConflict) {
      suggestions = await getSuggestedAlternativeDates(
        handymanId, 
        startDate, 
        7, 
        durationHours
      );
    }
    
    return {
      valid: !conflict.hasConflict,
      conflicts: conflict.conflictingProjects,
      suggestions: suggestions
    };
  } catch (error) {
    console.error('Error validating project schedule:', error);
    return {
      valid: false,
      conflicts: [],
      suggestions: []
    };
  }
};

/**
 * Get handyman's schedule statistics
 * @param {string} handymanId - The handyman's ID
 * @returns {Promise<Object>} Schedule statistics
 */
export const getScheduleStats = async (handymanId) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const [thisWeekBusy, nextWeekBusy, nextMonthBusy] = await Promise.all([
      getHandymanBusyDates(handymanId, now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
      getHandymanBusyDates(handymanId, nextWeek, new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000)),
      getHandymanBusyDates(handymanId, now, nextMonth)
    ]);
    
    const totalHoursThisWeek = thisWeekBusy.reduce((sum, busy) => sum + (busy.estimatedDuration || 8), 0);
    const totalHoursNextWeek = nextWeekBusy.reduce((sum, busy) => sum + (busy.estimatedDuration || 8), 0);
    
    return {
      projectsThisWeek: thisWeekBusy.length,
      projectsNextWeek: nextWeekBusy.length,
      projectsNextMonth: nextMonthBusy.length,
      hoursThisWeek: totalHoursThisWeek,
      hoursNextWeek: totalHoursNextWeek,
      averageProjectDuration: nextMonthBusy.length > 0 ? 
        nextMonthBusy.reduce((sum, busy) => sum + (busy.estimatedDuration || 4), 0) / nextMonthBusy.length : // Changed from 8 to 4
        0,
    };
  } catch (error) {
    console.error('Error getting schedule stats:', error);
    return {
      projectsThisWeek: 0,
      projectsNextWeek: 0,
      projectsNextMonth: 0,
      hoursThisWeek: 0,
      hoursNextWeek: 0,
      averageProjectDuration: 0
    };
  }
};