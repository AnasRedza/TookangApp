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

const EditProfileScreen = ({ navigation, route }) => {
  const { userType } = useAuth();
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
  const [newSkill, setNewSkill] = useState('');
  
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

  const handleSelectImage = () => {
    // In a real app, this would use ImagePicker
    Alert.alert(
      'Change Profile Picture',
      'This would open your photo gallery in a real app.',
      [{ text: 'OK' }]
    );
  };

  const handleSave = () => {
    // Basic validation
    if (!userData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.goBack();
    }, 1000);
  };

  const renderInputField = (label, field, placeholder, icon, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, multiline && styles.multilineContainer]}>
        {icon && <Ionicons name={icon} size={18} color="#999" style={styles.inputIcon} />}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={userData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleSelectImage}
          >
            <Image 
              source={{ uri: userData.avatar }} 
              style={styles.avatar} 
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {renderInputField('Name', 'name', 'Enter your name', 'person-outline')}
          {renderInputField('Email', 'email', 'Enter your email', 'mail-outline', 'email-address')}
          {renderInputField('Phone', 'phone', 'Enter your phone number', 'call-outline', 'phone-pad')}
          {renderInputField('Location', 'location', 'City, Country', 'location-outline')}
          {renderInputField('Bio', 'bio', 'Tell us about yourself...', null, 'default', true)}
        </View>

        {/* Professional Information (for handymen only) */}
        {userType === 'handyman' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            {renderInputField('Hourly Rate (RM)', 'hourlyRate', 'Enter your rate', 'cash-outline', 'numeric')}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Skills</Text>
              
              {/* Skills list */}
              {userData.skills.length > 0 && (
                <View style={styles.skillsList}>
                  {userData.skills.map((skill, index) => (
                    <View key={index} style={styles.skillItem}>
                      <Text style={styles.skillText}>{skill}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveSkill(index)}
                      >
                        <Ionicons name="close" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Add new skill */}
              <View style={styles.addSkillRow}>
                <TextInput
                  style={styles.addSkillInput}
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="Add a skill"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !newSkill.trim() && styles.disabledButton
                  ]}
                  onPress={handleAddSkill}
                  disabled={!newSkill.trim()}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
        
        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
  },
  multilineContainer: {
    height: 100,
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingRight: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#FFF',
    fontSize: 13,
    marginRight: 4,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSkillInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#F9F9F9',
    fontSize: 15,
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginHorizontal: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginHorizontal: 16,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
});

export default EditProfileScreen;