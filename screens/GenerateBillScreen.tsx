// ============================================================
//  screens/GenerateBillScreen.tsx
//  Form to generate a bill from unbilled usage records.
//  Mirrors your CLI's generateBill(): issue date + due date.
// ============================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { generateBill } from "../api/client";
import { useAuth } from "../context/AuthContext";

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// Default due date: 14 days from today — a reasonable default
// the user can edit, instead of leaving the field blank.
function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

export default function GenerateBillScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId } = route.params;
  const { token } = useAuth();

  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ billId: string; totalUnits: number } | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // generateBill() throws "No unbilled usage records for this
      // customer" if there's nothing new to bill — same check
      // your C++ generateBillLogic() does with COUNT(*).
      const res = await generateBill(token!, customerId, issueDate, dueDate);
      setResult(res);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (e: any) {
      setError(e.message ?? "Failed to generate bill");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Issue Date</Text>
        <TextInput style={styles.input} value={issueDate} onChangeText={setIssueDate} placeholder="YYYY-MM-DD" />

        <Text style={styles.label}>Due Date</Text>
        <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />

        {error && <Text style={styles.errorText}>⚠ {error}</Text>}
        {result && (
          <Text style={styles.successText}>
            ✔ Bill generated for {result.totalUnits} m³
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Generate Bill</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, backgroundColor: "white",
  },
  errorText: { color: "#dc2626", marginTop: 16, fontSize: 14 },
  successText: { color: "#16a34a", marginTop: 16, fontSize: 14, fontWeight: "600" },
  button: { backgroundColor: "#2563eb", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 28 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});