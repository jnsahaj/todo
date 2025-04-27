"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );

          // Request notification permission
          if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                console.log("Notification permission granted.");
              } else {
                console.log("Notification permission denied.");
              }
            });
          } else {
            console.log("Browser does not support notifications.");
          }
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    } else {
      console.log("Browser does not support service workers.");
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return null; // This component doesn't render anything
}
