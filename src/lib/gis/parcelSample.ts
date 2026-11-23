// The Surveyor worked example: 4000 Round Lake Road, Apopka FL 32712.
// Geometry verified against both the Orange County and the Florida statewide
// cadastral services on 2026-11-22 (see ~/workspace/ar-feature/GIS-PARCEL-SOURCES.md).
export const SAMPLE_PARCEL = {
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          -81.59640557815094,
          28.74249292995174,
          0
        ],
        [
          -81.59640222047632,
          28.741906618510075,
          0
        ],
        [
          -81.59320688450941,
          28.741915332142998,
          0
        ],
        [
          -81.5932102231985,
          28.742501622275302,
          0
        ],
        [
          -81.59640557815094,
          28.74249292995174,
          0
        ]
      ]
    ]
  },
  "properties": {
    "parcelId": "272015775300060",
    "parcelIdStatewide": "152027775300060",
    "situs": "4000 ROUND LAKE RD",
    "city": "Apopka",
    "zip": "32712",
    "source": "Worked example \u2014 GIS-PARCEL-SOURCES.md (Orange County / FL statewide cadastral)"
  }
} as const;
