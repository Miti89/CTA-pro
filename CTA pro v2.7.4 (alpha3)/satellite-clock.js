// ==========================================================================
// MODULE: satellite-clock.js
// DESCRIPTION: Ōtsuka Lōtec No. 5 Kai (5号 改) Wandering / Satellite Hour
//              Raw CNC Silver Steel Monolith Horological SVG Module for CTA Pro
// ENGINE: Pure SVG (viewBox 0 0 300 300), Zero-Build, file:// Compatible
// ==========================================================================
(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const XLINK_NS = "http://www.w3.org/1999/xlink";
  const ORBIT_R = 53;
  const DISC_NUMS = [
    [12, 3, 6, 9],
    [1, 4, 7, 10],
    [2, 5, 8, 11]
  ];

  // Industrial semi-square gothic typography stack (Eurostile / DIN aesthetic)
  const IND_FONT = "'DIN Alternate', 'Eurostile', 'Arial Narrow', 'Pretendard', -apple-system, sans-serif";

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
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts.push((i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2));
    }
    return pts.join(" ");
  }

  // Sculptural 4-Arm CNC Cross-Paddle path (outer radius R≈37.5, concave scalloped cutouts at 45°/135°/225°/315°)
  const CROSS_PADDLE_OUTER_D =
    "M 13.8,-13.8 C 20.5,-12.8 28.5,-11.8 34.6,-10.2 Q 37.6,-9.3 37.6,0 Q 37.6,9.3 34.6,10.2 C 28.5,11.8 20.5,12.8 13.8,13.8 " +
    "C 12.8,20.5 11.8,28.5 10.2,34.6 Q 9.3,37.6 0,37.6 Q -9.3,37.6 -10.2,34.6 C -11.8,28.5 -12.8,20.5 -13.8,13.8 " +
    "C -20.5,12.8 -28.5,11.8 -34.6,10.2 Q -37.6,9.3 -37.6,0 Q -37.6,-9.3 -34.6,-10.2 C -28.5,-11.8 -20.5,-12.8 -13.8,-13.8 " +
    "C -12.8,-20.5 -11.8,-28.5 -10.2,-34.6 Q -9.3,-37.6 0,-37.6 Q 9.3,-37.6 10.2,-34.6 C 11.8,-28.5 12.8,-20.5 13.8,-13.8 Z";

  function appendSlottedScrew(parent, cx, cy, r, slotAngleDeg, uid) {
    const g = createSvgEl("g", { transform: "translate(" + cx.toFixed(2) + ", " + cy.toFixed(2) + ")" });
    g.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: r.toFixed(2),
      fill: "url(#" + uid + "-screwHead)",
      stroke: "#5A626D",
      "stroke-width": Math.max(0.55, r * 0.16).toFixed(2)
    }));
    g.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: (r * 0.8).toFixed(2),
      fill: "none",
      stroke: "rgba(255,255,255,0.58)",
      "stroke-width": "0.45"
    }));
    const sl = r * 0.78;
    g.appendChild(createSvgEl("line", {
      x1: (-sl).toFixed(2), y1: "0", x2: sl.toFixed(2), y2: "0",
      stroke: "#363C44",
      "stroke-width": Math.max(0.65, r * 0.22).toFixed(2),
      "stroke-linecap": "round",
      transform: "rotate(" + slotAngleDeg + ")"
    }));
    parent.appendChild(g);
  }

  function buildClockSvg(uid) {
    const svg = createSvgEl("svg", {
      viewBox: "0 0 300 300",
      class: "satellite-clock-svg",
      role: "img",
      "aria-hidden": "true"
    });

    const defs = createSvgEl("defs");

    // 316L straight-brushed steel bezel gradient (bright raw CNC steel)
    const gSteelCase = createSvgEl("linearGradient", {
      id: uid + "-steelCase",
      x1: "10%", y1: "6%", x2: "90%", y2: "94%"
    });
    [
      ["0%", "#F5F7F9"],
      ["24%", "#CFD5DC"],
      ["48%", "#E9EDF1"],
      ["72%", "#B2BAC4"],
      ["100%", "#8B939E"]
    ].forEach(([offset, color]) => {
      gSteelCase.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gSteelCase);

    // Fine straight-brushed 316L hairline pattern
    const pBrushed = createSvgEl("pattern", {
      id: uid + "-brushed316L",
      width: "18",
      height: "2.6",
      patternUnits: "userSpaceOnUse"
    });
    pBrushed.appendChild(createSvgEl("line", {
      x1: "0", y1: "0.5", x2: "18", y2: "0.5",
      stroke: "rgba(255,255,255,0.30)", "stroke-width": "0.5"
    }));
    pBrushed.appendChild(createSvgEl("line", {
      x1: "0", y1: "1.7", x2: "18", y2: "1.7",
      stroke: "rgba(42,46,52,0.12)", "stroke-width": "0.45"
    }));
    defs.appendChild(pBrushed);

    // Bright raw CNC aluminum/steel mainplate (light silver monolith, NOT dark black)
    const gMainplate = createSvgEl("radialGradient", {
      id: uid + "-mainplate",
      cx: "42%", cy: "36%", r: "68%"
    });
    [
      ["0%", "#DCE1E7"],
      ["52%", "#C2C9D2"],
      ["85%", "#A6AEB8"],
      ["100%", "#8F97A2"]
    ].forEach(([offset, color]) => {
      gMainplate.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gMainplate);

    // Satin silver plate gradient (minute scale, arch plaques, cross paddles)
    const gSatinSilver = createSvgEl("linearGradient", {
      id: uid + "-satinSilver",
      x1: "12%", y1: "8%", x2: "88%", y2: "92%"
    });
    [
      ["0%", "#F4F6F9"],
      ["35%", "#E3E7EC"],
      ["68%", "#CFD5DD"],
      ["100%", "#B4BCC6"]
    ].forEach(([offset, color]) => {
      gSatinSilver.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gSatinSilver);

    // Cross-paddle radial CNC sheen
    const gPaddleMetal = createSvgEl("radialGradient", {
      id: uid + "-paddleMetal",
      cx: "36%", cy: "30%", r: "74%"
    });
    [
      ["0%", "#F6F8FA"],
      ["55%", "#E2E6EC"],
      ["86%", "#C6CDD6"],
      ["100%", "#ABB3BE"]
    ].forEach(([offset, color]) => {
      gPaddleMetal.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gPaddleMetal);

    // Heavy CNC milled 3-arm carousel bridge gradient
    const gBridgeSteel = createSvgEl("linearGradient", {
      id: uid + "-bridgeSteel",
      x1: "0%", y1: "0%", x2: "100%", y2: "100%"
    });
    [
      ["0%", "#F8FAFC"],
      ["32%", "#E1E5EB"],
      ["66%", "#C2C9D2"],
      ["100%", "#9BA3AE"]
    ].forEach(([offset, color]) => {
      gBridgeSteel.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gBridgeSteel);

    // Deeply milled pill-slot interior shadow gradient
    const gSlotRecess = createSvgEl("linearGradient", {
      id: uid + "-slotRecess",
      x1: "0%", y1: "0%", x2: "100%", y2: "0%"
    });
    [
      ["0%", "#3B4048"],
      ["32%", "#6A717B"],
      ["76%", "#99A1AC"],
      ["100%", "#B8C0CA"]
    ].forEach(([offset, color]) => {
      gSlotRecess.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gSlotRecess);

    // Screw head gradient
    const gScrewHead = createSvgEl("radialGradient", {
      id: uid + "-screwHead",
      cx: "35%", cy: "30%", r: "70%"
    });
    [
      ["0%", "#FAFBFC"],
      ["60%", "#D3D9E0"],
      ["100%", "#9AA2AD"]
    ].forEach(([offset, color]) => {
      gScrewHead.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gScrewHead);

    // Sunburst silver base for 5:30 small seconds disc
    const gSunburstBase = createSvgEl("radialGradient", {
      id: uid + "-sunburstBase",
      cx: "46%", cy: "42%", r: "60%"
    });
    [
      ["0%", "#F3F5F8"],
      ["58%", "#DCE1E8"],
      ["100%", "#C1C8D1"]
    ].forEach(([offset, color]) => {
      gSunburstBase.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gSunburstBase);

    // Chromatic Accent #1: Brass balance wheel & recessed center bushing
    const gBrass = createSvgEl("linearGradient", {
      id: uid + "-brass",
      x1: "0%", y1: "0%", x2: "100%", y2: "100%"
    });
    [
      ["0%", "#F4D684"],
      ["48%", "#CA963C"],
      ["100%", "#855D1B"]
    ].forEach(([offset, color]) => {
      gBrass.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gBrass);

    // 4.6mm Box sapphire crystal diagonal reflection & subtle depth
    const gGlass = createSvgEl("linearGradient", {
      id: uid + "-glassShine",
      x1: "6%", y1: "4%", x2: "94%", y2: "96%"
    });
    [
      ["0%", "rgba(255,255,255,0.26)"],
      ["18%", "rgba(255,255,255,0.09)"],
      ["32%", "rgba(255,255,255,0)"],
      ["48%", "rgba(255,255,255,0.08)"],
      ["55%", "rgba(255,255,255,0)"],
      ["88%", "rgba(24,27,32,0.02)"],
      ["100%", "rgba(24,27,32,0.09)"]
    ].forEach(([offset, color]) => {
      gGlass.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gGlass);

    // Crisp mechanical component elevation shadows
    const fMechShadow = createSvgEl("filter", {
      id: uid + "-mechShadow",
      x: "-22%", y: "-22%", width: "144%", height: "144%"
    });
    fMechShadow.appendChild(createSvgEl("feDropShadow", {
      dx: "1.2", dy: "2.1", stdDeviation: "2.1",
      "flood-color": "#181B20", "flood-opacity": "0.34"
    }));
    defs.appendChild(fMechShadow);

    const fBridgeShadow = createSvgEl("filter", {
      id: uid + "-bridgeShadow",
      x: "-24%", y: "-24%", width: "148%", height: "148%"
    });
    fBridgeShadow.appendChild(createSvgEl("feDropShadow", {
      dx: "1.5", dy: "2.8", stdDeviation: "2.5",
      "flood-color": "#14171C", "flood-opacity": "0.42"
    }));
    defs.appendChild(fBridgeShadow);

    // Wide open dial clipPath (thin bezel r=129)
    const clipDial = createSvgEl("clipPath", { id: uid + "-dialClip" });
    clipDial.appendChild(createSvgEl("circle", { cx: "150", cy: "150", r: "128.5" }));
    defs.appendChild(clipDial);

    // 1 o'clock clean circular open-heart balance aperture clipPath (no boxy trapezoid)
    const clipBalWin = createSvgEl("clipPath", { id: uid + "-balWinClip" });
    clipBalWin.appendChild(createSvgEl("circle", { cx: "173", cy: "84", r: "22.2" }));
    defs.appendChild(clipBalWin);

    // Recessed circular well gradient for 1 o'clock balance wheel cavity
    const gBalWell = createSvgEl("radialGradient", {
      id: uid + "-balWell",
      cx: "45%", cy: "40%", r: "65%"
    });
    [
      ["0%", "#323740"],
      ["65%", "#21252C"],
      ["100%", "#16191E"]
    ].forEach(([offset, color]) => {
      gBalWell.appendChild(createSvgEl("stop", { offset, "stop-color": color }));
    });
    defs.appendChild(gBalWell);

    // Top-left arch plaque engraving path: "CASPER™ · CTA" (9:30 ~ 12:15)
    defs.appendChild(createSvgEl("path", {
      id: uid + "-archTopPath",
      d: arcLinePath(150, 150, 113.2, 196, 272, true)
    }));

    // Bottom-left arch plaque engraving path: "NO.5 PRO" (6:30 ~ 8:15)
    defs.appendChild(createSvgEl("path", {
      id: uid + "-archBotPath",
      d: arcLinePath(150, 150, 118.2, 152, 110, false)
    }));

    svg.appendChild(defs);

    // =========================================================================
    // LAYER (1): Thin 316L Straight-Brushed Steel Bezel & 4 o'clock (+32°) Crown
    // =========================================================================
    const crownG = createSvgEl("g", { transform: "rotate(32 150 150)" });
    // Slender recessed crown neck/tube
    crownG.appendChild(createSvgEl("rect", {
      x: "275", y: "143.5", width: "8", height: "13", rx: "1.2",
      fill: "#8A929D", stroke: "#4F5660", "stroke-width": "0.85"
    }));
    // Machined crown head with crisp dense gear-like knurling teeth
    crownG.appendChild(createSvgEl("rect", {
      x: "281.5", y: "135.5", width: "13.5", height: "29", rx: "2.6",
      fill: "url(#" + uid + "-steelCase)", stroke: "#58606B", "stroke-width": "1.15"
    }));
    for (let cy = 138; cy <= 162; cy += 3) {
      crownG.appendChild(createSvgEl("line", {
        x1: "282.5", y1: cy, x2: "294", y2: cy,
        stroke: "#5E6672", "stroke-width": "0.95", "stroke-linecap": "round"
      }));
      crownG.appendChild(createSvgEl("line", {
        x1: "282.5", y1: cy + 1.1, x2: "294", y2: cy + 1.1,
        stroke: "rgba(255,255,255,0.55)", "stroke-width": "0.55"
      }));
    }
    crownG.appendChild(createSvgEl("line", {
      x1: "285.5", y1: "136.5", x2: "285.5", y2: "163.5",
      stroke: "rgba(255,255,255,0.48)", "stroke-width": "0.9"
    }));
    svg.appendChild(crownG);

    // Sleek thin 316L brushed steel bezel (r=138.5 -> r=129)
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "138.5",
      fill: "url(#" + uid + "-steelCase)", stroke: "#69717C", "stroke-width": "1.45"
    }));
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "138",
      fill: "url(#" + uid + "-brushed316L)", opacity: "0.8"
    }));
    // Thin outer chamfer gleam & crisp inner bezel step
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "134.8",
      fill: "none", stroke: "rgba(255,255,255,0.52)", "stroke-width": "0.8"
    }));
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "130.6",
      fill: "#6F7782", stroke: "#484E57", "stroke-width": "0.9"
    }));
    // Bright Raw CNC Silver Mainplate base
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "128.5",
      fill: "url(#" + uid + "-mainplate)"
    }));

    const dialInner = createSvgEl("g", { "clip-path": "url(#" + uid + "-dialClip)" });

    // =========================================================================
    // LAYER (2): Bright Multi-Layer Skeleton Mainplate + 1 o'clock Brass Balance
    //            Window & 9–10 o'clock Metallic Spoke Gear Train
    // =========================================================================
    const mainplateG = createSvgEl("g", { class: "satclk-mainplate" });
    // Brushed metallic texture & circular machining graining rings
    mainplateG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "128",
      fill: "url(#" + uid + "-brushed316L)", opacity: "0.45"
    }));
    [116, 102, 88, 72, 54].forEach((rRing) => {
      mainplateG.appendChild(createSvgEl("circle", {
        cx: "150", cy: "150", r: String(rRing),
        fill: "none", stroke: "rgba(255,255,255,0.22)", "stroke-width": "0.7"
      }));
    });

    // Recessed skeleton dark gaps ONLY between machined silver bridges
    mainplateG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "78",
      fill: "#2A2E34", stroke: "#666E78", "stroke-width": "1.1"
    }));
    // Machined silver inner skeleton bridge ring over the recessed cavity
    mainplateG.appendChild(createSvgEl("path", {
      d: "M 150,74 A 76,76 0 1,0 150,226 A 76,76 0 1,0 150,74 Z M 150,94 A 56,56 0 1,1 150,206 A 56,56 0 1,1 150,94 Z",
      fill: "url(#" + uid + "-satinSilver)",
      "fill-rule": "evenodd",
      stroke: "#6C747F",
      "stroke-width": "0.85",
      opacity: "0.92"
    }));
    // Central recessed wheel well (shadowed gap beneath the 3-arm carousel)
    mainplateG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "48",
      fill: "#23272D", stroke: "#7C848F", "stroke-width": "1"
    }));
    mainplateG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "34",
      fill: "#B6BEC8", stroke: "#5F6772", "stroke-width": "0.9"
    }));

    // 9–10 o'clock Metallic Spoke Gear Train (bright silver/rhodium wheels)
    const gearPrimaryG = createSvgEl("g", { transform: "translate(89, 145)" });
    const gearPrimaryRotor = createSvgEl("g", { class: "satclk-gear-primary" });
    gearPrimaryRotor.appendChild(createSvgEl("path", {
      d: createGearPath(0, 0, 24, 29, 25.4),
      fill: "url(#" + uid + "-satinSilver)", stroke: "#5F6772", "stroke-width": "0.85"
    }));
    gearPrimaryRotor.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "21.5",
      fill: "#3B414A", stroke: "#868E99", "stroke-width": "0.9"
    }));
    // Fan-spoked skeleton arms (5 bright machined spokes)
    for (let s = 0; s < 5; s++) {
      gearPrimaryRotor.appendChild(createSvgEl("path", {
        d: "M -2.2,-21 L 2.2,-21 L 1.4,-6 L -1.4,-6 Z",
        fill: "#E2E6EC", stroke: "#676F7A", "stroke-width": "0.5",
        transform: "rotate(" + (s * 72) + ")"
      }));
    }
    gearPrimaryRotor.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "7.2",
      fill: "url(#" + uid + "-satinSilver)", stroke: "#59616B", "stroke-width": "0.8"
    }));
    gearPrimaryRotor.appendChild(createSvgEl("circle", { cx: "0", cy: "0", r: "2.4", fill: "#3B4048" }));
    gearPrimaryG.appendChild(gearPrimaryRotor);
    mainplateG.appendChild(gearPrimaryG);

    const gearSecondaryG = createSvgEl("g", { transform: "translate(115, 108)" });
    const gearSecondaryRotor = createSvgEl("g", { class: "satclk-gear-secondary" });
    gearSecondaryRotor.appendChild(createSvgEl("path", {
      d: createGearPath(0, 0, 18, 19.5, 16.5),
      fill: "#D4DAE2", stroke: "#5C646F", "stroke-width": "0.8"
    }));
    gearSecondaryRotor.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "12.5",
      fill: "#3A4049", stroke: "#868E99", "stroke-width": "0.8"
    }));
    for (let s2 = 0; s2 < 4; s2++) {
      gearSecondaryRotor.appendChild(createSvgEl("line", {
        x1: "0", y1: "-12", x2: "0", y2: "12",
        stroke: "#DCE1E7", "stroke-width": "2.1",
        transform: "rotate(" + (s2 * 45) + ")"
      }));
    }
    gearSecondaryRotor.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "4.6",
      fill: "#E8ECF1", stroke: "#58606B", "stroke-width": "0.7"
    }));
    gearSecondaryG.appendChild(gearSecondaryRotor);
    mainplateG.appendChild(gearSecondaryG);

    // 1 o'clock Clean Circular Open-Heart Balance Wheel & Spiral Hairspring (Chromatic Accent #1)
    // Chamfered silver outer bezel seat around circular balance aperture
    mainplateG.appendChild(createSvgEl("circle", {
      cx: "173", cy: "84", r: "24.2",
      fill: "url(#" + uid + "-satinSilver)", stroke: "#69717C", "stroke-width": "0.95"
    }));
    mainplateG.appendChild(createSvgEl("circle", {
      cx: "173", cy: "84", r: "22.2",
      fill: "url(#" + uid + "-balWell)", stroke: "#484F58", "stroke-width": "1.0"
    }));

    const balWindowClipG = createSvgEl("g", { "clip-path": "url(#" + uid + "-balWinClip)" });
    // Rotating Brass Balance Wheel + True Archimedean Spiral Hairspring (4Hz oscillation)
    const balanceWheelG = createSvgEl("g", { transform: "translate(173, 84)" });
    // Continuous multi-turn Archimedean spiral hairspring (3.5 turns)
    balanceWheelG.appendChild(createSvgEl("path", {
      d: createSpiralPath(0, 0, 4.2, 12.6, 3.5, 96),
      fill: "none",
      stroke: "#C3D0DE",
      "stroke-width": "0.78",
      "stroke-linecap": "round",
      opacity: "0.92"
    }));
    // Golden brass balance wheel rim + inner chamfer highlight
    balanceWheelG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "19.0",
      fill: "none", stroke: "url(#" + uid + "-brass)", "stroke-width": "3.1"
    }));
    balanceWheelG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "20.2",
      fill: "none", stroke: "rgba(255,244,204,0.48)", "stroke-width": "0.55"
    }));
    // 3 sleek tapered brass balance wheel spokes
    for (let bs = 0; bs < 3; bs++) {
      balanceWheelG.appendChild(createSvgEl("path", {
        d: "M -1.1,-4.5 L 1.1,-4.5 L 0.75,-18.0 L -0.75,-18.0 Z",
        fill: "url(#" + uid + "-brass)",
        transform: "rotate(" + (bs * 120) + ")"
      }));
    }
    balWindowClipG.appendChild(balanceWheelG);

    // Fixed sculpted satin-silver Balance Cock bridge arm arching into the center ruby shock jewel
    const balCockG = createSvgEl("g", { class: "satclk-balance-cock" });
    balCockG.appendChild(createSvgEl("path", {
      d: "M 189,64 L 195,70 L 179.5,87.5 A 6.2,6.2 0 1,1 169.5,78.5 Z",
      fill: "url(#" + uid + "-bridgeSteel)",
      stroke: "#565E68",
      "stroke-width": "0.85"
    }));
    balCockG.appendChild(createSvgEl("path", {
      d: "M 190.2,66.2 L 193.5,69.5 L 178.4,86.0",
      fill: "none",
      stroke: "rgba(255,255,255,0.68)",
      "stroke-width": "0.6"
    }));
    // Golden Parashock / Incabloc chaton setting + ruby jewel center
    balCockG.appendChild(createSvgEl("circle", {
      cx: "173", cy: "84", r: "4.6",
      fill: "url(#" + uid + "-brass)", stroke: "#694A16", "stroke-width": "0.7"
    }));
    balCockG.appendChild(createSvgEl("circle", {
      cx: "173", cy: "84", r: "2.8",
      fill: "#C9332B", stroke: "#F5D98E", "stroke-width": "0.55"
    }));
    balCockG.appendChild(createSvgEl("circle", {
      cx: "172.1", cy: "83.1", r: "0.9",
      fill: "rgba(255,255,255,0.72)"
    }));
    // Regulator stud & index pointer pins flanking the shock setting
    balCockG.appendChild(createSvgEl("line", {
      x1: "177.2", y1: "80.2", x2: "184.5", y2: "73.2",
      stroke: "#484F58", "stroke-width": "0.75", "stroke-linecap": "round"
    }));
    balWindowClipG.appendChild(balCockG);
    mainplateG.appendChild(balWindowClipG);

    // Crisp luminous chamfer rim around the circular balance wheel aperture
    mainplateG.appendChild(createSvgEl("circle", {
      cx: "173", cy: "84", r: "22.4",
      fill: "none", stroke: "rgba(255,255,255,0.72)", "stroke-width": "0.85"
    }));
    // Balance cock mounting screw on the adjacent silver mainplate shoulder
    appendSlottedScrew(mainplateG, 189.2, 65.5, 2.3, -38, uid);

    dialInner.appendChild(mainplateG);

    // =========================================================================
    // LAYER (3): 5:30 Independent Small Seconds Disc — Radial Sunburst Silver
    //            & Central Fixed Cap with 6 o'clock Red Triangle Pointer (▼)
    // =========================================================================
    const secOuterG = createSvgEl("g", { transform: "translate(175, 224)" });
    // Recessed beveled silver subdial housing
    secOuterG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "43",
      fill: "#31363E", stroke: "#69717C", "stroke-width": "1.1"
    }));
    secOuterG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "42.2",
      fill: "none", stroke: "rgba(255,255,255,0.5)", "stroke-width": "0.65"
    }));

    const secondsDiscG = createSvgEl("g", { class: "satclk-seconds-disc" });
    secondsDiscG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "40.8",
      fill: "url(#" + uid + "-sunburstBase)", stroke: "#828A95", "stroke-width": "0.85"
    }));
    // Conical sunburst sheen wedges (radial metallic reflections)
    const sunburstAngles = [
      [0, 32, "rgba(255,255,255,0.34)"],
      [48, 86, "rgba(75,82,92,0.11)"],
      [112, 146, "rgba(255,255,255,0.28)"],
      [176, 214, "rgba(75,82,92,0.12)"],
      [238, 272, "rgba(255,255,255,0.32)"],
      [298, 334, "rgba(75,82,92,0.10)"]
    ];
    sunburstAngles.forEach(([a0, a1, fillColor]) => {
      const q1 = polar(0, 0, 40.4, a0);
      const q2 = polar(0, 0, 40.4, a1);
      secondsDiscG.appendChild(createSvgEl("path", {
        d: "M 0,0 L " + q1[0].toFixed(2) + "," + q1[1].toFixed(2) + " A 40.4,40.4 0 0,1 " + q2[0].toFixed(2) + "," + q2[1].toFixed(2) + " Z",
        fill: fillColor
      }));
    });
    // Fine concentric lathe rings
    secondsDiscG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "33.5",
      fill: "none", stroke: "rgba(32,36,42,0.16)", "stroke-width": "0.6"
    }));
    secondsDiscG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "21.5",
      fill: "none", stroke: "rgba(32,36,42,0.14)", "stroke-width": "0.55"
    }));

    // 60 fine black ticks + 05..60 black numerals (ZERO red on disc)
    for (let s = 0; s < 60; s++) {
      const deg = s * 6 - 90;
      const rad = (deg * Math.PI) / 180;
      const major = s % 5 === 0;
      const r1 = major ? 34.4 : 36.6;
      const r2 = 39.8;
      secondsDiscG.appendChild(createSvgEl("line", {
        x1: (r1 * Math.cos(rad)).toFixed(2),
        y1: (r1 * Math.sin(rad)).toFixed(2),
        x2: (r2 * Math.cos(rad)).toFixed(2),
        y2: (r2 * Math.sin(rad)).toFixed(2),
        stroke: "#1A1D22",
        "stroke-width": major ? "1.35" : "0.65",
        "stroke-linecap": "round"
      }));
      if (major) {
        const rt = 27.6;
        const tx = rt * Math.cos(rad);
        const ty = rt * Math.sin(rad);
        const secNum = s === 0 ? "60" : String(s).padStart(2, "0");
        const txt = createSvgEl("text", {
          x: tx.toFixed(1),
          y: ty.toFixed(1),
          "text-anchor": "middle",
          "dominant-baseline": "central",
          "font-family": IND_FONT,
          "font-size": "6.6",
          "font-weight": "800",
          fill: "#1A1D22",
          transform: "rotate(" + (s * 6 + 180) + " " + tx.toFixed(1) + " " + ty.toFixed(1) + ")"
        });
        txt.textContent = secNum;
        secondsDiscG.appendChild(txt);
      }
    }
    secOuterG.appendChild(secondsDiscG);

    // Fixed central brushed silver cap + 6 o'clock Red Triangle Pointer (Chromatic Accent #2) + 1.5mm Bearing
    secOuterG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "14.2",
      fill: "url(#" + uid + "-bridgeSteel)", stroke: "#5B636E", "stroke-width": "0.95"
    }));
    secOuterG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "13.3",
      fill: "none", stroke: "rgba(255,255,255,0.65)", "stroke-width": "0.6"
    }));
    // Chromatic Accent #2: Small Red Downward Triangle Pointer at 6 o'clock inside the fixed cap
    secOuterG.appendChild(createSvgEl("polygon", {
      points: "-3.3,6.0 3.3,6.0 0,12.4",
      fill: "#C9332B",
      stroke: "#7B1A15",
      "stroke-width": "0.45"
    }));
    // Central 1.5mm MinebeaMitsumi micro steel ball bearing & polished pin
    secOuterG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "5.2",
      fill: "#2A2E34", stroke: "#9DA5B0", "stroke-width": "0.8"
    }));
    for (let b = 0; b < 7; b++) {
      const ba = (b * Math.PI * 2) / 7;
      secOuterG.appendChild(createSvgEl("circle", {
        cx: (3.5 * Math.cos(ba)).toFixed(2),
        cy: (3.5 * Math.sin(ba)).toFixed(2),
        r: "0.95",
        fill: "#F2F5F8", stroke: "#505760", "stroke-width": "0.25"
      }));
    }
    secOuterG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "2.1",
      fill: "#ECEFF3", stroke: "#535B66", "stroke-width": "0.55"
    }));
    dialInner.appendChild(secOuterG);

    // =========================================================================
    // LAYER (4): 8 o'clock (+150°) Sleek Polished Steel Cylinder Roller (r=10.5)
    // =========================================================================
    const rollerOuterG = createSvgEl("g", {
      transform: "translate(77.3, 192.0)",
      filter: "url(#" + uid + "-mechShadow)"
    });
    const rollerRotorG = createSvgEl("g", { class: "satclk-roller-bearing" });
    rollerRotorG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "10.5",
      fill: "url(#" + uid + "-steelCase)", stroke: "#525A65", "stroke-width": "1.15"
    }));
    rollerRotorG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "9.2",
      fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-width": "0.6"
    }));
    rollerRotorG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "6.4",
      fill: "#2E333A", stroke: "#B5BDC6", "stroke-width": "0.75"
    }));
    for (let rb = 0; rb < 8; rb++) {
      const rba = (rb * Math.PI * 2) / 8;
      rollerRotorG.appendChild(createSvgEl("circle", {
        cx: (4.6 * Math.cos(rba)).toFixed(2),
        cy: (4.6 * Math.sin(rba)).toFixed(2),
        r: "1.1",
        fill: "#F2F5F8", stroke: "#4F5660", "stroke-width": "0.28"
      }));
    }
    rollerRotorG.appendChild(createSvgEl("circle", {
      cx: "0", cy: "0", r: "2.8",
      fill: "#ECEFF3", stroke: "#555D68", "stroke-width": "0.65"
    }));
    rollerRotorG.appendChild(createSvgEl("line", {
      x1: "-1.7", y1: "-0.8", x2: "1.7", y2: "0.8",
      stroke: "#484F58", "stroke-width": "0.7"
    }));
    rollerOuterG.appendChild(rollerRotorG);
    dialInner.appendChild(rollerOuterG);

    // =========================================================================
    // LAYER (5): 3 Large 4-Arm CNC Silver Cross-Paddle Satellites (NO circles)
    // =========================================================================
    const satAssemblyG = createSvgEl("g", { filter: "url(#" + uid + "-mechShadow)" });
    const satGroups = [];

    for (let k = 0; k < 3; k++) {
      const outer = createSvgEl("g", { "data-sat-disc": String(k) });
      const inner = createSvgEl("g");

      // Main sculpted 4-arm cross-paddle body
      inner.appendChild(createSvgEl("path", {
        d: CROSS_PADDLE_OUTER_D,
        fill: "url(#" + uid + "-paddleMetal)",
        stroke: "#5E6671",
        "stroke-width": "1.2"
      }));
      // Subtle straight brushed steel grain across paddle
      inner.appendChild(createSvgEl("path", {
        d: CROSS_PADDLE_OUTER_D,
        fill: "url(#" + uid + "-brushed316L)",
        opacity: "0.45"
      }));
      // 45° CNC chamfered edge highlight contour
      inner.appendChild(createSvgEl("path", {
        d: CROSS_PADDLE_OUTER_D,
        fill: "none",
        stroke: "rgba(255,255,255,0.72)",
        "stroke-width": "0.75",
        transform: "scale(0.945)"
      }));

      // 4 Bold Industrial Gothic Hour Numerals + Small Dark Charcoal Pointer Tips (ZERO red)
      for (let j = 0; j < 4; j++) {
        const num = DISC_NUMS[k][j];
        const deg = j * 90;
        const rad = (deg * Math.PI) / 180;
        const rTxt = 22.8;
        const tx = rTxt * Math.cos(rad);
        const ty = rTxt * Math.sin(rad);

        // Precision dark charcoal triangular index pointer at outer paddle tip
        inner.appendChild(createSvgEl("polygon", {
          points: "31.8,-2.4 36.6,0 31.8,2.4",
          fill: "#1D2025",
          transform: "rotate(" + deg + ")"
        }));

        const numTxt = createSvgEl("text", {
          x: tx.toFixed(1),
          y: ty.toFixed(1),
          "text-anchor": "middle",
          "dominant-baseline": "central",
          "font-family": IND_FONT,
          "font-size": "14.2",
          "font-weight": "900",
          "letter-spacing": "-0.45",
          fill: "#16191D",
          transform: "rotate(" + deg + " " + tx.toFixed(1) + " " + ty.toFixed(1) + ")"
        });
        numTxt.textContent = String(num);
        inner.appendChild(numTxt);
      }

      // Central precision bearing hub & slotted screw on each cross-paddle
      inner.appendChild(createSvgEl("circle", {
        cx: "0", cy: "0", r: "7.8",
        fill: "#CFD5DD", stroke: "#69717C", "stroke-width": "0.85"
      }));
      appendSlottedScrew(inner, 0, 0, 4.6, 28 + k * 40, uid);

      outer.appendChild(inner);
      satAssemblyG.appendChild(outer);
      satGroups.push({ outer, inner });
    }

    // =========================================================================
    // LAYER (6): Heavy Y-Shaped 3-Arm CNC Chamfered Silver Carousel Bridge
    //            (3 Pill Milled Slots · 6 Slotted Screws · Deep Brass Hub)
    // =========================================================================
    const bridgeG = createSvgEl("g", {
      class: "satclk-carousel-bridge",
      filter: "url(#" + uid + "-bridgeShadow)"
    });
    // Base arm points up (-90°) from (150,150) to satellite pivot at (150, 97) since ORBIT_R=53
    const ARM_BODY_D =
      "M 136.5,150 L 138.8,101 C 138.8,88.2 161.2,88.2 161.2,101 L 163.5,150 Z";
    const ARM_CHAMFER_D =
      "M 138.3,149 L 140.4,101.2 C 140.4,90.4 159.6,90.4 159.6,101.2 L 161.7,149 Z";

    for (let arm = 0; arm < 3; arm++) {
      const armG = createSvgEl("g", { transform: "rotate(" + (arm * 120) + " 150 150)" });
      // Sculptural bulky CNC arm body
      armG.appendChild(createSvgEl("path", {
        d: ARM_BODY_D,
        fill: "url(#" + uid + "-bridgeSteel)",
        stroke: "#5A626D",
        "stroke-width": "1.2"
      }));
      armG.appendChild(createSvgEl("path", {
        d: ARM_BODY_D,
        fill: "url(#" + uid + "-brushed316L)",
        opacity: "0.38"
      }));
      // 45° chamfer luminous highlight contour
      armG.appendChild(createSvgEl("path", {
        d: ARM_CHAMFER_D,
        fill: "none",
        stroke: "rgba(255,255,255,0.78)",
        "stroke-width": "0.9"
      }));
      // Deeply milled capsule/pill slot with interior recess shading
      armG.appendChild(createSvgEl("rect", {
        x: "146.4", y: "108.5", width: "7.2", height: "19.5", rx: "3.6",
        fill: "url(#" + uid + "-slotRecess)",
        stroke: "#464C55",
        "stroke-width": "0.8"
      }));
      armG.appendChild(createSvgEl("rect", {
        x: "147.2", y: "109.3", width: "5.6", height: "17.9", rx: "2.8",
        fill: "none",
        stroke: "rgba(255,255,255,0.38)",
        "stroke-width": "0.55"
      }));
      // Outer large circular pivot screw (3 total)
      appendSlottedScrew(armG, 150, 97, 6.2, 24 + arm * 35, uid);
      // Inner small hub-side slotted screw (3 total -> 6 screws total on bridge)
      appendSlottedScrew(armG, 150, 134.2, 2.8, -32 + arm * 25, uid);
      bridgeG.appendChild(armG);
    }

    // Deep recessed central carousel hub -> sunken Brass bushing ring & steel pinion arbor
    bridgeG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "17.6",
      fill: "url(#" + uid + "-bridgeSteel)", stroke: "#58606B", "stroke-width": "1.2"
    }));
    bridgeG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "16.2",
      fill: "none", stroke: "rgba(255,255,255,0.74)", "stroke-width": "0.8"
    }));
    // Deep recessed step wall
    bridgeG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "12.2",
      fill: "#333840", stroke: "#5B636E", "stroke-width": "0.95"
    }));
    // Sunken gleaming Brass bushing ring
    bridgeG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "9.4",
      fill: "url(#" + uid + "-brass)", stroke: "#5F4314", "stroke-width": "0.9"
    }));
    // Inner machined steel pinion arbor shaft
    bridgeG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "5.2",
      fill: "url(#" + uid + "-steelCase)", stroke: "#484E57", "stroke-width": "0.8"
    }));
    bridgeG.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "2.0",
      fill: "#23272D"
    }));

    satAssemblyG.appendChild(bridgeG);
    dialInner.appendChild(satAssemblyG);

    // =========================================================================
    // LAYER (7): Right Fixed 120° Minute Scale Plate (Double Rail · Horizontal
    //            Upright Black Numerals 5~60) + Symmetric Silver Arch Plaques
    // =========================================================================
    const minutePlateG = createSvgEl("g", {
      class: "satclk-minute-plate",
      filter: "url(#" + uid + "-mechShadow)"
    });
    const minPlateD = arcSectorPath(150, 150, 91.5, 128.5, -63.5, 65.0);
    minutePlateG.appendChild(createSvgEl("path", {
      d: minPlateD,
      fill: "url(#" + uid + "-satinSilver)",
      stroke: "#5E6671",
      "stroke-width": "1.2"
    }));
    minutePlateG.appendChild(createSvgEl("path", {
      d: minPlateD,
      fill: "url(#" + uid + "-brushed316L)",
      opacity: "0.34"
    }));

    // Instrument-style double concentric guide arc rails framing the numerals
    minutePlateG.appendChild(createSvgEl("path", {
      d: arcLinePath(150, 150, 102.2, -60, 60, true),
      fill: "none", stroke: "#383D45", "stroke-width": "0.65"
    }));
    minutePlateG.appendChild(createSvgEl("path", {
      d: arcLinePath(150, 150, 123.6, -60, 60, true),
      fill: "none", stroke: "#383D45", "stroke-width": "0.65"
    }));
    minutePlateG.appendChild(createSvgEl("path", {
      d: arcLinePath(150, 150, 92.4, -60, 60, true),
      fill: "none", stroke: "rgba(255,255,255,0.65)", "stroke-width": "0.6"
    }));

    // Top & bottom miniature slotted mounting screws on minute scale plate
    const topScrewPt = polar(150, 150, 113, -59.5);
    const botScrewPt = polar(150, 150, 98.5, 63.0);
    appendSlottedScrew(minutePlateG, topScrewPt[0], topScrewPt[1], 2.7, -30, uid);
    appendSlottedScrew(minutePlateG, botScrewPt[0], botScrewPt[1], 2.7, 45, uid);

    // 1-minute fine ticks & 5-minute bold ticks (100% black/charcoal) + horizontal upright numerals 5~60
    for (let m = 0; m <= 60; m++) {
      const deg = -60 + m * 2;
      const rad = (deg * Math.PI) / 180;
      const isMajor = m % 5 === 0;
      const rIn = isMajor ? 92.2 : 92.8;
      const rOut = isMajor ? 101.4 : 98.2;

      minutePlateG.appendChild(createSvgEl("line", {
        x1: (150 + rIn * Math.cos(rad)).toFixed(2),
        y1: (150 + rIn * Math.sin(rad)).toFixed(2),
        x2: (150 + rOut * Math.cos(rad)).toFixed(2),
        y2: (150 + rOut * Math.sin(rad)).toFixed(2),
        stroke: "#1A1D22",
        "stroke-width": isMajor ? "1.65" : "0.78",
        "stroke-linecap": "round"
      }));

      // Horizontal upright (0° rotation) black numerals: 5, 10, 15, ..., 60 (m=0 has start tick only)
      if (isMajor && m > 0) {
        const rTxt = 113.0;
        const tx = 150 + rTxt * Math.cos(rad);
        const ty = 150 + rTxt * Math.sin(rad);
        const isQuarter = m % 15 === 0;
        const mTxt = createSvgEl("text", {
          x: tx.toFixed(1),
          y: ty.toFixed(1),
          "text-anchor": "middle",
          "dominant-baseline": "central",
          "font-family": IND_FONT,
          "font-size": isQuarter ? "10.0" : "9.2",
          "font-weight": "900",
          "letter-spacing": "-0.3",
          fill: "#1A1D22"
        });
        mTxt.textContent = String(m);
        minutePlateG.appendChild(mTxt);
      }
    }
    dialInner.appendChild(minutePlateG);

    // Symmetric Satin-Silver Arch Homage Plaques (Top-Left: "CASPER™ · CTA", Bottom-Left: "NO.5 PRO")
    const plaquesG = createSvgEl("g", {
      class: "satclk-engravings",
      filter: "url(#" + uid + "-mechShadow)"
    });

    // Top-Left Satin-Silver Arch Plaque (9:30 ~ 12:15)
    const topPlaqueD = arcSectorPath(150, 150, 104.5, 127.5, 193, 275);
    plaquesG.appendChild(createSvgEl("path", {
      d: topPlaqueD,
      fill: "url(#" + uid + "-satinSilver)",
      stroke: "#606873",
      "stroke-width": "1.1"
    }));
    plaquesG.appendChild(createSvgEl("path", {
      d: topPlaqueD,
      fill: "url(#" + uid + "-brushed316L)",
      opacity: "0.35"
    }));
    plaquesG.appendChild(createSvgEl("path", {
      d: arcLinePath(150, 150, 106.0, 194, 274, true),
      fill: "none", stroke: "rgba(255,255,255,0.68)", "stroke-width": "0.65"
    }));
    const tlRivet1 = polar(150, 150, 116, 198);
    const tlRivet2 = polar(150, 150, 116, 270);
    appendSlottedScrew(plaquesG, tlRivet1[0], tlRivet1[1], 2.3, 18, uid);
    appendSlottedScrew(plaquesG, tlRivet2[0], tlRivet2[1], 2.3, -24, uid);

    const topEngraving = createSvgEl("text", {
      "font-family": IND_FONT,
      "font-size": "9.0",
      "font-weight": "900",
      fill: "#1A1D22",
      "letter-spacing": "1.2"
    });
    const topEngravingPath = createSvgEl("textPath", {
      href: "#" + uid + "-archTopPath",
      startOffset: "50%",
      "text-anchor": "middle"
    });
    topEngravingPath.setAttributeNS(XLINK_NS, "xlink:href", "#" + uid + "-archTopPath");
    topEngravingPath.textContent = "CASPER™ · CTA";
    topEngraving.appendChild(topEngravingPath);
    plaquesG.appendChild(topEngraving);

    // Bottom-Left Satin-Silver Arch Plaque (6:30 ~ 8:15) matching real "5号 改" plate
    const botPlaqueD = arcSectorPath(150, 150, 105.0, 127.5, 106, 156);
    plaquesG.appendChild(createSvgEl("path", {
      d: botPlaqueD,
      fill: "url(#" + uid + "-satinSilver)",
      stroke: "#606873",
      "stroke-width": "1.1"
    }));
    plaquesG.appendChild(createSvgEl("path", {
      d: botPlaqueD,
      fill: "url(#" + uid + "-brushed316L)",
      opacity: "0.35"
    }));
    plaquesG.appendChild(createSvgEl("path", {
      d: arcLinePath(150, 150, 106.4, 107, 155, true),
      fill: "none", stroke: "rgba(255,255,255,0.68)", "stroke-width": "0.65"
    }));
    const blRivet1 = polar(150, 150, 116, 110.5);
    const blRivet2 = polar(150, 150, 116, 151.5);
    appendSlottedScrew(plaquesG, blRivet1[0], blRivet1[1], 2.2, 42, uid);
    appendSlottedScrew(plaquesG, blRivet2[0], blRivet2[1], 2.2, -16, uid);

    const botEngraving = createSvgEl("text", {
      "font-family": IND_FONT,
      "font-size": "8.6",
      "font-weight": "900",
      fill: "#1A1D22",
      "letter-spacing": "1.1"
    });
    const botEngravingPath = createSvgEl("textPath", {
      href: "#" + uid + "-archBotPath",
      startOffset: "50%",
      "text-anchor": "middle"
    });
    botEngravingPath.setAttributeNS(XLINK_NS, "xlink:href", "#" + uid + "-archBotPath");
    botEngravingPath.textContent = "NO.5 PRO";
    botEngraving.appendChild(botEngravingPath);
    plaquesG.appendChild(botEngraving);
    dialInner.appendChild(plaquesG);

    // =========================================================================
    // LAYER (8): 4.6mm Box Sapphire Crystal Refraction Rim & Diagonal Reflection
    // =========================================================================
    dialInner.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "128.5",
      fill: "url(#" + uid + "-glassShine)",
      "pointer-events": "none"
    }));
    dialInner.appendChild(createSvgEl("path", {
      d: "M 48,76 Q 112,30 192,38 Q 128,60 66,112 Z",
      fill: "rgba(255,255,255,0.12)",
      "pointer-events": "none"
    }));
    svg.appendChild(dialInner);

    // 4.6mm Box sapphire outer 2–3px translucent refractive highlight rim
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "128.6",
      fill: "none", stroke: "rgba(255,255,255,0.52)", "stroke-width": "1.6",
      "pointer-events": "none"
    }));
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "126.4",
      fill: "none", stroke: "rgba(255,255,255,0.20)", "stroke-width": "1.2",
      "pointer-events": "none"
    }));
    svg.appendChild(createSvgEl("circle", {
      cx: "150", cy: "150", r: "124.8",
      fill: "none", stroke: "rgba(32,36,42,0.12)", "stroke-width": "0.65",
      "pointer-events": "none"
    }));

    return {
      svg,
      satGroups,
      bridgeG,
      secondsDiscG,
      balanceWheelG,
      rollerRotorG,
      gearPrimaryRotor,
      gearSecondaryRotor
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

      // 1. Central 3-Arm CNC carousel rotation (120°/hr CW, arm 0 points to -60° at 12:00)
      const carouselDeg = tHours * 120 + 30;
      parts.bridgeG.setAttribute("transform", "rotate(" + carouselDeg.toFixed(3) + " 150 150)");

      // 2. 3 satellite cross-paddles: 120°/hr CW orbit + 8 o'clock roller 90° snap indexing
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

      // 4. 5:30 independent small seconds disc (central 6 o'clock red pointer -> 180 - 6*sSweep)
      const secDeg = 180 - 6 * sSweep;
      parts.secondsDiscG.setAttribute("transform", "rotate(" + secDeg.toFixed(2) + ")");

      // 5. 1 o'clock brass balance wheel 4Hz oscillation + 9–10 o'clock metallic gear train drive
      const balDeg = isReducedMotion() ? 0 : Math.sin(nowPerf * 0.02513274) * 18;
      parts.balanceWheelG.setAttribute("transform", "translate(173, 84) rotate(" + balDeg.toFixed(1) + ")");
      const gearDeg = tHours * 360;
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

    // Render 1 initial accurate frame immediately, then only start rAF if active & visible
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
    version: "2.0.0",
    mount: mount,
    getInstance: function () {
      return activeInstance;
    }
  };
})(typeof window !== "undefined" ? window : this);
