import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const PaymentMethodsScreen = ({ navigation }) => {
  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock payment methods data - replace with API call in production
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const mockPaymentMethods = [
        {
          id: '1',
          type: 'card',
          cardType: 'visa',
          last4: '4582',
          expiryMonth: '12',
          expiryYear: '25',
          isDefault: true,
          name: 'John Smith'
        },
        {
          id: '2',
          type: 'card',
          cardType: 'mastercard',
          last4: '8237',
          expiryMonth: '08',
          expiryYear: '26',
          isDefault: false,
          name: 'John Smith'
        },
        {
          id: '3',
          type: 'fpx',
          bankName: 'Maybank',
          accountName: 'John Smith',
          isDefault: false
        }
      ];
      
      setPaymentMethods(mockPaymentMethods);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle setting a payment method as default
  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };
  
  // Handle removing a payment method
  const handleRemovePaymentMethod = (id) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(
              paymentMethods.filter(method => method.id !== id)
            );
          }
        }
      ]
    );
  };
  
  // Handle adding new payment method
  const handleAddPaymentMethod = () => {
    navigation.navigate('Payment', { addNewMethod: true });
  };
  
  // Get card logo based on card type
  const getCardLogo = (cardType) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return require('../assets/images/visa-logo.png');
      case 'mastercard':
        return require('../assets/images/mastercard-logo.png');
      case 'amex':
        return require('../assets/images/amex-logo.png');
      default:
        return require('../assets/images/generic-card.png');
    }
  };
  
  // Get bank logo based on bank name
  const getBankLogo = (bankName) => {
    // In a real app, return the appropriate bank logo
    return require('../assets/images/bank-logo.png');
  };
  
  // Render a card payment method
  const renderCardMethod = (item) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Image source={getCardLogo(item.cardType)} style={styles.cardLogo} />
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.cardNumber}>•••• •••• •••• {item.last4}</Text>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Name on Card</Text>
          <Text style={styles.cardDetail}>{item.name}</Text>
        </View>
        
        <View>
          <Text style={styles.cardLabel}>Expires</Text>
          <Text style={styles.cardDetail}>{item.expiryMonth}/{item.expiryYear}</Text>
        </View>
      </View>
    </View>
  );
  
  // Render an FPX payment method
  const renderFpxMethod = (item) => (
    <View style={styles.fpxContainer}>
      <View style={styles.fpxHeader}>
        <Image source={getBankLogo(item.bankName)} style={styles.bankLogo} />
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.bankName}>{item.bankName}</Text>
      <Text style={styles.accountName}>{item.accountName}</Text>
      <Text style={styles.fpxTag}>FPX Online Banking</Text>
    </View>
  );
  
  // Render a payment method item
  const renderPaymentMethod = ({ item }) => (
    <View style={styles.paymentMethodItem}>
      {item.type === 'card' ? renderCardMethod(item) : renderFpxMethod(item)}
      
      <View style={styles.paymentMethodActions}>
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemovePaymentMethod(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#E53935" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render empty list component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={64} color="#DDD" />
      <Text style={styles.emptyTitle}>No Payment Methods</Text>
      <Text style={styles.emptyText}>
        Add a payment method to easily pay for services
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPaymentMethod}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
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
  listContainer: {
    padding: 16,
    paddingBottom: 90, // Extra space for the button at bottom
  },
  paymentMethodItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden'
  },
  cardContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLogo: {
    width: 60,
    height: 30,
    resizeMode: 'contain',
  },
  defaultBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: '#333333',
  },
  fpxContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fpxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankLogo: {
    width: 60,
    height: 30,
    resizeMode: 'contain',
  },
  bankName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  fpxTag: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '600',
    marginLeft: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default PaymentMethodsScreen;