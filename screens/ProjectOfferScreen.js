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
  const [offerAmount, setOfferAmount] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [materialsIncluded, setMaterialsIncluded] = useState(false);
  const [message, setMessage] = useState('');
  const [proposedDate, setProposedDate] = useState(null);
  const [proposedTime, setProposedTime] = useState(null);
  const [errors, setErrors] = useState({});
  const [offerType, setOfferType] = useState('counter'); // 'accept', 'counter', 'negotiate'
  
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
      
      let budgetValue = 100; // Default fallback
      
      // Try different budget field names that might exist
      if (project.initialBudget && typeof project.initialBudget === 'number') {
        budgetValue = project.initialBudget;
      } else if (project.budget) {
        if (typeof project.budget === 'number') {
          budgetValue = project.budget;
        } else if (typeof project.budget === 'string') {
          budgetValue = extractBudgetFromString(project.budget);
        }
      } else if (project.agreedBudget && typeof project.agreedBudget === 'number') {
        budgetValue = project.agreedBudget;
      }
      
      console.log('Extracted budget value:', budgetValue);
      setOfferAmount(budgetValue.toString());
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

  const extractBudgetFromString = (budgetString) => {
    if (!budgetString || typeof budgetString !== 'string') return 100;
    const match = budgetString.match(/RM(\d+)/);
    return match ? parseInt(match[1]) : 100;
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
    
    if (offerType === 'counter' || offerType === 'accept') {
      if (!offerAmount.trim()) {
        newErrors.offerAmount = 'Required';
      } else if (isNaN(offerAmount) || parseFloat(offerAmount) <= 0) {
        newErrors.offerAmount = 'Enter a valid amount';
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
      
      if (offerType === 'negotiate') {
        // Just start a conversation for general negotiation
        await handleStartNegotiation();
      } else {
        // Submit a formal offer (accept or counter)
        await handleSubmitOffer();
      }
      
    } catch (error) {
      console.error('Error submitting:', error);
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartNegotiation = async () => {
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

  const handleSubmitOffer = async () => {
    try {
      // Create offer data
      const offerData = {
        projectId: project.id,
        customerId: project.customerId,
        handymanId: user.id,
        handymanName: user.name,
        handymanAvatar: user.profilePicture,
        amount: parseFloat(offerAmount),
        originalAmount: project.initialBudget || extractBudgetFromString(project.budget),
        estimatedDuration,
        materialsIncluded,
        message: message.trim(),
        proposedDate: proposedDate?.toISOString(),
        proposedTime: proposedTime?.toISOString(),
        offerType, // 'accept' or 'counter'
        projectTitle: project.title,
        projectCategory: project.category,
        projectLocation: project.location
      };
      
      // Submit offer through service
      await offersService.createOffer(offerData);
      
      // Update project status
      const newStatus = offerType === 'accept' ? 'pending_customer_acceptance' : 'has_offers';
      await projectService.updateProject(project.id, {
        status: newStatus,
        lastOfferAt: new Date().toISOString(),
        hasOffers: true
      });
      
      // Start conversation with the offer message
      const conversationId = await chatService.createOrGetConversation(
        user.id,
        project.customerId,
        { id: project.id, title: project.title }
      );
      
      // Send notification message
      const notificationMessage = offerType === 'accept' 
        ? `I'm ready to accept your project "${project.title}" for RM${offerAmount}. Please check my formal offer details.`
        : `I've submitted a counter-offer for your project "${project.title}". Please review the details and let me know your thoughts.`;
        
      await chatService.sendMessage(
        conversationId,
        user.id,
        user.name,
        notificationMessage
      );
      
      animateSuccess();
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        
        Alert.alert(
          offerType === 'accept' ? "✅ Offer Submitted!" : "💬 Counter-Offer Sent!",
          offerType === 'accept' 
            ? "Your acceptance offer has been sent to the customer. They will be notified and can accept or discuss further."
            : "Your counter-offer has been submitted. The customer will review it and get back to you.",
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
          {/* Offer Type Selector */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What would you like to do?</Text>
            <View style={styles.offerTypeContainer}>
              <TouchableOpacity
                style={[styles.offerTypeButton, offerType === 'accept' && styles.selectedOfferType]}
                onPress={() => setOfferType('accept')}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={offerType === 'accept' ? Colors.success : Colors.textLight} 
                />
                <Text style={[styles.offerTypeText, offerType === 'accept' && styles.selectedOfferTypeText]}>
                  Accept as-is
                </Text>
                <Text style={styles.offerTypeSubtext}>
                  Take the job with current terms
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.offerTypeButton, offerType === 'counter' && styles.selectedOfferType]}
                onPress={() => setOfferType('counter')}
              >
                <Ionicons 
                  name="swap-horizontal" 
                  size={24} 
                  color={offerType === 'counter' ? Colors.info : Colors.textLight} 
                />
                <Text style={[styles.offerTypeText, offerType === 'counter' && styles.selectedOfferTypeText]}>
                  Make Counter-Offer
                </Text>
                <Text style={styles.offerTypeSubtext}>
                  Propose different terms
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.offerTypeButton, offerType === 'negotiate' && styles.selectedOfferType]}
                onPress={() => setOfferType('negotiate')}
              >
                <Ionicons 
                  name="chatbubbles" 
                  size={24} 
                  color={offerType === 'negotiate' ? Colors.primary : Colors.textLight} 
                />
                <Text style={[styles.offerTypeText, offerType === 'negotiate' && styles.selectedOfferTypeText]}>
                  Start Discussion
                </Text>
                <Text style={styles.offerTypeSubtext}>
                  Chat about details first
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Project summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Project Summary</Text>
            <View style={styles.projectHeader}>
              <Text style={styles.categoryChip}>{project.category || 'General'}</Text>
              <View style={styles.budgetContainer}>
                <Text style={styles.budgetLabel}>Customer's Budget:</Text>
                <Text style={styles.budgetValue}>
                  {(() => {
                    if (project.initialBudget && typeof project.initialBudget === 'number') {
                      return `RM ${project.initialBudget}`;
                    } else if (project.budget) {
                      if (typeof project.budget === 'number') {
                        return `RM ${project.budget}`;
                      } else if (typeof project.budget === 'string') {
                        return project.budget;
                      }
                    } else if (project.agreedBudget && typeof project.agreedBudget === 'number') {
                      return `RM ${project.agreedBudget}`;
                    }
                    return 'RM 100';
                  })()}
                  {project.isNegotiable && <Text style={styles.negotiableText}> (Negotiable)</Text>}
                </Text>
              </View>
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
          
          {/* Offer Details - Only show for accept/counter */}
          {(offerType === 'accept' || offerType === 'counter') && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {offerType === 'accept' ? 'Confirm Your Acceptance' : 'Your Counter-Offer'}
              </Text>
              
              {/* Price Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Price (RM)</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>RM</Text>
                  <TextInput
                    style={[styles.priceInput, errors.offerAmount && styles.inputError]}
                    placeholder="Enter your price"
                    value={offerAmount}
                    onChangeText={setOfferAmount}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
                {errors.offerAmount && (
                  <Text style={styles.errorText}>{errors.offerAmount}</Text>
                )}
                
                {/* Price comparison */}
                {offerAmount && (
                  <View style={styles.priceComparison}>
                    <Text style={styles.comparisonText}>
                      Customer's budget: {(() => {
                        if (project.initialBudget && typeof project.initialBudget === 'number') {
                          return `RM ${project.initialBudget}`;
                        } else if (project.budget) {
                          if (typeof project.budget === 'number') {
                            return `RM ${project.budget}`;
                          } else if (typeof project.budget === 'string') {
                            return project.budget;
                          }
                        }
                        return 'RM 100';
                      })()}
                    </Text>
                    <Text style={[
                      styles.differenceText,
                      (() => {
                        const customerBudget = project.initialBudget || 
                          extractBudgetFromString(project.budget) || 100;
                        return parseFloat(offerAmount) > customerBudget
                          ? styles.higherPrice : styles.lowerPrice;
                      })()
                    ]}>
                      {(() => {
                        const customerBudget = project.initialBudget || 
                          extractBudgetFromString(project.budget) || 100;
                        const offerValue = parseFloat(offerAmount);
                        
                        if (offerValue > customerBudget) {
                          return `+RM ${(offerValue - customerBudget).toFixed(2)} higher`;
                        } else if (offerValue < customerBudget) {
                          return `-RM ${(customerBudget - offerValue).toFixed(2)} lower`;
                        } else {
                          return 'Same as budget';
                        }
                      })()}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Estimated Duration</Text>
                <TextInput
                  style={[styles.input, errors.estimatedDuration && styles.inputError]}
                  placeholder="e.g. 2-3 hours, 1 day"
                  value={estimatedDuration}
                  onChangeText={setEstimatedDuration}
                  returnKeyType="done"
                />
                {errors.estimatedDuration && (
                  <Text style={styles.errorText}>{errors.estimatedDuration}</Text>
                )}
              </View>
              
              {/* Materials Switch */}
              <View style={styles.inputGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Materials Included in Price</Text>
                  <Switch
                    value={materialsIncluded}
                    onValueChange={setMaterialsIncluded}
                    trackColor={{ false: Colors.inactive, true: `${Colors.secondary}80` }}
                    thumbColor={materialsIncluded ? Colors.secondary : '#FAFAFA'}
                    ios_backgroundColor={Colors.inactive}
                  />
                </View>
              </View>
            </View>
          )}
          
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
                {offerType === 'negotiate' ? 'Start Discussion' : 
                 offerType === 'accept' ? 'Accept Project' : 'Send Counter-Offer'}
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
  }
});

export default ProjectOfferScreen;