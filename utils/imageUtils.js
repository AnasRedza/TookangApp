// utils/imageUtils.js

/**
 * Get a safe image URI, falling back to generated avatar if necessary
 * @param {string} imageUri - The original image URI
 * @param {string} name - Name to use for generated avatar
 * @param {string} fallbackType - Type of fallback ('user', 'handyman', 'customer')
 * @returns {string} - Safe image URI
 */
export const getSafeImageUri = (imageUri, name = 'User', fallbackType = 'user') => {
  // Check if imageUri is valid
  if (imageUri && typeof imageUri === 'string' && imageUri.trim().length > 0) {
    return imageUri;
  }
  
  // Generate fallback avatar
  const encodedName = encodeURIComponent(name || 'User');
  const backgroundColors = {
    user: '6c757d',
    handyman: '007bff', 
    customer: '28a745'
  };
  
  const backgroundColor = backgroundColors[fallbackType] || backgroundColors.user;
  
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${backgroundColor}&color=fff&size=128`;
};

/**
 * Get avatar URI for a user
 * @param {object} user - User object
 * @returns {string} - Avatar URI
 */
export const getUserAvatarUri = (user) => {
  if (!user) return getSafeImageUri('', 'User');
  
  const fallbackType = user.role === 'handyman' ? 'handyman' : 'customer';
  return getSafeImageUri(user.profilePicture, user.name, fallbackType);
};

/**
 * Validate if an image URI is valid
 * @param {string} uri - Image URI to validate
 * @returns {boolean} - Whether the URI is valid
 */
export const isValidImageUri = (uri) => {
  return uri && typeof uri === 'string' && uri.trim().length > 0;
};