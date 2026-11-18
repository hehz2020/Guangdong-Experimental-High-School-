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
    "heights": "No building height has been measured; every height is an estimate, and its basis is recorded item by item in height.basis. Most come from storey counts or proportions in the video footage (3.9 m storeys assumed for the teaching slabs and the new building); the long blocks from six floor lines counted on a north facade in the satellite image (3.3 m floors assumed); the clock tower and the glass stair block from a camera resection of one 2018 frame; the link walkway from the 2018 frames and from shading on the satellite image; the new building's six storeys from a planning record; a few small blocks are assumed outright. storeyHeightMetres (3.9) is the storey height assumed for the teaching slabs, which also calibrates the lean; it is not the storey height of every building, and a builder may divide an item's overall height differently (see the builders' headers).",
    "obliqueImage": "The image is oblique, viewed from the north-north-east: roofs appear displaced toward the south-south-west of their bases and north facades are visible. Direction: white piers on a dormitory north face lean dx/dy = -0.115 to -0.12. Magnitude re-calibrated by an independent second reading on floor bands of the teaching-slab facades: 33 to 35 px from the parapet top down to the first-floor band (four storeys and the parapet, 16.8 m with the assumed 3.9 m storeys) gives 1.96 to 2.07 px per metre; band spacing is 7.4 to 8.0 px per storey. The first value (2.3) came from a 47 px facade band that included a dark zone below the first floor whose extent was a guess. What is measured directly is the roof displacement of the five-storey slabs, about 41 px; the split into height and px per metre still rests on the assumed storey height (with 2.3 the same bands would mean 3.3 m storeys)."
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
    "measuredBy": "measurement agent (courts), single reading; re-read by the independent second reading (2026-11): the eight court centres agree within 1 px"
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
      "positionAccuracyM": 2.1,
      "correctedForObliqueView": true,
      "notes": "White roof, long axis north-south, slightly bowed end eaves. Covers the stand building west of the track.",
      "shape": "polygon",
      "points": [
        [
          -101.9,
          -52.5
        ],
        [
          -66.1,
          -52.5
        ],
        [
          -66.1,
          9.6
        ],
        [
          -101.9,
          9.6
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
      "measuredBy": "main session, gridded 2x crops; independent second reading (measurement agent, 2026-11), checked by the main session on its overlay",
      "positionAccuracyM": 0.9,
      "correctedForObliqueView": true,
      "notes": "CORRECTED after an independent second reading (rectPx was [463, 1325, 499, 1720]): the first south end (1720) was the edge of a tree shadow across the teal seat block. The white rail line on the west side of the seats runs unbroken to y 1751 and the three colour blocks then come out nearly equal (blue 1330-1467, red 1467-1603, teal 1603-1750). The stand is about 8 m longer at its south end. | Earlier note: Three colour blocks north to south: blue, red, teal. Longer than the roof at both ends.",
      "shape": "polygon",
      "points": [
        [
          -65.2,
          -58.5
        ],
        [
          -55.3,
          -58.5
        ],
        [
          -55.3,
          57.4
        ],
        [
          -65.2,
          57.4
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
      "measuredBy": "main session, gridded 2x crops; independent second reading (measurement agent, 2026-11), checked by the main session on its overlay",
      "positionAccuracyM": 1.7,
      "correctedForObliqueView": true,
      "notes": "CORRECTED after an independent second reading (rectPx was [901, 1400, 1200, 1615]): the roof lies 1.9 m further east: x 901 was a grey strip of shaded ground, and the white glazed strip recorded as gym-roof-east-edge-feature runs to x 1207.5 with dark roof north and south of it reaching the same x. North and south edges are not straight: west of x 945 they lie 14 to 16 px further north, which fits a west part of the roof 6 to 8 m lower than the rest (not modelled: the builder uses one arc). | Earlier note: Dark main roof, south eave slightly bowed. A further dark band about 13 m deep lies north of pixel row 1400; unresolved whether it is an annex or shadow, so it is excluded here. Three pale roof strips about 32 m long near the centre.",
      "shape": "polygon",
      "points": [
        [
          57.2,
          -42.9
        ],
        [
          139.5,
          -42.9
        ],
        [
          139.5,
          15.4
        ],
        [
          57.2,
          15.4
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
      "positionAccuracyM": 2.1,
      "correctedForObliqueView": true,
      "notes": "The second reading puts the gym roof's east edge at x 1207.5, so this strip lies on the roof along its east edge and does not project beyond it. | Earlier note: Overlaps the gym main roof by about 4 m and projects about 2 m beyond its east edge, so it is a feature on the roof edge, not a separate building beside the gym. Ladder-like texture in the southern half. Function unknown from plan view.",
      "shape": "polygon",
      "points": [
        [
          133.3,
          -35.4
        ],
        [
          139.6,
          -35.4
        ],
        [
          139.6,
          9.1
        ],
        [
          133.3,
          9.1
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
      "measuredBy": "main session, gridded 2x crops; independent second reading (measurement agent, 2026-11), checked by the main session on its overlay",
      "positionAccuracyM": 1.9,
      "correctedForObliqueView": true,
      "notes": "CORRECTED after an independent second reading (rectPx was [1244, 1162, 1391, 1299]): the striped white roof continues uniformly to y 1306.5 between x 1245 and 1365; the first south edge (1299) cut across the stripes 2.1 m short. The blue-grey patch over the south-east corner (x above 1366, y above 1283) is the clock tower's shadow (tower-location agent: the sun azimuth calibrated on the south slab's shadow puts the shadow of a 41 m tower exactly there). | Earlier note: Pale ribbed roof, ribs run north-south. Irregular notch at the south-east corner, roughly pixels 1370-1391 x 1270-1299, not modelled in this rectangle.",
      "shape": "polygon",
      "points": [
        [
          149.6,
          -112.6
        ],
        [
          190.3,
          -112.6
        ],
        [
          190.3,
          -73.2
        ],
        [
          149.6,
          -73.2
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
      "measuredBy": "main session, gridded 2x crops; independent second reading (measurement agent, 2026-11), checked by the main session on its overlay",
      "positionAccuracyM": 2,
      "correctedForObliqueView": true,
      "notes": "CORRECTED after an independent second reading (rectPx was [1010, 1243, 1195, 1305]): the first reading took the visible NORTH FACADE (dark band y 1243-1275 with floor lines every 8 px and pier lines) for roof and stopped short at the south. The roof is the cream surface from y 1276 (1284 for the eastern 65 px) to a bright parapet line at y 1316.5; a fainter strip continues to y 1325.5 between x 1085 and 1164. The south edge is put at the outer edge of that strip, the same convention as the two east slabs (see README: whether the walls stand under the parapet line or under the strip's edge is undecided; if under the parapet line this slab is about 2.5 m too deep at the south). West end is pointed (tip 1014,1286). The slab is about 13.6 m deep by this convention (11 m to the parapet line), not 17 m, and its north edge lies 9 m further south than first recorded. | Earlier note: Re-measured from a crop that contains the whole building; the first reading came from a crop whose south boundary cut through it and was about 2 m too deep. Two roof zones: a darker pitched or tiled strip along the north (pixel rows 1243-1272) and a pale flat strip with small square openings along the south (rows 1272-1302), with a narrow ledge to about row 1308. Relative heights of the two zones cannot be read from plan view. Called a teaching slab by resemblance to the confirmed ones; actual use not established.",
      "shape": "polygon",
      "points": [
        [
          87.8,
          -81.4
        ],
        [
          135.6,
          -81.4
        ],
        [
          135.6,
          -67.8
        ],
        [
          87.8,
          -67.8
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
      "confidence": "seen in video (2018 frames 2-3, 2022 frame 58) and in satellite; outline from satellite; use not established",
      "measuredBy": "main session, gridded 2x crops; independent second reading (measurement agent, 2026-11), checked by the main session on its overlay",
      "positionAccuracyM": 1.9,
      "correctedForObliqueView": true,
      "notes": "CORRECTED after an independent second reading (circlePx was [1487, 930, 45]): circle fitted to 17 points on the white outer arc gives centre (1486.5, 936.9); the first centre was about 1.9 m too far north. | Earlier note: Outer ring about 24.7 m across, inner dome about 13 m across. Not seen in the reference video; use unknown. (That remark is older than the builder: the drum and the dome are visible in 2018 frames 2-3 and in 2022 frame 58, see src/world/builders/dome.js. The use is still unknown.)",
      "shape": "circle",
      "cx": 216.6,
      "cz": -174.7,
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
      "confidence": "confirmed in video (concave face in 2022 frames 9-18, roof in 2022 frame 58 and 2018 frames 2-3, west end in 2018 frames 43, 53 and 67-69); outline from satellite; whether it belongs to the school is not confirmed",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.3,
      "correctedForObliqueView": true,
      "notes": "SECOND READING, MODELLED IN THE BUILDER (src/world/builders/arc.js adds 4.3 m of canopy and 3.3 m of building beyond this band's concave edge as constants; if this band is ever widened to 70 px those constants must be reduced): eight cross-sections show the same roof-level section everywhere: solid roof 32 to 33 px deep from the outer (north-west) parapet, a row of dark rectangular openings about 19 px deep crossed by white beams, then a continuous pale strip 15 to 16 px deep with a bright line on its inner (concave) side; 68 to 72 px in all. The stored band (50 px) ends at the inner side of the openings and leaves the inner strip out; the outer edge agrees within 3 px. What stands under the inner strip is not visible. | Concave side faces south. Row of dark rectangular openings along the roof. Chord about 188 m. Recorded as a hand-traced centreline because the two ends are not symmetric and no circle fit was made. Whether it belongs to the school is not confirmed.",
      "shape": "polygon",
      "points": [
        [
          84,
          -98.3
        ],
        [
          97.5,
          -115.8
        ],
        [
          111.8,
          -130.2
        ],
        [
          128.3,
          -141.1
        ],
        [
          147.7,
          -147.5
        ],
        [
          172.9,
          -153.7
        ],
        [
          199.2,
          -155
        ],
        [
          225.2,
          -152.2
        ],
        [
          243.3,
          -143.8
        ],
        [
          249,
          -156.3
        ],
        [
          228.6,
          -165.5
        ],
        [
          199.6,
          -168.7
        ],
        [
          171,
          -167.3
        ],
        [
          144,
          -160.8
        ],
        [
          122.3,
          -153.5
        ],
        [
          103.1,
          -140.8
        ],
        [
          87.1,
          -124.9
        ],
        [
          73.1,
          -106.7
        ]
      ]
    },
    {
      "id": "teaching-slab-west-annex-w",
      "name": "Glass stair tower at the west end of the west slab, south side",
      "kind": "building",
      "style": "stair-core",
      "height": 22.5,
      "heightBasis": "full-height glazed stair tower slightly above the slab roof in the 2018 footage (frame 58); estimate",
      "solid": true,
      "walkUnder": false,
      "confidence": "position from one satellite reading; identified as the glass stair tower from the 2018 footage by a modelling agent",
      "measuredBy": "main session, gridded 2x crops; re-read by the main session on a 7x enlargement after the slab was corrected",
      "positionAccuracyM": 2.2,
      "correctedForObliqueView": true,
      "notes": "NORTH EDGE RE-READ (rectPx was [1003, 1300, 1035, 1342]): the pale roof of this block runs from about y 1312 to a white edge strip at y 1338-1343 and from x 1004 to a white line at x 1035; the first north edge (1300) fitted the slab as first measured, 17 m deep. | Earlier note: Pale roof. Possibly a stair or entrance block; function not established. CORRECTION: this was first recorded as a low two-storey annex and the stair tower was put at the slab's east end. Every 2018 frame of this slab (43, 53, 58, 67-69) is taken from the west or south-west and shows the glazed stair tower with a white fin at the west end on the south side, which is this block.",
      "shape": "polygon",
      "points": [
        [
          84.1,
          -72.5
        ],
        [
          92.6,
          -72.5
        ],
        [
          92.6,
          -64.3
        ],
        [
          84.1,
          -64.3
        ]
      ]
    },
    {
      "id": "teaching-slab-west-link-e",
      "name": "Narrow north-south piece at the east end of the west slab (function not established)",
      "kind": "building",
      "style": "plain",
      "height": 20.7,
      "heightBasis": "taken as the roof height of the adjoining west slab (20.7 m); the function of this piece is not established, so the height is an assumption",
      "solid": true,
      "walkUnder": false,
      "confidence": "seen in satellite only, single reading",
      "measuredBy": "main session, gridded 2x crops",
      "positionAccuracyM": 2.4,
      "correctedForObliqueView": true,
      "notes": "Pale, about 3.6 m wide. Possibly a stair core or a covered link toward the plaza; function not established. It was modelled as a glass stair core at first; that was a guess with no supporting frame, so it is now a plain block.",
      "shape": "polygon",
      "points": [
        [
          137,
          -85.3
        ],
        [
          140.5,
          -85.3
        ],
        [
          140.5,
          -65.2
        ],
        [
          137,
          -65.2
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
      "measuredBy": "measurement agent (east-slabs), single reading; re-read by the independent second reading (2026-11): north, west and east edges agree within 1 px, the south edge is a question of convention (see the note)",
      "positionAccuracyM": 2,
      "correctedForObliqueView": true,
      "notes": "ROOF outline as it appears in the image, NOT a ground footprint: the image is oblique (taken from the NNE), the blue-grey gridded band at y 1098-1136/1146 is the north facade, not shadow and not roof. Ground footprint is this outline moved about 41 px north and 5 px east (20.7 m of height at the lean stored in this file, 2.0 px per metre; the first estimate, made with the earlier lean value 2.3, was 47 px, uncertain 40-60 px). Dark grey flat roof with white parapets and rooftop units; long white pipe/parapet lines at y 1157/1167 and 1176; lighter 9 px strip y 1176-1185 along the south side (corridor roof). North edge steps 10 px at x 1529 (west 68 px at y 1146, east part at y 1136); video suggests the west part is taller, so the step may be height rather than plan. Small block at SW corner x 1460-1489, y 1181-1203 included. South edge east of x 1575 is in shadow (inferred). Main bar 176 px long (48 m), 39-49 px deep. Video frame 5 shows about 5 window rows on the north facade (count +/-1). One of TWO slabs in this zone. | SECOND READING: north, west and east edges agree within 1 px. South edge: a bright parapet line lies 6 to 11 px north of the stored edge (y 1175.5 on the north teaching slab, 1316.5 on the south one); the stored edge is the outer edge of a fainter strip south of it. Which of the two is the wall line cannot be told from the image.",
      "shape": "polygon",
      "points": [
        [
          209.5,
          -117.1
        ],
        [
          228.2,
          -117.1
        ],
        [
          228.2,
          -119.9
        ],
        [
          258.1,
          -119.9
        ],
        [
          258.1,
          -108.9
        ],
        [
          253.4,
          -108.9
        ],
        [
          253.4,
          -106.4
        ],
        [
          217.2,
          -106.4
        ],
        [
          217.2,
          -101.5
        ],
        [
          209.2,
          -101.5
        ]
      ],
      "mainBar": {
        "w": 209.5,
        "n": -118.5,
        "e": 258.1,
        "s": -106.4
      }
    },
    {
      "id": "slab-north-east-stair",
      "name": "North slab east-end stair/lobby block",
      "kind": "building",
      "style": "stair-tower-oculus",
      "height": 21.5,
      "heightBasis": "2018 stills: the tower roof slab stands only about 0.8 m above the slab parapet (20.7 m); the first estimate was 23.5 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 2.2,
      "correctedForObliqueView": true,
      "notes": "Roof slab as seen; dark circular spot at about (1651,1153) matches the roof slab with a round opening in frames 5-6. Rises above the main roof (a dark vertical facade strip at x 1640-1644 runs y 1105-1164, i.e. taller than the slab facade). East limit of the north slab as seen is x 1661 (ground about 1667). Total slab length incl. this block 200 px = 55 m.",
      "shape": "polygon",
      "points": [
        [
          258.7,
          -120
        ],
        [
          264.5,
          -120
        ],
        [
          264.5,
          -110.4
        ],
        [
          258.7,
          -110.4
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
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 1.7,
      "correctedForObliqueView": true,
      "notes": "Small roof with white parapets south of the east stair block; inner parapet line at y 1182. Height relative to the slab not established.",
      "shape": "polygon",
      "points": [
        [
          253.1,
          -103.9
        ],
        [
          261.6,
          -103.9
        ],
        [
          261.6,
          -97.9
        ],
        [
          253.1,
          -97.9
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
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 1.7,
      "correctedForObliqueView": true,
      "notes": "Roof as seen, white parapets, beige roof; southern part (x 1624-1659, y 1078-1103) is dark, probably shadow of the taller east stair block. Stepped L-shape. Frames 2-4 show a lower (about 3 storey) block in front of the north slab's east end. Its north edge (y 1040-1044) meets the east end of the arc building; that junction is outside my zone and partly cut by my crops.",
      "shape": "polygon",
      "points": [
        [
          249.5,
          -140.2
        ],
        [
          259.4,
          -141.3
        ],
        [
          259.4,
          -131.7
        ],
        [
          263.5,
          -131.7
        ],
        [
          263.5,
          -123.7
        ],
        [
          253.6,
          -123.7
        ],
        [
          253.6,
          -129.2
        ],
        [
          249.5,
          -129.2
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
      "measuredBy": "measurement agent (east-slabs), single reading; re-read by the independent second reading (2026-11): north, west and east edges agree within 1 px, the south edge is a question of convention (see the note)",
      "positionAccuracyM": 2.2,
      "correctedForObliqueView": true,
      "notes": "ROOF outline as seen (oblique image; facade band y 1238-1277/1287 north of it is the north facade). Ground footprint about 41 px further north and 5 px east (lean 2.0 px per metre; the first estimate, made with the earlier lean value, was 47 px). Same plan as the north slab, offset (-24,+141) px: north edge steps 10 px at x 1508, inner lines at y 1307 and 1317, SW corner block x 1437-1466 y 1316-1343 included. South edge (1324) is the least certain edge (+/-5): it blends with trees and a sunlit paved yard, and the south facade is not visible at all. Frames 6-7 show 5 window rows on the north facade (+/-1) and the west part standing slightly higher than the east part. | SECOND READING: north, west and east edges agree within 1 px. South edge: a bright parapet line lies 6 to 11 px north of the stored edge (y 1175.5 on the north teaching slab, 1316.5 on the south one); the stored edge is the outer edge of a fainter strip south of it. Which of the two is the wall line cannot be told from the image.",
      "shape": "polygon",
      "points": [
        [
          202.9,
          -78.4
        ],
        [
          222.4,
          -78.4
        ],
        [
          222.4,
          -81.1
        ],
        [
          251.2,
          -81.1
        ],
        [
          251.2,
          -70.2
        ],
        [
          246.8,
          -70.2
        ],
        [
          246.8,
          -68.2
        ],
        [
          210.8,
          -68.2
        ],
        [
          210.8,
          -63
        ],
        [
          202.9,
          -63
        ]
      ],
      "mainBar": {
        "w": 202.9,
        "n": -79.8,
        "e": 251.2,
        "s": -68.2
      }
    },
    {
      "id": "slab-south-east-stair",
      "name": "South slab east-end stair/lobby block",
      "kind": "building",
      "style": "stair-tower-oculus",
      "height": 21.5,
      "heightBasis": "as the north slab's east stair tower: about 0.8 m above the slab parapet in the 2018 stills; the first estimate was 23.5 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 2.4,
      "correctedForObliqueView": true,
      "notes": "Roof as seen: two short white beams at x 1617-1621 and a dark round spot near (1627,1295); frame 7 shows a roof slab with round opening and a pergola frame on this end. East limit of the south slab as seen x 1638 (ground about 1644). Edges less crisp than on the north slab.",
      "shape": "polygon",
      "points": [
        [
          251.6,
          -81.3
        ],
        [
          258.1,
          -81.3
        ],
        [
          258.1,
          -70.9
        ],
        [
          251.6,
          -70.9
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
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 1.5,
      "correctedForObliqueView": true,
      "notes": "White parapet on west, south and east sides clearly visible; mottled beige roof. Same element as the north slab's SE block. Height not established.",
      "shape": "polygon",
      "points": [
        [
          246.5,
          -64.9
        ],
        [
          254.7,
          -64.9
        ],
        [
          254.7,
          -58.3
        ],
        [
          246.5,
          -58.3
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
      "measuredBy": "measurement agent (east-slabs), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 1.7,
      "correctedForObliqueView": true,
      "notes": "Roof as seen, beige with white parapets on all four sides, 44 x 71 px (12 x 19.5 m). Lower than the slabs: about 19 px of the south slab's facade shows between its south edge (1258) and the south slab's parapet (1277). Frames 5-6 show the red school-name lettering on a white parapet wall on this block. It appears to abut the south slab; whether it also touches the north slab at ground level could not be established.",
      "shape": "polygon",
      "points": [
        [
          245.7,
          -103.1
        ],
        [
          257.8,
          -103.1
        ],
        [
          257.8,
          -83.6
        ],
        [
          245.7,
          -83.6
        ]
      ]
    },
    {
      "id": "link-corridor-west",
      "name": "North-south link walkway along the west ends of both slabs",
      "kind": "link-corridor",
      "style": "walkway",
      "height": 7.8,
      "heightBasis": "elevated deck with parapets on columns, meeting the south slab at its third-storey floor in the 2018 frames (plaza agent); shading on the mosaic gives 7 to 8 m for its top (tower-location agent). The first value, 4.0 m, took it for a low canopy",
      "solid": false,
      "walkUnder": true,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading; the independent second reading (2026-11) traced the strip row by row: it agrees with the stored polygon",
      "positionAccuracyM": 1.5,
      "correctedForObliqueView": true,
      "notes": "Long narrow strip about 12 px (3.3 m) wide and 205 px (56 m) long. NOT exactly north-south: it runs NNE-SSW (about 10 degrees off, parallel to the canal road), passing between the block north-east of the canopy (east edge x 1444) and the north slab (west edge 1461), then between the tower/glass block and the south slab's west end. Bright white where sunlit (y 1145-1230), grey where shaded by the slabs (y 1088-1145 and 1230-1292). Low structure; frames 7-8 show a white elevated walkway with parapets leaving the south slab's north-west corner toward the north, which I take to be this. Height, and whether it is roofed or an open deck, not established. | APPLIED (height now 7.8 m, which also moves the ground position about 2 m north): the tower-location agent calibrated the sun on the mosaic (azimuth about 142.5 degrees, elevation 47 to 52 degrees) and finds that the shading beside both slabs puts this roof at about 7 to 8 m, not the assumed 4 m; the 2018 frames show an elevated white walkway with parapets leaving the slab's north-west corner.",
      "shape": "polygon",
      "points": [
        [
          207.5,
          -126
        ],
        [
          206.4,
          -119.1
        ],
        [
          204.5,
          -111.4
        ],
        [
          203.7,
          -103.4
        ],
        [
          202.6,
          -95.2
        ],
        [
          201.7,
          -88.3
        ],
        [
          200.6,
          -81.5
        ],
        [
          199,
          -76
        ],
        [
          198.7,
          -69.9
        ],
        [
          202,
          -69.9
        ],
        [
          202.3,
          -76
        ],
        [
          203.9,
          -81.5
        ],
        [
          205,
          -88.3
        ],
        [
          205.9,
          -95.2
        ],
        [
          206.7,
          -103.4
        ],
        [
          207.8,
          -111.4
        ],
        [
          210,
          -119.1
        ],
        [
          211.1,
          -126
        ]
      ]
    },
    {
      "id": "link-corridor-north-pavilion",
      "name": "Small white roof at the north end of the link walkway",
      "kind": "link-corridor",
      "style": "walkway",
      "height": 7.8,
      "heightBasis": "elevated deck with parapets on columns, meeting the south slab at its third-storey floor in the 2018 frames (plaza agent); shading on the mosaic gives 7 to 8 m for its top (tower-location agent). The first value, 4.0 m, took it for a low canopy",
      "solid": false,
      "walkUnder": true,
      "confidence": "seen in satellite only",
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 1,
      "correctedForObliqueView": true,
      "notes": "White rectangular roof with parapet outline, about 13 x 18 px. North of it (y 1035-1070) tree crowns hide whether the walkway continues to the arc building.",
      "shape": "polygon",
      "points": [
        [
          208.6,
          -130.9
        ],
        [
          212.2,
          -130.9
        ],
        [
          211.1,
          -126
        ],
        [
          207.5,
          -126
        ]
      ]
    },
    {
      "id": "clock-tower",
      "name": "Clock tower (plan position, in the same roof-level frame as the south slab outline)",
      "kind": "building",
      "style": "clock-tower",
      "height": 41,
      "heightBasis": "cap top 40.7 to 41.9 m from a camera resection of a 2018 frame (t = 27.5 s), tied to the south slab parapet taken as 20.7 m, so it scales with that assumption; the head panel on the mosaic gives 41 to 45 m. 41 +/- 3 m. Platform about 32 to 33 m, fins from about 26.5 m, mast top about 46 to 47 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video; position from three agreeing lines of evidence (camera resection of a 2018 frame, the leaning image on the mosaic, the shadow on the canopy roof)",
      "measuredBy": "first reading by the measurement agent (east-slabs): not confirmed by the independent second reading (2026-11) and replaced; stored position by the tower-location agent (2026-11), overlay checked by the main session; not re-read independently since",
      "positionAccuracyM": 2.3,
      "correctedForObliqueView": true,
      "notes": "RELOCATED (rectPx was [1398, 1292, 1418, 1312], about 6.4 m too far north: that rectangle is the pale roof element of the glass stair block, not the tower). The shaft, about 5.0 m east-west by 5.4 m north-south, stands directly south of the glass block and about 6.5 m west of the south slab's west end, with the link corridor in the gap. Evidence: (1) resection of the 2018 frame at t = 27.5 s puts the shaft between z -70.5 and -64.9, wholly south of the canopy's south-edge plane; (2) the bright sliver from (1414.5,1292) to (1409,1355) on the mosaic is the sunlit east face of the glass block's top and the tower's lower shaft, in the plane x 195.9 to 196.9; (3) with the sun at azimuth about 142.5 degrees the tower's shadow falls on the canopy roof at its south-east corner, where the mosaic shows a blue-grey patch. The east-west depth is the least certain part (about 1 m). The head is a thin north-south panel on a cantilevered platform, not a box. As before, this rectangle is where the shaft passes through the plane of the slab roofs (20.7 m), hence leanReferenceHeightMetres. | Earlier note: EARLIER STATE: position disputed by the second reading: no shaft is visible where a 40 m tower at this position would lean, and frames 8 to 10 of the 2018 video show the tower directly behind the west end of the south slab within the slab's width, with the glass core on its north side. A candidate (dark-red patch at x 1418-1437, y 1299-1346, low confidence) lies about 6 m east of this position on the ground. Being re-examined. | Identified with moderate-to-good confidence, but NOT as a clean square in plan: because the image is oblique the tower shows as a leaning strip (the reader kept a separate record of that strip under the name clock-tower-leaning-image; no entry of that name was ever part of this file) with its top displaced about 100 px SSW of its base. This rect is where the shaft sits relative to the south slab's roof outline as drawn (about 20 px = 5.5 m square, 19-39 px west of the slab's west end, level with the northern/central part of the slab's width), so it can be used directly next to the slab entries. True ground position is roughly centre (1413,1255) +/-12. The base is hidden behind the glass stair block. Rough height from video proportions (top is about 6 storey-heights above the slab roof): about 45 m, +/-5, an estimate not a measurement. Evidence: strip follows the lean direction of other vertical edges; sunlit white east-face sliver; teal shadow patch on the canopy's SE corner (x 1355-1390, y 1278-1310) pointing back to it; position matches frames 7-10 (west end of the south slab, glass block on its north side, canopy beyond).",
      "shape": "polygon",
      "points": [
        [
          191.3,
          -70.7
        ],
        [
          196.3,
          -70.7
        ],
        [
          196.3,
          -65.2
        ],
        [
          191.3,
          -65.2
        ]
      ]
    },
    {
      "id": "glass-stair-block",
      "name": "Glass stair block north of the clock tower (extent from a resected 2018 frame, expressed at roof level)",
      "kind": "building",
      "style": "stair-core",
      "height": 24,
      "heightBasis": "glass top about 24 m and the roof box about 27 m, from the same resected 2018 frame as the tower; the first estimate was 22.5 m",
      "solid": true,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "first reading by the measurement agent (east-slabs) replaced (it was only the roof element); stored extent by the tower-location agent (2026-11): bearings in a resected 2018 frame, not read as an outline on the mosaic; not re-read independently",
      "positionAccuracyM": 2.8,
      "correctedForObliqueView": true,
      "notes": "REPLACED (rectPx was [1397, 1293, 1419, 1306], which is only the pale roof element on top of this block; the stored tower rectangle coincided with the same element). The block stands directly north of the tower and shares its east face: green glass east face from z -77.4 to -72.8, then a white wall to the tower's north face at -70.6; east-west about x 190 to 197, so its west end meets the canopy's east edge. It does not touch the south slab. This rectangle is the ground extent x 190 to 197, z -79 to -70.6 expressed as a roof at 24 m. | Earlier note: Small beige/white roof with parapet lines directly north of the tower strip; taken to be the white roof slab on top of the blue-green glass block in frames 8-10 (about 1.5 storeys above the slab roof). In the slab-roof frame it sits about 14 px further north (y 1279-1292), i.e. at and slightly north of the south slab's north-west corner. Full extent of the glass block not resolvable; only this roof element is seen.",
      "shape": "polygon",
      "points": [
        [
          190,
          -79
        ],
        [
          197,
          -79
        ],
        [
          197,
          -70.6
        ],
        [
          190,
          -70.6
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
      "measuredBy": "measurement agent (east-slabs), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 2.4,
      "correctedForObliqueView": true,
      "notes": "Only the part inside my zone. White north parapet line at y 1131-1134 continues west to at least x 1354 (and probably further, outside my zone); east edge is a beige band at x 1439-1444, y 1117-1191; south limit about y 1191. Dark roof with several white boxes. Sits immediately west of the north slab's west end with the link walkway in the 17 px gap. Internal layout and height not established.",
      "shape": "polygon",
      "points": [
        [
          189.7,
          -121.2
        ],
        [
          204.8,
          -121.2
        ],
        [
          204.8,
          -104.8
        ],
        [
          189.7,
          -104.8
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
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
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
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
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
      "style": "none",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 2.7,
      "correctedForObliqueView": false,
      "notes": "Grey asphalt about 25 px (7 m) wide, largely under tree crowns and tree shadow, so edges are approximate. It is NOT due north-south: it trends NNE-SSW (about 13 px west per 100 px south). White car on it at (1679,1360). NOT DRAWN: superseded by the landscape module (src/world/extras/landscape.js), which traces the road and the canal over the whole height of the image; kept here as the original reading.",
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
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
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
      "style": "none",
      "height": 0,
      "heightBasis": "ground surface",
      "solid": false,
      "walkUnder": false,
      "confidence": "confirmed in video",
      "measuredBy": "measurement agent (east-slabs), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 1.6,
      "correctedForObliqueView": false,
      "notes": "West edge of the water (pale stone revetment about 8 px wide just west of it); polygon closes eastward only to x 1840, the east bank is outside my crops. At this latitude the canal is at x greater than about 1750-1800 and tilted, not at x 1700-1800: the band x 1725-1775 is a tree belt between road and canal. NOT DRAWN: superseded by the landscape module (src/world/extras/landscape.js), which traces the road and the canal over the whole height of the image; kept here as the original reading.",
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
      "measuredBy": "measurement agent (dorms), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px except the south edge, which is a question of convention (see the note)",
      "positionAccuracyM": 2,
      "correctedForObliqueView": true,
      "notes": "Roof outline as seen: 349 x 43 px = 95.9 x 11.8 m, exactly east-west. Beige flat roof; band of rooftop structures along the north half (y 1662-1679, incl. a light-blue item at x 1382-1397 and white ribbed blocks), plain band along the south half, white south parapet at y 1699-1701. White parapet bar on the west end (x 1216-1220). SE corner is notched: the plain south band stops at x~1558 and there is a dark recess at x 1530-1556, y 1690-1703. IMPORTANT: imagery is oblique; roofs of these ~6-floor slabs are displaced about 41 px south and 6 px west of their bases, so the estimated ground footprint is rect [1223,1617,1572,1660] (+/-8 px), not directly visible because trees cover it. Video f_006-f_009 show its north facade: white roof parapet carrying a row of red characters (unreadable), red-brick sections with recessed balconies separated by white vertical bays, white west end bay; only the top ~3 floor rows show above the trees. EAST END: Part of the A north slab, not a separate building: bright white ribbed roof strip 87 x 21 px (24 x 5.8 m) at the east end. In the video this end of the north facade is a full-height row of slender white columns in front of glazing (about 6 column lines; satellite shows them as leaning lines at x~1490,1506,1519,1532,1544,1562, pitch ~12.5 px = 3.4 m, visible from y 1625 to 1658 north of the roof edge). Occupies roughly the east quarter of the slab length. Function not established. | SECOND READING: north, west and east edges agree within 1 px. South edge: a bright parapet line lies 6 to 11 px north of the stored edge (y 1175.5 on the north teaching slab, 1316.5 on the south one); the stored edge is the outer edge of a fainter strip south of it. Which of the two is the wall line cannot be told from the image.",
      "shape": "polygon",
      "points": [
        [
          142.5,
          23.5
        ],
        [
          238.3,
          23.5
        ],
        [
          238.3,
          35.3
        ],
        [
          142.5,
          35.3
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
      "measuredBy": "measurement agent (dorms), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 2,
      "correctedForObliqueView": true,
      "notes": "Roof outline as seen: 291 x 44 px = 79.9 x 12.1 m, parallel to A north. Beige flat roof; plain band on the north (court) side, rooftop structures along the south half (y 1750-1774: light-blue item at x 1385-1400, white ribbed blocks at x 1417-1443 and 1467-1495), white south parapet line at y 1771-1774 with its shadow strip just north of it. East end x 1522 is +/-5 (clutter between 1515 and 1530). Estimated ground footprint after removing lean: rect [1237,1690,1528,1734] (+/-8). Its north facade is partly visible in the gap as a dark shaded band with floor lines every ~7 px. Only a roofline behind A north is hinted in the video; not matched.",
      "shape": "polygon",
      "points": [
        [
          146.3,
          43.5
        ],
        [
          226.2,
          43.5
        ],
        [
          226.2,
          55.6
        ],
        [
          146.3,
          55.6
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
      "measuredBy": "measurement agent (dorms), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px except the south edge, which is a question of convention (see the note)",
      "positionAccuracyM": 2,
      "correctedForObliqueView": true,
      "notes": "Roof outline as seen: 315 x 44 px = 86.5 x 12.1 m, exactly east-west. White north parapet line at y 1853, rooftop structures along the north half (light-blue item at x 1360-1375, ribbed block at x 1425-1455), plain band on the south, white south parapet at y 1891-1892. White bar on west end x 1217-1221. Dark recess at SE corner x 1500-1529, y 1871-1892. A white leaning line at x 1528-1536 running y 1838-1900 is the east end wall/corner seen obliquely, so east edge is +/-4. Estimated ground footprint: rect [1223,1807,1538,1851] (+/-8), hidden by trees; bluish patches north of the roof at x~1220-1245, 1305-1315, 1360-1375, 1515-1530 are white facade bays in shade. | SECOND READING: north, west and east edges agree within 1 px. South edge: a bright parapet line lies 6 to 11 px north of the stored edge (y 1175.5 on the north teaching slab, 1316.5 on the south one); the stored edge is the outer edge of a fainter strip south of it. Which of the two is the wall line cannot be told from the image.",
      "shape": "polygon",
      "points": [
        [
          142.5,
          75.6
        ],
        [
          229,
          75.6
        ],
        [
          229,
          87.7
        ],
        [
          142.5,
          87.7
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
      "measuredBy": "measurement agent (dorms), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 2.2,
      "correctedForObliqueView": true,
      "notes": "Rotated about 10 degrees anticlockwise from east-west (east end swung north): north roof edge runs y = 1952.5 - 0.1765*(x-1275), checked at x 1275, 1295, 1350, 1462. About 263 px long x 42 px deep = 72 x 11.5 m. South edge is +/-6: a dark strip (parapet shadow) lies just inside it and the parapet merges with bright pavement. East end shape (square or chamfered) uncertain, +/-6. Rooftop: white ribbed blocks around x 1385-1437, light-blue item at x 1437-1452. Its shaded north facade is visible obliquely north of the roof edge: 6 floor lines at 6.5-7 px pitch running parallel to this slab, and the white west end bay spans y 1917-1957 at x 1234-1246, giving a lean of ~41 px. Estimated ground footprint: [[1230,1920.5],[1489,1875],[1496,1916],[1237,1962]] (+/-8).",
      "shape": "polygon",
      "points": [
        [
          144.4,
          106.8
        ],
        [
          215.5,
          94.3
        ],
        [
          217.4,
          105.6
        ],
        [
          146.3,
          118.2
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
      "measuredBy": "measurement agent (dorms), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 1.9,
      "correctedForObliqueView": true,
      "notes": "White ring about 38 px = 10.4 m across, immediately east of the A south slab end and south of the link block. Top shows two concentric arcs like a spiral stair or ramp, C-shaped and open toward the north-west. Position is the top as seen; if it is as tall as the slabs its base is ~41 px further north. Height not established.",
      "shape": "circle",
      "cx": 232.8,
      "cz": 47.6,
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
      "measuredBy": "measurement agent (dorms), single reading; re-read by the independent second reading (2026-11): agrees within about 5 px",
      "positionAccuracyM": 1.9,
      "correctedForObliqueView": true,
      "notes": "Clean light ring, outer diameter ~35 px = 9.6 m (x 1490-1524), with a dark roughly octagonal centre of radius ~10.5 px (open well or dark roof). Sits at the east end of the rotated B south slab. Height not established; position is the top as seen.",
      "shape": "circle",
      "cx": 222.1,
      "cz": 97.9,
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
      "measuredBy": "measurement agent (dorms), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 2,
      "correctedForObliqueView": true,
      "notes": "Pale sunlit roof 28 x 28 px (7.7 x 7.7 m) closing the east end of the gap between the two A slabs, at roof level (a low roof could not appear here). White edge line along its east side x 1556-1560 running from y 1682 down to the round tower.",
      "shape": "polygon",
      "points": [
        [
          228.4,
          35.5
        ],
        [
          236.1,
          35.5
        ],
        [
          236.1,
          43.2
        ],
        [
          228.4,
          43.2
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
      "measuredBy": "measurement agent (dorms), single reading; not among the outlines the independent second reading (2026-11) reported on",
      "positionAccuracyM": 2.4,
      "correctedForObliqueView": true,
      "notes": "Pale surface about 29 x 21 px (8 x 5.8 m) between the SE corner of the B north slab and the round tower, same arrangement as block A. Edges are soft; dark diagonal lines run from (1500,1900) toward (1478,1925). Level not established, assumed roof level by analogy with A.",
      "shape": "polygon",
      "points": [
        [
          220.5,
          87.5
        ],
        [
          228.4,
          87.5
        ],
        [
          228.4,
          93.2
        ],
        [
          220.5,
          93.2
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
    },
    {
      "id": "new-teaching-building",
      "name": "New comprehensive teaching building north of the dome (2022 footage; library on a lower floor)",
      "kind": "building",
      "style": "new-building",
      "height": 23.4,
      "heightBasis": "6 storeys (city planning record) x 3.9 m; agrees with the length-to-height ratio of the north-west face, about 2.45 : 1, read from the 2022 footage (frame f_055) against its 55.6 m length on the satellite image",
      "solid": true,
      "walkUnder": false,
      "confidence": "roof outline re-read by the modelling agent (single reading); faces identified from the 2022 footage",
      "measuredBy": "modelling agent (library), gridded crops",
      "positionAccuracyM": 2.5,
      "correctedForObliqueView": true,
      "notes": "Corner order: west, north, east, south-east, south-west; the last edge (south-west to south-east) is the south face with the library entrance. The south edge bows about 1.5 m northward at mid-length (drawn straight). A triangular light well in the roof lies at about pixels (1343,822) (1399,786) (1425,822). CORRECTION: the first outline, read once by the main session, put the north-west edge 4 to 8 m too far out because it took part of the shadowed facade for roof. An earlier version of this note said that the satellite image predates this building and shows an older one on the site. That does not agree with the readings stored here: the outline, the 55.6 m face used for the height and the light well were all read on the mosaic, which at this place shows a five-sided roof with a triangular well and a terracotta strip along its north-west side, as the roof looks in the 2022 footage (frames 55-58). The date of the imagery was not checked. The outline is a single reading; treat it as approximate. The builder (src/world/builders/new-building.js) carries the same footprint in its own FOOT constant.",
      "shape": "polygon",
      "points": [
        [
          147.8,
          -205.7
        ],
        [
          194.5,
          -235.9
        ],
        [
          216,
          -211.5
        ],
        [
          214,
          -194.2
        ],
        [
          151.4,
          -188.9
        ]
      ]
    }
  ]
};
