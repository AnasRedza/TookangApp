import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const PaymentScreen = ({ route, navigation }) => {
  const { project, total = 150.00 } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Validate the card details
  const validateForm = () => {
    const newErrors = {};
    
    // Validate card number
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s+/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    // Validate card name
    if (!cardName) {
      newErrors.cardName = 'Name on card is required';
    }
    
    // Validate expiry date
    if (!expiryMonth) {
      newErrors.expiryMonth = 'Required';
    } else if (parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      newErrors.expiryMonth = 'Invalid';
    }
    
    if (!expiryYear) {
      newErrors.expiryYear = 'Required';
    } else if (expiryYear.length !== 2) {
      newErrors.expiryYear = 'Invalid';
    }
    
    // Validate CVV
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Process payment
  const processPayment = () => {
    if (paymentMethod === 'card' && !validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      
      // Navigate to payment success screen
      navigation.navigate('PaymentSuccess', { 
        project: project || { title: 'Service Payment' }, 
        transactionId: 'TRX-' + Math.floor(Math.random() * 1000000)
      });
    }, 1500);
  };
  
  // Get card type based on first digit
  const getCardType = () => {
    if (!cardNumber) return null;
    
    const firstDigit = cardNumber.replace(/\s+/g, '').charAt(0);
    
    switch (firstDigit) {
      case '4':
        return 'Visa';
      case '5':
        return 'Mastercard';
      case '3':
        return 'Amex';
      case '6':
        return 'Discover';
      default:
        return null;
    }
  };
  
  // Get card icon based on card type
  const getCardIcon = () => {
    const cardType = getCardType();
    
    switch (cardType) {
      case 'Visa':
        return 'card';
      case 'Mastercard':
        return 'card';
      case 'Amex':
        return 'card';
      case 'Discover':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Payment</Text>
            <Text style={styles.projectTitle}>
              {project ? project.title : 'Service Payment'}
            </Text>
          </View>
          
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>RM {total.toFixed(2)}</Text>
            <Text style={styles.secure}>
              <Ionicons name="lock-closed" size={14} color="#4CAF50" />
              {' '}Secure Payment via TooKang Escrow
            </Text>
          </View>
          
          <View style={styles.paymentMethodsSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity 
              style={[
                styles.paymentMethodItem, 
                paymentMethod === 'card' && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons name="card-outline" size={24} color="#555" />
              <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
              {paymentMethod === 'card' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentMethodItem, 
                paymentMethod === 'fpx' && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod('fpx')}
            >
              <Ionicons name="cash-outline" size={24} color="#555" />
              <Text style={styles.paymentMethodText}>FPX Online Banking</Text>
              {paymentMethod === 'fpx' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentMethodItem, 
                paymentMethod === 'ewallet' && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod('ewallet')}
            >
              <Ionicons name="wallet-outline" size={24} color="#555" />
              <Text style={styles.paymentMethodText}>E-Wallet</Text>
              {paymentMethod === 'ewallet' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          {paymentMethod === 'card' && (
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Card Details</Text>
              
              <View style={styles.cardInputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={[
                  styles.cardNumberContainer,
                  errors.cardNumber && styles.inputError
                ]}>
                  <Ionicons 
                    name={getCardIcon()} 
                    size={22} 
                    color="#999" 
                    style={styles.cardIcon}
                  />
                  <TextInput
                    style={styles.cardNumberInput}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    maxLength={19} // 16 digits + 3 spaces
                    value={cardNumber}
                    onChangeText={(text) => {
                      const formatted = formatCardNumber(text);
                      setCardNumber(formatted);
                      if (errors.cardNumber) {
                        const newErrors = {...errors};
                        delete newErrors.cardNumber;
                        setErrors(newErrors);
                      }
                    }}
                  />
                  {getCardType() && (
                    <Text style={styles.cardType}>{getCardType()}</Text>
                  )}
                </View>
                {errors.cardNumber && (
                  <Text style={styles.errorText}>{errors.cardNumber}</Text>
                )}
              </View>
              
              <View style={styles.cardInputGroup}>
                <Text style={styles.inputLabel}>Name on Card</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.cardName && styles.inputError
                  ]}
                  placeholder="JOHN SMITH"
                  autoCapitalize="characters"
                  value={cardName}
                  onChangeText={(text) => {
                    setCardName(text);
                    if (errors.cardName) {
                      const newErrors = {...errors};
                      delete newErrors.cardName;
                      setErrors(newErrors);
                    }
                  }}
                />
                {errors.cardName && (
                  <Text style={styles.errorText}>{errors.cardName}</Text>
                )}
              </View>
              
              <View style={styles.cardDetailsRow}>
                <View style={styles.expiryContainer}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <View style={styles.expiryInputContainer}>
                    <TextInput
                      style={[
                        styles.expiryInput,
                        errors.expiryMonth && styles.inputError
                      ]}
                      placeholder="MM"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={expiryMonth}
                      onChangeText={(text) => {
                        setExpiryMonth(text);
                        if (errors.expiryMonth) {
                          const newErrors = {...errors};
                          delete newErrors.expiryMonth;
                          setErrors(newErrors);
                        }
                      }}
                    />
                    <Text style={styles.expirySlash}>/</Text>
                    <TextInput
                      style={[
                        styles.expiryInput,
                        errors.expiryYear && styles.inputError
                      ]}
                      placeholder="YY"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={expiryYear}
                      onChangeText={(text) => {
                        setExpiryYear(text);
                        if (errors.expiryYear) {
                          const newErrors = {...errors};
                          delete newErrors.expiryYear;
                          setErrors(newErrors);
                        }
                      }}
                    />
                  </View>
                  {(errors.expiryMonth || errors.expiryYear) && (
                    <Text style={styles.errorText}>
                      Please enter a valid expiry date
                    </Text>
                  )}
                </View>
                
                <View style={styles.cvvContainer}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={[
                      styles.cvvInput,
                      errors.cvv && styles.inputError
                    ]}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    value={cvv}
                    onChangeText={(text) => {
                      setCvv(text);
                      if (errors.cvv) {
                        const newErrors = {...errors};
                        delete newErrors.cvv;
                        setErrors(newErrors);
                      }
                    }}
                  />
                  {errors.cvv && (
                    <Text style={styles.errorText}>{errors.cvv}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.saveCardContainer}>
                <View style={styles.checkboxContainer}>
                  <Ionicons name="checkbox-outline" size={20} color={Colors.primary} />
                  <Text style={styles.saveCardText}>Save card for future payments</Text>
                </View>
              </View>
            </View>
          )}
          
          {paymentMethod === 'fpx' && (
            <View style={styles.fpxSection}>
              <Text style={styles.sectionTitle}>Select Your Bank</Text>
              
              <View style={styles.bankGrid}>
                {['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong', 'AmBank'].map((bank) => (
                  <TouchableOpacity
                    key={bank}
                    style={styles.bankItem}
                    onPress={() => Alert.alert('Bank Selected', `You selected ${bank}. In a real app, this would redirect to your bank's login page.`)}
                  >
                    <View style={styles.bankIconContainer}>
                      <Ionicons name="business-outline" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.bankName}>{bank}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {paymentMethod === 'ewallet' && (
            <View style={styles.ewalletSection}>
              <Text style={styles.sectionTitle}>Select E-Wallet</Text>
              
              <TouchableOpacity
                style={styles.ewalletOption}
                onPress={() => Alert.alert('E-Wallet Selected', 'You selected Touch n Go. In a real app, this would redirect to the e-wallet authentication page.')}
              >
                <View style={styles.ewalletIconContainer}>
                  <Ionicons name="wallet-outline" size={32} color="#00B2FF" />
                </View>
                <View style={styles.ewalletDetails}>
                  <Text style={styles.ewalletName}>Touch n Go eWallet</Text>
                  <Text style={styles.ewalletInfo}>Link your TnG eWallet account</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.ewalletOption}
                onPress={() => Alert.alert('E-Wallet Selected', 'You selected GrabPay. In a real app, this would redirect to the e-wallet authentication page.')}
              >
                <View style={[styles.ewalletIconContainer, { backgroundColor: 'rgba(0, 177, 64, 0.1)' }]}>
                  <Ionicons name="wallet-outline" size={32} color="#00B140" />
                </View>
                <View style={styles.ewalletDetails}>
                  <Text style={styles.ewalletName}>GrabPay</Text>
                  <Text style={styles.ewalletInfo}>Link your Grab account</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.ewalletOption}
                onPress={() => Alert.alert('E-Wallet Selected', 'You selected Boost. In a real app, this would redirect to the e-wallet authentication page.')}
              >
                <View style={[styles.ewalletIconContainer, { backgroundColor: 'rgba(235, 0, 139, 0.1)' }]}>
                  <Ionicons name="wallet-outline" size={32} color="#EB008B" />
                </View>
                <View style={styles.ewalletDetails}>
                  <Text style={styles.ewalletName}>Boost</Text>
                  <Text style={styles.ewalletInfo}>Link your Boost account</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.bottomSpace} />
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              (paymentMethod === 'card' && !cardNumber) && styles.disabledButton,
              isProcessing && styles.processingButton
            ]}
            onPress={processPayment}
            disabled={isProcessing || (paymentMethod === 'card' && !cardNumber)}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay Now (RM {total.toFixed(2)})</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  projectTitle: {
    fontSize: 16,
    color: '#666',
  },
  amountSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  secure: {
    fontSize: 14,
    color: '#4CAF50',
  },
  paymentMethodsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedPaymentMethod: {
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 20,
  },
  cardInputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E53935',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardNumberInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  cardType: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  expiryContainer: {
    width: '60%',
  },
  expiryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    width: 60,
    textAlign: 'center',
  },
  expirySlash: {
    fontSize: 20,
    marginHorizontal: 8,
    color: '#666',
  },
  cvvContainer: {
    width: '35%',
  },
  cvvInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  saveCardContainer: {
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveCardText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  fpxSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 20,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  bankItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
  },
  bankIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  ewalletSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 20,
  },
  ewalletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ewalletIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 178, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  ewalletDetails: {
    flex: 1,
  },
  ewalletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ewalletInfo: {
    fontSize: 13,
    color: '#777',
  },
  bottomSpace: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  processingButton: {
    backgroundColor: '#999999',
  },
});

export default PaymentScreen;