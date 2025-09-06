# Browser Quantum State-Vector Simulator (JavaScript)

**Features**

- Quantum state-vector simulator implemented in JavaScript/TypeScript
- Single-threaded implementation without WebAssembly or pthreads
- Supports single-qubit gates H / X / RX / RY / RZ and two-qubit gate CNOT
- Probability preview and single-shot measurement (sampling)

---

## How to Run

### 1) Dependencies

- **Node.js** (v18+ recommended)

### 2) Run in the browser

```
npm i express
node server.mjs
```

Then access in your browser:

```
http://localhost:8080
```

### 3) Run via Node.js command line

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

