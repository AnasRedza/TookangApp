import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const NotificationSettingsScreen = ({ navigation }) => {
  const { userType } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Fetch the user's current notification settings
  useEffect(() => {
    fetchNotificationSettings();
    
    // Add listener for when the user attempts to navigate away with unsaved changes
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        // If no changes, don't prevent leaving the screen
        return;
      }
      
      // Prevent default navigation behavior
      e.preventDefault();
      
      // Show confirmation dialog
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          {
            text: 'Stay',
            style: 'cancel',
            onPress: () => {}
          },
          {
            text: 'Discard',
            style: 'destructive',
            // If the user confirms, then navigate away
            onPress: () => navigation.dispatch(e.data.action)
          }
        ]
      );
    });
    
    // Clean up the event listener
    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);
  
  // Fetch notification settings (mock)
  const fetchNotificationSettings = () => {
    // Simulate API call
    setTimeout(() => {
      let mockSettings;
      
      if (userType === 'customer') {
        mockSettings = {
          // Push notification settings
          pushEnabled: true,
          newMessagePush: true,
          handymanResponsePush: true,
          projectUpdatePush: true,
          specialOffersPush: false,
          
          // Email notification settings
          emailEnabled: true,
          newMessageEmail: false,
          handymanResponseEmail: true,
          projectUpdateEmail: true,
          receiptEmail: true,
          newsletterEmail: false,
          
          // SMS notification settings
          smsEnabled: false,
          projectUpdateSMS: false,
          securityAlertsSMS: true,
          
          // Time preferences
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        };
      } else {
        // Handyman settings
        mockSettings = {
          // Push notification settings
          pushEnabled: true,
          newProjectPush: true,
          newMessagePush: true,
          projectAssignedPush: true,
          paymentReceivedPush: true,
          reviewReceivedPush: true,
          
          // Email notification settings
          emailEnabled: true,
          newProjectEmail: true,
          newMessageEmail: false,
          projectAssignedEmail: true,
          paymentReceivedEmail: true,
          reviewReceivedEmail: false,
          
          // SMS notification settings
          smsEnabled: false,
          projectAssignedSMS: true,
          paymentReceivedSMS: true,
          
          // Time preferences
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        };
      }
      
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle toggle change
  const handleToggle = (key) => {
    const newSettings = { ...settings };
    newSettings[key] = !newSettings[key];
    
    // Special handling for main toggles
    if (key === 'pushEnabled' && !newSettings[key]) {
      // If turning off push, disable all push notifications
      Object.keys(newSettings).forEach((settingKey) => {
        if (settingKey.includes('Push') && settingKey !== 'pushEnabled') {
          newSettings[settingKey] = false;
        }
      });
    } else if (key === 'emailEnabled' && !newSettings[key]) {
      // If turning off email, disable all email notifications
      Object.keys(newSettings).forEach((settingKey) => {
        if (settingKey.includes('Email') && settingKey !== 'emailEnabled') {
          newSettings[settingKey] = false;
        }
      });
    } else if (key === 'smsEnabled' && !newSettings[key]) {
      // If turning off SMS, disable all SMS notifications
      Object.keys(newSettings).forEach((settingKey) => {
        if (settingKey.includes('SMS') && settingKey !== 'smsEnabled') {
          newSettings[settingKey] = false;
        }
      });
    }
    
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };
  
  // Handle time preference change
  const handleTimeChange = (key, value) => {
    const newSettings = { ...settings };
    newSettings[key] = value;
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };
  
  // Save notification settings
  const saveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      
      Alert.alert(
        'Settings Saved',
        'Your notification preferences have been updated successfully.',
        [{ text: 'OK' }]
      );
    }, 1000);
  };
  
  // Render a notification setting toggle
  const renderSettingToggle = (key, title, description = null, disabled = false) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
        <Switch
          value={settings[key] || false}
          onValueChange={() => handleToggle(key)}
          disabled={disabled}
          trackColor={{ false: '#D1D1D6', true: Colors.primary + '80' }}
          thumbColor={settings[key] ? Colors.primary : '#F4F4F4'}
        />
      </View>
    );
  };
  
  // Render time selector
  const renderTimeSelector = (startKey, endKey, title, description = null, disabled = false) => {
    // Time options
    const timeOptions = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
      '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
    
    // Format time for display
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return (
      <View style={[styles.settingItem, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
        
        <View style={styles.timeRangeContainer}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerLabel}>From</Text>
            <TouchableOpacity
              style={styles.timePicker}
              disabled={disabled}
              onPress={() => {
                if (disabled) return;
                
                Alert.alert(
                  'Select Start Time',
                  '',
                  timeOptions.map(time => ({
                    text: formatTime(time),
                    onPress: () => handleTimeChange(startKey, time)
                  }))
                );
              }}
            >
              <Text style={styles.timePickerText}>
                {settings[startKey] ? formatTime(settings[startKey]) : 'Select time'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerLabel}>To</Text>
            <TouchableOpacity
              style={styles.timePicker}
              disabled={disabled}
              onPress={() => {
                if (disabled) return;
                
                Alert.alert(
                  'Select End Time',
                  '',
                  timeOptions.map(time => ({
                    text: formatTime(time),
                    onPress: () => handleTimeChange(endKey, time)
                  }))
                );
              }}
            >
              <Text style={styles.timePickerText}>
                {settings[endKey] ? formatTime(settings[endKey]) : 'Select time'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  // Render customer notification settings
  const renderCustomerSettings = () => {
    return (
      <>
        {/* Push Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Push Notifications</Text>
          </View>
          
          {renderSettingToggle(
            'pushEnabled',
            'Enable Push Notifications',
            'Receive notifications on your device for important updates'
          )}
          
          {renderSettingToggle(
            'newMessagePush',
            'New Messages',
            'Get notified when handymen send you messages',
            !settings.pushEnabled
          )}
          
          {renderSettingToggle(
            'handymanResponsePush',
            'Handyman Responses',
            'Get notified when handymen respond to your project requests',
            !settings.pushEnabled
          )}
          
          {renderSettingToggle(
            'projectUpdatePush',
            'Project Updates',
            'Get notified about changes to your project status',
            !settings.pushEnabled
          )}
          
          {renderSettingToggle(
            'specialOffersPush',
            'Special Offers',
            'Receive promotions and special offer notifications',
            !settings.pushEnabled
          )}
        </View>
        
        {/* Email Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Email Notifications</Text>
          </View>
          
          {renderSettingToggle(
            'emailEnabled',
            'Enable Email Notifications',
            'Receive important updates via email'
          )}
          
          {renderSettingToggle(
            'newMessageEmail',
            'New Messages',
            'Get notified when handymen send you messages',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'handymanResponseEmail',
            'Handyman Responses',
            'Get notified when handymen respond to your project requests',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'projectUpdateEmail',
            'Project Updates',
            'Get notified about changes to your project status',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'receiptEmail',
            'Payment Receipts',
            'Receive receipts for payments made',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'newsletterEmail',
            'Newsletter',
            'Receive our monthly newsletter with tips and offers',
            !settings.emailEnabled
          )}
        </View>
        
        {/* SMS Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>SMS Notifications</Text>
          </View>
          
          {renderSettingToggle(
            'smsEnabled',
            'Enable SMS Notifications',
            'Receive critical updates via SMS (carrier charges may apply)'
          )}
          
          {renderSettingToggle(
            'projectUpdateSMS',
            'Project Updates',
            'Get SMS alerts for important project updates',
            !settings.smsEnabled
          )}
          
          {renderSettingToggle(
            'securityAlertsSMS',
            'Security Alerts',
            'Get SMS alerts for account security events',
            !settings.smsEnabled
          )}
        </View>
        
        {/* Time Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Time Preferences</Text>
          </View>
          
          {renderSettingToggle(
            'quietHoursEnabled',
            'Enable Quiet Hours',
            'Silence push notifications during specified hours'
          )}
          
          {renderTimeSelector(
            'quietHoursStart',
            'quietHoursEnd',
            'Quiet Hours',
            'No push notifications will be sent during these hours',
            !settings.quietHoursEnabled
          )}
        </View>
      </>
    );
  };
  
  // Render handyman notification settings
  const renderHandymanSettings = () => {
    return (
      <>
        {/* Push Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Push Notifications</Text>
          </View>
          
          {renderSettingToggle(
            'pushEnabled',
            'Enable Push Notifications',
            'Receive notifications on your device for important updates'
          )}
          
          {renderSettingToggle(
            'newProjectPush',
            'New Projects',
            'Get notified when new projects matching your skills are posted',
            !settings.pushEnabled
          )}
          
          {renderSettingToggle(
            'newMessagePush',
            'New Messages',
            'Get notified when customers send you messages',
            !settings.pushEnabled
          )}
          
          {renderSettingToggle(
            'projectAssignedPush',
            'Project Assignments',
            'Get notified when your offer is accepted',
            !settings.pushEnabled
          )}
          
          {renderSettingToggle(
            'paymentReceivedPush',
            'Payment Received',
            'Get notified when you receive payment',
            !settings.pushEnabled
          )}
          
          {renderSettingToggle(
            'reviewReceivedPush',
            'Review Received',
            'Get notified when customers leave reviews',
            !settings.pushEnabled
          )}
        </View>
        
        {/* Email Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Email Notifications</Text>
          </View>
          
          {renderSettingToggle(
            'emailEnabled',
            'Enable Email Notifications',
            'Receive important updates via email'
          )}
          
          {renderSettingToggle(
            'newProjectEmail',
            'New Projects',
            'Get notified when new projects matching your skills are posted',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'newMessageEmail',
            'New Messages',
            'Get notified when customers send you messages',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'projectAssignedEmail',
            'Project Assignments',
            'Get notified when your offer is accepted',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'paymentReceivedEmail',
            'Payment Received',
            'Get notified when you receive payment',
            !settings.emailEnabled
          )}
          
          {renderSettingToggle(
            'reviewReceivedEmail',
            'Review Received',
            'Get notified when customers leave reviews',
            !settings.emailEnabled
          )}
        </View>
        
        {/* SMS Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>SMS Notifications</Text>
          </View>
          
          {renderSettingToggle(
            'smsEnabled',
            'Enable SMS Notifications',
            'Receive critical updates via SMS (carrier charges may apply)'
          )}
          
          {renderSettingToggle(
            'projectAssignedSMS',
            'Project Assignments',
            'Get SMS alerts when your offer is accepted',
            !settings.smsEnabled
          )}
          
          {renderSettingToggle(
            'paymentReceivedSMS',
            'Payment Received',
            'Get SMS alerts when you receive payment',
            !settings.smsEnabled
          )}
        </View>
        
        {/* Time Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Time Preferences</Text>
          </View>
          
          {renderSettingToggle(
            'quietHoursEnabled',
            'Enable Quiet Hours',
            'Silence push notifications during specified hours'
          )}
          
          {renderTimeSelector(
            'quietHoursStart',
            'quietHoursEnd',
            'Quiet Hours',
            'No push notifications will be sent during these hours',
            !settings.quietHoursEnabled
          )}
        </View>
      </>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your preferences...</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notification Preferences</Text>
              <Text style={styles.headerDescription}>
                Customize how and when you receive notifications
              </Text>
            </View>
            
            {userType === 'customer' ? renderCustomerSettings() : renderHandymanSettings()}
            
            <View style={styles.footerSpace} />
          </ScrollView>
          
          {hasUnsavedChanges && (
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  timePickerContainer: {
    marginRight: 20,
  },
  timePickerLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  timePickerText: {
    fontSize: 14,
    color: '#333333',
  },
  saveButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
    fontWeight: 'bold',
  },
  footerSpace: {
    height: 80,
  },
});

export default NotificationSettingsScreen;