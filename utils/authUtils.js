import { db } from '../firebase';

/**
 * Utility functions for authentication and role management
 */

/**
 * Check if a user exists with the given email and role
 * @param {string} email - User's email address
 * @param {string} role - Expected role ('customer' or 'handyman')
 * @returns {Promise<{exists: boolean, userData?: object, error?: string}>}
 */
export const checkUserExistsWithRole = async (email, role) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Query Firestore for users with this email
    const usersQuery = await db.collection('users')
      .where('email', '==', normalizedEmail)
      .get();
    
    if (usersQuery.empty) {
      return {
        exists: false,
        error: 'No account found with this email address.'
      };
    }
    
    // Check if any user has the specified role
    const userWithRole = usersQuery.docs.find(doc => {
      const userData = doc.data();
      return userData.role === role;
    });
    
    if (!userWithRole) {
      const existingUser = usersQuery.docs[0].data();
      const existingRoleDisplay = existingUser.role.charAt(0).toUpperCase() + existingUser.role.slice(1);
      const requestedRoleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
      
      return {
        exists: false,
        error: `This email is registered as a ${existingRoleDisplay}, not a ${requestedRoleDisplay}. Please select the correct account type.`
      };
    }
    
    return {
      exists: true,
      userData: {
        id: userWithRole.id,
        ...userWithRole.data()
      }
    };
    
  } catch (error) {
    console.error('Error checking user existence:', error);
    return {
      exists: false,
      error: 'Unable to verify account. Please try again.'
    };
  }
};

/**
 * Validate user role and return appropriate home screen
 * @param {string} role - User's role
 * @returns {string} - Screen name to navigate to
 */
export const getHomeScreenForRole = (role) => {
  switch (role) {
    case 'handyman':
      return 'HandymanHome';
    case 'customer':
    default:
      return 'Home';
  }
};

/**
 * Get role-specific navigation options
 * @param {string} role - User's role
 * @returns {object} - Navigation options
 */
export const getRoleNavigationOptions = (role) => {
  const isHandyman = role === 'handyman';
  
  return {
    homeTabTitle: isHandyman ? 'Available Jobs' : 'Home',
    projectsTabTitle: isHandyman ? 'My Jobs' : 'My Projects',
    homeScreenTitle: isHandyman ? 'Available Jobs' : 'Home',
    projectsScreenTitle: isHandyman ? 'My Jobs' : 'My Projects',
    showEarnings: isHandyman,
    showPaymentMethods: !isHandyman,
    showTransactionHistory: true,
  };
};

/**
 * Validate if user can access a specific screen based on their role
 * @param {string} screenName - Name of the screen
 * @param {string} userRole - User's role
 * @returns {boolean} - Whether user can access the screen
 */
export const canAccessScreen = (screenName, userRole) => {
  const handymanOnlyScreens = [
    'HandymanHome',
    'EarningsDrawer'
  ];
  
  const customerOnlyScreens = [
    'PaymentMethodsDrawer'
  ];
  
  if (handymanOnlyScreens.includes(screenName)) {
    return userRole === 'handyman';
  }
  
  if (customerOnlyScreens.includes(screenName)) {
    return userRole === 'customer';
  }
  
  // All other screens are accessible to both roles
  return true;
};

/**
 * Get user display information
 * @param {object} user - User object
 * @returns {object} - Display information
 */
export const getUserDisplayInfo = (user) => {
  if (!user) return null;
  
  const roleDisplay = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email ? user.email[0].toUpperCase() : 'U';
  
  return {
    name: user.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: user.role || 'customer',
    roleDisplay,
    initials,
    isHandyman: user.role === 'handyman',
    isCustomer: user.role === 'customer'
  };
};

/**
 * Format error messages for better user experience
 * @param {string} errorCode - Firebase error code
 * @param {string} defaultMessage - Default error message
 * @returns {string} - Formatted error message
 */
export const formatAuthError = (errorCode, defaultMessage = 'An error occurred') => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.'
  };
  
  return errorMessages[errorCode] || defaultMessage;
};