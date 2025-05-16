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
  ScrollView,
  SectionList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Colors from '../constants/Colors';

const SearchResultsScreen = ({ route, navigation }) => {
  const { searchQuery: initialQuery, location } = route.params;
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('relevance');
  const [currentView, setCurrentView] = useState('all'); // 'all' or 'categories'
  
  // Fetch search results
  useEffect(() => {
    fetchSearchResults();
  }, []);
  
  // Re-fetch when search query changes
  useEffect(() => {
    if (searchQuery !== initialQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);
  
  // Categories list
  const categories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 
    'Landscaping', 'HVAC', 'Roofing', 'Flooring', 'Appliance Repair'
  ];
  
  // Fetch search results (mock API call)
  const fetchSearchResults = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock search results - in a real app, this would come from your API
      const mockResults = [
        {
          category: 'Plumbing',
          data: [
            {
              id: 'p1',
              name: 'John Smith',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              rating: 4.8,
              reviews: 124,
              hourlyRate: 45,
              experience: 5,
              description: 'Professional plumber specializing in bathroom and kitchen repairs.',
              location: 'Kuala Lumpur',
              distance: 2.5, // km
              skills: ['Pipe Repairs', 'Leak Detection', 'Fixture Installation']
            },
            {
              id: 'p2',
              name: 'David Chen',
              avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
              rating: 4.6,
              reviews: 98,
              hourlyRate: 40,
              experience: 4,
              description: 'Licensed plumber with expertise in water heater installation.',
              location: 'Petaling Jaya',
              distance: 4.8,
              skills: ['Water Heaters', 'Drainage', 'Plumbing Installation']
            }
          ]
        },
        {
          category: 'Electrical',
          data: [
            {
              id: 'e1',
              name: 'Mike Johnson',
              avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
              rating: 4.9,
              reviews: 156,
              hourlyRate: 50,
              experience: 7,
              description: 'Certified electrician for residential and commercial needs.',
              location: 'Kuala Lumpur',
              distance: 3.2,
              skills: ['Wiring', 'Lighting', 'Circuit Breakers']
            },
            {
              id: 'e2',
              name: 'Sarah Tan',
              avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
              rating: 4.7,
              reviews: 87,
              hourlyRate: 48,
              experience: 5,
              description: 'Specialized in electrical troubleshooting and installations.',
              location: 'Subang Jaya',
              distance: 6.5,
              skills: ['Home Automation', 'Electrical Repairs', 'Safety Inspections']
            }
          ]
        },
        {
          category: 'Carpentry',
          data: [
            {
              id: 'c1',
              name: 'Robert Lee',
              avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
              rating: 4.8,
              reviews: 112,
              hourlyRate: 55,
              experience: 9,
              description: 'Expert carpenter for custom furniture and home renovations.',
              location: 'Shah Alam',
              distance: 8.1,
              skills: ['Custom Furniture', 'Cabinet Making', 'Woodworking']
            }
          ]
        },
        {
          category: 'Painting',
          data: [
            {
              id: 'pt1',
              name: 'James Wong',
              avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
              rating: 4.5,
              reviews: 76,
              hourlyRate: 35,
              experience: 4,
              description: 'Professional painter with attention to detail.',
              location: 'Ampang',
              distance: 5.3,
              skills: ['Interior Painting', 'Exterior Painting', 'Wallpaper Installation']
            }
          ]
        }
      ];
      
      // Apply filtering based on the current search query
      if (searchQuery) {
        const filteredResults = [];
        
        mockResults.forEach(categoryGroup => {
          const filteredData = categoryGroup.data.filter(handyman => 
            handyman.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            handyman.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            handyman.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
            categoryGroup.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          if (filteredData.length > 0) {
            filteredResults.push({
              category: categoryGroup.category,
              data: filteredData
            });
          }
        });
        
        setSearchResults(filteredResults);
      } else {
        setSearchResults(mockResults);
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Apply filters to search results
  const applyFilters = () => {
    setShowFilterModal(false);
    setIsLoading(true);
    
    // Simulate API call with filters
    setTimeout(() => {
      let filteredResults = [...searchResults];
      
      // Filter by selected categories
      if (selectedCategories.length > 0) {
        filteredResults = filteredResults.filter(categoryGroup => 
          selectedCategories.includes(categoryGroup.category)
        );
      }
      
      // Filter by rating within each category
      filteredResults = filteredResults.map(categoryGroup => {
        return {
          category: categoryGroup.category,
          data: categoryGroup.data.filter(handyman => handyman.rating >= selectedRating)
        };
      }).filter(categoryGroup => categoryGroup.data.length > 0);
      
      // Filter by price range within each category
      filteredResults = filteredResults.map(categoryGroup => {
        return {
          category: categoryGroup.category,
          data: categoryGroup.data.filter(handyman => 
            handyman.hourlyRate >= selectedPriceRange[0] && 
            handyman.hourlyRate <= selectedPriceRange[1]
          )
        };
      }).filter(categoryGroup => categoryGroup.data.length > 0);
      
      // Apply sorting
      filteredResults = filteredResults.map(categoryGroup => {
        let sortedData = [...categoryGroup.data];
        
        if (sortOption === 'rating') {
          sortedData.sort((a, b) => b.rating - a.rating);
        } else if (sortOption === 'price_low') {
          sortedData.sort((a, b) => a.hourlyRate - b.hourlyRate);
        } else if (sortOption === 'price_high') {
          sortedData.sort((a, b) => b.hourlyRate - a.hourlyRate);
        } else if (sortOption === 'distance') {
          sortedData.sort((a, b) => a.distance - b.distance);
        }
        
        return {
          category: categoryGroup.category,
          data: sortedData
        };
      });
      
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 500);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedRating(0);
    setSelectedPriceRange([0, 1000]);
    setSortOption('relevance');
    fetchSearchResults();
  };
  
  // Toggle category selection
  const toggleCategorySelection = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Navigate to handyman detail
  const navigateToHandymanDetail = (handyman) => {
    navigation.navigate('HandymanDetail', { handyman });
  };
  
  // Navigate to category
  const navigateToCategory = (category) => {
    navigation.navigate('ServiceCategory', { category });
  };
  
  // Render rating stars
  const renderRatingStars = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={
              star <= Math.floor(rating) 
                ? "star" 
                : star <= rating 
                  ? "star-half" 
                  : "star-outline"
            }
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
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#888888" />
            <Text style={styles.locationText}>{item.location} ({item.distance} km)</Text>
          </View>
          
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
          <Text style={styles.experienceText}>{item.experience} yrs exp.</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render section header
  const renderSectionHeader = ({ section }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.category}</Text>
        <TouchableOpacity onPress={() => navigateToCategory(section.category)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render categories view
  const renderCategoriesView = () => {
    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Popular Categories</Text>
        
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.categoryCard}
              onPress={() => navigateToCategory(category)}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons 
                  name={getCategoryIcon(category)} 
                  size={28} 
                  color={Colors.primary} 
                />
              </View>
              <Text style={styles.categoryName}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Plumbing': return 'water';
      case 'Electrical': return 'flash';
      case 'Carpentry': return 'hammer';
      case 'Painting': return 'color-palette';
      case 'Cleaning': return 'sparkles';
      case 'Landscaping': return 'leaf';
      case 'HVAC': return 'thermometer';
      case 'Roofing': return 'home';
      case 'Flooring': return 'grid';
      case 'Appliance Repair': return 'construct';
      default: return 'construct';
    }
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="search" size={64} color="#CCCCCC" />
        <Text style={styles.emptyStateTitle}>No results found</Text>
        <Text style={styles.emptyStateDescription}>
          {selectedCategories.length > 0 || selectedRating > 0 || selectedPriceRange[0] > 0 || selectedPriceRange[1] < 1000 ?
            "Try adjusting your filters or search terms" :
            `We couldn't find any handymen for "${searchQuery}"`
          }
        </Text>
        
        {(selectedCategories.length > 0 || selectedRating > 0 || selectedPriceRange[0] > 0 || selectedPriceRange[1] < 1000) && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.browseCategoriesButton, {marginTop: 12}]}
          onPress={() => setCurrentView('categories')}
        >
          <Text style={styles.browseCategoriesText}>Browse Categories</Text>
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
              {/* Categories Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Categories</Text>
                <View style={styles.categoriesFilterContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity 
                      key={category}
                      style={[
                        styles.categoryFilterOption,
                        selectedCategories.includes(category) && styles.categoryFilterOptionActive
                      ]}
                      onPress={() => toggleCategorySelection(category)}
                    >
                      <Text style={[
                        styles.categoryFilterText,
                        selectedCategories.includes(category) && styles.categoryFilterTextActive
                      ]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Minimum Rating</Text>
                <View style={styles.ratingFilterContainer}>
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <TouchableOpacity 
                      key={rating}
                      style={[
                        styles.ratingFilterOption,
                        selectedRating === rating && styles.ratingFilterOptionActive
                      ]}
                      onPress={() => setSelectedRating(rating)}
                    >
                      {rating === 0 ? (
                        <Text style={[
                          styles.ratingFilterText,
                          selectedRating === rating && styles.ratingFilterTextActive
                        ]}>All</Text>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="star" size={16} color={selectedRating === rating ? '#FFFFFF' : '#FFD700'} />
                          <Text style={[
                            styles.ratingFilterText,
                            selectedRating === rating && styles.ratingFilterTextActive
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
                      selectedPriceRange[0] === 0 && selectedPriceRange[1] === 1000 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setSelectedPriceRange([0, 1000])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      selectedPriceRange[0] === 0 && selectedPriceRange[1] === 1000 && styles.priceRangeTextActive
                    ]}>All</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priceRangeOption,
                      selectedPriceRange[0] === 0 && selectedPriceRange[1] === 40 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setSelectedPriceRange([0, 40])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      selectedPriceRange[0] === 0 && selectedPriceRange[1] === 40 && styles.priceRangeTextActive
                    ]}>Below RM40</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priceRangeOption,
                      selectedPriceRange[0] === 40 && selectedPriceRange[1] === 60 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setSelectedPriceRange([40, 60])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      selectedPriceRange[0] === 40 && selectedPriceRange[1] === 60 && styles.priceRangeTextActive
                    ]}>RM40 - RM60</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priceRangeOption,
                      selectedPriceRange[0] === 60 && selectedPriceRange[1] === 1000 && styles.priceRangeOptionActive
                    ]}
                    onPress={() => setSelectedPriceRange([60, 1000])}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      selectedPriceRange[0] === 60 && selectedPriceRange[1] === 1000 && styles.priceRangeTextActive
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
                      sortOption === 'relevance' && styles.sortOptionActive
                    ]}
                    onPress={() => setSortOption('relevance')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortOption === 'relevance' && styles.sortOptionTextActive
                    ]}>Relevance</Text>
                  </TouchableOpacity>
                  
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
                  
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      sortOption === 'distance' && styles.sortOptionActive
                    ]}
                    onPress={() => setSortOption('distance')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortOption === 'distance' && styles.sortOptionTextActive
                    ]}>Nearest First</Text>
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
                onPress={applyFilters}
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
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search handymen or services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={fetchSearchResults}
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
      
      {/* Location Info */}
      {location && (
        <View style={styles.locationInfoContainer}>
          <Ionicons name="location-outline" size={16} color="#666666" />
          <Text style={styles.locationInfoText}>Searching near {location}</Text>
        </View>
      )}
      
      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity 
          style={[
            styles.viewToggleButton,
            currentView === 'all' && styles.viewToggleButtonActive
          ]}
          onPress={() => setCurrentView('all')}
        >
          <Text style={[
            styles.viewToggleText,
            currentView === 'all' && styles.viewToggleTextActive
          ]}>All Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.viewToggleButton,
            currentView === 'categories' && styles.viewToggleButtonActive
          ]}
          onPress={() => setCurrentView('categories')}
        >
          <Text style={[
            styles.viewToggleText,
            currentView === 'categories' && styles.viewToggleTextActive
          ]}>Categories</Text>
        </TouchableOpacity>
      </View>
      
      {/* Results Count */}
      {currentView === 'all' && searchResults.length > 0 && (
        <View style={styles.resultsCountContainer}>
          <Text style={styles.resultsCount}>
            {searchResults.reduce((total, section) => total + section.data.length, 0)} handymen found
          </Text>
          
          {/* Only show clear filters if filters are applied */}
          {(selectedCategories.length > 0 || selectedRating > 0 || selectedPriceRange[0] > 0 || selectedPriceRange[1] < 1000 || sortOption !== 'relevance') && (
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching for handymen...</Text>
        </View>
      ) : (
        currentView === 'all' ? (
          searchResults.length > 0 ? (
            <SectionList
              sections={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderHandymanItem}
              renderSectionHeader={renderSectionHeader}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )
        ) : (
          <ScrollView 
            contentContainerStyle={styles.categoriesScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderCategoriesView()}
          </ScrollView>
        )
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
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F7FF',
  },
  locationInfoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  viewToggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewToggleButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  viewToggleText: {
    fontSize: 14,
    color: '#666666',
  },
  viewToggleTextActive: {
    color: Colors.primary,
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    marginBottom: 24, // Fixed: Changed from a24 to 24
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  browseCategoriesButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  browseCategoriesText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesScrollContainer: {
    padding: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
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
  categoriesFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryFilterOption: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryFilterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
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

export default SearchResultsScreen;