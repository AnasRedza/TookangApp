// screens/TransactionHistoryScreen.js - Complete Transaction History Implementation
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const TransactionHistoryScreen = ({ navigation }) => {
  const { user, isHandyman } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'deposit', 'payout'
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setError(null);
      const userTransactions = await transactionService.getUserTransactions(user.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

const getFilteredTransactions = () => {
    return transactions;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction) => {
    switch (transaction.type) {
      case 'deposit_received':
        return 'card';
      case 'deposit_paid':
        return 'wallet';
      case 'payout':
        return 'cash';
      case 'refund':
        return 'refresh';
      default:
        return 'receipt';
    }
  };

  const getTransactionColor = (transaction) => {
    switch (transaction.type) {
      case 'deposit_received':
        return Colors.success;
      case 'deposit_paid':
        return Colors.primary;
      case 'payout':
        return Colors.warning;
      case 'refund':
        return Colors.info;
      default:
        return Colors.textMedium;
    }
  };

  const getAmountDisplay = (transaction) => {
    const isIncoming = isHandyman ? 
      ['deposit_received', 'payout'].includes(transaction.type) :
      ['refund'].includes(transaction.type);
    
    const prefix = isIncoming ? '+' : '-';
    return `${prefix}RM ${parseFloat(transaction.amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'pending': return Colors.warning;
      case 'failed': return Colors.error;
      case 'cancelled': return Colors.textLight;
      default: return Colors.textMedium;
    }
  };

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const renderFilterButton = (type, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type && styles.activeFilterButton
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[
        styles.filterButtonText,
        filterType === type && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => handleTransactionPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getTransactionColor(item) + '20' }]}>
        <Ionicons 
          name={getTransactionIcon(item)} 
          size={24} 
          color={getTransactionColor(item)} 
        />
      </View>
      
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>{item.description}</Text>
          <Text style={[
            styles.transactionAmount,
            { color: getTransactionColor(item) }
          ]}>
            {getAmountDisplay(item)}
          </Text>
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        {item.projectTitle && (
          <Text style={styles.projectTitle} numberOfLines={1}>
            Project: {item.projectTitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTransactionDetail = () => {
    if (!selectedTransaction) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Transaction Amount */}
              <View style={styles.detailSection}>
                <Text style={[
                  styles.detailAmount,
                  { color: getTransactionColor(selectedTransaction) }
                ]}>
                  {getAmountDisplay(selectedTransaction)}
                </Text>
                <Text style={styles.detailDescription}>
                  {selectedTransaction.description}
                </Text>
              </View>

              {/* Transaction Info */}
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.id}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedTransaction.createdAt)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(selectedTransaction.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText, 
                      { color: getStatusColor(selectedTransaction.status) }
                    ]}>
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {selectedTransaction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>

                {selectedTransaction.paymentMethod && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <Text style={styles.detailValue}>
                      {selectedTransaction.paymentMethod.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Project Info */}
              {selectedTransaction.projectId && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Project Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Project</Text>
                    <Text style={styles.detailValue}>{selectedTransaction.projectTitle}</Text>
                  </View>

                  {selectedTransaction.otherPartyName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        {isHandyman ? 'Customer' : 'Handyman'}
                      </Text>
                      <View style={styles.userInfo}>
                        <Image 
                          source={{ uri: getUserAvatarUri({ name: selectedTransaction.otherPartyName }) }}
                          style={styles.userAvatar}
                        />
                        <Text style={styles.detailValue}>{selectedTransaction.otherPartyName}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Additional Notes */}
              {selectedTransaction.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedTransaction.notes}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyText}>
        {isHandyman 
          ? "Your earnings and payouts will appear here"
          : "Your payments and transactions will appear here"
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
      <Text style={styles.emptyTitle}>Failed to Load</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadTransactions}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <SafeAreaView style={styles.container}>
{/* Filter Tabs - Only for handyman */}
 

      {/* Transaction List */}
      {error ? renderErrorState() : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Transaction Detail Modal */}
      {renderTransactionDetail()}
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
    marginTop: 16,
    fontSize: 16,
    color: Colors.textMedium,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMedium,
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textMedium,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textMedium,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    maxHeight: '90%',
    minHeight: '50%',
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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 0,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textMedium,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
    textAlign: 'right',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textMedium,
    lineHeight: 20,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionHistoryScreen;