// ============================================================
//  types/index.ts
//  TypeScript types matching the JSON your C++ API returns.
// ============================================================

export interface Customer {
  id: string;
  name: string;
  meterNumber: string;
  phone: string;
  lastReading: number;
  balance: number;
}

export interface UsageRecord {
  date: string;
  previousReading: number;
  currentReading: number;
  unitsUsed: number;
  billed: boolean;
}

export interface TierBreakdown {
  tier1Units: number; tier1Cost: number;
  tier2Units: number; tier2Cost: number;
  tier3Units: number; tier3Cost: number;
  tier4Units: number; tier4Cost: number;
  serviceCharge: number;
  totalAmount: number;
}

export interface Bill {
  id: string;
  issueDate: string;
  dueDate: string;
  totalUnits: number;
  totalAmount: number;
  amountPaid: number;
  paid: boolean;
}

export interface Payment {
  date: string;
  method: string;
  reference: string;
  amountPaid: number;
  balanceAfter: number;
}