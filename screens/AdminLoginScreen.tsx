import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { adminLogin } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Shadow, Typography } from "../theme";

export default function AdminLoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError("Enter both username and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await adminLogin(username.trim(), password);
      await login(result.token, result.role, result.userId);
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top branding band */}
      <View style={styles.brand}>
        <Text style={styles.brandIcon}>💧</Text>
        <Text style={styles.brandTitle}>Water Meter Admin</Text>
        <Text style={styles.brandSubtitle}>Management System</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Administrator Login</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          autoCapitalize="none"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          placeholderTextColor={Colors.textMuted}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Log In</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDark, justifyContent: "center", padding: Spacing.lg },
  brand: { alignItems: "center", marginBottom: Spacing.xl },
  brandIcon: { fontSize: 48 },
  brandTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginTop: Spacing.sm },
  brandSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.lg },
  cardTitle: { fontSize: 17, fontWeight: "700", color: Colors.text, marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.sm },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 15,
    color: Colors.text, backgroundColor: Colors.background,
  },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md },
  errorText: { color: Colors.danger, fontSize: 13 },
  button: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: "center", marginTop: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});