import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ProjectBidScreen = ({ route, navigation }) => {
  const { handyman } = route.params || { 
    handyman: {
      id: '1',
      name: 'John Doe',
      profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.8,
      totalReviews: 147,
      hourlyRate: 45,
      profession: 'Plumber',
      location: 'San Francisco, CA'
    }
  };
  
  // Form state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [attachments, setAttachments] = useState([]);
  const [paymentType, setPaymentType] = useState('hourly');
  
  // Modal state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);
  
  // Format date for display
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Handle date selection
  const handleSelectDate = (daysToAdd) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysToAdd);
    setStartDate(newDate);
    setDatePickerVisible(false);
  };
  
  // Mock function to add a photo
  const handleAddPhoto = (source) => {
    setPhotoOptionsVisible(false);
    
    // Mock photo URLs for demo purposes
    const mockPhotos = [
      'https://images.unsplash.com/photo-1581783898377-1c85bf937427',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1',
    ];
    
    const newPhoto = {
      id: Date.now().toString(),
      uri: mockPhotos[Math.floor(Math.random() * mockPhotos.length)]
    };
    
    setAttachments([...attachments, newPhoto]);
  };
  
  // Remove a photo
  const handleRemovePhoto = (id) => {
    setAttachments(attachments.filter(photo => photo.id !== id));
  };
  
  // Submit the project bid
  const handleSubmit = () => {
    // Validate required fields
    if (!projectTitle.trim()) {
      Alert.alert('Please enter a project title');
      return;
    }
    
    if (!projectDescription.trim()) {
      Alert.alert('Please enter a project description');
      return;
    }
    
    if (paymentType !== 'quote' && !budget.trim()) {
      Alert.alert('Please enter your budget');
      return;
    }
    
    // Create project data
    const projectData = {
      title: projectTitle,
      description: projectDescription,
      budget: paymentType === 'quote' ? 'Quote requested' : budget,
      paymentType,
      startDate: startDate.toISOString(),
      attachments,
      handymanId: handyman.id,
      status: 'pending'
    };
    
    // Submit to API (mock)
    console.log('Submitting project:', projectData);
    
    // Show success message and navigate
    Alert.alert(
      'Project Submitted',
      'Your project has been sent to the handyman',
      [
        {
          text: 'View My Projects',
          onPress: () => navigation.navigate('MyProjects')
        },
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Render payment type option
  const renderPaymentOption = (type, title, description) => (
    <TouchableOpacity
      style={[
        styles.paymentOption,
        paymentType === type && styles.paymentOptionSelected
      ]}
      onPress={() => setPaymentType(type)}
    >
      <View style={styles.radioContainer}>
        <View style={styles.radioOuter}>
          {paymentType === type && <View style={styles.radioInner} />}
        </View>
      </View>
      <View style={styles.paymentOptionContent}>
        <Text style={styles.paymentOptionTitle}>{title}</Text>
        <Text style={styles.paymentOptionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  // Date picker modal
  const renderDatePickerModal = () => (
    <Modal
      visible={datePickerVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setDatePickerVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Start Date</Text>
            <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <TouchableOpacity style={styles.dateOption} onPress={() => handleSelectDate(0)}>
              <Text style={styles.dateOptionTitle}>Today</Text>
              <Text style={styles.dateOptionSubtitle}>{formatDate(new Date())}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dateOption} onPress={() => handleSelectDate(1)}>
              <Text style={styles.dateOptionTitle}>Tomorrow</Text>
              <Text style={styles.dateOptionSubtitle}>{formatDate(new Date(Date.now() + 86400000))}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dateOption} onPress={() => handleSelectDate(7)}>
              <Text style={styles.dateOptionTitle}>Next week</Text>
              <Text style={styles.dateOptionSubtitle}>{formatDate(new Date(Date.now() + 86400000 * 7))}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dateOption} onPress={() => handleSelectDate(14)}>
              <Text style={styles.dateOptionTitle}>In two weeks</Text>
              <Text style={styles.dateOptionSubtitle}>{formatDate(new Date(Date.now() + 86400000 * 14))}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dateOption} onPress={() => handleSelectDate(30)}>
              <Text style={styles.dateOptionTitle}>In a month</Text>
              <Text style={styles.dateOptionSubtitle}>{formatDate(new Date(Date.now() + 86400000 * 30))}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Photo options modal
  const renderPhotoOptionsModal = () => (
    <Modal
      visible={photoOptionsVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setPhotoOptionsVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={() => setPhotoOptionsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Photo</Text>
            <TouchableOpacity onPress={() => setPhotoOptionsVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.modalOption} onPress={() => handleAddPhoto('camera')}>
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            <Text style={styles.modalOptionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modalOption} onPress={() => handleAddPhoto('gallery')}>
            <Ionicons name="images-outline" size={24} color={Colors.primary} />
            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView>
        {/* Handyman info */}
        <View style={styles.handymanCard}>
          <Image source={{ uri: handyman.profilePicture }} style={styles.handymanImage} />
          <View style={styles.handymanInfo}>
            <Text style={styles.handymanName}>{handyman.name}</Text>
            <View style={styles.handymanRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{handyman.rating}</Text>
            </View>
            <Text style={styles.rateText}>RM{handyman.hourlyRate}/hr</Text>
          </View>
        </View>

        {/* Project details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Title <Text style={styles.required}>*</Text></Text>
            <TextInput 
              style={styles.input}
              value={projectTitle}
              onChangeText={setProjectTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              value={projectDescription}
              onChangeText={setProjectDescription}
              placeholder="Describe what you need help with..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setDatePickerVisible(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment options */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          
          <View style={styles.paymentOptions}>
            {renderPaymentOption('hourly', 'Hourly Rate', 'Pay based on time spent')}
            {renderPaymentOption('fixed', 'Fixed Price', 'Pay a single agreed price')}
            {renderPaymentOption('quote', 'Request Quote', 'Ask for pricing first')}
          </View>
          
          {paymentType !== 'quote' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {paymentType === 'hourly' ? 'Budget per Hour (RM)' : 'Total Budget (RM)'}
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.currencySymbol}>RM</Text>
                <TextInput 
                  style={styles.budgetInput}
                  value={budget}
                  onChangeText={(text) => setBudget(text.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.helpText}>Add photos to help explain your project</Text>
          
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => setPhotoOptionsVisible(true)}
          >
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
          
          {attachments.length > 0 && (
            <FlatList
              data={attachments}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: item.uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(item.id)}
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.photosList}
            />
          )}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#777" />
          <Text style={styles.privacyText}>
            Your contact details will only be shared with the handyman after you accept their quote.
          </Text>
        </View>

        {/* Submit button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Project</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Modals */}
      {renderDatePickerModal()}
      {renderPhotoOptionsModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  handymanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  handymanImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  handymanInfo: {
    flex: 1,
  },
  handymanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  handymanRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  formSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  required: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  paymentOptions: {
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentOptionDescription: {
    fontSize: 13,
    color: '#777',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  currencySymbol: {
    paddingLeft: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#777',
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  helpText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  addPhotoText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
  },
  photosList: {
    marginTop: 16,
  },
  photoContainer: {
    marginRight: 10,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 152, 219, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  dateOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dateOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateOptionSubtitle: {
    fontSize: 14,
    color: '#777',
  },
});

export default ProjectBidScreen;