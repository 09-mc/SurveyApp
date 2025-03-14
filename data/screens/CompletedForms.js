import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";

const CompletedForms = () => {
  const [completedForms, setCompletedForms] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCompletedForms = async () => {
      try {
        const storedForms = await AsyncStorage.getItem("submittedSurveys");
        if (storedForms) {
          setCompletedForms(JSON.parse(storedForms));
        }
      } catch (error) {
        console.error("❌ Error loading completed forms:", error);
        Alert.alert("Error", "Failed to load completed forms.");
      }
    };

    fetchCompletedForms();
  }, []);

  const openDocx = async (docxPath) => {
    const fileInfo = await FileSystem.getInfoAsync(docxPath);
    if (!fileInfo.exists) {
      Alert.alert("Error", "DOCX file not found.");
      return;
    }

    Alert.alert("Success", `DOCX file is saved at: ${docxPath}`);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Completed Forms</Text>

      {completedForms.length === 0 ? (
        <Text>No completed forms found.</Text>
      ) : (
        <FlatList
          data={completedForms}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={{ padding: 15, marginVertical: 5, backgroundColor: "#ddd", borderRadius: 5 }}>
              <Text style={{ fontWeight: "bold" }}>Form {index + 1}</Text>
              <Text>Surveyor: {item.surveyor || "N/A"}</Text>
              <Text>Plot ID: {item.plotId || "N/A"}</Text>

              {/* Open DOCX Button */}
              {item.docxPath && (
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    padding: 10,
                    backgroundColor: "blue",
                    borderRadius: 5,
                    alignItems: "center",
                  }}
                  onPress={() => openDocx(item.docxPath)}
                >
                  <Text style={{ color: "white" }}>View DOCX</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

export default CompletedForms;
