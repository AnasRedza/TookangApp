import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const ReviewScreen = ({ route, navigation }) => {
  // Get params passed from MyProjectsScreen
  const { project, userToReview, userType, onReviewSubmitted } = route.params;
  
  // Get current user info from Auth context
  const { user, isHandyman } = useAuth();
  
  // Basic state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // IMPORTANT: In this application, the userType parameter is:
  // 'customer' when a handyman is reviewing a customer
  // 'handyman' when a customer is reviewing a handyman
  
  // Tags for reviewing a handyman (when userType is 'handyman')
  const handymanReviewTags = [
    { id: 1, label: 'Professional', selected: false },
    { id: 2, label: 'On Time', selected: false },
    { id: 3, label: 'Quality Work', selected: false },
    { id: 4, label: 'Fair Price', selected: false },
    { id: 5, label: 'Clean', selected: false },
    { id: 6, label: 'Good Communication', selected: false },
    { id: 7, label: 'Skilled', selected: false }
  ];
  
  // Tags for reviewing a customer (when userType is 'customer')
  const customerReviewTags = [
    { id: 1, label: 'Clear Instructions', selected: false },
    { id: 2, label: 'Respectful', selected: false },
    { id: 3, label: 'Prompt Payment', selected: false },
    { id: 4, label: 'Reasonable Expectations', selected: false },
    { id: 5, label: 'Good Communication', selected: false },
    { id: 6, label: 'Prepared Site', selected: false },
    { id: 7, label: 'Friendly', selected: false }
  ];
  
  // Select tags based on userType parameter
  // userType is 'customer' when reviewing a customer
  // userType is 'handyman' when reviewing a handyman
  const [tags, setTags] = useState(userType === 'customer' ? customerReviewTags : handymanReviewTags);
  
  // Toggle tag selection
  const toggleTag = (id) => {
    setTags(tags.map(tag => 
      tag.id === id ? { ...tag, selected: !tag.selected } : tag
    ));
  };
  
  // Get the person being reviewed based on userType parameter
  const getPersonBeingReviewed = () => {
    if (userType === 'customer') {
      // Reviewing a customer (handyman is reviewing customer)
      return {
        name: project.customer.name,
        avatar: project.customer.avatar,
        role: 'Customer',
        id: project.customer.id
      };
    } else {
      // Reviewing a handyman (customer is reviewing handyman)
      return {
        name: project.handyman.name,
        avatar: project.handyman.avatar,
        role: 'Handyman',
        rating: project.handyman.rating,
        id: project.handyman.id
      };
    }
  };
  
  const reviewee = getPersonBeingReviewed();
  
  // Handle review submission
  const handleSubmitReview = () => {
    // Validation
    if (reviewText.trim().length < 5) {
      Alert.alert(
        "Review Too Short", 
        "Please provide more details in your review.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    // Create review data
    const reviewData = {
      rating,
      reviewText,
      selectedTags: tags.filter(tag => tag.selected).map(tag => tag.label),
      reviewerType: userType === 'customer' ? 'handyman' : 'customer', // Invert to get actual reviewer type
      revieweeType: userType, // This is already the type being reviewed
      projectId: project.id,
      reviewedAt: new Date().toISOString()
    };
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      if (onReviewSubmitted) {
        onReviewSubmitted(reviewData);
      }
      
      Alert.alert(
        "Review Submitted", 
        "Thank you for your feedback!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };
  
  // Render star rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={36}
            color={i <= rating ? "#FFC107" : "#CCCCCC"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Header with role-specific title */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Review {reviewee.role}
            </Text>
            <Text style={styles.headerSubtitle}>
              Your feedback helps build trust in our community
            </Text>
          </View>
          
          {/* Person being reviewed */}
          <View style={styles.userCard}>
            <Image 
              source={{ uri: reviewee.avatar }} 
              style={styles.userAvatar} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{reviewee.name}</Text>
              <Text style={styles.userRole}>{reviewee.role}</Text>
              
              {/* Show existing rating only for handymen */}
              {userType === 'handyman' && reviewee.rating && (
                <View style={styles.existingRating}>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Text style={styles.existingRatingText}>
                    {reviewee.rating} Rating
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Project info */}
          <View style={styles.projectCard}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectCategory}>{project.category}</Text>
            <View style={styles.projectBudget}>
              <Text style={styles.projectBudgetLabel}>
                {isHandyman ? 'Earnings:' : 'Budget:'}
              </Text>
              <Text style={styles.projectBudgetValue}>
                RM {parseFloat(project.adjustedBudget || project.agreedBudget || project.initialBudget).toFixed(2)}
              </Text>
            </View>
            
            {/* Show completion date if available */}
            {project.completedAt && (
              <View style={styles.completionDate}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.completionText}>
                  Completed on {new Date(project.completedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          
          {/* Rating section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>
              Rate your experience with {reviewee.name}
            </Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          </View>
          
          {/* Tags section */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>
              What did you like about {userType === 'customer' ? 'this customer' : 'the service'}?
            </Text>
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    tag.selected && styles.tagChipSelected
                  ]}
                  onPress={() => toggleTag(tag.id)}
                >
                  <Text style={[
                    styles.tagText,
                    tag.selected && styles.tagTextSelected
                  ]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Review text */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Write your review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder={userType === 'customer' 
                ? "How was your experience with this customer? Were they clear and reasonable?"
                : "How was the quality of work? Was the handyman professional?"
              }
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={reviewText}
              onChangeText={setReviewText}
            />
          </View>
          
          {/* Submit button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  existingRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  existingRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
  },
  projectBudget: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectBudgetLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  projectBudgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  completionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  completionText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.success,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starContainer: {
    marginHorizontal: 6,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  tagChipSelected: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    minHeight: 120,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.primary + '80',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }
});

export default ReviewScreen;