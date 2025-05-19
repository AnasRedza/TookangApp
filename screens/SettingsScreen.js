import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const SettingsScreen = ({ navigation }) => {
  // Auth context for logout functionality
  const { logout } = useAuth();
  
  // State for toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Confirm logout
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => logout() }
      ]
    );
  };
  
  // Navigate to notification settings
  const goToNotificationSettings = () => {
    navigation.navigate('SettingsNotifications');
  };

  // Render a toggle setting item
  const renderToggleItem = (title, value, onValueChange) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#DDDDDD", true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
  
  // Render a navigation item
  const renderNavItem = (title, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
    </TouchableOpacity>
  );
  
  // Render a destructive action item
  const renderDestructiveItem = (title, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={[styles.settingTitle, { color: "#E53935" }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderToggleItem(
            "Push Notifications",
            notificationsEnabled,
            setNotificationsEnabled
          )}
          
          {renderToggleItem(
            "Email Notifications",
            emailNotificationsEnabled,
            setEmailNotificationsEnabled
          )}
          
          {renderNavItem(
            "Notification Settings",
            goToNotificationSettings
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          {renderToggleItem(
            "Location Services",
            locationEnabled,
            setLocationEnabled
          )}
          
          {renderNavItem(
            "Privacy Policy",
            () => navigation.navigate('PrivacyPolicy')
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {renderNavItem(
            "Change Password",
            () => navigation.navigate('ChangePassword')
          )}
          
          {renderDestructiveItem(
            "Logout",
            handleLogout
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.versionText}>TooKang v1.0.0</Text>
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
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingTitle: {
    fontSize: 15,
    color: '#333333',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  }
});

export default SettingsScreen;