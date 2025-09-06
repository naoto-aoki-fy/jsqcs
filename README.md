# Browser Quantum State-Vector Simulator (JavaScript)

**Features**

- Quantum state-vector simulator implemented in JavaScript/TypeScript
- Single-threaded implementation without WebAssembly or pthreads
- Supports single-qubit gates H / X / RX / RY / RZ and two-qubit gate CNOT
- Probability preview and single-shot measurement (sampling)

---

## How to Run

### 1) Run in the browser

Access in your browser: [naoto-aoki-fy.github.io/qcs-js](https://naoto-aoki-fy.github.io/qcs-js/)


### 2) Run via Node.js command line

```
node cli.mjs [number_of_qubits]
```

---

## Public API (qs.js)

```javascript
init(n);
free();
reset();
numQubits();
dim();
applyGate(kind, target, control?, theta?);
getProbsRange(offset, count);
sample();
```

---

## License

MIT

