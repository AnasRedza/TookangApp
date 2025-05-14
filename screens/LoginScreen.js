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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer'); // Default to customer
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Get login function from Auth Context
  const { login } = useAuth();

  const handleAuth = () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // Additional validation for registration
    if (!isLogin && (!name || !phone)) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // Simple validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    // Mock authentication - in a real app, this would connect to a backend
    if (isLogin) {
      console.log('Logging in as', userType, 'with email:', email);
      
      // Call the login function from Auth Context
      login(userType);
    } else {
      console.log('Registering as', userType, 'with details:', { name, email, phone });
      
      // For registration, also call login after successful registration
      login(userType);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')} // Add your logo to assets folder
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>TooKang</Text>
          <Text style={styles.tagline}>Your Home Service Solution</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                isLogin ? styles.activeTab : styles.inactiveTab,
              ]}
              onPress={() => setIsLogin(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  isLogin ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                !isLogin ? styles.activeTab : styles.inactiveTab,
              ]}
              onPress={() => setIsLogin(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  !isLogin ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.roleSelector}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  userType === 'customer' && styles.toggleActive,
                ]}
                onPress={() => setUserType('customer')}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color={userType === 'customer' ? Colors.white : Colors.primary}
                  style={styles.roleIcon}
                />
                <Text
                  style={
                    userType === 'customer'
                      ? styles.toggleActiveText
                      : styles.toggleInactiveText
                  }
                >
                  Customer
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  userType === 'handyman' && styles.toggleActive,
                ]}
                onPress={() => setUserType('handyman')}
              >
                <Ionicons
                  name="hammer"
                  size={16}
                  color={userType === 'handyman' ? Colors.white : Colors.primary}
                  style={styles.roleIcon}
                />
                <Text
                  style={
                    userType === 'handyman'
                      ? styles.toggleActiveText
                      : styles.toggleInactiveText
                  }
                >
                  Handyman
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Registration fields */}
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.darkGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.darkGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={Colors.darkGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.darkGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.darkGray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>
              {isLogin ? 'Login' : 'Register'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  formContainer: {
    paddingHorizontal: 25,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  inactiveTab: {
    backgroundColor: Colors.lightGray,
  },
  tabText: {
    fontWeight: 'bold',
  },
  activeTabText: {
    color: Colors.white,
  },
  inactiveTabText: {
    color: Colors.darkGray,
  },
  roleSelector: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleActiveText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  toggleInactiveText: {
    color: Colors.text,
  },
  roleIcon: {
    marginRight: 8,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.text,
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  authButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  authButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.mediumGray,
  },
  dividerText: {
    color: Colors.darkGray,
    paddingHorizontal: 10,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 25,
    marginHorizontal: 10,
  },
});

export default LoginScreen;