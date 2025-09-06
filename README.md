# Browser Quantum State-Vector Simulator (JavaScript)

**特徴**

- JavaScript/TypeScript で実装した状態ベクトル法の量子シミュレータ
- WebAssembly や pthreads を使わないシングルスレッド実装
- 単一ビットゲート H / X / RX / RY / RZ、2 ビットゲート CNOT を実装
- 確率プレビューと単発測定（サンプリング）

---

## 動かし方

### 1) 依存関係

- **Node.js**（v18+ 推奨）

### 2) ブラウザで実行

```
npm i express
node server.mjs
```

ブラウザで以下へアクセス：

```
http://localhost:8080
```

### 3) Node.js コマンドライン実行

```
node cli.mjs [量子ビット数] [スレッド数]
```

スレッド数引数は JS 実装では無視されます。

---

## 公開 API（qs.js）

```javascript
init(n, threads);
free();
reset();
numQubits();
dim();
applyGate(kind, target, control?, theta?);
getProbsRange(offset, count);
sample();
```

---

## ライセンス

MIT
