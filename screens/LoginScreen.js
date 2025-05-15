import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const LoginScreen = () => {
  // Authentication state
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('customer');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get login function from Auth Context
  const { login } = useAuth();

  const handleAuth = () => {
    // Form validation
    if (!email || !password) {
      // Would show error message here
      return;
    }
    
    if (!isLogin && (!name || !phone)) {
      // Would show error message here
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      login(userType);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>TooKang</Text>
          </View>
          
          {/* Auth Mode Tabs (Login/Register) */}
          <View style={styles.authSwitcher}>
            <TouchableOpacity 
              style={[styles.authTab, isLogin && styles.activeAuthTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.authTabText, isLogin && styles.activeAuthTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.authTab, !isLogin && styles.activeAuthTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.authTabText, !isLogin && styles.activeAuthTabText]}>Register</Text>
            </TouchableOpacity>
          </View>
          
          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity 
              style={[styles.userTypeButton, userType === 'customer' && styles.activeUserType]} 
              onPress={() => setUserType('customer')}
            >
              <Ionicons 
                name="person-outline" 
                size={18} 
                color={userType === 'customer' ? Colors.primary : '#777'} 
              />
              <Text style={[
                styles.userTypeText, 
                userType === 'customer' && styles.activeUserTypeText
              ]}>
                Customer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.userTypeButton, userType === 'handyman' && styles.activeUserType]} 
              onPress={() => setUserType('handyman')}
            >
              <Ionicons 
                name="hammer-outline" 
                size={18} 
                color={userType === 'handyman' ? Colors.primary : '#777'} 
              />
              <Text style={[
                styles.userTypeText, 
                userType === 'handyman' && styles.activeUserTypeText
              ]}>
                Handyman
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name field - only for registration */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#999" />
                  <TextInput 
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}
            
            {/* Email field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#999" />
                <TextInput 
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            {/* Phone field - only for registration */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#999" />
                  <TextInput 
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}
            
            {/* Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" />
                <TextInput 
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Forgot password - only for login */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordLink}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
            
            {/* Login/Register Button */}
            <TouchableOpacity 
              style={[styles.authButton, isLoading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={styles.authButtonText}>
                {isLogin ? 'Login' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            
            {/* Social Login Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or continue with</Text>
              <View style={styles.separatorLine} />
            </View>
            
            {/* Social Login Options */}
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color="#555" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  authSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeAuthTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  authTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#888',
  },
  activeAuthTabText: {
    color: '#333',
    fontWeight: '600',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  userTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  activeUserType: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  userTypeText: {
    fontSize: 15,
    marginLeft: 8,
    color: '#777',
  },
  activeUserTypeText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  authButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  separatorText: {
    color: '#999',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
  }
});

export default LoginScreen;