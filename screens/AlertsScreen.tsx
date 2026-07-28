// ============================================================
//  screens/AlertsScreen.tsx
//  Admin IoT alerts feed with valve control per customer.
//  Shows leak detection, tamper warnings, credit alerts.
// ============================================================

import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Shadow } from "../theme";
export const BASE_URL = "https://unsidereal-justine-ovational.ngrok-free.dev";

async function apiGet(path: string, token: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

async function apiPost(path: string, token: string, body: object = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

interface AlertItem {
  id: string;
  customerId: string;
  customerName: string;
  meterNumber: string;
  alertType: string;
  message: string;
  severity: string;
  createdAt: string;
}

export default function AlertsScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await apiGet("/iot/alerts", token);
      setAlerts(data.alerts);
    } catch (e: any) {
      setError(e.message ?? "Failed to load alerts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { loadAlerts(); }, [loadAlerts]));

  const handleResolve = async (alertId: string) => {
    setResolving(alertId);
    try {
      await apiPost(`/iot/alerts/${alertId}/resolve`, token!);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e: any) {
      Alert.alert("Failed", e.message);
    } finally {
      setResolving(null);
    }
  };

  const handleValveControl = (customerId: string, customerName: string, currentlyOpen: boolean) => {
    const action = currentlyOpen ? "close" : "open";
    Alert.alert(
      `${action === "close" ? "Close" : "Open"} Valve`,
      `${action === "close" ? "Shut off" : "Restore"} water supply for ${customerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "close" ? "Close Valve" : "Open Valve",
          style: action === "close" ? "destructive" : "default",
          onPress: async () => {
            setClosing(customerId);
            try {
              await apiPost(`/iot/valve/${customerId}`, token!, {
                open: !currentlyOpen,
                reason: `Admin action via dashboard`,
              });
              Alert.alert("Done", `Valve ${!currentlyOpen ? "opened" : "closed"} successfully.`);
              loadAlerts();
            } catch (e: any) {
              Alert.alert("Failed", e.message);
            } finally {
              setClosing(null);
            }
          },
        },
      ]
    );
  };

  const severityColor = (s: string) =>
    s === "critical" ? Colors.danger : s === "warning" ? "#d97706" : Colors.primary;

  const severityBg = (s: string) =>
    s === "critical" ? "#fef2f2" : s === "warning" ? "#fffbeb" : Colors.primaryLight;

  const alertIcon = (type: string) => {
    if (type.includes("leak")) return "💧";
    if (type.includes("tamper")) return "🚨";
    if (type.includes("credit")) return "💳";
    if (type.includes("valve")) return "🔧";
    return "⚠️";
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── HEADER ─────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={[styles.badge, alerts.length > 0 ? styles.badgeRed : styles.badgeGreen]}>
          <Text style={styles.badgeText}>
            {alerts.length > 0 ? `${alerts.length} active` : "All clear"}
          </Text>
        </View>
      </View>

      {error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}

      <FlatList
        data={alerts}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadAlerts(); }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No active alerts</Text>
            <Text style={styles.emptySub}>All meters operating normally</Text>
          </View>
        }
        renderItem={({ item: a }) => (
          <View style={[styles.card, { backgroundColor: severityBg(a.severity) }]}>
            {/* Alert header */}
            <View style={styles.cardHeader}>
              <Text style={styles.alertIcon}>{alertIcon(a.alertType)}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.customerName}>{a.customerName}</Text>
                <Text style={styles.meterNumber}>{a.meterNumber}</Text>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: severityColor(a.severity) }]}>
                <Text style={styles.severityText}>{a.severity.toUpperCase()}</Text>
              </View>
            </View>

            {/* Alert type and message */}
            <Text style={[styles.alertType, { color: severityColor(a.severity) }]}>
              {a.alertType.replace(/_/g, " ").toUpperCase()}
            </Text>
            <Text style={styles.alertMessage}>{a.message}</Text>
            <Text style={styles.alertTime}>{a.createdAt.slice(0, 16).replace("T", " ")}</Text>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.resolveBtn}
                onPress={() => handleResolve(a.id)}
                disabled={resolving === a.id}
                activeOpacity={0.8}
              >
                {resolving === a.id
                  ? <ActivityIndicator color={Colors.success} size="small" />
                  : <Text style={styles.resolveBtnText}>✔ Mark Resolved</Text>
                }
              </TouchableOpacity>

              {(a.alertType === "leak_detected" || a.alertType === "tamper_warning") && (
                <TouchableOpacity
                  style={styles.valveBtn}
                  onPress={() => handleValveControl(a.customerId, a.customerName, true)}
                  disabled={closing === a.customerId}
                  activeOpacity={0.8}
                >
                  {closing === a.customerId
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.valveBtnText}>🔒 Close Valve</Text>
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: Colors.primaryDark, paddingTop: 56,
    paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.full },
  badgeRed: { backgroundColor: Colors.danger },
  badgeGreen: { backgroundColor: Colors.success },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.sm, margin: Spacing.md },
  errorText: { color: Colors.danger, fontSize: 13 },
  list: { padding: Spacing.md, paddingBottom: 40 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textSecondary, marginTop: Spacing.md },
  emptySub: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  card: {
    borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, ...Shadow.sm,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  alertIcon: { fontSize: 28, marginRight: Spacing.sm },
  cardMeta: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: "700", color: Colors.text },
  meterNumber: { fontSize: 12, color: Colors.textSecondary },
  severityBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: Radius.full },
  severityText: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  alertType: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4 },
  alertMessage: { fontSize: 13, color: Colors.text, lineHeight: 18 },
  alertTime: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  actions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  resolveBtn: {
    flex: 1, paddingVertical: 8, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.success, alignItems: "center",
  },
  resolveBtnText: { color: Colors.success, fontWeight: "700", fontSize: 13 },
  valveBtn: {
    flex: 1, paddingVertical: 8, borderRadius: Radius.sm,
    backgroundColor: Colors.danger, alignItems: "center",
  },
  valveBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});