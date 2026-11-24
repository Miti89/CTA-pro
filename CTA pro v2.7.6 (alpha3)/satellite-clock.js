// ==========================================================================
// MODULE: satellite-clock.js
// DESCRIPTION: Forensic Ōtsuka Lōtec No. 5 Kai (5号 改) Pure Vector SVG Engine
//              Ported from t-v1.2 design (Katayama square-geometric vector
//              numerals, 4-pad CNC Maltese satellites, 3-connected tri-wire
//              spring, unified Y-bridge, flared 4:18 pinion crown, double-layer
//              anti-backlash gear, 1h open-heart balance, 5:30 bow-tie sunburst
//              subdial, dual-rail 120° minute plate, flush steel chapter plates)
//              with Zero-Raster-Filter Retina sharpness for CTA Pro.
// ==========================================================================
(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const XLINK_NS = "http://www.w3.org/1999/xlink";
  const ORBIT_R = 53.2;
  const DISC_NUMS = [
    [12, 3, 6, 9],
    [1, 4, 7, 10],
    [2, 5, 8, 11]
  ];

  const TECH_FONT = "'Eurostile', 'DIN Alternate', 'Bahnschrift', 'Pretendard', -apple-system, sans-serif";

  // Custom Katayama technical square-geometric vector numeral glyphs (box: [-4.4..4.4] x [-6.9..6.9])
  const DIGIT_PATHS = {
    "0": "M -3.9,-4.9 Q -3.9,-6.9 -1.9,-6.9 L 1.9,-6.9 Q 3.9,-6.9 3.9,-4.9 L 3.9,4.9 Q 3.9,6.9 1.9,6.9 L -1.9,6.9 Q -3.9,6.9 -3.9,4.9 Z",
    "1": "M -2.3,-4.5 L 0.6,-6.9 L 0.6,6.9",
    "2": "M -4.1,-4.1 Q -4.1,-6.9 -1.4,-6.9 L 1.6,-6.9 Q 4.1,-6.9 4.1,-4.4 L 4.1,-1.8 Q 4.1,0.1 1.7,0.5 L -2.1,1.2 Q -4.1,1.7 -4.1,3.9 L -4.1,6.9 L 4.4,6.9",
    "3": "M -4.1,-6.9 L 1.9,-6.9 Q 4.1,-6.9 4.1,-4.7 L 4.1,-2.2 Q 4.1,-0.2 1.8,-0.2 L -1.2,-0.2 M 1.8,-0.2 Q 4.3,-0.2 4.3,2.2 L 4.3,4.7 Q 4.3,6.9 1.9,6.9 L -4.1,6.9",
    "4": "M 2.2,6.9 L 2.2,-6.9 L -4.3,2.1 L 4.6,2.1",
    "5": "M 4.1,-6.9 L -3.7,-6.9 L -3.9,-0.8 L 1.7,-0.8 Q 4.2,-0.8 4.2,1.6 L 4.2,4.7 Q 4.2,6.9 1.9,6.9 L -4.1,6.9",
    "6": "M 3.9,-5.2 Q 3.9,-6.9 1.9,-6.9 L -1.9,-6.9 Q -4.1,-6.9 -4.1,-4.5 L -4.1,4.7 Q -4.1,6.9 -1.9,6.9 L 1.9,6.9 Q 4.1,6.9 4.1,4.7 L 4.1,1.6 Q 4.1,-0.7 1.9,-0.7 L -4.1,-0.7",
    "7": "M -4.3,-5.0 L -4.3,-6.9 L 4.3,-6.9 L 4.3,-4.9 L -1.2,6.9",
    "8": "M -1.8,-6.9 L 1.8,-6.9 Q 3.9,-6.9 3.9,-4.7 L 3.9,-2.1 Q 3.9,-0.2 1.8,-0.2 L -1.8,-0.2 Q -3.9,-0.2 -3.9,-2.1 L -3.9,-4.7 Q -3.9,-6.9 -1.8,-6.9 Z M -2.0,-0.2 L 2.0,-0.2 Q 4.2,-0.2 4.2,2.1 L 4.2,4.7 Q 4.2,6.9 2.0,6.9 L -2.0,6.9 Q -4.2,6.9 -4.2,4.7 L -4.2,2.1 Q -4.2,-0.2 -2.0,-0.2 Z",
    "9": "M -3.9,5.2 Q -3.9,6.9 -1.9,6.9 L 1.9,6.9 Q 4.1,6.9 4.1,4.5 L 4.1,-4.7 Q 4.1,-6.9 1.9,-6.9 L -1.9,-6.9 Q -4.1,-6.9 -4.1,-4.7 L -4.1,-1.6 Q -4.1,0.7 -1.9,0.7 L 4.1,0.7"
  };

  let instanceSeq = 0;
  let activeInstance = null;

  function createSvgEl(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      const keys = Object.keys(attrs);
      for (let i = 0; i < keys.length; i++) {
        node.setAttribute(keys[i], String(attrs[keys[i]]));
      }
    }
    return node;
  }

  function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcSectorPath(cx, cy, rIn, rOut, startDeg, endDeg) {
    const p1 = polar(cx, cy, rIn, startDeg);
    const p2 = polar(cx, cy, rIn, endDeg);
    const p3 = polar(cx, cy, rOut, endDeg);
    const p4 = polar(cx, cy, rOut, startDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return [
      "M", p1[0].toFixed(2), p1[1].toFixed(2),
      "A", rIn, rIn, 0, largeArc, 1, p2[0].toFixed(2), p2[1].toFixed(2),
      "L", p3[0].toFixed(2), p3[1].toFixed(2),
      "A", rOut, rOut, 0, largeArc, 0, p4[0].toFixed(2), p4[1].toFixed(2),
      "Z"
    ].join(" ");
  }

  function arcLinePath(cx, cy, r, startDeg, endDeg, sweep) {
    const p1 = polar(cx, cy, r, startDeg);
    const p2 = polar(cx, cy, r, endDeg);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return [
      "M", p1[0].toFixed(2), p1[1].toFixed(2),
      "A", r, r, 0, largeArc, sweep ? 1 : 0, p2[0].toFixed(2), p2[1].toFixed(2)
    ].join(" ");
  }

  function snapEase(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function createGearPath(cx, cy, teeth, rOuter, rInner) {
    const parts = [];
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.22;
      const a2 = a0 + step * 0.48;
      const a3 = a0 + step * 0.70;
      const pts = [
        [cx + rInner * Math.cos(a0), cy + rInner * Math.sin(a0)],
        [cx + rOuter * Math.cos(a1), cy + rOuter * Math.sin(a1)],
        [cx + rOuter * Math.cos(a2), cy + rOuter * Math.sin(a2)],
        [cx + rInner * Math.cos(a3), cy + rInner * Math.sin(a3)]
      ];
      for (let j = 0; j < pts.length; j++) {
        parts.push((i === 0 && j === 0 ? "M" : "L") + pts[j][0].toFixed(2) + "," + pts[j][1].toFixed(2));
      }
    }
    parts.push("Z");
    return parts.join(" ");
  }

  function createSpiralPath(cx, cy, rStart, rEnd, turns, steps) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const angle = f * turns * Math.PI * 2 - Math.PI / 2;
      const r = rStart + (rEnd - rStart) * f;
      pts.push((i === 0 ? "M" : "L") + (cx + r * Math.cos(angle)).toFixed(2) + "," + (cy + r * Math.sin(angle)).toFixed(2));
    }
    return pts.join(" ");
  }

  // Unified continuous Y-shaped 3-Arm CNC Carousel Bridge path with smooth concave fillets
  function buildContinuousYBridgePath(cx, cy, tipCenterR, halfW, shoulderR, crotchR) {
    const armAngles = [-90, 30, 150];
    const segs = [];
    for (let i = 0; i < 3; i++) {
      const a = (armAngles[i] * Math.PI) / 180;
      const ux = Math.cos(a), uy = Math.sin(a);
      const vx = -uy, vy = ux;

      const lx0 = cx + shoulderR * ux - halfW * vx;
      const ly0 = cy + shoulderR * uy - halfW * vy;
      const lx1 = cx + tipCenterR * ux - halfW * vx;
      const ly1 = cy + tipCenterR * uy - halfW * vy;
      const rx1 = cx + tipCenterR * ux + halfW * vx;
      const ry1 = cy + tipCenterR * uy + halfW * vy;
      const rx0 = cx + shoulderR * ux + halfW * vx;
      const ry0 = cy + shoulderR * uy + halfW * vy;

      const nextA = (armAngles[(i + 1) % 3] * Math.PI) / 180;
      const nux = Math.cos(nextA), nuy = Math.sin(nextA);
      const nvx = -nuy, nvy = nux;
      const nlx0 = cx + shoulderR * nux - halfW * nvx;
      const nly0 = cy + shoulderR * nuy - halfW * nvy;

      const midA = ((armAngles[i] + 60) * Math.PI) / 180;
      const qx = cx + crotchR * Math.cos(midA);
      const qy = cy + crotchR * Math.sin(midA);

      if (i === 0) segs.push("M " + lx0.toFixed(2) + "," + ly0.toFixed(2));
      segs.push("L " + lx1.toFixed(2) + "," + ly1.toFixed(2));
      segs.push("A " + halfW.toFixed(2) + "," + halfW.toFixed(2) + " 0 0,1 " + rx1.toFixed(2) + "," + ry1.toFixed(2));
      segs.push("L " + rx0.toFixed(2) + "," + ry0.toFixed(2));
      segs.push("Q " + qx.toFixed(2) + "," + qy.toFixed(2) + " " + nlx0.toFixed(2) + "," + nly0.toFixed(2));
    }
    segs.push("Z");
    return segs.join(" ");
  }

  // Massive 4-pad CNC Maltese satellite wheel path with semicircular 8 o'clock roller notches
  function buildSatelliteWheelPath(rOuter, tabHalfW, shoulder, notchInset) {
    const rCorner = Math.sqrt(rOuter * rOuter - tabHalfW * tabHalfW);
    const dirs = [0, 90, 180, 270];
    const parts = [];
    for (let i = 0; i < 4; i++) {
      const a = (dirs[i] * Math.PI) / 180;
      const ux = Math.cos(a), uy = Math.sin(a);
      const vx = -uy, vy = ux;
      const pL0 = [shoulder * ux - tabHalfW * vx, shoulder * uy - tabHalfW * vy];
      const pL1 = [rCorner * ux - tabHalfW * vx, rCorner * uy - tabHalfW * vy];
      const pR1 = [rCorner * ux + tabHalfW * vx, rCorner * uy + tabHalfW * vy];
      const pR0 = [shoulder * ux + tabHalfW * vx, shoulder * uy + tabHalfW * vy];

      const na = (dirs[(i + 1) % 4] * Math.PI) / 180;
      const nux = Math.cos(na), nuy = Math.sin(na);
      const nvx = -nuy, nvy = nux;
      const npL0 = [shoulder * nux - tabHalfW * nvx, shoulder * nuy - tabHalfW * nvy];

      const ma = ((dirs[i] + 45) * Math.PI) / 180;
      const q = [notchInset * Math.cos(ma), notchInset * Math.sin(ma)];

      if (i === 0) parts.push("M " + pL0[0].toFixed(2) + "," + pL0[1].toFixed(2));
      parts.push("L " + pL1[0].toFixed(2) + "," + pL1[1].toFixed(2));
      parts.push("A " + rOuter.toFixed(1) + "," + rOuter.toFixed(1) + " 0 0,1 " + pR1[0].toFixed(2) + "," + pR1[1].toFixed(2));
      parts.push("L " + pR0[0].toFixed(2) + "," + pR0[1].toFixed(2));
      parts.push("Q " + q[0].toFixed(2) + "," + q[1].toFixed(2) + " " + npL0[0].toFixed(2) + "," + npL0[1].toFixed(2));
    }
    parts.push("Z");
    return parts.join(" ");
  }

  // 3-connected tri-symmetric polished steel wire spring assembly linking all 3 satellite valleys
  function buildTriConnectedWireSpring(uid) {
    const g = createSvgEl("g", { class: "satclk-tri-wire" });
    const valleys = [-30, 90, 210];
    const mainLoopParts = [];
    const stemPaths = [];
    const eyelets = [];

    for (let i = 0; i < 3; i++) {
      const a = valleys[i];
      const hubIn = polar(150, 150, 22.8, a - 15);
      const ctrlOut = polar(150, 150, 34.5, a - 6);
      const eye = polar(150, 150, 44.5, a);
      const ctrlBack = polar(150, 150, 34.5, a + 6);
      const hubOut = polar(150, 150, 22.8, a + 15);

      if (i === 0) {
        mainLoopParts.push("M " + hubIn[0].toFixed(2) + "," + hubIn[1].toFixed(2));
      } else {
        mainLoopParts.push("A 22.8,22.8 0 0,1 " + hubIn[0].toFixed(2) + "," + hubIn[1].toFixed(2));
      }
      mainLoopParts.push("Q " + ctrlOut[0].toFixed(2) + "," + ctrlOut[1].toFixed(2) + " " + eye[0].toFixed(2) + "," + eye[1].toFixed(2));
      mainLoopParts.push("Q " + ctrlBack[0].toFixed(2) + "," + ctrlBack[1].toFixed(2) + " " + hubOut[0].toFixed(2) + "," + hubOut[1].toFixed(2));

      const tipMid = polar(150, 150, 51.0, a - 1.5);
      const tipEnd = polar(150, 150, 56.5, a + 1.5);
      stemPaths.push(
        "M " + eye[0].toFixed(2) + "," + eye[1].toFixed(2) +
        " Q " + tipMid[0].toFixed(2) + "," + tipMid[1].toFixed(2) +
        " " + tipEnd[0].toFixed(2) + "," + tipEnd[1].toFixed(2)
      );
      eyelets.push({ eye: eye, tip: tipEnd });
    }
    const firstHubIn = polar(150, 150, 22.8, valleys[0] - 15);
    mainLoopParts.push("A 22.8,22.8 0 0,1 " + firstHubIn[0].toFixed(2) + "," + firstHubIn[1].toFixed(2) + " Z");
    const allWiresD = mainLoopParts.join(" ") + " " + stemPaths.join(" ");

    // Pure vector floating shadow underlay
    g.appendChild(createSvgEl("path", {
      d: allWiresD, fill: "none", stroke: "rgba(12,15,20,0.48)",
      "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round",
      transform: "translate(1.1, 1.5)"
    }));
    // Machined dark steel contour
    g.appendChild(createSvgEl("path", {
      d: allWiresD, fill: "none", stroke: "#404752",
      "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round"
    }));
    // Polished spring-steel body
    g.appendChild(createSvgEl("path", {
      d: allWiresD, fill: "none", stroke: "#E8EDF4",
      "stroke-width": "1.85", "stroke-linecap": "round", "stroke-linejoin": "round"
    }));
    // Specular white crown highlight
    g.appendChild(createSvgEl("path", {
      d: allWiresD, fill: "none", stroke: "rgba(255,255,255,0.95)",
      "stroke-width": "0.68", "stroke-linecap": "round", "stroke-linejoin": "round"
    }));

    for (let j = 0; j < eyelets.length; j++) {
      const ep = eyelets[j].eye;
      const tp = eyelets[j].tip;
      g.appendChild(createSvgEl("circle", {
        cx: ep[0].toFixed(2), cy: ep[1].toFixed(2), r: "2.9",
        fill: "url(#" + uid + "-screwHead)", stroke: "#3F4650", "stroke-width": "0.8"
      }));
      g.appendChild(createSvgEl("circle", {
        cx: ep[0].toFixed(2), cy: ep[1].toFixed(2), r: "1.1", fill: "#262B33"
      }));
      g.appendChild(createSvgEl("circle", {
        cx: tp[0].toFixed(2), cy: tp[1].toFixed(2), r: "1.5",
        fill: "#F2F5FA", stroke: "#454C56", "stroke-width": "0.55"
      }));
    }
    return g;
  }

  // Bold Katayama technical square-geometric vector numerals (1..12)
  function appendVectorHourNumeral(parent, num, cx, cy, deg) {
    const str = String(num);
    const g = createSvgEl("g", {
      transform: "translate(" + cx.toFixed(2) + ", " + cy.toFixed(2) + ") rotate(" + deg + ")"
    });
    if (str.length === 1) {
      g.appendChild(createSvgEl("path", {
        d: DIGIT_PATHS[str],
        fill: "none",
        stroke: "#111419",
        "stroke-width": "1.72",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        transform: "scale(1.48)"
      }));
    } else {
      const offsets = str === "11" ? [-4.0, 3.8] : [-5.1, 3.9];
      for (let i = 0; i < 2; i++) {
        g.appendChild(createSvgEl("path", {
          d: DIGIT_PATHS[str[i]],
          fill: "none",
          stroke: "#111419",
          "stroke-width": "1.82",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          transform: "translate(" + offsets[i] + ", 0) scale(1.12, 1.40)"
        }));
      }
    }
    parent.appendChild(g);
  }

  function appendSlottedScrew(parent, cx, cy, r, slotAngleDeg, withCountersink, uid) {
    const g = createSvgEl("g", { transform: "translate(" + cx.toFixed(2) + ", " + cy.toFixed(2) + ")" });
    if (withCountersink) {
      g.appendChild(createSvgEl("circle", {
        cx: "0", cy: "0", r: (r + 1.05).toFixed(2),
        fill: "#4A515B", stroke: "rgba(255,255,255,0.68)", "stroke-width": "0.55"
      }));
    }
    g.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: r.toFixed(2),
      fill: "url(#" + uid + "-screwHead)",
      stroke: "#525A65",
      "stroke-width": Math.max(0.55, r * 0.14).toFixed(2)
    }));
    g.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: (r * 0.84).toFixed(2),
      fill: "none", stroke: "rgba(255,255,255,0.66)", "stroke-width": "0.48"
    }));
    const sl = r * 0.84;
    g.appendChild(createSvgEl("line", {
      x1: (-sl).toFixed(2), y1: "0", x2: sl.toFixed(2), y2: "0",
      stroke: "#2C3139",
      "stroke-width": Math.max(0.68, r * 0.20).toFixed(2),
      "stroke-linecap": "butt",
      transform: "rotate(" + slotAngleDeg + ")"
    }));
    parent.appendChild(g);
  }

  // Flared conical knurled pinion crown at +39° (4:18) — pure vector shadow, zero SVG filter
  function buildFlaredPinionCrown(uid) {
    const CROWN_FLARE_D =
      "M 290.6,138.6 L 304.8,131.6 L 307.8,134.4 L 307.8,165.6 L 304.8,168.4 L 290.6,161.4 Z";

    const crownEl = createSvgEl("g", {
      class: "satclk-crown",
      transform: "rotate(39 150 150)"
    });

    // Pure vector soft shadow underlay
    crownEl.appendChild(createSvgEl("path", {
      d: CROWN_FLARE_D, fill: "rgba(18,22,28,0.24)", transform: "translate(1.4, 2.0)"
    }));

    // Recessed stepped cylindrical stem collar
    crownEl.appendChild(createSvgEl("rect", {
      x: "285.2", y: "142.8", width: "6.2", height: "14.4",
      fill: "url(#" + uid + "-crownNeck)", stroke: "#2F343C", "stroke-width": "0.85"
    }));
    crownEl.appendChild(createSvgEl("line", {
      x1: "290.2", y1: "143.0", x2: "290.2", y2: "157.0",
      stroke: "#1B1F25", "stroke-width": "1.0"
    }));

    // Protruding machined pinion teeth along top & bottom frustum silhouettes
    const rimTeeth = [
      "M 291.6,138.1 L 292.6,135.4 L 294.8,134.4 L 295.4,136.3",
      "M 295.6,136.1 L 296.8,133.2 L 299.1,132.1 L 299.7,134.1",
      "M 299.9,134.0 L 301.2,131.0 L 303.6,129.9 L 304.4,132.0",
      "M 304.2,131.8 L 305.5,129.8 L 307.4,131.2 L 307.4,134.4",
      "M 291.6,161.9 L 292.6,164.6 L 294.8,165.6 L 295.4,163.7",
      "M 295.6,163.9 L 296.8,166.8 L 299.1,167.9 L 299.7,165.9",
      "M 299.9,166.0 L 301.2,169.0 L 303.6,170.1 L 304.4,168.0",
      "M 304.2,168.2 L 305.5,170.2 L 307.4,168.8 L 307.4,165.6"
    ];
    rimTeeth.forEach(function (d) {
      crownEl.appendChild(createSvgEl("path", {
        d: d, fill: "url(#" + uid + "-steelCase)", stroke: "#343A43",
        "stroke-width": "0.78", "stroke-linejoin": "miter"
      }));
    });

    // Flared conical crown body
    crownEl.appendChild(createSvgEl("path", {
      d: CROWN_FLARE_D,
      fill: "url(#" + uid + "-crownCyl)",
      stroke: "#353B44",
      "stroke-width": "1.2",
      "stroke-linejoin": "miter"
    }));

    // Clipped fanned conical pinion flutes
    const clipG = createSvgEl("g", { "clip-path": "url(#" + uid + "-crownClip)" });
    const fluteCount = 13;
    for (let i = -1; i <= fluteCount + 1; i++) {
      const f = i / fluteCount;
      const yInner = 138.2 + f * 23.6;
      const yOuter = 131.2 + f * 37.6;
      clipG.appendChild(createSvgEl("line", {
        x1: "290.4", y1: yInner.toFixed(2), x2: "305.2", y2: yOuter.toFixed(2),
        stroke: "#21262D", "stroke-width": "1.25"
      }));
      clipG.appendChild(createSvgEl("line", {
        x1: "290.6", y1: (yInner + 1.05).toFixed(2), x2: "305.0", y2: (yOuter + 1.15).toFixed(2),
        stroke: "rgba(255,255,255,0.82)", "stroke-width": "0.8"
      }));
    }
    crownEl.appendChild(clipG);

    // Beveled flat crown end cap facet
    crownEl.appendChild(createSvgEl("polygon", {
      points: "304.8,131.6 307.8,134.4 307.8,165.6 304.8,168.4",
      fill: "url(#" + uid + "-steelCase)", opacity: "0.78", "pointer-events": "none"
    }));
    crownEl.appendChild(createSvgEl("line", { x1: "304.8", y1: "132.0", x2: "304.8", y2: "168.0", stroke: "#323841", "stroke-width": "1.0" }));
    crownEl.appendChild(createSvgEl("line", { x1: "305.9", y1: "133.4", x2: "305.9", y2: "166.6", stroke: "rgba(255,255,255,0.75)", "stroke-width": "0.8" }));
    crownEl.appendChild(createSvgEl("line", { x1: "290.8", y1: "139.0", x2: "290.8", y2: "161.0", stroke: "rgba(255,255,255,0.45)", "stroke-width": "0.65" }));

    return { crownEl: crownEl, crownClipD: CROWN_FLARE_D };
  }

  function buildClockSvg(uid) {
    const svg = createSvgEl("svg", {
      viewBox: "0 0 300 300",
      class: "satellite-clock-svg",
      "shape-rendering": "geometricPrecision",
      "text-rendering": "geometricPrecision",
      role: "img",
      "aria-hidden": "true"
    });

    const defs = createSvgEl("defs");
    const crownBuilt = buildFlaredPinionCrown(uid);

    function addStops(grad, stops) {
      for (let i = 0; i < stops.length; i++) {
        grad.appendChild(createSvgEl("stop", { offset: stops[i][0], "stop-color": stops[i][1] }));
      }
      defs.appendChild(grad);
    }

    addStops(createSvgEl("linearGradient", { id: uid + "-crownNeck", x1: "0%", y1: "0%", x2: "0%", y2: "100%" }), [
      ["0%", "#2A2F37"], ["32%", "#7E8792"], ["68%", "#4B525C"], ["100%", "#232830"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-crownCyl", x1: "0%", y1: "0%", x2: "0%", y2: "100%" }), [
      ["0%", "#323841"], ["18%", "#CFD6DF"], ["36%", "#FFFFFF"], ["58%", "#AEB7C2"], ["82%", "#58606B"], ["100%", "#262B33"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-plaqueSteel", x1: "10%", y1: "6%", x2: "90%", y2: "94%" }), [
      ["0%", "#E7EBF0"], ["42%", "#D6DCE3"], ["76%", "#C3CAD3"], ["100%", "#ADB5C0"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-steelCase", x1: "10%", y1: "4%", x2: "90%", y2: "96%" }), [
      ["0%", "#F5F7FA"], ["24%", "#CED4DC"], ["50%", "#EAEEF2"], ["76%", "#AFB8C2"], ["100%", "#87909B"]
    ]);

    // Vertical straight-brushed 316L hairline grain
    const pBrushed = createSvgEl("pattern", { id: uid + "-brushed316L", width: "2.8", height: "18", patternUnits: "userSpaceOnUse" });
    pBrushed.appendChild(createSvgEl("line", { x1: "0.6", y1: "0", x2: "0.6", y2: "18", stroke: "rgba(255,255,255,0.32)", "stroke-width": "0.5" }));
    pBrushed.appendChild(createSvgEl("line", { x1: "1.9", y1: "0", x2: "1.9", y2: "18", stroke: "rgba(38,43,50,0.12)", "stroke-width": "0.45" }));
    defs.appendChild(pBrushed);

    addStops(createSvgEl("radialGradient", { id: uid + "-mainplate", cx: "44%", cy: "38%", r: "68%" }), [
      ["0%", "#DCE1E7"], ["54%", "#C0C7D0"], ["86%", "#A2AAB5"], ["100%", "#8B939F"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-satinSilver", x1: "12%", y1: "8%", x2: "88%", y2: "92%" }), [
      ["0%", "#F5F7FA"], ["38%", "#E4E8ED"], ["72%", "#CFD5DD"], ["100%", "#B4BCC6"]
    ]);

    addStops(createSvgEl("radialGradient", { id: uid + "-paddleMetal", cx: "35%", cy: "28%", r: "75%" }), [
      ["0%", "#F8FAFC"], ["56%", "#E3E7ED"], ["86%", "#C5CCD5"], ["100%", "#A9B2BD"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-bridgeSteel", x1: "8%", y1: "6%", x2: "92%", y2: "94%" }), [
      ["0%", "#FAFBFD"], ["34%", "#E2E6EC"], ["68%", "#C3CAD3"], ["100%", "#9AA3AE"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-slotRecess", x1: "0%", y1: "0%", x2: "100%", y2: "0%" }), [
      ["0%", "#383E46"], ["30%", "#68707B"], ["74%", "#9BA3AE"], ["100%", "#C1C8D1"]
    ]);

    addStops(createSvgEl("radialGradient", { id: uid + "-screwHead", cx: "35%", cy: "30%", r: "70%" }), [
      ["0%", "#FFFFFF"], ["60%", "#D4DAE2"], ["100%", "#98A1AC"]
    ]);

    addStops(createSvgEl("radialGradient", { id: uid + "-sunburstBase", cx: "46%", cy: "42%", r: "62%" }), [
      ["0%", "#F4F6F9"], ["58%", "#DBE0E7"], ["100%", "#BEC6D0"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-brass", x1: "0%", y1: "0%", x2: "100%", y2: "100%" }), [
      ["0%", "#F6DA89"], ["48%", "#CC983C"], ["100%", "#825B18"]
    ]);

    addStops(createSvgEl("linearGradient", { id: uid + "-glassShine", x1: "6%", y1: "4%", x2: "94%", y2: "96%" }), [
      ["0%", "rgba(255,255,255,0.24)"],
      ["18%", "rgba(255,255,255,0.08)"],
      ["32%", "rgba(255,255,255,0)"],
      ["48%", "rgba(255,255,255,0.07)"],
      ["56%", "rgba(255,255,255,0)"],
      ["88%", "rgba(24,27,32,0.02)"],
      ["100%", "rgba(24,27,32,0.08)"]
    ]);

    addStops(createSvgEl("radialGradient", { id: uid + "-balWell", cx: "45%", cy: "40%", r: "66%" }), [
      ["0%", "#333842"], ["65%", "#20242B"], ["100%", "#15181D"]
    ]);

    // Clips (Zero SVG filters -> pure Retina crispness at any DPR/zoom)
    const clipDial = createSvgEl("clipPath", { id: uid + "-dialClip" });
    clipDial.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "129.0" }));
    defs.appendChild(clipDial);

    const clipBalWin = createSvgEl("clipPath", { id: uid + "-balWinClip" });
    clipBalWin.appendChild(createSvgEl("circle", { cx: "165", cy: "82", r: "22.0" }));
    defs.appendChild(clipBalWin);

    const clipCrown = createSvgEl("clipPath", { id: uid + "-crownClip" });
    clipCrown.appendChild(createSvgEl("path", { d: crownBuilt.crownClipD }));
    defs.appendChild(clipCrown);

    // Top-left ("CASPER™ · V1 ENGINE") & Bottom-left ("NO.1 PRO") curved flush chapter paths
    defs.appendChild(createSvgEl("path", { id: uid + "-topPlaquePath", d: arcLinePath(150, 150, 117.6, 194, 274, true) }));
    defs.appendChild(createSvgEl("path", { id: uid + "-botPlaquePath", d: arcLinePath(150, 150, 122.0, 154, 108, false) }));

    svg.appendChild(defs);

    // LAYER (1): Flared Conical Knurled Pinion Crown at 4:18 (+39°)
    svg.appendChild(crownBuilt.crownEl);

    // Razor-thin 316L straight-brushed steel bezel (r=138.5 -> 129.0)
    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "138.5", fill: "url(#" + uid + "-steelCase)", stroke: "#626A75", "stroke-width": "1.4" }));
    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "138.0", fill: "url(#" + uid + "-brushed316L)", opacity: "0.82" }));
    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "134.8", fill: "none", stroke: "rgba(255,255,255,0.56)", "stroke-width": "0.8" }));
    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "130.8", fill: "#69717C", stroke: "#454C55", "stroke-width": "0.85" }));
    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "129.0", fill: "url(#" + uid + "-mainplate)" }));

    const dialInner = createSvgEl("g", { "clip-path": "url(#" + uid + "-dialClip)" });

    // =========================================================================
    // LAYER (A): Bright Multi-Layer Machined Steel Mainplate + Openwork Cavities
    // =========================================================================
    const mainplateG = createSvgEl("g", { class: "satclk-mainplate" });
    mainplateG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "128.5", fill: "url(#" + uid + "-brushed316L)", opacity: "0.48" }));
    [117, 103, 91].forEach(function (rRing) {
      mainplateG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: String(rRing), fill: "none", stroke: "rgba(255,255,255,0.26)", "stroke-width": "0.7" }));
    });
    mainplateG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "83", fill: "#353B45", stroke: "#68707B", "stroke-width": "1.05" }));
    mainplateG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "82.0", fill: "url(#" + uid + "-brushed316L)", opacity: "0.20" }));
    mainplateG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "67", fill: "none", stroke: "rgba(255,255,255,0.14)", "stroke-width": "0.75" }));
    mainplateG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "54", fill: "#282D35", stroke: "#5D6570", "stroke-width": "0.9" }));
    mainplateG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "31", fill: "#3E4550", stroke: "#656D78", "stroke-width": "0.8" }));

    // =========================================================================
    // LAYER (B): 1 o'clock Open-Heart Balance Wheel, 3.5-Turn Spiral Hairspring,
    //            Balance Cock, Regulator Wire & Ruby Jewel
    // =========================================================================
    mainplateG.appendChild(createSvgEl("circle", { cx: "165", cy: "82", r: "24.0", fill: "url(#" + uid + "-satinSilver)", stroke: "#666E79", "stroke-width": "0.95" }));
    mainplateG.appendChild(createSvgEl("circle", { cx: "165", cy: "82", r: "22.0", fill: "url(#" + uid + "-balWell)", stroke: "#454C55", "stroke-width": "1.0" }));

    const balWindowClipG = createSvgEl("g", { "clip-path": "url(#" + uid + "-balWinClip)" });
    const balanceWheelG = createSvgEl("g", { transform: "translate(165, 82)" });
    balanceWheelG.appendChild(createSvgEl("path", {
      d: createSpiralPath(0, 0, 4.0, 12.6, 3.5, 96),
      fill: "none", stroke: "#C8D5E3", "stroke-width": "0.78", "stroke-linecap": "round", opacity: "0.94"
    }));
    balanceWheelG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "18.6", fill: "none", stroke: "url(#" + uid + "-brass)", "stroke-width": "3.1" }));
    balanceWheelG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "19.9", fill: "none", stroke: "rgba(255,244,204,0.52)", "stroke-width": "0.55" }));
    for (let bs = 0; bs < 3; bs++) {
      balanceWheelG.appendChild(createSvgEl("path", {
        d: "M -1.1,-4.2 L 1.1,-4.2 L 0.75,-17.8 L -0.75,-17.8 Z",
        fill: "url(#" + uid + "-brass)", transform: "rotate(" + (bs * 120) + ")"
      }));
    }
    balWindowClipG.appendChild(balanceWheelG);

    const balCockG = createSvgEl("g", { class: "satclk-balance-cock" });
    balCockG.appendChild(createSvgEl("path", {
      d: "M 181.5,61.5 L 188,68 L 171.5,85.5 A 6.0,6.0 0 1,1 161.5,76.5 Z",
      fill: "url(#" + uid + "-bridgeSteel)", stroke: "#525A64", "stroke-width": "0.85"
    }));
    balCockG.appendChild(createSvgEl("path", {
      d: "M 182.8,63.8 L 186.2,67.4 L 170.5,84.0",
      fill: "none", stroke: "rgba(255,255,255,0.72)", "stroke-width": "0.6"
    }));
    balCockG.appendChild(createSvgEl("circle", { cx: "165", cy: "82", r: "4.5", fill: "url(#" + uid + "-brass)", stroke: "#694A16", "stroke-width": "0.7" }));
    balCockG.appendChild(createSvgEl("circle", { cx: "165", cy: "82", r: "2.7", fill: "#C9332B", stroke: "#F5D98E", "stroke-width": "0.55" }));
    balCockG.appendChild(createSvgEl("circle", { cx: "164.1", cy: "81.1", r: "0.88", fill: "rgba(255,255,255,0.78)" }));
    balCockG.appendChild(createSvgEl("line", { x1: "169.2", y1: "78.2", x2: "177.2", y2: "70.8", stroke: "#454C55", "stroke-width": "0.8", "stroke-linecap": "round" }));
    balWindowClipG.appendChild(balCockG);
    mainplateG.appendChild(balWindowClipG);

    mainplateG.appendChild(createSvgEl("circle", { cx: "165", cy: "82", r: "22.2", fill: "none", stroke: "rgba(255,255,255,0.74)", "stroke-width": "0.85" }));
    appendSlottedScrew(mainplateG, 181.6, 63.5, 2.2, -38, false, uid);

    // =========================================================================
    // LAYER (C): 9:00~10:30 Double-Layer Anti-Backlash Reduction Gear Wheel
    //            (Recessed brass under-gear + 3-spoke steel wheel + wire springs)
    // =========================================================================
    const gearPrimaryG = createSvgEl("g", { transform: "translate(92, 134)" });
    const gearPrimaryRotor = createSvgEl("g", { class: "satclk-gear-primary" });
    gearPrimaryRotor.appendChild(createSvgEl("path", { d: createGearPath(0, 0, 28, 31.0, 27.6), fill: "url(#" + uid + "-brass)", stroke: "#7A591B", "stroke-width": "0.6", opacity: "0.86" }));
    gearPrimaryRotor.appendChild(createSvgEl("path", { d: createGearPath(0, 0, 30, 34.5, 31.2), fill: "url(#" + uid + "-satinSilver)", stroke: "#565E69", "stroke-width": "0.85" }));
    gearPrimaryRotor.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "26.2", fill: "#3A404A", stroke: "#87909B", "stroke-width": "0.9" }));
    for (let sp = 0; sp < 3; sp++) {
      gearPrimaryRotor.appendChild(createSvgEl("path", {
        d: arcLinePath(0, 0, 19.2, sp * 120 + 18, sp * 120 + 96, true),
        fill: "none", stroke: "#DCE2EA", "stroke-width": "1.25", "stroke-linecap": "round"
      }));
    }
    for (let s = 0; s < 3; s++) {
      gearPrimaryRotor.appendChild(createSvgEl("path", {
        d: "M -3.2,-26.5 L 3.2,-26.5 L 2.2,-7.5 L -2.2,-7.5 Z",
        fill: "url(#" + uid + "-bridgeSteel)", stroke: "#5A626D", "stroke-width": "0.65", transform: "rotate(" + (s * 120) + ")"
      }));
    }
    gearPrimaryRotor.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "8.6", fill: "url(#" + uid + "-bridgeSteel)", stroke: "#555D68", "stroke-width": "0.85" }));
    appendSlottedScrew(gearPrimaryRotor, 0, 0, 3.6, 20, false, uid);
    gearPrimaryG.appendChild(gearPrimaryRotor);
    mainplateG.appendChild(gearPrimaryG);

    const gearSecondaryG = createSvgEl("g", { transform: "translate(112, 102)" });
    const gearSecondaryRotor = createSvgEl("g", { class: "satclk-gear-secondary" });
    gearSecondaryRotor.appendChild(createSvgEl("path", { d: createGearPath(0, 0, 18, 19.0, 16.0), fill: "url(#" + uid + "-satinSilver)", stroke: "#5A626D", "stroke-width": "0.8" }));
    gearSecondaryRotor.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "12.2", fill: "#373D46", stroke: "#87909B", "stroke-width": "0.8" }));
    for (let s2 = 0; s2 < 4; s2++) {
      gearSecondaryRotor.appendChild(createSvgEl("line", { x1: "0", y1: "-11.5", x2: "0", y2: "11.5", stroke: "#E0E4EA", "stroke-width": "2.0", transform: "rotate(" + (s2 * 45) + ")" }));
    }
    gearSecondaryRotor.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "4.4", fill: "#EAEEF3", stroke: "#555D68", "stroke-width": "0.7" }));
    gearSecondaryG.appendChild(gearSecondaryRotor);
    mainplateG.appendChild(gearSecondaryG);

    // 8 o'clock roller mounting bracket
    mainplateG.appendChild(createSvgEl("path", {
      d: "M 48,184 Q 56,192 67,198 L 62,205 Q 50,198 42,189 Z",
      fill: "url(#" + uid + "-bridgeSteel)", stroke: "#555D68", "stroke-width": "0.8"
    }));
    appendSlottedScrew(mainplateG, 50.5, 191.5, 2.2, -32, false, uid);
    dialInner.appendChild(mainplateG);

    // =========================================================================
    // LAYER (D): 8 o'clock Custom MinebeaMitsumi 2.5mm Ball-Bearing Roller
    // =========================================================================
    const rollerOuterG = createSvgEl("g", { transform: "translate(66.5, 196.5)" });
    rollerOuterG.appendChild(createSvgEl("circle", { cx: "1.0", cy: "1.6", r: "8.0", fill: "rgba(18,22,28,0.28)" }));
    const rollerRotorG = createSvgEl("g", { class: "satclk-roller-bearing" });
    rollerRotorG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "7.6", fill: "url(#" + uid + "-steelCase)", stroke: "#4A525C", "stroke-width": "1.0" }));
    rollerRotorG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "6.6", fill: "none", stroke: "rgba(255,255,255,0.76)", "stroke-width": "0.55" }));
    rollerRotorG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "4.6", fill: "#272C34", stroke: "#B6BEC7", "stroke-width": "0.68" }));
    for (let rb = 0; rb < 8; rb++) {
      const rba = (rb * Math.PI * 2) / 8;
      rollerRotorG.appendChild(createSvgEl("circle", {
        cx: (3.25 * Math.cos(rba)).toFixed(2), cy: (3.25 * Math.sin(rba)).toFixed(2),
        r: "0.82", fill: "#F4F7FA", stroke: "#4E555F", "stroke-width": "0.22"
      }));
    }
    rollerRotorG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "2.1", fill: "#EEF1F5", stroke: "#505863", "stroke-width": "0.55" }));
    rollerRotorG.appendChild(createSvgEl("line", { x1: "-1.2", y1: "-0.6", x2: "1.2", y2: "0.6", stroke: "#434A53", "stroke-width": "0.58" }));
    rollerOuterG.appendChild(rollerRotorG);
    dialInner.appendChild(rollerOuterG);

    // =========================================================================
    // LAYER (E): 5:30 High-Contrast Bow-Tie Sunburst Small-Seconds Subdial
    //            + Curved Support Bridge Arm + Large Brushed Cap + 6h Red ▼
    // =========================================================================
    const secOuterG = createSvgEl("g", { transform: "translate(178, 223)" });
    secOuterG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "44.8", fill: "#353B44", stroke: "#68707B", "stroke-width": "1.1" }));
    secOuterG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "43.9", fill: "none", stroke: "rgba(255,255,255,0.56)", "stroke-width": "0.65" }));

    const secondsDiscG = createSvgEl("g", { class: "satclk-seconds-disc" });
    secondsDiscG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "42.6", fill: "url(#" + uid + "-sunburstBase)", stroke: "#7B838E", "stroke-width": "0.85" }));

    [
      [0, 38, "rgba(255,255,255,0.56)"],
      [46, 92, "rgba(42,48,58,0.24)"],
      [110, 148, "rgba(255,255,255,0.46)"],
      [172, 218, "rgba(42,48,58,0.26)"],
      [234, 274, "rgba(255,255,255,0.54)"],
      [296, 338, "rgba(42,48,58,0.22)"]
    ].forEach(function (w) {
      const q1 = polar(0, 0, 42.2, w[0]);
      const q2 = polar(0, 0, 42.2, w[1]);
      secondsDiscG.appendChild(createSvgEl("path", {
        d: "M 0,0 L " + q1[0].toFixed(2) + "," + q1[1].toFixed(2) + " A 42.2,42.2 0 0,1 " + q2[0].toFixed(2) + "," + q2[1].toFixed(2) + " Z",
        fill: w[2]
      }));
    });
    secondsDiscG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "35.6", fill: "none", stroke: "rgba(24,28,34,0.22)", "stroke-width": "0.65" }));

    for (let s = 0; s < 60; s++) {
      const deg = s * 6 - 90;
      const rad = (deg * Math.PI) / 180;
      const major = s % 5 === 0;
      const r1 = major ? 35.8 : 38.2;
      const r2 = 41.8;
      secondsDiscG.appendChild(createSvgEl("line", {
        x1: (r1 * Math.cos(rad)).toFixed(2), y1: (r1 * Math.sin(rad)).toFixed(2),
        x2: (r2 * Math.cos(rad)).toFixed(2), y2: (r2 * Math.sin(rad)).toFixed(2),
        stroke: "#12151A", "stroke-width": major ? "1.45" : "0.68", "stroke-linecap": "butt"
      }));
      if (major) {
        const rt = 29.2;
        const tx = rt * Math.cos(rad);
        const ty = rt * Math.sin(rad);
        const txt = createSvgEl("text", {
          x: tx.toFixed(1), y: ty.toFixed(1),
          "text-anchor": "middle", "dominant-baseline": "central",
          "font-family": TECH_FONT, "font-size": "6.8", "font-weight": "800",
          fill: "#12151A",
          transform: "rotate(" + (s * 6 + 180) + " " + tx.toFixed(1) + " " + ty.toFixed(1) + ")"
        });
        txt.textContent = s === 0 ? "60" : String(s).padStart(2, "0");
        secondsDiscG.appendChild(txt);
      }
    }
    secOuterG.appendChild(secondsDiscG);

    // Curved support bridge arm anchoring the central 5:30 cap from 7 o'clock
    secOuterG.appendChild(createSvgEl("path", {
      d: "M -45,13 Q -29,9.5 -17.5,3 L -15.5,-5.5 Q -28,-1.5 -44,2.5 Z",
      fill: "url(#" + uid + "-bridgeSteel)", stroke: "#505863", "stroke-width": "0.9"
    }));
    secOuterG.appendChild(createSvgEl("path", {
      d: "M -42,4.2 Q -28,0.6 -17,-3.6",
      fill: "none", stroke: "rgba(255,255,255,0.70)", "stroke-width": "0.6"
    }));
    appendSlottedScrew(secOuterG, -35.0, 6.2, 2.5, -18, false, uid);

    // Large brushed silver central cap (r=18.2) + 6h crimson red triangle + 1.5mm micro ball bearing
    secOuterG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "18.2", fill: "url(#" + uid + "-bridgeSteel)", stroke: "#525A65", "stroke-width": "1.05" }));
    secOuterG.appendChild(createSvgEl("path", { d: "M 0,0 L -9,-17 L 9,-17 Z M 0,0 L -9,17 L 9,17 Z", fill: "rgba(255,255,255,0.34)" }));
    secOuterG.appendChild(createSvgEl("path", { d: "M 0,0 L -17,-7 L -17,7 Z M 0,0 L 17,-7 L 17,7 Z", fill: "rgba(36,42,50,0.14)" }));
    secOuterG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "17.1", fill: "none", stroke: "rgba(255,255,255,0.72)", "stroke-width": "0.65" }));
    secOuterG.appendChild(createSvgEl("polygon", { points: "-3.8,8.0 3.8,8.0 0,15.6", fill: "#D42E26", stroke: "#7B1813", "stroke-width": "0.45" }));
    secOuterG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "4.8", fill: "#252A31", stroke: "#AEB6C1", "stroke-width": "0.8" }));
    for (let b = 0; b < 7; b++) {
      const ba = (b * Math.PI * 2) / 7;
      secOuterG.appendChild(createSvgEl("circle", {
        cx: (3.15 * Math.cos(ba)).toFixed(2), cy: (3.15 * Math.sin(ba)).toFixed(2),
        r: "0.86", fill: "#F6F9FC", stroke: "#444B55", "stroke-width": "0.24"
      }));
    }
    secOuterG.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "1.85", fill: "#F1F4F8", stroke: "#4C545F", "stroke-width": "0.52" }));
    dialInner.appendChild(secOuterG);

    // =========================================================================
    // LAYER (F): 3 MASSIVE 4-Pad CNC Maltese Satellite Hour Wheels (Katayama
    //            Vector Numerals 1..12) + 3-Connected Tri-Symmetric Steel Wire
    //            Spring + Unified Continuous Y-Shaped 3-Arm CNC Carousel Bridge
    // =========================================================================
    const satAssemblyG = createSvgEl("g", { class: "satclk-satellite-assembly" });
    const satWheelD = buildSatelliteWheelPath(43.8, 16.4, 25.0, 15.8);
    const satGroups = [];

    for (let k = 0; k < 3; k++) {
      const outer = createSvgEl("g", { "data-sat-disc": String(k) });
      const inner = createSvgEl("g");

      // Pure vector elevation shadow underlay (zero raster filter)
      inner.appendChild(createSvgEl("path", {
        d: satWheelD, fill: "rgba(18,22,28,0.24)", transform: "translate(1.1, 1.9) scale(1.012)"
      }));
      inner.appendChild(createSvgEl("path", {
        d: satWheelD, fill: "url(#" + uid + "-paddleMetal)", stroke: "#5B636E", "stroke-width": "0.95"
      }));
      inner.appendChild(createSvgEl("path", { d: satWheelD, fill: "url(#" + uid + "-brushed316L)", opacity: "0.46" }));
      inner.appendChild(createSvgEl("path", {
        d: satWheelD, fill: "none", stroke: "rgba(255,255,255,0.72)", "stroke-width": "0.62",
        transform: "scale(0.962)"
      }));

      for (let j = 0; j < 4; j++) {
        const num = DISC_NUMS[k][j];
        const deg = j * 90;
        const rad = (deg * Math.PI) / 180;
        const rTxt = 27.9;
        const tx = rTxt * Math.cos(rad);
        const ty = rTxt * Math.sin(rad);

        // Precision black index dash at outer tab rim
        inner.appendChild(createSvgEl("line", {
          x1: "39.6", y1: "0", x2: "43.5", y2: "0",
          stroke: "#111419", "stroke-width": "1.65", "stroke-linecap": "butt",
          transform: "rotate(" + deg + ")"
        }));

        // Katayama technical square-geometric vector numeral
        appendVectorHourNumeral(inner, num, tx, ty, deg);
      }

      inner.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "9.2", fill: "url(#" + uid + "-satinSilver)", stroke: "#626A75", "stroke-width": "0.85" }));
      appendSlottedScrew(inner, 0, 0, 5.2, 28 + k * 40, false, uid);

      outer.appendChild(inner);
      satAssemblyG.appendChild(outer);
      satGroups.push({ outer: outer, inner: inner });
    }

    // 3-Connected Tri-Symmetric Steel Wire Spring linking all 3 satellite valleys
    const triWireEl = buildTriConnectedWireSpring(uid);
    satAssemblyG.appendChild(triWireEl);

    // Unified Continuous Y-Shaped 3-Arm CNC Carousel Bridge
    const bridgeG = createSvgEl("g", { class: "satclk-carousel-bridge" });
    const yOuterD = buildContinuousYBridgePath(150, 150, ORBIT_R, 14.2, 24.4, 21.4);
    const yChamferD = buildContinuousYBridgePath(150, 150, ORBIT_R, 12.4, 23.8, 22.8);

    // Pure vector bridge shadow underlay
    bridgeG.appendChild(createSvgEl("path", {
      d: yOuterD, fill: "rgba(14,17,22,0.32)", transform: "translate(1.5, 2.6)"
    }));
    bridgeG.appendChild(createSvgEl("path", {
      d: yOuterD, fill: "url(#" + uid + "-bridgeSteel)", stroke: "#4E5661", "stroke-width": "1.15"
    }));
    bridgeG.appendChild(createSvgEl("path", { d: yOuterD, fill: "url(#" + uid + "-brushed316L)", opacity: "0.42" }));
    bridgeG.appendChild(createSvgEl("path", {
      d: yChamferD, fill: "none", stroke: "rgba(255,255,255,0.84)", "stroke-width": "0.9"
    }));

    for (let arm = 0; arm < 3; arm++) {
      const armG = createSvgEl("g", { transform: "rotate(" + (arm * 120) + " 150 150)" });
      armG.appendChild(createSvgEl("rect", {
        x: "147.1", y: "109.2", width: "5.8", height: "18.6", rx: "2.9",
        fill: "url(#" + uid + "-slotRecess)", stroke: "#434A53", "stroke-width": "0.8"
      }));
      armG.appendChild(createSvgEl("rect", {
        x: "147.9", y: "110.0", width: "4.2", height: "17.0", rx: "2.1",
        fill: "none", stroke: "rgba(255,255,255,0.48)", "stroke-width": "0.52"
      }));
      appendSlottedScrew(armG, 150, 150 - ORBIT_R, 8.8, 24 + arm * 35, true, uid);
      appendSlottedScrew(armG, 150, 133.2, 3.3, -32 + arm * 25, false, uid);
      bridgeG.appendChild(armG);
    }

    // Deep conical recessed central hub -> sunken matte-gold brass bushing & hollow bore
    bridgeG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "15.2", fill: "none", stroke: "rgba(255,255,255,0.72)", "stroke-width": "0.78" }));
    bridgeG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "12.2", fill: "#31363E", stroke: "#555D68", "stroke-width": "0.95" }));
    bridgeG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "9.6", fill: "url(#" + uid + "-brass)", stroke: "#5E4213", "stroke-width": "0.9" }));
    bridgeG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "5.2", fill: "url(#" + uid + "-steelCase)", stroke: "#464D56", "stroke-width": "0.75" }));
    bridgeG.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "2.3", fill: "#1F2329" }));

    satAssemblyG.appendChild(bridgeG);
    dialInner.appendChild(satAssemblyG);

    // =========================================================================
    // LAYER (G): Sleek Right Fixed 120° Minute Scale Plate (r=98.5..129.0,
    //            Inner & Outer Dual Tick Rails · Upright 0~60 Numerals)
    //            + Slim Flush Brushed-Steel Chapter Plaques:
    //              Top-Left: "CASPER™ · V1 ENGINE" | Bottom-Left: "NO.1 PRO"
    // =========================================================================
    const minutePlateG = createSvgEl("g", { class: "satclk-minute-plate" });
    const minPlateD = arcSectorPath(150, 150, 98.5, 129.0, -64.0, 64.5);
    minutePlateG.appendChild(createSvgEl("path", { d: minPlateD, fill: "rgba(18,22,28,0.22)", transform: "translate(-1.2, 1.8)" }));
    minutePlateG.appendChild(createSvgEl("path", { d: minPlateD, fill: "url(#" + uid + "-plaqueSteel)", stroke: "#565E69", "stroke-width": "1.1" }));
    minutePlateG.appendChild(createSvgEl("path", { d: minPlateD, fill: "url(#" + uid + "-brushed316L)", opacity: "0.38", "pointer-events": "none" }));

    // Inner & outer concentric instrument guide rails
    minutePlateG.appendChild(createSvgEl("path", { d: arcLinePath(150, 150, 99.4, -60, 60, true), fill: "none", stroke: "rgba(255,255,255,0.68)", "stroke-width": "0.6" }));
    minutePlateG.appendChild(createSvgEl("path", { d: arcLinePath(150, 150, 105.4, -60, 60, true), fill: "none", stroke: "#23272E", "stroke-width": "0.7" }));
    minutePlateG.appendChild(createSvgEl("path", { d: arcLinePath(150, 150, 122.4, -60, 60, true), fill: "none", stroke: "#23272E", "stroke-width": "0.7" }));

    // Dual inner + outer precision minute ticks (0..60) & crisp upright numerals (0, 5, 10, ..., 60)
    for (let m = 0; m <= 60; m++) {
      const deg = -60 + m * 2;
      const rad = (deg * Math.PI) / 180;
      const isMajor = m % 5 === 0;
      const isQuarter = m % 15 === 0;

      // Inner scale ticks (r = 99.2 .. 105.0)
      const rIn1 = 99.2;
      const rOut1 = isMajor ? 105.0 : 103.0;
      minutePlateG.appendChild(createSvgEl("line", {
        x1: (150 + rIn1 * Math.cos(rad)).toFixed(2), y1: (150 + rIn1 * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut1 * Math.cos(rad)).toFixed(2), y2: (150 + rOut1 * Math.sin(rad)).toFixed(2),
        stroke: "#12151A", "stroke-width": isMajor ? "1.6" : "0.76", "stroke-linecap": "butt"
      }));

      // Outer precision scale ticks (r = 122.8 .. 127.4)
      const rIn2 = 122.8;
      const rOut2 = isMajor ? 127.4 : 125.4;
      minutePlateG.appendChild(createSvgEl("line", {
        x1: (150 + rIn2 * Math.cos(rad)).toFixed(2), y1: (150 + rIn2 * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut2 * Math.cos(rad)).toFixed(2), y2: (150 + rOut2 * Math.sin(rad)).toFixed(2),
        stroke: "#1C2026", "stroke-width": isMajor ? "1.25" : "0.66", "stroke-linecap": "butt"
      }));

      if (isMajor) {
        const rTxt = 114.0;
        const tx = 150 + rTxt * Math.cos(rad);
        const ty = 150 + rTxt * Math.sin(rad);
        const mTxt = createSvgEl("text", {
          x: tx.toFixed(1), y: ty.toFixed(1),
          "text-anchor": "middle", "dominant-baseline": "central",
          "font-family": TECH_FONT,
          "font-size": isQuarter ? "9.8" : "8.9",
          "font-weight": "800",
          "letter-spacing": "-0.2",
          fill: "#111419"
        });
        mTxt.textContent = String(m);
        minutePlateG.appendChild(mTxt);
      }
    }
    dialInner.appendChild(minutePlateG);

    // Slim Flush Brushed-Steel Arch Chapter Plates (r=110.5..128.8)
    const plaquesG = createSvgEl("g", { class: "satclk-engravings" });

    // Top-Left Flush Chapter Arch: "CASPER™ · V1 ENGINE"
    const topPlaqueD = arcSectorPath(150, 150, 110.5, 128.8, 193, 275);
    plaquesG.appendChild(createSvgEl("path", { d: topPlaqueD, fill: "rgba(18,22,28,0.18)", transform: "translate(1.0, 1.5)" }));
    plaquesG.appendChild(createSvgEl("path", { d: topPlaqueD, fill: "url(#" + uid + "-plaqueSteel)", stroke: "#565E69", "stroke-width": "0.95" }));
    plaquesG.appendChild(createSvgEl("path", { d: topPlaqueD, fill: "url(#" + uid + "-brushed316L)", opacity: "0.40" }));
    plaquesG.appendChild(createSvgEl("path", { d: arcLinePath(150, 150, 111.7, 194, 274, true), fill: "none", stroke: "rgba(255,255,255,0.68)", "stroke-width": "0.6" }));

    const topEngraving = createSvgEl("text", {
      "font-family": TECH_FONT, "font-size": "8.2", "font-weight": "900",
      fill: "#13161B", "letter-spacing": "0.9"
    });
    const topEngravingPath = createSvgEl("textPath", { href: "#" + uid + "-topPlaquePath", startOffset: "50%", "text-anchor": "middle" });
    topEngravingPath.setAttributeNS(XLINK_NS, "xlink:href", "#" + uid + "-topPlaquePath");
    topEngravingPath.textContent = "CASPER™ · V1 ENGINE";
    topEngraving.appendChild(topEngravingPath);
    plaquesG.appendChild(topEngraving);

    // Bottom-Left Flush Chapter Arch: "NO.1 PRO"
    const botPlaqueD = arcSectorPath(150, 150, 110.5, 128.8, 107, 156);
    plaquesG.appendChild(createSvgEl("path", { d: botPlaqueD, fill: "rgba(18,22,28,0.18)", transform: "translate(1.0, 1.4)" }));
    plaquesG.appendChild(createSvgEl("path", { d: botPlaqueD, fill: "url(#" + uid + "-plaqueSteel)", stroke: "#565E69", "stroke-width": "0.95" }));
    plaquesG.appendChild(createSvgEl("path", { d: botPlaqueD, fill: "url(#" + uid + "-brushed316L)", opacity: "0.40" }));
    plaquesG.appendChild(createSvgEl("path", { d: arcLinePath(150, 150, 111.7, 108, 155, true), fill: "none", stroke: "rgba(255,255,255,0.68)", "stroke-width": "0.6" }));

    const botEngraving = createSvgEl("text", {
      "font-family": TECH_FONT, "font-size": "8.5", "font-weight": "900",
      fill: "#13161B", "letter-spacing": "1.0"
    });
    const botEngravingPath = createSvgEl("textPath", { href: "#" + uid + "-botPlaquePath", startOffset: "50%", "text-anchor": "middle" });
    botEngravingPath.setAttributeNS(XLINK_NS, "xlink:href", "#" + uid + "-botPlaquePath");
    botEngravingPath.textContent = "NO.1 PRO";
    botEngraving.appendChild(botEngravingPath);
    plaquesG.appendChild(botEngraving);
    dialInner.appendChild(plaquesG);

    // =========================================================================
    // LAYER (H): 4.6mm High-Profile Box Sapphire Crystal Optical Refraction Rim
    // =========================================================================
    dialInner.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "129.0", fill: "url(#" + uid + "-glassShine)", "pointer-events": "none" }));
    dialInner.appendChild(createSvgEl("path", { d: "M 48,76 Q 112,30 192,38 Q 128,60 66,112 Z", fill: "rgba(255,255,255,0.11)", "pointer-events": "none" }));
    svg.appendChild(dialInner);

    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "129.0", fill: "none", stroke: "rgba(255,255,255,0.54)", "stroke-width": "1.6", "pointer-events": "none" }));
    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "126.8", fill: "none", stroke: "rgba(255,255,255,0.22)", "stroke-width": "1.1", "pointer-events": "none" }));
    svg.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "125.2", fill: "none", stroke: "rgba(32,36,42,0.11)", "stroke-width": "0.6", "pointer-events": "none" }));

    return {
      svg: svg,
      satGroups: satGroups,
      triWireEl: triWireEl,
      bridgeG: bridgeG,
      secondsDiscG: secondsDiscG,
      balanceWheelG: balanceWheelG,
      rollerRotorG: rollerRotorG,
      gearPrimaryRotor: gearPrimaryRotor,
      gearSecondaryRotor: gearSecondaryRotor
    };
  }

  function mount(containerEl, options) {
    if (!containerEl) return null;
    const opts = options || {};
    const uid = "satclk" + (++instanceSeq);
    const faceEl = typeof opts.faceEl === "string"
      ? document.querySelector(opts.faceEl)
      : (opts.faceEl || document.getElementById("drumFaceSettings"));
    const onTick = typeof opts.onTick === "function" ? opts.onTick : null;
    const onModeChange = typeof opts.onModeChange === "function" ? opts.onModeChange : null;

    containerEl.textContent = "";
    const parts = buildClockSvg(uid);
    containerEl.appendChild(parts.svg);

    let fastMode = false;
    let simEpochMs = Date.now();
    let lastFrameMs = performance.now();
    let rafId = null;
    let reducedTimerId = null;
    let destroyed = false;
    let frameCount = 0;
    let manualActiveOverride = null;
    let lastState = null;

    const reducedMotionMQ = global.matchMedia
      ? global.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    function isReducedMotion() {
      return !!(reducedMotionMQ && reducedMotionMQ.matches);
    }

    function isFaceVisible() {
      if (manualActiveOverride !== null) return manualActiveOverride;
      if (!faceEl) return true;
      return faceEl.classList.contains("is-active");
    }

    function shouldAnimate() {
      return !destroyed && !document.hidden && isFaceVisible();
    }

    function renderFrame(nowPerf, advanceSim) {
      const dt = Math.min(100, Math.max(0, nowPerf - lastFrameMs));
      lastFrameMs = nowPerf;

      if (fastMode) {
        if (advanceSim) {
          simEpochMs += dt * 600; // 600× speed: 6s = 1 hour, 1s = 10 minutes
        }
      } else {
        simEpochMs = Date.now();
      }

      const d = new Date(simEpochMs);
      const h24 = d.getHours();
      const h12 = h24 % 12;
      const m = d.getMinutes();
      const s = d.getSeconds();
      const ms = d.getMilliseconds();

      // Miyota 90S5 4Hz (0.125s) quantized mechanical sweep in live mode; continuous in 600× mode
      const sSweep = fastMode
        ? (s + ms / 1000)
        : (s + Math.floor(ms / 125) * 0.125);
      const tHours = h12 + m / 60 + sSweep / 3600;

      // 1. Central unified Y-bridge + 3-connected tri-symmetric steel wire spring rotation
      const carouselDeg = tHours * 120 + 30;
      const carouselRot = "rotate(" + carouselDeg.toFixed(3) + " 150 150)";
      parts.bridgeG.setAttribute("transform", carouselRot);
      parts.triWireEl.setAttribute("transform", carouselRot);

      // 2. 3 massive 4-pad CNC Maltese satellites: 120°/hr CW orbit + 8 o'clock roller 90° snap indexing
      const satellites = [];
      let rollerSpinAccum = 0;
      for (let k = 0; k < 3; k++) {
        const orbitDeg = tHours * 120 - 60 - k * 120;
        const rad = (orbitDeg * Math.PI) / 180;
        const x = 150 + ORBIT_R * Math.cos(rad);
        const y = 150 + ORBIT_R * Math.sin(rad);

        const diff = tHours - k;
        const cycle = Math.floor(diff / 3);
        const u = ((diff % 3) + 3) % 3;
        const rawProg = Math.max(0, Math.min(1, (u - 1.45) / 0.6));
        const easedProg = snapEase(rawProg);
        const localSpinDeg = -90 * (cycle + easedProg);

        if (u >= 1.45 && u <= 2.05) {
          rollerSpinAccum += easedProg * 180;
        }

        parts.satGroups[k].outer.setAttribute(
          "transform",
          "translate(" + x.toFixed(2) + ", " + y.toFixed(2) + ") rotate(" + orbitDeg.toFixed(3) + ")"
        );
        parts.satGroups[k].inner.setAttribute("transform", "rotate(" + localSpinDeg.toFixed(3) + ")");
        satellites.push({
          k: k,
          orbitDeg: Number(orbitDeg.toFixed(2)),
          localSpinDeg: Number(localSpinDeg.toFixed(2)),
          u: Number(u.toFixed(3)),
          indexing: u >= 1.45 && u <= 2.05
        });
      }

      // 3. 8 o'clock roller bearing engagement rotation
      parts.rollerRotorG.setAttribute("transform", "rotate(" + rollerSpinAccum.toFixed(1) + ")");

      // 4. 5:30 bow-tie sunburst small seconds disc (central 6 o'clock crimson red pointer -> 180 - 6*sSweep)
      const secDeg = 180 - 6 * sSweep;
      parts.secondsDiscG.setAttribute("transform", "rotate(" + secDeg.toFixed(2) + ")");

      // 5. 1 o'clock brass balance wheel 4Hz oscillation + 9~10 o'clock double-layer reduction gear train
      const balDeg = isReducedMotion() ? 0 : Math.sin(nowPerf * 0.02513274) * 18;
      parts.balanceWheelG.setAttribute("transform", "translate(165, 82) rotate(" + balDeg.toFixed(1) + ")");
      const gearDeg = (tHours * 360) % 360;
      parts.gearPrimaryRotor.setAttribute("transform", "rotate(" + gearDeg.toFixed(2) + ")");
      parts.gearSecondaryRotor.setAttribute("transform", "rotate(" + (-gearDeg * 1.333).toFixed(2) + ")");

      const activeDisc = h12 % 3;
      const dispHour = h12 === 0 ? 12 : h12;
      frameCount += 1;

      lastState = {
        date: d,
        h24: h24,
        h12: h12,
        dispHour: dispHour,
        m: m,
        s: s,
        ms: ms,
        sSweep: Number(sSweep.toFixed(3)),
        tHours: Number(tHours.toFixed(5)),
        activeDisc: activeDisc,
        activeDiscNum: activeDisc + 1,
        fastMode: fastMode,
        rafActive: rafId !== null,
        reducedMode: isReducedMotion(),
        frameCount: frameCount,
        satellites: satellites
      };

      if (onTick) {
        onTick(lastState);
      }
      return lastState;
    }

    function stopLoop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (reducedTimerId !== null) {
        clearInterval(reducedTimerId);
        reducedTimerId = null;
      }
      if (lastState) {
        lastState.rafActive = false;
      }
    }

    function rafStep(nowPerf) {
      if (!shouldAnimate() || isReducedMotion()) {
        stopLoop();
        return;
      }
      renderFrame(nowPerf, true);
      rafId = requestAnimationFrame(rafStep);
      if (lastState) lastState.rafActive = true;
    }

    function syncLoopState() {
      if (!shouldAnimate()) {
        stopLoop();
        return;
      }
      lastFrameMs = performance.now();
      if (isReducedMotion()) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        if (reducedTimerId === null) {
          renderFrame(performance.now(), false);
          reducedTimerId = setInterval(() => {
            if (!shouldAnimate()) {
              stopLoop();
              return;
            }
            renderFrame(performance.now(), true);
          }, 1000);
        }
      } else {
        if (reducedTimerId !== null) {
          clearInterval(reducedTimerId);
          reducedTimerId = null;
        }
        if (rafId === null) {
          rafId = requestAnimationFrame(rafStep);
        }
      }
    }

    function handleVisibilityChange() {
      syncLoopState();
    }

    function handleReducedMotionChange() {
      stopLoop();
      syncLoopState();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (reducedMotionMQ) {
      if (typeof reducedMotionMQ.addEventListener === "function") {
        reducedMotionMQ.addEventListener("change", handleReducedMotionChange);
      } else if (typeof reducedMotionMQ.addListener === "function") {
        reducedMotionMQ.addListener(handleReducedMotionChange);
      }
    }

    let classObserver = null;
    if (faceEl && typeof MutationObserver !== "undefined") {
      classObserver = new MutationObserver(() => {
        manualActiveOverride = null;
        syncLoopState();
      });
      classObserver.observe(faceEl, { attributes: true, attributeFilter: ["class"] });
    }

    renderFrame(performance.now(), false);
    syncLoopState();

    const api = {
      setActive: function (isActive) {
        manualActiveOverride = !!isActive;
        if (isActive) {
          lastFrameMs = performance.now();
          renderFrame(lastFrameMs, false);
        }
        syncLoopState();
      },
      setFastMode: function (enabled) {
        const next = !!enabled;
        if (next === fastMode) return fastMode;
        fastMode = next;
        lastFrameMs = performance.now();
        simEpochMs = Date.now();
        renderFrame(lastFrameMs, false);
        if (onModeChange) onModeChange(fastMode);
        syncLoopState();
        return fastMode;
      },
      toggleFastMode: function () {
        return api.setFastMode(!fastMode);
      },
      isFastMode: function () {
        return fastMode;
      },
      isRunning: function () {
        return rafId !== null || reducedTimerId !== null;
      },
      isRafActive: function () {
        return rafId !== null;
      },
      renderNow: function () {
        return renderFrame(performance.now(), false);
      },
      getState: function () {
        return lastState;
      },
      destroy: function () {
        destroyed = true;
        stopLoop();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        if (reducedMotionMQ) {
          if (typeof reducedMotionMQ.removeEventListener === "function") {
            reducedMotionMQ.removeEventListener("change", handleReducedMotionChange);
          } else if (typeof reducedMotionMQ.removeListener === "function") {
            reducedMotionMQ.removeListener(handleReducedMotionChange);
          }
        }
        if (classObserver) {
          classObserver.disconnect();
          classObserver = null;
        }
        if (activeInstance === api) activeInstance = null;
      }
    };

    activeInstance = api;
    return api;
  }

  global.SatelliteClock = {
    version: "3.0.0",
    mount: mount,
    getInstance: function () {
      return activeInstance;
    }
  };
})(typeof window !== "undefined" ? window : this);
