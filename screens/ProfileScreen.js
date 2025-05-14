import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const ProfileScreen = ({ navigation }) => {
  // Get logout function and user type
  const { logout, userType } = useAuth();
  
  // Mock user data
  const [user, setUser] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+60 12-345-6789',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'Kuala Lumpur, Malaysia',
    memberSince: 'January 2025',
    completedProjects: 8,
    bio: userType === 'handyman' 
      ? 'Professional handyman with 10+ years of experience in plumbing, electrical work, and general repairs.' 
      : 'Looking for reliable handymen for home improvement projects.',
    skills: userType === 'handyman' ? ['Plumbing', 'Electrical', 'Carpentry'] : [],
    hourlyRate: userType === 'handyman' ? 35 : null,
  });

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: () => {
            // Call logout function from Auth Context
            logout();
          },
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData: user });
  };

  // Render settings item if applicable
  const renderSettingItem = (
    title,
    value,
    setValue,
    icon,
    description = null
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={Colors.primary} style={styles.settingIcon} />
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      <Switch
        trackColor={{ false: Colors.mediumGray, true: Colors.primary }}
        thumbColor={Colors.white}
        ios_backgroundColor={Colors.mediumGray}
        onValueChange={setValue}
        value={value}
      />
    </View>
  );
  
  // Only show skills section for handyman
  const renderSkills = () => {
    if (userType !== 'handyman' || !user.skills || user.skills.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills & Services</Text>
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.location}>{user.location}</Text>
        <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
        
        {userType === 'customer' ? (
          <View style={styles.userTypeIndicator}>
            <Ionicons name="person" size={16} color={Colors.white} />
            <Text style={styles.userTypeText}>Customer</Text>
          </View>
        ) : (
          <View style={styles.userTypeIndicator}>
            <Ionicons name="hammer" size={16} color={Colors.white} />
            <Text style={styles.userTypeText}>Handyman</Text>
          </View>
        )}
        
        {userType === 'handyman' && user.hourlyRate && (
          <Text style={styles.hourlyRate}>RM{user.hourlyRate}/hour</Text>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.completedProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      {user.bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      ) : null}
      
      {renderSkills()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call" size={20} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{user.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={20} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Member Since:</Text>
          <Text style={styles.infoValue}>{user.memberSince}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={20} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{user.location}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {renderSettingItem(
          'Push Notifications',
          notifications,
          setNotifications,
          'notifications',
          'Receive notifications for project updates and offers'
        )}
        {renderSettingItem(
          'Email Updates',
          emailUpdates,
          setEmailUpdates,
          'mail',
          'Receive promotional offers and newsletters'
        )}
        {renderSettingItem(
          'Dark Mode',
          darkMode,
          setDarkMode,
          'moon',
          'Enable dark mode for the app interface'
        )}
        {renderSettingItem(
          'Location Services',
          locationServices,
          setLocationServices,
          'location',
          'Allow the app to access your location'
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={Colors.white} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.version}>
        <Text style={styles.versionText}>TooKang v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 12,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  userTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 5,
  },
  userTypeText: {
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.lightGray,
  },
  editProfileButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editProfileButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: Colors.white,
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  bioText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: Colors.text,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.darkGray,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.error,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 12,
    color: Colors.darkGray,
  },
});

export default ProfileScreen;