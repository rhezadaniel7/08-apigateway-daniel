const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimit } = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1); // wajib agar IP klien terbaca benar saat di-deploy di balik proxy (Render)

// --- Rate limiting: maks. 20 request / 10 detik per alamat IP ---
app.use(rateLimit({
  windowMs: 10 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
}));

// --- Cek API key, hanya untuk /service-b (tantangan opsional lab) ---
const requireApiKey = (req, res, next) => {
  if (!process.env.API_KEY || req.get('X-API-Key') !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
app.use('/service-b', requireApiKey);

// --- Routing: /service-a/* -> GraphQL (lab 04-05) ---
app.use(createProxyMiddleware({
  pathFilter: '/service-a',
  target: process.env.SERVICE_A_URL || 'https://04-graphqlapi-daniel.vercel.app',
  changeOrigin: true,
  pathRewrite: { '^/service-a': '' },
}));

// --- Routing: /service-b/* -> FastAPI OpenAPI (lab 03) ---
app.use(createProxyMiddleware({
  pathFilter: '/service-b',
  target: process.env.SERVICE_B_URL || 'https://03-openapi-daniel-six.vercel.app',
  changeOrigin: true,
  pathRewrite: { '^/service-b': '' },
}));

app.use((req, res) => res.status(404).json({ error: 'Route tidak ditemukan' }));

app.listen(process.env.PORT || 8080, () => console.log('Gateway berjalan'));
