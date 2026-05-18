import { useEffect } from "react";
import { API } from "../api/api";

// VAPID public key from your .env (add VITE_VAPID_PUBLIC_KEY to Vercel)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Convert VAPID key to Uint8Array (required by browser API)
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  useEffect(() => {
    // Only run if browser supports push
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push not supported in this browser");
      return;
    }

    const registerAndSubscribe = async () => {
      try {
        // 1️⃣ Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("✅ Service Worker registered");

        // 2️⃣ Check existing subscription
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) return; // already subscribed

        // 3️⃣ Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Push permission denied");
          return;
        }

        // 4️⃣ Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // 5️⃣ Send subscription to backend
        await API.post("/push/subscribe", { subscription });
        console.log("✅ Push subscription saved");

      } catch (error) {
        console.error("Push setup error:", error);
      }
    };

    // Small delay so token is ready
    setTimeout(registerAndSubscribe, 2000);
  }, []);
}
