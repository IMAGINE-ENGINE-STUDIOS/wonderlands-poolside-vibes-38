import { supabase } from "@/integrations/supabase/client";

interface PerformanceMetric {
  device_type?: string;
  browser?: string;
  os?: string;
  user_agent?: string;
  page_url: string;
  load_time_ms?: number;
  dom_content_loaded_ms?: number;
  first_contentful_paint_ms?: number;
  largest_contentful_paint_ms?: number;
  time_to_interactive_ms?: number;
  error_message?: string;
  error_stack?: string;
  error_type?: string;
  session_id?: string;
  connection_type?: string;
  effective_connection_type?: string;
}

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

const getBrowserInfo = (): { browser: string; os: string } => {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  // Browser detection
  if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
  else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
  else if (ua.indexOf("Trident") > -1) browser = "IE";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";
  else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";

  // OS detection
  if (ua.indexOf("Win") > -1) os = "Windows";
  else if (ua.indexOf("Mac") > -1) os = "MacOS";
  else if (ua.indexOf("Linux") > -1) os = "Linux";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("iOS") > -1 || ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS";

  return { browser, os };
};

const getConnectionInfo = () => {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  return {
    connection_type: connection?.type || "unknown",
    effective_connection_type: connection?.effectiveType || "unknown",
  };
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("perf_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("perf_session_id", sessionId);
  }
  return sessionId;
};

export const trackPagePerformance = async () => {
  try {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const { browser, os } = getBrowserInfo();
    const connectionInfo = getConnectionInfo();

    // Wait for page to fully load
    await new Promise(resolve => {
      if (document.readyState === "complete") {
        resolve(null);
      } else {
        window.addEventListener("load", () => resolve(null));
      }
    });

    // Get paint metrics
    const paintEntries = performance.getEntriesByType("paint");
    const fcp = paintEntries.find((entry) => entry.name === "first-contentful-paint");
    const lcp = performance.getEntriesByType("largest-contentful-paint")[0];

    const metric: PerformanceMetric = {
      device_type: getDeviceType(),
      browser,
      os,
      user_agent: navigator.userAgent,
      page_url: window.location.pathname,
      load_time_ms: timing.loadEventEnd - timing.navigationStart,
      dom_content_loaded_ms: timing.domContentLoadedEventEnd - timing.navigationStart,
      first_contentful_paint_ms: fcp ? Math.round(fcp.startTime) : undefined,
      largest_contentful_paint_ms: lcp ? Math.round(lcp.startTime) : undefined,
      session_id: getSessionId(),
      ...connectionInfo,
    };

    await supabase.from("performance_metrics").insert(metric);
  } catch (error) {
    console.error("Failed to track performance:", error);
  }
};

export const trackError = async (
  error: Error,
  errorType: "js_error" | "network_error" | "promise_rejection"
) => {
  try {
    const { browser, os } = getBrowserInfo();
    const connectionInfo = getConnectionInfo();

    const metric: PerformanceMetric = {
      device_type: getDeviceType(),
      browser,
      os,
      user_agent: navigator.userAgent,
      page_url: window.location.pathname,
      error_message: error.message || error.toString(),
      error_stack: error.stack,
      error_type: errorType,
      session_id: getSessionId(),
      ...connectionInfo,
    };

    await supabase.from("performance_metrics").insert(metric);
  } catch (err) {
    console.error("Failed to track error:", err);
  }
};

// Initialize error tracking
export const initializePerformanceMonitoring = () => {
  // Track page load performance
  if (document.readyState === "complete") {
    trackPagePerformance();
  } else {
    window.addEventListener("load", trackPagePerformance);
  }

  // Track JavaScript errors
  window.addEventListener("error", (event) => {
    trackError(new Error(event.message), "js_error");
  });

  // Track unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    trackError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      "promise_rejection"
    );
  });
};
