// ============================================================
//  screens/RegisterCustomerScreen.tsx
//  A real form: name, phone, opening reading. Submits to the
//  API, then navigates back to the list (which auto-refreshes
//  thanks to useFocusEffect in CustomerListScreen).
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
import { useNavigation } from "@react-navigation/native";
import { registerCustomer } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RegisterCustomerScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  // One useState per form field — the React equivalent of the
  // local variables you'd declare before a series of cin >>
  // prompts in your CLI's registerCustomer().
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [openingReading, setOpeningReading] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Basic validation BEFORE calling the API — same spirit as
    // your CLI's "if (amount <= 0)" checks, just happening in
    // the UI layer this time.
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }

    const reading = parseFloat(openingReading);
    if (isNaN(reading) || reading < 0) {
      setError("Opening reading must be a valid number ≥ 0.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await registerCustomer(token!, name.trim(), phone.trim(), reading);
      // Success — go back to the list. The list screen's
      // useFocusEffect will automatically re-fetch and show
      // the new customer.
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Jane Wanjiru"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. 0712345678"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Opening Meter Reading (m³)</Text>
        <TextInput
          style={styles.input}
          value={openingReading}
          onChangeText={setOpeningReading}
          placeholder="0"
          keyboardType="numeric"
        />

        {error && <Text style={styles.errorText}>⚠ {error}</Text>}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Register Customer</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  errorText: { color: "#dc2626", marginTop: 16, fontSize: 14 },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});