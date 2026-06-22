// ============================================================
//  screens/RegisterCustomerScreen.tsx
//  PLACEHOLDER for now — full form comes in the next step.
//  This exists so navigation.navigate("RegisterCustomer")
//  doesn't crash while we test the list screen first.
// ============================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RegisterCustomerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register screen coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: "#64748b" },
});