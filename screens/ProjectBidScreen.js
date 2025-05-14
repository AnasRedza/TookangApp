import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ProjectBidScreen = ({ route, navigation }) => {
  // Get handyman data from route params
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
  
  // State variables
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [attachments, setAttachments] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('hourly');
  
  // Modal visibility states
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [imageOptionsVisible, setImageOptionsVisible] = useState(false);
  
  // Payment options
  const paymentOptions = [
    { id: 'hourly', name: 'Hourly Rate', description: 'Pay based on the time spent' },
    { id: 'fixed', name: 'Fixed Price', description: 'Pay a single agreed price' },
    { id: 'quote', name: 'Request Quote', description: 'Ask for pricing first' }
  ];
  
  // Format date for display
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Handle date selection from custom date picker
  const handleDateSelection = (daysToAdd = 0) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysToAdd);
    setStartDate(newDate);
    setDatePickerVisible(false);
  };
  
  // Mock function to add attachment (in a real app, this would use the device's camera/gallery)
  const addAttachment = (source) => {
    setImageOptionsVisible(false);
    
    // In a real app, this would use a library like react-native-image-picker
    // For now, we'll just mock adding an image
    const mockImageUrls = [
      'https://images.unsplash.com/photo-1581783898377-1c85bf937427',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a'
    ];
    
    const newAttachment = {
      id: Date.now().toString(),
      uri: mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)],
      type: 'image',
      name: `Photo ${attachments.length + 1}`
    };
    
    setAttachments([...attachments, newAttachment]);
    
    // Simulate successful image selection
    setTimeout(() => {
      Alert.alert(
        "Photo Added",
        source === 'camera' ? "Photo captured successfully" : "Photo selected from gallery"
      );
    }, 500);
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter(item => item.id !== id));
  };
  
  // Submit project bid
  const handleSubmitBid = () => {
    // Validate inputs
    if (!projectTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a project title.');
      return;
    }
    
    if (!projectDescription.trim()) {
      Alert.alert('Missing Information', 'Please describe your project.');
      return;
    }
    
    if (selectedPaymentMethod !== 'quote' && !budget.trim()) {
      Alert.alert('Missing Information', 'Please enter your budget.');
      return;
    }
    
    // Format the bid data for submission
    const bidData = {
      projectTitle,
      projectDescription,
      budget: selectedPaymentMethod === 'quote' ? null : parseFloat(budget),
      paymentMethod: selectedPaymentMethod,
      startDate: startDate.toISOString(),
      isUrgent,
      attachments,
      handymanId: handyman.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // In a real app, this would submit the bid to the API
    console.log("Submitting bid:", bidData);
    
    Alert.alert(
      'Bid Submitted Successfully',
      'Your project has been sent to the handyman. You can track its status in "My Projects".',
      [
        {
          text: 'Go to My Projects',
          onPress: () => navigation.navigate('MyProjects')
        },
        {
          text: 'Stay Here',
          style: 'cancel'
        }
      ]
    );
  };
  
  // Render payment method option
  const renderPaymentOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.paymentOption,
        selectedPaymentMethod === option.id && styles.selectedPaymentOption
      ]}
      onPress={() => setSelectedPaymentMethod(option.id)}
    >
      <View style={styles.paymentOptionContent}>
        <View style={styles.radioButton}>
          {selectedPaymentMethod === option.id && (
            <View style={styles.radioButtonSelected} />
          )}
        </View>
        <View style={styles.paymentOptionInfo}>
          <Text style={styles.paymentOptionTitle}>{option.name}</Text>
          <Text style={styles.paymentOptionDescription}>{option.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Custom date picker modal
  const renderDatePickerModal = () => (
    <Modal
      visible={datePickerVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setDatePickerVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setDatePickerVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Start Date</Text>
              <TouchableOpacity 
                onPress={() => setDatePickerVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateSelection(0)}
            >
              <Text style={styles.dateOptionText}>Today</Text>
              <Text style={styles.dateOptionDate}>{formatDate(new Date())}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateSelection(1)}
            >
              <Text style={styles.dateOptionText}>Tomorrow</Text>
              {(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return <Text style={styles.dateOptionDate}>{formatDate(tomorrow)}</Text>;
              })()}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateSelection(2)}
            >
              <Text style={styles.dateOptionText}>In 2 days</Text>
              {(() => {
                const twoDays = new Date();
                twoDays.setDate(twoDays.getDate() + 2);
                return <Text style={styles.dateOptionDate}>{formatDate(twoDays)}</Text>;
              })()}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateSelection(7)}
            >
              <Text style={styles.dateOptionText}>Next week</Text>
              {(() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return <Text style={styles.dateOptionDate}>{formatDate(nextWeek)}</Text>;
              })()}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateSelection(14)}
            >
              <Text style={styles.dateOptionText}>In two weeks</Text>
              {(() => {
                const twoWeeks = new Date();
                twoWeeks.setDate(twoWeeks.getDate() + 14);
                return <Text style={styles.dateOptionDate}>{formatDate(twoWeeks)}</Text>;
              })()}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateSelection(30)}
            >
              <Text style={styles.dateOptionText}>In a month</Text>
              {(() => {
                const month = new Date();
                month.setDate(month.getDate() + 30);
                return <Text style={styles.dateOptionDate}>{formatDate(month)}</Text>;
              })()}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
  
  // Image options modal
  const renderImageOptionsModal = () => (
    <Modal
      visible={imageOptionsVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setImageOptionsVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setImageOptionsVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Photo</Text>
              <TouchableOpacity 
                onPress={() => setImageOptionsVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => addAttachment('camera')}
            >
              <Ionicons name="camera-outline" size={24} color={Colors.primary} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => addAttachment('gallery')}
            >
              <Ionicons name="images-outline" size={24} color={Colors.primary} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Handyman Info */}
        <View style={styles.handymanInfo}>
          <Image 
            source={{ uri: handyman.profilePicture }} 
            style={styles.handymanImage} 
          />
          <View style={styles.handymanDetails}>
            <Text style={styles.handymanName}>{handyman.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{handyman.rating} ({handyman.totalReviews} reviews)</Text>
            </View>
          </View>
          <View style={styles.handymanRateContainer}>
            <Text style={styles.rateLabel}>Rate</Text>
            <Text style={styles.rate}>${handyman.hourlyRate}/hr</Text>
          </View>
        </View>
        
        {/* Project Information Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          
          <Text style={styles.label}>Project Title <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={projectTitle}
              onChangeText={setProjectTitle}
              placeholder="E.g., Bathroom sink repair"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <Text style={styles.label}>Project Description <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={projectDescription}
              onChangeText={setProjectDescription}
              placeholder="Describe your project in detail. Include information about the task, location, and any specific requirements."
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          
          {/* Payment Method Selection */}
          <Text style={styles.label}>Payment Method <Text style={styles.required}>*</Text></Text>
          <View style={styles.paymentOptionsContainer}>
            {paymentOptions.map(renderPaymentOption)}
          </View>
          
          {/* Budget Input (conditional) */}
          {selectedPaymentMethod !== 'quote' && (
            <>
              <Text style={styles.label}>
                {selectedPaymentMethod === 'hourly' ? 'Budget per Hour (USD)' : 'Total Budget (USD)'} 
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={budget}
                  onChangeText={text => setBudget(text.replace(/[^0-9.]/g, ''))}
                  placeholder="Enter amount"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="decimal-pad"
                />
              </View>
            </>
          )}
          
          <Text style={styles.label}>Preferred Start Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Mark as Urgent</Text>
              <Text style={styles.switchSubtext}>Prioritize your project in the handyman's queue</Text>
            </View>
            <Switch
              value={isUrgent}
              onValueChange={setIsUrgent}
              trackColor={{ false: '#D1D1D1', true: Colors.primary }}
              thumbColor="#FFF"
              ios_backgroundColor="#D1D1D1"
            />
          </View>
        </View>
        
        {/* Attachments Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            <Text style={styles.optionalText}>(Optional)</Text>
          </View>
          <Text style={styles.helperText}>Add photos to help explain your project</Text>
          
          <TouchableOpacity 
            style={styles.attachmentButton} 
            onPress={() => setImageOptionsVisible(true)}
          >
            <Ionicons name="camera-outline" size={22} color={Colors.primary} />
            <Text style={styles.attachmentButtonText}>Add Photos</Text>
          </TouchableOpacity>
          
          {attachments.length > 0 && (
            <View style={styles.attachmentList}>
              <FlatList
                data={attachments}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.attachmentItem}>
                    <Image source={{ uri: item.uri }} style={styles.attachmentImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeAttachment(item.id)}
                    >
                      <Ionicons name="close-circle" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={styles.attachmentListContent}
              />
            </View>
          )}
        </View>
        
        {/* Privacy notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.darkGray} />
          <Text style={styles.privacyText}>
            Your contact information will only be shared with the handyman after you accept their quote.
          </Text>
        </View>
        
        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitBid}
        >
          <Text style={styles.submitButtonText}>Submit Project</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Render Modals */}
      {renderDatePickerModal()}
      {renderImageOptionsModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  handymanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  handymanImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  handymanDetails: {
    flex: 1,
  },
  handymanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.darkGray,
    marginLeft: 4,
  },
  handymanRateContainer: {
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  rate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  formSection: {
    marginTop: 15,
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionalText: {
    fontSize: 14,
    color: Colors.darkGray,
    marginLeft: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  inputContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 15,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  textAreaContainer: {
    minHeight: 120,
  },
  textArea: {
    height: 120,
  },
  paymentOptionsContainer: {
    marginBottom: 15,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
  },
  selectedPaymentOption: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  paymentOptionDescription: {
    fontSize: 13,
    color: Colors.darkGray,
    marginTop: 2,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darkGray,
    paddingLeft: 12,
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 15,
    color: Colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  switchSubtext: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 2,
  },
  helperText: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 15,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FC',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    marginBottom: 15,
  },
  attachmentButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  attachmentList: {
    marginBottom: 10,
  },
  attachmentListContent: {
    paddingVertical: 5,
  },
  attachmentItem: {
    marginRight: 12,
    position: 'relative',
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  privacyNotice: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#F0F7FC',
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: Colors.darkGray,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 20,
    marginHorizontal: 15,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 15,
  },
  dateOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateOptionText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  dateOptionDate: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 4,
  },
});

// Default colors (assuming these exist in your Colors constant)
if (!Colors) {
  const Colors = {
    primary: '#3498db',
    text: '#333333',
    darkGray: '#777777',
    white: '#FFFFFF',
    black: '#000000'
  };
}

export default ProjectBidScreen;