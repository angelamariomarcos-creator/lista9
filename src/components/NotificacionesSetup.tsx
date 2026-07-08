"use client";

import { useEffect } from "react";
import { app, getMessaging, getToken } from "@/lib/firebase";
import { createClient } from "@/lib/supabase";

export default function NotificacionesSetup() {
  useEffect(() => {
    async function configurarNotificaciones() {
      try {
        if (!("Notification" in window)) return;
        if (!("serviceWorker" in navigator)) return;

        const permiso = await Notification.requestPermission();
        if (permiso !== "granted") return;

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        const messaging = getMessaging(app);

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!token) return;

        const supabase = createClient();

        const { data: existing } = await supabase
          .from("push_tokens")
          .select("id")
          .eq("token", token)
          .single();

        if (!existing) {
          await supabase.from("push_tokens").insert({
            token,
            family_id: "a3e746d1-2cac-4f07-a988-de3678c1fe00",
            user_agent: navigator.userAgent,
          });
        }
      } catch (error) {
        console.error("Error configurando notificaciones:", error);
      }
    }

    configurarNotificaciones();
  }, []);

  return null;
}