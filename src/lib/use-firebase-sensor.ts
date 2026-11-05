"use client";

import { useEffect, useState } from "react";
import {
  ref,
  onValue,
  Unsubscribe,
} from "firebase/database";
import {
  getFirebaseDatabase,
  FirebaseSensorData,
  FirebaseHistoryEntry,
} from "./firebase";

/**
 * React hook to listen to real-time sensor updates from Firebase RTDB
 */
export function useFirebaseRealtimeSensor(deviceId: string = "esp32_01") {
  const [data, setData] = useState<FirebaseSensorData | null>(null);
  const [history, setHistory] = useState<FirebaseHistoryEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubLatest: Unsubscribe | null = null;
    let unsubConn: Unsubscribe | null = null;
    let unsubHistory: Unsubscribe | null = null;

    try {
      const db = getFirebaseDatabase();

      // 1. Connection status listener
      const connRef = ref(db, ".info/connected");
      unsubConn = onValue(
        connRef,
        (snap) => {
          setIsConnected(Boolean(snap.val()));
        },
        (err) => {
          console.warn("Firebase connection status error:", err);
        }
      );

      // 2. Realtime listener for latest sensor data
      const latestRef = ref(db, `devices/${deviceId}/latest`);
      unsubLatest = onValue(
        latestRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val() as FirebaseSensorData;
            setData(val);
            setLastUpdated(new Date());
            setError(null);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Firebase latest error:", err);
          setError(err.message);
          setLoading(false);
        }
      );

      // 3. Listener for history (recent data)
      const historyRef = ref(db, `devices/${deviceId}/history`);
      unsubHistory = onValue(
        historyRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const rawObj = snapshot.val() as Record<string, FirebaseSensorData>;
            const entries: FirebaseHistoryEntry[] = Object.entries(rawObj).map(
              ([id, values]) => ({
                id,
                ...values,
              })
            );
            // sort by timestamp if available or keep insertion order
            entries.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
            setHistory(entries);
          } else {
            setHistory([]);
          }
        },
        (err) => {
          console.warn("Firebase history error:", err);
        }
      );
    } catch (err: any) {
      console.error("Firebase initialization failed:", err);
      setError(err?.message || "Failed to initialize Firebase Realtime Database");
      setLoading(false);
    }

    return () => {
      if (unsubLatest) unsubLatest();
      if (unsubConn) unsubConn();
      if (unsubHistory) unsubHistory();
    };
  }, [deviceId]);

  return {
    data,
    history,
    isConnected,
    lastUpdated,
    loading,
    error,
  };
}

