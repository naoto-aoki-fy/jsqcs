// docs/qs.js
// Pure JavaScript state-vector simulator replacing the previous WebAssembly implementation.

// State vector stored as interleaved real/imag pairs in a Float64Array.
let nQubits = 0;
let dimSize = 0;
let state = new Float64Array(0);
let scratch = new Float64Array(0);

function insertZeroBit(p, tbit) {
  const lowmask = (1 << tbit) - 1;
  const low = p & lowmask;
  const high = p >>> tbit;
  return (high << (tbit + 1)) | low;
}

function applyMatrix2x2(target, m00, m01, m10, m11) {
  const pairs = dimSize >> 1;
  for (let p = 0; p < pairs; ++p) {
    const i0 = insertZeroBit(p, target);
    const i1 = i0 | (1 << target);
    const a0r = state[2 * i0], a0i = state[2 * i0 + 1];
    const a1r = state[2 * i1], a1i = state[2 * i1 + 1];
    scratch[2 * i0]     = m00[0] * a0r - m00[1] * a0i + m01[0] * a1r - m01[1] * a1i;
    scratch[2 * i0 + 1] = m00[0] * a0i + m00[1] * a0r + m01[0] * a1i + m01[1] * a1r;
    scratch[2 * i1]     = m10[0] * a0r - m10[1] * a0i + m11[0] * a1r - m11[1] * a1i;
    scratch[2 * i1 + 1] = m10[0] * a0i + m10[1] * a0r + m11[0] * a1i + m11[1] * a1r;
  }
  [state, scratch] = [scratch, state];
}

function applyX(target) {
  const pairs = dimSize >> 1;
  for (let p = 0; p < pairs; ++p) {
    const i0 = insertZeroBit(p, target);
    const i1 = i0 | (1 << target);
    const r0 = state[2 * i0], i0v = state[2 * i0 + 1];
    const r1 = state[2 * i1], i1v = state[2 * i1 + 1];
    scratch[2 * i0] = r1; scratch[2 * i0 + 1] = i1v;
    scratch[2 * i1] = r0; scratch[2 * i1 + 1] = i0v;
  }
  [state, scratch] = [scratch, state];
}

function applyH(target) {
  const s = 1 / Math.sqrt(2);
  const m00 = [s, 0], m01 = [s, 0];
  const m10 = [s, 0], m11 = [-s, 0];
  applyMatrix2x2(target, m00, m01, m10, m11);
}

function applyRZ(target, theta) {
  const c = Math.cos(0.5 * theta);
  const s = Math.sin(0.5 * theta);
  const e0 = [c, -s];
  const e1 = [c, +s];
  const pairs = dimSize >> 1;
  for (let p = 0; p < pairs; ++p) {
    const i0 = insertZeroBit(p, target);
    const i1 = i0 | (1 << target);
    const a0r = state[2 * i0], a0i = state[2 * i0 + 1];
    const a1r = state[2 * i1], a1i = state[2 * i1 + 1];
    scratch[2 * i0]     = e0[0] * a0r - e0[1] * a0i;
    scratch[2 * i0 + 1] = e0[0] * a0i + e0[1] * a0r;
    scratch[2 * i1]     = e1[0] * a1r - e1[1] * a1i;
    scratch[2 * i1 + 1] = e1[0] * a1i + e1[1] * a1r;
  }
  [state, scratch] = [scratch, state];
}

function applyRY(target, theta) {
  const c = Math.cos(0.5 * theta);
  const s = Math.sin(0.5 * theta);
  const m00 = [c, 0], m01 = [-s, 0];
  const m10 = [s, 0], m11 = [c, 0];
  applyMatrix2x2(target, m00, m01, m10, m11);
}

function applyRX(target, theta) {
  const c = Math.cos(0.5 * theta);
  const s = Math.sin(0.5 * theta);
  const m00 = [c, 0], m01 = [0, -s];
  const m10 = [0, -s], m11 = [c, 0];
  applyMatrix2x2(target, m00, m01, m10, m11);
}

function applyCNOT(control, target) {
  if (control === target) return;
  const cmask = 1 << control;
  const tmask = 1 << target;
  for (let i = 0; i < dimSize; ++i) {
    const dst = (i & cmask) ? (i ^ tmask) : i;
    scratch[2 * dst] = state[2 * i];
    scratch[2 * dst + 1] = state[2 * i + 1];
  }
  [state, scratch] = [scratch, state];
}

export function init(n, thr) {
  console.log('[init]', { n, thr });
  nQubits = n > 28 ? 28 : n;
  dimSize = 1 << nQubits;
  state = new Float64Array(dimSize * 2);
  scratch = new Float64Array(dimSize * 2);
  state[0] = 1; // |0...0>
}

export function reset() {
  console.log('[reset]');
  state.fill(0);
  scratch.fill(0);
  if (state.length) state[0] = 1;
}

export function free() {
  console.log('[free]');
  nQubits = 0;
  dimSize = 0;
  state = new Float64Array(0);
  scratch = new Float64Array(0);
}

export function numQubits() {
  const n = nQubits;
  console.log('[numQubits]', n);
  return n;
}

export function dim() {
  const d = dimSize;
  console.log('[dim]', d);
  return d;
}

export function applyGate(kind, target, control, theta) {
  console.log('[applyGate]', { kind, target, control, theta });
  switch (kind) {
    case 'H': applyH(target); break;
    case 'X': applyX(target); break;
    case 'RX': applyRX(target, theta); break;
    case 'RY': applyRY(target, theta); break;
    case 'RZ': applyRZ(target, theta); break;
    case 'CNOT': applyCNOT(control, target); break;
    default:
      console.warn('Unknown gate', kind);
  }
}

export function getProbsRange(offset, count) {
  console.log('[getProbsRange]', { offset, count });
  const off = Math.min(offset, dimSize);
  const cnt = Math.min(count, dimSize - off);
  const out = new Float32Array(cnt);
  for (let i = 0; i < cnt; ++i) {
    const r = state[2 * (off + i)];
    const im = state[2 * (off + i) + 1];
    out[i] = r * r + im * im;
  }
  return out;
}

export function sample() {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < dimSize; ++i) {
    const ar = state[2 * i];
    const ai = state[2 * i + 1];
    acc += ar * ar + ai * ai;
    if (r <= acc) {
      console.log('[sample]', i);
      return i;
    }
  }
  console.log('[sample]', dimSize - 1);
  return dimSize - 1;
}
