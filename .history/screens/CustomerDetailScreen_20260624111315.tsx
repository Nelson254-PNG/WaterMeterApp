// ============================================================
//  screens/CustomerDetailScreen.tsx
//  Shows everything about ONE customer: balance, usage history,
//  bills, and payment history. Buttons navigate to the action
//  screens (Record Usage, Generate Bill, Make Payment).
// ============================================================

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { getUsageHistory, getBills, getPayments, deleteCustomer } from "../api/client";
import { UsageRecord, Bill, Payment } from "../types";

export default function CustomerDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId, customerName } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [balance, setBalance] = useState(0);
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // ── LOAD ALL THREE SECTIONS IN PARALLEL ──────────────────────
  // Promise.all runs all three API calls AT THE SAME TIME rather
  // than one after another — same end result, but faster, since
  // none of these three queries depend on each other's result.
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [usageData, billsData, paymentsData] = await Promise.all([
        getUsageHistory(customerId),
        getBills(customerId),
        getPayments(customerId),
      ]);
      setUsage(usageData.records);
      setBills(billsData.bills);
      setBalance(billsData.balance);
      setPayments(paymentsData.payments);
    } catch (e: any) {
      setError(e.message ?? "Failed to load customer data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ── DELETE WITH CONFIRMATION ──────────────────────────────────
  // Alert.alert is React Native's built-in native confirmation
  // dialog — equivalent to your CLI's "Type YES to confirm"
  // prompt, but using the phone's actual native UI instead of
  // typed text. We pass two buttons: a safe "Cancel" (default)
  // and a destructive "Delete" that actually calls the API.
  const handleDelete = () => {
    Alert.alert(
      "Delete Customer?",
      `This will permanently delete ${customerName} and ALL their usage records, bills, and payments. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomer(customerId);
              navigation.navigate("CustomerList");
            } catch (e: any) {
              Alert.alert("Delete Failed", e.message ?? "Could not delete customer");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* ── BALANCE CARD ──────────────────────────────────── */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            balance > 0 ? styles.owing : balance < 0 ? styles.credit : styles.clear,
          ]}
        >
          KES {balance.toFixed(2)}
        </Text>
        <Text style={styles.balanceStatus}>
          {balance > 0 ? "OWING" : balance < 0 ? "CREDIT" : "CLEAR"}
        </Text>
      </View>

      {error && <Text style={styles.errorText}>⚠ {error}</Text>}

      {/* ── ACTION BUTTONS ────────────────────────────────── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("RecordUsage", { customerId })}
        >
          <Text style={styles.actionButtonText}>Record Usage</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("GenerateBill", { customerId })}
        >
          <Text style={styles.actionButtonText}>Generate Bill</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.payButton}
        onPress={() => navigation.navigate("MakePayment", { customerId, bills })}
      >
        <Text style={styles.payButtonText}>Make a Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Customer</Text>
      </TouchableOpacity>

      {/* ── USAGE HISTORY ─────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Usage History ({usage.length})</Text>
      {usage.length === 0 ? (
        <Text style={styles.emptyText}>No usage recorded yet.</Text>
      ) : (
        usage.map((r, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowDate}>{r.date}</Text>
            <Text style={styles.rowDetail}>
              {r.previousReading} → {r.currentReading} m³
            </Text>
            <Text style={styles.rowValue}>{r.unitsUsed} m³</Text>
          </View>
        ))
      )}

      {/* ── BILLS ──────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Bills ({bills.length})</Text>
      {bills.length === 0 ? (
        <Text style={styles.emptyText}>No bills generated yet.</Text>
      ) : (
        bills.map((b) => (
          <View key={b.id} style={styles.row}>
            <Text style={styles.rowDate}>{b.issueDate}</Text>
            <Text style={styles.rowDetail}>
              {b.totalUnits} m³ · KES {b.totalAmount.toFixed(2)}
            </Text>
            <Text style={[styles.badge, b.paid ? styles.paidBadge : styles.unpaidBadge]}>
              {b.paid ? "PAID" : "UNPAID"}
            </Text>
          </View>
        ))
      )}

      {/* ── PAYMENTS ───────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Payment History ({payments.length})</Text>
      {payments.length === 0 ? (
        <Text style={styles.emptyText}>No payments yet.</Text>
      ) : (
        payments.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowDate}>{p.date}</Text>
            <Text style={styles.rowDetail}>{p.method}</Text>
            <Text style={styles.rowValue}>KES {p.amountPaid.toFixed(2)}</Text>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  balanceCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  balanceLabel: { fontSize: 13, color: "#64748b" },
  balanceAmount: { fontSize: 32, fontWeight: "700", marginTop: 4 },
  balanceStatus: { fontSize: 12, color: "#94a3b8", marginTop: 4, letterSpacing: 1 },
  owing: { color: "#dc2626" },
  credit: { color: "#16a34a" },
  clear: { color: "#64748b" },
  errorText: { color: "#dc2626", textAlign: "center", marginBottom: 8 },
  actionsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  actionButton: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  actionButtonText: { color: "#2563eb", fontWeight: "600" },
  payButton: {
    margin: 16,
    backgroundColor: "#16a34a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  payButtonText: { color: "white", fontWeight: "700", fontSize: 16 },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: { color: "#b91c1c", fontWeight: "700", fontSize: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyText: { color: "#94a3b8", marginHorizontal: 16, fontSize: 13 },
  row: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowDate: { fontSize: 12, color: "#64748b", width: 80 },
  rowDetail: { fontSize: 13, color: "#1e293b", flex: 1 },
  rowValue: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  paidBadge: { backgroundColor: "#dcfce7", color: "#16a34a" },
  unpaidBadge: { backgroundColor: "#fee2e2", color: "#dc2626" },
});