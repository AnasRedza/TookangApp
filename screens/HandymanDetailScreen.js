import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const HandymanDetailScreen = ({ route, navigation }) => {
  const { handyman } = route.params || {
    id: '1',
    name: 'Default Handyman',
    profession: 'General',
    rating: 4.5,
    reviews: 0,
    hourlyRate: 0,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    description: 'No description available.',
    categories: [],
    completedJobs: 0,
  };

  // Mock reviews
  const mockReviews = [
    {
      id: '1',
      user: 'Sarah L.',
      rating: 5,
      date: '2025-04-28',
      comment: 'Excellent service! Very professional and completed the job quickly.',
      project: 'Fixed leaking sink',
    },
    {
      id: '2',
      user: 'James T.',
      rating: 4,
      date: '2025-04-15',
      comment: 'Good work overall, but took a little longer than expected.',
      project: 'Installed ceiling fan',
    },
    {
      id: '3',
      user: 'Michelle R.',
      rating: 5,
      date: '2025-04-05',
      comment: 'Fantastic work! Will definitely hire again for future projects.',
      project: 'Repaired bathroom tiles',
    },
  ];

  // Replace the current handleBidProject function in HandymanDetailScreen.js with this:

const handleBidProject = () => {
    Alert.alert(
      'Create Project Bid',
      `Would you like to create a project bid for ${handyman.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create Bid',
          onPress: () => {
            // Navigate to bid creation screen
            navigation.navigate('ProjectBid', { handyman });
          },
        },
      ]
    );
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? Colors.accent : Colors.mediumGray}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <Text style={styles.reviewUserName}>{item.user}</Text>
          <View style={styles.reviewRating}>
            {renderRatingStars(item.rating)}
          </View>
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
      <Text style={styles.reviewProject}>Project: {item.project}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: handyman.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{handyman.name}</Text>
          <Text style={styles.profession}>{handyman.profession}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={Colors.accent} />
            <Text style={styles.rating}>{handyman.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({handyman.reviews} reviews)</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{handyman.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.categories}>
          {handyman.categories && handyman.categories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Hourly Rate</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>RM{handyman.hourlyRate}</Text>
            <Text style={styles.priceUnit}>/hour</Text>
          </View>
          <Text style={styles.priceNote}>
            * Final price may vary based on project complexity and materials needed
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{handyman.completedJobs}</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{handyman.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="chatbubble" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{handyman.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockReviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      <TouchableOpacity
        style={styles.bidButton}
        onPress={handleBidProject}
      >
        <Text style={styles.bidButtonText}>Bid Project with {handyman.name}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerInfo: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profession: {
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: Colors.darkGray,
    marginLeft: 4,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: Colors.lightGray,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
  },
  priceCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 15,
  },
  priceTitle: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.darkGray,
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 10,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 5,
    textAlign: 'center',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  reviewItem: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  reviewUser: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 3,
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  reviewProject: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  bidButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bidButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HandymanDetailScreen;