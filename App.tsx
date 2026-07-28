import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Colors } from "./theme";

import AdminLoginScreen from "./screens/AdminLoginScreen";
import CustomerListScreen from "./screens/CustomerListScreen";
import RegisterCustomerScreen from "./screens/RegisterCustomerScreen";
import CustomerDetailScreen from "./screens/CustomerDetailScreen";
import RecordUsageScreen from "./screens/RecordUsageScreen";
import GenerateBillScreen from "./screens/GenerateBillScreen";
import MakePaymentScreen from "./screens/MakePaymentScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AlertsScreen from "./screens/AlertsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function CustomerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen}
        options={{ title: "Register Customer", headerStyle: { backgroundColor: Colors.primaryDark }, headerTintColor: "#fff" }} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen}
        options={{ title: "Customer", headerStyle: { backgroundColor: Colors.primaryDark }, headerTintColor: "#fff" }} />
      <Stack.Screen name="RecordUsage" component={RecordUsageScreen}
        options={{ title: "Record Usage", headerStyle: { backgroundColor: Colors.primaryDark }, headerTintColor: "#fff" }} />
      <Stack.Screen name="GenerateBill" component={GenerateBillScreen}
        options={{ title: "Generate Bill", headerStyle: { backgroundColor: Colors.primaryDark }, headerTintColor: "#fff" }} />
      <Stack.Screen name="MakePayment" component={MakePaymentScreen}
        options={{ title: "Make Payment", headerStyle: { backgroundColor: Colors.primaryDark }, headerTintColor: "#fff" }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: Colors.border, paddingBottom: 8, paddingTop: 6, height: 128 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tab.Screen name="CustomersTab" component={CustomerStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />, tabBarLabel: "Customers" }} />
      <Tab.Screen name="Alerts" component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} />, tabBarLabel: "Alerts" }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, tabBarLabel: "Dashboard" }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { token, loading } = useAuth();
  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return <AuthProvider><RootNavigator /></AuthProvider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.primaryDark },
});