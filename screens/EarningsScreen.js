// screens/EarningsScreen.js - Updated with Real Transaction Integration
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
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;

const EarningsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    totalPayouts: 0,
    transactionCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('earnings');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadEarningsData();
    loadRecentTransactions();
  }, []);

  const loadEarningsData = async () => {
    try {
      const stats = await transactionService.getUserEarningsStats(user.id);
      setEarnings(stats);
      
      // Generate chart data based on recent transactions
      await generateChartData();
    } catch (error) {
      console.error('Error loading earnings data:', error);
      Alert.alert('Error', 'Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const transactions = await transactionService.getUserTransactions(user.id, 10);
      // Filter to show only earnings-related transactions
      const earningsTransactions = transactions.filter(t => 
        ['deposit_received', 'payout'].includes(t.type)
      );
      setRecentTransactions(earningsTransactions);
    } catch (error) {
      console.error('Error loading recent transactions:', error);
    }
  };

  const generateChartData = async () => {
    try {
      const transactions = await transactionService.getUserTransactions(user.id, 100);
      const earningsTransactions = transactions.filter(t => t.type === 'deposit_received');
      
      const data = generatePeriodData(earningsTransactions, selectedPeriod);
      setChartData(data);
    } catch (error) {
      console.error('Error generating chart data:', error);
    }
  };

  const getMonthlyEarnings = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return recentTransactions
      .filter(t => t.type === 'deposit_received' && new Date(t.createdAt) >= monthStart)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getWeeklyEarnings = () => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return recentTransactions
      .filter(t => t.type === 'deposit_received' && new Date(t.createdAt) >= weekStart)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const generatePeriodData = (transactions, period) => {
    const now = new Date();
    let data = [];

    switch (period) {
      case 'week':
        // Generate data for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayTransactions = transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate.toDateString() === date.toDateString();
          });
          const total = dayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
          data.push({
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            value: total
          });
        }
        break;
        
      case 'month':
        // Generate data for last 4 weeks
        for (let i = 3; i >= 0; i--) {
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - (i + 1) * 7);
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() - i * 7);
          
          const weekTransactions = transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate >= startDate && tDate < endDate;
          });
          const total = weekTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
          data.push({
            label: `Week ${4 - i}`,
            value: total
          });
        }
        break;
        
      case 'year':
        // Generate data for last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
          });
          const total = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
          data.push({
            label: date.toLocaleDateString('en-US', { month: 'short' }),
            value: total
          });
        }
        break;
    }

    return data;
  };

  useEffect(() => {
    if (!isLoading && selectedPeriod === 'transactions') {
      generateChartData();
    }
  }, [selectedPeriod, isLoading]);

 

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit_received': return 'cash-outline';
      case 'payout': return 'wallet-outline';
      default: return 'receipt-outline';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit_received': return Colors.success;
      case 'payout': return Colors.warning;
      default: return Colors.textMedium;
    }
  };

  const getMaxValue = (data) => {
    if (!data || !data.length) return 0;
    return Math.max(...data.map(item => item.value));
  };

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
                    {item.value > 0 ? `RM${item.value.toFixed(0)}` : ''}
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

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionHistory')}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getTransactionColor(item.type) + '20' }]}>
        <Ionicons name={getTransactionIcon(item.type)} size={22} color={getTransactionColor(item.type)} />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {item.description}
        </Text>
        
        <View style={styles.transactionSubDetails}>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: getTransactionColor(item.type) }]}>
              {item.status === 'completed' ? 'Completed' : item.status}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'payout' ? Colors.warning : Colors.success }
      ]}>
        {item.type === 'payout' ? '-' : '+'}RM{parseFloat(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading earnings data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Cards */}
        
        {/* Total Earnings */}
        <View style={styles.totalEarningsContainer}>
          <Text style={styles.sectionTitle}>Total Earnings</Text>
          <Text style={styles.totalEarningsAmount}>
            RM {earnings.totalEarnings.toFixed(2)}
          </Text>
          <Text style={styles.earningsNote}>
            From {earnings.transactionCount} completed job{earnings.transactionCount !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatLabel}>This Month</Text>
            <Text style={styles.quickStatAmount}>RM {getMonthlyEarnings().toFixed(2)}</Text>
          </View>
          
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatLabel}>Last 7 Days</Text>
            <Text style={styles.quickStatAmount}>RM {getWeeklyEarnings().toFixed(2)}</Text>
          </View>
        </View>

        {/* Earnings Chart */}
        <View style={styles.chartSection}>
        
            <View style={styles.periodSelector}>
          </View>
      
          
          {selectedPeriod === 'earnings' ? (
            <View style={styles.earningsOverview}>
              <Text style={styles.overviewTitle}>Earnings Breakdown</Text>
              <View style={styles.earningsBreakdown}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Total Jobs</Text>
                  <Text style={styles.breakdownValue}>{earnings.transactionCount}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Average per Job</Text>
                  <Text style={styles.breakdownValue}>
                    RM {earnings.transactionCount > 0 ? (earnings.totalEarnings / earnings.transactionCount).toFixed(0) : '0'}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>This Month</Text>
                  <Text style={styles.breakdownValue}>RM {getMonthlyEarnings().toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ) : (
            <SimpleBarChart data={chartData} />
          )}
        </View>
        
        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('TransactionHistory')} // UPDATED
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            <FlatList
              data={recentTransactions.slice(0, 5)}
              renderItem={renderTransactionItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={48} color="#DDD" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubText}>Complete jobs to start earning</Text>
            </View>
          )}
        </View>
        
        {/* Performance Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          <View style={styles.statsCards}>
            <View style={styles.statsCard}>
              <Ionicons name="star-outline" size={24} color={Colors.primary} />
              <Text style={styles.statsValue}>{user?.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statsLabel}>Average Rating</Text>
            </View>
            
            <View style={styles.statsCard}>
              <Ionicons name="people-outline" size={24} color={Colors.primary} />
              <Text style={styles.statsValue}>{user?.completedJobs || earnings.transactionCount}</Text>
              <Text style={styles.statsLabel}>Jobs Completed</Text>
            </View>
            
            <View style={styles.statsCard}>
              <Ionicons name="trending-up-outline" size={24} color={Colors.primary} />
              <Text style={styles.statsValue}>
                RM{earnings.transactionCount > 0 ? (earnings.totalEarnings / earnings.transactionCount).toFixed(0) : '0'}
              </Text>
              <Text style={styles.statsLabel}>Avg per Job</Text>
            </View>
          </View>
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
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

  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  pendingNote: {
    fontSize: 12,
    color: '#999999',
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
    marginBottom: 4,
  },
  earningsNote: {
    fontSize: 14,
    color: '#666666',
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
  emptySubText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
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
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickStatCard: {
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
  quickStatLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  quickStatAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  earningsOverview: {
    paddingVertical: 20,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default EarningsScreen;