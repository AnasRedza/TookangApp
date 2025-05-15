// ProjectOfferScreen.js - For handymen to make counter-offers
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ProjectOfferScreen = ({ route, navigation }) => {
  const { project } = route.params;
  const [counterOffer, setCounterOffer] = useState({
    amount: project.initialBudget.toString(),
    notes: '',
  });
  
  const handleSubmitOffer = () => {
    // API call to submit counter-offer
    navigation.navigate('ProjectDetails', { 
      project: { ...project, status: 'In Negotiation' }
    });
  };
  
  const handleAcceptProject = () => {
    // API call to accept project with initial budget
    navigation.navigate('ProjectDetails', { 
      project: { ...project, status: 'Agreed - Scheduled' }
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.projectSummary}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectDescription}>{project.description}</Text>
          
          <View style={styles.budgetContainer}>
            <Text style={styles.sectionTitle}>Customer's Budget</Text>
            <Text style={styles.budgetAmount}>RM {project.initialBudget}</Text>
            <Text style={styles.budgetNote}>
              {project.isNegotiable ? 'This budget is negotiable' : 'This budget is fixed'}
            </Text>
          </View>
        </View>
        
        <View style={styles.offerContainer}>
          <Text style={styles.sectionTitle}>Make an Offer</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Price (RM)</Text>
            <TextInput
              style={styles.input}
              value={counterOffer.amount}
              onChangeText={(text) => setCounterOffer({...counterOffer, amount: text})}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes about your offer</Text>
            <TextInput
              style={styles.textArea}
              value={counterOffer.notes}
              onChangeText={(text) => setCounterOffer({...counterOffer, notes: text})}
              placeholder="Explain your pricing, scope of work, etc."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        {project.isNegotiable && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitOffer}
          >
            <Text style={styles.buttonText}>Submit Counter Offer</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.acceptButton, !project.isNegotiable && {marginTop: 0}]}
          onPress={handleAcceptProject}
        >
          <Text style={styles.buttonText}>Accept Project (RM {project.initialBudget})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles omitted for brevity
});

export default ProjectOfferScreen;