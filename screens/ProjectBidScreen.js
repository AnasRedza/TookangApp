import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  ProgressBarAndroid,
  ProgressViewIOS
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

// Custom color theme as provided
const Colors = {
  primary: '#333333',    // Dark charcoal
  secondary: '#FFD100',  // Bright yellow
  accent: '#4D4D4D',     // Medium gray for accents
  
  // Status colors
  success: '#27AE60',    // Green
  warning: '#F2C94C',    // Yellow
  error: '#EB5757',      // Red
  info: '#2D9CDB',       // Blue
  
  // Text colors
  textDark: '#222222',   // Slightly darker for main text
  textMedium: '#666666', // Medium gray for secondary text
  textLight: '#999999',  // Light gray for tertiary text
  
  // Background colors
  background: '#F8F8F8', // Light gray background
  card: '#FFFFFF',       // White for cards
  
  // Border colors
  border: '#DDDDDD',     // Light gray for borders
  
  // Other UI colors
  inactive: '#E0E0E0',   // Very light gray for inactive elements
  highlight: '#FFF9DD',  // Soft yellow highlight
};

const { width, height } = Dimensions.get('window');

const ProjectBidScreen = ({ route, navigation }) => {
  const { handyman } = route.params || {};
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Form sections for progress tracking
  const SECTIONS = [
    { id: 'basic', title: 'Basic Information' }, 
    { id: 'details', title: 'Project Details' },
    { id: 'budget', title: 'Budget' },
    { id: 'schedule', title: 'Schedule' },
    { id: 'additional', title: 'Additional Information' }
  ];
  
  // Categories with icons
  const CATEGORIES = [
    { id: 'plumber', name: 'Plumber', icon: 'water' },
    { id: 'electrician', name: 'Electrician', icon: 'flash' },
    { id: 'painter', name: 'Painter', icon: 'color-palette' },
    { id: 'cleaner', name: 'Cleaner', icon: 'sparkles' },
    { id: 'others', name: 'Others', icon: 'ellipsis-horizontal' }
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    images: [],
    isNegotiable: true,
    preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    preferredTime: new Date(new Date().setHours(12, 0, 0, 0)), // Default 12:00 PM
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('hours'); // 'hours' or 'minutes'
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const successScale = useRef(new Animated.Value(0)).current;
  
  // Time slots in 30-min increments
  const TIME_SLOTS = Array.from({ length: 24 * 2 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const time = new Date();
    time.setHours(hour, minute, 0, 0);
    return time;
  });
  
  // Update progress when form fields change
  useEffect(() => {
    calculateProgress();
  }, [formData]);
  
  // Calculate form completion progress
  const calculateProgress = () => {
    let filled = 0;
    let total = 5; // Required fields: title, description, category, location, budget
    
    if (formData.title) filled++;
    if (formData.description) filled++;
    if (formData.category) filled++;
    if (formData.location) filled++;
    if (formData.budget) filled++;
    
    setFormProgress(filled / total);
  };
  
  // Request location permissions
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
  
  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'We need camera roll permissions to upload project images.'
          );
        }
      }
    })();
  }, []);
  
  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Check if permissions are granted
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        status = (await Location.requestForegroundPermissionsAsync()).status;
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to use this feature.'
          );
          setIsLoadingLocation(false);
          return;
        }
      }
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (geocode.length > 0) {
        const address = geocode[0];
        const formattedAddress = formatAddress(address);
        handleChange('location', formattedAddress);
      } else {
        Alert.alert(
          'Location Error',
          'Could not determine your address. Please enter it manually.'
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not determine your location. Please check your device settings and try again.'
      );
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
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field when user types
    if (errors[field]) {
      const newErrors = {...errors};
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    handleChange('category', category);
  };
  
  // Open date picker
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };
  
  // Open time picker
  const showTimePickerModal = () => {
    setTimePickerMode('hours');
    setShowTimePicker(true);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (time) => {
    handleChange('preferredTime', time);
    setShowTimePicker(false);
  };
  
  // Handle date change
  const handleDateChange = (event, selectedValue) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedValue) {
      // Keep the time from the current preferredTime
      const currentTime = formData.preferredTime;
      const newDate = new Date(selectedValue);
      newDate.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        0,
        0
      );
      handleChange('preferredDate', newDate);
    }
  };
  
  // Select specific date
  const selectDate = (date) => {
    handleChange('preferredDate', date);
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };
  
  // Set hour and switch to minute selection
  const selectHour = (hour) => {
    const newTime = new Date(formData.preferredTime);
    const isPm = newTime.getHours() >= 12;
    // Set the hour, preserving AM/PM
    newTime.setHours(
      hour === 12 ? (isPm ? 12 : 0) : (isPm ? hour + 12 : hour),
      newTime.getMinutes()
    );
    handleChange('preferredTime', newTime);
    // Switch to minute selection
    setTimePickerMode('minutes');
  };
  
  // Set minute and close time picker
  const selectMinute = (minute) => {
    const newTime = new Date(formData.preferredTime);
    newTime.setMinutes(minute);
    handleChange('preferredTime', newTime);
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle image picking
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('images', [...formData.images, result.assets[0].uri]);
    }
  };
  
  // Handle removing an image
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    handleChange('images', newImages);
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Required';
    }
    
    if (!formData.budget) {
      newErrors.budget = 'Required';
    } else if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Enter a valid amount';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Animate success checkmark
  const animateSuccess = () => {
    setShowSuccessAnimation(true);
    Animated.sequence([
      Animated.timing(successScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(successScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
    // Navigation is now handled in handleSubmit
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        animateSuccess();
        
        // Navigation happens after success animation
        setTimeout(() => {
          setShowSuccessAnimation(false);
          navigation.navigate('ProjectsTab', { screen: 'MyProjects' });
        }, 1500); // Match this with animation duration
      }, 1500);
    } else {
      // Scroll to top if there are errors
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  // Reference for ScrollView
  const scrollViewRef = useRef(null);

  // Progress Bar component based on platform
  const ProgressBar = () => {
    return Platform.OS === 'ios' ? (
      <ProgressViewIOS 
        progress={formProgress} 
        progressTintColor={Colors.secondary}
        style={styles.progressBar}
      />
    ) : (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={formProgress}
        color={Colors.secondary}
        style={styles.progressBar}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Project Request</Text>
      </View>
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <ProgressBar />
        <Text style={styles.progressText}>
          {Math.round(formProgress * 100)}% completed
        </Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 80}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Form Content */}
          <View style={styles.formContainer}>
            
            {/* ===== SECTION: Basic Information ===== */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{SECTIONS[0].title}</Text>
              </View>
              
              {/* Project Title */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>
                    Project Title <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.title && styles.inputError
                  ]}
                  placeholder="E.g. Repair leaking sink"
                  value={formData.title}
                  onChangeText={(text) => handleChange('title', text)}
                  placeholderTextColor={Colors.textLight}
                />
                {errors.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
              </View>
              
              {/* Project Category */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>
                    Category <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesContainer}
                >
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        formData.category === category.id && styles.selectedCategoryChip
                      ]}
                      onPress={() => handleCategorySelect(category.id)}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={20} 
                        color={formData.category === category.id ? Colors.primary : Colors.secondary} 
                      />
                      <Text style={[
                        styles.categoryText,
                        formData.category === category.id && styles.selectedCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}
              </View>
            </View>
            
            {/* ===== SECTION: Project Details ===== */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{SECTIONS[1].title}</Text>
              </View>
              
              {/* Project Description */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>
                    Description <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <Text style={styles.questionSubLabel}>
                    Please describe what you need done
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.textArea,
                    errors.description && styles.inputError
                  ]}
                  placeholder="Describe your project in detail"
                  multiline
                  numberOfLines={4}
                  value={formData.description}
                  onChangeText={(text) => handleChange('description', text)}
                  placeholderTextColor={Colors.textLight}
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>
              
              {/* Location */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>
                    Location <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                </View>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.locationInput,
                      errors.location && styles.inputError
                    ]}
                    placeholder="Enter your address"
                    value={formData.location}
                    onChangeText={(text) => handleChange('location', text)}
                    placeholderTextColor={Colors.textLight}
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
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}
              </View>
            </View>
            
            {/* ===== SECTION: Budget ===== */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{SECTIONS[2].title}</Text>
              </View>
              
              {/* Budget */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>
                    Budget <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                </View>
                <View style={styles.budgetContainer}>
                  <View style={styles.currencyContainer}>
                    <Text style={styles.currencyText}>RM</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.budgetInput,
                      errors.budget && styles.inputError
                    ]}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={formData.budget}
                    onChangeText={(text) => handleChange('budget', text)}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
                {errors.budget && (
                  <Text style={styles.errorText}>{errors.budget}</Text>
                )}
                <View style={styles.negotiableContainer}>
                  <Text style={styles.negotiableText}>Price is negotiable</Text>
                  <Switch
                    value={formData.isNegotiable}
                    onValueChange={(value) => handleChange('isNegotiable', value)}
                    trackColor={{ false: Colors.inactive, true: `${Colors.secondary}80` }}
                    thumbColor={formData.isNegotiable ? Colors.secondary : '#FAFAFA'}
                    ios_backgroundColor={Colors.inactive}
                  />
                </View>
              </View>
            </View>
            
            {/* ===== SECTION: Schedule ===== */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{SECTIONS[3].title}</Text>
              </View>
              
              {/* Date Picker - Material Design Style */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>Preferred Date</Text>
                </View>
                <TouchableOpacity
                  style={styles.materialInputField}
                  onPress={showDatePickerModal}
                >
                  <Text style={formData.preferredDate ? styles.materialInputText : styles.materialInputPlaceholder}>
                    {formatDate(formData.preferredDate)}
                  </Text>
                  <Ionicons name="calendar-outline" size={22} color={Colors.secondary} />
                </TouchableOpacity>
              </View>
              
              {/* Time Picker - Material Design Style */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>Preferred Time</Text>
                </View>
                <TouchableOpacity
                  style={styles.materialInputField}
                  onPress={showTimePickerModal}
                >
                  <Text style={formData.preferredTime ? styles.materialInputText : styles.materialInputPlaceholder}>
                    {formatTime(formData.preferredTime)}
                  </Text>
                  <Ionicons name="time-outline" size={22} color={Colors.secondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* ===== SECTION: Additional Info ===== */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{SECTIONS[4].title}</Text>
              </View>
              
              {/* Project Images */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>Add Photos</Text>
                  <Text style={styles.questionSubLabel}>
                    Upload images to help explain your project
                  </Text>
                </View>
                
                <View style={styles.imagesContainer}>
                  {formData.images.map((image, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image source={{ uri: image }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {formData.images.length < 3 && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="add" size={32} color={Colors.secondary} />
                      <Text style={styles.addImageText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {/* Additional Notes */}
              <View style={styles.questionContainer}>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>Notes</Text>
                  <Text style={styles.questionSubLabel}>
                    Any other details the handyman should know?
                  </Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  placeholder="Add any additional information here"
                  multiline
                  numberOfLines={3}
                  value={formData.notes}
                  onChangeText={(text) => handleChange('notes', text)}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>
            
            {/* Required fields note */}
            <Text style={styles.requiredNote}>
              <Text style={styles.requiredAsterisk}>* </Text>
              Required fields
            </Text>
          </View>
          
          <View style={styles.bottomSpace} />
        </ScrollView>
        
        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                Submit
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* Material Design Date Picker */}
      {showDatePicker && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.materialModalOverlay}>
            <View style={styles.materialModalContent}>
              <View style={styles.materialModalHeader}>
                <Text style={styles.materialModalLabel}>Select date</Text>
                <Text style={styles.materialModalSelectedDate}>
                  {formatDate(formData.preferredDate).replace(',', '')}
                </Text>
                <View style={styles.materialModalTabs}>
                  <View style={styles.materialDaysRow}>
                    <Text style={styles.dayHeader}>S</Text>
                    <Text style={styles.dayHeader}>M</Text>
                    <Text style={styles.dayHeader}>T</Text>
                    <Text style={styles.dayHeader}>W</Text>
                    <Text style={styles.dayHeader}>T</Text>
                    <Text style={styles.dayHeader}>F</Text>
                    <Text style={styles.dayHeader}>S</Text>
                  </View>
                </View>
              </View>
              
              <DateTimePicker
                testID="datePicker"
                value={formData.preferredDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.materialDatePicker}
                themeVariant="light"
                textColor={Colors.textDark}
                accentColor={Colors.secondary}
              />
              
              <View style={styles.materialButtonRow}>
                <TouchableOpacity
                  style={styles.materialTextButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.materialCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.materialTextButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.materialOkText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Material Design Time Picker */}
      {showTimePicker && (
        <Modal
          transparent={true}
          visible={showTimePicker}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.materialModalOverlay}>
            <View style={styles.materialModalContent}>
              <View style={styles.materialModalHeader}>
                <Text style={styles.materialModalLabel}>Select time</Text>
                <View style={styles.materialTimeInputContainer}>
                  <Text style={styles.materialTimeText}>
                    {formData.preferredTime.getHours() > 12 
                      ? (formData.preferredTime.getHours() - 12).toString().padStart(2, '0') 
                      : formData.preferredTime.getHours().toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.materialTimeSeparator}>:</Text>
                  <Text style={styles.materialTimeText}>
                    {formData.preferredTime.getMinutes().toString().padStart(2, '0')}
                  </Text>
                  <View style={styles.materialAmPmContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.materialAmPmButton, 
                        formData.preferredTime.getHours() < 12 && styles.materialSelectedAmPm
                      ]}
                      onPress={() => {
                        const newTime = new Date(formData.preferredTime);
                        if (newTime.getHours() >= 12) {
                          newTime.setHours(newTime.getHours() - 12);
                          handleChange('preferredTime', newTime);
                        }
                      }}
                    >
                      <Text style={[
                        styles.materialAmPmText,
                        formData.preferredTime.getHours() < 12 && styles.materialSelectedAmPmText
                      ]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.materialAmPmButton, 
                        formData.preferredTime.getHours() >= 12 && styles.materialSelectedAmPm
                      ]}
                      onPress={() => {
                        const newTime = new Date(formData.preferredTime);
                        if (newTime.getHours() < 12) {
                          newTime.setHours(newTime.getHours() + 12);
                          handleChange('preferredTime', newTime);
                        }
                      }}
                    >
                      <Text style={[
                        styles.materialAmPmText,
                        formData.preferredTime.getHours() >= 12 && styles.materialSelectedAmPmText
                      ]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.materialClockContainer}>
                <View style={styles.materialClockCircle}>
                  <View style={styles.materialClockCenter} />
                  {timePickerMode === 'hours' ? (
                    // Hour selection
                    <>
                      <View style={[
                        styles.materialClockHand,
                        {transform: [
                          {rotate: `${((formData.preferredTime.getHours() % 12) * 30) + (formData.preferredTime.getMinutes() * 0.5)}deg`}
                        ]}
                      ]}>
                        <View style={styles.materialClockHandCircle} />
                      </View>
                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour, index) => (
                        <View 
                          key={hour} 
                          style={[
                            styles.materialClockNumber,
                            {transform: [
                              {rotate: `${index * 30}deg`},
                              {translateY: -80}
                            ]}
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => selectHour(hour)}
                            style={styles.materialClockNumberButton}
                          >
                            <Text style={[
                              styles.materialClockNumberText,
                              (formData.preferredTime.getHours() % 12 === hour % 12 || 
                              (hour === 12 && formData.preferredTime.getHours() % 12 === 0)) && 
                              styles.materialSelectedClockNumberText
                            ]}>
                              {hour}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </>
                  ) : (
                    // Minute selection
                    <>
                      <View style={[
                        styles.materialClockHand,
                        {transform: [
                          {rotate: `${formData.preferredTime.getMinutes() * 6}deg`}
                        ]}
                      ]}>
                        <View style={styles.materialClockHandCircle} />
                      </View>
                      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute, index) => (
                        <View 
                          key={minute} 
                          style={[
                            styles.materialClockNumber,
                            {transform: [
                              {rotate: `${index * 30}deg`},
                              {translateY: -80}
                            ]}
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => selectMinute(minute)}
                            style={styles.materialClockNumberButton}
                          >
                            <Text style={[
                              styles.materialClockNumberText,
                              formData.preferredTime.getMinutes() === minute && 
                              styles.materialSelectedClockNumberText
                            ]}>
                              {minute}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </>
                  )}
                </View>
                
                {/* Mode switch buttons */}
                <View style={styles.timePickerModeContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.timePickerModeButton,
                      timePickerMode === 'hours' && styles.activeTimePickerMode
                    ]}
                    onPress={() => setTimePickerMode('hours')}
                  >
                    <Text style={[
                      styles.timePickerModeText,
                      timePickerMode === 'hours' && styles.activeTimePickerModeText
                    ]}>
                      Hours
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.timePickerModeButton,
                      timePickerMode === 'minutes' && styles.activeTimePickerMode
                    ]}
                    onPress={() => setTimePickerMode('minutes')}
                  >
                    <Text style={[
                      styles.timePickerModeText,
                      timePickerMode === 'minutes' && styles.activeTimePickerModeText
                    ]}>
                      Minutes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.materialButtonRow}>
                <TouchableOpacity
                  style={styles.materialTextButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.materialCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.materialTextButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.materialOkText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Success animation overlay */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          <Animated.View 
            style={[
              styles.successIcon,
              { transform: [{ scale: successScale }] }
            ]}
          >
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.successText}>Submitted!</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  progressBar: {
    height: 6,
    marginBottom: 8,
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 16,
  },
  formContainer: {
    padding: 16,
  },
  formSection: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  questionLabelContainer: {
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  questionSubLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  requiredAsterisk: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  requiredNote: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 0,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textDark,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderWidth: 0,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: Colors.textDark,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 0, 0.1)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.secondary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  locationButton: {
    backgroundColor: Colors.primary,
    height: 48,
    width: 48,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyContainer: {
    backgroundColor: Colors.inactive,
    height: 48,
    paddingHorizontal: 16,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  budgetInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  negotiableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  negotiableText: {
    fontSize: 15,
    color: Colors.textDark,
  },
  
  // Material Design Input styles
  materialInputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  materialInputText: {
    fontSize: 16,
    color: Colors.textDark,
  },
  materialInputPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  
  // Material Design styles for date/time pickers
  materialModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  materialModalContent: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    width: '100%',
    maxWidth: 360,
    padding: 0,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  materialModalHeader: {
    padding: 24,
    backgroundColor: Colors.primary,
  },
  materialModalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  materialModalSelectedDate: {
    fontSize: 32,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  materialModalTabs: {
    marginTop: 8,
  },
  materialDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayHeader: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    width: 36,
    textAlign: 'center',
  },
  materialDatePicker: {
    marginBottom: 16,
  },
  materialButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  materialTextButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  materialCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  materialOkText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  materialTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  materialTimeText: {
    fontSize: 50,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  materialTimeSeparator: {
    fontSize: 50,
    fontWeight: '400',
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  materialAmPmContainer: {
    marginLeft: 24,
  },
  materialAmPmButton: {
    paddingVertical: 8,
    width: 40,
    alignItems: 'center',
  },
  materialSelectedAmPm: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  materialAmPmText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  materialSelectedAmPmText: {
    color: '#FFFFFF',
  },
  materialClockContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialClockCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  materialClockCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  materialClockHand: {
    position: 'absolute',
    width: 2,
    height: 80,
    backgroundColor: Colors.secondary,
    bottom: 100,
    transformOrigin: 'bottom',
    zIndex: 10,
  },
  materialClockHandCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    top: -12,
    left: -11,
  },
  materialClockNumber: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  materialClockNumberButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  materialClockNumberText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textDark,
    textAlign: 'center',
  },
  materialSelectedClockNumberText: {
    color: '#FFFFFF',
    backgroundColor: Colors.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    lineHeight: 36,
  },
  
  // Time picker mode styles
  timePickerModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  timePickerModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 4,
  },
  activeTimePickerMode: {
    backgroundColor: 'rgba(255, 209, 0, 0.1)',
  },
  timePickerModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMedium,
  },
  activeTimePickerModeText: {
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  
  // Image Styles
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imagePreviewContainer: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addImageButton: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    backgroundColor: Colors.background,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  addImageText: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 80,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  successIcon: {
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
  }
});

export default ProjectBidScreen;
