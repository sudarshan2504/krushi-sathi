import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  CropImageMetadata,
  fetchAllCropImages,
  syncCatalogJsonWithMetadata,
  clearCropImageMetadataCache,
  getCropAliases,
} from '../services/cropImageService';

export const devCropRouter = express.Router();

const SERVER_DATA_DIR = path.resolve(__dirname, '../data');
const CROPS_IMAGES_JSON_SERVER = path.join(SERVER_DATA_DIR, 'crops-images.json');
const CLIENT_PUBLIC_CROPS_DIR = path.resolve(__dirname, '../../../client/public/crops');
const CROPS_IMAGES_JSON_CLIENT = path.join(CLIENT_PUBLIC_CROPS_DIR, 'crops-images.json');

function getRecords(): CropImageMetadata[] {
  if (fs.existsSync(CROPS_IMAGES_JSON_SERVER)) {
    try {
      const raw = fs.readFileSync(CROPS_IMAGES_JSON_SERVER, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

function saveRecords(records: CropImageMetadata[]) {
  const jsonStr = JSON.stringify(records, null, 2);
  fs.writeFileSync(CROPS_IMAGES_JSON_SERVER, jsonStr, 'utf-8');
  if (fs.existsSync(CLIENT_PUBLIC_CROPS_DIR)) {
    fs.writeFileSync(CROPS_IMAGES_JSON_CLIENT, jsonStr, 'utf-8');
  }
  syncCatalogJsonWithMetadata(records);
  clearCropImageMetadataCache();
}

// Dev guard middleware
function devOnlyMiddleware(req: Request, res: Response, next: express.NextFunction) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Dev gallery endpoints are disabled in production' });
  }
  next();
}

// 1. GET /api/dev/crops
devCropRouter.get('/', devOnlyMiddleware, (req: Request, res: Response) => {
  const records = getRecords();
  return res.json({ success: true, count: records.length, data: records });
});

// 2. POST /api/dev/crops/:cropId/approve
devCropRouter.post('/:cropId/approve', devOnlyMiddleware, (req: Request, res: Response) => {
  const { cropId } = req.params;
  const records = getRecords();
  const index = records.findIndex(r => r.cropId === cropId);

  if (index === -1) {
    return res.status(404).json({ error: `Crop ${cropId} not found in metadata` });
  }

  records[index].status = 'approved';
  records[index].updatedAt = new Date().toISOString();
  saveRecords(records);

  return res.json({ success: true, message: `Crop ${cropId} approved`, data: records[index] });
});

// 3. POST /api/dev/crops/:cropId/fallback
devCropRouter.post('/:cropId/fallback', devOnlyMiddleware, (req: Request, res: Response) => {
  const { cropId } = req.params;
  const records = getRecords();
  const index = records.findIndex(r => r.cropId === cropId);

  if (index === -1) {
    return res.status(404).json({ error: `Crop ${cropId} not found in metadata` });
  }

  records[index].status = 'use-fallback';
  records[index].source = 'Fallback Illustration';
  records[index].photographer = 'Krushi Sathi Botanical System';
  records[index].license = 'CC0';
  records[index].updatedAt = new Date().toISOString();
  saveRecords(records);

  return res.json({ success: true, message: `Crop ${cropId} marked to use fallback illustration`, data: records[index] });
});

// 4. POST /api/dev/crops/:cropId/refetch
devCropRouter.post('/:cropId/refetch', devOnlyMiddleware, async (req: Request, res: Response) => {
  const { cropId } = req.params;
  try {
    await fetchAllCropImages({ force: true, singleCropId: cropId });
    const records = getRecords();
    const updated = records.find(r => r.cropId === cropId);
    return res.json({ success: true, message: `Re-fetched image for ${cropId}`, data: updated });
  } catch (err: any) {
    return res.status(500).json({ error: `Failed to re-fetch image: ${err.message}` });
  }
});

// 5. POST /api/dev/crops/:cropId/upload (Accepts { dataUrl: string })
devCropRouter.post('/:cropId/upload', devOnlyMiddleware, async (req: Request, res: Response) => {
  const { cropId } = req.params;
  const { dataUrl, photographer, license } = req.body;

  if (!dataUrl || !dataUrl.includes(',')) {
    return res.status(400).json({ error: 'Valid base64 dataUrl required' });
  }

  try {
    const base64Data = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const destPath = path.join(CLIENT_PUBLIC_CROPS_DIR, `${cropId}.webp`);

    await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 82 })
      .toFile(destPath);

    // Sync alias files (e.g. crop-chilli, okra aliases)
    for (const alias of getCropAliases(cropId)) {
      const aliasPath = path.join(CLIENT_PUBLIC_CROPS_DIR, `${alias}.webp`);
      try {
        fs.copyFileSync(destPath, aliasPath);
      } catch {}
    }

    const records = getRecords();
    const index = records.findIndex(r => r.cropId === cropId);

    const updatedRecord: CropImageMetadata = index >= 0 ? records[index] : {
      cropId,
      name: cropId,
      scientificName: '',
      nameKannada: '',
      nameTamil: '',
      nameTelugu: '',
      category: 'general',
      filePath: `/crops/${cropId}.webp`,
      source: 'Manual Upload',
      sourceUrl: '',
      photographer: photographer || 'Farmer / User Upload',
      license: license || 'Direct Authorization',
      status: 'approved',
      updatedAt: new Date().toISOString(),
    };

    updatedRecord.source = 'Manual Upload';
    updatedRecord.photographer = photographer || 'Farmer / User Upload';
    updatedRecord.license = license || 'Direct Authorization';
    updatedRecord.status = 'approved';
    updatedRecord.updatedAt = new Date().toISOString();

    if (index >= 0) {
      records[index] = updatedRecord;
    } else {
      records.push(updatedRecord);
    }

    saveRecords(records);
    return res.json({ success: true, message: `Uploaded and saved image for ${cropId}`, data: updatedRecord });
  } catch (err: any) {
    return res.status(500).json({ error: `Upload processing failed: ${err.message}` });
  }
});

// 6. Public credits router: GET /api/crops/credits
export const cropCreditsRouter = express.Router();
cropCreditsRouter.get('/', (req: Request, res: Response) => {
  const records = getRecords();
  const credits = records
    .filter(r => r.status !== 'use-fallback')
    .map(r => ({
      cropId: r.cropId,
      cropName: r.name,
      scientificName: r.scientificName,
      source: r.source,
      sourceUrl: r.sourceUrl,
      author: r.photographer || 'Botanical Contributor',
      photographer: r.photographer || 'Botanical Contributor',
      license: r.license || 'CC-BY-SA',
      imagePath: r.filePath,
      path: r.filePath,
      imageType: 'plant',
    }));
  return res.json({ success: true, count: credits.length, totalImages: credits.length, credits, data: credits });
});
