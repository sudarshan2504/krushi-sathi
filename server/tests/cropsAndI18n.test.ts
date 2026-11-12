import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CROPS_DATA } from '../src/data/cropKnowledge';
import { getCropAliases, CropImageMetadata } from '../src/services/cropImageService';
import { en } from '../../client/src/i18n/en';
import { kn } from '../../client/src/i18n/kn';
import { ta } from '../../client/src/i18n/ta';
import { te } from '../../client/src/i18n/te';

function collectKeysAndCheckEmpty(
  obj: unknown,
  prefix = '',
  keys: string[] = [],
  emptyKeys: string[] = []
): { keys: string[]; emptyKeys: string[] } {
  if (typeof obj === 'string') {
    keys.push(prefix);
    if (obj.trim() === '') emptyKeys.push(prefix);
    return { keys, emptyKeys };
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => collectKeysAndCheckEmpty(item, `${prefix}[${idx}]`, keys, emptyKeys));
    return { keys, emptyKeys };
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      collectKeysAndCheckEmpty(v, next, keys, emptyKeys);
    }
  }
  return { keys, emptyKeys };
}

describe('Crop Catalog Integrity, Local WebP Images & Multilingual i18n Parity', () => {
  const clientCropsDir = path.resolve(__dirname, '../../client/public/crops');
  const catalogJsonPath = path.resolve(__dirname, '../src/data/cropsCatalog.json');
  const imagesJsonPath = path.resolve(__dirname, '../src/data/crops-images.json');

  it('every crop across CROPS_DATA and cropsCatalog.json has stable id, scientific name, and 4 language names', () => {
    const catalog: any[] = JSON.parse(fs.readFileSync(catalogJsonPath, 'utf-8'));
    const allCrops = [...CROPS_DATA, ...catalog];
    expect(allCrops.length).toBeGreaterThan(0);

    for (const crop of allCrops) {
      expect(typeof crop.id).toBe('string');
      expect(crop.id.trim().length).toBeGreaterThan(0);
      expect(typeof crop.name).toBe('string');
      expect(crop.name.trim().length).toBeGreaterThan(0);
      expect(typeof crop.scientificName).toBe('string');
      expect(crop.scientificName.trim().length).toBeGreaterThan(0);
      expect(typeof crop.nameKannada).toBe('string');
      expect(crop.nameKannada.trim().length).toBeGreaterThan(0);
      expect(typeof crop.nameTamil).toBe('string');
      expect(crop.nameTamil.trim().length).toBeGreaterThan(0);
      expect(typeof crop.nameTelugu).toBe('string');
      expect(crop.nameTelugu.trim().length).toBeGreaterThan(0);
    }
  });

  it('every crop has a valid local WebP image or explicit use-fallback status, with zero non-alias duplicate images', () => {
    const metadataList: CropImageMetadata[] = fs.existsSync(imagesJsonPath)
      ? JSON.parse(fs.readFileSync(imagesJsonPath, 'utf-8'))
      : [];
    const metaById = new Map<string, CropImageMetadata>(metadataList.map(m => [m.cropId, m]));

    const catalog: any[] = JSON.parse(fs.readFileSync(catalogJsonPath, 'utf-8'));
    const uniqueById = new Map<string, any>();
    for (const c of [...CROPS_DATA, ...catalog]) {
      uniqueById.set(c.id, c);
    }

    const hashOwners = new Map<string, Set<string>>();

    for (const crop of uniqueById.values()) {
      const meta = metaById.get(crop.id);
      if (meta?.status === 'use-fallback') continue;

      const webpPath = path.join(clientCropsDir, `${crop.id}.webp`);
      expect(fs.existsSync(webpPath), `Missing WebP image for ${crop.id} (${crop.name})`).toBe(true);

      const buf = fs.readFileSync(webpPath);
      expect(buf.length).toBeGreaterThan(100);
      // Verify WebP RIFF container signature
      expect(buf.subarray(0, 4).toString('ascii')).toBe('RIFF');
      expect(buf.subarray(8, 12).toString('ascii')).toBe('WEBP');

      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      if (!hashOwners.has(hash)) hashOwners.set(hash, new Set());
      hashOwners.get(hash)!.add(crop.id);
    }

    // Check zero duplicate image hashes across non-alias crops
    for (const [hash, owners] of hashOwners.entries()) {
      if (owners.size <= 1) continue;
      const list = Array.from(owners);
      for (const a of list) {
        const allowed = new Set([a, ...getCropAliases(a)]);
        for (const b of list) {
          if (!allowed.has(b)) {
            throw new Error(`Duplicate image hash ${hash.slice(0, 12)} shared by non-alias crops: ${a} and ${b}`);
          }
        }
      }
    }
  });

  it('client/src/i18n/{en,kn,ta,te}.ts share 100% recursive key parity with zero empty strings', () => {
    const enResult = collectKeysAndCheckEmpty(en);
    const langs = { kn, ta, te } as const;

    expect(enResult.emptyKeys, `Empty English i18n keys: ${enResult.emptyKeys.join(', ')}`).toEqual([]);

    const enKeySet = new Set(enResult.keys);
    for (const [code, dict] of Object.entries(langs)) {
      const res = collectKeysAndCheckEmpty(dict);
      expect(res.emptyKeys, `Empty ${code} i18n keys: ${res.emptyKeys.join(', ')}`).toEqual([]);

      const langKeySet = new Set(res.keys);
      const missingInLang = enResult.keys.filter(k => !langKeySet.has(k));
      const extraInLang = res.keys.filter(k => !enKeySet.has(k));

      expect(missingInLang, `Missing keys in ${code}.ts: ${missingInLang.join(', ')}`).toEqual([]);
      expect(extraInLang, `Extra keys in ${code}.ts: ${extraInLang.join(', ')}`).toEqual([]);
    }
  });
});

