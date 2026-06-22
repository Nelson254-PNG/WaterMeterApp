// ============================================================
//  screens/CustomerListScreen.tsx
//  Fetches all customers from the API and displays them in a
//  scrollable list. Tapping a customer navigates to their
//  detail screen (built in the next step).
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getCustomers } from "../api/client";
import { Customer } from "../types/index";

export default function CustomerListScreen() {
  const navigation = useNavigation<any>();

  // ── STATE ───────────────────────────────────────────────────
  // React's useState is the JS equivalent of a variable that,
  // when changed, automatically re-renders the screen.
  // Think of it like a C++ member variable that triggers a
  // redraw whenever it's reassigned.
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── DATA FETCHING ───────────────────────────────────────────
  // This function calls your API client, which calls your
  // Crow /customers GET route, which queries Postgres —
  // the exact same chain you proved working with curl earlier.
  const loadCustomers = useCallback(async () => {
    try {
      setError(null);
      const data = await getCustomers();
      setCustomers(data.customers);
    } catch (e: any) {
      setError(e.message ?? "Failed to load customers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── REFRESH ON SCREEN FOCUS ──────────────────────────────────
  // useFocusEffect re-runs every time this screen becomes
  // visible again (e.g. coming back from Register screen) —
  // so the list is always up to date without manual refresh.
  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  // ── PULL-TO-REFRESH ──────────────────────────────────────────
  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  // ── LOADING STATE ────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  // ── ERROR STATE ──────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠ {error}</Text>
        <Text style={styles.errorHint}>
          Check that your API server is running and BASE_URL in api/client.ts
          matches your laptop's current IP address.
        </Text>
      </View>
    );
  }

  // ── MAIN LIST ────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No customers yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("CustomerDetail", { customerId: item.id, customerName: item.name })
            }
          >
            <View style={styles.cardRow}>
              <Text style={styles.name}>{item.name}</Text>
              <Text
                style={[
                  styles.balance,
                  item.balance > 0 ? styles.owing : item.balance < 0 ? styles.credit : styles.clear,
                ]}
              >
                KES {item.balance.toFixed(2)}
              </Text>
            </View>
            <Text style={styles.meta}>
              {item.meterNumber} · {item.phone}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Floating button to register a new customer */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("RegisterCustomer")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── STYLES ─────────────────────────────────────────────────────
// React Native's StyleSheet is conceptually like CSS, but
// written as a JS object — no cascading, each component
// references styles explicitly by name.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 12, color: "#64748b" },
  errorText: { color: "#dc2626", fontSize: 16, fontWeight: "600", textAlign: "center" },
  errorHint: { color: "#64748b", fontSize: 13, marginTop: 8, textAlign: "center" },
  emptyText: { color: "#64748b", fontSize: 15 },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  meta: { fontSize: 13, color: "#64748b", marginTop: 4 },
  balance: { fontSize: 15, fontWeight: "700" },
  owing: { color: "#dc2626" },
  credit: { color: "#16a34a" },
  clear: { color: "#64748b" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: { color: "white", fontSize: 28, fontWeight: "300", marginTop: -2 },
});