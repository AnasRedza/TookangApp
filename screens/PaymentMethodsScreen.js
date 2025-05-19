import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'visa', lastFour: '4242', expiryDate: '04/25', default: true },
    { id: '2', type: 'mastercard', lastFour: '5555', expiryDate: '08/26', default: false }
  ]);
  
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  
  // Delete payment method
  const deletePaymentMethod = (id) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(method => method.id !== id));
          }
        }
      ]
    );
  };
  
  // Set default payment method
  const setDefaultPaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      default: method.id === id
    })));
  };
  
  // Add new card
  const addNewCard = () => {
    // Simple validation
    if (newCard.cardNumber.replace(/\s/g, '').length < 16 || 
        newCard.expiryDate.length < 5 ||
        newCard.cvv.length < 3 ||
        newCard.nameOnCard.length < 3) {
      Alert.alert('Invalid Card Details', 'Please enter valid card information.');
      return;
    }
    
    // Create new card object
    const lastFour = newCard.cardNumber.replace(/\s/g, '').slice(-4);
    const cardType = newCard.cardNumber.startsWith('4') ? 'visa' : 'mastercard';
    
    const newCardObject = {
      id: Date.now().toString(),
      type: cardType,
      lastFour,
      expiryDate: newCard.expiryDate,
      default: paymentMethods.length === 0
    };
    
    // Add to payment methods
    setPaymentMethods([...paymentMethods, newCardObject]);
    
    // Reset form and close modal
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: ''
    });
    setShowAddCardModal(false);
    
    // Show success message
    Alert.alert('Card Added', 'Your new payment method has been added successfully.');
  };
  
  // Format card number
  const formatCardNumber = (text) => {
    const formattedText = text.replace(/\D/g, '');
    const parts = [];
    
    for (let i = 0; i < formattedText.length; i += 4) {
      parts.push(formattedText.substring(i, i + 4));
    }
    
    return parts.join(' ');
  };
  
  // Format expiry date
  const formatExpiryDate = (text) => {
    const cleanText = text.replace(/\D/g, '');
    
    if (cleanText.length <= 2) {
      return cleanText;
    }
    
    return `${cleanText.substring(0, 2)}/${cleanText.substring(2, 4)}`;
  };
  
  // Render card icon based on type
  const renderCardIcon = (type) => {
    switch(type) {
      case 'visa':
        return <Ionicons name="card" size={32} color="#1A1F71" />;
      case 'mastercard':
        return <Ionicons name="card" size={32} color="#EB001B" />;
      default:
        return <Ionicons name="card-outline" size={32} color="#333333" />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.map(method => (
            <View key={method.id} style={styles.cardItem}>
              <View style={styles.cardHeader}>
                {renderCardIcon(method.type)}
                <View style={styles.cardType}>
                  <Text style={styles.cardTypeText}>{method.type.toUpperCase()}</Text>
                  {method.default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => deletePaymentMethod(method.id)}>
                  <Ionicons name="trash-outline" size={20} color="#999999" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardDetails}>
                <Text style={styles.cardNumber}>•••• •••• •••• {method.lastFour}</Text>
                <Text style={styles.cardExpiry}>Expires {method.expiryDate}</Text>
              </View>
              
              {!method.default && (
                <TouchableOpacity 
                  style={styles.setDefaultButton}
                  onPress={() => setDefaultPaymentMethod(method.id)}
                >
                  <Text style={styles.setDefaultButtonText}>Set as Default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          {paymentMethods.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>No payment methods added yet</Text>
            </View>
          )}
        </View>
        
        {/* Other Payment Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Payment Options</Text>
          
          <TouchableOpacity style={styles.paymentOption}>
            <Ionicons name="business-outline" size={24} color="#333333" />
            <Text style={styles.paymentOptionText}>Online Banking</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.paymentOption}>
            <Ionicons name="wallet-outline" size={24} color="#333333" />
            <Text style={styles.paymentOptionText}>E-Wallet</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Add Card Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddCardModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>
      </View>
      
      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={styles.cardNumberInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    maxLength={19}
                    value={newCard.cardNumber}
                    onChangeText={(text) => setNewCard({...newCard, cardNumber: formatCardNumber(text)})}
                  />
                  <Ionicons name="card-outline" size={20} color="#999999" />
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={newCard.expiryDate}
                    onChangeText={(text) => setNewCard({...newCard, expiryDate: formatExpiryDate(text)})}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={3}
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({...newCard, cvv: text.replace(/\D/g, '')})}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name on Card</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Smith"
                  value={newCard.nameOnCard}
                  onChangeText={(text) => setNewCard({...newCard, nameOnCard: text})}
                />
              </View>
              
              <View style={styles.securityNote}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#666666" />
                <Text style={styles.securityNoteText}>
                  Your card information is secure and encrypted.
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addNewCard}
              >
                <Text style={styles.saveButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  cardItem: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardType: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  cardTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  defaultBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 16,
  },
  cardNumber: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666666',
  },
  setDefaultButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  setDefaultButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  cardNumberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  saveButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default PaymentMethodsScreen;