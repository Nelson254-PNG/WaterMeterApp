import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { makePayment, payByMpesa, payByTill } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Bill } from "../types";
import { Colors, Spacing, Radius, Shadow } from "../theme";

function todayISO() { return new Date().toISOString().split("T")[0]; }
type Method = "Cash" | "M-Pesa" | "M-Pesa Till" | "Bank Transfer";

export default function MakePaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId, bills } = route.params as { customerId: string; bills: Bill[] };
  const { token } = useAuth();

  const unpaidBills = bills.filter((b) => !b.paid);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(
    unpaidBills.length > 0 ? unpaidBills[0].id : null
  );
  const [method, setMethod] = useState<Method>("Cash");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedBill = unpaidBills.find((b) => b.id === selectedBillId);
  const isMpesa = method === "M-Pesa" || method === "M-Pesa Till";

  const handleSubmit = async () => {
    if (!selectedBillId) { setError("Select a bill."); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    if (isMpesa && reference.trim().length !== 10) { setError("M-Pesa code must be 10 characters."); return; }
    setSubmitting(true); setError(null);
    try {
      if (method === "M-Pesa") await payByMpesa(token!, customerId, selectedBillId, reference.trim().toUpperCase(), amt, date);
      else if (method === "M-Pesa Till") await payByTill(token!, customerId, selectedBillId, reference.trim().toUpperCase(), amt, date);
      else await makePayment(token!, customerId, selectedBillId, method, reference || "N/A", amt, date);
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e: any) { setError(e.message ?? "Payment failed"); }
    finally { setSubmitting(false); }
  };

  if (unpaidBills.length === 0) return (
    <View style={styles.centered}>
      <Text style={styles.clearIcon}>✅</Text>
      <Text style={styles.clearText}>No unpaid bills!</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>Select Bill</Text>
        {unpaidBills.map((b) => {
          const rem = b.totalAmount - b.amountPaid;
          const sel = b.id === selectedBillId;
          return (
            <TouchableOpacity key={b.id}
              style={[styles.billCard, sel && styles.billCardSelected]}
              onPress={() => setSelectedBillId(b.id)} activeOpacity={0.7}
            >
              <View>
                <Text style={styles.billDate}>{b.issueDate}</Text>
                <Text style={styles.billDue}>Due: {b.dueDate}</Text>
              </View>
              <Text style={[styles.billAmount, sel && styles.billAmountSelected]}>
                KES {rem.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.methodGrid}>
          {(["Cash", "M-Pesa", "M-Pesa Till", "Bank Transfer"] as Method[]).map((m) => (
            <TouchableOpacity key={m}
              style={[styles.methodChip, method === m && styles.methodChipSelected]}
              onPress={() => { setMethod(m); setReference(""); }} activeOpacity={0.7}
            >
              <Text style={[styles.methodChipText, method === m && styles.methodChipTextSelected]}>
                {m === "Cash" ? "💵" : m === "M-Pesa" ? "📱" : m === "M-Pesa Till" ? "🏪" : "🏦"} {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Amount (KES)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder={selectedBill ? (selectedBill.totalAmount - selectedBill.amountPaid).toFixed(2) : "0.00"}
          keyboardType="numeric"
          placeholderTextColor={Colors.textMuted}
        />

        {method !== "Cash" && (
          <>
            <Text style={styles.sectionLabel}>{isMpesa ? "M-Pesa Transaction Code" : "Reference"}</Text>
            <TextInput
              style={styles.input}
              value={reference}
              onChangeText={setReference}
              placeholder={isMpesa ? "e.g. QGR7XYZ123" : "Reference number"}
              autoCapitalize="characters"
              maxLength={isMpesa ? 10 : undefined}
              placeholderTextColor={Colors.textMuted}
            />
            {isMpesa && (
              <Text style={styles.codeHint}>
                {reference.length}/10 characters
              </Text>
            )}
          </>
        )}

        <Text style={styles.sectionLabel}>Payment Date</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} />

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}
        {success && <View style={styles.successBox}><Text style={styles.successText}>✔ Payment recorded!</Text></View>}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Payment</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  clearIcon: { fontSize: 48 },
  clearText: { fontSize: 18, fontWeight: "600", color: Colors.success, marginTop: Spacing.sm },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  billCard: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", ...Shadow.sm,
  },
  billCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  billDate: { fontSize: 14, fontWeight: "600", color: Colors.text },
  billDue: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  billAmount: { fontSize: 18, fontWeight: "700", color: Colors.text },
  billAmountSelected: { color: Colors.primary },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  methodChip: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface, minWidth: "47%",
  },
  methodChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  methodChipText: { fontSize: 13, fontWeight: "600", color: Colors.text, textAlign: "center" },
  methodChipTextSelected: { color: "#fff" },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.surface,
  },
  codeHint: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: "right" },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md },
  errorText: { color: Colors.danger, fontSize: 13 },
  successBox: { backgroundColor: Colors.successLight, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md },
  successText: { color: Colors.success, fontSize: 13, fontWeight: "600" },
  button: { backgroundColor: Colors.success, borderRadius: Radius.md, paddingVertical: 14, alignItems: "center", marginTop: Spacing.xl },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});