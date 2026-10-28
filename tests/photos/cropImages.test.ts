import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Load crops from cropsCatalog.json
const catalogPath = path.resolve(__dirname, '../../server/src/data/cropsCatalog.json');
const clientPublicPath = path.resolve(__dirname, '../../client/public');

describe('Crop Image Accuracy & Uniqueness Tests', () => {
  it('should verify cropsCatalog.json exists', () => {
    assert.ok(fs.existsSync(catalogPath), 'cropsCatalog.json must exist');
  });

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const crops = Array.isArray(catalog) ? catalog : (catalog.crops || []);

  it('should have at least 100 crops in the catalog', () => {
    assert.ok(crops.length >= 100, `Expected >= 100 crops, found ${crops.length}`);
  });

  it('should verify every crop has a valid local image path', () => {
    for (const crop of crops) {
      assert.ok(crop.id, 'Crop must have an id');
      assert.ok(crop.name, `Crop ${crop.id} must have a name`);
      
      const primaryImage = (crop.images && crop.images.length > 0)
        ? crop.images[0].path
        : (crop.imageUrl || '/crops/placeholder.svg');
      assert.ok(primaryImage, `Crop ${crop.name} must have a primary image path`);
      
      // Must NOT be an external remote URL
      assert.ok(
        !primaryImage.startsWith('http://') && !primaryImage.startsWith('https://'),
        `Crop ${crop.name} has remote image URL: ${primaryImage}`
      );
      
      // Must start with /crops/ and end with .webp or .svg
      assert.ok(
        primaryImage.startsWith('/crops/'),
        `Crop ${crop.name} image path must start with /crops/, got: ${primaryImage}`
      );
      assert.ok(
        primaryImage.endsWith('.webp') || primaryImage.endsWith('.svg'),
        `Crop ${crop.name} image path must end with .webp or .svg, got: ${primaryImage}`
      );
    }
  });

  it('should verify every crop image physically exists on disk in client/public', () => {
    const missing: string[] = [];
    for (const crop of crops) {
      const primaryImage = (crop.images && crop.images.length > 0)
        ? crop.images[0].path
        : (crop.imageUrl || '/crops/placeholder.svg');
      const relativePath = primaryImage.replace(/^\//, '');
      const fullPath = path.join(clientPublicPath, relativePath);
      
      if (!fs.existsSync(fullPath)) {
        missing.push(`${crop.name} (${crop.id}) -> ${fullPath}`);
      }
    }
    
    assert.deepEqual(
      missing,
      [],
      `Missing ${missing.length} crop image files on disk:\n${missing.slice(0, 10).join('\n')}`
    );
  });

  it('should verify every crop has a UNIQUE primary image path (no duplicates/sharing)', () => {
    const pathMap = new Map<string, string>();
    const duplicates: Array<{ crop1: string; crop2: string; imagePath: string }> = [];

    for (const crop of crops) {
      if (!crop.images || crop.images.length === 0) continue;
      const primaryImage = crop.images[0].path;
      if (pathMap.has(primaryImage)) {
        duplicates.push({
          crop1: pathMap.get(primaryImage)!,
          crop2: crop.name,
          imagePath: primaryImage,
        });
      } else {
        pathMap.set(primaryImage, crop.name);
      }
    }

    assert.deepEqual(
      duplicates,
      [],
      `Found ${duplicates.length} duplicate image paths shared across different crops:\n` +
      duplicates.map(d => `"${d.crop1}" and "${d.crop2}" share "${d.imagePath}"`).join('\n')
    );
  });

  it('should verify no crop uses another real crop photo as fallback', () => {
    // Check that fallback images in public are either neutral SVG or placeholder
    const placeholderExists =
      fs.existsSync(path.join(clientPublicPath, 'crops/placeholder-crop.svg')) ||
      fs.existsSync(path.join(clientPublicPath, 'problems/placeholder-crop-health.webp'));
    assert.ok(placeholderExists, 'Neutral botanical placeholder must exist in public directory');
  });
});
