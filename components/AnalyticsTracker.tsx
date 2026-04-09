"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { onLCP, onCLS, onINP, onTTFB, Metric } from "web-vitals";

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
}

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionIdRef = useRef<string>("");
  const deviceIdRef = useRef<string>("");
  const vitalsSent = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    // Initialize session ID (temporary per tab session)
    let sid = sessionStorage.getItem("analytics_sid");
    if (!sid) {
      sid = generateSessionId();
      sessionStorage.setItem("analytics_sid", sid);
    }
    sessionIdRef.current = sid;

    // Initialize Device ID (persistent across tab sessions)
    let did = localStorage.getItem("analytics_did");
    if (!did) {
      did = "dev_" + Math.random().toString(36).substring(2, 16) + "_" + Date.now();
      localStorage.setItem("analytics_did", did);
    }
    deviceIdRef.current = did;

    // Ignore tracking for admin/manager routes to prevent analytics pollution
    if (pathname.startsWith("/admin") || pathname.startsWith("/manager") || pathname.startsWith("/api")) {
      return;
    }

    // Capture UTM parameters if present
    const utmSource = searchParams?.get("utm_source") || undefined;
    const utmMedium = searchParams?.get("utm_medium") || undefined;
    const utmCampaign = searchParams?.get("utm_campaign") || undefined;

    const payload = {
      sessionId: sessionIdRef.current,
      deviceId: deviceIdRef.current,
      path: pathname,
      userAgent: window.navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || undefined,
      utmSource,
      utmMedium,
      utmCampaign,
      action: "page_view"
    };

    // Send page view event
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(console.error);

    // Track Web Vitals (only once per session normally, but we can update the first page view)
    if (!vitalsSent.current) {
      vitalsSent.current = true;
      const sendVitals = (metric: Metric) => {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            path: pathname,
            action: "web_vital",
            metric: metric.name,
            value: metric.value
          }),
        }).catch(console.error);
      };

      onLCP(sendVitals);
      onCLS(sendVitals);
      onINP(sendVitals);
      onTTFB(sendVitals);
    }

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
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}
