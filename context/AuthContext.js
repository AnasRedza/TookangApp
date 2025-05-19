import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Error restoring user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Login function - now accepts role parameter directly
  const login = async (email, password, role = 'customer') => {
    setIsLoading(true);
    
    try {
      // Simulate API call to authentication service
      // In a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create a user with the specified role
      const userData = {
        id: 'user-' + Math.floor(Math.random() * 1000),
        email,
        name: email.split('@')[0], // Extract name from email
        role: role, // Use the passed role directly
        // Add other user data
        avatar: `https://randomuser.me/api/portraits/${role === 'handyman' ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`
      };
      
      console.log('Logging in with role:', role);
      
      // Save to storage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Authentication failed. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // Register function with direct role parameter
  const register = async (name, email, password, role = 'customer') => {
    setIsLoading(true);
    
    try {
      // Simulate API call to registration service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, create a user with specified role
      const userData = {
        id: 'user-' + Math.floor(Math.random() * 1000),
        name,
        email,
        role: role,
        avatar: `https://randomuser.me/api/portraits/${role === 'handyman' ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`
      };
      
      console.log('Registering with role:', role);
      
      // Save to storage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      console.log('Registration error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      };
    }
  };

  // Values provided to consumers of this context
  const authContextValue = {
    user,
    isLoading,
    login,
    logout,
    register,
    isHandyman: user?.role === 'handyman',
    isCustomer: user?.role === 'customer',
    userRole: user?.role || 'customer',
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;