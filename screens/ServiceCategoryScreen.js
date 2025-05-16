import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Colors from '../constants/Colors';

const ServiceCategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [handymen, setHandymen] = useState([]);
  const [filteredHandymen, setFilteredHandymen] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceRangeFilter, setPriceRangeFilter] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('rating'); // 'rating' or 'price'
  
  // Fetch handymen data
  useEffect(() => {
    fetchHandymen();
  }, []);
  
  // Apply filters when search query or filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, ratingFilter, priceRangeFilter, sortOption, handymen]);
  
  // Mock API call to fetch handymen
  const fetchHandymen = () => {
    // Simulate API call delay
    setTimeout(() => {
      // Sample data - in a real app, this would come from your API
      const mockHandymen = [
        {
          id: '1',
          name: 'John Smith',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: 4.8,
          reviews: 124,
          hourlyRate: 45,
          experience: 5,
          description: 'Experienced plumber specializing in bathroom and kitchen repairs.',
          location: 'Kuala Lumpur',
          skills: ['Pipe Repairs', 'Leak Detection', 'Fixture Installation'],
          completedJobs: 156
        },
        {
          id: '2',
          name: 'David Chen',
          avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
          rating: 4.6,
          reviews: 98,
          hourlyRate: 40,
          experience: 4,
          description: 'Licensed plumber with expertise in water heater installation and repair.',
          location: 'Petaling Jaya',
          skills: ['Water Heaters', 'Drainage', 'Plumbing Installation'],
          completedJobs: 112
        },
        {
          id: '3',
          name: 'Michael Wong',
          avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
          rating: 4.9,
          reviews: 156,
          hourlyRate: 55,
          experience: 8,
          description: 'Master plumber with 8+ years experience in residential and commercial services.',
          location: 'Subang Jaya',
          skills: ['Commercial Plumbing', 'Remodeling', 'Emergency Services'],
          completedJobs: 210
        },
        {
          id: '4',
          name: 'Rajesh Kumar',
          avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
          rating: 4.7,
          reviews: 87,
          hourlyRate: 42,
          experience: 6,
          description: 'Specialized in bathroom renovations and toilet repairs.',
          location: 'Shah Alam',
          skills: ['Toilet Repair', 'Bathroom Renovation', 'Sink Installation'],
          completedJobs: 93
        },
        {
          id: '5',
          name: 'James Lee',
          avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
          rating: 4.5,
          reviews: 63,
          hourlyRate: 38,
          experience: 3,
          description: 'Prompt and reliable plumbing services at competitive rates.',
          location: 'Ampang',
          skills: ['Leak Repairs', 'Pipe Replacement', 'Maintenance'],
          completedJobs: 78
        },
        {
          id: '6',
          name: 'Ahmad Hassan',
          avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
          rating: 4.9,
          reviews: 142,
          hourlyRate: 52,
          experience: 7,
          description: 'Provides 24/7 emergency services for all plumbing needs.',
          location: 'Klang',
          skills: ['Emergency Services', 'Gas Lines', 'Water Systems'],
          completedJobs: 189
        },
        {
          id: '7',
          name: 'Tan Wei Ming',
          avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
          rating: 4.4,
          reviews: 45,
          hourlyRate: 35,
          experience: 2,
          description: 'Affordable plumbing solutions with guaranteed satisfaction.',
          location: 'Cheras',
          skills: ['Affordable Repairs', 'Maintenance', 'Installation'],
          completedJobs: 54
        }
      ];
      
      setHandymen(mockHandymen);
      setFilteredHandymen(mockHandymen);
      setIsLoading(false);
    }, 1000);
  };
  
  // Apply filters to the handymen list
  const applyFilters = () => {
    if (!handymen.length) return;
    
    let result = [...handymen];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        handyman => 
          handyman.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          handyman.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          handyman.skills.some(skill => 
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }
    
    // Apply rating filter
    if (ratingFilter > 0) {
      result = result.filter(handyman => handyman.rating >= ratingFilter);
    }
    
    // Apply price range filter
    result = result.filter(
      handyman => 
        handyman.hourlyRate >= priceRangeFilter[0] &&
        handyman.hourlyRate <= priceRangeFilter[1]
    );
    
    // Apply sorting
    if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'price_low') {
      result.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortOption === 'price_high') {
      result.sort((a, b) => b.hourlyRate - a.hourlyRate);
    }
    
    setFilteredHandymen(result);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setRatingFilter(0);
    setPriceRangeFilter([0, 1000]);
    setSortOption('rating');
    setSearchQuery('');
  };
  
  // Navigate to handyman detail screen
  const navigateToHandymanDetail = (handyman) => {
    navigation.navigate('HandymanDetail', { handyman });
  };
  
  // Render rating stars
  const renderRatingStars = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.floor(rating) ? "star" : star <= rating ? "star-half" : "star-outline"}
            size={16}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };
  
  // Render handyman item
  const renderHandymanItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.handymanCard}
        onPress={() => navigateToHandymanDetail(item)}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        
        <View style={styles.handymanInfo}>
          <Text style={styles.handymanName}>{item.name}</Text>
          
          {renderRatingStars(item.rating)}
          
          <Text style={styles.reviewsText}>{item.reviews} reviews</Text>
          
          <View style={styles.tagsContainer}>
            {item.skills.slice(0, 2).map((skill, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
            {item.skills.length > 2 && (
              <Text style={styles.moreTagsText}>+{item.skills.length - 2} more</Text>
            )}
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Hourly Rate</Text>
          <Text style={styles.priceAmount}>RM {item.hourlyRate}</Text>
          <Text style={styles.experienceText}>{item.experience} years exp.</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="search" size={64} color="#CCCCCC" />
        <Text style={styles.emptyStateTitle}>No handymen found</Text>
        <Text style={styles.emptyStateDescription}>
          Try adjusting your filters or search criteria
        </Text>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetFilters}
        >
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render filter modal
  const renderFilterModal = () => {
    return (
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Minimum Rating</Text>
                <View style={styles.ratingFilterContainer}>
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <TouchableOpacity 
                      key={rating}
                      style={[
                        styles.ratingFilterOption,
                        ratingFilter === rating && styles.ratingFilterOptionActive
                      ]}
                      onPress={() => setRatingFilter(rating)}
                    >
                      {rating === 0 ? (
                        <Text style={[
                          styles.ratingFilterText,
                          ratingFilter === rating && styles.ratingFilterTextActive
                        ]}>All</Text>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="star" size={16} color={ratingFilter === rating ? '#FFFFFF' : '#FFD700'} />
                          <Text style={[
                            styles.ratingFilterText,
                            ratingFilter === rating && styles.ratingFilterTextActive
                          ]}>{rating}+</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Price Range (RM per hour)</Text>
                <View style={styles.priceRangeContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.priceRangeOption,
                      priceRangeFilter[0] === 0 && priceRangeFilter[1] === 1000 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setPriceRangeFilter([0, 1000])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      priceRangeFilter[0] === 0 && priceRangeFilter[1] === 1000 && styles.priceRangeTextActive
                    ]}>All</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priceRangeOption,
                      priceRangeFilter[0] === 0 && priceRangeFilter[1] === 40 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setPriceRangeFilter([0, 40])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      priceRangeFilter[0] === 0 && priceRangeFilter[1] === 40 && styles.priceRangeTextActive
                    ]}>Below RM40</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priceRangeOption,
                      priceRangeFilter[0] === 40 && priceRangeFilter[1] === 60 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setPriceRangeFilter([40, 60])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      priceRangeFilter[0] === 40 && priceRangeFilter[1] === 60 && styles.priceRangeTextActive
                    ]}>RM40 - RM60</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priceRangeOption,
                      priceRangeFilter[0] === 60 && priceRangeFilter[1] === 1000 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setPriceRangeFilter([60, 1000])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      priceRangeFilter[0] === 60 && priceRangeFilter[1] === 1000 && styles.priceRangeTextActive
                    ]}>Above RM60</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Sort Options */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Sort By</Text>
                <View style={styles.sortOptionsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      sortOption === 'rating' && styles.sortOptionActive
                    ]}
                    onPress={() => setSortOption('rating')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortOption === 'rating' && styles.sortOptionTextActive
                    ]}>Top Rated</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      sortOption === 'price_low' && styles.sortOptionActive
                    ]}
                    onPress={() => setSortOption('price_low')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortOption === 'price_low' && styles.sortOptionTextActive
                    ]}>Price: Low to High</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      sortOption === 'price_high' && styles.sortOptionActive
                    ]}
                    onPress={() => setSortOption('price_high')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortOption === 'price_high' && styles.sortOptionTextActive
                    ]}>Price: High to Low</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetFiltersButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetFiltersButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Search and Filter Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${category} handymen`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Results Count */}
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCount}>
          {filteredHandymen.length} {filteredHandymen.length === 1 ? 'handyman' : 'handymen'} found
        </Text>
        
        {/* Only show clear filters if filters are applied */}
        {(searchQuery || ratingFilter > 0 || priceRangeFilter[0] > 0 || priceRangeFilter[1] < 1000 || sortOption !== 'rating') && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Handymen List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading handymen...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHandymen}
          renderItem={renderHandymanItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  filterButton: {
    marginLeft: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resultsCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  handymanCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  handymanInfo: {
    flex: 1,
    marginLeft: 12,
  },
  handymanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tagChip: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
  },
  moreTagsText: {
    fontSize: 12,
    color: '#888888',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#888888',
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  ratingFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingFilterOption: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  ratingFilterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ratingFilterText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  ratingFilterTextActive: {
    color: '#FFFFFF',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceRangeOption: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  priceRangeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priceRangeText: {
    fontSize: 14,
    color: '#666666',
  },
  priceRangeTextActive: {
    color: '#FFFFFF',
  },
  sortOptionsContainer: {
    flexDirection: 'column',
  },
  sortOption: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sortOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resetFiltersButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginRight: 8,
  },
  resetFiltersButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  applyFiltersButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginLeft: 8,
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ServiceCategoryScreen;