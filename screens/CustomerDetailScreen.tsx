import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { getUsageHistory, getBills, getPayments, deleteCustomer } from "../api/client";
import { UsageRecord, Bill, Payment } from "../types";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Shadow, Typography } from "../theme";

export default function CustomerDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId, customerName } = route.params;
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const [usageData, billsData, paymentsData] = await Promise.all([
        getUsageHistory(token, customerId),
        getBills(token, customerId),
        getPayments(token, customerId),
      ]);
      setUsage(usageData.records);
      setBills(billsData.bills);
      setBalance(billsData.balance);
      setPayments(paymentsData.payments);
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId, token]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleDelete = () => {
    Alert.alert(
      "Delete Customer?",
      `Permanently delete ${customerName} and ALL their data?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteCustomer(token!, customerId);
            navigation.navigate("CustomerList");
          } catch (e: any) {
            Alert.alert("Failed", e.message);
          }
        }},
      ]
    );
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  const unpaidTotal = bills.filter(b => !b.paid).reduce((s, b) => s + (b.totalAmount - b.amountPaid), 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.primary} />}
    >
      {/* ── BALANCE HERO ───────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.heroAvatar}>
          <Text style={styles.heroAvatarText}>{customerName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.heroName}>{customerName}</Text>
        <Text style={[
          styles.heroBalance,
          balance > 0 ? styles.owing : balance < 0 ? styles.credit : styles.clear
        ]}>
          KES {balance.toFixed(2)}
        </Text>
        <Text style={styles.heroLabel}>
          {balance > 0 ? "OUTSTANDING BALANCE" : balance < 0 ? "CREDIT" : "ACCOUNT CLEAR"}
        </Text>
      </View>

      {error && <Text style={styles.errorText}>⚠ {error}</Text>}

      {/* ── ACTION BUTTONS ─────────────────────────── */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("RecordUsage", { customerId })}>
          <Text style={styles.actionIcon}>💧</Text>
          <Text style={styles.actionLabel}>Record Usage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("GenerateBill", { customerId })}>
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionLabel}>Generate Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGreen]} onPress={() => navigation.navigate("MakePayment", { customerId, bills })}>
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={[styles.actionLabel, { color: Colors.success }]}>Pay</Text>
        </TouchableOpacity>
      </View>

      {/* ── USAGE ──────────────────────────────────── */}
      <SectionHeader title="Usage History" count={usage.length} />
      {usage.length === 0
        ? <EmptyState message="No usage recorded yet" />
        : usage.map((r, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowDate}>{r.date}</Text>
            <Text style={styles.rowMain}>{r.previousReading} → {r.currentReading} m³</Text>
            <Text style={[styles.rowValue, { color: Colors.primary }]}>{r.unitsUsed} m³</Text>
          </View>
        ))
      }

      {/* ── BILLS ──────────────────────────────────── */}
      <SectionHeader title="Bills" count={bills.length} />
      {bills.length === 0
        ? <EmptyState message="No bills generated yet" />
        : bills.map((b) => (
          <View key={b.id} style={styles.row}>
            <Text style={styles.rowDate}>{b.issueDate}</Text>
            <Text style={styles.rowMain}>KES {b.totalAmount.toFixed(2)}</Text>
            <View style={[styles.badge, b.paid ? styles.paidBadge : styles.unpaidBadge]}>
              <Text style={[styles.badgeText, b.paid ? styles.paidText : styles.unpaidText]}>
                {b.paid ? "PAID" : "UNPAID"}
              </Text>
            </View>
          </View>
        ))
      }

      {/* ── PAYMENTS ───────────────────────────────── */}
      <SectionHeader title="Payments" count={payments.length} />
      {payments.length === 0
        ? <EmptyState message="No payments yet" />
        : payments.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowDate}>{p.date}</Text>
            <Text style={styles.rowMain}>{p.method}</Text>
            <Text style={[styles.rowValue, { color: Colors.success }]}>KES {p.amountPaid.toFixed(2)}</Text>
          </View>
        ))
      }

      {/* ── DELETE ─────────────────────────────────── */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>Delete Customer</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return <Text style={styles.emptyText}>{message}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  hero: {
    backgroundColor: Colors.primaryDark, alignItems: "center",
    paddingTop: 32, paddingBottom: 28, paddingHorizontal: Spacing.lg,
  },
  heroAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center", marginBottom: Spacing.sm,
  },
  heroAvatarText: { fontSize: 30, fontWeight: "700", color: "#fff" },
  heroName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  heroBalance: { fontSize: 34, fontWeight: "700", marginTop: Spacing.sm },
  heroLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, letterSpacing: 1 },
  owing: { color: "#fca5a5" },
  credit: { color: "#86efac" },
  clear: { color: "rgba(255,255,255,0.7)" },

  errorText: { color: Colors.danger, textAlign: "center", margin: Spacing.md },

  actions: { flexDirection: "row", margin: Spacing.md, gap: Spacing.sm },
  actionBtn: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: "center",
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  actionBtnGreen: { borderColor: Colors.success },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 12, fontWeight: "600", color: Colors.text },

  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.text },
  sectionCount: {
    fontSize: 12, color: Colors.primary, fontWeight: "700",
    backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full,
  },
  emptyText: { color: Colors.textMuted, marginHorizontal: Spacing.md, fontSize: 13, marginBottom: Spacing.sm },

  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, marginHorizontal: Spacing.md,
    marginBottom: 6, padding: Spacing.md, borderRadius: Radius.md, ...Shadow.sm,
  },
  rowDate: { fontSize: 12, color: Colors.textMuted, width: 80 },
  rowMain: { flex: 1, fontSize: 13, color: Colors.text },
  rowValue: { fontSize: 13, fontWeight: "700" },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  paidBadge: { backgroundColor: Colors.successLight },
  unpaidBadge: { backgroundColor: Colors.dangerLight },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  paidText: { color: Colors.success },
  unpaidText: { color: Colors.danger },

  deleteBtn: { marginHorizontal: Spacing.md, marginTop: Spacing.xl, alignItems: "center" },
  deleteBtnText: { color: Colors.danger, fontSize: 14, fontWeight: "600" },
});