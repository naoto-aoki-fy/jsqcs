// server.mjs
// Minimal Express static server for the JavaScript simulator.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const pub = path.join(__dirname, 'public');

app.use(express.static(pub));
app.get('*', (_req, res) => res.sendFile(path.join(pub, 'index.html')));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Serving on http://localhost:${port}`);
});
