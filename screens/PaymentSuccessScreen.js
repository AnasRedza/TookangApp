import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { transaction, projectDetails } = route.params || {};
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Generate receipt number
  const receiptNumber = transaction?.id || Math.random().toString(36).substr(2, 9).toUpperCase();
  
  // Prevent going back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
        
        // Navigate to home or projects screen
        navigation.navigate('HomeTab');
      }
    });
    
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
        </View>
        
        {/* Success Message */}
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successMessage}>
          Your payment has been processed successfully and sent to the handyman.
        </Text>
        
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>Payment Receipt</Text>
            <Text style={styles.receiptNumber}>#{receiptNumber}</Text>
          </View>
          
          <View style={styles.receiptDivider} />
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Date & Time</Text>
            <Text style={styles.receiptValue}>{formatDate(transaction?.date || new Date())}</Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Payment Method</Text>
            <Text style={styles.receiptValue}>VISA •••• 4242</Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Service</Text>
            <Text style={styles.receiptValue}>{projectDetails?.title || 'Home Repair Service'}</Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Provider</Text>
            <Text style={styles.receiptValue}>{projectDetails?.handyman?.name || 'TooKang Handyman'}</Text>
          </View>
          
          <View style={styles.receiptDivider} />
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Amount</Text>
            <Text style={styles.receiptValue}>RM {transaction?.amount || 450}</Text>
          </View>
          
          <View style={styles.receiptFooter}>
            <View style={styles.statusChip}>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.statusText}>Paid</Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ProjectsTab')}
        >
          <Text style={styles.primaryButtonText}>View Project Status</Text>
        </TouchableOpacity>
        
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => {
          // Reset navigation stack and go to home
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }]
          });
        }}
      >
        <Text style={styles.secondaryButtonText}>Return to Home</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  receiptNumber: {
    fontSize: 14,
    color: '#666666',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 16,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666666',
  },
  receiptValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'right',
  },
  receiptFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  statusChip: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSuccessScreen;