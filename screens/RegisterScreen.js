import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  // User type selection
  const [userType, setUserType] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    profileImage: null,
    // Handyman specific fields
    skills: [],
    experience: '',
    hourlyRate: '',
    description: ''
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const scrollViewRef = useRef();
  const { register } = useAuth();
  
  // Available skills for handymen
  const availableSkills = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 
    'Cleaning', 'Landscaping', 'Flooring', 'HVAC', 
    'Roofing', 'Appliance Repair', 'General Maintenance'
  ];
  
  // Handle input changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };
  
  // Toggle skill selection
  const toggleSkill = (skill) => {
    if (formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter(s => s !== skill)
      });
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      });
    }
    
    // Clear skill error if any skill is selected
    if (errors.skills) {
      setErrors({
        ...errors,
        skills: null
      });
    }
  };
  
  // Pick image from library
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setFormData({
        ...formData,
        profileImage: result.assets[0].uri
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Common validation for both user types
    if (!formData.fullName) newErrors.fullName = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,12}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms & Conditions';
    }
    
    // Handyman specific validation (only if on appropriate step and user type)
    if (userType === 'handyman' && currentStep === 2) {
      if (formData.skills.length === 0) {
        newErrors.skills = 'Please select at least one skill';
      }
      
      if (!formData.experience) {
        newErrors.experience = 'Experience is required';
      }
      
      if (!formData.hourlyRate) {
        newErrors.hourlyRate = 'Hourly rate is required';
      } else if (isNaN(formData.hourlyRate) || parseFloat(formData.hourlyRate) <= 0) {
        newErrors.hourlyRate = 'Please enter a valid rate';
      }
      
      if (!formData.description || formData.description.length < 20) {
        newErrors.description = 'Please provide a description (min 20 characters)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateForm()) {
      if (userType === 'handyman' && currentStep === 1) {
        setCurrentStep(2);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      } else {
        handleSubmit();
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // In a real app, you would call your API here
        // For now, simulating API call with setTimeout
        setTimeout(() => {
          register(formData, userType);
          navigation.navigate('Login');
          Alert.alert(
            "Registration Successful",
            `You have successfully registered as a ${userType}. Please log in to continue.`
          );
        }, 1500);
      } catch (error) {
        Alert.alert(
          "Registration Failed",
          "There was an error during registration. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Render user type selection
  if (!userType) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <Text style={styles.headerSubtitle}>Choose how you want to use TooKang</Text>
        </View>
        
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={styles.userTypeCard}
            onPress={() => setUserType('customer')}
          >
            <View style={styles.userTypeIconContainer}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.userTypeTitle}>Customer</Text>
            <Text style={styles.userTypeDescription}>
              I need to hire handymen for tasks and projects
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.userTypeCard}
            onPress={() => setUserType('handyman')}
          >
            <View style={styles.userTypeIconContainer}>
              <Ionicons name="construct" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.userTypeTitle}>Handyman</Text>
            <Text style={styles.userTypeDescription}>
              I provide services and want to find clients
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render registration form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (currentStep > 1) {
                  setCurrentStep(1);
                } else {
                  setUserType(null);
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Sign Up as {userType === 'customer' ? 'Customer' : 'Handyman'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentStep > 1 ? 'Step 2: Professional Details' : 'Step 1: Basic Information'}
            </Text>
          </View>
          
          {/* Step progress indicator (for handyman registration) */}
          {userType === 'handyman' && (
            <View style={styles.stepIndicator}>
              <View style={styles.stepLine}>
                <View 
                  style={[
                    styles.stepLineProgress, 
                    { width: currentStep === 1 ? '50%' : '100%' }
                  ]} 
                />
              </View>
              <View style={styles.stepsContainer}>
                <View style={styles.step}>
                  <View style={[styles.stepCircle, styles.activeStep]}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Basic Info</Text>
                </View>
                <View style={styles.step}>
                  <View style={[
                    styles.stepCircle, 
                    currentStep >= 2 && styles.activeStep
                  ]}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Professional</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <View style={styles.formContainer}>
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <TouchableOpacity 
                  style={styles.profileImagePicker}
                  onPress={pickImage}
                >
                  {formData.profileImage ? (
                    <Image 
                      source={{ uri: formData.profileImage }} 
                      style={styles.profileImage} 
                    />
                  ) : (
                    <>
                      <Ionicons name="camera" size={30} color="#999" />
                      <Text style={styles.profileImageText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Form Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.fullName && styles.inputError
                  ]}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(text) => handleChange('fullName', text)}
                />
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.email && styles.inputError
                  ]}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text.trim())}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.phone && styles.inputError
                  ]}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your address (optional)"
                  value={formData.address}
                  onChangeText={(text) => handleChange('address', text)}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.passwordContainer,
                  errors.password && styles.inputError
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmPassword && styles.inputError
                  ]}
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
              
              {/* Terms & Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  {agreeToTerms ? (
                    <Ionicons name="checkbox" size={24} color={Colors.primary} />
                  ) : (
                    <Ionicons name="square-outline" size={24} color="#999" />
                  )}
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                  {errors.terms && (
                    <Text style={styles.errorText}>{errors.terms}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
          
          {/* Step 2: Professional Information (for handymen only) */}
          {currentStep === 2 && userType === 'handyman' && (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Skills</Text>
                <Text style={styles.inputSubLabel}>Select all that apply</Text>
                <View style={styles.skillsContainer}>
                  {availableSkills.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillChip,
                        formData.skills.includes(skill) && styles.selectedSkillChip
                      ]}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Text style={[
                        styles.skillChipText,
                        formData.skills.includes(skill) && styles.selectedSkillChipText
                      ]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.skills && (
                  <Text style={styles.errorText}>{errors.skills}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Years of Experience</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.experience && styles.inputError
                  ]}
                  placeholder="How many years of experience do you have?"
                  keyboardType="number-pad"
                  value={formData.experience}
                  onChangeText={(text) => handleChange('experience', text)}
                />
                {errors.experience && (
                  <Text style={styles.errorText}>{errors.experience}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hourly Rate (RM)</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.hourlyRate && styles.inputError
                  ]}
                  placeholder="Your hourly rate"
                  keyboardType="decimal-pad"
                  value={formData.hourlyRate}
                  onChangeText={(text) => handleChange('hourlyRate', text)}
                />
                {errors.hourlyRate && (
                  <Text style={styles.errorText}>{errors.hourlyRate}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>About Your Services</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    errors.description && styles.inputError
                  ]}
                  placeholder="Describe your skills, experience, and the services you offer..."
                  multiline
                  numberOfLines={4}
                  value={formData.description}
                  onChangeText={(text) => handleChange('description', text)}
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>
              
              <View style={styles.noticeContainer}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.noticeText}>
                  You'll need to verify your identity during the onboarding process after registration.
                </Text>
              </View>
            </View>
          )}
          
          {/* Bottom spacing for button */}
          <View style={{ height: 100 }} />
        </ScrollView>
        
        {/* Submit Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNextStep}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {userType === 'handyman' && currentStep === 1 
                  ? 'Next' 
                  : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
          
          {currentStep === 1 && (
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  userTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: width * 0.42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  userTypeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  userTypeDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  stepIndicator: {
    marginBottom: 24,
  },
  stepLine: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    marginBottom: 8,
  },
  stepLineProgress: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    width: '50%',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeStep: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 12,
    color: '#666666',
  },
  formContainer: {
    marginBottom: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImageText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 13,
    color: '#666666',
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
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  checkbox: {
    marginRight: 10,
    marginTop: -2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#F1F1F1',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedSkillChip: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderColor: Colors.primary,
  },
  skillChipText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedSkillChipText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  noticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#333333',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;