import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { transactionService } from '../services/transactionService';

const PaymentScreen = ({ route, navigation }) => {
  const { projectDetails } = route.params || {};
  const { user } = useAuth();
   const currentProject = projectDetails || project || {};
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState([
    { id: '1', type: 'visa', lastFour: '4242', default: true },
    { id: '2', type: 'mastercard', lastFour: '5555', default: false }
  ]);
  
// Calculate total with service fee - use actual deposit amount
const depositAmount = currentProject?.depositAmount || 0;
const serviceFee = Math.round(depositAmount * 0.05);
const total = depositAmount + serviceFee;

const processPayment = async () => {
  setIsProcessing(true);
  
  try {
    // Update project status to in_progress after payment
    await projectService.updateProjectStatus(currentProject.id, 'in_progress', {
      depositPaidAt: new Date().toISOString(),
      depositPaidAmount: total,
      paymentMethod: 'direct_transfer'
    });
    
    // ADD: Record transaction
    await transactionService.recordDepositPayment(
      currentProject.id,
      user.id,
      currentProject.handymanId,
      depositAmount,
      {
        projectTitle: currentProject.title,
        customerName: user.name,
        handymanName: currentProject.handymanName,
        paymentMethod: selectedMethod === 'card' ? 'card' : selectedMethod,
        transactionId: `PAY_${Date.now()}`
      }
    );
    
    setIsProcessing(false);
    
    // Generate transaction record
    const transaction = {
      id: `PAY_${Date.now()}`,
      date: new Date().toISOString(),
      amount: total,
      description: `Deposit for ${currentProject.title}`,
      status: 'completed',
      paymentMethod: selectedMethod === 'card' ? 'card' : selectedMethod,
      projectId: currentProject.id
    };
    
    // Navigate to success screen
    navigation.navigate('PaymentSuccess', { 
      transaction: transaction,
      projectDetails: currentProject
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    setIsProcessing(false);
    Alert.alert('Error', 'Payment failed. Please try again.');
  }
};
  
 
  
  // Confirm payment
  const confirmPayment = () => {
    Alert.alert(
      'Confirm Payment',
      `Are you sure you want to make this payment of RM${total}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: processPayment }
      ]
    );
  };
  
  // Render card icon based on type
  const renderCardIcon = (type) => {
    switch(type) {
      case 'visa':
        return <Ionicons name="card" size={28} color="#1A1F71" />;
      case 'mastercard':
        return <Ionicons name="card" size={28} color="#EB001B" />;
      default:
        return <Ionicons name="card-outline" size={28} color="#333333" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Project Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        
        <View style={styles.projectSummary}>
        <Text style={styles.projectName}>{currentProject?.title || 'Deposit Payment'}</Text>
        <Text style={styles.projectProvider}>{currentProject?.handymanName || 'TooKang Handyman'}</Text>
          
          <View style={styles.divider} />
          
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Deposit Amount</Text>
          <Text style={styles.priceValue}>RM {depositAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Service Fee (5%)</Text>
          <Text style={styles.priceValue}>RM {serviceFee.toFixed(2)}</Text>
        </View>

        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>RM {total.toFixed(2)}</Text>
        </View>
        </View>
      </View>
      
      {/* Payment Methods */}
      <View style={styles.paymentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentMethodsDrawer')}>
            <Text style={styles.addNewText}>+ Add New</Text>
          </TouchableOpacity>
        </View>
        
        {/* Payment method options */}
        <View style={styles.paymentOptions}>
          {/* Credit/Debit Cards */}
          {cardDetails.map(card => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.paymentMethod,
                selectedMethod === card.id && styles.selectedMethod
              ]}
              onPress={() => setSelectedMethod(card.id)}
            >
              <View style={styles.methodDetails}>
                {renderCardIcon(card.type)}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardType}>{card.type.toUpperCase()} •••• {card.lastFour}</Text>
                  {card.default && <Text style={styles.defaultText}>Default</Text>}
                </View>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === card.id && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Online Banking */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedMethod === 'banking' && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod('banking')}
          >
            <View style={styles.methodDetails}>
              <Ionicons name="business-outline" size={28} color="#333333" />
              <Text style={styles.methodName}>Online Banking</Text>
            </View>
            <View style={styles.radioButton}>
              {selectedMethod === 'banking' && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>
          
          {/* E-Wallet */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedMethod === 'ewallet' && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod('ewallet')}
          >
            <View style={styles.methodDetails}>
              <Ionicons name="wallet-outline" size={28} color="#333333" />
              <Text style={styles.methodName}>E-Wallet</Text>
            </View>
            <View style={styles.radioButton}>
              {selectedMethod === 'ewallet' && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Payment Notes */}
      <View style={styles.notesContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#666666" />
        <Text style={styles.notesText}>
          Your payment will be processed securely and sent immediately to the handyman.
        </Text>
      </View>
      
      {/* Payment Button */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={confirmPayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.payButtonText}>Pay RM {total}</Text>
        )}
      </TouchableOpacity>
      
      {/* Security Note */}
      <View style={styles.securityContainer}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#666666" />
        <Text style={styles.securityText}>Secure Payment Processing</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  projectSummary: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  projectProvider: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  paymentSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  addNewText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  paymentOptions: {
    marginBottom: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedMethod: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  methodDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: 12,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  defaultText: {
    fontSize: 12,
    color: Colors.primary,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 24,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  securityText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },
});

export default PaymentScreen;