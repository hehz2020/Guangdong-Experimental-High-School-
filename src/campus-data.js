// GENERATED FILE. Source of truth: data/measurements.json. Regenerate with: npm run data
export const CAMPUS = {
  "generatedFrom": "data/measurements.json by scripts/build-campus-data.mjs - do not edit by hand",
  "frame": {
    "units": "metres",
    "x": "east",
    "z": "south",
    "y": "up",
    "origin": {
      "what": "centre of the running track",
      "lon": 113.221491,
      "lat": 23.075954
    }
  },
  "caveats": {
    "heights": "No building height has been measured. Every height is an estimate from storey counts or proportions in video footage.",
    "obliqueImage": "The image is oblique, viewed from the north-north-east: roofs appear displaced toward the south-south-west of their bases and north facades are visible. Magnitude calibrated on the teaching slabs' visible north facade band (about 47 px) against an estimated 20.7 m height, so it inherits that height's uncertainty. Found by the east-slabs measurement agent; not independently calibrated."
  },
  "track": {
    "cx": 0,
    "cz": 0,
    "longAxis": "north-south",
    "straight": 84.39,
    "innerRadius": 36.5,
    "lanes": 8,
    "laneWidth": 1.22,
    "outerRadius": 46.3,
    "outer": {
      "sizeX": 92.5,
      "sizeZ": 176.9
    },
    "infield": {
      "cx": -0.4,
      "cz": -1.1,
      "sizeX": 71.4,
      "sizeZ": 109.3
    },
    "features": [
      "retired fighter jet on display outside the south-west bend (2022 video frames 79-81)",
      "long-jump runway with sand pits between the west straight and the stand",
      "high-jump area in the south D"
    ],
    "basis": "Infield grass measured on the satellite image (crisp edges): 71.4 x 109.3 m. Outer extent measured on near-vertical frames 79-81 of the 2022 sports-day video using the infield as scale: 177.2 x 92.2 m, within 0.3 m of a standard 400 m track, so standard geometry is used. Track centre is 1.1 m south and 0.4 m east of the infield centre in those frames. An earlier satellite-only reading (160 m long) was wrong: the south bend is under tree shadow and was also cut by the crop boundary."
  },
  "courts": {
    "block": {
      "w": 55.6,
      "n": 14.3,
      "e": 126.5,
      "s": 77.5
    },
    "columnCentresX": [
      66.5,
      83.1,
      100.5,
      117.1
    ],
    "rowCentresZ": [
      30.1,
      61.4
    ],
    "hoopBandZ": 45.8,
    "courtSize": [
      15,
      28
    ],
    "dividerBandsX": {
      "west": [
        55.6,
        58.9
      ],
      "between-1-2": [
        74,
        75.7
      ],
      "between-2-3": [
        90.5,
        93
      ],
      "between-3-4": [
        108.1,
        109.5
      ],
      "east": [
        124.6,
        126.5
      ]
    },
    "confidence": "8 full courts, 4 columns by 2 rows: satellite and 2018 video agree. Court size is assumed (15 x 28 m), not measured. North, south and east edges of the paved block are inferred, only the west edge is seen.",
    "paintNote": "2018 video: dark green courts with red keys, red centre discs, red-brown divider bands, one court (north row, third from west) in bright teal with a pink-red surround, an orange round logo on the north-west court. The satellite image shows all eight green with white centre marks. The two sources were not reconciled; the video paint scheme is used.",
    "extras": "Double-sided hoop stands on green steel posts back to back on the central band; chain-link fence; steel railing on the west edge; row of about six trees on the west; white slogan boards on the east edge (2018 video).",
    "measuredBy": "measurement agent (courts), single reading, recheck pending"
  },
  "items": [
    {
      "id": "grandstand-roof",
      "name": "West grandstand roof canopy",
      "kind": "building",
      "style": "grandstand",
      "height": 15,
      "heightBasis": "one tall window level plus clerestory above the stand in the videos; estimate, +/- 3 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.3,
      "correctedForObliqueView": true,
      "notes": "White roof, long axis north-south, slightly bowed end eaves. Covers the stand building west of the track.",
      "shape": "polygon",
      "points": [
        [
          -101.7,
          -53.7
        ],
        [
          -66,
          -53.7
        ],
        [
          -66,
          8.4
        ],
        [
          -101.7,
          8.4
        ]
      ]
    },
    {
      "id": "grandstand-seating",
      "name": "West grandstand open seating strip",
      "kind": "stand",
      "style": "seating",
      "height": 5,
      "heightBasis": "top of the upper seating tier above the track apron; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 1.7,
      "correctedForObliqueView": true,
      "notes": "Three colour blocks north to south: blue, red, teal. Longer than the roof at both ends.",
      "shape": "polygon",
      "points": [
        [
          -65.7,
          -59.7
        ],
        [
          -55.8,
          -59.7
        ],
        [
          -55.8,
          48.8
        ],
        [
          -65.7,
          48.8
        ]
      ]
    },
    {
      "id": "gym-main",
      "name": "Gymnasium east of the track (slogan wall faces the field)",
      "kind": "building",
      "style": "gym",
      "height": 15,
      "heightBasis": "tall single hall, eave below the 5-storey roofs in the videos; estimate, +/- 3 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.3,
      "correctedForObliqueView": true,
      "notes": "Dark main roof, south eave slightly bowed. A further dark band about 13 m deep lies north of pixel row 1400; unresolved whether it is an annex or shadow, so it is excluded here. Three pale roof strips about 32 m long near the centre.",
      "shape": "polygon",
      "points": [
        [
          55.4,
          -45.5
        ],
        [
          137.5,
          -45.5
        ],
        [
          137.5,
          13.6
        ],
        [
          55.4,
          13.6
        ]
      ]
    },
    {
      "id": "gym-roof-east-edge-feature",
      "name": "White strip on the east edge of the gym roof",
      "kind": "roof-feature",
      "style": "none",
      "height": 15,
      "heightBasis": "on the gym roof edge; same height as the gym estimate",
      "solid": false,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.3,
      "correctedForObliqueView": true,
      "notes": "Overlaps the gym main roof by about 4 m and projects about 2 m beyond its east edge, so it is a feature on the roof edge, not a separate building beside the gym. Ladder-like texture in the southern half. Function unknown from plan view.",
      "shape": "polygon",
      "points": [
        [
          133.4,
          -36.7
        ],
        [
          139.7,
          -36.7
        ],
        [
          139.7,
          7.8
        ],
        [
          133.4,
          7.8
        ]
      ]
    },
    {
      "id": "plaza-canopy",
      "name": "Space-frame canopy over the central plaza",
      "kind": "canopy",
      "style": "space-frame",
      "height": 21,
      "heightBasis": "roof plane at about the roof level of the adjoining 5-storey blocks in the 2018 video; estimate",
      "solid": false,
      "walkUnder": true,
      "confidence": "confirmed in video",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.8,
      "correctedForObliqueView": true,
      "notes": "Pale ribbed roof, ribs run north-south. Irregular notch at the south-east corner, roughly pixels 1370-1391 x 1270-1299, not modelled in this rectangle.",
      "shape": "polygon",
      "points": [
        [
          150.1,
          -114.6
        ],
        [
          190.5,
          -114.6
        ],
        [
          190.5,
          -77
        ],
        [
          150.1,
          -77
        ]
      ]
    },
    {
      "id": "teaching-slab-west",
      "name": "East-west teaching slab west of the plaza",
      "kind": "building",
      "style": "teaching-slab-wide",
      "height": 20.7,
      "heightBasis": "5 to 6 open-corridor levels seen in the 2018 video; 5 used; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "inside presumed campus, building use not confirmed",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.8,
      "correctedForObliqueView": true,
      "notes": "Re-measured from a crop that contains the whole building; the first reading came from a crop whose south boundary cut through it and was about 2 m too deep. Two roof zones: a darker pitched or tiled strip along the north (pixel rows 1243-1272) and a pale flat strip with small square openings along the south (rows 1272-1302), with a narrow ledge to about row 1308. Relative heights of the two zones cannot be read from plan view. Called a teaching slab by resemblance to the confirmed ones; actual use not established.",
      "shape": "polygon",
      "points": [
        [
          85.8,
          -92.2
        ],
        [
          136.6,
          -92.2
        ],
        [
          136.6,
          -75.2
        ],
        [
          85.8,
          -75.2
        ]
      ]
    },
    {
      "id": "dome",
      "name": "Circular drum with dome north of the arc building",
      "kind": "building",
      "style": "dome",
      "height": 21,
      "heightBasis": "drum with at least 3 window rows visible above trees, dome on top; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.8,
      "correctedForObliqueView": true,
      "notes": "Outer ring about 24.7 m across, inner dome about 13 m across. Not seen in the reference video; use unknown.",
      "shape": "circle",
      "cx": 216.8,
      "cz": -178.4,
      "radius": 12.4
    },
    {
      "id": "arc-building",
      "name": "Long curved building north of the teaching core",
      "kind": "building",
      "style": "arc",
      "height": 18.6,
      "heightBasis": "4 window rows on the concave face in the 2022 video plus a rooftop pergola level; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.6,
      "correctedForObliqueView": true,
      "notes": "Concave side faces south. Row of dark rectangular openings along the roof. Chord about 188 m. Recorded as a hand-traced centreline because the two ends are not symmetric and no circle fit was made. Whether it belongs to the school is not confirmed.",
      "shape": "polygon",
      "points": [
        [
          84.2,
          -99.9
        ],
        [
          97.7,
          -117.4
        ],
        [
          112,
          -131.7
        ],
        [
          128.5,
          -142.6
        ],
        [
          147.9,
          -149.1
        ],
        [
          173.1,
          -155.2
        ],
        [
          199.4,
          -156.5
        ],
        [
          225.4,
          -153.7
        ],
        [
          243.5,
          -145.3
        ],
        [
          249.2,
          -157.8
        ],
        [
          228.8,
          -167
        ],
        [
          199.8,
          -170.2
        ],
        [
          171.2,
          -168.8
        ],
        [
          144.2,
          -162.3
        ],
        [
          122.5,
          -155
        ],
        [
          103.3,
          -142.3
        ],
        [
          87.3,
          -126.4
        ],
        [
          73.3,
          -108.2
        ]
      ]
    },
    {
      "id": "teaching-slab-west-annex-w",
      "name": "Small block projecting south at the west end of the west slab",
      "kind": "building",
      "style": "plain",
      "height": 7.8,
      "heightBasis": "height not established; 2 storeys assumed",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only, single reading",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 1.9,
      "correctedForObliqueView": true,
      "notes": "Pale roof. Possibly a stair or entrance block; function not established.",
      "shape": "polygon",
      "points": [
        [
          82.9,
          -68.4
        ],
        [
          91.7,
          -68.4
        ],
        [
          91.7,
          -56.8
        ],
        [
          82.9,
          -56.8
        ]
      ]
    },
    {
      "id": "teaching-slab-west-link-e",
      "name": "Narrow north-south piece at the east end of the west slab",
      "kind": "building",
      "style": "stair-core",
      "height": 20.7,
      "heightBasis": "taken as the glass stair tower at the slab's east end; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only, single reading",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.8,
      "correctedForObliqueView": true,
      "notes": "Pale, about 3.6 m wide. Possibly a stair core or a covered link toward the plaza; function not established.",
      "shape": "polygon",
      "points": [
        [
          137.2,
          -87
        ],
        [
          140.7,
          -87
        ],
        [
          140.7,
          -66.9
        ],
        [
          137.2,
          -66.9
        ]
      ]
    },
    {
      "id": "slab-north",
      "name": "North teaching slab (east of plaza canopy)",
      "kind": "building",
      "style": "teaching-slab",
      "height": 20.7,
      "heightBasis": "5 storeys counted in the 2018 video x assumed 3.9 m floor height + 1.2 m parapet; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.5,
      "correctedForObliqueView": true,
      "notes": "ROOF outline as it appears in the image, NOT a ground footprint: the image is oblique (taken from the NNE), the blue-grey gridded band at y 1098-1136/1146 is the north facade, not shadow and not roof. Ground footprint is roughly this outline moved about 47 px north and 5 px east (uncertain 40-60 px). Dark grey flat roof with white parapets and rooftop units; long white pipe/parapet lines at y 1157/1167 and 1176; lighter 9 px strip y 1176-1185 along the south side (corridor roof). North edge steps 10 px at x 1529 (west 68 px at y 1146, east part at y 1136); video suggests the west part is taller, so the step may be height rather than plan. Small block at SW corner x 1460-1489, y 1181-1203 included. South edge east of x 1575 is in shadow (inferred). Main bar 176 px long (48 m), 39-49 px deep. Video frame 5 shows about 5 window rows on the north facade (count +/-1). One of TWO slabs in this zone.",
      "shape": "polygon",
      "points": [
        [
          209.7,
          -118.8
        ],
        [
          228.4,
          -118.8
        ],
        [
          228.4,
          -121.6
        ],
        [
          258.3,
          -121.6
        ],
        [
          258.3,
          -110.6
        ],
        [
          253.6,
          -110.6
        ],
        [
          253.6,
          -108.1
        ],
        [
          217.4,
          -108.1
        ],
        [
          217.4,
          -103.2
        ],
        [
          209.4,
          -103.2
        ]
      ],
      "mainBar": {
        "w": 209.7,
        "n": -120.2,
        "e": 258.3,
        "s": -108.1
      }
    },
    {
      "id": "slab-north-east-stair",
      "name": "North slab east-end stair/lobby block",
      "kind": "building",
      "style": "stair-tower-oculus",
      "height": 23.5,
      "heightBasis": "stair tower slightly taller than the slab with an open top loggia (2018 video); estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.9,
      "correctedForObliqueView": true,
      "notes": "Roof slab as seen; dark circular spot at about (1651,1153) matches the roof slab with a round opening in frames 5-6. Rises above the main roof (a dark vertical facade strip at x 1640-1644 runs y 1105-1164, i.e. taller than the slab facade). East limit of the north slab as seen is x 1661 (ground about 1667). Total slab length incl. this block 200 px = 55 m.",
      "shape": "polygon",
      "points": [
        [
          259.1,
          -123.1
        ],
        [
          264.8,
          -123.1
        ],
        [
          264.8,
          -113.5
        ],
        [
          259.1,
          -113.5
        ]
      ]
    },
    {
      "id": "slab-north-se-block",
      "name": "North slab south-east corner block",
      "kind": "building",
      "style": "plain",
      "height": 11.7,
      "heightBasis": "height not established; 3 storeys assumed",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 1.9,
      "correctedForObliqueView": true,
      "notes": "Small roof with white parapets south of the east stair block; inner parapet line at y 1182. Height relative to the slab not established.",
      "shape": "polygon",
      "points": [
        [
          253.2,
          -104.9
        ],
        [
          261.7,
          -104.9
        ],
        [
          261.7,
          -98.9
        ],
        [
          253.2,
          -98.9
        ]
      ]
    },
    {
      "id": "slab-north-ne-wing",
      "name": "Lower wing north of the north slab's east end",
      "kind": "building",
      "style": "plain",
      "height": 11.7,
      "heightBasis": "about 3 storeys in frames 2-4 of the 2018 video; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 1.9,
      "correctedForObliqueView": true,
      "notes": "Roof as seen, white parapets, beige roof; southern part (x 1624-1659, y 1078-1103) is dark, probably shadow of the taller east stair block. Stepped L-shape. Frames 2-4 show a lower (about 3 storey) block in front of the north slab's east end. Its north edge (y 1040-1044) meets the east end of the arc building; that junction is outside my zone and partly cut by my crops.",
      "shape": "polygon",
      "points": [
        [
          249.6,
          -141.2
        ],
        [
          259.5,
          -142.3
        ],
        [
          259.5,
          -132.7
        ],
        [
          263.7,
          -132.7
        ],
        [
          263.7,
          -124.7
        ],
        [
          253.8,
          -124.7
        ],
        [
          253.8,
          -130.2
        ],
        [
          249.6,
          -130.2
        ]
      ]
    },
    {
      "id": "slab-south",
      "name": "South teaching slab (clock tower at its west end)",
      "kind": "building",
      "style": "teaching-slab",
      "height": 20.7,
      "heightBasis": "5 storeys counted in the 2018 video x assumed 3.9 m floor height + 1.2 m parapet; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.7,
      "correctedForObliqueView": true,
      "notes": "ROOF outline as seen (oblique image; facade band y 1238-1277/1287 north of it is the north facade). Ground footprint roughly 47 px further north, 5 px east. Same plan as the north slab, offset (-24,+141) px: north edge steps 10 px at x 1508, inner lines at y 1307 and 1317, SW corner block x 1437-1466 y 1316-1343 included. South edge (1324) is the least certain edge (+/-5): it blends with trees and a sunlit paved yard, and the south facade is not visible at all. Frames 6-7 show 5 window rows on the north facade (+/-1) and the west part standing slightly higher than the east part.",
      "shape": "polygon",
      "points": [
        [
          203.1,
          -80.1
        ],
        [
          222.6,
          -80.1
        ],
        [
          222.6,
          -82.9
        ],
        [
          251.4,
          -82.9
        ],
        [
          251.4,
          -71.9
        ],
        [
          247,
          -71.9
        ],
        [
          247,
          -69.9
        ],
        [
          211.1,
          -69.9
        ],
        [
          211.1,
          -64.7
        ],
        [
          203.1,
          -64.7
        ]
      ],
      "mainBar": {
        "w": 203.1,
        "n": -81.5,
        "e": 251.4,
        "s": -69.9
      }
    },
    {
      "id": "slab-south-east-stair",
      "name": "South slab east-end stair/lobby block",
      "kind": "building",
      "style": "stair-tower-oculus",
      "height": 23.5,
      "heightBasis": "as the north slab's east stair tower; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 3.1,
      "correctedForObliqueView": true,
      "notes": "Roof as seen: two short white beams at x 1617-1621 and a dark round spot near (1627,1295); frame 7 shows a roof slab with round opening and a pergola frame on this end. East limit of the south slab as seen x 1638 (ground about 1644). Edges less crisp than on the north slab.",
      "shape": "polygon",
      "points": [
        [
          251.9,
          -84.3
        ],
        [
          258.5,
          -84.3
        ],
        [
          258.5,
          -73.9
        ],
        [
          251.9,
          -73.9
        ]
      ]
    },
    {
      "id": "slab-south-se-block",
      "name": "South slab south-east corner block",
      "kind": "building",
      "style": "plain",
      "height": 11.7,
      "heightBasis": "height not established; 3 storeys assumed",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 1.7,
      "correctedForObliqueView": true,
      "notes": "White parapet on west, south and east sides clearly visible; mottled beige roof. Same element as the north slab's SE block. Height not established.",
      "shape": "polygon",
      "points": [
        [
          246.6,
          -65.9
        ],
        [
          254.9,
          -65.9
        ],
        [
          254.9,
          -59.3
        ],
        [
          246.6,
          -59.3
        ]
      ]
    },
    {
      "id": "sign-wing-between-slabs",
      "name": "East wing between the two slabs (carries the school-name sign)",
      "kind": "building",
      "style": "sign-wing",
      "height": 15.6,
      "heightBasis": "lower than the slabs by about one storey in the satellite image; carries the rooftop name sign; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2,
      "correctedForObliqueView": true,
      "notes": "Roof as seen, beige with white parapets on all four sides, 44 x 71 px (12 x 19.5 m). Lower than the slabs: about 19 px of the south slab's facade shows between its south edge (1258) and the south slab's parapet (1277). Frames 5-6 show the red school-name lettering on a white parapet wall on this block. It appears to abut the south slab; whether it also touches the north slab at ground level could not be established.",
      "shape": "polygon",
      "points": [
        [
          245.8,
          -104.4
        ],
        [
          257.9,
          -104.4
        ],
        [
          257.9,
          -84.8
        ],
        [
          245.8,
          -84.8
        ]
      ]
    },
    {
      "id": "link-corridor-west",
      "name": "North-south link walkway along the west ends of both slabs",
      "kind": "link-corridor",
      "style": "walkway",
      "height": 4,
      "heightBasis": "height and construction not established; single-storey covered walkway assumed",
      "solid": false,
      "walkUnder": true,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 1.4,
      "correctedForObliqueView": true,
      "notes": "Long narrow strip about 12 px (3.3 m) wide and 205 px (56 m) long. NOT exactly north-south: it runs NNE-SSW (about 10 degrees off, parallel to the canal road), passing between the block north-east of the canopy (east edge x 1444) and the north slab (west edge 1461), then between the tower/glass block and the south slab's west end. Bright white where sunlit (y 1145-1230), grey where shaded by the slabs (y 1088-1145 and 1230-1292). Low structure; frames 7-8 show a white elevated walkway with parapets leaving the south slab's north-west corner toward the north, which I take to be this. Height, and whether it is roofed or an open deck, not established.",
      "shape": "polygon",
      "points": [
        [
          207.3,
          -124.2
        ],
        [
          206.2,
          -117.3
        ],
        [
          204.3,
          -109.7
        ],
        [
          203.5,
          -101.7
        ],
        [
          202.4,
          -93.5
        ],
        [
          201.5,
          -86.6
        ],
        [
          200.4,
          -79.7
        ],
        [
          198.8,
          -74.2
        ],
        [
          198.5,
          -68.2
        ],
        [
          201.8,
          -68.2
        ],
        [
          202.1,
          -74.2
        ],
        [
          203.7,
          -79.7
        ],
        [
          204.8,
          -86.6
        ],
        [
          205.7,
          -93.5
        ],
        [
          206.5,
          -101.7
        ],
        [
          207.6,
          -109.7
        ],
        [
          209.8,
          -117.3
        ],
        [
          210.9,
          -124.2
        ]
      ]
    },
    {
      "id": "link-corridor-north-pavilion",
      "name": "Small white roof at the north end of the link walkway",
      "kind": "link-corridor",
      "style": "walkway",
      "height": 4,
      "heightBasis": "not established; assumed as the walkway",
      "solid": false,
      "walkUnder": true,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 0.9,
      "correctedForObliqueView": true,
      "notes": "White rectangular roof with parapet outline, about 13 x 18 px. North of it (y 1035-1070) tree crowns hide whether the walkway continues to the arc building.",
      "shape": "polygon",
      "points": [
        [
          208.4,
          -129.2
        ],
        [
          212,
          -129.2
        ],
        [
          210.9,
          -124.2
        ],
        [
          207.3,
          -124.2
        ]
      ]
    },
    {
      "id": "clock-tower",
      "name": "Clock tower (plan position, in the same roof-level frame as the south slab outline)",
      "kind": "building",
      "style": "clock-tower",
      "height": 40,
      "heightBasis": "top about twice the 5-storey slab height in frame 8 of the 2018 video; rough estimate, +/- 5 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 3.6,
      "correctedForObliqueView": true,
      "notes": "Identified with moderate-to-good confidence, but NOT as a clean square in plan: because the image is oblique the tower shows as a leaning strip (see clock-tower-leaning-image) with its top displaced about 100 px SSW of its base. This rect is where the shaft sits relative to the south slab's roof outline as drawn (about 20 px = 5.5 m square, 19-39 px west of the slab's west end, level with the northern/central part of the slab's width), so it can be used directly next to the slab entries. True ground position is roughly centre (1413,1255) +/-12. The base is hidden behind the glass stair block. Rough height from video proportions (top is about 6 storey-heights above the slab roof): about 45 m, +/-5, an estimate not a measurement. Evidence: strip follows the lean direction of other vertical edges; sunlit white east-face sliver; teal shadow patch on the canopy's SE corner (x 1355-1390, y 1278-1310) pointing back to it; position matches frames 7-10 (west end of the south slab, glass block on its north side, canopy beyond).",
      "shape": "polygon",
      "points": [
        [
          192.4,
          -78.7
        ],
        [
          197.9,
          -78.7
        ],
        [
          197.9,
          -73.2
        ],
        [
          192.4,
          -73.2
        ]
      ]
    },
    {
      "id": "glass-stair-block",
      "name": "Glass stair block beside the clock tower (roof element as seen)",
      "kind": "building",
      "style": "stair-core",
      "height": 22.5,
      "heightBasis": "about 1.5 storeys above the slab roof per the measurement agent; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 3,
      "correctedForObliqueView": true,
      "notes": "Small beige/white roof with parapet lines directly north of the tower strip; taken to be the white roof slab on top of the blue-green glass block in frames 8-10 (about 1.5 storeys above the slab roof). In the slab-roof frame it sits about 14 px further north (y 1279-1292), i.e. at and slightly north of the south slab's north-west corner. Full extent of the glass block not resolvable; only this roof element is seen.",
      "shape": "polygon",
      "points": [
        [
          192.2,
          -79.6
        ],
        [
          198.3,
          -79.6
        ],
        [
          198.3,
          -76
        ],
        [
          192.2,
          -76
        ]
      ]
    },
    {
      "id": "block-north-of-canopy-east-end",
      "name": "East end of the block on the north side of the plaza canopy",
      "kind": "building",
      "style": "plain",
      "height": 20.7,
      "heightBasis": "5 storeys counted in the 2018 video x assumed 3.9 m floor height + 1.2 m parapet; estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.8,
      "correctedForObliqueView": true,
      "notes": "Only the part inside my zone. White north parapet line at y 1131-1134 continues west to at least x 1354 (and probably further, outside my zone); east edge is a beige band at x 1439-1444, y 1117-1191; south limit about y 1191. Dark roof with several white boxes. Sits immediately west of the north slab's west end with the link walkway in the 17 px gap. Internal layout and height not established.",
      "shape": "polygon",
      "points": [
        [
          189.9,
          -123
        ],
        [
          205,
          -123
        ],
        [
          205,
          -106.5
        ],
        [
          189.9,
          -106.5
        ]
      ]
    },
    {
      "id": "plaza-east-of-canopy",
      "name": "Open paved area between canopy east edge and the link walkway",
      "kind": "court",
      "style": "plaza",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.7,
      "correctedForObliqueView": false,
      "notes": "Appears as a uniform dark rectangle (in shadow) in the satellite image; frames 8-9 show an open paved plaza with palm planters north of the glass block and east of the canopy, which I take to be this. Southern part of the rectangle may be shaded facade of the glass block/tower base rather than ground.",
      "shape": "polygon",
      "points": [
        [
          189.1,
          -92.8
        ],
        [
          201.2,
          -92.8
        ],
        [
          201.2,
          -66.2
        ],
        [
          189.1,
          -66.2
        ]
      ]
    },
    {
      "id": "courtyard-between-slabs",
      "name": "Courtyard between the north and south slabs",
      "kind": "garden",
      "style": "garden",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.2,
      "correctedForObliqueView": false,
      "notes": "Visible ground strip only; mostly in shadow, with sunlit tree crowns at x 1450-1500, y 1195-1240. Because the north slab's roof leans over it, the real courtyard extends further north: gap between the two slabs is 92 px (east parts) to 102 px (west parts) = 25-28 m; row pitch 141 px = 38.7 m. Bounded on the east by the sign wing (x 1594) and on the west by the link walkway.",
      "shape": "polygon",
      "points": [
        [
          209.5,
          -94.8
        ],
        [
          244.3,
          -94.8
        ],
        [
          244.3,
          -80.5
        ],
        [
          209.5,
          -80.5
        ]
      ]
    },
    {
      "id": "canal-road",
      "name": "Road between the slabs and the canal",
      "kind": "road",
      "style": "road",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.7,
      "correctedForObliqueView": false,
      "notes": "Grey asphalt about 25 px (7 m) wide, largely under tree crowns and tree shadow, so edges are approximate. It is NOT due north-south: it trends NNE-SSW (about 13 px west per 100 px south). White car on it at (1679,1360).",
      "shape": "polygon",
      "points": [
        [
          277.9,
          -134.9
        ],
        [
          273.7,
          -107.4
        ],
        [
          272.1,
          -90.9
        ],
        [
          269.9,
          -74.4
        ],
        [
          266.6,
          -47
        ],
        [
          265.2,
          -30.5
        ],
        [
          271.8,
          -30.5
        ],
        [
          273.5,
          -47
        ],
        [
          277.3,
          -74.4
        ],
        [
          279.8,
          -90.9
        ],
        [
          281.2,
          -107.4
        ],
        [
          286.1,
          -134.9
        ]
      ]
    },
    {
      "id": "canal-side-pavement",
      "name": "Paved strip along the east facades of the slabs",
      "kind": "other",
      "style": "pavement",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 2.2,
      "correctedForObliqueView": false,
      "notes": "Light beige ground strip between the buildings' east ends and a thin dark line (hedge or kerb) that runs from about (1690,1087) to (1653,1330). West edge is partly hidden by the leaning east-end blocks.",
      "shape": "polygon",
      "points": [
        [
          263.9,
          -125.3
        ],
        [
          260,
          -93.7
        ],
        [
          257.8,
          -79.9
        ],
        [
          255.1,
          -55.2
        ],
        [
          260.6,
          -55.2
        ],
        [
          264.7,
          -79.9
        ],
        [
          267.1,
          -93.7
        ],
        [
          271,
          -125.3
        ]
      ]
    },
    {
      "id": "canal-west-bank",
      "name": "Canal west bank line",
      "kind": "water",
      "style": "water",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading, recheck pending",
      "positionAccuracyM": 1.6,
      "correctedForObliqueView": false,
      "notes": "West edge of the water (pale stone revetment about 8 px wide just west of it); polygon closes eastward only to x 1840, the east bank is outside my crops. At this latitude the canal is at x greater than about 1750-1800 and tilted, not at x 1700-1800: the band x 1725-1775 is a tree belt between road and canal.",
      "shape": "polygon",
      "points": [
        [
          301.8,
          -135.7
        ],
        [
          298.5,
          -118.4
        ],
        [
          295.2,
          -90.9
        ],
        [
          290.8,
          -63.5
        ],
        [
          287.5,
          -36
        ],
        [
          286.7,
          -30.5
        ],
        [
          312.2,
          -30.5
        ],
        [
          312.2,
          -135.7
        ]
      ]
    },
    {
      "id": "dorm-a-north-slab",
      "name": "Long east-west block A, north bar (called a dormitory by the measurement agent; use not established - its fascia carries a slogan in the 2018 video)",
      "kind": "building",
      "style": "slab-block",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.5,
      "correctedForObliqueView": true,
      "notes": "Roof outline as seen: 349 x 43 px = 95.9 x 11.8 m, exactly east-west. Beige flat roof; band of rooftop structures along the north half (y 1662-1679, incl. a light-blue item at x 1382-1397 and white ribbed blocks), plain band along the south half, white south parapet at y 1699-1701. White parapet bar on the west end (x 1216-1220). SE corner is notched: the plain south band stops at x~1558 and there is a dark recess at x 1530-1556, y 1690-1703. IMPORTANT: imagery is oblique; roofs of these ~6-floor slabs are displaced about 41 px south and 6 px west of their bases, so the estimated ground footprint is rect [1223,1617,1572,1660] (+/-8 px), not directly visible because trees cover it. Video f_006-f_009 show its north facade: white roof parapet carrying a row of red characters (unreadable), red-brick sections with recessed balconies separated by white vertical bays, white west end bay; only the top ~3 floor rows show above the trees. EAST END: Part of the A north slab, not a separate building: bright white ribbed roof strip 87 x 21 px (24 x 5.8 m) at the east end. In the video this end of the north facade is a full-height row of slender white columns in front of glazing (about 6 column lines; satellite shows them as leaning lines at x~1490,1506,1519,1532,1544,1562, pitch ~12.5 px = 3.4 m, visible from y 1625 to 1658 north of the roof edge). Occupies roughly the east quarter of the slab length. Function not established.",
      "shape": "polygon",
      "points": [
        [
          142.7,
          21.7
        ],
        [
          238.5,
          21.7
        ],
        [
          238.5,
          33.6
        ],
        [
          142.7,
          33.6
        ]
      ]
    },
    {
      "id": "dorm-a-south-slab",
      "name": "Long east-west block A, south bar (use not established)",
      "kind": "building",
      "style": "slab-block",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.5,
      "correctedForObliqueView": true,
      "notes": "Roof outline as seen: 291 x 44 px = 79.9 x 12.1 m, parallel to A north. Beige flat roof; plain band on the north (court) side, rooftop structures along the south half (y 1750-1774: light-blue item at x 1385-1400, white ribbed blocks at x 1417-1443 and 1467-1495), white south parapet line at y 1771-1774 with its shadow strip just north of it. East end x 1522 is +/-5 (clutter between 1515 and 1530). Estimated ground footprint after removing lean: rect [1237,1690,1528,1734] (+/-8). Its north facade is partly visible in the gap as a dark shaded band with floor lines every ~7 px. Only a roofline behind A north is hinted in the video; not matched.",
      "shape": "polygon",
      "points": [
        [
          146.5,
          41.8
        ],
        [
          226.4,
          41.8
        ],
        [
          226.4,
          53.9
        ],
        [
          146.5,
          53.9
        ]
      ]
    },
    {
      "id": "dorm-b-north-slab",
      "name": "Long east-west block B, north bar (use not established)",
      "kind": "building",
      "style": "slab-block",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.5,
      "correctedForObliqueView": true,
      "notes": "Roof outline as seen: 315 x 44 px = 86.5 x 12.1 m, exactly east-west. White north parapet line at y 1853, rooftop structures along the north half (light-blue item at x 1360-1375, ribbed block at x 1425-1455), plain band on the south, white south parapet at y 1891-1892. White bar on west end x 1217-1221. Dark recess at SE corner x 1500-1529, y 1871-1892. A white leaning line at x 1528-1536 running y 1838-1900 is the east end wall/corner seen obliquely, so east edge is +/-4. Estimated ground footprint: rect [1223,1807,1538,1851] (+/-8), hidden by trees; bluish patches north of the roof at x~1220-1245, 1305-1315, 1360-1375, 1515-1530 are white facade bays in shade.",
      "shape": "polygon",
      "points": [
        [
          142.7,
          73.9
        ],
        [
          229.2,
          73.9
        ],
        [
          229.2,
          86
        ],
        [
          142.7,
          86
        ]
      ]
    },
    {
      "id": "dorm-b-south-slab",
      "name": "Block B, south bar, rotated about 10 degrees (use not established)",
      "kind": "building",
      "style": "slab-block",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.7,
      "correctedForObliqueView": true,
      "notes": "Rotated about 10 degrees anticlockwise from east-west (east end swung north): north roof edge runs y = 1952.5 - 0.1765*(x-1275), checked at x 1275, 1295, 1350, 1462. About 263 px long x 42 px deep = 72 x 11.5 m. South edge is +/-6: a dark strip (parapet shadow) lies just inside it and the parapet merges with bright pavement. East end shape (square or chamfered) uncertain, +/-6. Rooftop: white ribbed blocks around x 1385-1437, light-blue item at x 1437-1452. Its shaded north facade is visible obliquely north of the roof edge: 6 floor lines at 6.5-7 px pitch running parallel to this slab, and the white west end bay spans y 1917-1957 at x 1234-1246, giving a lean of ~41 px. Estimated ground footprint: [[1230,1920.5],[1489,1875],[1496,1916],[1237,1962]] (+/-8).",
      "shape": "polygon",
      "points": [
        [
          144.6,
          105.1
        ],
        [
          215.7,
          92.6
        ],
        [
          217.7,
          103.9
        ],
        [
          146.5,
          116.5
        ]
      ]
    },
    {
      "id": "dorm-a-round-tower",
      "name": "Round tower at the east end of block A (spiral stair or ramp; not established)",
      "kind": "building",
      "style": "round-tower",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.4,
      "correctedForObliqueView": true,
      "notes": "White ring about 38 px = 10.4 m across, immediately east of the A south slab end and south of the link block. Top shows two concentric arcs like a spiral stair or ramp, C-shaped and open toward the north-west. Position is the top as seen; if it is as tall as the slabs its base is ~41 px further north. Height not established.",
      "shape": "circle",
      "cx": 233,
      "cz": 45.9,
      "radius": 5.2
    },
    {
      "id": "dorm-b-round-tower",
      "name": "Round tower at the east end of block B",
      "kind": "building",
      "style": "round-tower",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.4,
      "correctedForObliqueView": true,
      "notes": "Clean light ring, outer diameter ~35 px = 9.6 m (x 1490-1524), with a dark roughly octagonal centre of radius ~10.5 px (open well or dark roof). Sits at the east end of the rotated B south slab. Height not established; position is the top as seen.",
      "shape": "circle",
      "cx": 222.3,
      "cz": 96.2,
      "radius": 4.9
    },
    {
      "id": "dorm-a-east-link",
      "name": "Link closing the east end of block A at roof level",
      "kind": "building",
      "style": "plain",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.5,
      "correctedForObliqueView": true,
      "notes": "Pale sunlit roof 28 x 28 px (7.7 x 7.7 m) closing the east end of the gap between the two A slabs, at roof level (a low roof could not appear here). White edge line along its east side x 1556-1560 running from y 1682 down to the round tower.",
      "shape": "polygon",
      "points": [
        [
          228.6,
          33.8
        ],
        [
          236.3,
          33.8
        ],
        [
          236.3,
          41.5
        ],
        [
          228.6,
          41.5
        ]
      ]
    },
    {
      "id": "dorm-b-east-link",
      "name": "Link at the east end of block B (level assumed)",
      "kind": "building",
      "style": "plain",
      "height": 20.8,
      "heightBasis": "6 floor lines counted by the measurement agent on one block's north facade in the satellite image; 3.3 m floor height assumed; estimate, +/- 4 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading, recheck pending",
      "positionAccuracyM": 2.8,
      "correctedForObliqueView": true,
      "notes": "Pale surface about 29 x 21 px (8 x 5.8 m) between the SE corner of the B north slab and the round tower, same arrangement as block A. Edges are soft; dark diagonal lines run from (1500,1900) toward (1478,1925). Level not established, assumed roof level by analogy with A.",
      "shape": "polygon",
      "points": [
        [
          220.7,
          85.7
        ],
        [
          228.6,
          85.7
        ],
        [
          228.6,
          91.5
        ],
        [
          220.7,
          91.5
        ]
      ]
    },
    {
      "id": "dorm-b-south-paved-strip",
      "name": "Paved strip south of block B",
      "kind": "road",
      "style": "pavement",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (dorms), single reading",
      "positionAccuracyM": 1.6,
      "correctedForObliqueView": false,
      "notes": "Bright paving visible south of the B south slab roof, 22-32 px (6-9 m) wide, parallel to that slab; a dark area begins south of it (y ~2027 at x 1250, ~1983 at x 1470). Its real width is larger: the northern ~41 px is hidden under the leaning roof. Continues east into a north-south road with parked cars at x ~1500-1600, y 1900-2060.",
      "shape": "polygon",
      "points": [
        [
          144.9,
          129.7
        ],
        [
          216.1,
          117
        ],
        [
          217.4,
          123.6
        ],
        [
          191.3,
          128.3
        ],
        [
          169.4,
          134
        ],
        [
          148.8,
          136.2
        ]
      ]
    }
  ]
};
