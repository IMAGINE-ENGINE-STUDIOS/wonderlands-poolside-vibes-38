// Shared GIS layer — Mapbox access for every map surface on this site
// (Surveyor first; Solar Genius and later GIS features consume the same seam).
//
// The value is the account's PUBLIC (pk.) token — Mapbox public tokens are
// built to ship in browsers and are protected by the URL restrictions set on
// the token (fosstheory.com + wonderlandsworld.com). Pasted by the founder
// 2026-11-22 (account "wonderlandsworlds").
//
// NEVER put a secret (sk.) token in this file or anywhere in the client.
export const MAPBOX_TOKEN = "pk.eyJ1Ijoid29uZGVybGFuZHN3b3JsZHMiLCJhIjoiY213c2xjbzB0MWhxeDMwcHlqcmNxMDZkZiJ9.zZW_T1rgNMIemBW0t5mEfg";

export const MAPBOX_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
