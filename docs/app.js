// docs/app.js
// Minimal UI glue that calls into the pure JavaScript simulator.

import { init, reset, numQubits, dim, applyGate, getAmpsRange, sample } from './qs.js';

console.log('[app.js] script loaded');

const translations = {
  ja: {
    title: 'JavaScript 量子状態ベクトルシミュレータ',
    headerTitle: 'JavaScript 量子状態ベクトルシミュレータ',
    pillText: '純粋な JavaScript 実装',
    initHeading: '初期化',
    numQubits: '量子ビット数:',
    btnInit: '初期化',
    btnReset: '|0…0⟩ にリセット',
    gateHeading: 'ゲート適用',
    lblGate: 'ゲート:',
    lblTarget: 'ターゲット q:',
    lblControl: '制御 q:',
    lblTheta: 'θ:',
    btnApplyGate: '適用',
    probHeading: '確率振幅のプレビュー',
    lblViewCount: '表示件数（先頭から）',
    btnRefresh: '更新',
    btnOneShot: '1ショット測定',
    shotPrefix: '→ 測定結果:',
    indexWord: 'インデックス',
    footerText: "", //'© MIT License / デモ',
    btnLang: 'English',
    tableHead: '<table><thead><tr><th>#</th><th>ビット列</th><th>振幅</th></tr></thead><tbody>',
  },
  en: {
    title: 'JavaScript Quantum State Vector Simulator',
    headerTitle: 'JavaScript Quantum State Vector Simulator',
    pillText: 'Pure JavaScript implementation',
    initHeading: 'Initialization',
    numQubits: 'Qubits:',
    btnInit: 'Initialize',
    btnReset: 'Reset to |0…0⟩',
    gateHeading: 'Apply Gate',
    lblGate: 'Gate:',
    lblTarget: 'Target q:',
    lblControl: 'Control q:',
    lblTheta: 'θ:',
    btnApplyGate: 'Apply',
    probHeading: 'Amplitude Preview',
    lblViewCount: 'Entries to display (from start)',
    btnRefresh: 'Refresh',
    btnOneShot: 'One-shot measure',
    shotPrefix: '→ Measurement result:',
    indexWord: 'index',
    footerText: "", // '© MIT License / Demo',
    btnLang: '日本語',
    tableHead: '<table><thead><tr><th>#</th><th>bitstring</th><th>Amp</th></tr></thead><tbody>',
  }
};

let currentLang = navigator.language && navigator.language.startsWith('ja') ? 'ja' : 'en';

function setLang(lang) {
  currentLang = lang;
  const t = translations[lang];
  document.documentElement.lang = lang;
  document.title = t.title;
  document.getElementById('headerTitle').textContent = t.headerTitle;
  document.getElementById('pillText').textContent = t.pillText;
  document.getElementById('initHeading').textContent = t.initHeading;
  document.getElementById('lblNumQubits').textContent = t.numQubits;
  document.getElementById('btnInit').textContent = t.btnInit;
  document.getElementById('btnReset').textContent = t.btnReset;
  document.getElementById('gateHeading').textContent = t.gateHeading;
  document.getElementById('lblGate').textContent = t.lblGate;
  document.getElementById('lblTargetText').textContent = t.lblTarget;
  document.getElementById('lblControlText').textContent = t.lblControl;
  document.getElementById('lblThetaText').textContent = t.lblTheta;
  document.getElementById('btnApplyGate').textContent = t.btnApplyGate;
  document.getElementById('probHeading').textContent = t.probHeading;
  document.getElementById('lblViewCount').textContent = t.lblViewCount;
  document.getElementById('btnRefresh').textContent = t.btnRefresh;
  document.getElementById('btnOneShot').textContent = t.btnOneShot;
  document.getElementById('footerText').textContent = t.footerText;
  document.getElementById('btnLang').textContent = t.btnLang;
  updateProbTable();
}

function updateProbTable() {
  const viewCount = Math.min(Number(document.getElementById('viewCount').value || 4096), dim());
  console.log('[updateProbTable] viewCount', viewCount);
  const amps = getAmpsRange(0, viewCount);
  const container = document.getElementById('probs');
  const rows = [];
  rows.push(translations[currentLang].tableHead);
  const n = numQubits();
  const cnt = amps.length >> 1;
  for (let i = 0; i < cnt; ++i) {
    const r = amps[2 * i];
    const im = amps[2 * i + 1];
    if (r === 0 && im === 0) continue;
    const bits = i.toString(2).padStart(n, '0');
    const ampStr = `${r.toFixed(6)}${im >= 0 ? '+' : ''}${im.toFixed(6)}i`;
    rows.push(`<tr><td class="idx">${i}</td><td><code>${bits}</code></td><td>${ampStr}</td></tr>`);
  }
  rows.push('</tbody></table>');
  container.innerHTML = rows.join('');
}

function oneShot() {
  const idx = sample();
  const n = numQubits();
  const bits = idx.toString(2).padStart(n, '0');
  console.log('[oneShot] idx', idx);
  const t = translations[currentLang];
  document.getElementById('shotOut').textContent = `${t.shotPrefix} |${bits}⟩  (${t.indexWord} ${idx})`;
}

function applyGateFromUI(kind) {
  const t = Number(document.getElementById('targetQ').value || 0);
  const c = Number(document.getElementById('controlQ').value || 1);
  const th = Number(document.getElementById('theta').value || 0);
  console.log('[applyGateFromUI]', { kind, t, c, th });
  applyGate(kind, t, c, th);
  updateProbTable();
}

function updateGateParamsUI() {
  const gate = document.getElementById('gateSelect').value;
  const target = document.getElementById('lblTarget');
  const control = document.getElementById('lblControl');
  const theta = document.getElementById('lblTheta');
  target.classList.add('hidden');
  control.classList.add('hidden');
  theta.classList.add('hidden');
  if (gate === 'H' || gate === 'X') {
    target.classList.remove('hidden');
  } else if (gate === 'RX' || gate === 'RY' || gate === 'RZ') {
    target.classList.remove('hidden');
    theta.classList.remove('hidden');
  } else if (gate === 'CNOT') {
    target.classList.remove('hidden');
    control.classList.remove('hidden');
  }
}

function bindUI() {
  console.log('[bindUI] attaching event listeners');
  document.getElementById('btnInit').addEventListener('click', () => {
    const n = Number(document.getElementById('nQubits').value || 18);
    console.log('[btnInit.click]', { n });
    init(n);
    document.getElementById('targetQ').max = String(n-1);
    document.getElementById('controlQ').max = String(n-1);
    updateProbTable();
  });
  document.getElementById('btnReset').addEventListener('click', () => {
    console.log('[btnReset.click]');
    reset();
    updateProbTable();
  });
  const gateSel = document.getElementById('gateSelect');
  gateSel.addEventListener('change', () => {
    console.log('[gateSelect.change]', gateSel.value);
    updateGateParamsUI();
  });
  document.getElementById('btnApplyGate').addEventListener('click', () => {
    console.log('[btnApplyGate.click]', gateSel.value);
    applyGateFromUI(gateSel.value);
  });
  document.getElementById('btnRefresh').addEventListener('click', () => {
    console.log('[btnRefresh.click]');
    updateProbTable();
  });
  document.getElementById('btnOneShot').addEventListener('click', () => {
    console.log('[btnOneShot.click]');
    oneShot();
  });
  document.getElementById('btnLang').addEventListener('click', () => {
    setLang(currentLang === 'ja' ? 'en' : 'ja');
  });
  updateGateParamsUI();
}

function setup() {
  console.log('[ready]');
  bindUI();
  setLang(currentLang);
}

setup();
