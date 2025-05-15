import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ForgotPasswordScreen = ({ navigation }) => {
  // State for the form
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  
  // Refs for verification code inputs
  const inputRefs = useRef([]);
  
  // Timer for resend functionality
  useEffect(() => {
    let interval;
    if (timer > 0 && currentStep === 2) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, currentStep]);
  
  // Handle email submit
  const handleEmailSubmit = () => {
    // Validate email
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to send verification code
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(2);
      setTimer(60); // Set timer for 60 seconds
      
      // Show a toast or alert that code has been sent
      Alert.alert(
        "Verification Code Sent",
        "Please check your email for the 6-digit verification code."
      );
    }, 1500);
  };
  
  // Handle verification code input
  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;
    
    // Update the code array
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);
    
    // Auto-focus to next input or submit if last input
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  // Handle backspace in verification code
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Handle verification code submit
  const handleVerifyCode = () => {
    // Check if all fields are filled
    if (verificationCode.some(digit => !digit)) {
      setErrors({ code: 'Please enter the complete verification code' });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to verify code
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, we'll accept any 6-digit code
      setCurrentStep(3);
    }, 1500);
  };
  
  // Handle resend code
  const handleResendCode = () => {
    setIsLoading(true);
    
    // Simulate API call to resend code
    setTimeout(() => {
      setIsLoading(false);
      setTimer(60); // Reset timer
      
      Alert.alert(
        "Verification Code Resent",
        "Please check your email for the new verification code."
      );
    }, 1500);
  };
  
  // Handle password reset
  const handleResetPassword = () => {
    // Validate passwords
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to reset password
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(4);
    }, 1500);
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Render step 1: Email input
  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="mail" size={40} color={Colors.primary} />
      </View>
      
      <Text style={styles.stepTitle}>Forgot Password</Text>
      <Text style={styles.stepDescription}>
        Enter your email address and we'll send you a verification code to reset your password.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            errors.email && styles.inputError
          ]}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({});
          }}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.button,
          isLoading && styles.disabledButton
        ]}
        onPress={handleEmailSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Send Verification Code</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="arrow-back" size={18} color={Colors.primary} />
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render step 2: Verification code input
  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
      </View>
      
      <Text style={styles.stepTitle}>Verification Code</Text>
      <Text style={styles.stepDescription}>
        We've sent a 6-digit verification code to {email}. Please enter it below.
      </Text>
      
      <View style={styles.codeContainer}>
        {verificationCode.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputRefs.current[index] = ref}
            style={[
              styles.codeInput,
              errors.code && !digit && styles.inputError
            ]}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>
      
      {errors.code && (
        <Text style={styles.errorText}>{errors.code}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.button,
          isLoading && styles.disabledButton
        ]}
        onPress={handleVerifyCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text style={styles.timerText}>
            Resend code in {formatTime(timer)}
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isLoading}
          >
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setCurrentStep(1)}
      >
        <Ionicons name="arrow-back" size={18} color={Colors.primary} />
        <Text style={styles.linkText}>Change Email</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render step 3: New password input
  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed" size={40} color={Colors.primary} />
      </View>
      
      <Text style={styles.stepTitle}>Create New Password</Text>
      <Text style={styles.stepDescription}>
        Set a new password for your account. Make sure it's secure and easy to remember.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>New Password</Text>
        <View style={[
          styles.passwordContainer,
          errors.newPassword && styles.inputError
        ]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) {
                const newErrors = {...errors};
                delete newErrors.newPassword;
                setErrors(newErrors);
              }
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={22} 
              color="#999" 
            />
          </TouchableOpacity>
        </View>
        {errors.newPassword && (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <TextInput
          style={[
            styles.input,
            errors.confirmPassword && styles.inputError
          ]}
          placeholder="Confirm new password"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              const newErrors = {...errors};
              delete newErrors.confirmPassword;
              setErrors(newErrors);
            }
          }}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>
      
      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementTitle}>Password Requirements:</Text>
        <View style={styles.requirementItem}>
          <Ionicons 
            name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={newPassword.length >= 8 ? "#4CAF50" : "#999"} 
          />
          <Text style={styles.requirementText}>At least 8 characters</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons 
            name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={/[A-Z]/.test(newPassword) ? "#4CAF50" : "#999"} 
          />
          <Text style={styles.requirementText}>At least one uppercase letter</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons 
            name={/[0-9]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={/[0-9]/.test(newPassword) ? "#4CAF50" : "#999"} 
          />
          <Text style={styles.requirementText}>At least one number</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.button,
          isLoading && styles.disabledButton
        ]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
  
  // Render step 4: Success
  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
      </View>
      
      <Text style={styles.stepTitle}>Password Reset Successful</Text>
      <Text style={styles.stepDescription}>
        Your password has been reset successfully. You can now login to your account with your new password.
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login Now</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render progress indicator
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressLine}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentStep - 1) / 3) * 100}%` }
          ]} 
        />
      </View>
      <View style={styles.stepsContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View 
            key={step} 
            style={[
              styles.stepDot,
              currentStep >= step && styles.activeStepDot
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.header}>
          {currentStep < 4 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>
        
        {renderProgressIndicator()}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderEmailStep()}
          {currentStep === 2 && renderVerificationStep()}
          {currentStep === 3 && renderPasswordStep()}
          {currentStep === 4 && renderSuccessStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressLine: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
  },
  activeStepDot: {
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333333',
  },
  inputError: {
    borderColor: '#E53935',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333333',
  },
  eyeIcon: {
    padding: 12,
  },
  passwordRequirements: {
    width: '100%',
    marginBottom: 24,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  resendContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#666666',
  },
  resendButton: {
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;