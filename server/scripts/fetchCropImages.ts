import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { MASTER_CROPS_CATALOG } from '../src/data/masterCrops/index';
import { CropImage, CropMasterRecord } from '../src/types/cropMasterSchema';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_PUBLIC_CROPS_DIR = path.resolve(__dirname, '../../client/public/crops');
const REVIEW_HTML_PUBLIC_PATH = path.resolve(__dirname, '../../client/public/crop-images-review.html');
const REVIEW_HTML_ROOT_PATH = path.resolve(__dirname, '../../crop-images-review.html');
const CROPS_CATALOG_JSON_PATH = path.resolve(__dirname, '../src/data/cropsCatalog.json');
const CLIENT_CROPS_JSON_PATH = path.resolve(__dirname, '../../client/public/crops/cropsCatalog.json');

// Ensure destination directories exist
if (!fs.existsSync(CLIENT_PUBLIC_CROPS_DIR)) {
  fs.mkdirSync(CLIENT_PUBLIC_CROPS_DIR, { recursive: true });
}

const USER_AGENT = 'KrushiSathiEducationalApp/1.0 (Farmer Companion Project; contact: student@krushisathi.org)';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanHtmlText(text?: string): string {
  if (!text) return 'Wikimedia Contributor';
  return text.replace(/<[^>]*>?/gm, '').trim() || 'Wikimedia Contributor';
}

interface WikimediaImageInfo {
  url: string;
  descriptionurl?: string;
  width?: number;
  height?: number;
  mime?: string;
  extmetadata?: {
    Artist?: { value?: string };
    LicenseShortName?: { value?: string };
    License?: { value?: string };
    Credit?: { value?: string };
    ImageDescription?: { value?: string };
  };
}

async function searchWikimediaCommons(query: string, limit = 8): Promise<WikimediaImageInfo[]> {
  try {
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;
    
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.query || !data.query.pages) {
      return [];
    }

    const images: WikimediaImageInfo[] = [];
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];

    for (const pageId of Object.keys(data.query.pages)) {
      const page = data.query.pages[pageId];
      if (page.imageinfo && page.imageinfo[0]) {
        const info: WikimediaImageInfo = page.imageinfo[0];
        
        // Filter out icons, svgs, pdfs, audio, or low-res thumbnails
        if (info.url && info.mime && validMimes.includes(info.mime)) {
          if (!info.width || info.width >= 350) {
            const titleLower = (page.title || '').toLowerCase();
            // Filter out flags, maps, logos, diagrams
            if (!titleLower.includes('map') && !titleLower.includes('flag') && !titleLower.includes('icon') && !titleLower.includes('chart')) {
              images.push(info);
            }
          }
        }
      }
    }

    return images;
  } catch (err: any) {
    console.error(`  [Wikimedia Search Error] Query: "${query}":`, err.message);
    return [];
  }
}

async function searchPexels(query: string, apiKey: string, limit = 4): Promise<WikimediaImageInfo[]> {
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.photos) return [];

    return data.photos.map((p: any) => ({
      url: p.src.large || p.src.medium,
      descriptionurl: p.url,
      extmetadata: {
        Artist: { value: p.photographer || 'Pexels Contributor' },
        LicenseShortName: { value: 'Pexels Free License' },
      },
    }));
  } catch (err) {
    return [];
  }
}

async function searchPixabay(query: string, apiKey: string, limit = 4): Promise<WikimediaImageInfo[]> {
  try {
    const res = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.hits) return [];

    return data.hits.map((h: any) => ({
      url: h.webformatURL || h.largeImageURL,
      descriptionurl: h.pageURL,
      extmetadata: {
        Artist: { value: h.user || 'Pixabay Contributor' },
        LicenseShortName: { value: 'Pixabay Free License' },
      },
    }));
  } catch (err) {
    return [];
  }
}

function detectImageType(titleOrDesc: string, index: number): CropImage['type'] {
  const text = titleOrDesc.toLowerCase();
  if (text.includes('flower') || text.includes('bloom') || text.includes('inflorescence') || text.includes('blossom')) return 'flower';
  if (text.includes('fruit') || text.includes('berry') || text.includes('pod') || text.includes('grain') || text.includes('cob')) return 'fruit';
  if (text.includes('seed') || text.includes('grain')) return 'seed';
  if (text.includes('leaf') || text.includes('foliage') || text.includes('leaves')) return 'leaf';
  if (text.includes('plant') || text.includes('tree') || text.includes('field') || text.includes('crop') || text.includes('shrub')) return 'plant';
  
  const defaults: CropImage['type'][] = ['plant', 'flower', 'fruit', 'seed'];
  return defaults[index % defaults.length];
}

async function downloadAndCompressImage(imageUrl: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return false;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize and compress with sharp to WebP format, 800px max width, quality 80
    await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(destPath);

    return true;
  } catch (err: any) {
    console.error(`  [Download Error] ${imageUrl}:`, err.message);
    return false;
  }
}

export async function fetchAllCropImages(options: { limit?: number; force?: boolean } = {}) {
  const { limit, force = false } = options;
  console.log('====================================================');
  console.log('🌾 Krishi Sathi — Automated Crop Image Fetcher');
  console.log(`🌾 Target Crops: ${MASTER_CROPS_CATALOG.length} South Indian crops`);
  console.log('====================================================\n');

  const pexelsKey = process.env.PEXELS_API_KEY;
  const pixabayKey = process.env.PIXABAY_API_KEY;

  if (pexelsKey) console.log('✅ Pexels fallback: Configured');
  if (pixabayKey) console.log('✅ Pixabay fallback: Configured');

  const updatedCatalog: CropMasterRecord[] = [];
  const cropsToProcess = limit ? MASTER_CROPS_CATALOG.slice(0, limit) : MASTER_CROPS_CATALOG;

  let cropsWithImages = 0;
  let cropsMissingImages = 0;
  let totalImagesDownloaded = 0;

  for (let i = 0; i < cropsToProcess.length; i++) {
    const crop = cropsToProcess[i];
    const cropDir = path.join(CLIENT_PUBLIC_CROPS_DIR, crop.id);
    if (!fs.existsSync(cropDir)) {
      fs.mkdirSync(cropDir, { recursive: true });
    }

    console.log(`[${i + 1}/${cropsToProcess.length}] Processing: ${crop.name} (${crop.scientificName})...`);

    // Check if crop already has downloaded images
    const existingWebpFiles = fs.readdirSync(cropDir).filter(f => f.endsWith('.webp'));
    if (existingWebpFiles.length >= 3 && !force && crop.images && crop.images.length >= 3) {
      console.log(`  ⏩ Already has ${existingWebpFiles.length} downloaded images. Skipping.`);
      updatedCatalog.push(crop);
      cropsWithImages++;
      totalImagesDownloaded += existingWebpFiles.length;
      continue;
    }

    // 1. Search Wikimedia Commons by scientific name
    let foundImages = await searchWikimediaCommons(crop.scientificName, 8);
    await sleep(250); // Respect Wikimedia API courtesy rate limits

    // 2. If fewer than 3 images, try secondary search with common name + plant
    if (foundImages.length < 3) {
      const secondaryResults = await searchWikimediaCommons(`${crop.name.split('(')[0].trim()} plant`, 6);
      foundImages = [...foundImages, ...secondaryResults];
      await sleep(250);
    }

    // 3. Fallback to Pexels if key exists
    if (foundImages.length < 3 && pexelsKey) {
      const pexelsImages = await searchPexels(crop.name.split('(')[0].trim(), pexelsKey, 4);
      foundImages = [...foundImages, ...pexelsImages];
    }

    // 4. Fallback to Pixabay if key exists
    if (foundImages.length < 3 && pixabayKey) {
      const pixabayImages = await searchPixabay(crop.name.split('(')[0].trim(), pixabayKey, 4);
      foundImages = [...foundImages, ...pixabayImages];
    }

    // Take top 4 distinct images
    const selectedCandidates = foundImages.slice(0, 4);
    const downloadedImages: CropImage[] = [];

    for (let imgIdx = 0; imgIdx < selectedCandidates.length; imgIdx++) {
      const candidate = selectedCandidates[imgIdx];
      const imgFileName = `image-${imgIdx + 1}.webp`;
      const localFilePath = path.join(cropDir, imgFileName);
      const publicRelativePath = `/crops/${crop.id}/${imgFileName}`;

      const downloaded = await downloadAndCompressImage(candidate.url, localFilePath);
      if (downloaded) {
        const detectedType = detectImageType(
          (candidate.descriptionurl || '') + ' ' + (candidate.extmetadata?.ImageDescription?.value || ''),
          imgIdx
        );

        const author = cleanHtmlText(candidate.extmetadata?.Artist?.value || candidate.extmetadata?.Credit?.value);
        const license = candidate.extmetadata?.LicenseShortName?.value || candidate.extmetadata?.License?.value || 'CC-BY-SA / Public Domain';

        downloadedImages.push({
          type: detectedType,
          path: publicRelativePath,
          source: candidate.extmetadata?.LicenseShortName?.value?.includes('Pexels') ? 'Pexels' : candidate.extmetadata?.LicenseShortName?.value?.includes('Pixabay') ? 'Pixabay' : 'Wikimedia Commons',
          author,
          license,
          attributionUrl: candidate.descriptionurl || candidate.url,
          originalUrl: candidate.url,
        });

        totalImagesDownloaded++;
      }
    }

    if (downloadedImages.length > 0) {
      crop.images = downloadedImages;
      crop.imageUrl = downloadedImages[0].path;
      cropsWithImages++;
      console.log(`  ✅ Successfully downloaded ${downloadedImages.length} images.`);
    } else {
      crop.images = [];
      crop.imageUrl = '/crops/placeholder.svg';
      cropsMissingImages++;
      console.log(`  ⚠️ No suitable botanical images found. Assigned placeholder.`);
    }

    updatedCatalog.push(crop);
  }

  // If running with a limit, merge with the rest of the catalog
  if (limit && limit < MASTER_CROPS_CATALOG.length) {
    const remaining = MASTER_CROPS_CATALOG.slice(limit);
    updatedCatalog.push(...remaining);
  }

  // Save the catalog JSON files
  const catalogJsonString = JSON.stringify(updatedCatalog, null, 2);
  fs.writeFileSync(CROPS_CATALOG_JSON_PATH, catalogJsonString, 'utf-8');
  fs.writeFileSync(CLIENT_CROPS_JSON_PATH, catalogJsonString, 'utf-8');
  console.log(`\n✅ Saved updated crop catalog with image metadata to:\n  - ${CROPS_CATALOG_JSON_PATH}\n  - ${CLIENT_CROPS_JSON_PATH}`);

  // Generate Review HTML
  generateReviewHtml(updatedCatalog, cropsWithImages, cropsMissingImages, totalImagesDownloaded);

  console.log('\n====================================================');
  console.log(`🎉 Image Fetching Completed!`);
  console.log(`📸 Total Crops with Verified Images: ${cropsWithImages}`);
  console.log(`🖼️ Total Downloaded & Compressed Images: ${totalImagesDownloaded}`);
  console.log(`⚠️ Crops with Placeholder Only: ${cropsMissingImages}`);
  console.log(`📄 Open Review Dashboard at: file:///${REVIEW_HTML_ROOT_PATH.replace(/\\/g, '/')}`);
  console.log('====================================================\n');
}

function generateReviewHtml(crops: CropMasterRecord[], cropsWithImages: number, cropsMissingImages: number, totalImages: number) {
  const missingCropsList = crops.filter(c => !c.images || c.images.length === 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Krushi Sathi — Crop Images Verification & Review Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #15803d;
      --primary-dark: #166534;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --danger: #ef4444;
      --warning: #f59e0b;
      --success: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 32px 24px;
    }
    .header {
      max-width: 1400px;
      margin: 0 auto 32px;
      background: white;
      padding: 32px;
      border-radius: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
    }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary-dark);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f1f5f9;
      padding: 16px 20px;
      border-radius: 16px;
      border-left: 4px solid var(--primary);
    }
    .stat-card.warning { border-color: var(--warning); background: #fefce8; }
    .stat-card.success { border-color: var(--success); background: #ecfdf5; }
    .stat-card.danger { border-color: var(--danger); background: #fef2f2; }
    .stat-val { font-size: 28px; font-weight: 800; }
    .stat-lbl { font-size: 13px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

    .controls-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .search-input {
      flex: 1;
      min-width: 280px;
      padding: 12px 18px;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      font-size: 15px;
      outline: none;
      font-family: inherit;
    }
    .search-input:focus { border-color: var(--primary); }
    .filter-btn {
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: white;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s;
    }
    .filter-btn:hover, .filter-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .export-btn {
      margin-left: auto;
      padding: 10px 20px;
      background: #0f172a;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .crop-grid {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .crop-row-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 2px 12px rgba(0,0,0,0.03);
    }
    .crop-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 12px;
    }
    .crop-name { font-size: 20px; font-weight: 800; color: #1e293b; }
    .scientific { font-style: italic; color: #059669; font-weight: 600; font-size: 15px; margin-left: 8px; }
    .local-names { font-size: 13.5px; color: var(--text-muted); margin-top: 4px; }
    .category-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .images-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
    .img-box {
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      background: #fafafa;
      position: relative;
      transition: all 0.2s;
    }
    .img-box.flagged {
      border-color: var(--danger);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
    }
    .img-box.flagged::after {
      content: 'FLAGGED AS WRONG IMAGE';
      position: absolute;
      top: 10px;
      left: 10px;
      background: var(--danger);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      z-index: 2;
    }
    .img-wrapper {
      height: 180px;
      width: 100%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .img-meta {
      padding: 12px 14px;
    }
    .img-type-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 6px;
      background: #dcfce7;
      color: #166534;
      margin-bottom: 6px;
    }
    .img-author {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .img-license {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .flag-btn {
      width: 100%;
      margin-top: 10px;
      padding: 6px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: white;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .flag-btn:hover { background: #fee2e2; border-color: var(--danger); color: var(--danger); }
    .flag-btn.active { background: var(--danger); color: white; border-color: var(--danger); }

    .placeholder-alert {
      padding: 24px;
      border-radius: 16px;
      background: #fffbeb;
      border: 1.5px dashed #f59e0b;
      display: flex;
      align-items: center;
      gap: 16px;
      color: #92400e;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="title-row">
      <h1>🌾 Krushi Sathi — Crop Images Verification & Review Dashboard</h1>
      <button class="export-btn" onclick="exportFlaggedJson()">⬇️ Export Flagged Bad Images</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val">${crops.length}</div>
        <div class="stat-lbl">Total Master Crops</div>
      </div>
      <div class="stat-card success">
        <div class="stat-val">${cropsWithImages}</div>
        <div class="stat-lbl">Crops with Downloaded Photos</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${totalImages}</div>
        <div class="stat-lbl">Total Verified Local Photos</div>
      </div>
      <div class="stat-card ${cropsMissingImages > 0 ? 'warning' : 'success'}">
        <div class="stat-val">${cropsMissingImages}</div>
        <div class="stat-lbl">Placeholder Only (Need Review)</div>
      </div>
    </div>

    <div class="controls-row">
      <input type="text" id="searchInput" class="search-input" placeholder="Search by crop name, scientific name or local names..." oninput="filterCrops()">
      <button class="filter-btn active" onclick="setFilter('all', this)">All Crops (${crops.length})</button>
      <button class="filter-btn" onclick="setFilter('has-images', this)">With Photos (${cropsWithImages})</button>
      <button class="filter-btn" onclick="setFilter('missing', this)">Placeholder Only (${cropsMissingImages})</button>
      <button class="filter-btn" onclick="setFilter('flagged', this)">Flagged by You (<span id="flaggedCount">0</span>)</button>
    </div>
  </div>

  <div class="crop-grid" id="cropContainer">
    ${crops.map(c => `
      <div class="crop-row-card" data-id="${c.id}" data-name="${c.name.toLowerCase()}" data-sci="${c.scientificName.toLowerCase()}" data-has-images="${c.images && c.images.length > 0 ? 'true' : 'false'}">
        <div class="crop-header">
          <div>
            <span class="crop-name">${c.name}</span>
            <span class="scientific">(${c.scientificName})</span>
            <div class="local-names">
              🇮🇳 Kannada: <strong>${c.nameKannada}</strong> | Tamil: <strong>${c.nameTamil}</strong> | Telugu: <strong>${c.nameTelugu}</strong>
            </div>
          </div>
          <div>
            <span class="category-badge">${c.category.replace('_', ' ')}</span>
          </div>
        </div>

        ${c.images && c.images.length > 0 ? `
          <div class="images-gallery">
            ${c.images.map((img, idx) => `
              <div class="img-box" id="box_${c.id}_${idx}" data-crop="${c.id}" data-path="${img.path}">
                <div class="img-wrapper">
                  <img src="${img.path}" alt="${c.name} photo" loading="lazy" onerror="this.src='/crops/placeholder.svg'">
                </div>
                <div class="img-meta">
                  <span class="img-type-badge">${img.type}</span>
                  <div class="img-author" title="${img.author}">👤 ${img.author}</div>
                  <div class="img-license">📜 ${img.license} &bull; ${img.source}</div>
                  <button class="flag-btn" onclick="toggleFlag('${c.id}', '${idx}', '${img.path}', this)">
                    ⚠️ Mark as Wrong Image
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="placeholder-alert">
            <img src="/crops/placeholder.svg" style="width: 120px; height: 80px; object-fit: contain;">
            <div>
              <h4 style="font-weight: 700; margin-bottom: 4px;">No Verified Botanical Photos Downloaded Yet</h4>
              <p style="font-size: 13.5px;">A clean botanical placeholder badge is assigned. You can upload manual photos to <code>/public/crops/${c.id}/</code>.</p>
            </div>
          </div>
        `}
      </div>
    `).join('')}
  </div>

  <script>
    let flaggedItems = JSON.parse(localStorage.getItem('krushi_flagged_images') || '{}');
    updateFlaggedUI();

    function toggleFlag(cropId, idx, path, btn) {
      const key = cropId + '_' + idx;
      const box = document.getElementById('box_' + cropId + '_' + idx);
      if (flaggedItems[key]) {
        delete flaggedItems[key];
        btn.classList.remove('active');
        btn.innerText = '⚠️ Mark as Wrong Image';
        if (box) box.classList.remove('flagged');
      } else {
        flaggedItems[key] = { cropId, idx, path, flaggedAt: new Date().toISOString() };
        btn.classList.add('active');
        btn.innerText = '❌ Flagged (Click to Unmark)';
        if (box) box.classList.add('flagged');
      }
      localStorage.setItem('krushi_flagged_images', JSON.stringify(flaggedItems));
      updateFlaggedCount();
    }

    function updateFlaggedUI() {
      for (const key in flaggedItems) {
        const item = flaggedItems[key];
        const box = document.getElementById('box_' + item.cropId + '_' + item.idx);
        if (box) {
          box.classList.add('flagged');
          const btn = box.querySelector('.flag-btn');
          if (btn) {
            btn.classList.add('active');
            btn.innerText = '❌ Flagged (Click to Unmark)';
          }
        }
      }
      updateFlaggedCount();
    }

    function updateFlaggedCount() {
      const count = Object.keys(flaggedItems).length;
      document.getElementById('flaggedCount').innerText = count;
    }

    function exportFlaggedJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flaggedItems, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "flagged-crop-images.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    let currentFilter = 'all';
    function setFilter(filter, btn) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCrops();
    }

    function filterCrops() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const rows = document.querySelectorAll('.crop-row-card');

      rows.forEach(row => {
        const name = row.getAttribute('data-name');
        const sci = row.getAttribute('data-sci');
        const hasImages = row.getAttribute('data-has-images') === 'true';
        const cropId = row.getAttribute('data-id');

        let matchesSearch = !q || name.includes(q) || sci.includes(q);
        let matchesFilter = true;

        if (currentFilter === 'has-images') matchesFilter = hasImages;
        if (currentFilter === 'missing') matchesFilter = !hasImages;
        if (currentFilter === 'flagged') {
          matchesFilter = Object.values(flaggedItems).some(f => f.cropId === cropId);
        }

        if (matchesSearch && matchesFilter) {
          row.style.display = 'block';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(REVIEW_HTML_PUBLIC_PATH, html, 'utf-8');
  fs.writeFileSync(REVIEW_HTML_ROOT_PATH, html, 'utf-8');
  console.log(`✅ Generated Image Verification Dashboards at:\n  - ${REVIEW_HTML_PUBLIC_PATH}\n  - ${REVIEW_HTML_ROOT_PATH}`);
}

// CLI runner
if (require.main === module) {
  const args = process.argv.slice(2);
  let limitArg: number | undefined = undefined;
  let forceArg = false;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limitArg = parseInt(arg.split('=')[1], 10);
    }
    if (arg === '--force') {
      forceArg = true;
    }
  }

  fetchAllCropImages({ limit: limitArg, force: forceArg }).catch(err => {
    console.error('Fatal fetch error:', err);
    process.exit(1);
  });
}
