import { Alert } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system';

export const sendSurveyReportByEmail = async (filePath, recipientEmail, fileName ) => {
  try {
    if (!recipientEmail || !recipientEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please provide a valid email address.");
      return;
    }

    // Copy the generated report to a known path within the app's document directory.
    const destPath = FileSystem.documentDirectory + fileName;
    await FileSystem.copyAsync({ from: filePath, to: destPath });
    
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(destPath);
    console.log("File info:", fileInfo);
    if (!fileInfo.exists) {
      Alert.alert("Error", "The report file was not found.");
      return;
    }
    
    // For testing: try composing the email without the attachment first
    const result = await MailComposer.composeAsync({
      recipients: [recipientEmail],
      subject: "Grassland Survey Report",
      body: "Please find the attached survey report.",
      //attachments: [destPath], // Comment this out to test without attachment
    });
    
    if (result.status === 'sent') {
      Alert.alert("Success", "Report has been sent via email.");
    } else if (result.status === 'saved') {
      Alert.alert("Saved", "Email draft has been saved.");
    } else {
      Alert.alert("Cancelled", "Email sending was cancelled.");
    }
  } catch (error) {
    console.error("❌ Error sending email via MailComposer:", error);
    Alert.alert("Error", "Failed to send the email via MailComposer.");
  }
};
