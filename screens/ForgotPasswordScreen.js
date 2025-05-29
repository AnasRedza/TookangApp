// Enhanced ForgotPasswordScreen.js - Improved Implementation
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';
import Colors from '../constants/Colors';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Pre-fill email if passed from LoginScreen
  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await auth.sendPasswordResetEmail(trimmedEmail);
      
      setEmailSent(true);
      setCountdown(60); // 60 second cooldown for resend
      
      Alert.alert(
        'Email Sent',
        `We've sent password reset instructions to ${trimmedEmail}. Please check your email inbox and follow the instructions to reset your password.`,
        [
          {
            text: 'OK',
            // Don't automatically navigate back - let user choose
          }
        ]
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check your email or create a new account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please enter a valid email.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many password reset attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    
    if (countdown > 0) return;
    await handleForgotPassword();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/tookang_logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Ionicons name="mail-outline" size={60} color={Colors.primary} />
            <Text style={styles.formTitle}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              {emailSent 
                ? "We've sent password reset instructions to your email"
                : "Enter your email address and we'll send you instructions to reset your password"
              }
            </Text>
          </View>
          
          {!emailSent && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.resetButton, isLoading && styles.disabledButton]}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.loadingText}>Sending...</Text>
                  </View>
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {emailSent && (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
              </View>
              
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                Check your email inbox and follow the instructions to reset your password.
              </Text>
              
              <View style={styles.emailInfo}>
                <Text style={styles.emailSentTo}>Email sent to:</Text>
                <Text style={styles.emailAddress}>{email}</Text>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.resendButton,
                  countdown > 0 && styles.disabledButton
                ]}
                onPress={handleResendEmail}
                disabled={isLoading || countdown > 0}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={[
                    styles.resendButtonText,
                    countdown > 0 && styles.disabledButtonText
                  ]}>
                    {countdown > 0 
                      ? `Resend in ${countdown}s` 
                      : "Didn't receive the email? Resend"
                    }
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>Email not arriving?</Text>
                <Text style={styles.helpText}>
                  • Check your spam/junk folder{'\n'}
                  • Make sure you entered the correct email{'\n'}
                  • Try adding noreply@tookang.com to your contacts
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.primary} style={styles.backIcon} />
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          {emailSent && (
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.continueButtonText}>Continue to Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logo: {
    height: 100,
    width: 100,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333333',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emailInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  emailSentTo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#CCCCCC',
    textDecorationLine: 'none',
  },
  helpSection: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#666666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    marginBottom: 12,
  },
  backIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;