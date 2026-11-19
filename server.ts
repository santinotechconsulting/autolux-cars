import compression from 'compression';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SeoVehicleEntry {
  slug: string;
  title: string;
  price: number;
  location: string;
  image: string;
}

const SEO_VEHICLES: SeoVehicleEntry[] = [
  {
    slug: '2024-mercedes-benz-amg-gt-55-coupe-new-york-ny',
    title: '2024 Mercedes-Benz AMG GT 55 4MATIC+ Coupe',
    price: 134900,
    location: 'New York, NY',
    image: '/src/assets/images/car_mercedes_amg_gt_1795005290805.jpg',
  },
  {
    slug: '2024-ford-f-150-lariat-4x4-supercrew-newark-nj',
    title: '2024 Ford F-150 Lariat 4x4 SuperCrew',
    price: 58490,
    location: 'Newark, NJ',
    image: '/src/assets/images/car_ford_f150_lariat_1795005290725.jpg',
  },
  {
    slug: '2023-chevrolet-camaro-2ss-coupe-stamford-ct',
    title: '2023 Chevrolet Camaro 2SS V8 Coupe',
    price: 44850,
    location: 'Stamford, CT',
    image: '/src/assets/images/car_chevy_camaro_ss_1795005290879.jpg',
  },
  {
    slug: '2024-toyota-rav4-hybrid-xse-awd-white-plains-ny',
    title: '2024 Toyota RAV4 Hybrid XSE AWD',
    price: 36950,
    location: 'White Plains, NY',
    image: '/src/assets/images/car_toyota_rav4_hybrid_1795005291302.jpg',
  },
  {
    slug: '2023-porsche-911-carrera-s-coupe-new-york-ny',
    title: '2023 Porsche 911 Carrera S PDK Coupe',
    price: 142500,
    location: 'New York, NY',
    image: '/src/assets/images/car_porsche_911_carrera_1795005291336.jpg',
  },
  {
    slug: '2024-bmw-x5-xdrive40i-m-sport-new-york-ny',
    title: '2024 BMW X5 xDrive40i M Sport',
    price: 69900,
    location: 'New York, NY',
    image: '/src/assets/images/car_bmw_x5_msport_1795005292770.jpg',
  },
  {
    slug: '2024-tesla-model-s-plaid-awd-stamford-ct',
    title: '2024 Tesla Model S Plaid Tri-Motor AWD',
    price: 78900,
    location: 'Stamford, CT',
    image: '/src/assets/images/car_tesla_model_s_1795005292889.jpg',
  },
  {
    slug: '2024-jeep-wrangler-rubicon-4xe-morristown-nj',
    title: '2024 Jeep Wrangler Rubicon 4x4 4-Door',
    price: 51200,
    location: 'Morristown, NJ',
    image: '/src/assets/images/car_jeep_wrangler_rubicon_1795005292900.jpg',
  },
  {
    slug: '2024-honda-accord-touring-hybrid-white-plains-ny',
    title: '2024 Honda Accord Touring Hybrid Sedan',
    price: 34400,
    location: 'White Plains, NY',
    image: '/src/assets/images/car_honda_accord_touring_1795005294612.jpg',
  },
  {
    slug: '2024-ram-1500-limited-crew-cab-4x4-newark-nj',
    title: '2024 Ram 1500 Limited Crew Cab 4x4',
    price: 64900,
    location: 'Newark, NJ',
    image: '/src/assets/images/car_ram_1500_limited_1795005295075.jpg',
  },
  {
    slug: '2022-ford-f-150-xlt-sport-4x4-morristown-nj',
    title: '2022 Ford F-150 XLT Sport 4x4 SuperCrew',
    price: 41900,
    location: 'Morristown, NJ',
    image: '/src/assets/images/car_ford_f150_lariat_1795005290725.jpg',
  },
  {
    slug: '2023-honda-accord-ex-l-hybrid-new-york-ny',
    title: '2023 Honda Accord EX-L Hybrid Sedan',
    price: 29850,
    location: 'New York, NY',
    image: '/src/assets/images/car_honda_accord_touring_1795005294612.jpg',
  },
  {
    slug: '1997-chevy-silverado-1500-z71-4x4-newark-nj',
    title: '1997 Chevrolet Silverado 1500 Z71 4x4',
    price: 1850,
    location: 'Newark, NJ',
    image: '/src/assets/images/car_silverado_z71_1795076809161.jpg',
  },
  {
    slug: '1991-toyota-pickup-deluxe-xtracab-4x4-morristown-nj',
    title: '1991 Toyota Pickup Deluxe Xtracab 4x4',
    price: 2450,
    location: 'Morristown, NJ',
    image: '/src/assets/images/car_toyota_pickup_1795076808915.jpg',
  },
  {
    slug: '1988-ford-bronco-xlt-4x4-stamford-ct',
    title: '1988 Ford Bronco XLT 4x4',
    price: 4000,
    location: 'Stamford, CT',
    image: '/src/assets/images/car_ford_bronco_1795076808743.jpg',
  },
  {
    slug: '1999-honda-civic-si-coupe-white-plains-ny',
    title: '1999 Honda Civic Si DOHC VTEC Coupe',
    price: 3850,
    location: 'White Plains, NY',
    image: '/src/assets/images/car_civic_si_1795076807896.jpg',
  },
  {
    slug: '2005-ford-ranger-xlt-supercab-4x4-newark-nj',
    title: '2005 Ford Ranger XLT SuperCab 4x4',
    price: 6900,
    location: 'Newark, NJ',
    image: '/src/assets/images/car_ford_ranger_1795076807869.jpg',
  },
  {
    slug: '2005-pontiac-gto-6-0l-v8-coupe-stamford-ct',
    title: '2005 Pontiac GTO 6.0L LS2 V8 Coupe',
    price: 9950,
    location: 'Stamford, CT',
    image: '/src/assets/images/car_pontiac_gto_1795076809391.jpg',
  },
  {
    slug: '2006-honda-accord-ex-sedan-white-plains-ny',
    title: '2006 Honda Accord EX Sedan',
    price: 5450,
    location: 'White Plains, NY',
    image: '/src/assets/images/car_honda_accord_touring_1795005294612.jpg',
  },
  {
    slug: '2018-nissan-altima-2-5-sv-sedan-new-york-ny',
    title: '2018 Nissan Altima 2.5 SV Sedan',
    price: 12400,
    location: 'New York, NY',
    image: '/src/assets/images/car_nissan_altima_1795076808416.jpg',
  },
  {
    slug: '2019-kia-sportage-lx-awd-white-plains-ny',
    title: '2019 Kia Sportage LX All-Wheel Drive',
    price: 14900,
    location: 'White Plains, NY',
    image: '/src/assets/images/car_kia_sportage_1795076808330.jpg',
  },
  {
    slug: '2016-ram-1500-tradesman-4x4-quad-cab-morristown-nj',
    title: '2016 Ram 1500 Tradesman 4x4 Quad Cab',
    price: 16800,
    location: 'Morristown, NJ',
    image: '/src/assets/images/car_ram_1500_limited_1795005295075.jpg',
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectRouteSeoHtml(html: string, reqPath: string, baseUrl: string): string {
  const vehicleMatch = reqPath.match(/^\/vehicle\/([^/?#]+)/);
  let title = 'AutoLux USA – Used & New Cars for Sale, Rentals & Financing';
  let description =
    'Shop inspected used cars from $1,850, certified SUVs, trucks, and rentals on AutoLux USA. Free vehicle history reports, warranties, and zero-impact financing.';
  let image = `${baseUrl}/assets/aistudio/Autolux_46ec3fca.png`;
  const canonical = `${baseUrl}${reqPath.split('?')[0]}`;

  if (vehicleMatch) {
    const v = SEO_VEHICLES.find((item) => item.slug === vehicleMatch[1]);
    if (v) {
      title = `${v.title} ($${v.price.toLocaleString()}) – AutoLux USA`;
      description = `Buy this inspected ${v.title} in ${v.location} for $${v.price.toLocaleString()}. Free history report, warranty options, low down payment, and nationwide delivery.`;
      image = `${baseUrl}${v.image}`;
    }
  } else if (reqPath.startsWith('/cars-for-sale')) {
    title = 'Used & New Cars for Sale Nationwide – AutoLux USA';
    description =
      'Filter verified cars, 4x4 trucks, SUVs, and rentals from $1,850 with free history reports, 90-day warranties, and doorstep delivery.';
  } else if (reqPath.startsWith('/financing')) {
    title = 'Auto Financing & No-Impact Pre-Qualification – AutoLux USA';
    description =
      'Estimate monthly payments and pre-qualify for AutoLux USA financing with low down payments and zero credit score impact.';
  } else if (reqPath.startsWith('/dealers')) {
    title = 'Certified Dealership Network (NY, NJ, CT, TX, CA) – AutoLux USA';
    description =
      'Explore trusted AutoLux USA dealership locations across New York, New Jersey, Connecticut, Texas, and California.';
  } else if (reqPath.startsWith('/research')) {
    title = 'Automotive Reviews, Guides & Comparison Hub – AutoLux USA';
    description =
      'Read expert road tests, used car buying guides, and compare vehicle specs side by side on AutoLux USA.';
  } else if (reqPath.startsWith('/sell-your-car')) {
    title = 'Sell or Trade Your Car Online – Instant Offer | AutoLux USA';
    description =
      'Get a competitive cash valuation and list your vehicle across AutoLux USA certified buyers in minutes.';
  }

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttr(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,
      `<meta name="description" content="${escapeHtmlAttr(description)}" />`,
    )
    .replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${escapeHtmlAttr(canonical)}" />\n  </head>`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
      `<meta property="og:title" content="${escapeHtmlAttr(title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
      `<meta property="og:description" content="${escapeHtmlAttr(description)}" />`,
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/i,
      `<meta property="og:image" content="${escapeHtmlAttr(image)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
      `<meta name="twitter:title" content="${escapeHtmlAttr(title)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
      `<meta name="twitter:description" content="${escapeHtmlAttr(description)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/i,
      `<meta name="twitter:image" content="${escapeHtmlAttr(image)}" />`,
    );
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(compression());
  app.use(express.json());

  app.use('/assets', express.static(path.join(__dirname, 'public/assets'), { maxAge: '7d' }));

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /dashboard',
        'Disallow: /dashboard/',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n'),
    );
  });

  // SEO: Dynamic XML Sitemap with Google Image Sitemap entries
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/cars-for-sale', priority: '0.95', changefreq: 'hourly' },
      { path: '/cars-for-sale?maxPrice=5000&radius=nationwide', priority: '0.85', changefreq: 'daily' },
      { path: '/cars-for-sale?maxPrice=15000&radius=nationwide', priority: '0.85', changefreq: 'daily' },
      { path: '/cars-for-sale?make=Ford&radius=nationwide', priority: '0.8', changefreq: 'daily' },
      { path: '/cars-for-sale?make=Toyota&radius=nationwide', priority: '0.8', changefreq: 'daily' },
      { path: '/cars-for-sale?make=Honda&radius=nationwide', priority: '0.8', changefreq: 'daily' },
      { path: '/cars-for-sale?make=Chevrolet&radius=nationwide', priority: '0.8', changefreq: 'daily' },
      { path: '/sell-your-car', priority: '0.8', changefreq: 'weekly' },
      { path: '/research', priority: '0.8', changefreq: 'daily' },
      { path: '/financing', priority: '0.8', changefreq: 'weekly' },
      { path: '/dealers', priority: '0.85', changefreq: 'weekly' },
    ];

    const today = new Date().toISOString().slice(0, 10);
    const urls = [
      ...staticRoutes.map(
        (r) => `
  <url>
    <loc>${escapeXml(baseUrl + r.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
      ),
      ...SEO_VEHICLES.map(
        (v) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/vehicle/${v.slug}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(`${baseUrl}${v.image}`)}</image:loc>
      <image:title>${escapeXml(`${v.title} - $${v.price.toLocaleString()} in ${v.location}`)}</image:title>
    </image:image>
  </url>`,
      ),
    ].join('');

    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}\n</urlset>`,
      );
  });

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      brand: 'AutoLux USA',
      indexedVehicles: SEO_VEHICLES.length,
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
        index: false,
        maxAge: '1d',
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    app.get('*', (req, res) => {
      const indexHtmlPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtmlPath)) {
        const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const rawHtml = fs.readFileSync(indexHtmlPath, 'utf8');
        const seoHtml = injectRouteSeoHtml(rawHtml, req.originalUrl, baseUrl);
        res.setHeader('Cache-Control', 'no-cache');
        res.type('text/html').send(seoHtml);
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
