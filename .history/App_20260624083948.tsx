// ============================================================
//  App.tsx
//  The root of the app. Sets up navigation between ALL six
//  screens — the complete flow: list -> register -> detail ->
//  record usage / generate bill / make payment.
// ============================================================

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CustomerListScreen from "./screens/CustomerListScreen";
import RegisterCustomerScreen from "./screens/RegisterCustomerScreen";
import CustomerDetailScreen from "./screens/CustomerDetailScreen";
import RecordUsageScreen from "./screens/RecordUsageScreen";
import GenerateBillScreen from "./screens/GenerateBillScreen";
import MakePaymentScreen from "./screens/MakePaymentScreen";

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
          options={{ title: "Record Usage" }}
        />
        <Stack.Screen
          name="GenerateBill"
          component={GenerateBillScreen}
          options={{ title: "Generate Bill" }}
        />
        <Stack.Screen
          name="MakePayment"
          component={MakePaymentScreen}
          options={{ title: "Make Payment" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}