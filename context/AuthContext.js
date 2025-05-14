import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' or 'handyman'

  // Check if user is logged in on app start
  useEffect(() => {
    // Load user data from AsyncStorage
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const type = await AsyncStorage.getItem('userType');
        
        // Set state based on stored values
        setUserToken(token);
        setUserType(type);
      } catch (e) {
        console.log('Failed to load user data', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (type, token = 'dummy-token') => {
    try {
      // Save user data to AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userType', type);
      
      // Update state
      setUserToken(token);
      setUserType(type);
    } catch (e) {
      console.log('Login error', e);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userType');
      
      // Reset state
      setUserToken(null);
      setUserType(null);
    } catch (e) {
      console.log('Logout error', e);
    }
  };

  // Context value
  const authContext = {
    isLoading,
    userToken,
    userType,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;