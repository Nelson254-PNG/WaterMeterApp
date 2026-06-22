const BASE_URL = "http://192.168.137.1:8081";
//API REQUEST
async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: object } = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
 
  const data = await response.json();
 
  if (!response.ok) {
    // data.error is the field name your Crow handlers use
    // for error messages — e.g. { "error": "Customer not found" }
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }
 
  return data as T;
}
 // screens call these exported functions
 import { Customer, UsageRecord, Bill, Payment } from "../types";
 
export function getCustomers() {
  return apiRequest<{ customers: Customer[] }>("/customers");
}
 
export function registerCustomer(name: string, phone: string, openingReading: number) {
  return apiRequest<{ id: string; meterNumber: string }>("/customers", {
    method: "POST",
    body: { name, phone, openingReading },
  });
}
 
export function searchCustomers(name: string) {
  return apiRequest<{ results: Customer[] }>(
    `/customers/search?name=${encodeURIComponent(name)}`
  );
}
 
export function getUsageHistory(customerId: string) {
  return apiRequest<{ customerName: string; records: UsageRecord[] }>(
    `/customers/${customerId}/usage`
  );
}
 
export function recordUsage(customerId: string, currentReading: number, date: string) {
  return apiRequest<{ unitsUsed: number }>(`/customers/${customerId}/usage`, {
    method: "POST",
    body: { currentReading, date },
  });
}
 
export function getBills(customerId: string) {
  return apiRequest<{ customerName: string; balance: number; bills: Bill[] }>(
    `/customers/${customerId}/bills`
  );
}
 
export function generateBill(customerId: string, issueDate: string, dueDate: string) {
  return apiRequest<{ billId: string; totalUnits: number }>(
    `/customers/${customerId}/bills`,
    { method: "POST", body: { issueDate, dueDate } }
  );
}
 
export function getPayments(customerId: string) {
  return apiRequest<{ customerName: string; balance: number; payments: Payment[] }>(
    `/customers/${customerId}/payments`
  );
}
 
export function makePayment(
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
  });
}
 
export function payByMpesa(
  customerId: string,
  billId: string,
  code: string,
  amount: number,
  date: string
) {
  return apiRequest<{ status: string }>(`/customers/${customerId}/payments/mpesa`, {
    method: "POST",
    body: { billId, code, amount, date },
  });
}