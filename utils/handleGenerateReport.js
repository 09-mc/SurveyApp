import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateReportDocxtemplater } from "./docxProcessor";

/**
 * Handles generating a report for a given survey.
 * @param {string} templateKey - The key to retrieve the template from AsyncStorage (e.g., "Grassland_template").
 * @param {object} form - The survey form data.
 * @param {array} questions - The survey question structure.
 * @param {function} calculateScore - A function to calculate the survey score.
 */
export const handleGenerateReport = async (templateKey, form, questions, calculateScore) => {
    console.log("🟢 Received form data in handleGenerateReport:", form);
  
    if (!form || typeof form !== "object") {
      console.error("❌ Error: Form data is undefined in handleGenerateReport");
      Alert.alert("Error", "Survey data is missing.");
      return;
    }
  
    if (!questions || !Array.isArray(questions)) {
      console.error("❌ Questions array is undefined or not an array");
      Alert.alert("Error", "Questions data is missing.");
      return;
    }
  
    try {
      const templatePath = await AsyncStorage.getItem(templateKey);
  
      if (!templatePath) {
        Alert.alert("Missing Template", `Please download the template for ${templateKey} before generating the report.`);
        return;
      }
  
      console.log(`✔ Using Template Path: ${templatePath}`);
  
      const calculatedScore = calculateScore && typeof calculateScore === "function" ? calculateScore(form) : 0;
  
      const docFilePath = await generateReportDocxtemplater(templatePath, form, questions, calculatedScore);
      console.log("✔ Generated DOCX at:", docFilePath);
  
      Alert.alert("Success", "Report generated successfully.");
    } catch (error) {
      console.error("❌ Failed to generate report:", error);
      Alert.alert("Error", "Failed to generate the report.");
    }
  };
  
  
