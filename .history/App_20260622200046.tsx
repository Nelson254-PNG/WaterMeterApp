// ============================================================
//  App.tsx
//  The root of the app. Sets up navigation between screens —
//  conceptually similar to your CLI's switch/case dispatch in
//  main(), except here each "case" is a whole screen the user
//  can see and interact with, and "navigating" pushes a new
//  screen onto a stack (like browser history).
// ============================================================

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CustomerListScreen from "./screens/CustomerListScreen";
import RegisterCustomerScreen from "./screens/RegisterCustomerScreen";
import CustomerDetailScreen from "./screens/CustomerDetailScreen";
import RecordUsageScreen from "./screens/RecordUsageScreen";

// Stack.Navigator manages a "stack" of screens — pushing a new
// one (navigate) shows it on top with a back button; popping
// (goBack) returns to the previous one. This mirrors how your
// CLI's menu loop returned to the main menu after each action,
// except now it's visual and the user controls the back navigation.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CustomerList">
        <Stack.Screen
          name="CustomerList"
          component={CustomerListScreen}
          options={{ title: "Customers" }}
        />
        <Stack.Screen
          name="RegisterCustomer"
          component={RegisterCustomerScreen}
          options={{ title: "Register Customer" }}
        />
        <Stack.Screen
          name="CustomerDetail"
          component={CustomerDetailScreen}
          options={{ title: "Customer Detail" }}
        />
        <Stack.Screen
          name="RecordUsage"
          component={RecordUsageScreen}
          options={{title: "Record Usage"}}
        
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}