import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const ProfileScreen = ({ navigation }) => {
  // Get auth context
  const { logout, userType } = useAuth();
  
  // Mock user data - in a real app, this would come from a context or API
  const [user] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+60 12-345-6789',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'Kuala Lumpur, Malaysia',
    memberSince: 'January 2025',
    completedProjects: 8,
    rating: 4.8,
    reviews: 5,
    bio: userType === 'handyman' 
      ? 'Professional handyman with 10+ years of experience in plumbing, electrical work, and general repairs.' 
      : 'Looking for reliable handymen for home improvement projects.',
    skills: userType === 'handyman' ? ['Plumbing', 'Electrical', 'Carpentry'] : [],
    hourlyRate: userType === 'handyman' ? 35 : null,
    verified: true,
  });

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData: user });
  };
  
  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => logout() }
      ]
    );
  };

  const renderSectionTitle = (title) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  // Only show skills section for handyman
  const renderSkills = () => {
    if (userType !== 'handyman' || !user.skills || user.skills.length === 0) return null;
    
    return (
      <View style={styles.skillSection}>
        {renderSectionTitle('Skills')}
        <View style={styles.skillsList}>
          {user.skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderInfoItem = (icon, label, value) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header with basic info */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            {user.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={14} color="#777" /> {user.location}
            </Text>
            
            {userType === 'handyman' && (
              <View style={styles.rateTag}>
                <Text style={styles.rateText}>RM{user.hourlyRate}/hr</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.completedProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Type badge and bio */}
        <View style={styles.section}>
          <View style={styles.typeBadge}>
            <Ionicons 
              name={userType === 'handyman' ? 'hammer-outline' : 'person-outline'} 
              size={16} 
              color={Colors.white} 
            />
            <Text style={styles.typeText}>
              {userType === 'handyman' ? 'Handyman' : 'Customer'}
            </Text>
          </View>
          
          {user.bio && (
            <Text style={styles.bioText}>{user.bio}</Text>
          )}
        </View>
        
        {/* Skills for handyman */}
        {renderSkills()}

        {/* Contact information */}
        <View style={styles.section}>
          {renderSectionTitle('Contact Information')}
          {renderInfoItem('mail-outline', 'Email', user.email)}
          {renderInfoItem('call-outline', 'Phone', user.phone)}
        </View>

        {/* Account information */}
        <View style={styles.section}>
          {renderSectionTitle('Account Information')}
          {renderInfoItem('calendar-outline', 'Member Since', user.memberSince)}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNavigateToSettings}>
            <Ionicons name="settings-outline" size={22} color="#666" />
            <Text style={styles.actionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCC" style={styles.actionArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Help')}>
            <Ionicons name="help-circle-outline" size={22} color="#666" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCC" style={styles.actionArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PaymentMethods')}>
            <Ionicons name="card-outline" size={22} color="#666" />
            <Text style={styles.actionText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCC" style={styles.actionArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
            <Text style={styles.logoutText}>Log Out</Text>
            <View style={styles.actionArrow} />
          </TouchableOpacity>
        </View>
        
        {/* Version info */}
        <Text style={styles.versionText}>TooKang v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 6,
  },
  rateTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#777777',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 10,
  },
  skillSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 13,
    color: '#555555',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777777',
    marginLeft: 10,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionText: {
    fontSize: 15,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  logoutText: {
    fontSize: 15,
    color: '#FF6B6B',
    marginLeft: 12,
    flex: 1,
  },
  actionArrow: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginVertical: 20,
  }
});

export default ProfileScreen;