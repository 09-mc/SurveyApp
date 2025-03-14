import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [googleDocIds, setGoogleDocIds] = useState({});
  const [downloadedTemplates, setDownloadedTemplates] = useState({});
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const loadStoredData = async () => {
      const storedDocIds = await AsyncStorage.getItem("googleDocIds");
      const storedTemplates = await AsyncStorage.getItem("downloadedTemplates");

      if (storedDocIds) setGoogleDocIds(JSON.parse(storedDocIds));
      if (storedTemplates) setDownloadedTemplates(JSON.parse(storedTemplates));
    };

    loadStoredData();
  }, []);

  const handleSaveDocId = async (category, docId) => {
    const updatedDocIds = { ...googleDocIds, [category]: docId };
    setGoogleDocIds(updatedDocIds);
    await AsyncStorage.setItem("googleDocIds", JSON.stringify(updatedDocIds));
    Alert.alert("Saved", `Google Doc ID saved for ${category}`);
  };

  const handleDownloadTemplate = async (category) => {
    const docId = googleDocIds[category];
    if (!docId) {
      Alert.alert("Missing Google Doc ID", "Please enter a Google Document ID first.");
      return;
    }

    const downloadUrl = `https://docs.google.com/document/d/${docId}/export?format=docx`;
    const localFilePath = `${FileSystem.documentDirectory}${category}_template.docx`;

    setDownloading(category);

    try {
      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, localFilePath);
      const { uri } = await downloadResumable.downloadAsync();
      await AsyncStorage.setItem(`${category}_template`, uri);

      // Mark template as downloaded
      const updatedTemplates = { ...downloadedTemplates, [category]: true };
      setDownloadedTemplates(updatedTemplates);
      await AsyncStorage.setItem("downloadedTemplates", JSON.stringify(updatedTemplates));

      setDownloading(null);
      Alert.alert("Download Complete", `Template saved for ${category}`);
    } catch (error) {
      setDownloading(null);
      console.error("❌ Error downloading file:", error);
      Alert.alert("Download Failed", "Unable to download the template. Please check the Google Document ID.");
    }
  };

  const handleRemoveTemplate = async (category) => {
    try {
      await AsyncStorage.removeItem(`${category}_template`);
      const updatedTemplates = { ...downloadedTemplates };
      delete updatedTemplates[category];
      setDownloadedTemplates(updatedTemplates);
      await AsyncStorage.setItem("downloadedTemplates", JSON.stringify(updatedTemplates));
      Alert.alert("Template Removed", `The template for ${category} has been deleted.`);
    } catch (error) {
      console.error("❌ Error removing template:", error);
      Alert.alert("Error", "Failed to remove the template.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Select a Survey</Text>

      {[
        { name: "Grassland", screen: "GrasslandSurvey" },
        { name: "Peatland", screen: "" },
        { name: "Woodlands", screen: "" },
        { name: "Shannon Callows", screen: "" },
        { name: "Breeding Wader Grassland", screen: "" },
      ].map((category) => (
        <View key={category.name} style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{category.name}</Text>

            <TextInput
              placeholder="Enter Google Document ID"
              value={googleDocIds[category.name] || ""}
              onChangeText={(text) => handleSaveDocId(category.name, text)}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 8,
                marginVertical: 5,
                borderRadius: 5,
              }}
            />

            {downloadedTemplates[category.name] ? (
              <TouchableOpacity
                onPress={() => category.screen ? navigation.navigate(category.screen) : Alert.alert("Unavailable", "This survey is not yet available.")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "green",
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 5,
                }}
              >
                <FontAwesome name="check" size={20} color="white" />
                <Text style={{ color: "white", marginLeft: 10 }}>Open Form</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleDownloadTemplate(category.name)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "blue",
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 5,
                }}
              >
                <FontAwesome name="download" size={20} color="white" />
                <Text style={{ color: "white", marginLeft: 10 }}>
                  {downloading === category.name ? "Downloading..." : "Download Template"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Remove Template Button */}
          {downloadedTemplates[category.name] && (
            <TouchableOpacity
              onPress={() => handleRemoveTemplate(category.name)}
              style={{ marginLeft: 10, padding: 8 }}
            >
              <FontAwesome name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

export default HomeScreen;
