import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";

// Define what data your user document contains
type UserData = {
  ecoPoints: number;
  name?: string;
  email?: string;
  avatarUrl?: string;
};

// Context type
type UserContextType = UserData | null;

const UserContext = createContext<UserContextType>(null);

// Provider that wraps your whole app
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserContextType>(null);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    // Watch auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Logged in UID:", user.uid);
        const ref = doc(db, "users", user.uid);

        // Watch user Firestore document
        unsubscribeDoc = onSnapshot(
          ref,
          (snap) => {
            if (snap.exists()) {
              console.log("📡 User doc data:", snap.data());
              setUserData(snap.data() as UserData);
            } else {
              console.warn("⚠️ No user doc found for UID:", user.uid);
              setUserData(null);
            }
          },
          (error) => {
            console.error("🔥 Firestore error:", error);
            setUserData(null);
          }
        );
      } else {
        console.log("❌ User logged out");
        setUserData(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
};

// Hook to use anywhere
export const useUser = () => useContext(UserContext);
