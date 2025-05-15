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
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Confirm logout
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => logout() }
      ]
    );
  };
  
  // Render a section header
  const renderSectionHeader = (title) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
  
  // Render a switch setting item
  const renderSwitchItem = (icon, title, description, value, onValueChange) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#DDDDDD", true: Colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#DDDDDD"
      />
    </View>
  );
  
  // Render a chevron setting item (for navigation)
  const renderChevronItem = (icon, title, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );
  
  // Render a destructive action item
  const renderDestructiveItem = (icon, title, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color="#E53935" />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: "#E53935" }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Notifications Section */}
        {renderSectionHeader("Notifications")}
        <View style={styles.settingSection}>
          {renderSwitchItem(
            "notifications-outline",
            "Push Notifications",
            "Receive notifications about new jobs, messages, and updates",
            notificationsEnabled,
            setNotificationsEnabled
          )}
          
          {renderSwitchItem(
            "mail-outline",
            "Email Notifications",
            "Receive notifications via email",
            emailNotificationsEnabled,
            setEmailNotificationsEnabled
          )}
        </View>
        
        {/* Appearance Section */}
        {renderSectionHeader("Appearance")}
        <View style={styles.settingSection}>
          {renderSwitchItem(
            "moon-outline",
            "Dark Mode",
            "Change app appearance",
            darkModeEnabled,
            setDarkModeEnabled
          )}
          
          {renderChevronItem(
            "language-outline",
            "Language",
            () => navigation.navigate('LanguageSettings')
          )}
        </View>
        
        {/* Privacy & Security Section */}
        {renderSectionHeader("Privacy & Security")}
        <View style={styles.settingSection}>
          {renderSwitchItem(
            "location-outline",
            "Location Services",
            "Allow app to access your location",
            locationEnabled,
            setLocationEnabled
          )}
          
          {renderChevronItem(
            "key-outline",
            "Change Password",
            () => navigation.navigate('ChangePassword')
          )}
          
          {renderChevronItem(
            "shield-checkmark-outline",
            "Privacy Policy",
            () => navigation.navigate('PrivacyPolicy')
          )}
        </View>
        
        {/* Support Section */}
        {renderSectionHeader("Support")}
        <View style={styles.settingSection}>
          {renderChevronItem(
            "help-circle-outline",
            "Help Center",
            () => navigation.navigate('HelpCenter')
          )}
          
          {renderChevronItem(
            "chatbubble-ellipses-outline",
            "Contact Support",
            () => navigation.navigate('ContactSupport')
          )}
          
          {renderChevronItem(
            "star-outline",
            "Rate the App",
            () => Alert.alert("Rate", "This would open the app store rating page.")
          )}
        </View>
        
        {/* Account Section */}
        {renderSectionHeader("Account")}
        <View style={styles.settingSection}>
          {renderChevronItem(
            "cloud-download-outline",
            "Export My Data",
            () => Alert.alert("Export Data", "Your data will be prepared for export.")
          )}
          
          {renderDestructiveItem(
            "log-out-outline",
            "Logout",
            handleLogout
          )}
          
          {renderDestructiveItem(
            "trash-outline",
            "Delete Account",
            () => Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account? This action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive" }
              ]
            )
          )}
        </View>
        
        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appVersion}>TooKang v1.0.0</Text>
          <Text style={styles.copyright}>© 2025 TooKang Inc. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777777',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#777777',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  appVersion: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#AAAAAA',
  }
});

export default SettingsScreen;