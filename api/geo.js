const https = require('https');

const GEO_KEY = 'c019492c73444c75a6c7264e0fdf3562';

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
  try {
    const url = ip
      ? `https://api.ipgeolocation.io/ipgeo?apiKey=${GEO_KEY}&ip=${ip}`
      : `https://api.ipgeolocation.io/ipgeo?apiKey=${GEO_KEY}`;
    const data = await fetchJSON(url);
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
