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
import Colors from '../constants/Colors';

const EditProfileScreen = ({ navigation, route }) => {
  const { userType, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user data from params or use defaults
  const initialUserData = route.params?.userData || {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+60 12-345-6789',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'Kuala Lumpur, Malaysia',
    bio: userType === 'handyman' 
      ? 'Professional handyman with 10+ years of experience in plumbing, electrical work, and general repairs.' 
      : 'Looking for reliable handymen for home improvement projects.',
    skills: userType === 'handyman' ? ['Plumbing', 'Electrical', 'Carpentry'] : [],
    hourlyRate: userType === 'handyman' ? '35' : '',
  };
  
  // Form state
  const [userData, setUserData] = useState(initialUserData);
  const [avatarUpdated, setAvatarUpdated] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  // Request permission for image library
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile picture.');
        }
      }
    })();
  }, []);

  const handleInputChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      const updatedSkills = [...userData.skills, newSkill.trim()];
      setUserData({ ...userData, skills: updatedSkills });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = [...userData.skills];
    updatedSkills.splice(index, 1);
    setUserData({ ...userData, skills: updatedSkills });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUserData({ ...userData, avatar: result.assets[0].uri });
      setAvatarUpdated(true);
    }
  };

  const handleSave = () => {
    // Validate inputs
    if (!userData.name || !userData.email || !userData.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    // Validate phone format
    const phoneRegex = /^\+?[\d\s-]{7,15}$/;
    if (!phoneRegex.test(userData.phone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
      return;
    }
    
    // Show loading indicator
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // In a real app, you would update user profile using a function from Auth Context
      // updateUserProfile(userData);
      
      Alert.alert(
        'Profile Updated',
        'Your profile information has been successfully updated.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter your full name"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={Colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={Colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="Enter your location"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={userData.bio}
                onChangeText={(text) => handleInputChange('bio', text)}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>
        
        {userType === 'handyman' && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hourly Rate (RM)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color={Colors.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.hourlyRate}
                  onChangeText={(text) => handleInputChange('hourlyRate', text)}
                  placeholder="Enter your hourly rate"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skills & Services</Text>
              <View style={styles.skillsList}>
                {userData.skills.map((skill, index) => (
                  <View key={index} style={styles.skillItem}>
                    <Text style={styles.skillText}>{skill}</Text>
                    <TouchableOpacity
                      style={styles.removeSkillButton}
                      onPress={() => handleRemoveSkill(index)}
                    >
                      <Ionicons name="close" size={16} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              
              <View style={styles.addSkillContainer}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name="construct-outline" size={20} color={Colors.darkGray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="Add a skill or service"
                  />
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
                  <Ionicons name="add" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  changePhotoText: {
    color: Colors.primary,
    fontSize: 14,
  },
  formSection: {
    backgroundColor: Colors.white,
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
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
    paddingHorizontal: 15,
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
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
  },
  textArea: {
    height: '100%',
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 5,
    paddingLeft: 15,
    paddingRight: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: Colors.white,
    marginRight: 5,
  },
  removeSkillButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;