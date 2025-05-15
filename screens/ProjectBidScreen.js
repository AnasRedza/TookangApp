import React, { useState, useEffect } from 'react';
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
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ProjectBidScreen = ({ route, navigation }) => {
  const { handyman } = route.params || {};
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    initialBudget: '',
    images: [],
    isNegotiable: true,
    preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    preferredTime: 'morning',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState([
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 
    'Cleaning', 'Landscaping', 'Flooring', 'HVAC', 
    'Roofing', 'Appliance Repair', 'General Maintenance'
  ]);
  
  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload project images!'
          );
        }
      }
    })();
  }, []);
  
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
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.preferredDate;
    setShowDatePicker(Platform.OS === 'ios');
    handleChange('preferredDate', currentDate);
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
      newErrors.title = 'Project title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide a more detailed description';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.initialBudget) {
      newErrors.initialBudget = 'Please enter your budget';
    } else if (isNaN(formData.initialBudget) || parseFloat(formData.initialBudget) <= 0) {
      newErrors.initialBudget = 'Please enter a valid amount';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Service location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call to create project
      setTimeout(() => {
        setIsLoading(false);
        
        // Navigate to success or next step
        Alert.alert(
          'Project Bid Submitted',
          'Your project bid has been sent. You will be notified when handymen respond.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MyProjects')
            }
          ]
        );
      }, 1500);
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Project Bid</Text>
            <Text style={styles.headerSubtitle}>
              {handyman 
                ? `Request service from ${handyman.name}` 
                : 'Post your project and receive bids from handymen'}
            </Text>
          </View>
          
          {/* Project Details Form */}
          <View style={styles.formContainer}>
            {/* Project Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Title</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.title && styles.inputError
                ]}
                placeholder="Give your project a clear title"
                value={formData.title}
                onChangeText={(text) => handleChange('title', text)}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>
            
            {/* Project Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Description</Text>
              <TextInput
                style={[
                  styles.textArea,
                  errors.description && styles.inputError
                ]}
                placeholder="Describe what you need done in detail"
                multiline
                numberOfLines={5}
                value={formData.description}
                onChangeText={(text) => handleChange('description', text)}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>
            
            {/* Project Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      formData.category === category && styles.selectedCategoryChip
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      formData.category === category && styles.selectedCategoryText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Project Budget */}
            <View style={styles.inputGroup}>
              <View style={styles.budgetHeader}>
                <Text style={styles.inputLabel}>Your Budget (RM)</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Negotiable</Text>
                  <Switch
                    value={formData.isNegotiable}
                    onValueChange={(value) => handleChange('isNegotiable', value)}
                    trackColor={{ false: '#D1D1D1', true: `${Colors.primary}80` }}
                    thumbColor={formData.isNegotiable ? Colors.primary : '#F4F4F4'}
                  />
                </View>
              </View>
              <TextInput
                style={[
                  styles.input,
                  errors.initialBudget && styles.inputError
                ]}
                placeholder="Enter your budget"
                keyboardType="numeric"
                value={formData.initialBudget}
                onChangeText={(text) => handleChange('initialBudget', text)}
              />
              {errors.initialBudget && (
                <Text style={styles.errorText}>{errors.initialBudget}</Text>
              )}
              <Text style={styles.budgetNote}>
                {formData.isNegotiable 
                  ? 'Handymen may propose different rates based on project requirements'
                  : 'Only handymen willing to work with this budget will respond'}
              </Text>
            </View>
            
            {/* Service Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Location</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.location && styles.inputError
                ]}
                placeholder="Enter the address for service"
                value={formData.location}
                onChangeText={(text) => handleChange('location', text)}
              />
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>
            
            {/* Preferred Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(formData.preferredDate)}</Text>
                <Ionicons name="calendar-outline" size={22} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.preferredDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>
            
            {/* Preferred Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Time</Text>
              <View style={styles.timeOptionsContainer}>
                {['morning', 'afternoon', 'evening', 'anytime'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      formData.preferredTime === time && styles.selectedTimeOption
                    ]}
                    onPress={() => handleChange('preferredTime', time)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      formData.preferredTime === time && styles.selectedTimeOptionText
                    ]}>
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Project Images */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Images (Optional)</Text>
              <Text style={styles.imageNote}>
                Add photos to help handymen understand your project
              </Text>
              
              <View style={styles.imagesContainer}>
                {formData.images.map((image, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {formData.images.length < 5 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={pickImage}
                  >
                    <Ionicons name="camera-outline" size={40} color="#999" />
                    <Text style={styles.addImageText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Additional Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Any other details handymen should know?"
                multiline
                numberOfLines={3}
                value={formData.notes}
                onChangeText={(text) => handleChange('notes', text)}
              />
            </View>
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
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Project Bid</Text>
            )}
          </TouchableOpacity>
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
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
    lineHeight: 22,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E53935',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: '#F1F1F1',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  selectedCategoryChip: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: '#555555',
  },
  selectedCategoryText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  budgetNote: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedTimeOption: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    color: '#555555',
  },
  selectedTimeOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  imageNote: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    margin: 5,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  bottomSpace: {
    height: 80,
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
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProjectBidScreen;