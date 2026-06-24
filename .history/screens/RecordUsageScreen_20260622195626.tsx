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
import { recordUsage } from "../api/client";

// Helper: today's date as YYYY-MM-DD, matching what your
// C++ DATE columns expect. Pre-fills the field so the user
// usually doesn't need to type anything here.
function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function RecordUsageScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId } = route.params;

  const [currentReading, setCurrentReading] = useState("");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  const handleSubmit = async () => {
    const reading = parseFloat(currentReading);
    if (isNaN(reading) || reading < 0) {
      setError("Enter a valid reading.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // recordUsage() throws if the reading is lower than the
      // customer's last one — same validation your C++
      // recordUsageLogic() does, just surfaced here as a
      // caught exception with e.message holding the real text.
      const result = await recordUsage(customerId, reading, date);
      setSuccess(result.unitsUsed);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e: any) {
      setError(e.message ?? "Failed to record usage");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Current Meter Reading (m³)</Text>
        <TextInput
          style={styles.input}
          value={currentReading}
          onChangeText={setCurrentReading}
          placeholder="e.g. 135.5"
          keyboardType="numeric"
          autoFocus
        />

        <Text style={styles.label}>Reading Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        {error && <Text style={styles.errorText}>⚠ {error}</Text>}
        {success !== null && (
          <Text style={styles.successText}>✔ Recorded! Units used: {success} m³</Text>
        )}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Submit Reading</Text>}
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