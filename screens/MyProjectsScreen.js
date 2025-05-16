import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const MyProjectsScreen = ({ route, navigation }) => {
  const { userType } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  
  // Get projects on component mount
  useEffect(() => {
    fetchProjects();
    
    // Check if there's a new project from the route params
    if (route.params?.newProject) {
      addNewProject(route.params.newProject);
    }
  }, [route.params?.newProject]);
  
  // Fetch projects (mock)
  const fetchProjects = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock projects data
      const mockProjects = [
        {
          id: '1',
          title: 'Fix leaking bathroom sink',
          category: 'Plumbing',
          initialBudget: 120,
          agreedBudget: 150,
          description: 'The bathroom sink has been leaking for a week. Need to fix the pipes underneath.',
          status: 'agreed_scheduled',
          location: '123 Main Street, Kuala Lumpur',
          preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          preferredTime: 'morning',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isNegotiable: true,
          handyman: {
            id: 'h1',
            name: 'John Plumber',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            rating: 4.8
          },
          customer: {
            id: 'c1',
            name: 'Alice Chen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
          }
        },
        {
          id: '2',
          title: 'Install ceiling fan',
          category: 'Electrical',
          initialBudget: 85,
          description: 'Need to install a new ceiling fan in the living room.',
          status: 'pending_handyman_review',
          location: '456 Park Avenue, Petaling Jaya',
          preferredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          preferredTime: 'afternoon',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isNegotiable: true,
          handyman: {
            id: 'h2',
            name: 'Mike Electrician',
            avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
            rating: 4.6
          },
          customer: {
            id: 'c1',
            name: 'Alice Chen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
          }
        },
        {
          id: '3',
          title: 'Paint living room walls',
          category: 'Painting',
          initialBudget: 350,
          agreedBudget: 400,
          adjustedBudget: 450,
          adjustmentReason: 'Additional wall preparation required',
          description: 'Need to paint my living room walls. The room is approximately 15x20 feet.',
          status: 'requires_adjustment',
          location: '789 Garden Road, Subang Jaya',
          preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          preferredTime: 'anytime',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isNegotiable: true,
          handyman: {
            id: 'h3',
            name: 'Paul Painter',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            rating: 4.9
          },
          customer: {
            id: 'c1',
            name: 'Alice Chen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
          }
        },
        {
          id: '4',
          title: 'Fix garden irrigation',
          category: 'Landscaping',
          initialBudget: 150,
          agreedBudget: 180,
          description: 'The irrigation system in my garden is not working properly. Some sprinklers are not functioning.',
          status: 'requires_payment',
          location: '101 Hill View, Ampang',
          preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          preferredTime: 'morning',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          isNegotiable: false,
          handyman: {
            id: 'h4',
            name: 'Gary Gardener',
            avatar: 'https://randomuser.me/api/portraits/men/89.jpg',
            rating: 4.7
          },
          customer: {
            id: 'c1',
            name: 'Alice Chen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
          }
        },
        {
          id: '5',
          title: 'Repair air conditioning unit',
          category: 'HVAC',
          initialBudget: 200,
          agreedBudget: 220,
          description: 'AC unit in master bedroom is not cooling properly.',
          status: 'completed',
          location: '222 Lake View, Bangsar',
          preferredDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          preferredTime: 'afternoon',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          isNegotiable: true,
          handyman: {
            id: 'h5',
            name: 'Harry HVAC',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            rating: 4.5
          },
          customer: {
            id: 'c1',
            name: 'Alice Chen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
          }
        }
      ];
      
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  };
  
  // Add new project
  const addNewProject = (newProject) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
  };
  
  // Get filtered projects
  const getFilteredProjects = () => {
    if (activeTab === 'active') {
      return projects.filter(project => 
        !['completed', 'cancelled', 'disputed'].includes(project.status)
      );
    } else {
      return projects.filter(project => 
        ['completed', 'cancelled', 'disputed'].includes(project.status)
      );
    }
  };
  
  // Handle navigation to project details
  const handleViewProject = (project) => {
    navigation.navigate('ProjectDetails', { project });
  };
  
  // Handle pay now button
  const handlePayForProject = (project) => {
    // Use CommonActions to navigate to ensure it works from any position
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeTab',
        params: {
          screen: 'Payment',
          params: {
            project: project,
            total: parseFloat(project.adjustedBudget || project.agreedBudget || project.initialBudget)
          }
        },
      })
    );
  };
  
  // Handle view adjustment
  const handleViewAdjustment = (project) => {
    // Use CommonActions to navigate to ensure it works from any position
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeTab',
        params: {
          screen: 'AdjustmentApproval',
          params: { 
            project, 
            adjustment: { 
              newAmount: project.adjustedBudget || project.initialBudget,
              reason: project.adjustmentReason || 'Additional work required'
            }
          }
        },
      })
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending_handyman_review': return 'Pending Review';
      case 'in_negotiation': return 'In Negotiation';
      case 'agreed_scheduled': return 'Agreed & Scheduled';
      case 'requires_adjustment': return 'Adjustment Needed';
      case 'requires_payment': return 'Payment Required';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      default: return status;
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending_handyman_review': return '#FFA000';
      case 'in_negotiation': return '#2196F3';
      case 'agreed_scheduled': return '#8BC34A';
      case 'requires_adjustment': return '#FF5722';
      case 'requires_payment': return '#E91E63';
      case 'in_progress': return '#03A9F4';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'disputed': return '#E91E63';
      default: return '#9E9E9E';
    }
  };
  
  // Render item
  const renderProjectItem = ({ item }) => {
    const isCustomer = userType === 'customer';
    const otherParty = isCustomer ? item.handyman : item.customer;
    
    return (
      <TouchableOpacity 
        style={styles.projectCard}
        onPress={() => handleViewProject(item)}
      >
        <View style={styles.projectHeader}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.projectTitle}>{item.title}</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDate(item.preferredDate)}</Text>
        </View>
        
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>Budget:</Text>
          <Text style={styles.budgetAmount}>
            RM {parseFloat(item.adjustedBudget || item.agreedBudget || item.initialBudget).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.footer}>
          <View style={styles.partyInfo}>
            <Text style={styles.partyLabel}>{isCustomer ? 'Handyman:' : 'Customer:'}</Text>
            <Text style={styles.partyName}>{otherParty.name}</Text>
          </View>
          
          {/* Action buttons for customer */}
          {isCustomer && (
            <View style={styles.actions}>
              {item.status === 'requires_payment' && (
                <TouchableOpacity 
                  style={styles.payButton}
                  onPress={() => handlePayForProject(item)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
              
              {item.status === 'requires_adjustment' && (
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => handleViewAdjustment(item)}
                >
                  <Text style={styles.viewButtonText}>View Adjustment</Text>
                </TouchableOpacity>
              )}
              
              {item.status === 'agreed_scheduled' && (
                <TouchableOpacity 
                  style={styles.payButton}
                  onPress={() => handlePayForProject(item)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'active' && styles.activeTab
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'active' && styles.activeTabText
          ]}>Active</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'past' && styles.activeTab
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}>Past</Text>
        </TouchableOpacity>
      </View>
      
      {/* Projects List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredProjects()}
          renderItem={renderProjectItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="construct-outline" size={64} color="#DDD" />
              <Text style={styles.emptyTitle}>No Projects Found</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'active' 
                  ? 'You don\'t have any active projects' 
                  : 'You don\'t have any past projects'
                }
              </Text>
              
              {userType === 'customer' && activeTab === 'active' && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('HomeTab')}
                >
                  <Text style={styles.createButtonText}>Find a Handyman</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
      
      {/* Create New Project Button (for customers) */}
      {userType === 'customer' && activeTab === 'active' && !isLoading && getFilteredProjects().length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  partyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex:
     1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  }
});

export default MyProjectsScreen;