import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system"; // ✅ Correct Import
import { Buffer } from "buffer";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export async function generateReportDocxtemplater(templatePath, data, questions) {
  try {
    console.log("✔ Generating DOCX report for:", data);

    if (!questions || !Array.isArray(questions)) {
      throw new Error("❌ Questions array is missing or not an array.");
    }

    // ✅ Read the template file as Base64
    const fileBase64 = await FileSystem.readAsStringAsync(templatePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binaryString = Buffer.from(fileBase64, "base64");
    const zip = new PizZip(binaryString);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      errorReporting: true,
    });

    doc.compile();

    // ✅ Process Form Data
    const formattedData = {};

    Object.keys(data).forEach((key) => {
      const question = questions.find((q) => q.key === key);

      if (!question) {
        // ✅ If the key isn't found in questions, default to empty string
        formattedData[key] = data[key] || "";
        return;
      }

      if (question.type === "input" || question.type === "date") {
        // ✅ Use the key directly for text/date fields
        formattedData[key] = data[key] !== undefined ? data[key] : "";
      } else if (question.type === "single" || question.type === "multi") {
        // ✅ Lookup the placeholder for the answer in the options map
        if (question.options && typeof question.options === "object") {
          Object.entries(question.options).forEach(([answer, placeholder]) => {
            // ✅ If selected, return "✔", otherwise return empty string
            formattedData[placeholder] = data[key]?.includes(answer) ? "✔" : "";
          });
        }
      }
    });

    console.log("✔ Formatted Data for DOCX:", formattedData);

    // ✅ Fill Template with Data
    doc.render(formattedData);

    // ✅ Generate DOCX File
    const generatedDocBase64 = doc.getZip().generate({ type: "base64" });

    // ✅ Save DOCX to Public Downloads Folder
    let docxPath;
    if (Platform.OS === "android") {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert("Permission Denied", "Please allow access to save DOCX to Downloads.");
        throw new Error("Storage permission not granted.");
      }

      // ✅ Create file in Downloads
      const docxUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        "Generated_Report",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      // ✅ Write DOCX content to the public folder
      await FileSystem.writeAsStringAsync(docxUri, generatedDocBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      docxPath = docxUri;
      console.log("✔ DOCX saved in Downloads at:", docxPath);
    } else {
      docxPath = `${FileSystem.documentDirectory}generatedReport.docx`;
      await FileSystem.writeAsStringAsync(docxPath, generatedDocBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // ✅ Store the completed form with DOCX path in AsyncStorage
    const existingForms = JSON.parse(await AsyncStorage.getItem("submittedSurveys")) || [];
    const updatedForms = [{ ...data, docxPath }, ...existingForms];

    await AsyncStorage.setItem("submittedSurveys", JSON.stringify(updatedForms));

    console.log("✔ Form saved in Completed Forms");

    return docxPath;
  } catch (error) {
    console.error("❌ Error generating report:", error);
    throw new Error(`❌ Failed to generate report: ${error.message}`);
  }
}
