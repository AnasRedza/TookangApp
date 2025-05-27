import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const EditProfileScreen = ({ navigation }) => {
  const { user, isHandyman, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    hourlyRate: '',
    experience: '',
    serviceCategories: [],
    profilePicture: '',
  });
  
  // Available service categories
  const AVAILABLE_CATEGORIES = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 
    'HVAC', 'Landscaping', 'Appliance Repair', 'Flooring', 'Roofing'
  ];
  
  // States for adding new items (handyman only)
  const [newCategory, setNewCategory] = useState({ name: '', price: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, [user]);
  
  const loadUserData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userProfile = await userService.getUserById(user.id);
      if (userProfile) {
        setUserData({
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          hourlyRate: userProfile.hourlyRate?.toString() || '',
          experience: userProfile.experience?.toString() || '',
          serviceCategories: userProfile.serviceCategories || [],
          profilePicture: getUserAvatarUri(userProfile),
        });
      } else {
        // If no profile found, use user data from auth context
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          location: user.location || '',
          hourlyRate: user.hourlyRate?.toString() || '',
          experience: user.experience?.toString() || '',
          serviceCategories: user.serviceCategories || [],
          profilePicture: getUserAvatarUri(user),
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
      // Fallback to auth user data
      setUserData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        location: user?.location || '',
        hourlyRate: user?.hourlyRate?.toString() || '',
        experience: user?.experience?.toString() || '',
        serviceCategories: user?.serviceCategories || [],
        profilePicture: getUserAvatarUri(user),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectImage = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Camera permission is required to take photos.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        handleInputChange('profilePicture', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Gallery permission is required to select photos.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        handleInputChange('profilePicture', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const validateForm = () => {
    if (!userData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (userData.phone.trim()) {
      const phoneRegex = /^(\+60|60)?[1-9]\d{7,9}$/;
      if (!phoneRegex.test(userData.phone.replace(/[\s-]/g, ''))) {
        Alert.alert('Invalid Phone', 'Please enter a valid Malaysian phone number');
        return false;
      }
    }
    
    if (isHandyman) {
      if (userData.hourlyRate && (isNaN(userData.hourlyRate) || parseFloat(userData.hourlyRate) <= 0)) {
        Alert.alert('Invalid Rate', 'Please enter a valid hourly rate');
        return false;
      }
      
      if (userData.experience && (isNaN(userData.experience) || parseInt(userData.experience) < 0)) {
        Alert.alert('Invalid Experience', 'Please enter valid years of experience');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      const updates = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        phone: userData.phone.trim(),
        bio: userData.bio.trim(),
        profilePicture: userData.profilePicture,
      };

      if (isHandyman) {
        updates.location = userData.location.trim();
        updates.hourlyRate = userData.hourlyRate ? parseFloat(userData.hourlyRate) : null;
        updates.experience = userData.experience ? parseInt(userData.experience) : null;
        updates.serviceCategories = userData.serviceCategories;
      }

      // Update in Firebase
      await userService.updateUserProfile(user.id, updates);
      
      // Update local auth context
      await updateUserProfile(updates);
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleServiceCategory = (category) => {
    setUserData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter(c => c !== category)
        : [...prev.serviceCategories, category]
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <TouchableOpacity onPress={handleSelectImage}>
            <Image 
              source={{ uri: getUserAvatarUri({ 
                name: userData.name, 
                profilePicture: userData.profilePicture,
                role: isHandyman ? 'handyman' : 'customer'
              }) }} 
              style={styles.profilePhoto} 
            />
            <View style={styles.changePhotoButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter your full name"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>About {isHandyman ? 'Me' : 'Myself'}</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={userData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              placeholder={isHandyman ? 
                "Tell customers about yourself and your services" : 
                "Share a bit about yourself"
              }
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* HANDYMAN-SPECIFIC SECTIONS */}
        {isHandyman && (
          <>
            {/* Professional Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Details</Text>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Service Location</Text>
                <TextInput
                  style={styles.input}
                  value={userData.location}
                  onChangeText={(text) => handleInputChange('location', text)}
                  placeholder="Enter your service area"
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Years of Experience</Text>
                <TextInput
                  style={styles.input}
                  value={userData.experience}
                  onChangeText={(text) => handleInputChange('experience', text)}
                  placeholder="Enter years of experience"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Hourly Rate (RM)</Text>
                <TextInput
                  style={styles.input}
                  value={userData.hourlyRate}
                  onChangeText={(text) => handleInputChange('hourlyRate', text)}
                  placeholder="Enter your hourly rate"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            {/* Service Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Categories</Text>
              <Text style={styles.sectionSubtitle}>Select the services you provide</Text>
              
              <View style={styles.categoriesContainer}>
                {AVAILABLE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      userData.serviceCategories.includes(category) && styles.selectedCategoryChip
                    ]}
                    onPress={() => toggleServiceCategory(category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      userData.serviceCategories.includes(category) && styles.selectedCategoryText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.discardButton}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={styles.discardButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMedium,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  actionButtons: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discardButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  discardButtonText: {
    color: '#666666',
    fontSize: 16,
  }
});

export default EditProfileScreen;