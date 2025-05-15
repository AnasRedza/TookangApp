// ChangePasswordScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = () => {
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.description}>
        Create a new password that is at least 8 characters long and include a mix of letters, numbers, and symbols.
      </Text>

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
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons
              name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

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
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.changeButton, isLoading && styles.disabledButton]}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        <Text style={styles.changeButtonText}>
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.passwordTips}>
        For a strong password:
        {'\n'}• Use at least 8 characters
        {'\n'}• Include upper and lowercase letters
        {'\n'}• Include at least one number
        {'\n'}• Include at least one special character (e.g., !@#$%)
      </Text>
    </ScrollView>
  );
};

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
  },
  disabledButton: {
    opacity: 0.7,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordTips: {
    fontSize: 13,
    color: '#777',
    marginTop: 24,
    lineHeight: 20,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 16,
    borderRadius: 8,
  },
});

export default ChangePasswordScreen;