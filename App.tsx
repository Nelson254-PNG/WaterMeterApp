// ============================================================
//  App.tsx
//  THE ROOT. Now wraps everything in AuthProvider, and decides
//  WHICH navigator to show based on login state:
//    - Not logged in -> just the login screen
//    - Logged in     -> the full admin app (list, detail, etc.)
//
//  This pattern — switching the entire navigation stack based
//  on auth state — is the standard way React Native apps
//  handle "logged out" vs "logged in" experiences.
// ============================================================

import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "./context/AuthContext";

import AdminLoginScreen from "./screens/AdminLoginScreen";
import CustomerListScreen from "./screens/CustomerListScreen";
import RegisterCustomerScreen from "./screens/RegisterCustomerScreen";
import CustomerDetailScreen from "./screens/CustomerDetailScreen";
import RecordUsageScreen from "./screens/RecordUsageScreen";
import GenerateBillScreen from "./screens/GenerateBillScreen";
import MakePaymentScreen from "./screens/MakePaymentScreen";

const Stack = createNativeStackNavigator();

// ── THE MAIN APP STACK (only reachable once logged in) ────────
function MainAppStack() {
  return (
    <Stack.Navigator initialRouteName="CustomerList">
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: "Customers" }} />
      <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} options={{ title: "Register Customer" }} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: "Customer Detail" }} />
      <Stack.Screen name="RecordUsage" component={RecordUsageScreen} options={{ title: "Record Usage" }} />
      <Stack.Screen name="GenerateBill" component={GenerateBillScreen} options={{ title: "Generate Bill" }} />
      <Stack.Screen name="MakePayment" component={MakePaymentScreen} options={{ title: "Make Payment" }} />
    </Stack.Navigator>
  );
}

// ── THE ROOT DECIDER: picks login screen vs main app ───────────
function RootNavigator() {
  const { token, loading } = useAuth();

  // While we're checking AsyncStorage for a saved token on
  // startup, show a spinner instead of flashing the login
  // screen for a split second unnecessarily.
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainAppStack /> : (
        <Stack.Navigator>
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});