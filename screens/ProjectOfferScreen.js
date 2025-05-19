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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Custom color theme as provided
const Colors = {
  primary: '#333333',    // Dark charcoal
  secondary: '#FFD100',  // Bright yellow
  accent: '#4D4D4D',     // Medium gray for accents
  
  // Status colors
  success: '#27AE60',    // Green
  warning: '#F2C94C',    // Yellow
  error: '#EB5757',      // Red
  info: '#2D9CDB',       // Blue
  
  // Text colors
  textDark: '#222222',   // Slightly darker for main text
  textMedium: '#666666', // Medium gray for secondary text
  textLight: '#999999',  // Light gray for tertiary text
  
  // Background colors
  background: '#F8F8F8', // Light gray background
  card: '#FFFFFF',       // White for cards
  
  // Border colors
  border: '#DDDDDD',     // Light gray for borders
  
  // Other UI colors
  inactive: '#E0E0E0',   // Very light gray for inactive elements
  highlight: '#FFF9DD',  // Soft yellow highlight
};

const { width, height } = Dimensions.get('window');

const ProjectOfferScreen = ({ route, navigation }) => {
  const { projectId, project: passedProject, mode = 'negotiate', viewMode = 'handyman' } = route.params || {};
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
  const [errors, setErrors] = useState({});
  
  // Parse the project budget to extract min and max values for initial offer value
  useEffect(() => {
    if (project?.budget) {
      const budgetString = project.budget;
      const match = budgetString.match(/RM(\d+)-RM(\d+)/);
      if (match && match.length === 3) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        // Set default offer to midpoint of range
        const midpoint = Math.round((min + max) / 2);
        setOfferAmount(midpoint.toString());
      }
    }
  }, [project]);
  
  // Fetch project details if not passed
  useEffect(() => {
    if (!passedProject && projectId) {
      // In a real app, this would be an API call to get project details
      setLoading(true);
      // Mock data fetch
      setTimeout(() => {
        const mockProject = {
          id: projectId,
          title: 'Fix Leaking Kitchen Sink',
          description: 'The kitchen sink has been leaking for a week and needs repair.',
          location: 'Kuala Lumpur',
          budget: 'RM120-RM180',
          customerName: 'Sarah Wong',
          customerRating: 4.8,
          postedDate: '2 days ago',
          category: 'Plumbing',
          distance: '3.5 km',
          status: 'open',
          preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          preferredTime: new Date(new Date().setHours(14, 0, 0, 0)), // 2:00 PM
          materials: 'May need new P-trap or seals. Please advise if other materials are required.'
        };
        setProject(mockProject);
        setLoading(false);
      }, 1000);
    }
  }, [projectId, passedProject]);
  
  // Set default duration
  useEffect(() => {
    if (project && !estimatedDuration) {
      setEstimatedDuration('1-2 hours');
    }
  }, [project]);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!offerAmount.trim()) {
      newErrors.offerAmount = 'Required';
    } else if (isNaN(offerAmount) || parseFloat(offerAmount) <= 0) {
      newErrors.offerAmount = 'Enter a valid amount';
    }
    
    if (!estimatedDuration.trim()) {
      newErrors.estimatedDuration = 'Required';
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
    ]).start(() => {
      setTimeout(() => {
        setShowSuccessAnimation(false);
        navigation.navigate('ProjectsTab');
      }, 1000);
    });
  };
  
  // Handle submission of the offer
  const handleSubmitOffer = () => {
    if (validateForm()) {
      // Show confirmation dialog
      Alert.alert(
        "Submit Offer",
        `Are you sure you want to submit this offer of RM${offerAmount}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit",
            onPress: () => {
              // Simulate API call to submit offer
              setSubmitting(true);
              setTimeout(() => {
                setSubmitting(false);
                // Show success message
                animateSuccess();
              }, 1500);
            }
          }
        ]
      );
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
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {mode === 'negotiate' ? 'Make an Offer' : 'Project Offer'}
        </Text>
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
          {/* Project summary */}
          <View style={styles.projectSummary}>
            <View style={styles.projectHeader}>
              <Text style={styles.categoryChip}>{project.category}</Text>
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={14} color={Colors.primary} />
                <Text style={styles.distanceText}>{project.distance}</Text>
              </View>
            </View>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={Colors.primary} />
              <Text style={styles.locationText}>{project.location}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Customer's Budget:</Text>
              <Text style={styles.budgetValue}>{project.budget}</Text>
            </View>
            <View style={styles.scheduleSummary}>
              <View style={styles.scheduleItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.scheduleText}>
                  {formatDate(project.preferredDate)}
                </Text>
              </View>
              <View style={styles.scheduleItem}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={styles.scheduleText}>
                  {formatTime(project.preferredTime)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Offer form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Your Offer</Text>
            
            {/* Price Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Price (RM)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>RM</Text>
                <TextInput
                  style={[
                    styles.priceInput,
                    errors.offerAmount && styles.inputError
                  ]}
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
            </View>
            
            {/* Estimated Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estimated Duration</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.estimatedDuration && styles.inputError
                ]}
                placeholder="e.g. 2-3 hours, 1 day"
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
                returnKeyType="done"
              />
              {errors.estimatedDuration && (
                <Text style={styles.errorText}>{errors.estimatedDuration}</Text>
              )}
            </View>
            
            {/* Materials Included Switch */}
            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Materials Included in Price</Text>
                <Switch
                  value={materialsIncluded}
                  onValueChange={(value) => setMaterialsIncluded(value)}
                  trackColor={{ false: Colors.inactive, true: `${Colors.secondary}80` }}
                  thumbColor={materialsIncluded ? Colors.secondary : '#FAFAFA'}
                  ios_backgroundColor={Colors.inactive}
                />
              </View>
            </View>
            
            {/* Message to Customer */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message to Customer</Text>
              <TextInput
                style={[
                  styles.textArea,
                  errors.message && styles.inputError
                ]}
                placeholder="Explain your offer, when you can start, and any other details..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.message && (
                <Text style={styles.errorText}>{errors.message}</Text>
              )}
            </View>
          </View>
          
          {/* Customer Section */}
          <View style={styles.customerContainer}>
            <View style={styles.customerHeader}>
              <Text style={styles.sectionTitle}>Customer</Text>
            </View>
            <View style={styles.customerInfo}>
              <Image 
                source={{ uri: `https://randomuser.me/api/portraits/${project.customerName.includes('Sarah') || project.customerName.includes('Lily') || project.customerName.includes('Priya') ? 'women' : 'men'}/${parseInt(project.id) + 30}.jpg` }}
                style={styles.customerAvatar}
              />
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{project.customerName}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Text style={styles.ratingText}>{project.customerRating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Informational note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.noteText}>
              The customer will be notified of your offer and can accept, decline, or message you to discuss further.
            </Text>
          </View>
          
          {/* Submit button */}
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitOffer}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit Offer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Space at bottom for keyboard */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      
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
              <Ionicons name="checkmark" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.successText}>Offer Sent!</Text>
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
    backgroundColor: Colors.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  projectSummary: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textMedium,
    marginLeft: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 14,
    color: Colors.textMedium,
    marginRight: 8,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scheduleSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 13,
    color: Colors.textMedium,
    marginLeft: 6,
  },
  formContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
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
  customerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
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
  submitContainer: {
    marginBottom: 24,
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
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