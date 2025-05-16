import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on app load
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Function to check if user is logged in
  const checkUserLoggedIn = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Error checking for user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      // Here you'd typically make an API call to your backend
      // For now, we'll simulate a successful login
      const userDetails = { id: '1', email, userType: 'customer', name: 'Test User' };
      
      // Store user details in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userDetails));
      
      // Update state
      setUser(userDetails);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove user from AsyncStorage
      await AsyncStorage.removeItem('user');
      // Update state
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // Register function
  const register = async (name, email, password, userType = 'customer') => {
    try {
      // Here you'd typically make an API call to your backend
      // For now, we'll simulate a successful registration
      const userDetails = { id: '1', name, email, userType };
      
      // Store user details in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userDetails));
      
      // Update state
      setUser(userDetails);
      return { success: true };
    } catch (error) {
      console.log('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        userType: user?.userType || 'customer' // Default to customer if not specified
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};