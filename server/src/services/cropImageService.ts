import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { CROPS_DATA } from '../data/cropKnowledge';

dotenv.config();

// Paths
export const CLIENT_PUBLIC_CROPS_DIR = path.resolve(__dirname, '../../../client/public/crops');
export const SERVER_DATA_DIR = path.resolve(__dirname, '../data');
export const CROPS_IMAGES_JSON_SERVER = path.join(SERVER_DATA_DIR, 'crops-images.json');
export const CROPS_IMAGES_JSON_CLIENT = path.join(CLIENT_PUBLIC_CROPS_DIR, 'crops-images.json');
export const CROPS_CATALOG_JSON_PATH = path.join(SERVER_DATA_DIR, 'cropsCatalog.json');

// Ensure destination directories exist
if (!fs.existsSync(CLIENT_PUBLIC_CROPS_DIR)) {
  fs.mkdirSync(CLIENT_PUBLIC_CROPS_DIR, { recursive: true });
}

export const USER_AGENT = 'KrushiSathiApp/2.0 (Agricultural Education & Farmer Advisory; contact: dev@krushisathi.org)';

export interface CropImageMetadata {
  cropId: string;
  name: string;
  scientificName: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  category: string;
  filePath: string;
  source: 'iNaturalist' | 'Wikipedia' | 'Wikimedia Commons' | 'Pexels' | 'Manual Upload' | 'Fallback Illustration';
  sourceUrl: string;
  photographer: string;
  license: string;
  status: 'pending-review' | 'approved' | 'use-fallback';
  updatedAt: string;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Clean HTML strings from Wikimedia metadata
export function cleanHtml(text?: string): string {
  if (!text) return 'Unknown Contributor';
  return text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() || 'Unknown Contributor';
}

// -------------------------------------------------------------
// 1. iNaturalist Taxa API Search
// -------------------------------------------------------------
export async function searchINaturalist(scientificName: string): Promise<{
  url: string;
  sourceUrl: string;
  photographer: string;
  license: string;
} | null> {
  try {
    const endpoint = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&is_active=true`;
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (!data.results || data.results.length === 0) return null;

    // Find the closest taxon (species/genus/variety)
    const taxon =
      data.results.find((t: any) => ['species', 'genus', 'variety', 'subspecies'].includes(t.rank)) ||
      data.results[0];

    // Priority 1: Check default_photo
    const photo = taxon.default_photo;
    if (photo && photo.url) {
      const licenseCode = (photo.license_code || '').toLowerCase();
      // Accept CC0, CC-BY, CC-BY-SA, or educational open licenses
      const isOpenLicense = ['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa'].includes(licenseCode);
      if (isOpenLicense) {
        // Upgrade square/medium thumbnail to large/original
        let highResUrl = photo.medium_url || photo.url;
        highResUrl = highResUrl.replace('/square.', '/large.').replace('/small.', '/large.');

        const photographer = cleanHtml(photo.attribution || 'iNaturalist Contributor');
        return {
          url: highResUrl,
          sourceUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
          photographer,
          license: licenseCode ? licenseCode.toUpperCase() : 'CC-BY-SA',
        };
      }
    }

    // Priority 2: Check taxon_photos array for an open license
    if (taxon.taxon_photos && Array.isArray(taxon.taxon_photos)) {
      for (const tp of taxon.taxon_photos) {
        const p = tp.photo;
        if (p && p.url) {
          const lCode = (p.license_code || '').toLowerCase();
          if (['cc0', 'cc-by', 'cc-by-sa'].includes(lCode)) {
            let highResUrl = p.medium_url || p.url;
            highResUrl = highResUrl.replace('/square.', '/large.').replace('/small.', '/large.');
            return {
              url: highResUrl,
              sourceUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
              photographer: cleanHtml(p.attribution || 'iNaturalist Contributor'),
              license: lCode.toUpperCase(),
            };
          }
        }
      }
    }

    return null;
  } catch (err: any) {
    console.warn(`    [iNaturalist API Warning] ${scientificName}:`, err.message);
    return null;
  }
}

// -------------------------------------------------------------
// 2. Wikipedia / Wikimedia Summary & Search
// -------------------------------------------------------------
export async function searchWikipediaSummary(query: string): Promise<{
  url: string;
  sourceUrl: string;
  photographer: string;
  license: string;
} | null> {
  try {
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as any;

    const imageUrl = data.originalimage?.source || data.thumbnail?.source;
    if (!imageUrl) return null;

    // Filter out maps, flags, logos, coats of arms
    const lower = imageUrl.toLowerCase();
    if (
      lower.includes('map') ||
      lower.includes('flag') ||
      lower.includes('logo') ||
      lower.includes('icon') ||
      lower.includes('diagram') ||
      lower.includes('drawing')
    ) {
      return null;
    }

    // Try to get Wikimedia Commons metadata
    let photographer = 'Wikimedia Commons Contributor';
    let license = 'CC BY-SA 4.0';
    let filePageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;

    // If it's a commons file, fetch exact license & photographer
    const fileNameMatch = imageUrl.match(/commons\/[^/]+\/[^/]+\/([^/?]+)/);
    if (fileNameMatch && fileNameMatch[1]) {
      const fileName = decodeURIComponent(fileNameMatch[1]);
      try {
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=extmetadata|url&format=json`;
        const infoRes = await fetch(infoUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (infoRes.ok) {
          const infoData = (await infoRes.json()) as any;
          const page = Object.values(infoData.query?.pages || {})[0] as any;
          const meta = page?.imageinfo?.[0]?.extmetadata;
          if (meta) {
            photographer = cleanHtml(meta.Artist?.value || meta.Credit?.value || photographer);
            license = meta.LicenseShortName?.value || meta.License?.value || license;
            filePageUrl = page?.imageinfo?.[0]?.descriptionurl || filePageUrl;
          }
        }
      } catch {
        // keep defaults
      }
    }

    return {
      url: imageUrl,
      sourceUrl: filePageUrl,
      photographer,
      license,
    };
  } catch (err: any) {
    console.warn(`    [Wikipedia API Warning] ${query}:`, err.message);
    return null;
  }
}

// -------------------------------------------------------------
// 3. Pexels API Search (Requires PEXELS_API_KEY in server/.env)
// -------------------------------------------------------------
export async function searchPexels(
  englishName: string,
  scientificName: string
): Promise<{
  url: string;
  sourceUrl: string;
  photographer: string;
  license: string;
} | null> {
  const pexelsKey = process.env.PEXELS_API_KEY;
  if (!pexelsKey) return null;

  try {
    const cleanName = englishName.split('(')[0].trim();
    const query = `${cleanName} ${scientificName} crop plant field`;
    const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;

    const res = await fetch(endpoint, {
      headers: { Authorization: pexelsKey },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (!data.photos || data.photos.length === 0) return null;

    const photo = data.photos[0];
    return {
      url: photo.src?.large2x || photo.src?.large || photo.src?.original,
      sourceUrl: photo.url,
      photographer: photo.photographer || 'Pexels Creator',
      license: 'Pexels Free License',
    };
  } catch (err: any) {
    console.warn(`    [Pexels API Warning]:`, err.message);
    return null;
  }
}

// -------------------------------------------------------------
// Download Image Buffer with Retry
// -------------------------------------------------------------
export async function downloadImageBuffer(url: string, retries = 3): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        if (attempt === retries) return null;
        await sleep(1000 * attempt);
        continue;
      }

      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      if (attempt === retries) return null;
      await sleep(1000 * attempt);
    }
  }
  return null;
}

// -------------------------------------------------------------
// Compress and save to WebP (~800px wide)
// -------------------------------------------------------------
export async function saveCompressedWebp(buffer: Buffer, destPath: string): Promise<boolean> {
  try {
    await sharp(buffer)
      .resize({
        width: 800,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 82, effort: 4 })
      .toFile(destPath);
    return true;
  } catch (err: any) {
    console.error(`    [Sharp Compression Error] ${destPath}:`, err.message);
    return false;
  }
}

// Helper to determine aliases so both naming styles are kept synchronized
export function getCropAliases(cropId: string): string[] {
  const aliases: string[] = [];
  if (cropId.startsWith('crop-')) {
    aliases.push(cropId.replace('crop-', ''));
  } else {
    aliases.push(`crop-${cropId}`);
  }

  // Common crop ID mappings between CROPS_DATA and catalog
  const idMap: Record<string, string[]> = {
    'crop-ragi-finger-millet': ['finger-millet-ragi', 'crop-finger-millet-ragi'],
    'crop-chickpea-gram': ['chickpea-bengal-gram', 'crop-chickpea-bengal-gram'],
    'crop-jowar-sorghum': ['sorghum-jowar', 'crop-sorghum-jowar'],
    'crop-bajra-pearl-millet': ['pearl-millet-bajra', 'crop-pearl-millet-bajra'],
    'crop-wheat-rabi': ['wheat-south-india', 'crop-wheat-south-india', 'wheat'],
    'crop-redgram-pigeonpea': ['red-gram-pigeonpea', 'crop-red-gram-pigeonpea'],
    'crop-greengram-moong': ['green-gram-moong', 'crop-green-gram-moong'],
    'crop-chilli-pepper': ['chilli-green-dry', 'crop-chilli-green-dry', 'chilli'],
    'crop-onion-bulb': ['onion', 'crop-onion'],
    'crop-bhendi-okra': ['bhendi-okra', 'crop-bhendi-okra', 'okra'],
    'crop-tomato-vegetable': ['tomato', 'crop-tomato'],
    'crop-cotton-cash': ['cotton', 'crop-cotton'],
    'crop-mango-alphonso': ['mango', 'crop-mango'],
    'crop-watermelon-summer': ['watermelon', 'crop-watermelon'],
    'crop-banana-grandnaine': ['banana', 'crop-banana'],
    'crop-papaya-redlady': ['papaya', 'crop-papaya'],
    'crop-marigold-african': ['marigold', 'crop-marigold'],
    'crop-coconut-tall': ['coconut', 'crop-coconut'],
    'crop-coffee-arabica': ['coffee', 'crop-coffee'],
    'crop-sandalwood-agroforestry': ['sandalwood-srigandha', 'crop-sandalwood-srigandha'],
    'crop-turmeric-salem': ['turmeric', 'crop-turmeric'],
    'crop-ginger-cochin': ['ginger', 'crop-ginger'],
    'crop-black-pepper-panniyur': ['black-pepper', 'crop-black-pepper'],
    'crop-sunflower-hybrid': ['sunflower', 'crop-sunflower'],
    'crop-soybean-js335': ['soybean', 'crop-soybean'],
    'crop-super-napier-co5': ['super-napier-co5', 'fodder-sorghum-multicut'],
    'crop-fodder-cowpea': ['cowpea-alasande', 'crop-cowpea-alasande'],
  };

  if (idMap[cropId]) {
    aliases.push(...idMap[cropId]);
  }

  return Array.from(new Set(aliases));
}

// -------------------------------------------------------------
// MAIN FETCH WORKFLOW
// -------------------------------------------------------------
export async function fetchAllCropImages(options: { force?: boolean; singleCropId?: string } = {}) {
  console.log('\n=============================================================');
  console.log('🌾 Krushi Sathi — Botanical Crop Image Fetch & Verification');
  console.log('=============================================================');

  // Load existing metadata map if present
  let existingMetadata: Record<string, CropImageMetadata> = {};
  if (fs.existsSync(CROPS_IMAGES_JSON_SERVER)) {
    try {
      const raw = fs.readFileSync(CROPS_IMAGES_JSON_SERVER, 'utf-8');
      const list: CropImageMetadata[] = JSON.parse(raw);
      list.forEach(item => {
        existingMetadata[item.cropId] = item;
      });
      console.log(`Loaded ${list.length} existing crop image records from crops-images.json.`);
    } catch (err: any) {
      console.warn('Could not read existing crops-images.json:', err.message);
    }
  }

  const cropsToProcess: Array<{
    cropId: string;
    name: string;
    scientificName: string;
    nameKannada: string;
    nameTamil: string;
    nameTelugu: string;
    category: string;
  }> = [];

  const seenIds = new Set<string>();

  for (const crop of CROPS_DATA) {
    seenIds.add(crop.id);
    cropsToProcess.push({
      cropId: crop.id,
      name: crop.name,
      scientificName: crop.scientificName,
      nameKannada: crop.nameKannada || '',
      nameTamil: crop.nameTamil || '',
      nameTelugu: crop.nameTelugu || '',
      category: crop.category || 'general',
    });
  }

  if (fs.existsSync(CROPS_CATALOG_JSON_PATH)) {
    try {
      const catalog = JSON.parse(fs.readFileSync(CROPS_CATALOG_JSON_PATH, 'utf-8'));
      for (const catCrop of catalog) {
        if (!seenIds.has(catCrop.id)) {
          seenIds.add(catCrop.id);
          cropsToProcess.push({
            cropId: catCrop.id,
            name: catCrop.name,
            scientificName: catCrop.scientificName,
            nameKannada: catCrop.nameKannada || '',
            nameTamil: catCrop.nameTamil || '',
            nameTelugu: catCrop.nameTelugu || '',
            category: catCrop.category || 'general',
          });
        }
      }
    } catch {
      // ignore
    }
  }

  let queue = cropsToProcess;
  if (options.singleCropId) {
    queue = cropsToProcess.filter(c => c.cropId === options.singleCropId);
    if (queue.length === 0) {
      console.error(`Crop with ID "${options.singleCropId}" not found in knowledge base.`);
      return;
    }
  }

  console.log(`Ready to verify/fetch images for ${queue.length} crops...\n`);

  let fetchedCount = 0;
  let skippedApproved = 0;
  let fallbackCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const crop = queue[i];
    const cropFile = `${crop.cropId}.webp`;
    const destPath = path.join(CLIENT_PUBLIC_CROPS_DIR, cropFile);
    const existing = existingMetadata[crop.cropId];

    console.log(`[${i + 1}/${queue.length}] 🌿 ${crop.name} (${crop.scientificName || 'Botanical name'}) [${crop.cropId}]`);

    if (!options.force && existing && existing.status === 'approved' && fs.existsSync(destPath)) {
      console.log(`  ✅ Already Approved (${existing.source} • ${existing.license}). Skipping.`);
      skippedApproved++;
      continue;
    }

    let chosenResult: {
      url: string;
      sourceUrl: string;
      photographer: string;
      license: string;
      source: 'iNaturalist' | 'Wikipedia' | 'Wikimedia Commons' | 'Pexels';
    } | null = null;

    if (crop.scientificName) {
      const inat = await searchINaturalist(crop.scientificName);
      if (inat) {
        chosenResult = { ...inat, source: 'iNaturalist' };
        console.log(`  📍 Found on iNaturalist: ${inat.license} by ${inat.photographer}`);
      }
    }

    await sleep(300);

    if (!chosenResult && crop.scientificName) {
      const wikiSci = await searchWikipediaSummary(crop.scientificName);
      if (wikiSci) {
        chosenResult = { ...wikiSci, source: 'Wikipedia' };
        console.log(`  📍 Found on Wikipedia (Scientific): ${wikiSci.license} by ${wikiSci.photographer}`);
      }
    }

    if (!chosenResult) {
      const cleanCommon = crop.name.split('(')[0].trim();
      const wikiCommon = await searchWikipediaSummary(cleanCommon);
      if (wikiCommon) {
        chosenResult = { ...wikiCommon, source: 'Wikipedia' };
        console.log(`  📍 Found on Wikipedia (Common): ${wikiCommon.license} by ${wikiCommon.photographer}`);
      }
    }

    await sleep(300);

    if (!chosenResult) {
      const pexels = await searchPexels(crop.name, crop.scientificName);
      if (pexels) {
        chosenResult = { ...pexels, source: 'Pexels' };
        console.log(`  📍 Found on Pexels: Free license by ${pexels.photographer}`);
      }
    }

    if (chosenResult) {
      console.log(`  ⬇️ Downloading image from ${chosenResult.url.substring(0, 70)}...`);
      const buffer = await downloadImageBuffer(chosenResult.url);

      if (buffer) {
        const saved = await saveCompressedWebp(buffer, destPath);
        if (saved) {
          const aliases = getCropAliases(crop.cropId);
          for (const alias of aliases) {
            const aliasPath = path.join(CLIENT_PUBLIC_CROPS_DIR, `${alias}.webp`);
            try {
              fs.copyFileSync(destPath, aliasPath);
            } catch {}
          }

          const record: CropImageMetadata = {
            cropId: crop.cropId,
            name: crop.name,
            scientificName: crop.scientificName,
            nameKannada: crop.nameKannada,
            nameTamil: crop.nameTamil,
            nameTelugu: crop.nameTelugu,
            category: crop.category,
            filePath: `/crops/${crop.cropId}.webp`,
            source: chosenResult.source,
            sourceUrl: chosenResult.sourceUrl,
            photographer: chosenResult.photographer,
            license: chosenResult.license,
            status: existing?.status === 'approved' ? 'approved' : 'pending-review',
            updatedAt: new Date().toISOString(),
          };

          existingMetadata[crop.cropId] = record;
          fetchedCount++;
          console.log(`  ✨ Saved 800px WebP -> ${cropFile}`);
        } else {
          console.error(`  ❌ Failed to compress image with Sharp.`);
        }
      } else {
        console.error(`  ❌ Failed to download image buffer.`);
      }
    } else {
      if (fs.existsSync(destPath)) {
        console.log(`  ℹ️ No API image found, but local WebP already present. Retaining local file.`);
        if (!existingMetadata[crop.cropId]) {
          existingMetadata[crop.cropId] = {
            cropId: crop.cropId,
            name: crop.name,
            scientificName: crop.scientificName,
            nameKannada: crop.nameKannada,
            nameTamil: crop.nameTamil,
            nameTelugu: crop.nameTelugu,
            category: crop.category,
            filePath: `/crops/${crop.cropId}.webp`,
            source: 'Wikimedia Commons',
            sourceUrl: 'https://commons.wikimedia.org',
            photographer: 'Botanical Archive',
            license: 'CC BY-SA',
            status: 'pending-review',
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        console.warn(`  ⚠️ No image found. Designating fallback illustration.`);
        existingMetadata[crop.cropId] = {
          cropId: crop.cropId,
          name: crop.name,
          scientificName: crop.scientificName,
          nameKannada: crop.nameKannada,
          nameTamil: crop.nameTamil,
          nameTelugu: crop.nameTelugu,
          category: crop.category,
          filePath: `/crops/${crop.cropId}.webp`,
          source: 'Fallback Illustration',
          sourceUrl: '',
          photographer: 'Krushi Sathi Botanical System',
          license: 'CC0',
          status: 'use-fallback',
          updatedAt: new Date().toISOString(),
        };
        fallbackCount++;
      }
    }

    const metadataList = Object.values(existingMetadata);
    fs.writeFileSync(CROPS_IMAGES_JSON_SERVER, JSON.stringify(metadataList, null, 2), 'utf-8');
    fs.writeFileSync(CROPS_IMAGES_JSON_CLIENT, JSON.stringify(metadataList, null, 2), 'utf-8');
  }

  const finalList = Object.values(existingMetadata);
  const approvedTotal = finalList.filter(c => c.status === 'approved').length;
  const pendingTotal = finalList.filter(c => c.status === 'pending-review').length;
  const fallbackTotal = finalList.filter(c => c.status === 'use-fallback').length;

  console.log('\n=============================================================');
  console.log('✅ CROP IMAGES RUN COMPLETE!');
  console.log(`📦 Total Crops in Index: ${finalList.length}`);
  console.log(`🌟 Approved: ${approvedTotal}`);
  console.log(`⏳ Pending Review: ${pendingTotal}`);
  console.log(`🎨 Use Fallback: ${fallbackTotal}`);
  console.log(`💾 Saved metadata to:`);
  console.log(`   - ${CROPS_IMAGES_JSON_SERVER}`);
  console.log(`   - ${CROPS_IMAGES_JSON_CLIENT}`);
  console.log('=============================================================\n');
}
