import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { generateBill } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius } from "../theme";

function todayISO() { return new Date().toISOString().split("T")[0]; }
function defaultDue() { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split("T")[0]; }

export default function GenerateBillScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId } = route.params;
  const { token } = useAuth();
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(defaultDue());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ billId: string; totalUnits: number } | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try {
      const res = await generateBill(token!, customerId, issueDate, dueDate);
      setResult(res);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (e: any) { setError(e.message ?? "Failed to generate bill"); }
    finally { setSubmitting(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>📄 This will bill all unbilled usage records for this customer.</Text>
        </View>
        <Text style={styles.label}>Issue Date</Text>
        <TextInput style={styles.input} value={issueDate} onChangeText={setIssueDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} />
        <Text style={styles.label}>Due Date</Text>
        <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} />
        {error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}
        {result && <View style={styles.successBox}><Text style={styles.successText}>✔ Bill generated for {result.totalUnits} m³</Text></View>}
        <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Bill</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  infoCard: { backgroundColor: "#fef9c3", borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.md },
  infoText: { fontSize: 13, color: "#854d0e" },
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