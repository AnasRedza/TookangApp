import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { transactionService } from '../services/transactionService';
import { toyyibPayService } from '../services/toyyibPayService';

const PaymentScreen = ({ route, navigation }) => {
  const { projectDetails } = route.params || {};
  const { user } = useAuth();
  const currentProject = projectDetails || {};
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [billCode, setBillCode] = useState('');
  const [transactionIds, setTransactionIds] = useState({ customer: null, handyman: null });
  const webViewRef = useRef(null);
  
  // Calculate total with service fee - use actual deposit amount
  const depositAmount = currentProject?.depositAmount || 0;
  const serviceFee = Math.round(depositAmount * 0.05);
  const total = depositAmount + serviceFee;

  // Enhanced payment method mapping with proper channel codes
  const getPaymentChannel = (method) => {
    switch(method) {
      case 'card':
        return '0'; // All channels (but we'll add URL parameters to filter)
      case 'banking':
        return '2'; // Online Banking only
      case 'ewallet':
        return '1'; // E-Wallet only (Touch 'n Go, Boost, etc.)
      default:
        return '0'; // All channels
    }
  };

  // Get payment method display info
  const getPaymentMethodInfo = (method) => {
    switch(method) {
      case 'card':
        return {
          name: 'Credit/Debit Card',
          icon: 'card-outline',
          description: 'Visa, Mastercard, etc.'
        };
      case 'banking':
        return {
          name: 'Online Banking',
          icon: 'business-outline',
          description: 'Maybank, CIMB, Public Bank, etc.'
        };
      case 'ewallet':
        return {
          name: 'E-Wallet',
          icon: 'wallet-outline',
          description: 'Touch \'n Go, Boost, GrabPay, etc.'
        };
      default:
        return {
          name: 'Payment',
          icon: 'card-outline',
          description: 'Multiple options'
        };
    }
  };

  // Helper function to create a short bill name
  const createBillName = (projectTitle) => {
    const prefix = "Deposit - ";
    const maxLength = 30;
    const availableLength = maxLength - prefix.length;
    
    if (projectTitle.length <= availableLength) {
      return prefix + projectTitle;
    }
    
    // Truncate and add ellipsis
    return prefix + projectTitle.substring(0, availableLength - 3) + "...";
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log(`Processing payment with method: ${selectedMethod}`);
      
      // First create the transaction records in Firebase
      console.log('Creating transaction records...');
      const transactionResult = await transactionService.recordDepositPayment(
        currentProject.id,
        user.id,
        currentProject.handymanId,
        depositAmount,
        {
          projectTitle: currentProject.title,
          customerName: user.name,
          handymanName: currentProject.handymanName,
          paymentMethod: selectedMethod,
          status: 'pending',
          transactionId: `PAY_${Date.now()}`
        }
      );

      // Store transaction IDs
      setTransactionIds({
        customer: transactionResult.customerTransaction.id,
        handyman: transactionResult.handymanTransaction.id
      });

      // Create toyyibPay bill with proper channel filtering
      const paymentChannel = getPaymentChannel(selectedMethod);
      const billData = {
        billName: createBillName(currentProject.title),
        billDescription: `Deposit payment for handyman service: ${currentProject.title}`,
        amount: total,
        customerName: user.name || user.displayName || 'Customer',
        customerEmail: user.email,
        customerPhone: (user.phoneNumber || '0123456789').substring(0, 15),
        referenceNo: `PROJ_${currentProject.id}_${Date.now()}`,
        returnUrl: 'https://yourapp.com/payment/success',
        callbackUrl: 'https://yourapp.com/api/payment/callback',
        expiryDays: 1,
        paymentChannel: paymentChannel // This will filter available payment methods
      };

      console.log('Creating toyyibPay bill with data:', billData);
      console.log(`Selected payment method: ${selectedMethod}, Channel: ${paymentChannel}`);
      
      const response = await toyyibPayService.createBill(billData);
      
      if (response && response[0]?.BillCode) {
        const newBillCode = response[0].BillCode;
        setBillCode(newBillCode);
        
        // Update both transactions with the bill code
        await Promise.all([
          transactionService.updateTransactionStatus(
            transactionResult.customerTransaction.id,
            'pending',
            { 
              toyyibPayBillCode: newBillCode,
              selectedPaymentMethod: selectedMethod,
              paymentChannel: paymentChannel
            }
          ),
          transactionService.updateTransactionStatus(
            transactionResult.handymanTransaction.id,
            'pending',
            { 
              toyyibPayBillCode: newBillCode,
              selectedPaymentMethod: selectedMethod,
              paymentChannel: paymentChannel
            }
          )
        ]);
        
        // Create payment URL with additional filtering parameters
        let paymentURL = `https://dev.toyyibpay.com/${newBillCode}`;
        
        // Add URL parameters for better payment method filtering
        if (selectedMethod === 'card') {
          paymentURL += '?payment_type=card';
        } else if (selectedMethod === 'banking') {
          paymentURL += '?payment_type=fpx';
        } else if (selectedMethod === 'ewallet') {
          paymentURL += '?payment_type=ewallet';
        }
        
        console.log(`Opening payment URL: ${paymentURL}`);
        setPaymentUrl(paymentURL);
        setShowWebView(true);
        setIsProcessing(false);
        
      } else {
        throw new Error('Failed to create payment bill');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setIsProcessing(false);
      Alert.alert(
        'Payment Error', 
        'Failed to initiate payment. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log('WebView navigation:', url);
    
    // Check for payment completion indicators
    if (url.includes('payment/success') || 
        url.includes('status_id=1') || 
        url.includes('transaction_status=1')) {
      setShowWebView(false);
      handlePaymentSuccess();
    } else if (url.includes('payment/failed') || 
               url.includes('status_id=3') ||
               url.includes('transaction_status=3')) {
      setShowWebView(false);
      handlePaymentFailure();
    }
  };

  const handleWebViewLoadEnd = (navState) => {
    const { url } = navState.nativeEvent;
    console.log('WebView load end:', url);
    
    // Check for payment completion in load end event as well
    if (url.includes('payment/success') || 
        url.includes('status_id=1') || 
        url.includes('transaction_status=1')) {
      setShowWebView(false);
      handlePaymentSuccess();
    } else if (url.includes('payment/failed') || 
               url.includes('status_id=3') ||
               url.includes('transaction_status=3')) {
      setShowWebView(false);
      handlePaymentFailure();
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log('Processing payment success...');
      
      // Update project status to in_progress after payment
      await projectService.updateProjectStatus(currentProject.id, 'in_progress', {
        depositPaidAt: new Date().toISOString(),
        depositPaidAmount: total,
        paymentMethod: selectedMethod,
        toyyibPayBillCode: billCode
      });
      
      // Update transaction statuses using the stored transaction IDs
      if (transactionIds.customer && transactionIds.handyman) {
        await Promise.all([
          transactionService.updateTransactionStatus(
            transactionIds.customer,
            'completed',
            {
              completedAt: new Date().toISOString(),
              paidAmount: total
            }
          ),
          transactionService.updateTransactionStatus(
            transactionIds.handyman,
            'completed',
            {
              completedAt: new Date().toISOString(),
              paidAmount: total
            }
          )
        ]);
      } else {
        // Fallback: update by bill code if transaction IDs not available
        await transactionService.updateTransactionStatusByBillCode(
          billCode,
          'completed',
          {
            completedAt: new Date().toISOString(),
            paidAmount: total
          }
        );
      }
      
      // Generate transaction record for success screen
      const transaction = {
        id: `PAY_${Date.now()}`,
        date: new Date().toISOString(),
        amount: total,
        description: `Deposit for ${currentProject.title}`,
        status: 'completed',
        paymentMethod: selectedMethod,
        projectId: currentProject.id,
        billCode: billCode
      };
      
      // Navigate to success screen
      navigation.replace('PaymentSuccess', { 
        transaction: transaction,
        projectDetails: currentProject
      });
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Success', 'Payment completed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const handlePaymentFailure = async () => {
    try {
      console.log('Processing payment failure...');
      
      // Update transaction statuses
      if (transactionIds.customer && transactionIds.handyman) {
        await Promise.all([
          transactionService.updateTransactionStatus(
            transactionIds.customer,
            'failed',
            { failedAt: new Date().toISOString() }
          ),
          transactionService.updateTransactionStatus(
            transactionIds.handyman,
            'failed',
            { failedAt: new Date().toISOString() }
          )
        ]);
      } else if (billCode) {
        // Fallback: update by bill code
        await transactionService.updateTransactionStatusByBillCode(
          billCode,
          'failed',
          { failedAt: new Date().toISOString() }
        );
      }
    } catch (error) {
      console.error('Error updating failed payment:', error);
    }
    
    Alert.alert(
      'Payment Failed',
      'Your payment was not successful. Please try again.',
      [
        {
          text: 'Retry',
          onPress: () => {
            setBillCode('');
            setPaymentUrl('');
            setTransactionIds({ customer: null, handyman: null });
            confirmPayment();
          }
        },
        {
          text: 'Cancel',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleWebViewError = (error) => {
    console.error('WebView error:', error);
    
    // Check if the error occurred on a success URL (which means payment was successful)
    const url = error.nativeEvent?.url || '';
    console.log('Error URL:', url);
    
    if (url.includes('payment/success') || 
        url.includes('status_id=1') || 
        url.includes('transaction_status=1')) {
      console.log('Payment success detected in error URL');
      setShowWebView(false);
      handlePaymentSuccess();
      return;
    }
    
    // Only show error alert for actual errors (not success redirect errors)
    if (!url.includes('yourapp.com')) {
      setShowWebView(false);
      Alert.alert(
        'Connection Error',
        'Unable to load payment page. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: confirmPayment },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    }
  };
  
  // Confirm payment with method-specific messaging
  const confirmPayment = () => {
    const methodInfo = getPaymentMethodInfo(selectedMethod);
    Alert.alert(
      'Confirm Payment',
      `Pay RM${total.toFixed(2)} using ${methodInfo.name}?\n\n${methodInfo.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: processPayment }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
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
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          </View>
          
          {/* Payment method options */}
          <View style={styles.paymentOptions}>
            {/* Credit/Debit Cards */}
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedMethod === 'card' && styles.selectedMethod
              ]}
              onPress={() => setSelectedMethod('card')}
            >
              <View style={styles.methodDetails}>
                <Ionicons name="card-outline" size={28} color="#333333" />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Credit/Debit Card</Text>
                  <Text style={styles.methodDescription}>Visa, Mastercard, etc.</Text>
                </View>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === 'card' && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
            
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
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Online Banking</Text>
                  <Text style={styles.methodDescription}>Maybank, CIMB, Public Bank, etc.</Text>
                </View>
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
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>E-Wallet</Text>
                  <Text style={styles.methodDescription}>Touch 'n Go, Boost, GrabPay, etc.</Text>
                </View>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === 'ewallet' && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Selected method info */}
          {selectedMethod && (
            <View style={styles.selectedMethodInfo}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.selectedMethodText}>
                You selected {getPaymentMethodInfo(selectedMethod).name}
              </Text>
            </View>
          )}
        </View>
        
        {/* Payment Notes */}
        <View style={styles.notesContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666666" />
          <Text style={styles.notesText}>
            Your payment will be processed securely through toyyibPay gateway. You will be redirected to complete the payment using your selected method.
          </Text>
        </View>
        
        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={confirmPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.loadingText}>Preparing payment...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              Pay RM {total.toFixed(2)} via {getPaymentMethodInfo(selectedMethod).name}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Security Note */}
        <View style={styles.securityContainer}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#666666" />
          <Text style={styles.securityText}>Secure Payment Processing via toyyibPay</Text>
        </View>
      </ScrollView>

      {/* toyyibPay WebView Modal */}
      <Modal 
        visible={showWebView} 
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Alert.alert(
                  'Cancel Payment',
                  'Are you sure you want to cancel this payment?',
                  [
                    { text: 'Continue Payment', style: 'cancel' },
                    { 
                      text: 'Cancel', 
                      onPress: () => {
                        setShowWebView(false);
                        navigation.goBack();
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>
              Pay via {getPaymentMethodInfo(selectedMethod).name}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            onLoadEnd={handleWebViewLoadEnd}
            onError={handleWebViewError}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.webViewLoadingText}>
                  Loading {getPaymentMethodInfo(selectedMethod).name} payment page...
                </Text>
              </View>
            )}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            // Add these props to handle the redirect issues
            onShouldStartLoadWithRequest={(request) => {
              console.log('Should start load with request:', request.url);
              
              // Check for success/failure in the request URL
              if (request.url.includes('payment/success') || 
                  request.url.includes('status_id=1')) {
                handlePaymentSuccess();
                return false; // Don't load the URL
              } else if (request.url.includes('payment/failed') || 
                         request.url.includes('status_id=3')) {
                handlePaymentFailure();
                return false; // Don't load the URL
              }
              
              return true; // Allow other URLs to load
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {
    flex: 1,
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
    flex: 1,
  },
  methodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 13,
    color: '#666666',
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
  selectedMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.highlight,
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  selectedMethodText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
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
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  // WebView styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  webViewLoadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default PaymentScreen;