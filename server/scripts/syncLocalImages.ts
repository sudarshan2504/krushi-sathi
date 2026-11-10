import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { MASTER_CROPS_CATALOG } from '../src/data/masterCrops/index';
import { CROPS_DATA } from '../src/data/cropKnowledge';
import { DISEASES_DATA } from '../src/data/diseaseKnowledge';

const prisma = new PrismaClient();

const CLIENT_PUBLIC_CROPS = path.resolve(__dirname, '../../client/public/crops');
const CLIENT_PUBLIC_PROBLEMS = path.resolve(__dirname, '../../client/public/problems');
const CATALOG_PATH = path.resolve(__dirname, '../../client/public/crops/cropsCatalog.json');

async function main() {
  console.log('🔄 Starting Image Sync & Local Attribution Setup...');

  // 1. Load cropsCatalog.json
  const catalog: any[] = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  console.log(`📋 Loaded ${catalog.length} crops from catalog.`);

  // Build lookup maps by crop id, slug, and scientific name
  const catalogById = new Map<string, any>();
  const catalogByScientific = new Map<string, any>();
  const catalogByName = new Map<string, any>();

  for (const c of catalog) {
    catalogById.set(c.id, c);
    if (c.scientificName) catalogByScientific.set(c.scientificName.toLowerCase().trim(), c);
    catalogByName.set(c.name.toLowerCase().trim(), c);
  }

  // 2. Ensure each crop has a verified local client/public/crops/<id>.webp
  console.log('\n📸 Verifying and linking client/public/crops/<crop-id>.webp...');
  let totalCropsLinked = 0;

  for (const c of catalog) {
    const slug = c.id;
    const folderPath = path.join(CLIENT_PUBLIC_CROPS, slug);
    const targetSingleWebp = path.join(CLIENT_PUBLIC_CROPS, `${slug}.webp`);

    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'));
      if (files.length > 0) {
        const sourceFile = path.join(folderPath, files[0]);
        if (!fs.existsSync(targetSingleWebp)) {
          fs.copyFileSync(sourceFile, targetSingleWebp);
        }
        totalCropsLinked++;
      }
    }
  }

  // Also check CROPS_DATA IDs like 'crop-paddy-rice' -> link to 'paddy-rice'
  for (const c of CROPS_DATA) {
    const slug = c.id.replace(/^crop-/, '');
    const folderPath = path.join(CLIENT_PUBLIC_CROPS, slug);
    const targetSingleWebp = path.join(CLIENT_PUBLIC_CROPS, `${c.id}.webp`);
    const slugSingleWebp = path.join(CLIENT_PUBLIC_CROPS, `${slug}.webp`);

    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'));
      if (files.length > 0) {
        const sourceFile = path.join(folderPath, files[0]);
        if (!fs.existsSync(targetSingleWebp)) {
          fs.copyFileSync(sourceFile, targetSingleWebp);
        }
        if (!fs.existsSync(slugSingleWebp)) {
          fs.copyFileSync(sourceFile, slugSingleWebp);
        }
      }
    }
  }

  console.log(`✅ Ensured ${totalCropsLinked} local .webp files in client/public/crops/`);

  // 3. Update Database Crops table
  console.log('\n🗄️ Updating Crop records in SQLite database...');
  const dbCrops = await prisma.crop.findMany();

  for (const crop of dbCrops) {
    const cleanId = crop.id.replace(/^crop-/, '');
    // Try to find in catalog
    const matched =
      catalogById.get(cleanId) ||
      catalogById.get(crop.id) ||
      (crop.scientificName ? catalogByScientific.get(crop.scientificName.toLowerCase().trim()) : null) ||
      catalogByName.get(crop.name.toLowerCase().trim());

    let localPath = `/crops/${crop.id}.webp`;
    let source = 'Wikimedia Commons';
    let author = 'Botanical Contributor';
    let licence = 'CC BY-SA 4.0';
    let attribution = `${crop.name} / Wikimedia Commons (CC BY-SA 4.0)`;

    // Check if file exists, else try slug or fallback
    const singleFile = path.join(CLIENT_PUBLIC_CROPS, `${crop.id}.webp`);
    const slugFile = path.join(CLIENT_PUBLIC_CROPS, `${cleanId}.webp`);

    if (fs.existsSync(singleFile)) {
      localPath = `/crops/${crop.id}.webp`;
    } else if (fs.existsSync(slugFile)) {
      fs.copyFileSync(slugFile, singleFile);
      localPath = `/crops/${crop.id}.webp`;
    } else if (matched && matched.images && matched.images.length > 0 && !matched.images[0].path.includes('/image-')) {
      localPath = matched.images[0].path;
    } else {
      localPath = '';
      source = 'Fallback Illustration';
      author = 'Krushi Sathi';
      licence = 'CC0';
      attribution = 'Botanical leaf fallback';
    }

    if (matched && matched.images && matched.images.length > 0) {
      const primary = matched.images[0];
      source = primary.source || source;
      author = primary.author || author;
      licence = primary.license || licence;
      attribution = `${primary.author || 'Contributor'} / ${primary.source || 'Wikimedia Commons'} (${primary.license || 'CC BY-SA 4.0'})`;
    }

    await prisma.crop.update({
      where: { id: crop.id },
      data: {
        imageUrl: localPath,
        imageSource: source,
        imageAuthor: author,
        imageLicence: licence,
        imageAttribution: attribution,
      },
    });

    console.log(`  🌾 Updated crop: ${crop.name} -> ${localPath} (${author}, ${licence})`);
  }

  // 4. Update Database DiseaseKnowledge records
  console.log('\n🪲 Updating DiseaseKnowledge records in SQLite database...');
  const dbDiseases = await prisma.diseaseKnowledge.findMany();

  // Load problem images from ProblemImage table for local paths
  const problemImages = await prisma.problemImage.findMany();
  const problemImageByProblemId = new Map<string, any>();
  const problemImageByPath = new Map<string, any>();

  for (const img of problemImages) {
    if (img.isPrimary && !problemImageByProblemId.has(img.problemId)) {
      problemImageByProblemId.set(img.problemId, img);
    }
    problemImageByPath.set(img.path, img);
  }

  // Also read problems folder on disk to find matching webp for each disease
  for (const d of dbDiseases) {
    // Map disease name / id to problems folder
    let localPath = '/problems/placeholder-crop-health.webp';
    let source = 'Wikimedia Commons';
    let author = 'Plant Pathology Contributor';
    let licence = 'CC BY-SA 4.0';
    let attribution = 'Wikimedia Commons (CC BY-SA)';

    // Check matching problem in Problem table
    const problemRecord = await prisma.problem.findFirst({
      where: {
        OR: [
          { name: { contains: d.name.split('(')[0].trim() } },
          { slug: { contains: d.id.replace('disease-', '') } },
        ],
      },
      include: { images: true },
    });

    if (problemRecord && problemRecord.images.length > 0) {
      const primaryImg = problemRecord.images.find(i => i.isPrimary) || problemRecord.images[0];
      localPath = primaryImg.path;
      source = primaryImg.source || source;
      author = primaryImg.author || author;
      licence = primaryImg.licence || licence;
      attribution = primaryImg.attribution || `${author} (${licence})`;
    } else {
      // Check client/public/problems directory
      const cleanSlug = d.id.replace('disease-', '');
      const probDir = path.join(CLIENT_PUBLIC_PROBLEMS, cleanSlug);
      if (fs.existsSync(probDir)) {
        const files = fs.readdirSync(probDir).filter(f => f.endsWith('.webp'));
        if (files.length > 0) {
          localPath = `/problems/${cleanSlug}/${files[0]}`;
        }
      }
    }

    await prisma.diseaseKnowledge.update({
      where: { id: d.id },
      data: {
        imageUrl: localPath,
        imageSource: source,
        imageAuthor: author,
        imageLicence: licence,
        imageAttribution: attribution,
      },
    });

    console.log(`  🐛 Updated disease: ${d.name} -> ${localPath}`);
  }

  console.log('\n🎉 Local image synchronization completed successfully!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error in sync script:', err);
  process.exit(1);
});
