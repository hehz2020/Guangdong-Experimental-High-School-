// Campus layout measured from satellite imagery. Local frame: origin at track centre, x east, z south, metres.
// Every entry records how it was measured; entries marked estimated are not surveyed values.
export const CAMPUS = {
  "frame": {
    "units": "metres",
    "x": "east",
    "z": "south",
    "y": "up",
    "origin": {
      "lon": 113.22149,
      "lat": 23.076014,
      "what": "centre of the running track"
    },
    "source": {
      "imagery": "zoom-19 satellite mosaic",
      "metresPerPixel": 0.2747,
      "originPixel": [
        703.0,
        1506.5
      ]
    }
  },
  "track": {
    "outer": {
      "cx": 0.0,
      "cz": 0.0,
      "sizeX": 90.6,
      "sizeZ": 160.1
    },
    "infield": {
      "cx": -0.3,
      "cz": 5.6,
      "sizeX": 71.4,
      "sizeZ": 109.3
    },
    "shape": "rounded rectangle with shallow end arcs, not semicircular bends",
    "measurementNote": "outer length +/- 4 m (south end in tree shadow); lap length not established, estimated 340-350 m, not a standard 400 m oval"
  },
  "buildings": [
    {
      "id": "grandstand-roof",
      "name": "West grandstand roof canopy",
      "confidence": "confirmed in video",
      "planAccuracy": "+/- 1.5 m",
      "notes": "White roof, long axis north-south, slightly bowed end eaves. Covers the stand building west of the track.",
      "footprint": {
        "cx": -84.9,
        "cz": -6.5,
        "sizeX": 35.7,
        "sizeZ": 62.1
      },
      "sourcePixels": {
        "w": 329,
        "n": 1370,
        "e": 459,
        "s": 1596
      },
      "shape": "rect"
    },
    {
      "id": "grandstand-seating",
      "name": "West grandstand open seating strip",
      "confidence": "confirmed in video",
      "planAccuracy": "+/- 1.5 m east-west; south end NOT measured, runs past the crop at pixel row 1720",
      "notes": "Three colour blocks north to south: blue, red, teal. Longer than the roof at both ends.",
      "footprint": {
        "cx": -61.0,
        "cz": 4.4,
        "sizeX": 9.9,
        "sizeZ": 108.5
      },
      "sourcePixels": {
        "w": 463,
        "n": 1325,
        "e": 499,
        "s": 1720
      },
      "shape": "rect"
    },
    {
      "id": "gym-main",
      "name": "Gymnasium east of the track (slogan wall faces the field)",
      "confidence": "confirmed in video",
      "planAccuracy": "+/- 2 m; north edge uncertain",
      "notes": "Dark main roof, south eave slightly bowed. A further dark band about 13 m deep lies north of pixel row 1400; unresolved whether it is an annex or shadow, so it is excluded here. Three pale roof strips about 32 m long near the centre.",
      "footprint": {
        "cx": 95.5,
        "cz": 0.3,
        "sizeX": 82.1,
        "sizeZ": 59.1
      },
      "sourcePixels": {
        "w": 901,
        "n": 1400,
        "e": 1200,
        "s": 1615
      },
      "shape": "rect"
    },
    {
      "id": "gym-roof-east-edge-feature",
      "name": "White strip on the east edge of the gym roof",
      "confidence": "seen in satellite only",
      "planAccuracy": "+/- 1.5 m",
      "notes": "Overlaps the gym main roof by about 4 m and projects about 2 m beyond its east edge, so it is a feature on the roof edge, not a separate building beside the gym. Ladder-like texture in the southern half. Function unknown from plan view.",
      "footprint": {
        "cx": 135.6,
        "cz": 1.8,
        "sizeX": 6.3,
        "sizeZ": 44.5
      },
      "sourcePixels": {
        "w": 1185,
        "n": 1432,
        "e": 1208,
        "s": 1594
      },
      "shape": "rect"
    },
    {
      "id": "plaza-canopy",
      "name": "Space-frame canopy over the central plaza",
      "confidence": "confirmed in video",
      "planAccuracy": "+/- 1.5 m",
      "notes": "Pale ribbed roof, ribs run north-south. Irregular notch at the south-east corner, roughly pixels 1370-1391 x 1270-1299, not modelled in this rectangle.",
      "shape": "rect",
      "footprint": {
        "cx": 168.8,
        "cz": -75.8,
        "sizeX": 40.4,
        "sizeZ": 37.6
      },
      "sourcePixels": {
        "w": 1244,
        "n": 1162,
        "e": 1391,
        "s": 1299
      }
    },
    {
      "id": "teaching-slab-west",
      "name": "East-west teaching slab west of the plaza",
      "confidence": "inside presumed campus, building use not confirmed",
      "planAccuracy": "+/- 1.5 m; north edge soft because it fades into its own shadow",
      "notes": "Re-measured from a crop that contains the whole building; the first reading came from a crop whose south boundary cut through it and was about 2 m too deep. Two roof zones: a darker pitched or tiled strip along the north (pixel rows 1243-1272) and a pale flat strip with small square openings along the south (rows 1272-1302), with a narrow ledge to about row 1308. Relative heights of the two zones cannot be read from plan view. Called a teaching slab by resemblance to the confirmed ones; actual use not established.",
      "shape": "rect",
      "footprint": {
        "cx": 109.7,
        "cz": -63.9,
        "sizeX": 50.8,
        "sizeZ": 17.0
      },
      "sourcePixels": {
        "w": 1010,
        "n": 1243,
        "e": 1195,
        "s": 1305
      }
    },
    {
      "id": "dome",
      "name": "Circular drum with dome north of the arc building",
      "confidence": "seen in satellite only",
      "planAccuracy": "+/- 2 m",
      "notes": "Outer ring about 24.7 m across, inner dome about 13 m across. Not seen in the reference video; use unknown.",
      "shape": "circle",
      "footprint": {
        "cx": 215.4,
        "cz": -158.4,
        "radius": 12.4
      },
      "sourcePixels": {
        "cx": 1487,
        "cy": 930,
        "r": 45
      }
    },
    {
      "id": "arc-building",
      "name": "Long curved building north of the teaching core",
      "confidence": "seen in satellite only",
      "planAccuracy": "centreline +/- 4 m, depth +/- 3 m; both ends uncertain",
      "notes": "Concave side faces south. Row of dark rectangular openings along the roof. Chord about 188 m. Recorded as a hand-traced centreline because the two ends are not symmetric and no circle fit was made. Whether it belongs to the school is not confirmed.",
      "shape": "polyline-band",
      "footprint": {
        "centreline": [
          [
            77.5,
            -85.6
          ],
          [
            91.2,
            -103.4
          ],
          [
            106.3,
            -118.5
          ],
          [
            124.2,
            -130.3
          ],
          [
            144.8,
            -137.2
          ],
          [
            170.9,
            -143.5
          ],
          [
            198.3,
            -144.9
          ],
          [
            225.8,
            -141.9
          ],
          [
            245.0,
            -133.1
          ]
        ],
        "depth": 13.7
      },
      "sourcePixels": {
        "centreline": [
          [
            985,
            1195
          ],
          [
            1035,
            1130
          ],
          [
            1090,
            1075
          ],
          [
            1155,
            1032
          ],
          [
            1230,
            1007
          ],
          [
            1325,
            984
          ],
          [
            1425,
            979
          ],
          [
            1525,
            990
          ],
          [
            1595,
            1022
          ]
        ],
        "depth": 50
      }
    },
    {
      "id": "teaching-slab-west-annex-w",
      "name": "Small block projecting south at the west end of the west slab",
      "confidence": "seen in satellite only, single reading",
      "planAccuracy": "+/- 2 m",
      "notes": "Pale roof. Possibly a stair or entrance block; function not established.",
      "shape": "rect",
      "footprint": {
        "cx": 86.8,
        "cz": -51.0,
        "sizeX": 8.8,
        "sizeZ": 11.5
      },
      "sourcePixels": {
        "w": 1003,
        "n": 1300,
        "e": 1035,
        "s": 1342
      }
    },
    {
      "id": "teaching-slab-west-link-e",
      "name": "Narrow north-south piece at the east end of the west slab",
      "confidence": "seen in satellite only, single reading",
      "planAccuracy": "+/- 2 m",
      "notes": "Pale, about 3.6 m wide. Possibly a stair core or a covered link toward the plaza; function not established.",
      "shape": "rect",
      "footprint": {
        "cx": 137.5,
        "cz": -57.1,
        "sizeX": 3.6,
        "sizeZ": 20.1
      },
      "sourcePixels": {
        "w": 1197,
        "n": 1262,
        "e": 1210,
        "s": 1335
      }
    }
  ]
};
