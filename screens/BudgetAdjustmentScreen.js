// BudgetAdjustmentScreen.js - For on-site adjustments
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const BudgetAdjustmentScreen = ({ route, navigation }) => {
  const { project } = route.params;
  const [adjustment, setAdjustment] = useState({
    newAmount: project.agreedBudget.toString(),
    reason: '',
    additionalWork: [],
  });
  
  const calculateDifference = () => {
    const original = parseFloat(project.agreedBudget);
    const newAmount = parseFloat(adjustment.newAmount);
    return newAmount - original;
  };
  
  const handleSubmitAdjustment = () => {
    // API call to submit adjustment
    // Then notify customer about required adjustment
    navigation.navigate('ProjectDetails', { 
      project: { ...project, status: 'Requires Adjustment' }
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Budget Adjustment</Text>
          <Text style={styles.headerDescription}>
            Update the project budget based on your on-site assessment
          </Text>
        </View>
        
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Original Budget:</Text>
            <Text style={styles.budgetValue}>RM {project.agreedBudget}</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Budget Amount (RM)</Text>
            <TextInput
              style={styles.input}
              value={adjustment.newAmount}
              onChangeText={(text) => setAdjustment({...adjustment, newAmount: text})}
              keyboardType="numeric"
            />
          </View>
          
          {calculateDifference() !== 0 && (
            <View style={styles.differenceContainer}>
              <Text style={styles.differenceLabel}>Difference:</Text>
              <Text style={[
                styles.differenceAmount,
                calculateDifference() > 0 ? styles.increasedAmount : styles.decreasedAmount
              ]}>
                {calculateDifference() > 0 ? '+' : ''}
                RM {calculateDifference().toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reason for Adjustment</Text>
            <TextInput
              style={styles.textArea}
              value={adjustment.reason}
              onChangeText={(text) => setAdjustment({...adjustment, reason: text})}
              placeholder="Explain why the budget needs to be adjusted"
              multiline
              numberOfLines={4}
            />
          </View>
          
          {/* Add more fields for itemized additional work */}
        </View>
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitAdjustment}
        >
          <Text style={styles.buttonText}>Submit Adjustment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles omitted for brevity
});

export default BudgetAdjustmentScreen;