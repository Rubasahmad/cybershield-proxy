const express = require('express');
const cors = require('cors');
const https = require('https');

const app  = express();
const PORT = process.env.PORT || 3000;

const GEO_KEY   = process.env.GEO_KEY   || 'c019492c73444c75a6c7264e0fdf3562';
const ABUSE_KEY = process.env.ABUSE_KEY  || '5ab01b65c2f490e6921044b734503fbc1506fe64c8dd13e2097e95f12448f5149ffef626d4b86811';

app.use(cors());

// ── Helper: fetch external HTTPS ──
function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json', ...headers } }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch(e) { reject(new Error('Invalid JSON')); }
      });
    }).on('error', reject);
  });
}

// ── GET /geo?ip=x.x.x.x ──
app.get('/geo', async (req, res) => {
  const ip = req.query.ip || '';
  try {
    const url = ip
      ? `https://api.ipgeolocation.io/ipgeo?apiKey=${GEO_KEY}&ip=${ip}`
      : `https://api.ipgeolocation.io/ipgeo?apiKey=${GEO_KEY}`;
    const data = await fetchJSON(url);
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /abuse?ip=x.x.x.x ──
app.get('/abuse', async (req, res) => {
  const ip = req.query.ip || '';
  if (!ip) return res.status(400).json({ error: 'ip parameter required' });
  try {
    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`;
    const data = await fetchJSON(url, { 'Key': ABUSE_KEY });
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Health check ──
app.get('/', (req, res) => {
  res.json({ status: '✅ CyberShield Proxy Online', routes: ['/geo?ip=', '/abuse?ip='] });
});

app.listen(PORT, () => {
  console.log(`✅ CyberShield Proxy running on port ${PORT}`);
});
