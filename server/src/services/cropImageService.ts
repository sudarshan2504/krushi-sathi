import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

let cachedImageMetaMap: Map<string, CropImageMetadata> | null = null;
let cachedImageMetaMtime = 0;

export function clearCropImageMetadataCache() {
  cachedImageMetaMap = null;
  cachedImageMetaMtime = 0;
}

export function getCropImageMetadataMap(): Map<string, CropImageMetadata> {
  try {
    if (fs.existsSync(CROPS_IMAGES_JSON_SERVER)) {
      const stats = fs.statSync(CROPS_IMAGES_JSON_SERVER);
      if (!cachedImageMetaMap || stats.mtimeMs > cachedImageMetaMtime) {
        const list: CropImageMetadata[] = JSON.parse(fs.readFileSync(CROPS_IMAGES_JSON_SERVER, 'utf-8'));
        const map = new Map<string, CropImageMetadata>();
        for (const item of list) {
          map.set(item.cropId, item);
        }
        // Map known aliases so DB / slug lookups resolve to their canonical crop metadata
        for (const item of list) {
          for (const alias of getCropAliases(item.cropId)) {
            if (!map.has(alias)) {
              map.set(alias, item);
            }
          }
        }
        cachedImageMetaMap = map;
        cachedImageMetaMtime = stats.mtimeMs;
      }
      return cachedImageMetaMap;
    }
  } catch (err: any) {
    console.warn('Could not read crops-images.json metadata cache:', err.message);
  }
  return new Map();
}

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
  const stripped = text
    .replace(/<[^>]*>?/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped || 'Unknown Contributor';
}

const SCIENTIFIC_NAME_ALIASES: Record<string, string[]> = {
  'sorghum bicolor var. sudanense': ['Sorghum × drummondii', 'Sorghum drummondii', 'Sudangrass'],
  'pennisetum purpureum x p. glaucum': ['Cenchrus purpureus', 'Pennisetum purpureum'],
  'sorghum bicolor var. saccharatum': ['Sorghum bicolor bicolor', 'Sorghum bicolor'],
};

export function getScientificNameCandidates(scientificName: string): string[] {
  const candidates: string[] = [];
  const raw = (scientificName || '').trim();
  if (!raw) return candidates;
  candidates.push(raw);

  const lower = raw.toLowerCase();
  if (SCIENTIFIC_NAME_ALIASES[lower]) {
    candidates.push(...SCIENTIFIC_NAME_ALIASES[lower]);
  }

  // Strip "var. ..." or "subsp. ..." if present
  const noVar = raw.replace(/\s+(var\.|subsp\.|ssp\.|f\.)\s+.*$/i, '').trim();
  if (noVar && noVar !== raw) {
    candidates.push(noVar);
  }

  // If hybrid notation "A x B", also try primary parent binomial "A"
  if (/\s+[x×]\s+/i.test(raw)) {
    const primary = raw.split(/\s+[x×]\s+/i)[0]?.trim();
    if (primary) candidates.push(primary);
  }

  return Array.from(new Set(candidates));
}

export interface SearchImageCandidate {
  url: string;
  sourceUrl: string;
  photographer: string;
  license: string;
}

const TIER1_LICENSES = new Set(['cc0', 'cc-by', 'cc-by-sa']);
const OPEN_LICENSES = new Set(['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa']);

// -------------------------------------------------------------
// 1. iNaturalist Taxa API Search
// -------------------------------------------------------------
export async function searchINaturalistCandidates(scientificName: string): Promise<SearchImageCandidate[]> {
  try {
    const endpoint = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&is_active=true`;
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    });

    if (!res.ok) return [];
    const data = (await res.json()) as any;
    if (!data.results || data.results.length === 0) return [];

    const queryLower = scientificName.toLowerCase().trim();
    const rankedTaxa = [...data.results].sort((a: any, b: any) => {
      const aExact = (a.name || '').toLowerCase().trim() === queryLower ? 0 : 1;
      const bExact = (b.name || '').toLowerCase().trim() === queryLower ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const validRanks = new Set(['species', 'subspecies', 'variety', 'infrahybrid', 'genus']);
      const aRank = validRanks.has(a.rank) ? 0 : 1;
      const bRank = validRanks.has(b.rank) ? 0 : 1;
      return aRank - bRank;
    });

    const candidates: SearchImageCandidate[] = [];
    const seenPhotoUrls = new Set<string>();

    const collectPhoto = (taxonId: number | string, photo: any, preferTier1Only: boolean) => {
      if (!photo || !photo.url) return;
      const licenseCode = (photo.license_code || '').toLowerCase();
      if (!OPEN_LICENSES.has(licenseCode)) return;
      if (preferTier1Only && !TIER1_LICENSES.has(licenseCode)) return;
      if (!preferTier1Only && TIER1_LICENSES.has(licenseCode)) return;

      let highResUrl = photo.medium_url || photo.url;
      highResUrl = highResUrl.replace('/square.', '/large.').replace('/small.', '/large.');
      if (seenPhotoUrls.has(highResUrl)) return;
      seenPhotoUrls.add(highResUrl);

      candidates.push({
        url: highResUrl,
        sourceUrl: `https://www.inaturalist.org/taxa/${taxonId}`,
        photographer: cleanHtml(photo.attribution || 'iNaturalist Contributor'),
        license: licenseCode ? licenseCode.toUpperCase() : 'CC-BY-SA',
      });
    };

    // Pass 1: Tier-1 open commercial-friendly licenses (CC0, CC-BY, CC-BY-SA) across matching taxa
    for (const taxon of rankedTaxa.slice(0, 3)) {
      collectPhoto(taxon.id, taxon.default_photo, true);
      if (Array.isArray(taxon.taxon_photos)) {
        for (const tp of taxon.taxon_photos) {
          collectPhoto(taxon.id, tp?.photo, true);
        }
      }
    }

    // Pass 2: Tier-2 educational CC-BY-NC / CC-BY-NC-SA fallback
    for (const taxon of rankedTaxa.slice(0, 2)) {
      collectPhoto(taxon.id, taxon.default_photo, false);
      if (Array.isArray(taxon.taxon_photos)) {
        for (const tp of taxon.taxon_photos) {
          collectPhoto(taxon.id, tp?.photo, false);
        }
      }
    }

    return candidates;
  } catch (err: any) {
    console.warn(`    [iNaturalist API Warning] ${scientificName}:`, err.message);
    return [];
  }
}

export async function searchINaturalist(scientificName: string): Promise<SearchImageCandidate | null> {
  const candidates = await searchINaturalistCandidates(scientificName);
  return candidates[0] || null;
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
// Compress and save to WebP (~800px wide, < 300KB)
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

    // Ensure WebP size stays comfortably under 300 KB
    let stat = fs.statSync(destPath);
    if (stat.size > 280 * 1024) {
      await sharp(buffer)
        .resize({ width: 760, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 72, effort: 5 })
        .toFile(destPath);
      stat = fs.statSync(destPath);
    }
    if (stat.size > 295 * 1024) {
      await sharp(buffer)
        .resize({ width: 680, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 65, effort: 5 })
        .toFile(destPath);
    }

    return true;
  } catch (err: any) {
    console.error(`    [Sharp Compression Error] ${destPath}:`, err.message);
    return false;
  }
}

// Helper to determine aliases so both naming styles are kept synchronized symmetrically
const ALIAS_GROUPS_SEED: Record<string, string[]> = {
  'crop-ragi-finger-millet': ['finger-millet-ragi', 'crop-finger-millet-ragi'],
  'crop-chickpea-gram': ['chickpea-bengal-gram', 'crop-chickpea-bengal-gram'],
  'crop-jowar-sorghum': ['sorghum-jowar', 'crop-sorghum-jowar'],
  'crop-bajra-pearl-millet': ['pearl-millet-bajra', 'crop-pearl-millet-bajra'],
  'crop-wheat-rabi': ['wheat-south-india', 'crop-wheat-south-india', 'wheat'],
  'crop-redgram-pigeonpea': ['red-gram-pigeonpea', 'crop-red-gram-pigeonpea', 'crop-pigeonpea'],
  'crop-greengram-moong': ['green-gram-moong', 'crop-green-gram-moong'],
  'crop-chilli-pepper': ['chilli-green-dry', 'crop-chilli-green-dry', 'crop-chilli', 'chilli'],
  'crop-onion-bulb': ['onion', 'crop-onion'],
  'crop-bhendi-okra': ['bhendi-okra', 'crop-bhendi-okra', 'crop-okra', 'okra'],
  'crop-tomato-vegetable': ['tomato', 'crop-tomato'],
  'crop-cotton-cash': ['cotton', 'crop-cotton'],
  'crop-mango-alphonso': ['mango', 'crop-mango'],
  'crop-watermelon-summer': ['watermelon', 'crop-watermelon'],
  'crop-banana-grandnaine': ['banana', 'crop-banana'],
  'crop-papaya-redlady': ['papaya', 'crop-papaya'],
  'crop-marigold-african': ['marigold', 'crop-marigold'],
  'crop-jasmine-mysore-mallige': ['jasmine-mysore-mallige'],
  'crop-arecanut-betelnut': ['arecanut-betelnut', 'crop-arecanut-betelnut', 'crop-arecanut'],
  'crop-coconut-tall': ['coconut', 'crop-coconut'],
  'crop-coffee-arabica': ['coffee', 'crop-coffee'],
  'crop-sandalwood-agroforestry': ['sandalwood-srigandha', 'crop-sandalwood-srigandha'],
  'crop-turmeric-salem': ['turmeric', 'crop-turmeric'],
  'crop-ginger-cochin': ['ginger', 'crop-ginger'],
  'crop-black-pepper-panniyur': ['black-pepper', 'crop-black-pepper'],
  'crop-sunflower-hybrid': ['sunflower', 'crop-sunflower'],
  'crop-soybean-js335': ['soybean', 'crop-soybean'],
  'crop-super-napier-co5': ['super-napier-co5'],
  'crop-fodder-cowpea': ['cowpea-alasande', 'crop-cowpea-alasande'],
};

const REVERSE_ALIAS_MAP = new Map<string, Set<string>>();
for (const [primary, members] of Object.entries(ALIAS_GROUPS_SEED)) {
  const group = new Set([primary, ...members]);
  for (const id of group) {
    if (!REVERSE_ALIAS_MAP.has(id)) REVERSE_ALIAS_MAP.set(id, new Set());
    for (const peer of group) {
      if (peer !== id) REVERSE_ALIAS_MAP.get(id)!.add(peer);
    }
  }
}

export function getCropAliases(cropId: string): string[] {
  const aliases = new Set<string>();
  if (cropId.startsWith('crop-')) {
    aliases.add(cropId.replace(/^crop-/, ''));
  } else {
    aliases.add(`crop-${cropId}`);
  }

  const groupPeers = REVERSE_ALIAS_MAP.get(cropId);
  if (groupPeers) {
    for (const peer of groupPeers) {
      aliases.add(peer);
    }
  }

  aliases.delete(cropId);
  return Array.from(aliases);
}

export function syncCatalogJsonWithMetadata(records?: CropImageMetadata[]) {
  try {
    const metadataList: CropImageMetadata[] =
      records ||
      (fs.existsSync(CROPS_IMAGES_JSON_SERVER)
        ? JSON.parse(fs.readFileSync(CROPS_IMAGES_JSON_SERVER, 'utf-8'))
        : []);

    const byId = new Map<string, CropImageMetadata>(metadataList.map(r => [r.cropId, r]));

    if (fs.existsSync(CROPS_CATALOG_JSON_PATH)) {
      const catalog = JSON.parse(fs.readFileSync(CROPS_CATALOG_JSON_PATH, 'utf-8'));
      const updated = catalog.map((crop: any) => {
        const meta = byId.get(crop.id);
        if (!meta) return crop;

        if (meta.status === 'use-fallback') {
          return {
            ...crop,
            imageStatus: meta.status,
            imageUrl: '',
            images: [],
          };
        }

        const localPath = `/crops/${crop.id}.webp`;
        return {
          ...crop,
          imageStatus: meta.status,
          imageUrl: localPath,
          images: [
            {
              type: 'plant',
              path: localPath,
              source: meta.source || 'Botanical Archive',
              author: meta.photographer || 'Contributor',
              license: meta.license || 'CC-BY-SA',
              attributionUrl: meta.sourceUrl || '',
            },
          ],
        };
      });

      const serialized = JSON.stringify(updated, null, 2);
      fs.writeFileSync(CROPS_CATALOG_JSON_PATH, serialized, 'utf-8');
      const clientCatalogPath = path.join(CLIENT_PUBLIC_CROPS_DIR, 'cropsCatalog.json');
      if (fs.existsSync(path.dirname(clientCatalogPath))) {
        fs.writeFileSync(clientCatalogPath, serialized, 'utf-8');
      }
    }
    clearCropImageMetadataCache();
  } catch (err: any) {
    console.warn('Could not sync cropsCatalog.json with image metadata:', err.message);
  }
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

  // Track SHA-256 hashes of existing crop files to prevent non-alias crops from reusing the same photo
  const usedHashToCrops = new Map<string, Set<string>>();
  for (const meta of Object.values(existingMetadata)) {
    const p = path.join(CLIENT_PUBLIC_CROPS_DIR, `${meta.cropId}.webp`);
    if (meta.status !== 'use-fallback' && fs.existsSync(p)) {
      const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
      if (!usedHashToCrops.has(h)) usedHashToCrops.set(h, new Set());
      usedHashToCrops.get(h)!.add(meta.cropId);
    }
  }

  const isHashUsedByOtherCrop = (candidateBuffer: Buffer, cropId: string): boolean => {
    const allowedSet = new Set([cropId, ...getCropAliases(cropId)]);
    const hash = crypto.createHash('sha256').update(candidateBuffer).digest('hex');
    const owners = usedHashToCrops.get(hash);
    if (!owners) return false;
    for (const owner of owners) {
      if (!allowedSet.has(owner)) return true;
    }
    return false;
  };

  let fetchedCount = 0;
  let skippedApproved = 0;
  let fallbackCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const crop = queue[i];
    const cropFile = `${crop.cropId}.webp`;
    const destPath = path.join(CLIENT_PUBLIC_CROPS_DIR, cropFile);
    const tempPath = path.join(CLIENT_PUBLIC_CROPS_DIR, `.tmp-${crop.cropId}.webp`);
    const existing = existingMetadata[crop.cropId];

    console.log(`[${i + 1}/${queue.length}] 🌿 ${crop.name} (${crop.scientificName || 'Botanical name'}) [${crop.cropId}]`);

    if (!options.force && existing && existing.status === 'approved' && fs.existsSync(destPath)) {
      console.log(`  ✅ Already Approved (${existing.source} • ${existing.license}). Skipping.`);
      skippedApproved++;
      continue;
    }

    type CandidateWithSource = SearchImageCandidate & {
      source: 'iNaturalist' | 'Wikipedia' | 'Wikimedia Commons' | 'Pexels';
    };
    const candidates: CandidateWithSource[] = [];
    const sciCandidates = getScientificNameCandidates(crop.scientificName);

    for (const sciQuery of sciCandidates) {
      const inatList = await searchINaturalistCandidates(sciQuery);
      for (const item of inatList) {
        candidates.push({ ...item, source: 'iNaturalist' });
      }
      await sleep(200);
    }

    await sleep(250);

    if (sciCandidates.length > 0) {
      for (const sciQuery of sciCandidates) {
        const wikiSci = await searchWikipediaSummary(sciQuery);
        if (wikiSci) {
          candidates.push({ ...wikiSci, source: 'Wikipedia' });
        }
        await sleep(200);
      }
    }

    const cleanCommon = crop.name.split('(')[0].trim();
    const wikiCommon = await searchWikipediaSummary(cleanCommon);
    if (wikiCommon) {
      candidates.push({ ...wikiCommon, source: 'Wikipedia' });
    }

    await sleep(250);

    const pexels = await searchPexels(crop.name, crop.scientificName);
    if (pexels) {
      candidates.push({ ...pexels, source: 'Pexels' });
    }

    let chosenResult: CandidateWithSource | null = null;
    let savedNewFile = false;

    for (const cand of candidates) {
      console.log(`  ⬇️ Trying ${cand.source} (${cand.license}) -> ${cand.url.substring(0, 68)}...`);
      const buffer = await downloadImageBuffer(cand.url);
      if (!buffer) continue;

      const saved = await saveCompressedWebp(buffer, tempPath);
      if (!saved || !fs.existsSync(tempPath)) continue;

      const compressedBuf = fs.readFileSync(tempPath);
      if (isHashUsedByOtherCrop(compressedBuf, crop.cropId)) {
        console.log(`  ⚠️ Candidate photo collides with another non-alias crop. Trying next candidate...`);
        try { fs.unlinkSync(tempPath); } catch {}
        continue;
      }

      fs.renameSync(tempPath, destPath);
      const newHash = crypto.createHash('sha256').update(compressedBuf).digest('hex');
      if (!usedHashToCrops.has(newHash)) usedHashToCrops.set(newHash, new Set());
      usedHashToCrops.get(newHash)!.add(crop.cropId);

      chosenResult = cand;
      savedNewFile = true;
      break;
    }

    if (chosenResult && savedNewFile) {
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
        status: options.force ? 'pending-review' : (existing?.status === 'approved' ? 'approved' : 'pending-review'),
        updatedAt: new Date().toISOString(),
      };

      existingMetadata[crop.cropId] = record;
      fetchedCount++;
      console.log(`  📍 Selected ${chosenResult.source} (${chosenResult.license}) by ${chosenResult.photographer}`);
      console.log(`  ✨ Saved 800px WebP -> ${cropFile}`);
    } else {
      if (fs.existsSync(destPath) && existing && existing.sourceUrl && existing.photographer !== 'Botanical Archive') {
        console.log(`  ℹ️ No new API image found; retaining verified local WebP (${existing.source}).`);
      } else {
        console.warn(`  ⚠️ No verified image found. Designating fallback illustration.`);
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
  syncCatalogJsonWithMetadata(finalList);
  const approvedTotal = finalList.filter(c => c.status === 'approved').length;
  const pendingTotal = finalList.filter(c => c.status === 'pending-review').length;
  const fallbackTotal = finalList.filter(c => c.status === 'use-fallback').length;

  console.log('\n=============================================================');
  console.log('✅ CROP IMAGES RUN COMPLETE!');
  console.log(`📦 Total Crops in Index: ${finalList.length} (fetched: ${fetchedCount}, skipped approved: ${skippedApproved})`);
  console.log(`🌟 Approved: ${approvedTotal}`);
  console.log(`⏳ Pending Review: ${pendingTotal}`);
  console.log(`🎨 Use Fallback: ${fallbackTotal}`);
  console.log(`💾 Saved metadata to:`);
  console.log(`   - ${CROPS_IMAGES_JSON_SERVER}`);
  console.log(`   - ${CROPS_IMAGES_JSON_CLIENT}`);
  console.log('=============================================================\n');
}

