// ============================================================
//  screens/DashboardScreen.tsx
//  Admin dashboard — system-wide stats fetched from the API
// ============================================================

import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getCustomers } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Customer } from "../types";
import { Colors, Spacing, Radius, Shadow } from "../theme";

export default function DashboardScreen() {
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await getCustomers(token);
      setCustomers(data.customers);
    } catch (e: any) {
      setError(e.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  // Compute stats from customer list
  const totalCustomers = customers.length;
  const owing = customers.filter(c => c.balance > 0);
  const credit = customers.filter(c => c.balance < 0);
  const clear = customers.filter(c => c.balance === 0);
  const totalOutstanding = owing.reduce((s, c) => s + c.balance, 0);
  const totalCredit = credit.reduce((s, c) => s + Math.abs(c.balance), 0);
  const collectionRate = totalOutstanding + totalCredit > 0
    ? ((totalCredit / (totalOutstanding + totalCredit)) * 100).toFixed(1)
    : "100.0";

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.primary} />}
    >
      {/* ── HEADER ─────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSub}>System overview</Text>
      </View>

      {error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}

      {/* ── CUSTOMER STATS ──────────────────────── */}
      <Text style={styles.sectionTitle}>CUSTOMERS</Text>
      <View style={styles.statsGrid}>
        <StatCard value={totalCustomers} label="Total" color={Colors.primary} emoji="👥" />
        <StatCard value={owing.length} label="Owing" color={Colors.danger} emoji="⚠" />
        <StatCard value={clear.length} label="Clear" color={Colors.success} emoji="✅" />
        <StatCard value={credit.length} label="Credit" color={Colors.warning} emoji="⭐" />
      </View>

      {/* ── FINANCIAL SUMMARY ───────────────────── */}
      <Text style={styles.sectionTitle}>FINANCIALS</Text>
      <View style={styles.financeCard}>
        <FinanceRow label="Total Outstanding" value={`KES ${totalOutstanding.toFixed(2)}`} color={Colors.danger} />
        <FinanceRow label="Total Credit" value={`KES ${totalCredit.toFixed(2)}`} color={Colors.success} />
        <View style={styles.divider} />
        <FinanceRow label="Collection Rate" value={`${collectionRate}%`} color={Colors.primary} large />
      </View>

      {/* ── TOP OWING CUSTOMERS ─────────────────── */}
      {owing.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>TOP OUTSTANDING</Text>
          {owing
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 5)
            .map(c => (
              <View key={c.id} style={styles.customerRow}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>{c.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{c.name}</Text>
                  <Text style={styles.customerMeter}>{c.meterNumber}</Text>
                </View>
                <Text style={styles.customerBalance}>KES {c.balance.toFixed(2)}</Text>
              </View>
            ))
          }
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatCard({ value, label, color, emoji }: { value: number; label: string; color: string; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FinanceRow({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <View style={styles.financeRow}>
      <Text style={styles.financeLabel}>{label}</Text>
      <Text style={[styles.financeValue, { color }, large && { fontSize: 20 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: Colors.primaryDark, paddingTop: 56,
    paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.sm, margin: Spacing.md },
  errorText: { color: Colors.danger, fontSize: 13 },
  sectionTitle: {
    fontSize: 11, fontWeight: "700", color: Colors.textMuted,
    marginHorizontal: Spacing.md, marginTop: Spacing.lg,
    marginBottom: Spacing.sm, letterSpacing: 0.8,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: Spacing.md, gap: Spacing.sm },
  statCard: {
    width: "47%", backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: "center", ...Shadow.sm,
  },
  statEmoji: { fontSize: 28, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: "700" },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  financeCard: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.md,
    borderRadius: Radius.md, padding: Spacing.md, ...Shadow.sm,
  },
  financeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  financeLabel: { fontSize: 14, color: Colors.textSecondary },
  financeValue: { fontSize: 16, fontWeight: "700" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  customerRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, marginHorizontal: Spacing.md,
    marginBottom: 6, padding: Spacing.sm, borderRadius: Radius.md,
    ...Shadow.sm,
  },
  customerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.dangerLight,
    justifyContent: "center", alignItems: "center", marginRight: Spacing.sm,
  },
  customerAvatarText: { fontSize: 16, fontWeight: "700", color: Colors.danger },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  customerMeter: { fontSize: 11, color: Colors.textMuted },
  customerBalance: { fontSize: 14, fontWeight: "700", color: Colors.danger },
});