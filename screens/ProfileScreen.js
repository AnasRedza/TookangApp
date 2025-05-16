import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, userType } = useAuth();
  
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
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
            <Text style={styles.userType}>{userType === 'customer' ? 'Customer' : 'Handyman'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('PaymentMethodsDrawer')}
        >
          <Ionicons name="card-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('SettingsDrawer')}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('HelpDrawer')}
        >
          <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('AboutDrawer')}
        >
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>About Us</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#E53935" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 16,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  logoutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default ProfileScreen;