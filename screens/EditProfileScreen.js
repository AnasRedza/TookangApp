import React, { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const EditProfileScreen = ({ navigation }) => {
  const { userRole } = useAuth();
  const isHandyman = userRole === 'handyman';
  const [isLoading, setIsLoading] = useState(false);
  
  // Initial data based on role
  const getInitialData = () => {
    if (isHandyman) {
      return {
        name: 'Ahmad Rahman',
        email: 'ahmad.rahman@handyman.my',
        phone: '+60 12-345-6789',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: 'Professional handyman with 10+ years of experience. Licensed and insured for all types of home repairs.',
        description: 'I specialize in plumbing, electrical work and general home repairs. Available for both emergency and scheduled services throughout Kuala Lumpur and surrounding areas.',
        serviceCategories: [
          { name: 'Plumbing', price: '40' },
          { name: 'Electrical', price: '50' },
          { name: 'Carpentry', price: '45' }
        ],
        commonItems: [
          { name: 'Basic pipe fitting', price: '15' },
          { name: 'Standard light fixture', price: '25' },
          { name: 'Door hinge replacement', price: '20' }
        ]
      };
    } else {
      return {
        name: 'Sarah Wong',
        email: 'sarah.wong@gmail.com',
        phone: '+60 13-987-6543',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        bio: 'Looking for reliable and skilled handymen for home improvement projects.',
        description: 'I own a condominium in Petaling Jaya and regularly need help with plumbing issues, air conditioning maintenance, and occasional furniture assembly.'
      };
    }
  };

  const [userData, setUserData] = useState(getInitialData());
  
  // States for adding new items (handyman only)
  const [newCategory, setNewCategory] = useState({ name: '', price: '' });
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  const handleInputChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleSelectImage = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => console.log('Camera selected') },
        { text: 'Choose from Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSave = () => {
    // Basic validation
    if (!userData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  // HANDYMAN ONLY: Add and remove methods
  const handleAddCategory = () => {
    if (newCategory.name.trim() && newCategory.price.trim()) {
      setUserData({
        ...userData,
        serviceCategories: [
          ...userData.serviceCategories,
          { name: newCategory.name.trim(), price: newCategory.price.trim() }
        ]
      });
      setNewCategory({ name: '', price: '' });
      setIsAddingCategory(false);
    }
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = [...userData.serviceCategories];
    updatedCategories.splice(index, 1);
    setUserData({ ...userData, serviceCategories: updatedCategories });
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.price.trim()) {
      setUserData({
        ...userData,
        commonItems: [
          ...userData.commonItems,
          { name: newItem.name.trim(), price: newItem.price.trim() }
        ]
      });
      setNewItem({ name: '', price: '' });
      setIsAddingItem(false);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...userData.commonItems];
    updatedItems.splice(index, 1);
    setUserData({ ...userData, commonItems: updatedItems });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <TouchableOpacity onPress={handleSelectImage}>
            <Image source={{ uri: userData.avatar }} style={styles.profilePhoto} />
            <View style={styles.changePhotoButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Basic Information - Common for both roles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter your full name"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
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
                "Tell customers about yourself" : 
                "Share a bit about yourself"
              }
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {isHandyman ? 'Service Description' : 'What I Need Help With'}
            </Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={userData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder={isHandyman ? 
                "Describe your services, specialties, and service areas" : 
                "Describe what kind of services you typically need"
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
            {/* Service Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Categories</Text>
              
              {userData.serviceCategories.map((category, index) => (
                <View key={index} style={styles.priceRow}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceName}>{category.name}</Text>
                    <Text style={styles.priceValue}>RM {category.price}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveCategory(index)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {isAddingCategory ? (
                <View style={styles.addItemForm}>
                  <View style={styles.addItemFields}>
                    <TextInput
                      style={[styles.input, styles.nameInput]}
                      value={newCategory.name}
                      onChangeText={(text) => setNewCategory({...newCategory, name: text})}
                      placeholder="Service name"
                      autoFocus
                    />
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={newCategory.price}
                      onChangeText={(text) => setNewCategory({...newCategory, price: text})}
                      placeholder="RM"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.addItemButtons}>
                    <TouchableOpacity 
                      style={[styles.addItemButton, styles.confirmButton]}
                      onPress={handleAddCategory}
                    >
                      <Text style={styles.confirmButtonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.addItemButton, styles.cancelButton]}
                      onPress={() => {
                        setNewCategory({ name: '', price: '' });
                        setIsAddingCategory(false);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setIsAddingCategory(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                  <Text style={styles.addButtonText}>Add Service Category</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Common Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common Items</Text>
              
              {userData.commonItems.map((item, index) => (
                <View key={index} style={styles.priceRow}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceName}>{item.name}</Text>
                    <Text style={styles.priceValue}>RM {item.price}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(index)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {isAddingItem ? (
                <View style={styles.addItemForm}>
                  <View style={styles.addItemFields}>
                    <TextInput
                      style={[styles.input, styles.nameInput]}
                      value={newItem.name}
                      onChangeText={(text) => setNewItem({...newItem, name: text})}
                      placeholder="Item name"
                      autoFocus
                    />
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={newItem.price}
                      onChangeText={(text) => setNewItem({...newItem, price: text})}
                      placeholder="RM"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.addItemButtons}>
                    <TouchableOpacity 
                      style={[styles.addItemButton, styles.confirmButton]}
                      onPress={handleAddItem}
                    >
                      <Text style={styles.confirmButtonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.addItemButton, styles.cancelButton]}
                      onPress={() => {
                        setNewItem({ name: '', price: '' });
                        setIsAddingItem(false);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setIsAddingItem(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                  <Text style={styles.addButtonText}>Add Common Item</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.discardButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
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
  // Handyman price list styles
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  priceInfo: {
    flex: 1,
  },
  priceName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 14,
    color: '#666666',
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 16,
    marginLeft: 8,
  },
  addItemForm: {
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  addItemFields: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  nameInput: {
    flex: 3,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
  },
  addItemButtons: {
    flexDirection: 'row',
  },
  addItemButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '500',
  },
  // Action buttons
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