const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for API requests
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// API routes proxy
app.use('/api', (req, res) => {
  const targetUrl = `http://localhost:3000${req.originalUrl}`;
  req.pipe(require('http').request(targetUrl, (response) => {
    response.pipe(res);
  }).on('error', (err) => {
    res.status(500).json({ error: 'API unavailable' });
  }));
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'glagol-pro-v5.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
  console.log(`📊 API proxy to http://localhost:3000`);
});
