import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getCustomers } from "../api/client";
import { Customer } from "../types";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Shadow, Typography } from "../theme";

export default function CustomerListScreen() {
  const navigation = useNavigation<any>();
  const { token, logout } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await getCustomers(token);
      setCustomers(data.customers);
      setFiltered(data.customers);
    } catch (e: any) {
      setError(e.message ?? "Failed to load customers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { loadCustomers(); }, [loadCustomers]));

  const onRefresh = () => { setRefreshing(true); loadCustomers(); };

  const handleSearch = (text: string) => {
    setSearch(text);
    setFiltered(
      text.trim()
        ? customers.filter(c => c.name.toLowerCase().includes(text.toLowerCase()))
        : customers
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[Typography.label, { marginTop: Spacing.sm }]}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── HEADER ────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Customers</Text>
          <Text style={styles.headerSub}>{customers.length} registered</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* ── SEARCH ───────────────────────────────── */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
          placeholder="Search by name..."
          placeholderTextColor={Colors.textMuted}
          clearButtonMode="while-editing"
        />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>No customers yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to register the first one</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("CustomerDetail", { customerId: item.id, customerName: item.name })}
          >
            {/* Avatar circle */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.meterNumber} · {item.phone}</Text>
            </View>

            <View style={styles.cardRight}>
              <Text style={[
                styles.cardBalance,
                item.balance > 0 ? styles.owing : item.balance < 0 ? styles.credit : styles.clear
              ]}>
                KES {item.balance.toFixed(0)}
              </Text>
              <Text style={styles.cardBalanceLabel}>
                {item.balance > 0 ? "OWING" : item.balance < 0 ? "CREDIT" : "CLEAR"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ── FAB ──────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("RegisterCustomer")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.sm },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: Colors.primaryDark,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: Radius.full },
  logoutText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  searchInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: 15, color: Colors.text,
    ...Shadow.sm,
  },

  errorBanner: { marginHorizontal: Spacing.md, backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.sm },
  errorText: { color: Colors.danger, fontSize: 13 },

  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center", alignItems: "center", marginRight: Spacing.sm,
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "600", color: Colors.text },
  cardMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardRight: { alignItems: "flex-end" },
  cardBalance: { fontSize: 15, fontWeight: "700" },
  cardBalanceLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 1, letterSpacing: 0.5 },
  owing: { color: Colors.danger },
  credit: { color: Colors.success },
  clear: { color: Colors.textMuted },

  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.textSecondary },
  emptySubtitle: { ...Typography.caption, marginTop: 4 },

  fab: {
    position: "absolute", right: Spacing.md, bottom: Spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center", alignItems: "center",
    ...Shadow.lg,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "300", marginTop: -2 },
});