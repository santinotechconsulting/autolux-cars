import compression from 'compression';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VEHICLE_SLUGS = [
  '2024-mercedes-benz-amg-gt-55-coupe-new-york-ny',
  '2024-ford-f-150-lariat-4x4-supercrew-newark-nj',
  '2023-chevrolet-camaro-2ss-coupe-stamford-ct',
  '2024-toyota-rav4-hybrid-xse-awd-white-plains-ny',
  '2023-porsche-911-carrera-s-coupe-new-york-ny',
  '2024-bmw-x5-xdrive40i-m-sport-new-york-ny',
  '2024-tesla-model-s-plaid-awd-stamford-ct',
  '2024-jeep-wrangler-rubicon-4xe-morristown-nj',
  '2024-honda-accord-touring-hybrid-white-plains-ny',
  '2024-ram-1500-limited-crew-cab-4x4-newark-nj',
  '2022-ford-f-150-xlt-sport-4x4-morristown-nj',
  '2023-honda-accord-ex-l-hybrid-new-york-ny',
];

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Fast global loading via gzip compression
  app.use(compression());
  app.use(express.json());

  // Security & performance caching headers for static assets
  app.use('/assets', express.static(path.join(__dirname, 'public/assets'), { maxAge: '7d' }));

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n'),
    );
  });

  // SEO: Dynamic XML Sitemap for Google indexing
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/cars-for-sale', priority: '0.9', changefreq: 'hourly' },
      { path: '/sell-your-car', priority: '0.8', changefreq: 'weekly' },
      { path: '/research', priority: '0.8', changefreq: 'daily' },
      { path: '/financing', priority: '0.8', changefreq: 'weekly' },
      { path: '/dealers', priority: '0.8', changefreq: 'weekly' },
    ];

    const today = new Date().toISOString().slice(0, 10);
    const urls = [
      ...staticRoutes.map(
        (r) => `
  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
      ),
      ...VEHICLE_SLUGS.map(
        (slug) => `
  <url>
    <loc>${baseUrl}/vehicle/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`,
      ),
    ].join('');

    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`,
      );
  });

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      brand: 'AutoLux USA',
      indexedVehicles: VEHICLE_SLUGS.length,
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoLux USA server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
