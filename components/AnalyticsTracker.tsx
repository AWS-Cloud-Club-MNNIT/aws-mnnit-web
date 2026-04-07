"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    // Initialize session ID if not exists
    let sid = sessionStorage.getItem("analytics_sid");
    if (!sid) {
      sid = generateSessionId();
      sessionStorage.setItem("analytics_sid", sid);
    }
    sessionIdRef.current = sid;

    // Ignore tracking for admin/manager routes to prevent analytics pollution
    if (pathname.startsWith("/admin") || pathname.startsWith("/manager") || pathname.startsWith("/api")) {
      return;
    }

    const payload = {
      sessionId: sessionIdRef.current,
      path: pathname,
      userAgent: window.navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      action: "page_view"
    };

    // Send page view event
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(console.error);

    // Set up a heartbeat to track duration every 15 seconds
    const interval = setInterval(() => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          path: pathname,
          action: "heartbeat"
        }),
      }).catch(console.error);
    }, 15000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
