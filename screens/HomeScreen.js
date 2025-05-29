import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../services/userService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';
// ADD this import:
import { reviewService } from '../services/reviewService';

// Updated categories - only 5 as requested
const CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: 'water-outline' },
  { id: '2', name: 'Electrical', icon: 'flash-outline' },
  { id: '3', name: 'Painting', icon: 'color-palette-outline' },
  { id: '4', name: 'Cleaning', icon: 'sparkles-outline' },
  { id: '5', name: 'Others', icon: 'apps-outline' }
];

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [handymen, setHandymen] = useState([]);
  const [allHandymen, setAllHandymen] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Load handymen data on component mount
  useEffect(() => {
    loadHandymen();
  }, []);
  
  // Filter handymen when category changes
  useEffect(() => {
    filterHandymenByCategory();
  }, [selectedCategory, allHandymen]);

// REPLACE the loadHandymen function with this:
const loadHandymen = async () => {
  try {
    setError(null);
    console.log('🔍 Loading handymen...');
    const handymenData = await userService.getTopRatedHandymen(20);
    
    // Enrich with real review data
    const enrichedHandymen = await Promise.all(
      handymenData.map(async (handyman) => {
        try {
          const reviewStats = await reviewService.getUserReviewStats(handyman.id);
          return {
            ...handyman,
            rating: reviewStats.averageRating || 0,
            reviewCount: reviewStats.totalReviews || 0
          };
        } catch (error) {
          console.error('Error getting review stats for handyman:', handyman.id, error);
          return handyman;
        }
      })
    );
    
    console.log('📊 Handymen loaded:', enrichedHandymen.length);
    setAllHandymen(enrichedHandymen);
    setHandymen(enrichedHandymen);
  } catch (error) {
    console.error('❌ Error loading handymen:', error);
    setError('Failed to load handymen. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHandymen();
    setRefreshing(false);
  };

  const filterHandymenByCategory = () => {
    if (!selectedCategory) {
      setHandymen(allHandymen);
      return;
    }

    const category = CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) {
      setHandymen(allHandymen);
      return;
    }

    if (category.name === 'Others') {
      // For 'Others' category, show handymen with categories not in the main list
      const mainCategories = ['Plumbing', 'Electrical', 'Painting', 'Cleaning'];
      const filtered = allHandymen.filter(handyman => {
        if (!handyman.serviceCategories || handyman.serviceCategories.length === 0) {
          return true; // Include handymen with no categories
        }
        return !handyman.serviceCategories.some(cat => mainCategories.includes(cat));
      });
      setHandymen(filtered);
    } else {
      // Filter by specific category
      const filtered = allHandymen.filter(handyman => {
        return handyman.serviceCategories && 
               handyman.serviceCategories.includes(category.name);
      });
      setHandymen(filtered);
    }
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleHandymanPress = (handyman) => {
    navigation.navigate('HandymanDetail', { handyman });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategoryButton
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={selectedCategory === item.id ? '#FFFFFF' : '#333333'}
      />
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.selectedCategoryName
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderHandymanItem = ({ item }) => (
    <TouchableOpacity
      style={styles.handymanCard}
      onPress={() => handleHandymanPress(item)}
    >
      <Image
        source={{ uri: getUserAvatarUri(item) }}
        style={styles.handymanImage}
      />
      <View style={styles.handymanInfo}>
        <Text style={styles.handymanName}>{item.name}</Text>
        <Text style={styles.handymanLocation}>
          {item.location || 'Malaysia'}
        </Text>
        <View style={styles.categoriesContainer}>
          {item.serviceCategories && item.serviceCategories.slice(0, 2).map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{category}</Text>
            </View>
          ))}
          {item.serviceCategories && item.serviceCategories.length > 2 && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>+{item.serviceCategories.length - 2}</Text>
            </View>
          )}
        </View>
        <View style={styles.handymanBottom}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.rating ? item.rating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.reviewsText}>
              ({item.reviewCount || 0})
            </Text>
          </View>
          {item.hourlyRate && (
            <Text style={styles.priceText}>RM {item.hourlyRate}/hr</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" style={styles.chevron} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No handymen found</Text>
      <Text style={styles.emptyStateText}>
        {selectedCategory 
          ? `No handymen available for ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`
          : 'No handymen available at the moment'
        }
      </Text>
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={() => setSelectedCategory(null)}
      >
        <Text style={styles.resetButtonText}>Show All</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={loadHandymen}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading handymen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Categories */}
      <View style={styles.categorySection}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      
      {/* Handymen List */}
      <View style={styles.handymenSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory 
            ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Services` 
            : 'Available Services'}
        </Text>
        
        <FlatList
          data={handymen}
          renderItem={renderHandymanItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={handymen.length === 0 ? styles.emptyListContainer : null}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMedium,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categorySection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginTop: 10,
  },
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryName: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333333',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  handymenSection: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  handymanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  handymanImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  handymanInfo: {
    flex: 1,
    marginLeft: 12,
  },
  handymanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  handymanLocation: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 6,
  },
  categoryTag: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  categoryTagText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  handymanBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  reviewsText: {
    marginLeft: 2,
    fontSize: 12,
    color: '#999999',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;