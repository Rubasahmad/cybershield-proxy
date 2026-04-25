const https = require('https');

const ABUSE_KEY = '5ab01b65c2f490e6921044b734503fbc1506fe64c8dd13e2097e95f12448f5149ffef626d4b86811';

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const ip = req.query.ip || '';
  if (!ip) return res.status(400).json({ error: 'ip parameter required' });

  try {
    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`;
    const data = await fetchJSON(url, { 'Key': ABUSE_KEY });
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
