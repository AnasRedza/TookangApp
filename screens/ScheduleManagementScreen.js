// screens/ScheduleManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { scheduleService } from '../services/scheduleService';
import { getHandymanBusyDates } from '../utils/scheduleUtils';
import Colors from '../constants/Colors';
import { Calendar } from 'react-native-calendars'; 
import { db } from '../firebase';

const ScheduleManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [busyDates, setBusyDates] = useState([]);
  const [workingHours, setWorkingHours] = useState({
    start: 8,
    end: 18,
    daysOff: [0] // Sunday
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setIsLoading(true);
      
      // Load busy dates for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const busy = await getHandymanBusyDates(user.id, startDate, endDate);
      setBusyDates(busy);
      
      // Load working hours from user profile
      const userDoc = await db.collection('users').doc(user.id).get();
      const userData = userDoc.data();
      if (userData.workingHours) {
        setWorkingHours(userData.workingHours);
      }
      
    } catch (error) {
      console.error('Error loading schedule data:', error);
      Alert.alert('Error', 'Failed to load schedule data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkingHours = async () => {
    try {
      await scheduleService.updateWorkingHours(user.id, workingHours);
      Alert.alert('Success', 'Working hours updated successfully');
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving working hours:', error);
      Alert.alert('Error', 'Failed to update working hours');
    }
  };

  const getDayName = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const toggleDayOff = (dayIndex) => {
    const newDaysOff = workingHours.daysOff.includes(dayIndex)
      ? workingHours.daysOff.filter(d => d !== dayIndex)
      : [...workingHours.daysOff, dayIndex];
    
    setWorkingHours({ ...workingHours, daysOff: newDaysOff });
  };

  const getMarkedDates = () => {
    const marked = {};
    
    // Mark busy dates
    busyDates.forEach(busy => {
      const dateString = busy.date.toISOString().split('T')[0];
      marked[dateString] = {
        marked: true,
        dotColor: Colors.error,
        activeOpacity: 0.5,
        selectedColor: Colors.error
      };
    });
    
    // Apply days off pattern
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dayOfWeek = checkDate.getDay();
      
      if (workingHours.daysOff.includes(dayOfWeek)) {
        const dateString = checkDate.toISOString().split('T')[0];
        if (!marked[dateString]) {
          marked[dateString] = {
            textColor: Colors.textLight,
            backgroundColor: Colors.inactive
          };
        }
      }
    }
    
    return marked;
  };

  const renderSelectedDateInfo = () => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const dayOfWeek = selectedDate.getDay();
    const isDayOff = workingHours.daysOff.includes(dayOfWeek);
    
    const busyOnDate = busyDates.filter(busy => 
      busy.date.toDateString() === selectedDate.toDateString()
    );

    return (
      <View style={styles.selectedDateInfo}>
        <Text style={styles.selectedDateTitle}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {isDayOff ? (
          <View style={styles.dayOffIndicator}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            <Text style={styles.dayOffText}>Day Off</Text>
          </View>
        ) : busyOnDate.length > 0 ? (
          <View style={styles.busyIndicator}>
            <Ionicons name="time" size={20} color={Colors.error} />
            <Text style={styles.busyText}>
              Busy - {busyOnDate.length} project{busyOnDate.length > 1 ? 's' : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.availableIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.availableText}>Available</Text>
          </View>
        )}

        {busyOnDate.length > 0 && (
          <View style={styles.projectsList}>
            <Text style={styles.projectsTitle}>Scheduled Projects:</Text>
            {busyOnDate.map((busy, index) => (
              <TouchableOpacity
                key={index}
                style={styles.projectItem}
                onPress={() => {
                  // Navigate to project details
                  navigation.navigate('ProjectDetails', { 
                    projectId: busy.projectId 
                  });
                }}
              >
                <Text style={styles.projectTitle}>{busy.projectTitle}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Ionicons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Calendar */}
        <Calendar
          current={selectedDate.toISOString().split('T')[0]}
          onDayPress={(day) => setSelectedDate(new Date(day.timestamp))}
          markingType="multi-dot"
          markedDates={getMarkedDates()}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: Colors.primary,
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: Colors.primary,
            dayTextColor: Colors.textDark,
            textDisabledColor: Colors.textLight,
            arrowColor: Colors.primary,
            monthTextColor: Colors.textDark,
            indicatorColor: Colors.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600'
          }}
        />

        {/* Selected Date Information */}
        {renderSelectedDateInfo()}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{busyDates.length}</Text>
            <Text style={styles.statLabel}>Scheduled Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {busyDates.filter(b => b.date > new Date()).length}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {7 - workingHours.daysOff.length}
            </Text>
            <Text style={styles.statLabel}>Work Days/Week</Text>
          </View>
        </View>
      </ScrollView>

      {/* Working Hours Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Working Hours Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Working Hours */}
              <Text style={styles.sectionTitle}>Working Hours</Text>
              <View style={styles.timePickerContainer}>
                <View style={styles.timePicker}>
                  <Text style={styles.timeLabel}>Start Time</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => {
                      // You might want to implement a time picker here
                      Alert.alert('Time Picker', 'Time picker implementation needed');
                    }}
                  >
                    <Text style={styles.timeText}>
                      {workingHours.start}:00 AM
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.timePicker}>
                  <Text style={styles.timeLabel}>End Time</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => {
                      Alert.alert('Time Picker', 'Time picker implementation needed');
                    }}
                  >
                    <Text style={styles.timeText}>
                      {workingHours.end > 12 ? workingHours.end - 12 : workingHours.end}:00 {workingHours.end >= 12 ? 'PM' : 'AM'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Days Off */}
              <Text style={styles.sectionTitle}>Days Off</Text>
              <Text style={styles.sectionSubtitle}>Select the days you're not available for work</Text>
              
              {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                <View key={dayIndex} style={styles.dayOffItem}>
                  <Text style={styles.dayName}>{getDayName(dayIndex)}</Text>
                  <Switch
                    value={workingHours.daysOff.includes(dayIndex)}
                    onValueChange={() => toggleDayOff(dayIndex)}
                    trackColor={{ false: Colors.inactive, true: Colors.primary }}
                    thumbColor={workingHours.daysOff.includes(dayIndex) ? '#FFFFFF' : '#f4f3f4'}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowSettingsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveWorkingHours}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textMedium,
  },
  content: {
    flex: 1,
  },
  selectedDateInfo: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  dayOffIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayOffText: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 8,
  },
  busyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  busyText: {
    fontSize: 16,
    color: Colors.error,
    marginLeft: 8,
  },
  availableIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availableText: {
    fontSize: 16,
    color: Colors.success,
    marginLeft: 8,
  },
  projectsList: {
    marginTop: 16,
  },
  projectsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 14,
    color: Colors.textDark,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMedium,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 16,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timePicker: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '500',
  },
  dayOffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayName: {
    fontSize: 16,
    color: Colors.textDark,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textMedium,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ScheduleManagementScreen;