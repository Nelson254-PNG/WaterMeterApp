import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registerCustomer } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Shadow, Typography } from "../theme";

export default function RegisterCustomerScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [openingReading, setOpeningReading] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) { setError("Name and phone are required."); return; }
    const reading = parseFloat(openingReading);
    if (isNaN(reading) || reading < 0) { setError("Opening reading must be a valid number ≥ 0."); return; }
    setSubmitting(true); setError(null);
    try {
      const result = await registerCustomer(token!, name.trim(), phone.trim(), reading);
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? "Registration failed");
    } finally { setSubmitting(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.hint}>A meter number will be assigned automatically.</Text>

        {[
          { label: "Full Name", value: name, set: setName, placeholder: "e.g. Jane Wanjiru", cap: "words" as const, keyboard: "default" as const },
          { label: "Phone Number", value: phone, set: setPhone, placeholder: "e.g. 0712345678", cap: "none" as const, keyboard: "phone-pad" as const },
          { label: "Opening Meter Reading (m³)", value: openingReading, set: setOpeningReading, placeholder: "0", cap: "none" as const, keyboard: "numeric" as const },
        ].map(f => (
          <View key={f.label}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              autoCapitalize={f.cap}
              keyboardType={f.keyboard}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        ))}

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register Customer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  hint: { fontSize: 13, color: Colors.textSecondary, backgroundColor: Colors.primaryLight, padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.surface,
  },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md },
  errorText: { color: Colors.danger, fontSize: 13 },
  button: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: "center", marginTop: Spacing.xl },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});