import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get,
  Database,
} from "firebase/database";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCoALKkHKHaothwYyhGVOTSvPWM7oquAxQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cultivation-raspberry.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://cultivation-raspberry-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cultivation-raspberry",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cultivation-raspberry.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "11217687045",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:11217687045:web:17e156563997904159426c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0R1P68KNZS",
};

// Singleton Firebase App
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

// Singleton Firebase Realtime Database
export function getFirebaseDatabase(): Database {
  const app = getFirebaseApp();
  return getDatabase(app);
}

export interface FirebaseSensorData {
  moisture: number;
  moistureRaw?: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  phVoltage?: number;
  npkValid?: boolean;
  timestamp?: number;
}

export interface FirebaseHistoryEntry extends FirebaseSensorData {
  id: string;
}

/**
 * Fetch the latest reading once (works both client & server)
 */
export async function fetchFirebaseLatest(
  deviceId: string = "esp32_01"
): Promise<FirebaseSensorData | null> {
  try {
    const db = getFirebaseDatabase();
    const snapshot = await get(ref(db, `devices/${deviceId}/latest`));
    if (snapshot.exists()) {
      return snapshot.val() as FirebaseSensorData;
    }
    return null;
  } catch (error) {
    console.error("fetchFirebaseLatest error:", error);
    // REST fallback in case WebSockets are blocked
    try {
      const url = `${firebaseConfig.databaseURL}/devices/${deviceId}/latest.json`;
      const res = await fetch(url);
      if (res.ok) {
        return (await res.json()) as FirebaseSensorData;
      }
    } catch (e) {
      console.error("REST fallback error:", e);
    }
    return null;
  }
}
