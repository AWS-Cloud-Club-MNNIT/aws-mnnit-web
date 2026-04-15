"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { onLCP, onCLS, onINP, onTTFB, Metric } from "web-vitals";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`;
}

function getOrCreate(storage: Storage, key: string, factory: () => string): string {
  let val = storage.getItem(key);
  if (!val) {
    val = factory();
    storage.setItem(key, val);
  }
  return val;
}

// Use sendBeacon when available (guaranteed delivery on page exit), fall back to fetch
function sendEvent(payload: Record<string, unknown>, useBeacon = false) {
  const url = "/api/analytics/track";
  const body = JSON.stringify(payload);
  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    // sendBeacon requires Blob with content-type for JSON
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true, // keep alive even if page is unloading
    }).catch(() => {/* silent — analytics should never break the app */});
  }
}

// ─── Inner Tracker (needs useSearchParams so must be wrapped in Suspense) ─────
function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Persistent refs — survive re-renders & pathname changes
  const sessionIdRef = useRef<string>("");
  const deviceIdRef  = useRef<string>("");
  const vitalsSentRef = useRef<boolean>(false);

  // Track focus/blur for engaged time accumulation
  const focusStartRef  = useRef<number>(0);
  const engagedTimeRef = useRef<number>(0); // seconds accumulated

  // Track current page for exit-page flush
  const currentPathRef = useRef<string>("");

  // Track which scroll milestones have fired for the current page
  const scrollMilestonesRef = useRef<Set<number>>(new Set());

  // ── One-time initialisation (IDs, vitals, global click listener) ────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Session ID: per browser tab (sessionStorage)
    sessionIdRef.current = getOrCreate(sessionStorage, "analytics_sid", () =>
      generateId("sess")
    );

    // Device ID: persistent across sessions (localStorage)
    deviceIdRef.current = getOrCreate(localStorage, "analytics_did", () =>
      generateId("dev")
    );

    // Web vitals — register once per page load
    if (!vitalsSentRef.current) {
      vitalsSentRef.current = true;
      const sendVital = (metric: Metric) => {
        if (!sessionIdRef.current) return;
        sendEvent({
          sessionId: sessionIdRef.current,
          path: window.location.pathname,
          action: "web_vital",
          metric: metric.name,
          value: metric.value,
        });
      };
      onLCP(sendVital);
      onCLS(sendVital);
      onINP(sendVital);
      onTTFB(sendVital);
    }

    // Click tracking — delegated listener on document
    const handleClick = (e: MouseEvent) => {
      if (!sessionIdRef.current) return;
      const target = e.target as HTMLElement;
      if (!target) return;
      // Skip admin / tracking UI clicks
      if (currentPathRef.current.startsWith("/admin") || currentPathRef.current.startsWith("/manager")) return;
      sendEvent({
        sessionId: sessionIdRef.current,
        path: currentPathRef.current,
        action: "click",
        elementId:    target.id || undefined,
        elementClass: target.className?.toString?.()?.substring(0, 80) || undefined,
        elementTag:   target.tagName?.toLowerCase() || undefined,
        elementText:  target.innerText?.substring(0, 60)?.trim() || undefined,
      });
    };

    document.addEventListener("click", handleClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []); // Run once on mount

  // ── Per-route effect: page views, heartbeat, scroll, focus/blur ─────────────
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    // Skip admin / manager / api routes (avoid polluting analytics)
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/manager") ||
      pathname.startsWith("/api")
    ) return;

    const sid = sessionIdRef.current;
    const did = deviceIdRef.current;
    if (!sid) return;

    // Reset per-page state
    scrollMilestonesRef.current = new Set();
    engagedTimeRef.current = 0;
    focusStartRef.current = document.hasFocus() ? Date.now() : 0;
    currentPathRef.current = pathname;

    // Capture UTM params from the URL
    const utmSource   = searchParams?.get("utm_source")   || undefined;
    const utmMedium   = searchParams?.get("utm_medium")   || undefined;
    const utmCampaign = searchParams?.get("utm_campaign") || undefined;
    const utmTerm     = searchParams?.get("utm_term")     || undefined;
    const utmContent  = searchParams?.get("utm_content")  || undefined;

    // Send page_view — referrer is only meaningful on the very first load
    sendEvent({
      sessionId: sid,
      deviceId:  did,
      path:      pathname,
      action:    "page_view",
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      // document.referrer is only reliable on the first page; SPA navigations keep it stale.
      // We only pass it when it doesn't match our own origin (i.e. it's an external referrer).
      referrer: document.referrer && !document.referrer.includes(window.location.origin)
        ? document.referrer
        : undefined,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    });

    // ── Focus / blur tracking (engaged time) ─────────────────────────────────
    const onFocus = () => { focusStartRef.current = Date.now(); };
    const onBlur  = () => {
      if (focusStartRef.current > 0) {
        engagedTimeRef.current += Math.round((Date.now() - focusStartRef.current) / 1000);
        focusStartRef.current = 0;
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur",  onBlur);

    // ── Heartbeat every 10 s ──────────────────────────────────────────────────
    const heartbeat = setInterval(() => {
      // Accumulate current focus window
      let engagedNow = engagedTimeRef.current;
      if (focusStartRef.current > 0) {
        engagedNow += Math.round((Date.now() - focusStartRef.current) / 1000);
      }
      sendEvent({
        sessionId: sid,
        path: pathname,
        action: "heartbeat",
        engagedSeconds: engagedNow,
      });
    }, 10_000);

    // ── Scroll depth tracking ─────────────────────────────────────────────────
    const handleScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop + window.innerHeight;
      const total = el.scrollHeight;
      if (total <= window.innerHeight) return; // page shorter than viewport
      const pct = Math.round((scrolled / total) * 100);

      for (const milestone of [25, 50, 75, 100]) {
        if (pct >= milestone && !scrollMilestonesRef.current.has(milestone)) {
          scrollMilestonesRef.current.add(milestone);
          sendEvent({
            sessionId: sid,
            path: pathname,
            action: "scroll_depth",
            depth: milestone,
          });
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // ── Visibility / exit flush ───────────────────────────────────────────────
    const flushExit = () => {
      if (!sid) return;
      // Final engaged time snapshot
      let timeOnPage = engagedTimeRef.current;
      if (focusStartRef.current > 0) {
        timeOnPage += Math.round((Date.now() - focusStartRef.current) / 1000);
        focusStartRef.current = 0;
      }
      sendEvent({
        sessionId: sid,
        path: pathname,
        action: "exit_page",
        timeOnPage,
      }, true /* useBeacon */);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        onBlur(); // snapshot blur time
        flushExit();
      } else if (document.visibilityState === "visible") {
        onFocus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // ── Cleanup on route change ───────────────────────────────────────────────
    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("focus",  onFocus);
      window.removeEventListener("blur",   onBlur);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Flush exit for SPA navigation (route change = leaving this page)
      flushExit();
    };
  }, [pathname, searchParams]);

  return null;
}

// ─── Public component (Suspense boundary required by useSearchParams) ──────────
export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}
