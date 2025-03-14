import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateReportDocxtemplater } from "./docxProcessor";
import { sendSurveyReportByEmail } from "./sendEmail";
import { Alert } from "react-native";

/**
 * Processes survey data, generates a DOCX report, stores it, and emails it.
 * @param {string} surveyTemplateKey - The AsyncStorage key for the survey template.
 * @param {object} processedForm - The survey data after calculating `positiveIndicatorCount`.
 * @param {Array} questions - The list of survey questions.
 * @param {Function} calculateScore - Function to calculate the primary score.
 * @param {Function} calculateScoreB - Function to calculate the secondary score.
 */
export const processSurveyData = async (
  surveyTemplateKey,
  processedForm,
  questions,
  calculateScore,
  calculateScoreB
) => {
  try {
    console.log(`🟢 Processing ${surveyTemplateKey} survey submission and report generation...`);

    if (!processedForm || Object.keys(processedForm).length === 0) {
      Alert.alert("Error", "No form data available. Please complete the survey before submitting.");
      return;
    }

    // ✅ Retrieve the correct template file path from AsyncStorage
    const templatePath = await AsyncStorage.getItem(surveyTemplateKey);
    if (!templatePath) {
      Alert.alert("Missing Template", `Please download the ${surveyTemplateKey} template before generating the report.`);
      return;
    }

    console.log(`✔ Using Template Path: ${templatePath}`);

    if (!questions || !Array.isArray(questions)) {
      console.error("❌ Questions array is undefined or not an array");
      Alert.alert("Error", "Questions data is missing.");
      return;
    }

    console.log(`✔ Questions Loaded: ${questions.length} questions found.`);

    // ✅ Automatically assign tickmarks for all multi/single choice questions
    questions.forEach((question) => {
      if (question.type === "single" || question.type === "multi") {
        if (question.options && typeof question.options === "object") {
          Object.entries(question.options).forEach(([answer, placeholder]) => {
            processedForm[placeholder] = processedForm[question.key]?.includes(answer) ? "✔" : "";
          });
        }
      }
    });

    // ✅ Calculate Scores
    const sectionAScore = calculateScore(processedForm);
    const sectionBScore = calculateScoreB(processedForm);
    const combinedScore = sectionAScore + sectionBScore;

    // ✅ Add Scores to Processed Form
    processedForm["score"] = sectionAScore.toString();
    processedForm["bScore"] = sectionBScore.toString();
    processedForm["totSco"] = combinedScore.toString();

    console.log("✔ Processed Form Before Sending to DOCX:", processedForm);

    // ✅ Generate the Report
    const docFilePath = await generateReportDocxtemplater(templatePath, processedForm, questions);
    console.log("✔ Generated DOCX at:", docFilePath);

    // ✅ Store the completed form in AsyncStorage
    const existingSurveys = JSON.parse(await AsyncStorage.getItem("submittedSurveys")) || [];
    const updatedSurveys = [{ ...processedForm, docxPath: docFilePath }, ...existingSurveys];

    await AsyncStorage.setItem("submittedSurveys", JSON.stringify(updatedSurveys));
    console.log("✔ Form saved in Completed Forms");

    // ✅ Send the email with the report attached
    sendSurveyReportByEmail(surveyTemplateKey.replace("_template", ""), docFilePath);

    Alert.alert("Success", `Survey submitted successfully. The report has been generated and attached to an email.`);
  } catch (error) {
    console.error("❌ Error submitting survey:", error);
    Alert.alert("Error", "Failed to submit the survey.");
  }
};
