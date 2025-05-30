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
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import * as Location from 'expo-location';


const RegisterScreen = ({ navigation }) => {
  const { register, login } = useAuth();
  const [step, setStep] = useState(1); // Multi-step registration
  
  // Basic info (Step 1)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [phone, setPhone] = useState('');

  
  // Handyman additional info (Step 2 - only for handymen)
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [serviceCategories, setServiceCategories] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);



  useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Permission to access location was denied. Some features may be limited.'
      );
    }
  })();
}, []);

  // Location permissions useEffect (just added above)

// ADD THESE FUNCTIONS HERE:
// Get current location
const getCurrentLocation = async () => {
  try {
    setIsLoadingLocation(true);
    
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      status = (await Location.requestForegroundPermissionsAsync()).status;
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setIsLoadingLocation(false);
        return;
      }
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    const geocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    
    if (geocode.length > 0) {
      const address = geocode[0];
      const formattedAddress = formatAddress(address);
      setLocation(formattedAddress);
    } else {
      Alert.alert('Location Error', 'Could not determine your address. Please enter it manually.');
    }
  } catch (error) {
    console.error('Error getting location:', error);
    Alert.alert('Location Error', 'Could not determine your location. Please check your device settings and try again.');
  } finally {
    setIsLoadingLocation(false);
  }
};

// Format address from geocode result
const formatAddress = (address) => {
  const components = [];
  if (address.name) components.push(address.name);
  if (address.street) components.push(address.street);
  if (address.district) components.push(address.district);
  if (address.city) components.push(address.city);
  if (address.region) components.push(address.region);
  if (address.postalCode) components.push(address.postalCode);
  if (address.country) components.push(address.country);
  return components.join(', ');
};

  
  // Service categories options
  const AVAILABLE_CATEGORIES = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 
    'HVAC', 'Landscaping', 'Appliance Repair', 'Flooring', 'Roofing'
  ];
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    return nameRegex.test(name.trim());
  };

  const validatePhone = (phone) => {
    // Malaysian phone number format
    const phoneRegex = /^(\+60|60)?[1-9]\d{7,9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const handleStep1Validation = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    
    if (!validateName(trimmedName)) {
      Alert.alert('Error', 'Please enter a valid name (at least 2 characters, letters only)');
      return false;
    }
    
    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid Malaysian phone number');
      return false;
    }

    return true;
  };

  const handleStep2Validation = () => {
    if (!bio.trim()) {
      Alert.alert('Error', 'Please provide a brief bio about your services');
      return false;
    }

    if (!experience.trim()) {
      Alert.alert('Error', 'Please enter your years of experience');
      return false;
    }

    if (isNaN(experience) || parseInt(experience) < 0) {
      Alert.alert('Error', 'Please enter a valid number for years of experience');
      return false;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter your service location');
      return false;
    }

    if (serviceCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one service category');
      return false;
    }

    if (!hourlyRate.trim()) {
      Alert.alert('Error', 'Please enter your hourly rate');
      return false;
    }

    if (isNaN(hourlyRate) || parseFloat(hourlyRate) <= 0) {
      Alert.alert('Error', 'Please enter a valid hourly rate');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (handleStep1Validation()) {
      if (userType === 'customer') {
        // Skip step 2 for customers
        handleRegister();
      } else {
        setStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const toggleServiceCategory = (category) => {
    setServiceCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleRegister = async () => {
    // Validate current step
    if (step === 1 && !handleStep1Validation()) return;
    if (step === 2 && userType === 'handyman' && !handleStep2Validation()) return;

    setIsLoading(true);
    
    try {
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: userType,
      };

      // Add handyman-specific data
      if (userType === 'handyman') {
        userData.bio = bio.trim();
        userData.experience = parseInt(experience);
        userData.location = location.trim();
        userData.serviceCategories = serviceCategories;
        userData.hourlyRate = parseFloat(hourlyRate);
        userData.rating = 0; // Initial rating
        userData.reviewCount = 0;
        userData.completedJobs = 0;
        userData.isVerified = false;
        userData.availability = 'available';
        userData.profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`;
      } else {
        // Customer specific defaults
        userData.profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`;
      }

 const result = await register(userData.name, userData.email, password, userData.role, userData);

if (!result.success) {
  Alert.alert('Registration Failed', result.error || 'Please try again');
} else {
  // After successful registration, log the user in
  const loginResult = await login(userData.email, password, userData.role);
  
  if (loginResult.success) {
    Alert.alert(
      'Welcome to TooKang!',
      `Your ${userType} account has been created successfully. You're now logged in!`,
      [{ text: 'Get Started' }]
    );
  } else {
    Alert.alert(
      'Registration Successful',
      'Your account has been created. Please log in.',
      [{ 
        text: 'Go to Login', 
        onPress: () => navigation.navigate('Login')
      }]
    );
  }
}
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.formTitle}>Create Account</Text>
      
      <View style={styles.userTypeContainer}>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'customer' && styles.activeUserTypeButton
          ]}
          onPress={() => setUserType('customer')}
          disabled={isLoading}
        >
          <View style={styles.userTypeContent}>
            <Ionicons 
              name="person-outline" 
              size={20} 
              color={userType === 'customer' ? '#FFFFFF' : '#666666'} 
            />
            <Text
              style={[
                styles.userTypeText,
                userType === 'customer' && styles.activeUserTypeText
              ]}
            >
              Customer
            </Text>
          </View>
          <Text style={[
            styles.userTypeDescription,
            userType === 'customer' && styles.activeUserTypeDescription
          ]}>
            Need services
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'handyman' && styles.activeUserTypeButton
          ]}
          onPress={() => setUserType('handyman')}
          disabled={isLoading}
        >
          <View style={styles.userTypeContent}>
            <Ionicons 
              name="build-outline" 
              size={20} 
              color={userType === 'handyman' ? '#FFFFFF' : '#666666'} 
            />
            <Text
              style={[
                styles.userTypeText,
                userType === 'handyman' && styles.activeUserTypeText
              ]}
            >
              Handyman
            </Text>
          </View>
          <Text style={[
            styles.userTypeDescription,
            userType === 'handyman' && styles.activeUserTypeDescription
          ]}>
            Provide services
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
          autoCapitalize="words"
          autoCorrect={false}
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
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number (+60123456789)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCorrect={false}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password (min. 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
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
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#999" 
          />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.formTitle}>Professional Details</Text>
      <Text style={styles.stepDescription}>
        Tell us about your services to help customers find you
      </Text>
      
<View style={styles.questionContainer}>
  <View style={styles.questionLabelContainer}>
    <Text style={styles.questionLabel}>
      Service Location <Text style={styles.requiredAsterisk}>*</Text>
    </Text>
  </View>
</View><View style={styles.inputContainer}>
  <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
  <View style={styles.locationInputContainer}>
    <TextInput
      style={[styles.input, styles.locationInput]}
      placeholder="Service Location (e.g., Kuala Lumpur)"
      value={location}
      onChangeText={setLocation}
      autoCapitalize="words"
    />
    <TouchableOpacity 
      style={styles.locationButton}
      onPress={getCurrentLocation}
      disabled={isLoadingLocation}
    >
      {isLoadingLocation ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Ionicons name="navigate" size={22} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  </View>
</View>

      <View style={styles.inputContainer}>
        <Ionicons name="time-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Years of Experience"
          value={experience}
          onChangeText={setExperience}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="cash-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Hourly Rate (RM)"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Service Categories</Text>
        <Text style={styles.sectionSubtitle}>Select the services you provide</Text>
        <View style={styles.categoriesContainer}>
          {AVAILABLE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                serviceCategories.includes(category) && styles.selectedCategoryChip
              ]}
              onPress={() => toggleServiceCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                serviceCategories.includes(category) && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief bio about your services and expertise..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/tookang-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Progress indicator */}
        {userType === 'handyman' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
            </View>
            <Text style={styles.progressText}>Step {step} of 2</Text>
          </View>
        )}
        
        <View style={styles.formContainer}>
          {step === 1 ? renderStep1() : renderStep2()}
          
          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onPress={step === 1 ? handleNextStep : handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.loadingText}>
                  {step === 2 ? 'Creating account...' : 'Validating...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>
                {step === 1 ? (userType === 'customer' ? 'Create Account' : 'Next') : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {step === 2 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handlePrevStep}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
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
  logo: {
    height: 100,
    width: 100,
  },
  progressContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  userTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 20,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeUserTypeButton: {
    backgroundColor: Colors.primary,
  },
  userTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userTypeText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
    marginLeft: 6,
  },
  activeUserTypeText: {
    color: '#FFFFFF',
  },
  userTypeDescription: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  activeUserTypeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  eyeIcon: {
    padding: 5,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  registerButtonText: {
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
  backButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
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

  locationInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
locationInput: {
  flex: 1,
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
},
locationButton: {
  backgroundColor: Colors.primary,
  height: 40,
  width: 40,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: -1,
},
});

export default RegisterScreen;