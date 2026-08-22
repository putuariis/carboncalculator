const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'submissions.json');
const MAX_BODY = 1024 * 1024;

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');

function readSubmissions() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeSubmissions(items) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function badRequest(res, message) {
  return json(res, 400, { ok: false, error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY) {
        reject(new Error('Payload terlalu besar'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function cleanText(value, max = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function validateSubmission(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Payload tidak valid');
  const agentName = cleanText(raw.agentName, 120);
  const agentGroup = cleanText(raw.agentGroup, 120);
  const agentDate = cleanText(raw.agentDate, 20);
  if (!agentName || !agentGroup) throw new Error('Nama agen dan kelompok wajib diisi');

  return {
    agentName,
    agentGroup,
    agentDate,
    totalScore: num(raw.totalScore),
    totalAvoidedCO2e: num(raw.totalAvoidedCO2e),
    totalEmittedCO2e: num(raw.totalEmittedCO2e),
    favoriteTKP: cleanText(raw.favoriteTKP, 200),
    favoriteReason: cleanText(raw.favoriteReason, 2000),
    realization: cleanText(raw.realization, 2000),
    commitment: cleanText(raw.commitment, 1000),
    tkp1: raw.tkp1 || {},
    tkp2: raw.tkp2 || {},
    tkp3: raw.tkp3 || {},
    tkp4: raw.tkp4 || {},
    clientVersion: cleanText(raw.clientVersion, 30)
  };
}

function safePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const requested = decoded === '/' ? '/index.html' : decoded;
  const absolute = path.resolve(PUBLIC_DIR, `.${requested}`);
  return absolute.startsWith(PUBLIC_DIR + path.sep) ? absolute : null;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return json(res, 200, { ok: true, service: 'detektif-jejak-karbon-api', timestamp: new Date().toISOString() });
    }

    if (req.method === 'GET' && url.pathname === '/api/submissions') {
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 200);
      const items = readSubmissions().slice(-limit).reverse();
      return json(res, 200, { ok: true, count: items.length, data: items });
    }

    if (req.method === 'POST' && url.pathname === '/api/submissions') {
      let raw;
      try {
        raw = JSON.parse(await readBody(req));
      } catch (err) {
        return badRequest(res, err.message || 'JSON tidak valid');
      }

      let submission;
      try {
        submission = validateSubmission(raw);
      } catch (err) {
        return badRequest(res, err.message);
      }

      const record = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...submission
      };
      const items = readSubmissions();
      items.push(record);
      writeSubmissions(items);
      return json(res, 201, { ok: true, id: record.id, data: record });
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      const file = safePublicPath(url.pathname);
      if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        return json(res, 404, { ok: false, error: 'Not found' });
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(file).pipe(res);
    }

    return json(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return json(res, 500, { ok: false, error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Detektif Jejak Karbon running at http://localhost:${PORT}`);
});
