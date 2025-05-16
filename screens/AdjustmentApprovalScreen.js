import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Colors from '../constants/Colors';

const AdjustmentApprovalScreen = ({ route, navigation }) => {
  const { project, adjustment } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate the difference between original and adjusted budget
  const calculateDifference = () => {
    const original = parseFloat(project.agreedBudget || project.initialBudget);
    const newAmount = parseFloat(adjustment.newAmount);
    return newAmount - original;
  };
  
  // Handle approving the adjustment and proceeding to payment
  const handleApproveAdjustment = () => {
    setIsLoading(true);
    
    // Simulate API call to approve adjustment
    setTimeout(() => {
      setIsLoading(false);
      
      // Use deeper nested navigation to reach Payment
      navigation.dispatch(
        CommonActions.navigate({
          name: 'HomeTab',
          params: {
            screen: 'Home',  // This is HomeStack
            params: {
              screen: 'Payment',
              params: {
                project: project,
                total: parseFloat(adjustment.newAmount)
              }
            }
          },
        })
      );
    }, 1000);
  };
  
  // Handle rejecting the adjustment
  const handleRejectAdjustment = () => {
    Alert.alert(
      "Reject Adjustment",
      "If you reject this adjustment, you'll need to negotiate further or cancel the project.",
      [
        {
          text: "Open Chat",
          onPress: () => navigation.navigate('ChatTab', {
            screen: 'Chat',
            params: { recipient: project.handyman }
          })
        },
        {
          text: "Cancel Project",
          style: "destructive",
          onPress: () => {
            setIsLoading(true);
            
            // Simulate API call to cancel project
            setTimeout(() => {
              setIsLoading(false);
              navigation.navigate('MyProjects');
            }, 1000);
          }
        },
        {
          text: "Back",
          style: "cancel"
        }
      ]
    );
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `RM ${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Budget Adjustment Request</Text>
          <Text style={styles.headerDescription}>
            The handyman has requested an adjustment to your project budget
          </Text>
        </View>
        
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          
          <View style={styles.budgetComparison}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Original Budget:</Text>
              <Text style={styles.originalBudget}>
                {formatCurrency(project.agreedBudget || project.initialBudget)}
              </Text>
            </View>
            
            <Ionicons name="arrow-forward" size={24} color="#999" />
            
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>New Budget:</Text>
              <Text style={styles.newBudget}>{formatCurrency(adjustment.newAmount)}</Text>
            </View>
          </View>
          
          <View style={styles.differenceContainer}>
            <Text style={styles.differenceLabel}>Difference:</Text>
            <Text style={[
              styles.differenceAmount,
              calculateDifference() > 0 ? styles.increasedAmount : styles.decreasedAmount
            ]}>
              {calculateDifference() > 0 ? '+' : ''}
              {formatCurrency(calculateDifference())}
            </Text>
          </View>
        </View>
        
        <View style={styles.reasonContainer}>
          <Text style={styles.sectionTitle}>Reason for Adjustment</Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>{adjustment.reason}</Text>
          </View>
        </View>
        
        <View style={styles.noticeContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.noticeText}>
            If you approve this adjustment, you'll be directed to make payment for the new amount.
            The funds will be held in escrow until the project is completed.
          </Text>
        </View>
      </ScrollView>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={handleApproveAdjustment}
          >
            <Text style={styles.buttonText}>Approve & Pay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleRejectAdjustment}
          >
            <Text style={styles.rejectButtonText}>Reject & Negotiate</Text>
          </TouchableOpacity>
        </View>
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
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  projectInfo: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  budgetComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  originalBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  newBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
  },
  differenceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  },
  differenceLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  differenceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  increasedAmount: {
    color: '#E91E63',
  },
  decreasedAmount: {
    color: '#4CAF50',
  },
  reasonContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
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
    marginBottom: 8,
  },
  reasonBox: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  reasonText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
  },
  noticeContainer: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  noticeText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#0D47A1',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  buttonsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  approveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rejectButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default AdjustmentApprovalScreen;