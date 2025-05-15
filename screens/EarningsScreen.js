import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;

const EarningsScreen = ({ navigation }) => {
  // States for earnings data
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    weeklyData: [],
    recentTransactions: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  // Mock data - replace with API call in production
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const mockEarnings = {
        totalEarnings: 1250.00,
        availableBalance: 785.00,
        pendingBalance: 350.00,
        weeklyData: [
          { label: 'Mon', value: 50 },
          { label: 'Tue', value: 120 },
          { label: 'Wed', value: 0 },
          { label: 'Thu', value: 85 },
          { label: 'Fri', value: 200 },
          { label: 'Sat', value: 180 },
          { label: 'Sun', value: 150 },
        ],
        monthlyData: [
          { label: 'Week 1', value: 350 },
          { label: 'Week 2', value: 280 },
          { label: 'Week 3', value: 420 },
          { label: 'Week 4', value: 200 },
        ],
        yearlyData: [
          { label: 'Jan', value: 800 },
          { label: 'Feb', value: 1200 },
          { label: 'Mar', value: 950 },
          { label: 'Apr', value: 1500 },
          { label: 'May', value: 1250 },
          { label: 'Jun', value: 1820 },
        ],
        recentTransactions: [
          {
            id: '1',
            type: 'payout',
            amount: 200,
            date: '2025-05-10',
            status: 'completed',
            project: 'Fix leaking bathroom sink'
          },
          {
            id: '2',
            type: 'earning',
            amount: 85,
            date: '2025-05-05',
            status: 'pending',
            project: 'Install ceiling fan'
          },
          {
            id: '3',
            type: 'payout',
            amount: 350,
            date: '2025-04-28',
            status: 'completed',
            project: 'Paint living room walls'
          },
          {
            id: '4',
            type: 'earning',
            amount: 150,
            date: '2025-04-25',
            status: 'pending',
            project: 'Fix garden irrigation'
          }
        ]
      };
      
      setEarnings(mockEarnings);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle withdrawal
  const handleWithdraw = () => {
    navigation.navigate('Withdrawal', { 
      availableBalance: earnings.availableBalance 
    });
  };
  
  // Get chart data based on selected period
  const getChartData = () => {
    switch (selectedPeriod) {
      case 'week':
        return earnings.weeklyData;
      case 'month':
        return earnings.monthlyData;
      case 'year':
        return earnings.yearlyData;
      default:
        return earnings.weeklyData;
    }
  };
  
  // Get color for transaction status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FB8C00';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };
  
  // Get icon for transaction type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning': return 'cash-outline';
      case 'payout': return 'wallet-outline';
      default: return 'receipt-outline';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Find maximum value in chart data for scaling
  const getMaxValue = (data) => {
    if (!data || !data.length) return 0;
    return Math.max(...data.map(item => item.value));
  };
  
  // Custom chart component
  const SimpleBarChart = ({ data }) => {
    if (!data || !data.length) return null;
    
    const maxValue = getMaxValue(data);
    const barWidth = (screenWidth - 60) / data.length;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = maxValue ? (item.value / maxValue) * 150 : 0;
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barValue}>
                    {item.value > 0 ? `RM${item.value}` : ''}
                  </Text>
                </View>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight || 5,
                      backgroundColor: item.value > 0 ? Colors.primary : '#E0E0E0'
                    }
                  ]}
                />
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  // Render transaction item
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Ionicons name={getTransactionIcon(item.type)} size={22} color={getStatusColor(item.status)} />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle} numberOfLines={1}>{item.project}</Text>
        
        <View style={styles.transactionSubDetails}>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status === 'pending' ? 'Pending' : 'Completed'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'payout' ? '#333333' : Colors.primary }
      ]}>
        {item.type === 'payout' ? '-' : '+'}RM{item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading earnings data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Balance Cards */}
          <View style={styles.balanceCards}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceTitle}>Available Balance</Text>
              <Text style={styles.balanceAmount}>RM {earnings.availableBalance.toFixed(2)}</Text>
              <TouchableOpacity 
                style={styles.withdrawButton}
                onPress={handleWithdraw}
              >
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceCard}>
              <Text style={styles.balanceTitle}>Pending</Text>
              <Text style={styles.balanceAmount}>RM {earnings.pendingBalance.toFixed(2)}</Text>
              <Text style={styles.pendingNote}>Funds in escrow</Text>
            </View>
          </View>
          
          {/* Total Earnings */}
          <View style={styles.totalEarningsContainer}>
            <Text style={styles.sectionTitle}>Total Earnings</Text>
            <Text style={styles.totalEarningsAmount}>
              RM {earnings.totalEarnings.toFixed(2)}
            </Text>
          </View>
          
          {/* Earnings Chart */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Earnings History</Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    selectedPeriod === 'week' && styles.activePeriodButton
                  ]}
                  onPress={() => setSelectedPeriod('week')}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === 'week' && styles.activePeriodText
                  ]}>Week</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    selectedPeriod === 'month' && styles.activePeriodButton
                  ]}
                  onPress={() => setSelectedPeriod('month')}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === 'month' && styles.activePeriodText
                  ]}>Month</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    selectedPeriod === 'year' && styles.activePeriodButton
                  ]}
                  onPress={() => setSelectedPeriod('year')}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === 'year' && styles.activePeriodText
                  ]}>Year</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <SimpleBarChart data={getChartData()} />
          </View>
          
          {/* Recent Transactions */}
          <View style={styles.transactionsContainer}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('TransactionHistory')}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {earnings.recentTransactions.length > 0 ? (
              <FlatList
                data={earnings.recentTransactions}
                renderItem={renderTransactionItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            ) : (
              <View style={styles.emptyTransactions}>
                <Ionicons name="receipt-outline" size={48} color="#DDD" />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            )}
          </View>
          
          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Performance</Text>
            
            <View style={styles.statsCards}>
              <View style={styles.statsCard}>
                <Ionicons name="star-outline" size={24} color={Colors.primary} />
                <Text style={styles.statsValue}>4.8</Text>
                <Text style={styles.statsLabel}>Average Rating</Text>
              </View>
              
              <View style={styles.statsCard}>
                <Ionicons name="people-outline" size={24} color={Colors.primary} />
                <Text style={styles.statsValue}>26</Text>
                <Text style={styles.statsLabel}>Clients Served</Text>
              </View>
              
              <View style={styles.statsCard}>
                <Ionicons name="construct-outline" size={24} color={Colors.primary} />
                <Text style={styles.statsValue}>42</Text>
                <Text style={styles.statsLabel}>Jobs Completed</Text>
              </View>
            </View>
          </View>
          
          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
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
    padding: 16,
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
  balanceCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingNote: {
    fontSize: 12,
    color: '#FB8C00',
    marginTop: 8,
  },
  totalEarningsContainer: {
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
    marginBottom: 12,
  },
  totalEarningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  chartSection: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: '#666666',
  },
  activePeriodText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chartContainer: {
    height: 220,
    marginTop: 20,
    paddingBottom: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    paddingBottom: 25,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barLabelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 5,
  },
  barValue: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  bar: {
    width: '60%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#666',
  },
  transactionsContainer: {
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
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  transactionSubDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F1F1F1',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  statsContainer: {
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
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '31%',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 6,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default EarningsScreen;