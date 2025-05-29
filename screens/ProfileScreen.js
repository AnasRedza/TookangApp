import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const ProfileScreen = ({ navigation }) => {
  const { user, isHandyman, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await userService.getUserById(user.id);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      const stats = await projectService.getUserProjectStats(user.id, isHandyman ? 'handyman' : 'customer');
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image 
              source={{ 
                uri: getUserAvatarUri(userProfile)
              }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.userType}>{isHandyman ? 'Service Provider' : 'Customer'}</Text>
          
          {userProfile.bio && (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )}
          
          <View style={styles.statsContainer}>
            {isHandyman ? (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userProfile.rating ? userProfile.rating.toFixed(1) : '0.0'}
                  </Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userStats?.completed || 0}
                  </Text>
                  <Text style={styles.statLabel}>Jobs Done</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userProfile.reviewCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userStats?.total || 0}
                  </Text>
                  <Text style={styles.statLabel}>Projects</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userStats?.completed || 0}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userStats?.active || 0}
                  </Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#777777" style={styles.infoIcon} />
            <Text style={styles.infoText}>{userProfile.email}</Text>
          </View>
          
          {userProfile.phone && (
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#777777" style={styles.infoIcon} />
              <Text style={styles.infoText}>{userProfile.phone}</Text>
            </View>
          )}

          {userProfile.location && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#777777" style={styles.infoIcon} />
              <Text style={styles.infoText}>{userProfile.location}</Text>
            </View>
          )}
        </View>
        
        {/* HANDYMAN ONLY: Professional Details */}
        {isHandyman && (
          <>
            {/* Experience & Rate */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Details</Text>
              
              {userProfile.experience && (
                <View style={styles.listItem}>
                  <Text style={styles.listItemName}>Experience</Text>
                  <Text style={styles.listItemValue}>
                    {userProfile.experience} year{userProfile.experience !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {userProfile.hourlyRate && (
                <View style={styles.listItem}>
                  <Text style={styles.listItemName}>Hourly Rate</Text>
                  <Text style={styles.listItemValue}>RM {userProfile.hourlyRate}</Text>
                </View>
              )}
            </View>

            {/* Service Categories */}
            {userProfile.serviceCategories && userProfile.serviceCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services Offered</Text>
                
                <View style={styles.categoriesContainer}>
                  {userProfile.serviceCategories.map((category, index) => (
                    <View key={index} style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Services & Prices */}
              {isHandyman && userProfile.services && userProfile.services.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Common Services</Text>
                  
                  <View style={styles.servicesGrid}>
                    {userProfile.services.map((service, index) => (
                      <View key={index} style={styles.serviceCard}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.servicePrice}>RM {parseFloat(service.price).toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
          </>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Ionicons name="key-outline" size={20} color="#777777" style={styles.infoIcon} />
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Ionicons name="notifications-outline" size={20} color="#777777" style={styles.infoIcon} />
            <Text style={styles.actionText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#E53935" style={styles.infoIcon} />
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>TooKang v1.0.0</Text>
          <Text style={styles.appInfoSubText}>Your trusted handyman platform</Text>
        </View>
      </ScrollView>
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
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTop: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  editButton: {
    position: 'absolute',
    right: -5,
    bottom: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '90%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#DDDDDD',
  },
  section: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 15,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  listItemName: {
    fontSize: 16,
    color: '#333333',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  categoryTag: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    marginTop: 10,
  },
  logoutText: {
    color: '#E53935',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  appInfoSubText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  servicesGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginHorizontal: -4,
},
serviceCard: {
  backgroundColor: Colors.card,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 8,
  padding: 12,
  margin: 4,
  minWidth: '45%',
  alignItems: 'center',
},
serviceName: {
  fontSize: 14,
  fontWeight: '500',
  color: Colors.textDark,
  textAlign: 'center',
  marginBottom: 4,
},
servicePrice: {
  fontSize: 16,
  fontWeight: 'bold',
  color: Colors.primary,
},
});

export default ProfileScreen;