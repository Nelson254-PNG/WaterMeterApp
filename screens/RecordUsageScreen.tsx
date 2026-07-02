import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { recordUsage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Shadow } from "../theme";

function todayISO() { return new Date().toISOString().split("T")[0]; }

export default function RecordUsageScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId } = route.params;
  const { token } = useAuth();
  const [currentReading, setCurrentReading] = useState("");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const handleSubmit = async () => {
    const reading = parseFloat(currentReading);
    if (isNaN(reading) || reading < 0) { setError("Enter a valid reading."); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await recordUsage(token!, customerId, reading, date);
      setResult(res.unitsUsed);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (e: any) { setError(e.message ?? "Failed to record"); }
    finally { setSubmitting(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>💧 Enter the meter reading shown on the physical water meter.</Text>
        </View>
        <Text style={styles.label}>Current Reading (m³)</Text>
        <TextInput style={styles.input} value={currentReading} onChangeText={setCurrentReading} placeholder="e.g. 135.5" keyboardType="numeric" autoFocus placeholderTextColor={Colors.textMuted} />
        <Text style={styles.label}>Reading Date</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} />
        {error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}
        {result !== null && <View style={styles.successBox}><Text style={styles.successText}>✔ Recorded! Units used: {result} m³</Text></View>}
        <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Reading</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  infoCard: { backgroundColor: "#e0f2fe", borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.md },
  infoText: { fontSize: 13, color: "#0369a1" },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 15, color: Colors.text, backgroundColor: Colors.surface },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md },
  errorText: { color: Colors.danger, fontSize: 13 },
  successBox: { backgroundColor: Colors.successLight, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md },
  successText: { color: Colors.success, fontSize: 13, fontWeight: "600" },
  button: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: "center", marginTop: Spacing.xl },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});