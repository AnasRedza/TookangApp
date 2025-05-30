// Enhanced ProjectOfferScreen.js - Complete Handyman Negotiation Flow
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Switch,
  Image,
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { offersService } from '../services/offersService';
import { chatService } from '../services/chatService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const ProjectOfferScreen = ({ route, navigation }) => {
  const { 
    projectId, 
    project: passedProject, 
    mode = 'negotiate', 
    viewMode = 'handyman',
    handyman: passedHandyman 
  } = route.params || {};
  
  const { user, isHandyman } = useAuth();
  const [project, setProject] = useState(passedProject);
  const [loading, setLoading] = useState(!passedProject);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const successScale = useState(new Animated.Value(0))[0];
  
  // State for offer details
  const [depositAmount, setDepositAmount] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [message, setMessage] = useState('');
  const [proposedDate, setProposedDate] = useState(null);
  const [proposedTime, setProposedTime] = useState(null);
  const [errors, setErrors] = useState({});
  const [offerType, setOfferType] = useState('negotiate');
  
  // Parse the project budget to extract values for initial offer
  useEffect(() => {
    if (project) {
      console.log('Project data in ProjectOfferScreen:', {
        id: project.id,
        title: project.title,
        budget: project.budget,
        initialBudget: project.initialBudget,
        agreedBudget: project.agreedBudget,
        preferredDate: project.preferredDate,
        preferredTime: project.preferredTime,
        location: project.location
      });
      
   
    }
    
    // Set proposed date/time from project preferences
    if (project?.preferredDate) {
      try {
        let dateValue;
        if (typeof project.preferredDate === 'string') {
          dateValue = new Date(project.preferredDate);
        } else if (project.preferredDate && typeof project.preferredDate === 'object' && project.preferredDate.toDate) {
          // Handle Firestore Timestamp
          dateValue = project.preferredDate.toDate();
        } else if (project.preferredDate instanceof Date) {
          dateValue = project.preferredDate;
        }
        
        if (dateValue && !isNaN(dateValue.getTime())) {
          setProposedDate(dateValue);
        } else {
          console.warn('Invalid preferredDate:', project.preferredDate);
          setProposedDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days from now
        }
      } catch (error) {
        console.error('Error setting proposed date:', error);
        setProposedDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days from now
      }
    }
    
    if (project?.preferredTime) {
      try {
        let timeValue;
        if (typeof project.preferredTime === 'string') {
          // If it's a time preference string like 'morning', keep it as is
          if (['morning', 'afternoon', 'evening'].includes(project.preferredTime.toLowerCase())) {
            // Don't set a specific time for these preferences
            return;
          } else {
            timeValue = new Date(project.preferredTime);
          }
        } else if (project.preferredTime && typeof project.preferredTime === 'object' && project.preferredTime.toDate) {
          // Handle Firestore Timestamp
          timeValue = project.preferredTime.toDate();
        } else if (project.preferredTime instanceof Date) {
          timeValue = project.preferredTime;
        }
        
        if (timeValue && !isNaN(timeValue.getTime())) {
          setProposedTime(timeValue);
        } else {
          console.warn('Invalid preferredTime:', project.preferredTime);
          // Set default time to 12:00 PM
          const defaultTime = new Date();
          defaultTime.setHours(12, 0, 0, 0);
          setProposedTime(defaultTime);
        }
      } catch (error) {
        console.error('Error setting proposed time:', error);
        // Set default time to 12:00 PM
        const defaultTime = new Date();
        defaultTime.setHours(12, 0, 0, 0);
        setProposedTime(defaultTime);
      }
    }
    
    // Set default message based on mode
    if (mode === 'negotiate' && project?.title) {
      setMessage(`Hi! I'm interested in your "${project.title}" project. I'd like to discuss the details and see if we can work together.`);
    }
  }, [project, mode]);
  
  // Fetch project details if not passed
  useEffect(() => {
    if (!passedProject && projectId) {
      fetchProjectData();
    } else if (passedProject) {
      console.log('Project data received:', passedProject);
    }
  }, [projectId, passedProject]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      console.log('Fetching project data for ID:', projectId);
      const projectData = await projectService.getProjectById(projectId);
      if (projectData) {
        console.log('Fetched project data:', projectData);
        setProject(projectData);
      } else {
        console.error('Project not found for ID:', projectId);
        Alert.alert('Error', 'Project not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      Alert.alert('Error', 'Failed to load project details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

 
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Not specified';
    
    try {
      let dateObj = date;
      
      // Handle different date formats
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && date.toDate) {
        // Handle Firestore Timestamp
        dateObj = date.toDate();
      }
      
      // Check if date is valid
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Not specified';
      }
      
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return dateObj.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Not specified';
    }
  };
  
  // Format time for display
  const formatTime = (time) => {
    if (!time) return 'Flexible';
    
    try {
      let timeObj = time;
      
      // Handle different time formats
      if (typeof time === 'string') {
        timeObj = new Date(time);
      } else if (time && typeof time === 'object' && time.toDate) {
        // Handle Firestore Timestamp
        timeObj = time.toDate();
      }
      
      // Check if it's a valid date object
      if (timeObj && !isNaN(timeObj.getTime())) {
        return timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle string time preferences
      if (typeof time === 'string') {
        switch(time.toLowerCase()) {
          case 'morning': return 'Morning (8am - 12pm)';
          case 'afternoon': return 'Afternoon (12pm - 5pm)';
          case 'evening': return 'Evening (5pm - 8pm)';
          default: return 'Anytime';
        }
      }
      
      return 'Flexible';
    } catch (error) {
      console.error('Error formatting time:', error, time);
      return 'Flexible';
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (offerType === 'accept') {
      if (!depositAmount.trim()) {
        newErrors.depositAmount = 'Required';
      } else if (isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
        newErrors.depositAmount = 'Enter a valid amount';
      }
      
      if (!estimatedDuration.trim()) {
        newErrors.estimatedDuration = 'Required';
      }
    }
    
    if (!message.trim()) {
      newErrors.message = 'Required';
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
  };

  // Handle submission of the offer/negotiation
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    setSubmitting(true);
    
    if (offerType === 'accept') {
      // Direct project acceptance with deposit
      await handleDirectAcceptance();
    } else {
        console.log('🔍 Calling handleStartNegotiation');
      // Just start a conversation for negotiation
      await handleStartNegotiation();
    }
    
  } catch (error) {
    console.error('Error submitting:', error);
    Alert.alert('Error', 'Failed to submit. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

const handleDirectAcceptance = async () => {
  try {
    // Update project directly with acceptance and deposit
    await projectService.updateProject(project.id, {
      status: 'awaiting_payment', // Changed from 'accepted' to 'awaiting_payment'
      handymanId: user.id,
      handymanName: user.name,
      handymanAvatar: user.profilePicture,
      depositAmount: parseFloat(depositAmount),
      depositRequested: true,
      estimatedDuration: estimatedDuration,
      acceptedAt: new Date().toISOString()
    });
    
    animateSuccess();
    
    setTimeout(() => {
      setShowSuccessAnimation(false);
      
      Alert.alert(
        "✅ Project Accepted!",
        `You've accepted "${project.title}" and requested a deposit of RM${parseFloat(depositAmount).toFixed(2)}. The customer will be notified and can proceed with payment.`,
        [
          {
            text: "View My Jobs",
            onPress: () => navigation.navigate('ProjectsTab', { screen: 'MyProjects' })
          },
          {
            text: "Continue Browsing",
            onPress: () => navigation.navigate('HomeTab', { screen: 'HandymanHome' }),
            style: "cancel"
          }
        ]
      );
    }, 1500);
    
  } catch (error) {
    throw error;
  }
};

  const handleStartNegotiation = async () => {

      console.log('🔍 handleStartNegotiation called');
  console.log('🔍 project:', project);
  console.log('🔍 message:', message);
    try {
      // Create or get conversation
      const conversationId = await chatService.createOrGetConversation(
        user.id,
        project.customerId,
        { id: project.id, title: project.title }
      );
      
      // Send initial message
      await chatService.sendMessage(
        conversationId,
        user.id,
        user.name,
        message
      );
      
      // Update project status to indicate negotiation has started
      await projectService.updateProject(project.id, {
        status: 'in_negotiation',
        negotiatingHandymanId: user.id,
        negotiatingHandymanName: user.name,
        negotiationStartedAt: new Date().toISOString()
      });
      
      animateSuccess();
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        // Navigate to chat
        navigation.navigate('ChatTab', {
          screen: 'Chat',
          params: {
            conversationId,
            recipient: {
              id: project.customerId,
              name: project.customerName || project.customer?.name,
              avatar: getUserAvatarUri(project.customer),
              role: 'customer'
            },
            projectId: project.id,
            projectTitle: project.title
          }
        });
      }, 1500);
      
    } catch (error) {
      throw error;
    }
  };


  
  // Show loading if needed
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading project details...</Text>
      </View>
    );
  }
  
  if (!project) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Project not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {offerType === 'accept' ? 'Accept Project' : offerType === 'counter' ? 'Make Counter-Offer' : 'Negotiate Project'}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
         {/* Project Discussion */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Start Discussion</Text>
            <View style={styles.discussionInfo}>
              <Ionicons name="chatbubbles" size={32} color={Colors.primary} />
              <Text style={styles.discussionText}>
                You can discuss project details, timeline, and any questions with the customer before proceeding.
              </Text>
            </View>
          </View>
          {/* Project summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Project Summary</Text>
            <View style={styles.projectHeader}>
              <Text style={styles.categoryChip}>{project.category || 'General'}</Text>
            </View>
            <Text style={styles.projectTitle}>{project.title || 'Untitled Project'}</Text>
            <Text style={styles.projectDescription} numberOfLines={3}>
              {project.description || 'No description available'}
            </Text>
            <View style={styles.projectDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailText}>{project.location || 'Location not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailText}>
                  {formatDate(project.preferredDate || proposedDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailText}>
                  {formatTime(project.preferredTime || proposedTime)}
                </Text>
              </View>
            </View>
          </View>
          
          
          {/* Message Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {offerType === 'negotiate' ? 'Your Message' : 'Message to Customer'}
            </Text>
            <TextInput
              style={[styles.textArea, errors.message && styles.inputError]}
              placeholder={
                offerType === 'negotiate' 
                  ? "Start the conversation... Ask questions about the project, availability, or specific requirements."
                  : offerType === 'accept'
                  ? "Let them know you're ready to start and any important details..."
                  : "Explain your counter-offer and why you think it's fair..."
              }
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            {errors.message && (
              <Text style={styles.errorText}>{errors.message}</Text>
            )}
          </View>
          
          {/* Customer Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer</Text>
            <View style={styles.customerInfo}>
              <Image 
                source={{ uri: getUserAvatarUri(project.customer) }}
                style={styles.customerAvatar}
              />
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>
                  {project.customerName || project.customer?.name || 'Customer'}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Text style={styles.ratingText}>
                    {(project.customerRating || project.customer?.rating || 4.5).toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Info Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.noteText}>
              {offerType === 'negotiate' 
                ? "Starting a discussion allows you to understand the project better before making a formal offer."
                : offerType === 'accept'
                ? "By accepting, you commit to completing the work as described. The customer will be notified immediately."
                : "Your counter-offer will be sent to the customer for review. They can accept, decline, or discuss further."
              }
            </Text>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Submit button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons 
                name={
                  offerType === 'negotiate' ? "chatbubbles" : 
                  offerType === 'accept' ? "checkmark" : "send"
                } 
                size={18} 
                color="#FFFFFF" 
              />
            <Text style={styles.submitButtonText}>
            Start Discussion
          </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
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
              <Ionicons 
                name={offerType === 'negotiate' ? "chatbubbles" : "checkmark"} 
                size={60} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={styles.successText}>
              {offerType === 'negotiate' ? 'Discussion Started!' : 
               offerType === 'accept' ? 'Project Accepted!' : 'Counter-Offer Sent!'}
            </Text>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textMedium,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  
  // Offer Type Selector
  offerTypeContainer: {
    gap: 12,
  },
  offerTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedOfferType: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
  },
  offerTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMedium,
    marginLeft: 12,
    flex: 1,
  },
  selectedOfferTypeText: {
    color: Colors.textDark,
  },
  offerTypeSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    position: 'absolute',
    bottom: 8,
    left: 48,
  },
  
  // Project Summary
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryChip: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  budgetContainer: {
    alignItems: 'flex-end',
  },
  budgetLabel: {
    fontSize: 12,
    color: Colors.textMedium,
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
  },
  negotiableText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.textMedium,
    lineHeight: 20,
    marginBottom: 16,
  },
  projectDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: Colors.textMedium,
    marginLeft: 8,
    fontWeight: '500',
  },
  
  // Form inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textDark,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  currencySymbol: {
    fontSize: 16,
    color: Colors.textMedium,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    fontSize: 16,
    color: Colors.textDark,
  },
  priceComparison: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.highlight,
    borderRadius: 6,
  },
  comparisonText: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 4,
  },
  differenceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  higherPrice: {
    color: Colors.warning,
  },
  lowerPrice: {
    color: Colors.success,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    color: Colors.textDark,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: Colors.textDark,
  },
  
  // Customer Info
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textMedium,
    marginLeft: 4,
  },
  
  // Info Note
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(45, 156, 219, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 14,
    color: Colors.textMedium,
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  
  // Submit Button
  submitContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: Colors.inactive,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Success Animation
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
  },
  inputSubLabel: {
  fontSize: 13,
  color: Colors.textLight,
  marginBottom: 8,
  lineHeight: 18,
  },
  noteBox: {
  flexDirection: 'row',
  backgroundColor: 'rgba(45, 156, 219, 0.1)',
  borderRadius: 8,
  padding: 12,
  alignItems: 'flex-start',
  },
  discussionInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  backgroundColor: Colors.highlight,
  borderRadius: 8,
},
discussionText: {
  flex: 1,
  marginLeft: 16,
  fontSize: 15,
  color: Colors.textDark,
  lineHeight: 20,
},
});

export default ProjectOfferScreen;