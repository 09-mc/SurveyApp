// GrasslandSurvey.js
import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, TextInput, Alert, FlatList, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Dialog from 'react-native-dialog';
import { generateReportDocxtemplater } from '../../utils/docxProcessor'; // Use docxTemplater version
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const columnCount = screenWidth > 600 ? 3 : 2; // Adjust columns based on screen width

// ... (all your option objects remain unchanged)
const positiveIndicatorsOptions = {
  "Bedstraws & Stitchworts": "bed",
  "Bird's-foot Trefoils & Kidney Vetch": "bir",
  "Carline Thistle": "car",
  "Cowslips & Primrose": "cow",
  "Eyebrights": "eye",
  "Forget-me-nots": "fog",
  "Knapweeds": "kna",
  "Lady's Mantle": "man",
  "Lady's Smock (Cuckooflower)": "smo",
  "Lesser Spearwort": "spe",
  "Lichens": "lic",
  "Louseworts (Common & Marsh)": "lou",
  "Marsh Cinquefoil": "cin",
  "Marsh Marigold": "mar",
  "Marsh Pennywort": "pen",
  "Marsh Thistle": "mars",
  "Meadowsweet": "mea",
  "Meadow Thistle": "mead",
  "Mints (all)": "min",
  "Orchids": "orc",
  "Ox-eye Daisy/Dog Daisy (not Common Daisy)": "oxe",
  "Ragged": "rag",
  "Rushes, Small (not Soft or Hard Rush)": "rus",
  "Scabious (Devils’ Bit and Field)": "sca",
  "Sedges - All Species": "sed",
  "Self-heal and Bugle": "sel",
  "Sphagnum & Branched Mosses": "sph",
  "Sorrel (Common & Sheep's)": "sor",
  "Thyme": "thy",
  "Tormentil (Common & English)": "tor",
  "Umbels, Large: Angelica, Valerian, Common Hogweed": "umb",
  "Umbels, Small: Pignut, Wild Carrot, Burnet Saxifrage, Yarrow": "umbe",
  "Vetches & Vetchlings": "vet",
  "Violets - All Species; Harebell": "vio",
  "Yellow": "yel",
  "Yellow-rattle (Hay Rattle)": "yelo"
};

const areaTypeOptions = {
  "Wet Grassland": "wet", 
  "Dry Grassland": "dry", 
  "Mineral Soil": "min",
  "Peat Soil": "peat"
};

const postivieIndicatorFreq = {
  "Abundant": "a2A",
  "Frequent": "a2F",
  "Occasional": "a2O",
  "Rare": "a2R"
};

const agriFavouredSpecies = {
  "Abundant": "a3A",
  "Frequent": "a3F",
  "Occasional": "a3O",
  "Rare": "a3R"
};

const agriFavouredOptions = {
  "Docks (NOT small sorrels)": "doc", 
  "Perennial Rye grass": "ry", 
  "Ragwort": "ra", 
  "Nettles": "ne", 
  "Thistles (Creeping & spear)": "th"
};

const vegStructureOpts = {
  "Over-grazed: Sward short throughout grazeable area with little variation in height  of vegetation. >75% very short. Few flowering plants.": "a4O",
  "Moderate(over): Mostly short vegetation. 25-50% of  plot has short sward  with occasional to frequent intermediate  patches": "a4Ms",
  "Good: >50% of plot with sward  having variety of taller  and /or shorter sward  with medium height sward throughout. Positive indicators flowering.": "a4G",
  "Moderate(under): 25-50% of plot has tall  sward. Litter and dead  vegetation occurring.  Grazing largely confined to a few easily accessible, palatable  areas.": "a4Mt",
  "Under-grazed: Rank vegetation across much of the  site, litter accumulating, scrub  encroaching.": "a4U"
};

const immatureScrub = {
  "High": "b1h",
  "Medium": "b1m",
  "Low": "b1l"
};

const brackenCover = {
  "High": "b2h",
  "Med": "b2m",
  "Low": "b2l",
  "Very Low": "b2vl"
};

const nonNatives = {
  "Severe: Abundant, some  forming dense clumps,  many seedlings.": "b3s",
  "Moderate: Frequent.  Some flowering, many  seedlings present.": "b3m",
  "Slight: Plants scattered  and mostly small and not  flowering.": "b3sl",
  "Absent": "b3a"
};

const nonNativeOptions = {
  "Rhododendron": "rho",
  "Gunnera species": "gs",
  "Japanese Knotweed": "jk",
  "Cotoneaster": "ce",
  "Other:": "oth"
};

const bareSoil = {
  "High": "b4h",
  "Med": "b4m",
  "Low": "b4l"
};

const drainage = {
  "Drained grassland: Frequent widespread free  flowing drains within plot affecting >20% plot.": "b5dg",
  "Partly drained: Free  flowing drains within  plot affecting <20%  plot.": "b5pd",
  "Past drainage:  Drains present but  flow is impeded.": "b5pdr",
  "No drainage:  (Traditional small ‘foot’ drains  carefully maintained for site  integrity – see guidance)": "b5nd"
};

const damagingActivites = {
  "Severe: Occurring across a  large area or of a serious  nature if confined": "b6s",
  "Moderate:  Moderate area and  severity. ": "b6m",
  "Low: Small area  affected – damage  not significant.": "b6l",
  "Absent: No damaging activities.": "b6a"
};

const damagingActivityList = {
  "Quarrying": "qua",
  "Dumping": "dum",
  "Herbicide": "her",
  "Supplementary feeding": "sup",
  "Burning": "bur",
  "Other:": "oth2"
};

const waterDamage = {
  "Severe:  Significant amounts of dung in and around  the water source. Bare mud covering a  significant proportion of the assessment  area.": "b7s",
  "Moderate:  A small amount of dung around springs.  Water in ponds/pools may be slightly discoloured due to suspended solids. ": "b7m",
  "No damage:  Natural water sources  rarely (or lightly)  used.": "b7nd",
};

const questions = [
  { key: 'farmerId', label: 'Farmer ID', type: 'input' },
  { key: 'surveyor', label: 'Surveyor', type: 'input' },
  { key: 'plotId', label: 'Plot Number', type: 'input' },
  { key: 'managementAdvice', label: 'Management Advice / comments', type: 'input'},
  { key: 'surveyDate', label: 'Survey Date', type: 'date' },
  { key: 'areaType', label: '', type: 'multi', options: areaTypeOptions },
  { key: 'positiveIndicators', label: 'Positive Indicator Species', type: 'multi', options: positiveIndicatorsOptions },
  { key: 'A2', label: 'A2. What is the frequency of all POSITIVE indicators throughout the plot?', type: 'single', options: postivieIndicatorFreq },
  { key: 'agriFavoured', label: 'Agriculturally favoured species', type: 'multi', options: agriFavouredOptions },
  { key: 'A3', label: 'A3. What’s the frequency of agricultural favoured species throughout the plot?', type: 'single', options: agriFavouredSpecies },
  { key: 'A4', label: 'A4. What is the vegetation structure in grasslands which are primarily grazed?', type: 'single', options: vegStructureOpts },
  { key: 'B1', label: 'B1. Expansion of immature scrub? (Do not include established scrub)', type: 'single', options: immatureScrub },
  { key: 'B2', label: 'B2. What is the cover of bracken?', type: 'single', options: brackenCover },
  { key: 'B3', label: 'B3. What is the cover of non-native invasive species? Tick if present (below). ', type: 'single', options: nonNatives },
  { key: 'nonNative', label: 'Non Native Species', type: 'multi', options: nonNativeOptions },
  { key: 'B4', label: 'B4. Bare soil and erosion.', type: 'single', options: bareSoil },
  { key: 'B5', label: 'B5. Artificial drainage features within plot: ', type: 'single', options: drainage },
  { key: 'B6', label: 'B6. Is there any evidence of damaging activities to vegetation or soil?', type: 'single', options: damagingActivites },
  { key: 'damaging', label: 'Damaging Activities: Describe in comments and specify source: ', type: 'multi', options: damagingActivityList },
  { key: 'B7', label: 'B7. Is there any evidence of damage to water courses and water sources? ', type: 'single', options: waterDamage },
];

const GrasslandSurvey = () => {
  const [form, setForm] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [score, setScore] = useState(null);
  const [validated, setValidated] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  // State variables for email dialog
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [docFilePathForEmail, setDocFilePathForEmail] = useState(null);
  const navigation = useNavigation();

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  
  const validateForm = () => {
    const requiredFields = ["farmerId", "surveyor", "plotId", "surveyDate", "areaType", "positiveIndicators", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "B5", "B6", "B7"];
    const missingFields = requiredFields.filter(field => !form[field] || (Array.isArray(form[field]) && form[field].length === 0));
  
    if (missingFields.length === 0) {
      setValidated(true);
      setShowAnswers(true);
      calculateScore(); // Trigger score calculation
      console.log("Validation passed. Score:", score);
    } else {
      setValidated(false);
      setShowAnswers(true);
      console.log("Validation failed. Missing fields:", missingFields);
    }
  };
  
  const getAllResponses = () => {
    return Object.entries(form).map(([key, values]) => {
      if (!values || values.length === 0) return null;
      let formattedValue = values instanceof Date ? values.toLocaleDateString() : values;
      return {
        category: key,
        value: Array.isArray(formattedValue) ? formattedValue.join(", ") : formattedValue,
      };
    }).filter(Boolean);
  };
  
  const submitSurvey = async () => {
    try {
      const existingSurveys = JSON.parse(await AsyncStorage.getItem('submittedSurveys')) || [];
      const updatedSurveys = [form, ...existingSurveys];
      await AsyncStorage.setItem('submittedSurveys', JSON.stringify(updatedSurveys));
      navigation.navigate('SubmittedForms');
    } catch (error) {
      console.error("Error saving survey:", error);
    }
  };
  
  const calculateScore = () => {
    let calculatedScore = 0;
    const selectedCount = form['positiveIndicators'] ? form['positiveIndicators'].length : 0;
    if (selectedCount >= 13) calculatedScore = 20;
    else if (selectedCount >= 9) calculatedScore = 15;
    else if (selectedCount >= 5) calculatedScore = 5;
    const frequencyScoreMap = {
      "Abundant": 25,
      "Frequent": 15,
      "Occasional": 5,
      "Rare": 0
    };
    if (form['A2']) {
      calculatedScore += frequencyScoreMap[form['A2']] || 0;
    }
    const agriSpeciesScoreMap = {
      "Abundant": -20,
      "Frequent": -10,
      "Occasional": 0,
      "Rare": 5
    };
    if (form['A3']) {
      calculatedScore += agriSpeciesScoreMap[form['A3']] || 0;
    }
    const vegetationStructureScoreMap = {
      "Over-grazed": -10,
      "Moderate(over)": 10,
      "Good": 25,
      "Moderate(under)": 10,
      "Under-grazed": -10
    };
    if (form['A4']) {
      const selectedA4 = Object.keys(vegetationStructureScoreMap).find(key => form['A4'].startsWith(key));
      if (selectedA4) {
        calculatedScore += vegetationStructureScoreMap[selectedA4];
      }
    }
    setScore(calculatedScore);
    return calculatedScore;
  };
  
  const calculateScoreB = (form) => {
    console.log("Calculating additional score...");
    if (!form || typeof form !== "object") {
      console.error("Form data is undefined in calculateScoreB");
      return 0; 
    }
    let calculatedScoreB = 0;
    const b1ScoreMap = {
      "High": -20,
      "Medium": 0,
      "Low": 5
    };
    if (form["B1"]) {
      calculatedScoreB += b1ScoreMap[form["B1"]] || 0;
    }
    const b2ScoreMap = {
      "High": -20,
      "Medium": -10,
      "Low": 0,
      "Very Low": 5
    };
    if (form["B2"]) {
      calculatedScoreB += b2ScoreMap[form["B2"]] || 0;
    }
    const b3ScoreMap = {
      "Severe": -20,
      "Moderate": -15,
      "Slight": -5,
      "Absent": 0
    };
    if (form['B3']) {
      const selectedB3 = Object.keys(b3ScoreMap).find(key => form['B3'].startsWith(key));
      if (selectedB3) {
        calculatedScoreB += b3ScoreMap[selectedB3];
      }  
    }
    const b4ScoreMap = {
      "High": -20,
      "Medium": 0,
      "Low": 10
    };
    if (form["B4"]) {
      calculatedScoreB += b4ScoreMap[form["B4"]] || 0;
    }   
    const b5ScoreMap = {
      "Drained": -20,
      "Partly": -10,
      "Past": 0,
      "No": 5
    };
    if (form['B5']) {
      const selectedB5 = Object.keys(b5ScoreMap).find(key => form['B5'].startsWith(key));
      if (selectedB5) {
        calculatedScoreB += b5ScoreMap[selectedB5];
      }  
    }
    const b6ScoreMap = {
      "Severe": -30,
      "Moderate": -20,
      "Low": -10,
      "Absent": 0
    };
    if (form['B6']) {
      const selectedB6 = Object.keys(b6ScoreMap).find(key => form['B6'].startsWith(key));
      if (selectedB6) {
        calculatedScoreB += b6ScoreMap[selectedB6];
      }  
    }
    const b7ScoreMap = {
      "Severe": -20,
      "Moderate": -10,
      "No": 0
    };
    if (form['B7']) {
      const selectedB7 = Object.keys(b7ScoreMap).find(key => form['B7'].startsWith(key));
      if (selectedB7) {
        calculatedScoreB += b7ScoreMap[selectedB7];
      }  
    }    
    console.log("Additional Score:", calculatedScoreB);
    return calculatedScoreB;
  };
  
  const handleGeneratePDF = async () => {
    try {
      console.log("Checking form before generating report:", form);
      if (!form || Object.keys(form).length === 0) {
        Alert.alert("Error", "No form data available. Please complete the survey before generating the report.");
        return;
      }
      const templatePath = await AsyncStorage.getItem("Grassland_template");
      if (!templatePath) {
        Alert.alert("Missing Template", "Please download the Grassland template before generating the report.");
        return;
      }
      console.log("Using Template Path:", templatePath);
      if (!questions || !Array.isArray(questions)) {
        console.error("Questions array is undefined or not an array");
        Alert.alert("Error", "Questions data is missing.");
        return;
      }
      console.log("Questions Loaded:", questions.length, "questions found.");
      let processedForm = { ...form };
      const positiveIndicatorsCount = form["positiveIndicators"] ? form["positiveIndicators"].length : 0;
      processedForm = {
        ...processedForm,
        a1H: positiveIndicatorsCount >= 13 ? "✔" : "",
        a1Mh: positiveIndicatorsCount >= 9 && positiveIndicatorsCount <= 12 ? "✔" : "",
        a1M: positiveIndicatorsCount >= 5 && positiveIndicatorsCount <= 8 ? "✔" : "",
        a1L: positiveIndicatorsCount >= 0 && positiveIndicatorsCount <= 4 ? "✔" : "",
      };
      questions.forEach((question) => {
        if (question.type === "single" || question.type === "multi") {
          if (question.options && typeof question.options === "object") {
            Object.entries(question.options).forEach(([answer, placeholder]) => {
              processedForm[placeholder] = form[question.key]?.includes(answer) ? "✔" : "";
            });
          }
        }
      });
      const sectionAScore = calculateScore(form);
      const sectionBScore = calculateScoreB(form);
      const combinedScore = sectionAScore + sectionBScore;
      processedForm["score"] = sectionAScore.toString();
      processedForm["bScore"] = sectionBScore.toString();
      processedForm["totSco"] = combinedScore.toString();
      console.log("Processed Form Before Sending to DOCX:", processedForm);
      const docFilePath = await generateReportDocxtemplater(templatePath, processedForm, questions);
      console.log("Generated DOCX at:", docFilePath);
      // Save file path and open email dialog
      setDocFilePathForEmail(docFilePath);
      setEmailDialogVisible(true);
    } catch (error) {
      console.error("Failed to generate report:", error);
      Alert.alert("Error", "Failed to generate the report.");
    }
  };
  
  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 10 }}>
      <Text>{item.label}</Text>
      {item.type === "input" ? (
        <TextInput
          value={form[item.key] || ""}
          onChangeText={(val) => handleChange(item.key, val)}
          style={{ borderBottomWidth: 1, marginBottom: 10, minHeight: 40 }}
          editable={true}
          multiline
        />
      ) : item.type === "date" ? (
        <View>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ padding: 10, backgroundColor: "lightgray", borderRadius: 5 }}
          >
            <Text>{form[item.key] ? form[item.key].toLocaleDateString() : "Select Date"}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form[item.key] || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) handleChange(item.key, selectedDate);
              }}
            />
          )}
        </View>
      ) : item.type === "multi" ? (
        <FlatList
          data={Object.entries(item.options)}
          keyExtractor={([key]) => key}
          numColumns={columnCount}
          renderItem={({ item: [answer, placeholder] }) => (
            <TouchableOpacity
              onPress={() => {
                const updatedValues = form[item.key] ? [...form[item.key]] : [];
                if (updatedValues.includes(answer)) {
                  updatedValues.splice(updatedValues.indexOf(answer), 1);
                } else {
                  updatedValues.push(answer);
                }
                handleChange(item.key, updatedValues);
              }}
              style={{
                flex: 1,
                margin: 5,
                padding: 10,
                backgroundColor: form[item.key]?.includes(answer) ? "green" : "gray",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>{answer}</Text>
            </TouchableOpacity>
          )}
        />
      ) : item.type === "single" ? (
        Object.entries(item.options).map(([answer, placeholder]) => (
          <TouchableOpacity
            key={answer}
            onPress={() => handleChange(item.key, answer)}
            style={{
              padding: 10,
              backgroundColor: form[item.key] === answer ? "green" : "gray",
              marginVertical: 2,
            }}
          >
            <Text style={{ color: "white" }}>{answer}</Text>
          </TouchableOpacity>
        ))
      ) : null}
    </View>
  );
  
  return (
    <>
      <FlatList
        data={questions}
        extraData={form}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Grassland Survey</Text>
        }
        ListFooterComponent={
          <View style={{ padding: 20 }}>
            <Button title="Validate" onPress={validateForm} />
            {score !== null && (
              <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>Total Score: {score}</Text>
            )}
            {showAnswers && (
              <View style={{ marginTop: 20, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 5 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>Your Answers:</Text>
                {getAllResponses().length > 0 ? (
                  <FlatList
                    data={getAllResponses()}
                    keyExtractor={(item, index) => `${item.category}-${index}`}
                    renderItem={({ item }) => (
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>{item.category}:</Text> {item.value}
                      </Text>
                    )}
                  />
                ) : (
                  <Text style={{ fontStyle: "italic", color: "gray" }}>No responses recorded.</Text>
                )}
              </View>
            )}
            {validated && (
              <>
                <Button title="Submit Survey" onPress={() => console.log("Survey submitted!", form)} color="green" />
                <View style={{ marginTop: 10 }}>
                  <Button title="Generate Report" onPress={handleGeneratePDF} />
                </View>
              </>
            )}
          </View>
        }
      />
  
      <Dialog.Container visible={emailDialogVisible}>
        <Dialog.Title>Send Report via Email</Dialog.Title>
        <Dialog.Description>
          Enter the recipient's email address:
        </Dialog.Description>
        <Dialog.Input
          placeholder="email@example.com"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setEmailDialogVisible(false);
            setEmail("");
          }}
        />
        <Dialog.Button
          label="Send"
          onPress={() => {
            if (email && email.includes("@")) {
              // Navigate to EmailTestScreen, passing file info and recipient email as parameters.
              navigation.navigate("EmailTestScreen", {
                filePath: docFilePathForEmail,
                fileName: "Grassland_Scorecard.docx",
                recipientEmail: email,
              });
              setEmailDialogVisible(false);
              setEmail("");
            } else {
              Alert.alert("Invalid Email", "Please enter a valid email address.");
            }
          }}
        />
      </Dialog.Container>
    </>
  );
};
  
export default GrasslandSurvey;
