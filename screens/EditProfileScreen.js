// Fixed EditProfileScreen.js with proper profile picture handling

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
import { storage } from '../firebase';

const EditProfileScreen = ({ navigation }) => {
  const { user, isHandyman, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
    services: []
  });
  
  // Available service categories
  const AVAILABLE_CATEGORIES = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 
    'HVAC', 'Landscaping', 'Appliance Repair', 'Flooring', 'Roofing'
  ];

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
          profilePicture: userProfile.profilePicture || getUserAvatarUri(userProfile),
          services: userProfile.services || []
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
          profilePicture: user.profilePicture || getUserAvatarUri(user),
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
        profilePicture: user?.profilePicture || getUserAvatarUri(user),
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

  // FIXED: Image upload with proper Firebase Storage handling
 const uploadImageToFirebase = async (imageUri) => {
  try {
    setIsUploadingImage(true);
    console.log('🔄 Starting image upload process...');
    
    // Validate storage is available
    if (!storage) {
      console.error('❌ Firebase storage is not initialized');
      throw new Error('Storage service is not available');
    }
    
    console.log('✅ Storage service is available');
    
    // Convert image to blob
    console.log('📁 Converting image to blob...');
    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    console.log('✅ Image converted to blob, size:', blob.size);
    
    // Create unique filename with user ID and timestamp
    const fileName = `profile_pictures/${user.id}_${Date.now()}.jpg`;
    console.log('📂 Creating storage reference:', fileName);
    
    // Get storage reference
    const storageRef = storage.ref();
    const imageRef = storageRef.child(fileName);
    
    console.log('📤 Starting upload to Firebase Storage...');
    
    // Upload the blob
    const uploadTask = imageRef.put(blob);
    
    // Wait for upload to complete
    await uploadTask;
    console.log('✅ Upload completed successfully');
    
    // Get the download URL
    console.log('🔗 Getting download URL...');
    const downloadURL = await imageRef.getDownloadURL();
    
    console.log('✅ Image uploaded successfully:', downloadURL);
    return downloadURL;
    
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // More specific error handling
    if (error.code === 'storage/unauthorized') {
      throw new Error('Upload permission denied. Please check your account permissions.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Unknown upload error occurred.');
    } else if (error.message?.includes('storage is not available')) {
      throw new Error('Storage service is not properly configured.');
    } else if (error.message?.includes('ref')) {
      throw new Error('Storage reference error. Please restart the app and try again.');
    } else {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  } finally {
    setIsUploadingImage(false);
  }
};

  const handleSelectImage = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Remove Photo', onPress: removePhoto, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Camera permission is required to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        try {
          const uploadedUrl = await uploadImageToFirebase(imageUri);
          handleInputChange('profilePicture', uploadedUrl);
        } catch (error) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Gallery permission is required to select photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        try {
          const uploadedUrl = await uploadImageToFirebase(imageUri);
          handleInputChange('profilePicture', uploadedUrl);
        } catch (error) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removePhoto = () => {
    // Set to generated avatar
    const generatedAvatar = getUserAvatarUri({ 
      name: userData.name, 
      role: isHandyman ? 'handyman' : 'customer' 
    });
    handleInputChange('profilePicture', generatedAvatar);
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
        // FIXED: Ensure profilePicture is included in updates
        profilePicture: userData.profilePicture,
      };

      if (isHandyman) {
        updates.location = userData.location.trim();
        updates.hourlyRate = userData.hourlyRate ? parseFloat(userData.hourlyRate) : null;
        updates.experience = userData.experience ? parseInt(userData.experience) : null;
        updates.serviceCategories = userData.serviceCategories;
        updates.services = userData.services.filter(service => service.name.trim() && service.price.trim());
      }

      console.log('🔄 Updating profile with:', updates);

      // Update in Firebase
      await userService.updateUserProfile(user.id, updates);
      
      console.log('✅ Profile updated in Firebase');
      
      // Update local auth context
      await updateUserProfile(updates);
      
      console.log('✅ Local auth context updated');
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('❌ Error updating profile:', error);
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
          <TouchableOpacity onPress={handleSelectImage} disabled={isUploadingImage}>
            <Image 
              source={{ uri: userData.profilePicture }} 
              style={styles.profilePhoto} 
            />
            <View style={styles.changePhotoButton}>
              {isUploadingImage ? (
                <ActivityIndicator size={14} color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          {isUploadingImage && (
            <Text style={styles.uploadingText}>Uploading...</Text>
          )}
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

            {/* Services Offered */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Services</Text>
            <Text style={styles.sectionSubtitle}>Add specific services you offer with prices</Text>
            
            {userData.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceInputRow}>
                  <TextInput
                    style={[styles.input, styles.serviceNameInput]}
                    placeholder="Service name (e.g., Repair Sink)"
                    value={service.name}
                    onChangeText={(text) => {
                      const newServices = [...userData.services];
                      newServices[index].name = text;
                      handleInputChange('services', newServices);
                    }}
                  />
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencyLabel}>RM</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      placeholder="Price"
                      value={service.price}
                      onChangeText={(text) => {
                        const newServices = [...userData.services];
                        newServices[index].price = text;
                        handleInputChange('services', newServices);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeServiceButton}
                  onPress={() => {
                    const newServices = userData.services.filter((_, i) => i !== index);
                    handleInputChange('services', newServices);
                  }}
                >
                  <Text style={styles.removeServiceText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addServiceButton}
              onPress={() => {
                const newServices = [...userData.services, { name: '', price: '' }];
                handleInputChange('services', newServices);
              }}
            >
              <Text style={styles.addServiceText}>+ Add Service</Text>
            </TouchableOpacity>
          </View>
          </>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.saveButton, (isSaving || isUploadingImage) && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving || isUploadingImage}
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
            disabled={isSaving || isUploadingImage}
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
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textMedium,
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
  },
  serviceItem: {
  marginBottom: 16,
  padding: 16,
  backgroundColor: '#F8F9FA',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#E0E0E0',
},
serviceInputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
serviceNameInput: {
  flex: 2,
  marginRight: 12,
},
priceInputContainer: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#DDDDDD',
  borderRadius: 8,
  backgroundColor: '#FAFAFA',
},
currencyLabel: {
  paddingHorizontal: 12,
  fontSize: 14,
  color: '#666666',
  fontWeight: '500',
},
priceInput: {
  flex: 1,
  borderWidth: 0,
  paddingLeft: 0,
  backgroundColor: 'transparent',
},
removeServiceButton: {
  alignSelf: 'flex-end',
  paddingVertical: 4,
  paddingHorizontal: 8,
},
removeServiceText: {
  color: '#E53935',
  fontSize: 12,
  fontWeight: '500',
},
addServiceButton: {
  backgroundColor: Colors.primary,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 8,
},
addServiceText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},
});

export default EditProfileScreen;