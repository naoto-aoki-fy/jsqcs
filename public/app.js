// public/app.js
// Minimal UI glue that calls into the pure JavaScript simulator.

import { init, reset, numQubits, dim, applyGate, getProbsRange, sample } from './qs.js';

console.log('[app.js] script loaded');

function updateProbTable() {
  const viewCount = Math.min(Number(document.getElementById('viewCount').value || 4096), dim());
  console.log('[updateProbTable] viewCount', viewCount);
  const probs = getProbsRange(0, viewCount);
  const container = document.getElementById('probs');
  const rows = [];
  rows.push('<table><thead><tr><th>#</th><th>bitstring</th><th>P</th></tr></thead><tbody>');
  const n = numQubits();
  for (let i = 0; i < probs.length; ++i) {
    if (probs[i] === 0) continue;
    const bits = i.toString(2).padStart(n, '0');
    rows.push(`<tr><td class="idx">${i}</td><td><code>${bits}</code></td><td>${probs[i].toFixed(6)}</td></tr>`);
  }
  rows.push('</tbody></table>');
  container.innerHTML = rows.join('');
}

function oneShot() {
  const idx = sample();
  const n = numQubits();
  const bits = idx.toString(2).padStart(n, '0');
  console.log('[oneShot] idx', idx);
  document.getElementById('shotOut').textContent = `→ 測定結果: |${bits}⟩  (index ${idx})`;
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
    const thr = Number(document.getElementById('nThreads').value || navigator.hardwareConcurrency || 4);
    console.log('[btnInit.click]', { n, thr });
    init(n, thr);
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
  updateGateParamsUI();
}

function setup() {
  console.log('[ready]');
  bindUI();
}

setup();
