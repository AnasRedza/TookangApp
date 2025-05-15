// AdjustmentApprovalScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const AdjustmentApprovalScreen = ({ route, navigation }) => {
  const { project, adjustment } = route.params;
  
  const handleApproveAdjustment = () => {
    // Navigate to payment with the new amount
    navigation.navigate('Payment', {
      project: project,
      total: parseFloat(adjustment.newAmount)
    });
  };
  
  const handleRejectAdjustment = () => {
    // Open chat to negotiate further or cancel
    Alert.alert(
      "Reject Adjustment",
      "If you reject this adjustment, you'll need to negotiate further or cancel the project.",
      [
        {
          text: "Open Chat",
          onPress: () => navigation.navigate('ChatTab', {
            screen: 'Chat',
            params: { recipient: { name: 'Handyman Name', id: 'handyman_id' } }
          })
        },
        {
          text: "Cancel Project",
          style: "destructive",
          onPress: () => {
            // API call to cancel project
            navigation.navigate('MyProjects');
          }
        }
      ]
    );
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
              <Text style={styles.originalBudget}>RM {project.agreedBudget}</Text>
            </View>
            
            <Ionicons name="arrow-forward" size={24} color="#999" />
            
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>New Budget:</Text>
              <Text style={styles.newBudget}>RM {adjustment.newAmount}</Text>
            </View>
          </View>
          
          <View style={styles.differenceContainer}>
            <Text style={styles.differenceLabel}>Difference:</Text>
            <Text style={[
              styles.differenceAmount,
              parseFloat(adjustment.newAmount) > parseFloat(project.agreedBudget) 
                ? styles.increasedAmount 
                : styles.decreasedAmount
            ]}>
              {parseFloat(adjustment.newAmount) > parseFloat(project.agreedBudget) ? '+' : ''}
              RM {(parseFloat(adjustment.newAmount) - parseFloat(project.agreedBudget)).toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.reasonContainer}>
          <Text style={styles.sectionTitle}>Reason for Adjustment</Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>{adjustment.reason}</Text>
          </View>
        </View>
      </ScrollView>
      
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles omitted for brevity
});

export default AdjustmentApprovalScreen;