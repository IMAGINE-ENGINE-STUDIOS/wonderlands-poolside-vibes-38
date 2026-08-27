// Loads the Google Maps JavaScript API once for the whole app.
//
// The browser key is a referrer-restricted publishable key, so it lives in the
// client. The script is loaded asynchronously with a callback, because with
// `loading=async` google.maps is not ready at script onload.

import * as React from "react";

declare global {
  interface Window {
    __wlMapsReady?: boolean;
    __wlMapsInit?: () => void;
  }
}

const SCRIPT_ID = "wl-google-maps-js";
let loading: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.__wlMapsReady) return Promise.resolve();
  if (loading) return loading;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  if (!key) return Promise.reject(new Error("Aerial imagery is not configured for this site yet."));

  loading = new Promise<void>((resolve, reject) => {
    window.__wlMapsInit = () => {
      window.__wlMapsReady = true;
      resolve();
    };
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry&loading=async` +
      `&callback=__wlMapsInit${channel ? `&channel=${channel}` : ""}`;
    script.onerror = () => {
      loading = null;
      reject(new Error("The aerial map could not be loaded."));
    };
    document.head.appendChild(script);
  });
  return loading;
};

/** Ready flag + any load error, for a component that needs the map. */
export const useGoogleMaps = () => {
  const [ready, setReady] = React.useState<boolean>(!!(typeof window !== "undefined" && window.__wlMapsReady));
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (ready) return;
    let alive = true;
    loadGoogleMaps()
      .then(() => alive && setReady(true))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [ready]);

  return { ready, error };
};

export default useGoogleMaps;
