import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./data/screens/HomeScreen";
import GrasslandSurvey from "./data/screens/GrasslandSurvey";
import EmailTestScreen from "./data/screens/EmailTestScreen";
import CompletedForms from "./data/screens/CompletedForms";
import { FontAwesome } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ Stack Navigator for "New" Tab
function NewSurveyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: "New Survey" }} />
      <Stack.Screen name="GrasslandSurvey" component={GrasslandSurvey} options={{ title: "Grassland Survey" }} />
    </Stack.Navigator>
  );
}

// ✅ Main App Navigation (Bottom Tabs)
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "New") {
              iconName = "plus-circle"; // ✅ "New" Tab Icon
            } else if (route.name === "Completed") {
              iconName = "check-circle"; // ✅ "Completed" Tab Icon
            }
            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="New" component={NewSurveyStack} options={{ headerShown: false }} />
        <Tab.Screen name="Completed" component={CompletedForms} options={{ title: "Completed Forms" }} />
        <Tab.Screen name="EmailTestScreen" component={EmailTestScreen} options={{ title: "Email Test" }} />
        </Tab.Navigator>
    </NavigationContainer>
  );
}
