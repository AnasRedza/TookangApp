import React, { useState } from 'react';
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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer'); // 'customer' or 'handyman'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register(name, email, password, userType);
      
      if (!result.success) {
        Alert.alert('Registration Failed', result.error || 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Ionicons name="construct" size={60} color={Colors.primary} />
          <Text style={styles.logoText}>TooKang</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>
          
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'customer' && styles.activeUserTypeButton
              ]}
              onPress={() => setUserType('customer')}
            >
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'customer' && styles.activeUserTypeText
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'handyman' && styles.activeUserTypeButton
              ]}
              onPress={() => setUserType('handyman')}
            >
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'handyman' && styles.activeUserTypeText
                ]}
              >
                Handyman
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
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
    marginTop: 40,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 10,
  },
  // Continuing RegisterScreen.js styles
  formContainer: {
    paddingHorizontal: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  userTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeUserTypeButton: {
    backgroundColor: Colors.primary,
  },
  userTypeText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  activeUserTypeText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  eyeIcon: {
    padding: 5,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  loginButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
});

export default RegisterScreen;