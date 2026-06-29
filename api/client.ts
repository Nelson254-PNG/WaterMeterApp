const BASE_URL = "https://unsidereal-justine-ovational.ngrok-free.dev";                        
//  HELPER: apiRequest
//
//  UPDATED: now accepts an optional `token` — when provided,
//  it's attached as "Authorization: Bearer <token>", which
//  is exactly the header format auth.h's requireAuth() on the
//  C++ side expects to find.
// ============================================================
async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: object; token?: string | null } = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }
 
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
 
  const data = await response.json();
 
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }
 
  return data as T;
}
 
import { Customer, UsageRecord, Bill, Payment } from "../types";
 
// ── AUTH ─────────────────────────────────────────────────────
export function adminLogin(username: string, password: string) {
  return apiRequest<{ token: string; role: string; userId: string }>("/auth/admin-login", {
    method: "POST",
    body: { username, password },
  });
}
 
// ── EVERY OTHER FUNCTION NOW TAKES `token` AS ITS FIRST ARG ───
// This is a deliberate, consistent convention: every screen
// that calls these passes the token it got from useAuth().
 
export function getCustomers(token: string) {
  return apiRequest<{ customers: Customer[] }>("/customers", { token });
}
 
export function registerCustomer(token: string, name: string, phone: string, openingReading: number) {
  return apiRequest<{ id: string; meterNumber: string }>("/customers", {
    method: "POST",
    body: { name, phone, openingReading },
    token,
  });
}
 
export function deleteCustomer(token: string, customerId: string) {
  return apiRequest<{ status: string }>(`/customers/${customerId}`, {
    method: "DELETE",
    token,
  });
}
 
export function searchCustomers(token: string, name: string) {
  return apiRequest<{ results: Customer[] }>(
    `/customers/search?name=${encodeURIComponent(name)}`,
    { token }
  );
}
 
export function getUsageHistory(token: string, customerId: string) {
  return apiRequest<{ customerName: string; records: UsageRecord[] }>(
    `/customers/${customerId}/usage`,
    { token }
  );
}
 
export function recordUsage(token: string, customerId: string, currentReading: number, date: string) {
  return apiRequest<{ unitsUsed: number }>(`/customers/${customerId}/usage`, {
    method: "POST",
    body: { currentReading, date },
    token,
  });
}
 
export function getBills(token: string, customerId: string) {
  return apiRequest<{ customerName: string; balance: number; bills: Bill[] }>(
    `/customers/${customerId}/bills`,
    { token }
  );
}
 
export function generateBill(token: string, customerId: string, issueDate: string, dueDate: string) {
  return apiRequest<{ billId: string; totalUnits: number }>(
    `/customers/${customerId}/bills`,
    { method: "POST", body: { issueDate, dueDate }, token }
  );
}
 
export function getPayments(token: string, customerId: string) {
  return apiRequest<{ customerName: string; balance: number; payments: Payment[] }>(
    `/customers/${customerId}/payments`,
    { token }
  );
}
 
export function makePayment(
  token: string,
  customerId: string,
  billId: string,
  method: string,
  reference: string,
  amount: number,
  date: string
) {
  return apiRequest<{ status: string }>(`/customers/${customerId}/payments`, {
    method: "POST",
    body: { billId, method, reference, amount, date },
    token,
  });
}
 
export function payByMpesa(
  token: string,
  customerId: string,
  billId: string,
  code: string,
  amount: number,
  date: string
) {
  return apiRequest<{ status: string }>(`/customers/${customerId}/payments/mpesa`, {
    method: "POST",
    body: { billId, code, amount, date },
    token,
  });
}
 
export function payByTill(
  token: string,
  customerId: string,
  billId: string,
  code: string,
  amount: number,
  date: string
) {
  return apiRequest<{ status: string }>(`/customers/${customerId}/payments/mpesa-till`, {
    method: "POST",
    body: { billId, code, amount, date },
    token,
  });
}