import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  // Mock API call to fetch transactions
  const fetchTransactions = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Sample transaction data
      const mockTransactions = [
        {
          id: 'txn001',
          date: '2025-05-15T10:30:00',
          amount: 450,
          description: 'Bathroom Plumbing Repair',
          status: 'completed'
        },
        {
          id: 'txn002',
          date: '2025-05-10T14:15:00',
          amount: 275,
          description: 'Ceiling Fan Installation',
          status: 'completed'
        },
        {
          id: 'txn003',
          date: '2025-05-05T09:45:00',
          amount: 320,
          description: 'Kitchen Sink Repair',
          status: 'completed'
        },
        {
          id: 'txn004',
          date: '2025-04-28T16:20:00',
          amount: 150,
          description: 'Door Lock Replacement',
          status: 'refunded'
        },
        {
          id: 'txn005',
          date: '2025-04-20T11:10:00',
          amount: 550,
          description: 'Paint Living Room Walls',
          status: 'completed'
        }
      ];
      
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status icon and color
  const getStatusInfo = (status) => {
    switch(status) {
      case 'completed':
        return { color: '#4CAF50', label: 'Completed' };
      case 'refunded':
        return { color: '#F44336', label: 'Refunded' };
      default:
        return { color: '#757575', label: 'Unknown' };
    }
  };
  
  // Render transaction item
  const renderTransactionItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <Text style={styles.serviceDescription}>{item.description}</Text>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          <Text style={styles.transactionAmount}>RM {item.amount.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={50} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>No Transactions</Text>
        <Text style={styles.emptyDescription}>
          Your transaction history will appear here
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Transaction History</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    margin: 16,
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;