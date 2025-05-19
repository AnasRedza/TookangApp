import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import Colors from '../constants/Colors';

const NotificationSettingsScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Simple notification settings state
  const [settings, setSettings] = useState({
    // Push notifications
    pushEnabled: true,
    projectUpdates: true,
    messages: true,
    payments: true,
    
    // Email notifications
    emailEnabled: true,
    emailProjectUpdates: true,
    emailPayments: true,
    emailMarketing: false,
    
    // SMS notifications
    smsEnabled: false,
    smsImportantAlerts: true
  });
  
  // Handle toggle change
  const handleToggle = (key) => {
    const newSettings = { ...settings };
    newSettings[key] = !newSettings[key];
    
    // Disable dependent settings if main toggle is turned off
    if (key === 'pushEnabled' && !newSettings[key]) {
      newSettings.projectUpdates = false;
      newSettings.messages = false;
      newSettings.payments = false;
    }
    
    if (key === 'emailEnabled' && !newSettings[key]) {
      newSettings.emailProjectUpdates = false;
      newSettings.emailPayments = false;
      newSettings.emailMarketing = false;
    }
    
    if (key === 'smsEnabled' && !newSettings[key]) {
      newSettings.smsImportantAlerts = false;
    }
    
    setSettings(newSettings);
  };
  
  // Render a toggle setting
  const renderToggle = (key, title, disabled = false) => {
    return (
      <View style={styles.settingItem}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Switch
          value={settings[key] || false}
          onValueChange={() => handleToggle(key)}
          disabled={disabled}
          trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          thumbColor={'#FFFFFF'}
        />
      </View>
    );
  };
  
  // Save notification settings
  const saveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Your notification settings have been saved');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Push Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          
          {renderToggle('pushEnabled', 'Enable Push Notifications')}
          
          <View style={styles.divider} />
          
          {renderToggle(
            'projectUpdates',
            'Project Updates',
            !settings.pushEnabled
          )}
          
          {renderToggle(
            'messages',
            'Messages',
            !settings.pushEnabled
          )}
          
          {renderToggle(
            'payments',
            'Payments',
            !settings.pushEnabled
          )}
        </View>
        
        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          
          {renderToggle('emailEnabled', 'Enable Email Notifications')}
          
          <View style={styles.divider} />
          
          {renderToggle(
            'emailProjectUpdates',
            'Project Updates',
            !settings.emailEnabled
          )}
          
          {renderToggle(
            'emailPayments',
            'Payment Receipts',
            !settings.emailEnabled
          )}
          
          {renderToggle(
            'emailMarketing',
            'Promotions & Newsletter',
            !settings.emailEnabled
          )}
        </View>
        
        {/* SMS Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMS Notifications</Text>
          
          {renderToggle('smsEnabled', 'Enable SMS Notifications')}
          
          <View style={styles.divider} />
          
          {renderToggle(
            'smsImportantAlerts',
            'Important Alerts',
            !settings.smsEnabled
          )}
        </View>
      </ScrollView>
      
      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  saveButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default NotificationSettingsScreen;