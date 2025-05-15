import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const TransactionHistoryScreen = () => {
  const { userType } = useAuth();
  
  // State for transactions and filters
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Mock transaction data - replace with API call in production
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const mockTransactions = [
        {
          id: '1',
          type: 'payment',
          amount: 120,
          date: '2025-05-10',
          status: 'completed',
          title: 'Fix leaking bathroom sink',
          recipient: 'John Plumber',
          paymentMethod: 'Credit Card (**** 4582)'
        },
        {
          id: '2',
          type: 'payment',
          amount: 85,
          date: '2025-05-05',
          status: 'escrow',
          title: 'Install ceiling fan',
          recipient: 'Mike Electrician',
          paymentMethod: 'FPX Banking'
        },
        {
          id: '3',
          type: 'refund',
          amount: 50,
          date: '2025-04-28',
          status: 'completed',
          title: 'Cabinet installation - Partial refund',
          recipient: 'System',
          paymentMethod: 'Credit Card (**** 4582)'
        },
        {
          id: '4',
          type: userType === 'handyman' ? 'payout' : 'payment',
          amount: 200,
          date: '2025-04-20',
          status: 'completed',
          title: 'Paint living room walls',
          recipient: userType === 'handyman' ? 'Bank Account' : 'Paul Painter',
          paymentMethod: userType === 'handyman' ? 'Bank Transfer' : 'E-Wallet'
        },
        {
          id: '5',
          type: userType === 'handyman' ? 'payout' : 'payment',
          amount: 150,
          date: '2025-04-15',
          status: 'completed',
          title: 'Fix garden irrigation',
          recipient: userType === 'handyman' ? 'Bank Account' : 'Gary Gardener',
          paymentMethod: userType === 'handyman' ? 'Bank Transfer' : 'FPX Banking'
        },
      ];
      
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [userType]);
  
  // Filter transactions based on active filter
  const filteredTransactions = transactions.filter(transaction => {
    if (activeFilter === 'all') return true;
    return transaction.type === activeFilter;
  });
  
  // Get icon for transaction type
  const getTransactionIcon = (type, status) => {
    if (type === 'payment') {
      if (status === 'escrow') return 'time-outline';
      return 'arrow-up-outline';
    }
    if (type === 'refund') return 'refresh-outline';
    if (type === 'payout') return 'cash-outline';
    return 'card-outline';
  };
  
  // Get color for transaction status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'escrow': return '#FB8C00';
      case 'pending': return '#42A5F5';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };
  
  // Get transaction amount display with +/-
  const getTransactionAmount = (transaction) => {
    if (userType === 'customer') {
      if (transaction.type === 'refund') {
        return `+RM${transaction.amount}`;
      }
      return `-RM${transaction.amount}`;
    } else {
      // For handyman
      if (transaction.type === 'payout') {
        return `+RM${transaction.amount}`;
      }
      return `-RM${transaction.amount}`;
    }
  };
  
  // Get color for transaction amount
  const getAmountColor = (transaction) => {
    if (userType === 'customer') {
      return transaction.type === 'refund' ? '#4CAF50' : '#333333';
    } else {
      return transaction.type === 'payout' ? '#4CAF50' : '#333333';
    }
  };
  
  // Render transaction item
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Ionicons name={getTransactionIcon(item.type, item.status)} size={24} color={getStatusColor(item.status)} />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle} numberOfLines={1}>{item.title}</Text>
        
        <View style={styles.transactionSubDetails}>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          <View style={styles.dotSeparator} />
          <Text style={styles.transactionMethod}>{item.paymentMethod}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {capitalizeFirstLetter(item.status)}
          </Text>
        </View>
      </View>
      
      <Text 
        style={[
          styles.transactionAmount, 
          { color: getAmountColor(item) }
        ]}
      >
        {getTransactionAmount(item)}
      </Text>
    </TouchableOpacity>
  );
  
  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Helper to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Render filter chip
  const renderFilterChip = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        activeFilter === filter && styles.activeFilterChip
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterChipText,
          activeFilter === filter && styles.activeFilterChipText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  // Empty list component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#DDD" />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyText}>
        {userType === 'customer' 
          ? 'Your transaction history will appear here when you make payments'
          : 'Your transaction history will appear here when you receive payments'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter section */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
          {renderFilterChip('all', 'All')}
          {renderFilterChip('payment', 'Payments')}
          {userType === 'customer' && renderFilterChip('refund', 'Refunds')}
          {userType === 'handyman' && renderFilterChip('payout', 'Payouts')}
        </ScrollView>
      </View>
      
      {/* Main content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersScrollContent: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F1F1',
  },
  activeFilterChip: {
    backgroundColor: Colors.primary + '20',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666666',
  },
  activeFilterChipText: {
    color: Colors.primary,
    fontWeight: '600',
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
    paddingBottom: 30,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  transactionSubDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#666666',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#BBBBBB',
    marginHorizontal: 6,
  },
  transactionMethod: {
    fontSize: 13,
    color: '#666666',
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  emptyContainer: {
    paddingVertical: 40,
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

export default TransactionHistoryScreen;