# Water Meter Admin App

> React Native admin interface for the Smart Water Meter & Payment System.  
> Part of a three-repo full-stack portfolio project.

**Related repos:**
- [WaterMeterSystem](https://github.com/Nelson254-PNG/WaterMeterSystem) — C++ REST API backend
- [CustomerApp](https://github.com/Nelson254-PNG/CustomerApp) — Customer-facing mobile app

---

## What This Does

A mobile application for **water utility administrators** to manage customers, record meter readings, generate bills, and process payments.

### Screens

Screen            Purpose 
 Admin Login   -> Secure admin login with JWT token 
 Customer List  -> View all customers with balance status, inline search 
 Customer Detail  -> Usage history, bills, payments; action buttons 
 Register Customer -> Add a new customer; meter number auto-assigned 
 Record Usage   ->  Enter current meter reading; validates it can't go backwards 
 Generate Bill  ->  Create a bill from unbilled usage records 
 Make Payment   ->  M-Pesa Paybill, M-Pesa Till

## Tech Stack

Component     Technology 
 Framework    React Native + Expo SDK 56 
 Language     TypeScript 
 Navigation   React Navigation (native stack) 
 State        React Context + AsyncStorage (persistent login) 
 API          Fetch API with JWT Bearer tokens 

## Project Structure
WaterMeterApp/
├── App.tsx                    ← Root; auth-gated navigation
├── theme.ts                   ← Colors, spacing, typography, shadows
├── api/
│   └── client.ts              ← All API calls; one place for BASE_URL
├── context/
│   └── AuthContext.tsx        ← Login state shared across all screens
├── types/
│   └── index.ts               ← TypeScript interfaces matching API JSON
└── screens/
    ├── AdminLoginScreen.tsx
    ├── CustomerListScreen.tsx
    ├── CustomerDetailScreen.tsx
    ├── RegisterCustomerScreen.tsx
    ├── RecordUsageScreen.tsx
    ├── GenerateBillScreen.tsx
    └── MakePaymentScreen.tsx

## Setup

### 1. Install dependencies
In terminal run
npm install


### 2. Configure API URL
Edit `api/client.ts`:
typescript
const BASE_URL = "http://YOUR_IP:8090";
// or your ngrok URL for remote access:
// const BASE_URL = "https://xxxxx.ngrok-free.app";

### 3. Run
In terminal
that powershell
npx expo start --host lan
Scan the QR code with **Expo Go** on your Android/iOS device.

### 4. Build APK (standalone, no Expo Go needed)
in the bash terminal run
npx eas build -p android --profile preview
## Authentication Flow

1. Admin logs in via `POST /auth/admin-login`
2. Server returns a JWT with `role: "admin"` claim
3. Token stored in AsyncStorage — survives app restarts
4. Every API call includes `Authorization: Bearer <token>`
5. Server's `requireAdmin()` middleware validates on every admin-only route
6. Logout clears AsyncStorage and returns to the login screen

## Key Design Decisions

**`api/client.ts` as single source of truth** — every screen imports named functions (`getCustomers`, `generateBill`, etc.) rather than writing raw `fetch()` calls. Changing `BASE_URL` updates every screen automatically.

**AuthContext over prop drilling** — login state (token, userId, role) is shared via React Context so no screen needs to receive it as a navigation parameter.

**Token passed explicitly** — every API function takes `token` as its first argument rather than reading from a global, making data flow traceable and testable.

**useFocusEffect for fresh data** — screens re-fetch data whenever they come back into focus, so changes made on a child screen (e.g. recording usage) are immediately visible when navigating back.