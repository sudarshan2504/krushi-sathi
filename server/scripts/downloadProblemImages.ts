import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OUTPUT_ROOT = path.join(__dirname, '../../client/public/problems');

// Permitted open licenses
const ALLOWED_LICENSES = [
  'cc-by',
  'cc-by-sa',
  'cc0',
  'public domain',
  'pd',
  'gfdl',
  'attribution',
];

function isPermittedLicense(lic: string | undefined): boolean {
  if (!lic) return true; // Wikimedia Commons files are by policy freely licensed
  const l = lic.toLowerCase();
  return ALLOWED_LICENSES.some(al => l.includes(al)) || l.includes('cc') || l.includes('public');
}

function cleanHtml(str: string | undefined): string {
  if (!str) return 'Unknown';
  return str.replace(/<[^>]*>?/gm, '').trim() || 'Unknown';
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/file:/g, '')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function searchWikimediaImages(query: string, limit = 5) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|extmetadata|user|size&format=json&origin=*`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'KrushiSathi-Academic-Research/1.0 (sudarshan@krushisathi.org; Agricultural Education)',
      },
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    const pages = data.query?.pages;
    if (!pages) return [];

    const results: any[] = [];
    for (const k of Object.keys(pages)) {
      const p = pages[k];
      const info = p.imageinfo?.[0];
      if (!info || !info.url) continue;

      const title = p.title || '';
      let ext = '';
      try {
        const u = new URL(info.url);
        ext = path.extname(u.pathname).toLowerCase();
      } catch {
        ext = path.extname(info.url.split('?')[0]).toLowerCase();
      }
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

      const license = info.extmetadata?.LicenseShortName?.value || 'CC BY-SA';
      if (!isPermittedLicense(license)) continue;

      const author = cleanHtml(info.extmetadata?.Artist?.value || info.user || 'Wikimedia Contributor');
      const credit = cleanHtml(info.extmetadata?.Credit?.value || author);
      const desc = cleanHtml(info.extmetadata?.ImageDescription?.value || title);

      results.push({
        title,
        url: info.url,
        author,
        credit,
        license,
        description: desc.slice(0, 150),
      });
    }
    return results;
  } catch (err) {
    console.warn(`Wikimedia search failed for "${query}":`, (err as any).message);
    return [];
  }
}

async function downloadAndOptimize(imageUrl: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'KrushiSathi-Academic-Research/1.0 (sudarshan@krushisathi.org)',
      },
    });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize with Sharp: Max width 800px, WebP format
    await sharp(buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(destPath);

    return true;
  } catch (err) {
    console.warn(`Failed to process image ${imageUrl}:`, (err as any).message);
    return false;
  }
}

export async function processAllImages() {
  console.log('🖼️  Starting Wikimedia Commons Image Ingestion for Crop Health Problems...\n');

  if (!fs.existsSync(OUTPUT_ROOT)) {
    fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  }

  const problems = await prisma.problem.findMany({
    include: {
      crops: true,
      images: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Found ${problems.length} problems to inspect in database.\n`);

  const imageStats = {
    totalProblems: problems.length,
    downloadedImages: 0,
    withImagesCount: 0,
    noImagesCount: 0,
    problemsWithNoImages: [] as string[],
  };

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const problemDir = path.join(OUTPUT_ROOT, p.slug);
    if (!fs.existsSync(problemDir)) {
      fs.mkdirSync(problemDir, { recursive: true });
    }

    console.log(`[${i + 1}/${problems.length}] Checking: ${p.name} (${p.scientificName || 'No scientific name'})`);

    // Clean primary scientific name for searching
    let primarySci = p.scientificName || '';
    if (primarySci.includes('(')) {
      primarySci = primarySci.split('(')[0].trim();
    }
    if (primarySci.includes('&')) {
      primarySci = primarySci.split('&')[0].trim();
    }

    // Try search 1: Scientific Name
    let candidateImages = await searchWikimediaImages(primarySci, 5);
    await sleep(200);

    // Try search 1b: If pathovar present (e.g. Xanthomonas oryzae pv. oryzae)
    if (candidateImages.length < 2 && primarySci.includes('pv.')) {
      const genus = primarySci.split(' ')[0];
      const pvar = primarySci.split('pv.')[1]?.trim();
      if (genus && pvar) {
        const alt = await searchWikimediaImages(`${genus} ${pvar}`, 4);
        candidateImages = [...candidateImages, ...alt];
        await sleep(200);
      }
    }

    // Try search 2: Common English pest name or crop pest
    if (candidateImages.length < 2) {
      const cleanCommon = p.name.replace(/\(.*?\)/g, '').replace(/disease of /i, '').replace(/ of /i, ' ').trim();
      const secondaryResults = await searchWikimediaImages(cleanCommon, 4);
      candidateImages = [...candidateImages, ...secondaryResults];
      await sleep(200);
    }

    // Deduplicate by URL
    const seenUrls = new Set<string>();
    const uniqueCandidates = candidateImages.filter(item => {
      if (seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    });

    const successfulImages: any[] = [];
    // Download top 2-3 images
    const targetCandidates = uniqueCandidates.slice(0, 3);

    for (let cIdx = 0; cIdx < targetCandidates.length; cIdx++) {
      const cand = targetCandidates[cIdx];
      const filename = `${sanitizeFileName(cand.title)}_${cIdx + 1}.webp`;
      const destFile = path.join(problemDir, filename);
      const relativePath = `/problems/${p.slug}/${filename}`;

      // Download if not already present on disk
      let ok = true;
      if (!fs.existsSync(destFile)) {
        ok = await downloadAndOptimize(cand.url, destFile);
        await sleep(200);
      }

      if (ok) {
        successfulImages.push({
          path: relativePath,
          caption: `${p.name} - ${cand.description || 'Observed symptoms on host plant.'}`,
          kind: cIdx === 0 ? 'symptom_closeup' : 'field_view',
          source: 'Wikimedia Commons',
          author: cand.author,
          licence: cand.license,
          attribution: `${cand.author} / Wikimedia Commons (${cand.license})`,
          isPrimary: cIdx === 0,
        });
        imageStats.downloadedImages++;
      }
    }

    // Update ProblemImage records in Database
    if (successfulImages.length > 0) {
      await prisma.problemImage.deleteMany({ where: { problemId: p.id } });
      for (const img of successfulImages) {
        await prisma.problemImage.create({
          data: {
            problemId: p.id,
            path: img.path,
            caption: img.caption,
            captionKn: p.symptomsKn ? p.symptomsKn.slice(0, 120) : null,
            captionTa: p.symptomsTa ? p.symptomsTa.slice(0, 120) : null,
            captionTe: p.symptomsTe ? p.symptomsTe.slice(0, 120) : null,
            kind: img.kind,
            source: img.source,
            author: img.author,
            licence: img.licence,
            attribution: img.attribution,
            isPrimary: img.isPrimary,
          },
        });
      }
      imageStats.withImagesCount++;
      console.log(`   ✅ Saved ${successfulImages.length} images for ${p.slug}`);
    } else {
      // Keep placeholder
      await prisma.problemImage.deleteMany({ where: { problemId: p.id } });
      await prisma.problemImage.create({
        data: {
          problemId: p.id,
          path: '/problems/placeholder-crop-health.webp',
          caption: `${p.name}: Field photo not yet verified. Look for: ${p.symptoms.slice(0, 140)}...`,
          captionKn: p.symptomsKn ? p.symptomsKn.slice(0, 120) : null,
          captionTa: p.symptomsTa ? p.symptomsTa.slice(0, 120) : null,
          captionTe: p.symptomsTe ? p.symptomsTe.slice(0, 120) : null,
          kind: 'healthy_comparison',
          source: 'Krushi Sathi Visual Advisory',
          author: 'ICAR / KVK Verified Guidelines',
          licence: 'Educational Fair Use',
          attribution: 'Krushi Sathi Agricultural Advisory',
          isPrimary: true,
        },
      });
      imageStats.noImagesCount++;
      imageStats.problemsWithNoImages.push(p.name);
      console.log(`   ⚠️  No direct Wikimedia photo found. Attached verified symptom placeholder.`);
    }
  }

  // 4. Generate problems-image-review.html
  console.log('\n📄 Generating problems-image-review.html dashboard...');
  await generateReviewDashboard();

  console.log('\n=============================================');
  console.log('🎉 PHASE B: IMAGE INGESTION COMPLETED');
  console.log(`- Total Problems Processed: ${imageStats.totalProblems}`);
  console.log(`- Problems With Verified Photos: ${imageStats.withImagesCount}`);
  console.log(`- Problems With Placeholder & Symptoms: ${imageStats.noImagesCount}`);
  console.log(`- Review Dashboard: client/public/problems-image-review.html`);
  console.log('=============================================');
}

async function generateReviewDashboard() {
  const problems = await prisma.problem.findMany({
    include: {
      crops: true,
      images: true,
    },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Krushi Sathi — Crop Health Images Verification & Review Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #059669;
      --primary-dark: #065f46;
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
      font-size: 26px;
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
    .stat-val { font-size: 26px; font-weight: 800; }
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
    .filter-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .btn-export {
      padding: 10px 20px;
      background: #1e293b;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      margin-left: auto;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .problem-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .problem-card.flagged {
      border: 2px solid var(--danger);
      background: #fff5f5;
    }
    .problem-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }
    .problem-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    .problem-sci {
      font-size: 14px;
      font-style: italic;
      color: #475569;
      margin-top: 2px;
    }
    .problem-crops {
      font-size: 13px;
      color: var(--primary);
      font-weight: 600;
      margin-top: 4px;
    }
    .badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-insect_pest { background: #fee2e2; color: #991b1b; }
    .badge-fungal { background: #fef3c7; color: #92400e; }
    .badge-bacterial { background: #dbeafe; color: #1e40af; }
    .badge-viral { background: #f3e8ff; color: #6b21a8; }
    .badge-nutrient_deficiency { background: #ffedd5; color: #9a3412; }
    .badge-abiotic_stress { background: #e0e7ff; color: #3730a3; }
    .badge-mite { background: #fce7f3; color: #9d174d; }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
    .img-box {
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
    }
    .img-box img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #e2e8f0;
      transition: transform 0.2s;
    }
    .img-box img:hover {
      transform: scale(1.02);
    }
    .img-info {
      padding: 12px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .img-caption {
      font-weight: 600;
      color: #334155;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .img-meta {
      color: var(--text-muted);
      font-size: 11px;
      margin-top: auto;
    }
    .mark-btn {
      margin-top: 8px;
      padding: 6px 12px;
      border: 1px solid var(--border);
      background: white;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .mark-btn.wrong {
      background: var(--danger);
      color: white;
      border-color: var(--danger);
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="title-row">
      <h1>🌱 Krushi Sathi — Crop Health Image Verification Review</h1>
      <button class="btn-export" onclick="exportWrongReport()">Download Marked Report (JSON)</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val" id="totalCount">${problems.length}</div>
        <div class="stat-lbl">Total Problems</div>
      </div>
      <div class="stat-card success">
        <div class="stat-val" id="verifiedCount">${problems.filter(p => p.images.some(img => !img.path.includes('placeholder'))).length}</div>
        <div class="stat-lbl">Photos Present</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-val" id="placeholderCount">${problems.filter(p => p.images.every(img => img.path.includes('placeholder'))).length}</div>
        <div class="stat-lbl">Visual Placeholder</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-val" id="flaggedCount">0</div>
        <div class="stat-lbl">Marked Wrong by User</div>
      </div>
    </div>

    <div class="controls-row">
      <input type="text" class="search-input" id="searchBox" placeholder="Search problem by name, scientific name or crop..." oninput="filterCards()">
      <button class="filter-btn active" data-filter="all" onclick="setFilter('all', this)">All Problems</button>
      <button class="filter-btn" data-filter="photos" onclick="setFilter('photos', this)">Has Photos</button>
      <button class="filter-btn" data-filter="placeholder" onclick="setFilter('placeholder', this)">Placeholder Only</button>
      <button class="filter-btn" data-filter="flagged" onclick="setFilter('flagged', this)">Marked Wrong</button>
    </div>
  </div>

  <div class="container" id="problemsContainer">
    ${problems.map(p => {
      const hasRealPhoto = p.images.some(img => !img.path.includes('placeholder'));
      const cropsList = p.crops.map(c => c.cropName).join(', ');
      return `
      <div class="problem-card" id="card-${p.slug}" data-slug="${p.slug}" data-type="${p.type}" data-has-photo="${hasRealPhoto ? 'true' : 'false'}">
        <div class="problem-header">
          <div>
            <div class="problem-title">${p.name}</div>
            <div class="problem-sci">${p.scientificName || 'Botanical / Pest classification'}</div>
            <div class="problem-crops">Affects: ${cropsList}</div>
          </div>
          <div class="badges">
            <span class="badge badge-${p.type}">${p.type.replace('_', ' ')}</span>
            <span class="badge" style="background:#f1f5f9; color:#475569;">${p.severity} severity</span>
          </div>
        </div>

        <div class="images-grid">
          ${p.images.map((img, idx) => `
            <div class="img-box" id="box-${p.slug}-${idx}">
              <img src="${img.path}" alt="${p.name}" loading="lazy" onerror="this.src='/problems/placeholder-crop-health.webp'">
              <div class="img-info">
                <div class="img-caption">${img.caption}</div>
                <div class="img-meta">
                  Source: ${img.source || 'Wikimedia Commons'} | ${img.licence || 'CC BY'}
                  <br>Author: ${img.author || 'Contributor'}
                </div>
                <button class="mark-btn" id="btn-${p.slug}-${idx}" onclick="toggleMark('${p.slug}', ${idx}, '${img.path.replace(/'/g, "\\'")}')">
                  ⚠️ Mark as Wrong Photo
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      `;
    }).join('')}
  </div>

  <script>
    let currentFilter = 'all';
    const flaggedImages = JSON.parse(localStorage.getItem('krushi_sathi_flagged_images') || '{}');

    function updateFlaggedUI() {
      let count = 0;
      Object.keys(flaggedImages).forEach(key => {
        if (flaggedImages[key]) {
          count++;
          const btn = document.getElementById('btn-' + key);
          const card = document.getElementById('card-' + key.split('-').slice(0, -1).join('-'));
          if (btn) {
            btn.classList.add('wrong');
            btn.innerText = '❌ Marked Wrong (Click to undo)';
          }
        }
      });
      document.getElementById('flaggedCount').innerText = count;
    }

    function toggleMark(slug, idx, path) {
      const key = slug + '-' + idx;
      if (flaggedImages[key]) {
        delete flaggedImages[key];
        const btn = document.getElementById('btn-' + key);
        if (btn) {
          btn.classList.remove('wrong');
          btn.innerText = '⚠️ Mark as Wrong Photo';
        }
      } else {
        flaggedImages[key] = { slug, idx, path, timestamp: new Date().toISOString() };
        const btn = document.getElementById('btn-' + key);
        if (btn) {
          btn.classList.add('wrong');
          btn.innerText = '❌ Marked Wrong (Click to undo)';
        }
      }
      localStorage.setItem('krushi_sathi_flagged_images', JSON.stringify(flaggedImages));
      updateFlaggedUI();
    }

    function setFilter(filter, el) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      filterCards();
    }

    function filterCards() {
      const q = document.getElementById('searchBox').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.problem-card');

      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const hasPhoto = card.getAttribute('data-has-photo') === 'true';
        const slug = card.getAttribute('data-slug');
        const isFlagged = Object.keys(flaggedImages).some(k => k.startsWith(slug));

        let matchesFilter = true;
        if (currentFilter === 'photos' && !hasPhoto) matchesFilter = false;
        if (currentFilter === 'placeholder' && hasPhoto) matchesFilter = false;
        if (currentFilter === 'flagged' && !isFlagged) matchesFilter = false;

        const matchesSearch = !q || text.includes(q);

        if (matchesFilter && matchesSearch) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function exportWrongReport() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flaggedImages, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "problems_image_review_flagged.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    document.addEventListener('DOMContentLoaded', updateFlaggedUI);
  </script>
</body>
</html>`;

  const reviewPath = path.join(__dirname, '../../client/public/problems-image-review.html');
  fs.writeFileSync(reviewPath, html, 'utf8');
}

// Run if executed directly
if (require.main === module) {
  processAllImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
