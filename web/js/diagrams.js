// SVG diagram helpers for HFHPE Explained slides. All diagrams are schematic, flat-style.
const Diag = {};

// simple head outline with neck, tinted face; `type`: yaw|pitch|roll
function headSVG(x, y, scale, opts) {
  opts = opts || {};
  const tilt = opts.tilt || 0, yaw = opts.yaw || 0;
  const rot = opts.rotate || 0;
  return `<g transform="translate(${x},${y}) scale(${scale}) rotate(${rot})">
    <path d="M0 -62 C-34 -62 -46 -34 -46 -10 C-46 22 -24 48 0 48 C24 48 46 22 46 -10 C46 -34 34 -62 0 -62 Z" fill="#0e1826" stroke="#58c6e8" stroke-width="3"/>
    <path d="M-20 46 Q0 58 20 46" fill="none" stroke="#58c6e8" stroke-width="3"/>
    <path d="M-18 -20 L-16 6" stroke="#58c6e8" stroke-width="2"/>
    <path d="M18 -20 L16 6" stroke="#58c6e8" stroke-width="2"/>
    <ellipse cx="${-14 + yaw*0.8}" cy="-8" rx="7" ry="7" fill="#e9f6ff"/>
    <ellipse cx="${14 + yaw*0.8}" cy="-8" rx="7" ry="7" fill="#e9f6ff"/>
    <circle cx="${-14 + yaw*0.9}" cy="-8" r="2.6" fill="#101c28"/>
    <circle cx="${14 + yaw*0.9}" cy="-8" r="2.6" fill="#101c28"/>
    <path d="M-12 14 Q0 ${20 + tilt} 12 14" fill="none" stroke="#58c6e8" stroke-width="2.4" stroke-linecap="round"/>
  </g>`;
}

Diag.poses = function (variant) {
  const variants = [
    { key:'yaw', label:'Yaw: turn left or right', yaw:variant==='a'?6:-6, tip:'#4cc9f0' },
    { key:'pitch', label:'Pitch: look up or down', yaw:0, pitch:1, tip:'#f72585' },
    { key:'roll', label:'Roll: tilt sideways', yaw:0, rot:variant==='a'?22:-22, tip:'#b8f45c' }
  ];
  return `<div class="poses-row">${variants.map(v => `<div class="pose">
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="120" height="120" fill="#0d1622" rx="8"/>
      <g transform="translate(60,58)">
        ${v.rot ? `<g transform="rotate(${v.rot})">${headSVG(0,0,0.62,{tilt:0})}</g>` : headSVG(0,0,0.62,{yaw:v.yaw||0})}
      </g>
    </svg>
    <div class="pose-label" style="color:${v.tip}">${v.label}</div>
  </div>`).join('')}</div>`;
};

Diag.widerRange = function () {
  return `<div class="wide-range">${[
    { big:'360°', label:'Yaw', sub:'yaw: full 360°', color:'#4cc9f0' },
    { big:'±120°', label:'Pitch', sub:'pitch: about ±120°', color:'#f72585' },
    { big:'360°', label:'Roll', sub:'roll: full 360°', color:'#b8f45c' }
  ].map(i => `<div class="wide-item"><div class="big" style="color:${i.color}">${i.big}</div><div class="lbl" style="color:${i.color}">${i.label}</div><div class="lbl" style="color:#8fa3b5;font-weight:600;font-size:clamp(9px,1vw,13px)">${i.sub}</div></div>`).join('')}</div>`;
};

Diag.cropFlow = function () {
  return `<div class="crop-flow">
    <div class="croplet"><svg viewBox="0 0 170 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="158" height="138" fill="#101c28" stroke="#3a5470" stroke-width="2" rx="6"/>
      <g transform="translate(85,75)">${headSVG(0,0,0.72,{})}</g>
      <rect x="48" y="32" width="74" height="76" fill="none" stroke="#b8f45c" stroke-width="2.5" stroke-dasharray="6 4" rx="3"/>
      <text x="85" y="115" fill="#b8f45c" text-anchor="middle" font-size="9" font-weight="700">HEAD BOX</text>
    </svg><div>Detected head box</div></div>
    <div class="arrow">→</div>
    <div class="croplet"><svg viewBox="0 0 170 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="158" height="138" fill="#101c28" stroke="#3a5470" stroke-width="2" rx="6"/>
      <rect x="36" y="20" width="98" height="98" fill="none" stroke="#ffd166" stroke-width="2.5" stroke-dasharray="6 4" rx="3"/>
      <rect x="50" y="34" width="70" height="70" fill="none" stroke="#b8f45c" stroke-width="2" rx="3"/>
      <g transform="translate(85,69)">${headSVG(0,0,0.55,{})}</g>
      <text x="85" y="115" fill="#ffd166" text-anchor="middle" font-size="9" font-weight="700">MARGIN + SQUARE</text>
    </svg><div>Add margin → make square → resize</div></div>
    <div class="arrow">→</div>
    <div class="croplet"><svg viewBox="0 0 170 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="34" y="10" width="102" height="118" fill="#101c28" stroke="#3a5470" stroke-width="2" rx="6"/>
      <g transform="translate(85,66)">${headSVG(0,0,0.62,{})}</g>
      <rect x="34" y="10" width="102" height="118" fill="none" stroke="#58c6e8" stroke-width="2" rx="6"/>
      <text x="85" y="145" fill="#58c6e8" text-anchor="middle" font-size="9" font-weight="700">MODEL INPUT</text>
    </svg><div>Model input</div></div>
  </div>`;
};

Diag.occlusions = function () {
  const head = '<ellipse cx="0" cy="-8" rx="26" ry="36" fill="#101c28" stroke="#58c6e8" stroke-width="2.5"/><circle cx="-9" cy="-16" r="3.4" fill="#e9f6ff"/><circle cx="9" cy="-16" r="3.4" fill="#e9f6ff"/>';
  const mk = (inner, label) => `<div class="occlusion"><svg viewBox="-40 -62 80 110" xmlns="http://www.w3.org/2000/svg">${head}${inner}</svg><div style="text-align:center;color:#8fa3b5;font-size:11px;font-weight:600">${label}</div></div>`;
  return `<div class="occlusions">
    ${mk('<path d="M-13 8 Q0 14 13 8" stroke="#58c6e8" stroke-width="2.4" fill="none" stroke-linecap="round"/>','Open face')}
    ${mk('<rect x="-16" y="4" width="32" height="14" rx="6" fill="#fef3c7" stroke="#c9a13a" stroke-width="1.5"/>','Mask')}
    ${mk('<rect x="-20" y="-24" width="16" height="9" rx="4" fill="#0b1622" stroke="#58c6e8" stroke-width="2"/><rect x="4" y="-24" width="16" height="9" rx="4" fill="#0b1622" stroke="#58c6e8" stroke-width="2"/><line x1="-4" y1="-21" x2="4" y2="-21" stroke="#58c6e8" stroke-width="2"/>','Sunglasses')}
    ${mk('<path d="M-24 -22 L24 -22 L24 -30 L-24 -30 Z" fill="#ffd166" stroke="#c9a13a" stroke-width="1.5"/><path d="M-14 -22 L-14 -12 L14 -12 L14 -22 Z" fill="#ffd166" stroke="#c9a13a" stroke-width="1.5"/>','Hat')}
  </div>`;
};

Diag.circle359 = function () {
  const r = 62, cx = 78, cy = 62;
  function pt(deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  const p359 = pt(359), p1 = pt(1);
  return `<div class="circle359-layout"><div class="circle-side"><svg viewBox="0 0 156 124" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#58c6e8" stroke-width="2.5"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r - 10}" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 4" opacity=".45"/>
    <line x1="${cx}" y1="${cy}" x2="${p359[0]}" y2="${p359[1]}" stroke="#ffd166" stroke-width="2"/>
    <line x1="${cx}" y1="${cy}" x2="${p1[0]}" y2="${p1[1]}" stroke="#58c6e8" stroke-width="2"/>
    <circle cx="${p359[0]}" cy="${p359[1]}" r="4.5" fill="#ffd166"/>
    <circle cx="${p1[0]}" cy="${p1[1]}" r="4.5" fill="#58c6e8"/>
    <text x="${p359[0] + 6}" y="${p359[1] - 8}" fill="#ffd166" font-size="12" font-weight="800">359°</text>
    <text x="${p1[0] + 6}" y="${p1[1] - 10}" fill="#8ee0ff" font-size="12" font-weight="800">1°</text>
    <text x="${cx - 5}" y="${cy - r - 16}" fill="#fff" font-size="9" text-anchor="middle">0°</text>
  </svg></div>
  <div class="circle-side"><div class="caption"><b>Only 2° apart</b><br/>— direction stays continuous across the boundary<br/><br/>• Ordinary subtraction: 359° − 1° = 358<br/>• Circular distance: 2°<br/>• Avoids a jump at the boundary</div></div></div>`;
};

Diag.circle = function () {
  const r = 66, cx = 78, cy = 66, theta = 45 * Math.PI / 180;
  const ex = cx + r * Math.cos(theta), ey = cy - r * Math.sin(theta);
  return `<div class="circle359-layout"><div class="circle-side"><svg viewBox="0 0 156 132" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#58c6e8" stroke-width="2.5"/>
    <line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="#ffd166" stroke-width="2.5"/>
    <line x1="${cx}" y1="${ey}" x2="${ex}" y2="${ey}" stroke="#ffd166" stroke-width="1.6" stroke-dasharray="4 3" opacity=".7"/>
    <line x1="${ex}" y1="${ey}" x2="${ex}" y2="${cy}" stroke="#58c6e8" stroke-width="1.6" stroke-dasharray="4 3" opacity=".6"/>
    <path d="M ${cx + 14} ${cy} A 14 14 0 0 0 ${cx + 14 * Math.cos(theta)} ${cy - 14 * Math.sin(theta)}" fill="none" stroke="#fff" stroke-width="2"/>
    <circle cx="${ex}" cy="${ey}" r="4" fill="#fff"/>
    <text x="${cx + 22}" y="${cy + 12}" fill="#fff" font-size="11" font-weight="800">θ</text>
    <text x="${cx + r + 4}" y="${cy + 4}" fill="#8ee0ff" font-size="9">cos θ</text>
    <text x="${ex + 5}" y="${ey + 4}" fill="#ffd166" font-size="9">sin θ</text>
  </svg></div>
  <div class="circle-side"><div class="caption"><b>(cos θ, sin θ)</b><br/>— two numbers for one angle<br/><br/>• One angle → two numbers<br/>• 0° and 360° meet on the circle<br/>• Recover the angle: atan2(sin θ, cos θ)</div></div></div>`;
};

Diag.kappa = function () {
  // two von-Mises-ish curves: broad (kappa=2) and narrow (kappa=12)
  // sample x in [-180°,180°], f = normalized exp(kappa * cos(x))
  const xs = []; const fmax = [];
  for (let x = -180; x <= 180; x += 3) xs.push(x);
  const f = (x, k) => Math.exp(Math.max(-9, k * Math.cos(x * Math.PI / 180) * 0.9));
  const maxK2 = Math.max(...xs.map(x => f(x, 2)));
  const maxK12 = Math.max(...xs.map(x => f(x, 12)));
  const W = 300, H = 160, baseY = 140, xMin = -180, xMax = 180, yMax = 1.05;
  const x2px = x => (x - xMin) / (xMax - xMin) * (W - 10) + 5;
  const y2px = (v, m) => baseY - (v / m * 0.95) * (baseY - 12);
  const curve = (k, m) => xs.map((x,i) => `${i ? 'L' : 'M'} ${x2px(x).toFixed(1)} ${y2px(f(x, k), m).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${W}" height="${H}" fill="#0d1622" rx="8"/>
    <line x1="5" y1="${baseY}" x2="${W - 5}" y2="${baseY}" stroke="#3a5470" stroke-width="1.5"/>
    <path d="${curve(2, maxK2)}" fill="none" stroke="#58c6e8" stroke-width="2.4"/>
    <path d="${curve(12, maxK12)}" fill="none" stroke="#f72585" stroke-width="2.4"/>
    <text x="${W - 8}" y="${y2px(f(30, 12), maxK12) - 10}" text-anchor="end" fill="#f72585" font-size="11" font-weight="700">κ = 12</text>
    <text x="${W - 8}" y="${y2px(f(30, 2), maxK2) + 16}" text-anchor="end" fill="#58c6e8" font-size="11" font-weight="700">κ = 2</text>
    <text x="10" y="${baseY - 4}" fill="#8fa3b5" font-size="9">-180°</text>
    <text x="${W / 2}" y="${baseY - 4}" fill="#8fa3b5" font-size="9" text-anchor="middle">0</text>
    <text x="${W - 8}" y="${baseY - 4}" fill="#8fa3b5" font-size="9" text-anchor="end">180</text>
  </svg>`;
};

Diag.rollSep = function (side) {
  // side: 'left' (upright head) or 'right' (rotated head)
  const rot = side === 'right' ? 24 : 0;
  return `<svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="130" height="130" fill="#0d1622" rx="8"/>
    <g transform="translate(65,62) rotate(${rot})">${headSVG(0,0,0.72,{})}</g>
  </svg>`;
};

Diag.teacher = function () {
  const nodes = [];
  for (let i = 0; i < 5; i++) nodes.push(`<circle cx="30" cy="${20 + i * 28}" r="7" fill="#f78ad5"/>`);
  const layers2 = [];
  for (let i = 0; i < 4; i++) layers2.push(`<circle cx="86" cy="${28 + i * 24}" r="5" fill="#f78ad5" opacity=".8"/>`);
  const dots = [];
  for (let i = 0; i < 3; i++) dots.push(`<circle cx="128" cy="${34 + i * 22}" r="5" fill="#b8f45c"/>`);
  return `<svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg">
    ${nodes.join('')}${layers2.join('')}${dots.join('')}
    <line x1="37" y1="20" x2="81" y2="28" stroke="#4a5f78" stroke-width="1.6"/>
    <line x1="37" y1="48" x2="81" y2="52" stroke="#4a5f78" stroke-width="1.6"/>
    <line x1="37" y1="76" x2="81" y2="76" stroke="#4a5f78" stroke-width="1.6"/>
    <line x1="37" y1="104" x2="81" y2="100" stroke="#4a5f78" stroke-width="1.6"/>
    <line x1="37" y1="132" x2="81" y2="76" stroke="#4a5f78" stroke-width="1.6"/>
    <line x1="91" y1="28" x2="123" y2="34" stroke="#4a5f78" stroke-width="1.6"/>
    <line x1="91" y1="52" x2="123" y2="56" stroke="#4a5f78" stroke-width="1.6"/>
    <line x1="91" y1="76" x2="123" y2="78" stroke="#4a5f78" stroke-width="1.6"/>
  </svg>`;
};

Diag.sameContent = function () {
  const masked = (size) => `<g transform="translate(${size === 'L' ? 65 : 150},66) scale(${size === 'L' ? 1 : 0.62})">
    <ellipse cx="0" cy="-10" rx="34" ry="44" fill="#101c28" stroke="#58c6e8" stroke-width="3"/>
    <circle cx="-12" cy="-22" r="4" fill="#e9f6ff"/><circle cx="12" cy="-22" r="4" fill="#e9f6ff"/>
    <rect x="-18" y="-6" width="36" height="16" rx="7" fill="#fef3c7" stroke="#c9a13a" stroke-width="2"/>
  </g>`;
  return `<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
    ${masked('L')}${masked('R')}
    <line x1="104" y1="68" x2="132" y2="68" stroke="#ffd166" stroke-width="3" stroke-dasharray="5 4"/>
    <path d="M128 68 L134 68 M128 68 L132 64 M128 68 L132 72" stroke="#ffd166" stroke-width="3" fill="none"/>
  </svg>`;
};

Diag.venn = function () {
  return `<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(38,24)">
      <circle cx="58" cy="62" r="44" fill="#1b5f6b" opacity=".86" stroke="#58c6e8" stroke-width="2"/>
      <circle cx="118" cy="62" r="44" fill="#3b2a4a" opacity=".88" stroke="#e06fd3" stroke-width="2"/>
      <text x="52" y="63" text-anchor="middle" fill="#dffef6" font-size="15" font-weight="800">train</text>
      <text x="124" y="63" text-anchor="middle" fill="#ffe3f6" font-size="15" font-weight="800">validation</text>
      <text x="88" y="142" text-anchor="middle" fill="#c8b8d8" font-size="12" font-style="italic">-- unified --</text>
    </g>
  </svg>`;
};

Diag.resolution = function () {
  return `<div class="resolution-layout">
    <div class="panel"><svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="130" height="130" fill="#0d1622" rx="8"/><g transform="translate(65,64) scale(0.78)">${headSVG(0,0,0.72,{})}</g></svg><div class="size" style="color:#4cc9f0">64 × 64</div></div>
    <div class="panel"><svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="130" height="130" fill="#0d1622" rx="8"/><g transform="translate(65,64) scale(0.78)">${headSVG(0,0,0.72,{})}</g></svg><div class="size" style="color:#b8f45c">128 × 128</div></div>
  </div>`;
};

Diag.latencyBars = function () {
  return `<div class="latency-bars">
    <div class="latency-bar-row"><div class="name">ViT-T 64</div><div class="track"><div class="fill" style="width:64%"></div></div><div class="val">2.5 ms</div></div>
    <div class="latency-bar-row"><div class="name">HGNetV2 64</div><div class="track"><div class="fill" style="width:36%"></div></div><div class="val">1.4 ms</div></div>
    <div style="text-align:center;color:#8fa3b5;font-size:clamp(9px,1vw,13px)">i9-10900K · ONNX Runtime 1.22 CPU / batch 1</div>
  </div>`;
};

Diag.cornersPanel = function (variant) {
  // variant 'crop' = crop-first rotated (corners seen), 'context' = wide context
  const wide = variant === 'context';
  const W = wide ? 170 : 130, H = 130;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${W}" height="${H}" fill="#101c28" rx="8"/>
    <g transform="translate(${W / 2},${H / 2}) rotate(-16)">
      <rect x="${-(wide ? 52 : 40)}" y="-52" width="${wide ? 104 : 80}" height="104" fill="#0d1622" stroke="#3a5470" stroke-width="2"/>
      <g transform="translate(0,-4) scale(0.62)">${headSVG(0,0,0.72,{})}</g>
      ${wide ? '<line x1="-52" y1="0" x2="52" y2="0" stroke="#58c6e8" stroke-width="1" opacity=".25"/><line x1="0" y1="-52" x2="0" y2="52" stroke="#58c6e8" stroke-width="1" opacity=".25"/>' : ''}
    </g>
    ${wide ? '' : '<polygon points="8,10 40,10 8,42" fill="#3a5470" opacity=".55"/><polygon points="' + (W - 8) + ',10 ' + (W - 40) + ',10 ' + (W - 8) + ',42" fill="#3a5470" opacity=".55"/><polygon points="8,' + (H - 10) + ' 40,' + (H - 10) + ' 8,' + (H - 42) + '" fill="#3a5470" opacity=".55"/><polygon points="' + (W - 8) + ',' + (H - 10) + ' ' + (W - 40) + ',' + (H - 10) + ' ' + (W - 8) + ',' + (H - 42) + '" fill="#3a5470" opacity=".55"/>'}
  </svg>`;
};
