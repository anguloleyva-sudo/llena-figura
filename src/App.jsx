<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Variación de cambio - Llenado de recipientes</title>

  <style>
    :root {
      --bg: #eef3f8;
      --panel: #ffffff;
      --text: #172033;
      --muted: #64748b;
      --blue: #1677ff;
      --blue-dark: #0756c8;
      --orange: #ff8a00;
      --grid: #dbe3ef;
      --axis: #334155;
      --glass: rgba(255, 255, 255, 0.45);
      --shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
      --radius: 22px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: radial-gradient(circle at top left, #ffffff 0, var(--bg) 45%, #e6edf7 100%);
      color: var(--text);
    }

    .app {
      width: min(1450px, 96vw);
      margin: 24px auto 40px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 18px;
      margin-bottom: 18px;
    }

    .header h1 {
      margin: 0;
      font-size: clamp(1.7rem, 3vw, 2.7rem);
      letter-spacing: -0.04em;
    }

    .header p {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 1rem;
      max-width: 760px;
    }

    .controls {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.28);
      box-shadow: var(--shadow);
      border-radius: var(--radius);
      padding: 16px;
      display: grid;
      grid-template-columns: 1.4fr 0.8fr 0.8fr auto auto;
      gap: 12px;
      align-items: end;
      margin-bottom: 18px;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    label {
      font-weight: 700;
      font-size: 0.88rem;
      color: #334155;
    }

    select,
    input {
      width: 100%;
      border: 1px solid #cbd5e1;
      background: #fff;
      border-radius: 14px;
      padding: 12px 13px;
      font-size: 1rem;
      color: var(--text);
      outline: none;
    }

    select:focus,
    input:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.14);
    }

    button {
      border: 0;
      border-radius: 15px;
      padding: 13px 18px;
      font-weight: 800;
      font-size: 0.98rem;
      cursor: pointer;
      transition: transform 0.12s ease, filter 0.12s ease;
    }

    button:hover {
      transform: translateY(-1px);
      filter: brightness(1.03);
    }

    .primary {
      color: #fff;
      background: linear-gradient(135deg, var(--blue), var(--blue-dark));
    }

    .secondary {
      color: #0f172a;
      background: #e2e8f0;
    }

    .workspace {
      display: grid;
      grid-template-columns: minmax(320px, 0.9fr) minmax(480px, 1.45fr);
      gap: 18px;
    }

    .panel {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.28);
      box-shadow: var(--shadow);
      border-radius: var(--radius);
      padding: 16px;
      overflow: hidden;
    }

    .panel-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
      font-weight: 900;
      color: #0f172a;
    }

    .hint {
      font-size: 0.85rem;
      color: var(--muted);
      font-weight: 700;
      text-align: right;
    }

    #vesselSvg {
      width: 100%;
      height: min(72vh, 650px);
      min-height: 520px;
      display: block;
      border-radius: 18px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.9), rgba(241,245,249,0.7)),
        repeating-linear-gradient(0deg, transparent 0 28px, rgba(148,163,184,0.08) 29px 30px);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }

    .stat {
      background: linear-gradient(180deg, #f8fafc, #eef4ff);
      border: 1px solid #dbeafe;
      border-radius: 18px;
      padding: 12px;
    }

    .stat .name {
      color: var(--muted);
      font-weight: 800;
      font-size: 0.78rem;
      margin-bottom: 4px;
    }

    .stat .value {
      font-size: clamp(1rem, 1.7vw, 1.45rem);
      font-weight: 950;
      letter-spacing: -0.04em;
    }

    .chart {
      width: 100%;
      height: 315px;
      display: block;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      margin-bottom: 12px;
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 18px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.94rem;
    }

    th,
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: right;
    }

    th:first-child,
    td:first-child {
      text-align: left;
    }

    th {
      color: #475569;
      background: #f8fafc;
    }

    tr.current-row td {
      background: #eff6ff;
      color: var(--blue-dark);
      font-weight: 900;
    }

    .explanation {
      font-size: 1.02rem;
      line-height: 1.55;
      color: #334155;
      margin: 0 0 16px;
    }

    .meter-wrap {
      margin-top: 12px;
    }

    .meter-label {
      display: flex;
      justify-content: space-between;
      font-weight: 800;
      color: #475569;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .meter {
      height: 18px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #22c55e, #facc15, #ef4444);
      border-radius: 999px;
      transition: width 0.15s linear;
    }

    .formula {
      background: #0f172a;
      color: #e0f2fe;
      border-radius: 18px;
      padding: 14px 16px;
      font-weight: 800;
      margin-top: 14px;
      text-align: center;
      font-size: 1.1rem;
    }

    .glass-outline {
      fill: rgba(255,255,255,0.1);
      stroke: rgba(15,23,42,0.58);
      stroke-width: 3;
      vector-effect: non-scaling-stroke;
    }

    .glass-highlight {
      fill: none;
      stroke: rgba(255,255,255,0.85);
      stroke-width: 5;
      stroke-linecap: round;
      opacity: 0.8;
    }

    .ridge {
      fill: none;
      stroke: rgba(15,23,42,0.26);
      stroke-width: 2;
      opacity: 0.75;
    }

    .ridge-light {
      fill: none;
      stroke: rgba(255,255,255,0.8);
      stroke-width: 2;
      opacity: 0.8;
    }

    .water-surface {
      stroke: #045ee8;
      stroke-width: 4;
      stroke-linecap: round;
      filter: drop-shadow(0 2px 3px rgba(4,94,232,0.35));
    }

    .ruler-line {
      stroke: #334155;
      stroke-width: 2;
    }

    .ruler-tick {
      stroke: #475569;
      stroke-width: 2;
    }

    .ruler-text {
      font-size: 13px;
      fill: #334155;
      font-weight: 800;
    }

    .svg-label {
      font-size: 15px;
      fill: #0f172a;
      font-weight: 900;
    }

    .small-label {
      font-size: 12px;
      fill: #475569;
      font-weight: 800;
    }

    @media (max-width: 1050px) {
      .controls,
      .workspace,
      .bottom-grid {
        grid-template-columns: 1fr;
      }

      .stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .header {
        display: block;
      }
    }
  </style>
</head>

<body>
  <main class="app">
    <header class="header">
      <div>
        <h1>Llenado de recipientes</h1>
        <p>
          Observa cómo cambia la altura del agua con respecto al tiempo. La escala de la gráfica queda fija desde el inicio,
          como cuando el estudiante prepara sus ejes en la libreta.
        </p>
      </div>
    </header>

    <section class="controls">
      <div class="field">
        <label for="vesselSelect">Recipiente</label>
        <select id="vesselSelect"></select>
      </div>

      <div class="field">
        <label for="flowInput">Flujo Q, en mL/s</label>
        <input id="flowInput" type="number" min="1" step="1" value="22" />
      </div>

      <div class="field">
        <label for="speedInput">Velocidad visual</label>
        <select id="speedInput">
          <option value="0.5">0.5x</option>
          <option value="1" selected>1x</option>
          <option value="2">2x</option>
          <option value="4">4x</option>
          <option value="8">8x</option>
        </select>
      </div>

      <button id="playBtn" class="primary">Iniciar</button>
      <button id="resetBtn" class="secondary">Reiniciar</button>
    </section>

    <section class="workspace">
      <article class="panel">
        <div class="panel-title">
          <span>Recipiente con regla</span>
          <span id="shapeHint" class="hint"></span>
        </div>
        <svg id="vesselSvg" viewBox="0 0 360 560" role="img" aria-label="Simulación de llenado"></svg>
      </article>

      <article class="panel">
        <div class="stats">
          <div class="stat">
            <div class="name">Tiempo</div>
            <div id="statTime" class="value">0.0 s</div>
          </div>
          <div class="stat">
            <div class="name">Altura</div>
            <div id="statHeight" class="value">0.0 cm</div>
          </div>
          <div class="stat">
            <div class="name">dh/dt</div>
            <div id="statRate" class="value">0.00 cm/s</div>
          </div>
          <div class="stat">
            <div class="name">Volumen</div>
            <div id="statVolume" class="value">0 mL</div>
          </div>
        </div>

        <div class="panel-title">
          <span>Gráfica altura-tiempo, h(t)</span>
          <span class="hint">Ejes fijos desde el inicio</span>
        </div>
        <svg id="heightChart" class="chart" viewBox="0 0 640 315"></svg>

        <div class="panel-title">
          <span>Gráfica de razón de cambio, dh/dt</span>
          <span class="hint">Sube rápido cuando el recipiente es angosto</span>
        </div>
        <svg id="rateChart" class="chart" viewBox="0 0 640 315"></svg>
      </article>
    </section>

    <section class="bottom-grid">
      <article class="panel">
        <div class="panel-title">
          <span>Lecturas para la libreta</span>
          <span class="hint">Se agregan conforme avanza el tiempo</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Lectura</th>
              <th>t</th>
              <th>h(t)</th>
              <th>dh/dt</th>
            </tr>
          </thead>
          <tbody id="readingsBody"></tbody>
        </table>
      </article>

      <article class="panel">
        <div class="panel-title">
          <span>Interpretación</span>
        </div>
        <p id="explanation" class="explanation"></p>

        <div class="meter-wrap">
          <div class="meter-label">
            <span>Área transversal actual A(h)</span>
            <span id="areaLabel">0%</span>
          </div>
          <div class="meter">
            <div id="areaMeter" class="meter-fill"></div>
          </div>
        </div>

        <div class="formula">
          dh/dt = Q / A(h)
        </div>
      </article>
    </section>
  </main>

  <script>
    const vessels = {
      barrilVerde: {
        label: "Frasco verde con tres panzas",
        hint: "Parecido al recipiente verde con zonas anchas y cuellos intermedios",
        hMax: 18,
        rMax: 4.15,
        water: "#15b97a",
        glassTint: "#50d69b",
        cap: "mint",
        explanation:
          "Este recipiente tiene partes anchas y partes angostas. En las panzas el agua sube más lento porque el área es mayor. En las cinturas el agua sube más rápido.",
        profile: [
          [0.00, 0.58],
          [0.03, 0.73],
          [0.08, 0.90],
          [0.15, 1.00],
          [0.22, 0.95],
          [0.28, 0.70],
          [0.35, 0.82],
          [0.45, 0.98],
          [0.54, 1.00],
          [0.62, 0.75],
          [0.70, 0.86],
          [0.80, 1.00],
          [0.90, 0.96],
          [0.97, 0.76],
          [1.00, 0.68]
        ],
        ridges: [0.09, 0.17, 0.27, 0.33, 0.44, 0.56, 0.64, 0.77, 0.89]
      },

      cupcake: {
        label: "Frasco tipo cupcake",
        hint: "Base acanalada, cuerpo ancho y domo superior",
        hMax: 20,
        rMax: 5.15,
        water: "#12a3b8",
        glassTint: "#70e1ee",
        cap: "silver",
        explanation:
          "En la parte baja el recipiente se ensancha. Luego tiene una zona muy ancha y finalmente se cierra hacia el cuello. Por eso la gráfica cambia mucho de pendiente.",
        profile: [
          [0.00, 0.50],
          [0.05, 0.66],
          [0.12, 0.78],
          [0.25, 0.88],
          [0.40, 0.98],
          [0.52, 1.00],
          [0.62, 0.92],
          [0.72, 0.78],
          [0.82, 0.64],
          [0.91, 0.38],
          [1.00, 0.34]
        ],
        ridges: [0.10, 0.15, 0.20, 0.25, 0.48, 0.55, 0.61, 0.69, 0.76]
      },

      gymWater: {
        label: "Botella Gym Water",
        hint: "Dos depósitos grandes unidos por una zona delgada",
        hMax: 25,
        rMax: 3.75,
        water: "#ff2d91",
        glassTint: "#ff9fd0",
        cap: "sport",
        explanation:
          "Este es el mejor recipiente para notar la variación. En los depósitos grandes la altura sube lento. En la parte delgada central la altura sube muy rápido.",
        profile: [
          [0.00, 0.65],
          [0.04, 0.86],
          [0.10, 1.00],
          [0.18, 0.98],
          [0.25, 0.78],
          [0.31, 0.42],
          [0.38, 0.30],
          [0.55, 0.30],
          [0.63, 0.42],
          [0.70, 0.78],
          [0.78, 0.99],
          [0.86, 1.00],
          [0.92, 0.78],
          [0.96, 0.42],
          [1.00, 0.34]
        ],
        ridges: [0.08, 0.16, 0.24, 0.72, 0.82, 0.90]
      },

      vasoCilindrico: {
        label: "Vaso cilíndrico 490 mL",
        hint: "Casi constante: debe producir una gráfica casi lineal",
        hMax: 14,
        rMax: 3.35,
        water: "#2595ff",
        glassTint: "#d8f0ff",
        cap: "none",
        explanation:
          "Como el vaso tiene casi el mismo ancho en toda su altura, el área transversal casi no cambia. Por eso la altura aumenta casi de forma lineal.",
        profile: [
          [0.00, 0.80],
          [0.05, 0.88],
          [0.15, 0.90],
          [0.43, 0.90],
          [0.48, 0.96],
          [0.56, 0.96],
          [0.86, 0.96],
          [1.00, 0.96]
        ],
        ridges: [0.05, 0.12, 0.47]
      },

      vasoCerveza: {
        label: "Vaso alto con cintura",
        hint: "Base angosta, cintura central y abertura superior amplia",
        hMax: 22,
        rMax: 3.55,
        water: "#28a7ff",
        glassTint: "#e3f7ff",
        cap: "none",
        explanation:
          "El vaso es más angosto en la parte baja y central, así que ahí el agua sube más rápido. En la parte superior se ensancha y la altura aumenta más lentamente.",
        profile: [
          [0.00, 0.46],
          [0.05, 0.62],
          [0.15, 0.58],
          [0.30, 0.46],
          [0.43, 0.42],
          [0.58, 0.52],
          [0.72, 0.72],
          [0.88, 0.90],
          [1.00, 0.91]
        ],
        ridges: [0.04, 0.10, 0.88, 0.98]
      }
    };

    const state = {
      vesselKey: "barrilVerde",
      Q: 22,
      speed: 1,
      t: 0,
      playing: false,
      lastFrame: 0,
      model: null
    };

    const vesselSvg = document.getElementById("vesselSvg");
    const heightChart = document.getElementById("heightChart");
    const rateChart = document.getElementById("rateChart");
    const vesselSelect = document.getElementById("vesselSelect");
    const flowInput = document.getElementById("flowInput");
    const speedInput = document.getElementById("speedInput");
    const playBtn = document.getElementById("playBtn");
    const resetBtn = document.getElementById("resetBtn");

    const statTime = document.getElementById("statTime");
    const statHeight = document.getElementById("statHeight");
    const statRate = document.getElementById("statRate");
    const statVolume = document.getElementById("statVolume");
    const shapeHint = document.getElementById("shapeHint");
    const readingsBody = document.getElementById("readingsBody");
    const explanation = document.getElementById("explanation");
    const areaMeter = document.getElementById("areaMeter");
    const areaLabel = document.getElementById("areaLabel");

    for (const [key, vessel] of Object.entries(vessels)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = vessel.label;
      vesselSelect.appendChild(option);
    }

    vesselSelect.value = state.vesselKey;

    function radiusAt(vessel, normH) {
      const p = vessel.profile;
      const x = clamp(normH, 0, 1);

      if (x <= p[0][0]) return p[0][1];
      if (x >= p[p.length - 1][0]) return p[p.length - 1][1];

      for (let i = 0; i < p.length - 1; i++) {
        const [x0, r0] = p[i];
        const [x1, r1] = p[i + 1];

        if (x >= x0 && x <= x1) {
          const u = (x - x0) / (x1 - x0);
          const smooth = u * u * (3 - 2 * u);
          return r0 + (r1 - r0) * smooth;
        }
      }

      return p[p.length - 1][1];
    }

    function areaAtHeight(vessel, h) {
      const norm = clamp(h / vessel.hMax, 0, 1);
      const r = vessel.rMax * radiusAt(vessel, norm);
      return Math.PI * r * r;
    }

    function buildModel(vessel, Q) {
      const steps = 1100;
      const samples = [];
      let volume = 0;
      let previousArea = areaAtHeight(vessel, 0);

      samples.push({
        h: 0,
        v: 0,
        area: previousArea
      });

      for (let i = 1; i <= steps; i++) {
        const h = vessel.hMax * i / steps;
        const area = areaAtHeight(vessel, h);
        const dh = vessel.hMax / steps;

        volume += 0.5 * (previousArea + area) * dh;

        samples.push({
          h,
          v: volume,
          area
        });

        previousArea = area;
      }

      for (const s of samples) {
        s.t = s.v / Q;
        s.rate = Q / s.area;
      }

      const maxArea = Math.max(...samples.map(s => s.area));
      const minArea = Math.min(...samples.map(s => s.area));
      const maxRate = Math.max(...samples.map(s => s.rate));
      const totalVolume = samples[samples.length - 1].v;
      const tFinal = totalVolume / Q;

      return {
        samples,
        totalVolume,
        tFinal,
        maxRate,
        maxArea,
        minArea
      };
    }

    function stateAtTime(t) {
      const vessel = vessels[state.vesselKey];
      const model = state.model;
      const clampedT = clamp(t, 0, model.tFinal);
      const targetVolume = clampedT * state.Q;

      if (targetVolume <= 0) {
        const area = areaAtHeight(vessel, 0);
        return {
          t: 0,
          h: 0,
          v: 0,
          area,
          rate: state.Q / area
        };
      }

      if (targetVolume >= model.totalVolume) {
        const area = areaAtHeight(vessel, vessel.hMax);
        return {
          t: model.tFinal,
          h: vessel.hMax,
          v: model.totalVolume,
          area,
          rate: state.Q / area
        };
      }

      let lo = 0;
      let hi = model.samples.length - 1;

      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (model.samples[mid].v < targetVolume) lo = mid + 1;
        else hi = mid;
      }

      const b = model.samples[lo];
      const a = model.samples[lo - 1];
      const u = (targetVolume - a.v) / (b.v - a.v);
      const h = a.h + (b.h - a.h) * u;
      const area = areaAtHeight(vessel, h);

      return {
        t: clampedT,
        h,
        v: targetVolume,
        area,
        rate: state.Q / area
      };
    }

    function render() {
      const vessel = vessels[state.vesselKey];
      const current = stateAtTime(state.t);

      shapeHint.textContent = vessel.hint;
      explanation.textContent = vessel.explanation;

      statTime.textContent = `${current.t.toFixed(1)} s`;
      statHeight.textContent = `${current.h.toFixed(1)} cm`;
      statRate.textContent = `${current.rate.toFixed(2)} cm/s`;
      statVolume.textContent = `${current.v.toFixed(0)} mL`;

      const areaPercent = 100 * current.area / state.model.maxArea;
      areaMeter.style.width = `${areaPercent.toFixed(1)}%`;
      areaLabel.textContent = `${areaPercent.toFixed(0)}%`;

      drawVessel(vessel, current);
      drawHeightChart(vessel, current);
      drawRateChart(vessel, current);
      drawReadings(current);
    }

    function drawVessel(vessel, current) {
      const W = 360;
      const H = 560;
      const cx = 178;
      const topY = 54;
      const bottomY = 510;
      const bodyH = bottomY - topY;
      const maxW = 104;
      const steps = 90;
      const levelNorm = clamp(current.h / vessel.hMax, 0, 1);
      const surfaceY = yFromNorm(levelNorm);
      const surfaceR = maxW * radiusAt(vessel, levelNorm);

      function yFromNorm(n) {
        return topY + (1 - n) * bodyH;
      }

      function xRight(n) {
        return cx + maxW * radiusAt(vessel, n);
      }

      function xLeft(n) {
        return cx - maxW * radiusAt(vessel, n);
      }

      const right = [];
      const left = [];

      for (let i = 0; i <= steps; i++) {
        const n = i / steps;
        right.push([xRight(n), yFromNorm(n)]);
      }

      for (let i = steps; i >= 0; i--) {
        const n = i / steps;
        left.push([xLeft(n), yFromNorm(n)]);
      }

      const path = "M " + [...right, ...left].map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + " Z";

      const tickStep = niceStep(vessel.hMax / 7);
      const ticks = [];
      for (let h = 0; h <= vessel.hMax + 0.0001; h += tickStep) {
        const n = h / vessel.hMax;
        const y = yFromNorm(n);
        ticks.push(`
          <line class="ruler-tick" x1="38" y1="${y}" x2="54" y2="${y}" />
          <text class="ruler-text" x="31" y="${y + 4}" text-anchor="end">${formatTick(h)} cm</text>
        `);
      }

      const ridges = vessel.ridges.map((n, i) => {
        const y = yFromNorm(n);
        const r = maxW * radiusAt(vessel, n) * 0.92;
        const amp = i % 2 === 0 ? 7 : -6;

        return `
          <path class="ridge" d="M ${cx - r} ${y} C ${cx - r * 0.45} ${y + amp}, ${cx + r * 0.45} ${y - amp}, ${cx + r} ${y}" />
          <path class="ridge-light" d="M ${cx - r * 0.88} ${y - 4} C ${cx - r * 0.25} ${y - 10}, ${cx + r * 0.28} ${y + 2}, ${cx + r * 0.88} ${y - 4}" />
        `;
      }).join("");

      const fillHeight = bottomY - surfaceY;

      vesselSvg.innerHTML = `
        <defs>
          <clipPath id="vesselClip">
            <path d="${path}"></path>
          </clipPath>

          <linearGradient id="waterGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#bfefff" stop-opacity="0.92" />
            <stop offset="45%" stop-color="${vessel.water}" stop-opacity="0.58" />
            <stop offset="100%" stop-color="${vessel.water}" stop-opacity="0.86" />
          </linearGradient>

          <linearGradient id="glassGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.82" />
            <stop offset="50%" stop-color="${vessel.glassTint}" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.45" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="${W}" height="${H}" fill="transparent"></rect>

        <line class="ruler-line" x1="54" y1="${topY}" x2="54" y2="${bottomY}" />
        ${ticks.join("")}
        <text class="small-label" x="54" y="535" text-anchor="middle">altura</text>

        <path d="${path}" fill="url(#glassGradient)" stroke="none" opacity="0.75"></path>

        <rect
          clip-path="url(#vesselClip)"
          x="0"
          y="${surfaceY}"
          width="${W}"
          height="${fillHeight}"
          fill="url(#waterGradient)"
        />

        <path d="${path}" class="glass-outline"></path>

        ${ridges}

        <path class="glass-highlight" d="M ${cx - 42} ${topY + 42} C ${cx - 76} ${topY + 148}, ${cx - 56} ${bottomY - 150}, ${cx - 30} ${bottomY - 58}" />
        <path class="glass-highlight" d="M ${cx + 48} ${topY + 66} C ${cx + 78} ${topY + 170}, ${cx + 56} ${bottomY - 130}, ${cx + 32} ${bottomY - 62}" opacity="0.45" />

        <line
          class="water-surface"
          x1="${cx - surfaceR + 4}"
          y1="${surfaceY}"
          x2="${cx + surfaceR - 4}"
          y2="${surfaceY}"
        />

        <line
          x1="${cx + surfaceR + 10}"
          y1="${surfaceY}"
          x2="330"
          y2="${surfaceY}"
          stroke="#0756c8"
          stroke-width="2"
          stroke-dasharray="6 6"
          opacity="0.75"
        />

        <circle cx="330" cy="${surfaceY}" r="5" fill="#ff8a00" />
        <text class="svg-label" x="330" y="${surfaceY - 12}" text-anchor="middle">${current.h.toFixed(1)} cm</text>

        ${drawCap(vessel, cx, topY, maxW)}
      `;
    }

    function drawCap(vessel, cx, topY, maxW) {
      const topRadius = maxW * radiusAt(vessel, 1);

      if (vessel.cap === "mint") {
        return `
          <rect x="${cx - topRadius - 20}" y="${topY - 30}" width="${2 * topRadius + 40}" height="30" rx="15"
            fill="#a7e5b8" stroke="rgba(15,23,42,0.35)" stroke-width="2" />
          <ellipse cx="${cx}" cy="${topY - 2}" rx="${topRadius + 19}" ry="10"
            fill="rgba(255,255,255,0.35)" stroke="rgba(15,23,42,0.25)" />
        `;
      }

      if (vessel.cap === "silver") {
        return `
          <rect x="${cx - 39}" y="${topY - 44}" width="78" height="45" rx="7"
            fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
          <path d="M ${cx - 34} ${topY - 35} l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12"
            fill="none" stroke="#64748b" stroke-width="2" />
        `;
      }

      if (vessel.cap === "sport") {
        return `
          <rect x="${cx - 26}" y="${topY - 54}" width="52" height="54" rx="12"
            fill="#dbeafe" stroke="#64748b" stroke-width="2" />
          <rect x="${cx - 16}" y="${topY - 76}" width="32" height="28" rx="10"
            fill="#93c5fd" stroke="#64748b" stroke-width="2" />
          <line x1="${cx - 20}" y1="${topY - 34}" x2="${cx + 20}" y2="${topY - 34}"
            stroke="#64748b" stroke-width="2" />
        `;
      }

      return "";
    }

    function drawHeightChart(vessel, current) {
      drawChart({
        svg: heightChart,
        title: "h(t)",
        yLabel: "Altura, cm",
        yMax: vessel.hMax,
        color: "#1677ff",
        futureColor: "rgba(22,119,255,0.18)",
        getY: d => d.h,
        currentY: current.h,
        current,
        formatter: v => `${v.toFixed(1)}`
      });
    }

    function drawRateChart(vessel, current) {
      drawChart({
        svg: rateChart,
        title: "dh/dt",
        yLabel: "cm/s",
        yMax: state.model.maxRate * 1.12,
        color: "#ff8a00",
        futureColor: "rgba(255,138,0,0.2)",
        getY: d => d.rate,
        currentY: current.rate,
        current,
        formatter: v => `${v.toFixed(2)}`
      });
    }

    function drawChart(config) {
      const W = 640;
      const H = 315;
      const margin = { left: 68, right: 26, top: 26, bottom: 48 };
      const plotW = W - margin.left - margin.right;
      const plotH = H - margin.top - margin.bottom;

      const xMax = state.model.tFinal;
      const yMax = config.yMax;
      const data = state.model.samples;
      const visible = data.filter(d => d.t <= state.t);

      if (visible.length === 0 || visible[visible.length - 1].t < config.current.t) {
        visible.push({
          t: config.current.t,
          h: config.current.h,
          rate: config.current.rate
        });
      }

      const x = t => margin.left + plotW * t / xMax;
      const y = value => margin.top + plotH * (1 - value / yMax);

      const xTicks = makeTicks(xMax, 6);
      const yTicks = makeTicks(yMax, 5);

      const grid = [
        ...xTicks.map(t => `
          <line x1="${x(t)}" y1="${margin.top}" x2="${x(t)}" y2="${margin.top + plotH}"
            stroke="#dbe3ef" stroke-width="1" />
          <text x="${x(t)}" y="${H - 18}" text-anchor="middle" font-size="12" fill="#475569" font-weight="700">
            ${formatTick(t)}
          </text>
        `),
        ...yTicks.map(v => `
          <line x1="${margin.left}" y1="${y(v)}" x2="${margin.left + plotW}" y2="${y(v)}"
            stroke="#dbe3ef" stroke-width="1" />
          <text x="${margin.left - 10}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="#475569" font-weight="700">
            ${config.formatter(v)}
          </text>
        `)
      ].join("");

      const futurePath = makePath(data, x, y, config.getY);
      const visiblePath = makePath(visible, x, y, config.getY);

      const cx = x(config.current.t);
      const cy = y(config.currentY);

      config.svg.innerHTML = `
        <rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="#ffffff" />

        ${grid}

        <line x1="${margin.left}" y1="${margin.top + plotH}" x2="${margin.left + plotW}" y2="${margin.top + plotH}"
          stroke="#334155" stroke-width="2" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotH}"
          stroke="#334155" stroke-width="2" />

        <path d="${futurePath}" fill="none" stroke="${config.futureColor}" stroke-width="5" stroke-linecap="round" />
        <path d="${visiblePath}" fill="none" stroke="${config.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

        <line x1="${cx}" y1="${margin.top}" x2="${cx}" y2="${margin.top + plotH}"
          stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 6" />

        <line x1="${margin.left}" y1="${cy}" x2="${margin.left + plotW}" y2="${cy}"
          stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 6" />

        <circle cx="${cx}" cy="${cy}" r="8" fill="#ff8a00" stroke="#ffffff" stroke-width="4" />

        <rect x="${Math.min(cx + 12, W - 172)}" y="${Math.max(cy - 38, 12)}" width="156" height="30" rx="12"
          fill="#0f172a" opacity="0.92" />
        <text x="${Math.min(cx + 90, W - 94)}" y="${Math.max(cy - 18, 32)}" text-anchor="middle"
          font-size="13" fill="#ffffff" font-weight="900">
          t=${config.current.t.toFixed(1)}s
        </text>

        <text x="${margin.left + plotW / 2}" y="${H - 3}" text-anchor="middle" font-size="13" fill="#334155" font-weight="900">
          Tiempo, s
        </text>

        <text x="18" y="${margin.top + plotH / 2}" transform="rotate(-90 18 ${margin.top + plotH / 2})"
          text-anchor="middle" font-size="13" fill="#334155" font-weight="900">
          ${config.yLabel}
        </text>
      `;
    }

    function makePath(data, x, y, getY) {
      if (!data.length) return "";
      return data.map((d, i) => {
        const px = x(d.t);
        const py = y(getY(d));
        return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
      }).join(" ");
    }

    function drawReadings(current) {
      const rows = [];
      const step = niceStep(state.model.tFinal / 8);
      let count = 1;

      for (let t = 0; t <= state.t + 0.0001; t += step) {
        const s = stateAtTime(t);
        rows.push(`
          <tr>
            <td>${count}</td>
            <td>${s.t.toFixed(1)} s</td>
            <td>${s.h.toFixed(1)} cm</td>
            <td>${s.rate.toFixed(2)} cm/s</td>
          </tr>
        `);
        count++;
      }

      if (current.t > 0) {
        rows.push(`
          <tr class="current-row">
            <td>Actual</td>
            <td>${current.t.toFixed(1)} s</td>
            <td>${current.h.toFixed(1)} cm</td>
            <td>${current.rate.toFixed(2)} cm/s</td>
          </tr>
        `);
      }

      readingsBody.innerHTML = rows.join("");
    }

    function resetSimulation() {
      const vessel = vessels[state.vesselKey];
      state.Q = Math.max(1, Number(flowInput.value) || 22);
      state.speed = Number(speedInput.value) || 1;
      state.model = buildModel(vessel, state.Q);
      state.t = 0;
      state.playing = false;
      playBtn.textContent = "Iniciar";
      render();
    }

    function togglePlay() {
      state.playing = !state.playing;
      playBtn.textContent = state.playing ? "Pausar" : "Continuar";

      if (state.t >= state.model.tFinal) {
        state.t = 0;
        state.playing = true;
        playBtn.textContent = "Pausar";
      }
    }

    function animate(timestamp) {
      if (!state.lastFrame) state.lastFrame = timestamp;

      const dt = (timestamp - state.lastFrame) / 1000;
      state.lastFrame = timestamp;

      if (state.playing) {
        state.speed = Number(speedInput.value) || 1;
        state.t += dt * state.speed;

        if (state.t >= state.model.tFinal) {
          state.t = state.model.tFinal;
          state.playing = false;
          playBtn.textContent = "Repetir";
        }

        render();
      }

      requestAnimationFrame(animate);
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function niceStep(raw) {
      if (raw <= 0 || !isFinite(raw)) return 1;

      const power = Math.pow(10, Math.floor(Math.log10(raw)));
      const normalized = raw / power;

      if (normalized <= 1) return power;
      if (normalized <= 2) return 2 * power;
      if (normalized <= 5) return 5 * power;
      return 10 * power;
    }

    function makeTicks(max, desired) {
      const step = niceStep(max / desired);
      const ticks = [];

      for (let v = 0; v <= max + step * 0.2; v += step) {
        ticks.push(v);
      }

      if (ticks[ticks.length - 1] < max) {
        ticks.push(max);
      }

      return ticks;
    }

    function formatTick(value) {
      if (Math.abs(value) >= 100) return value.toFixed(0);
      if (Math.abs(value) >= 10) return value.toFixed(0);
      if (Math.abs(value) >= 1) return value.toFixed(1).replace(".0", "");
      return value.toFixed(2);
    }

    vesselSelect.addEventListener("change", () => {
      state.vesselKey = vesselSelect.value;
      resetSimulation();
    });

    flowInput.addEventListener("change", resetSimulation);
    speedInput.addEventListener("change", () => {
      state.speed = Number(speedInput.value) || 1;
    });

    playBtn.addEventListener("click", togglePlay);
    resetBtn.addEventListener("click", resetSimulation);

    resetSimulation();
    requestAnimationFrame(animate);
  </script>
</body>
</html>
