// EmailTestScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';

const EmailTestScreen = ({ route }) => {
  // filePath and fileName can be passed from GrasslandSurvey screen via navigation
  const { filePath, fileName } = route.params || {};
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailText, setEmailText] = useState('');

  const handleSendEmail = async () => {
    if (!recipientEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please provide a valid email address.');
      return;
    }

    let attachmentParam = '';
    
    // If filePath and fileName are provided, copy the file to a known location and prepare the attachment parameter.
    if (filePath && fileName) {
      try {
        // Ensure fileName includes the proper extension (e.g., ".docx")
        const destPath = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({ from: filePath, to: destPath });
        
        // Verify that the file exists at the destination
        const fileInfo = await FileSystem.getInfoAsync(destPath);
        console.log("Attachment file info:", fileInfo);
        if (!fileInfo.exists) {
          Alert.alert("Error", "Attachment file not found.");
          return;
        }
        
        // Append a non-standard attachment parameter.
        // Note: This parameter is not officially supported and may be ignored by most email clients.
        attachmentParam = `&attachment=${encodeURIComponent(destPath)}`;
      } catch (error) {
        console.error("Error processing attachment:", error);
        Alert.alert("Error", "Failed to process the attachment.");
        return;
      }
    }

    const subject = encodeURIComponent('Test Email');
    const body = encodeURIComponent(emailText);
    
    // Build the mailto URL. The 'attachment' parameter here is non-standard.
    const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}${attachmentParam}`;

    Linking.openURL(mailtoUrl)
      .then(() => {
        console.log('Email client opened');
      })
      .catch((error) => {
        console.error('Error opening email client', error);
        Alert.alert('Error', 'Failed to open the email client.');
      });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Email Test with Attachment (Mailto)</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
        }}
        placeholder="Recipient Email Address"
        value={recipientEmail}
        onChangeText={setRecipientEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
          minHeight: 100,
          textAlignVertical: 'top',
        }}
        placeholder="Enter your email text"
        value={emailText}
        onChangeText={setEmailText}
        multiline
      />
      <Button title="Send Email" onPress={handleSendEmail} />
    </View>
  );
};

export default EmailTestScreen;
