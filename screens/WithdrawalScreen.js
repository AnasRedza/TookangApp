import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const WithdrawalScreen = ({ route, navigation }) => {
  const { availableBalance } = route.params;
  
  // States
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment methods - normally would come from API
  const paymentMethods = [
    {
      id: '1',
      type: 'bank',
      bankName: 'Maybank',
      accountNumber: '****5678',
      accountName: 'John Smith'
    },
    {
      id: '2',
      type: 'card',
      cardType: 'visa',
      last4: '4582',
      name: 'John Smith'
    }
  ];
  
  // Handle withdrawal process
  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    
    if (parseFloat(amount) > availableBalance) {
      Alert.alert('Insufficient Balance', 'The amount exceeds your available balance.');
      return;
    }
    
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method for withdrawal.');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      
      Alert.alert(
        'Withdrawal Successful',
        `RM${parseFloat(amount).toFixed(2)} has been sent to your ${selectedMethod.type === 'bank' ? 'bank account' : 'card'}. It may take 1-3 business days to process.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('EarningsMain') 
          }
        ]
      );
    }, 1500);
  };
  
  // Handle quick amount selection
  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollView}>
          {/* Available Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>RM {availableBalance.toFixed(2)}</Text>
          </View>
          
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>RM</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#BBBBBB"
              />
            </View>
            
            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmount(50)}
              >
                <Text style={styles.quickAmountText}>RM50</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmount(100)}
              >
                <Text style={styles.quickAmountText}>RM100</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmount(200)}
              >
                <Text style={styles.quickAmountText}>RM200</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmount(availableBalance)}
              >
                <Text style={styles.quickAmountText}>Max</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Payment Methods */}
          <View style={styles.methodsContainer}>
            <Text style={styles.sectionTitle}>Withdrawal Method</Text>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod?.id === method.id && styles.selectedMethodCard
                ]}
                onPress={() => setSelectedMethod(method)}
              >
                <View style={styles.methodInfo}>
                  <Ionicons 
                    name={method.type === 'bank' ? 'business-outline' : 'card-outline'} 
                    size={24} 
                    color="#555555" 
                  />
                  <View style={styles.methodDetails}>
                    <Text style={styles.methodTitle}>
                      {method.type === 'bank' ? method.bankName : 'Visa •••• ' + method.last4}
                    </Text>
                    <Text style={styles.methodSubtitle}>
                      {method.type === 'bank' ? 'Acc: •••• ' + method.accountNumber.slice(-4) : method.name}
                    </Text>
                  </View>
                </View>
                
                {selectedMethod?.id === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.addMethodButton}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addMethodText}>Add New Withdrawal Method</Text>
            </TouchableOpacity>
          </View>
          
          {/* Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#999999" />
            <Text style={styles.noteText}>
              Withdrawals typically process within 1-3 business days depending on your bank.
            </Text>
          </View>
        </ScrollView>
        
        {/* Bottom Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.withdrawButton,
              (!amount || !selectedMethod || isProcessing) && styles.disabledButton
            ]}
            onPress={handleWithdraw}
            disabled={!amount || !selectedMethod || isProcessing}
          >
            {isProcessing ? (
              <Text style={styles.withdrawButtonText}>Processing...</Text>
            ) : (
              <Text style={styles.withdrawButtonText}>
                Withdraw {amount ? `RM${parseFloat(amount).toFixed(2)}` : ''}
              </Text>
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  balanceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#333333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
    color: '#333333',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: '#F1F1F1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    width: '23%',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  methodsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedMethodCard: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodDetails: {
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addMethodText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 80,
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
    marginLeft: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  withdrawButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WithdrawalScreen;