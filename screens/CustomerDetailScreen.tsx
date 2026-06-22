// ============================================================
//  screens/CustomerDetailScreen.tsx
//  PLACEHOLDER for now — full detail view (usage, bills,
//  payments) comes after we confirm the list screen works.
// ============================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function CustomerDetailScreen() {
  const route = useRoute<any>();
  const { customerId, customerName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{customerName}</Text>
      <Text style={styles.id}>{customerId}</Text>
      <Text style={styles.text}>Detail screen (usage/bills/payments) coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  id: { fontSize: 11, color: "#94a3b8", marginTop: 4, marginBottom: 16 },
  text: { color: "#64748b", textAlign: "center" },
});