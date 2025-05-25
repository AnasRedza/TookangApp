import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to get user data from Firestore
          const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
          
          let userData;
          if (userDoc.exists) {
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              ...userDoc.data()
            };
          } else {
            // If no user document exists, sign out the user
            await auth.signOut();
            setUser(null);
            await AsyncStorage.removeItem('user');
            setIsLoading(false);
            return;
          }
          
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If there's an error fetching user data, sign out
          await auth.signOut();
          setUser(null);
          await AsyncStorage.removeItem('user');
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, selectedRole) => {
    try {
      // First, authenticate with Firebase
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore to check their actual role
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      
      if (!userDoc.exists) {
        // No user document found - this shouldn't happen for registered users
        await auth.signOut();
        return { 
          success: false, 
          error: 'User profile not found. Please contact support.' 
        };
      }
      
      const userData = userDoc.data();
      
      // Check if the selected role matches the user's actual role
      if (userData.role !== selectedRole) {
        await auth.signOut();
        
        // Provide specific error message based on the mismatch
        const userRoleDisplay = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
        const selectedRoleDisplay = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
        
        return { 
          success: false, 
          error: `This account is registered as a ${userRoleDisplay}, but you selected ${selectedRoleDisplay}. Please select the correct account type.` 
        };
      }
      
      // If everything is valid, the auth state change will handle setting the user
      return { success: true };
      
    } catch (error) {
      let errorMessage = 'Authentication failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    try {
      // Check if a user with this email and role combination already exists
      const existingUsersQuery = await db.collection('users')
        .where('email', '==', email.toLowerCase())
        .get();
      
      if (!existingUsersQuery.empty) {
        const existingUser = existingUsersQuery.docs[0].data();
        return { 
          success: false, 
          error: `An account with this email already exists as a ${existingUser.role.charAt(0).toUpperCase() + existingUser.role.slice(1)}.` 
        };
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile
      await firebaseUser.updateProfile({
        displayName: name
      });
      
      // Create user document in Firestore
      const userData = {
        name: name.trim(),
        email: firebaseUser.email.toLowerCase(),
        role: role,
        createdAt: new Date().toISOString(),
        isActive: true,
        profileComplete: false
      };
      
      await db.collection('users').doc(firebaseUser.uid).set(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password (minimum 6 characters).';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await auth.sendPasswordResetEmail(email);
      return { 
        success: true, 
        message: 'Password reset email sent. Please check your inbox.' 
      };
    } catch (error) {
      let errorMessage = 'Failed to send password reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      return { success: false, error: errorMessage };
    }
  };

  // Helper function to update user profile
  const updateUserProfile = async (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      await db.collection('users').doc(user.id).update({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Update local user state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const authContextValue = {
    user,
    isLoading,
    login,
    logout,
    register,
    forgotPassword,
    updateUserProfile,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;