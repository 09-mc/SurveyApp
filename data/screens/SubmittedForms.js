import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SubmittedForms = () => {
  const [submittedSurveys, setSubmittedSurveys] = useState([]);
  const navigation = useNavigation();

  // Fetch submitted forms from AsyncStorage when screen loads
  useEffect(() => {
    const fetchSubmittedSurveys = async () => {
      try {
        const savedSurveys = JSON.parse(await AsyncStorage.getItem('submittedSurveys')) || [];
        setSubmittedSurveys(savedSurveys);
      } catch (error) {
        console.error("Error retrieving submitted surveys:", error);
      }
    };

    fetchSubmittedSurveys();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Submitted Surveys</Text>
      {submittedSurveys.length > 0 ? (
        <FlatList
          data={submittedSurveys}
          keyExtractor={(item, index) => `survey-${index}`}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
              <Text><Text style={{ fontWeight: 'bold' }}>Farmer ID:</Text> {item.farmerId || 'N/A'}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Surveyor:</Text> {item.surveyor || 'N/A'}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Plot Number:</Text> {item.plotNum || 'N/A'}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Survey Date:</Text> {item.surveyDate ? new Date(item.surveyDate).toLocaleDateString() : 'N/A'}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={{ fontStyle: 'italic', color: 'gray' }}>No surveys submitted yet.</Text>
      )}
      <Button title="Back to Survey" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default SubmittedForms;
