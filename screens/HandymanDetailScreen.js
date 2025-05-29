import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../services/userService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';
// ADD this import under the existing imports:
import { reviewService } from '../services/reviewService';

const HandymanDetailScreen = ({ route, navigation }) => {
  const { handyman: initialHandyman } = route.params || {};
  const [handyman, setHandyman] = useState(initialHandyman);
  const [isLoading, setIsLoading] = useState(!initialHandyman);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (initialHandyman?.id) {
      loadHandymanDetails();
    }
  }, [initialHandyman]);

// REPLACE the loadHandymanDetails function with this:
const loadHandymanDetails = async () => {
  if (!initialHandyman?.id) return;

  try {
    setIsLoading(true);
    const handymanData = await userService.getUserById(initialHandyman.id);
    if (handymanData) {
      setHandyman(handymanData);
    }
    
    // Load real reviews from Firebase
    const reviewsData = await reviewService.getUserReviews(initialHandyman.id, 5);
    setReviews(reviewsData);
    
  } catch (error) {
    console.error('Error loading handyman details:', error);
    Alert.alert('Error', 'Failed to load handyman details');
  } finally {
    setIsLoading(false);
  }
};

  const handleHireNow = () => {
    navigation.navigate('ProjectBid', { handyman });
  };

  const handleMessage = () => {
    try {
      navigation.navigate('ChatTab', { 
        screen: 'Chat', 
        params: { recipient: handyman }
      });
    } catch (error) {
      console.log('Chat navigation error:', error);
      Alert.alert('Error', 'Chat feature is not available at the moment.');
    }
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(i => (
          <Ionicons 
            key={i} 
            name={i <= fullStars ? "star" : (i === fullStars + 1 && halfStar ? "star-half" : "star-outline")} 
            size={16} 
            color="#FFD700" 
            style={{marginRight: 2}} 
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading handyman details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!handyman) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Handyman not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ 
              uri: getUserAvatarUri(handyman)
            }} 
            style={styles.profileImage} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{handyman.name}</Text>
            {handyman.serviceCategories && handyman.serviceCategories.length > 0 && (
              <Text style={styles.profession}>{handyman.serviceCategories[0]}</Text>
            )}
            {handyman.location && (
              <Text style={styles.location}>{handyman.location}</Text>
            )}
            {renderRatingStars(handyman.rating || 0)}
            <Text style={styles.reviewCount}>
              {handyman.reviewCount || 0} review{(handyman.reviewCount || 0) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.hireButton} onPress={handleHireNow}>
            <Ionicons name="hammer-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Hire Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Professional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          
          {handyman.experience && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue}>
                {handyman.experience} year{handyman.experience !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {handyman.hourlyRate && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Hourly Rate</Text>
              <Text style={styles.detailValue}>RM {handyman.hourlyRate}</Text>
            </View>
          )}

          {handyman.completedJobs && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Jobs Completed</Text>
              <Text style={styles.detailValue}>{handyman.completedJobs}</Text>
            </View>
          )}
        </View>

        {/* Service Categories */}
        {handyman.serviceCategories && handyman.serviceCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <View style={styles.categoriesContainer}>
              {handyman.serviceCategories.map((category, index) => (
                <View key={index} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* About Section */}
        {handyman.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text 
              style={styles.descriptionText} 
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {handyman.bio}
            </Text>
            {handyman.bio.length > 100 && (
              <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Read less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          
          {reviews.length > 0 ? (
            <>
    {reviews.map(review => (
      <View key={review.id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>{review.reviewerName}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons 
              key={i} 
              name={i <= review.rating ? "star" : "star-outline"} 
              size={14} 
              color="#FFD700" 
              style={{marginRight: 2}} 
            />
          ))}
        </View>
        
        <Text style={styles.reviewText}>{review.reviewText}</Text>
        
        {/* Show selected tags if they exist */}
        {review.selectedTags && review.selectedTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {review.selectedTags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    ))}
                  
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Reviews</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noReviews}>
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMedium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  profileInfo: {
    marginLeft: 15,
    justifyContent: 'center',
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profession: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 5,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999999',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginBottom: 10,
  },
  hireButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  messageButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
  readMoreText: {
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 5,
  },
  reviewCard: {
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999999',
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 5,
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#999999',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  }
});

export default HandymanDetailScreen;