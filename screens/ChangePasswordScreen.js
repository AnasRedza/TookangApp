// Enhanced ChangePasswordScreen.js - Real Firebase Implementation
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';
import firebase from 'firebase/compat/app';
import Colors from '../constants/Colors';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validate password strength
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    };
  };

  // Re-authenticate user with current password
  const reauthenticateUser = async (currentPassword) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    return await user.reauthenticateWithCredential(credential);
  };

  const handleChangePassword = async () => {
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      let errorMessage = 'Password must meet the following requirements:\n';
      if (!passwordValidation.minLength) errorMessage += '• At least 8 characters\n';
      if (!passwordValidation.hasUpperCase) errorMessage += '• At least one uppercase letter\n';
      if (!passwordValidation.hasLowerCase) errorMessage += '• At least one lowercase letter\n';
      if (!passwordValidation.hasNumber) errorMessage += '• At least one number\n';
      
      Alert.alert('Weak Password', errorMessage.trim());
      return;
    }

    setIsLoading(true);
    
    try {
      // Step 1: Re-authenticate user with current password
      await reauthenticateUser(currentPassword);
      
      // Step 2: Update password
      const user = auth.currentUser;
      await user.updatePassword(newPassword);
      
      setIsLoading(false);
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully. For security reasons, you will be signed out.',
        [
          { 
            text: 'OK', 
            onPress: async () => {
              try {
                await auth.signOut();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }],
                });
              } catch (signOutError) {
                console.error('Error signing out:', signOutError);
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security reasons, please sign out and sign back in before changing your password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const getPasswordStrengthColor = (password) => {
    const validation = validatePassword(password);
    if (!password) return '#CCCCCC';
    if (validation.isValid) return '#4CAF50';
    if (validation.minLength && (validation.hasUpperCase || validation.hasLowerCase || validation.hasNumber)) return '#FF9800';
    return '#F44336';
  };

  const getPasswordStrengthText = (password) => {
    if (!password) return 'Enter password';
    const validation = validatePassword(password);
    if (validation.isValid) return 'Strong password';
    if (validation.minLength && (validation.hasUpperCase || validation.hasLowerCase || validation.hasNumber)) return 'Medium strength';
    return 'Weak password';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.description}>
        Create a new password that is at least 8 characters long and includes a mix of letters, numbers, and symbols.
      </Text>

      {/* Current Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            style={styles.input}
            placeholder="Enter current password"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
            <Ionicons
              name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* New Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>New Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons
              name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        
        {/* Password Strength Indicator */}
        {newPassword.length > 0 && (
          <View style={styles.strengthContainer}>
            <View 
              style={[
                styles.strengthBar, 
                { backgroundColor: getPasswordStrengthColor(newPassword) }
              ]} 
            />
            <Text 
              style={[
                styles.strengthText, 
                { color: getPasswordStrengthColor(newPassword) }
              ]}
            >
              {getPasswordStrengthText(newPassword)}
            </Text>
          </View>
        )}
      </View>

      {/* Confirm New Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        
        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && (
          <View style={styles.matchContainer}>
            <Ionicons 
              name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={newPassword === confirmPassword ? '#4CAF50' : '#F44336'} 
            />
            <Text 
              style={[
                styles.matchText,
                { color: newPassword === confirmPassword ? '#4CAF50' : '#F44336' }
              ]}
            >
              {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
            </Text>
          </View>
        )}
      </View>

      {/* Change Password Button */}
      <TouchableOpacity
        style={[styles.changeButton, isLoading && styles.disabledButton]}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.changeButtonText}>Changing Password...</Text>
          </View>
        ) : (
          <Text style={styles.changeButtonText}>Change Password</Text>
        )}
      </TouchableOpacity>

      {/* Password Requirements */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
        
        {newPassword.length > 0 && (
          <View style={styles.requirementsList}>
            <RequirementItem 
              text="At least 8 characters" 
              met={validatePassword(newPassword).minLength} 
            />
            <RequirementItem 
              text="At least one uppercase letter" 
              met={validatePassword(newPassword).hasUpperCase} 
            />
            <RequirementItem 
              text="At least one lowercase letter" 
              met={validatePassword(newPassword).hasLowerCase} 
            />
            <RequirementItem 
              text="At least one number" 
              met={validatePassword(newPassword).hasNumber} 
            />
            <RequirementItem 
              text="At least one special character (recommended)" 
              met={validatePassword(newPassword).hasSpecialChar}
              optional={true}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Helper component for requirement items
const RequirementItem = ({ text, met, optional = false }) => (
  <View style={styles.requirementItem}>
    <Ionicons 
      name={met ? 'checkmark-circle' : 'ellipse-outline'} 
      size={16} 
      color={met ? '#4CAF50' : (optional ? '#FFC107' : '#CCCCCC')} 
    />
    <Text style={[
      styles.requirementText,
      { color: met ? '#4CAF50' : (optional ? '#FFC107' : '#666') }
    ]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  changeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  requirementsContainer: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
});

export default ChangePasswordScreen;