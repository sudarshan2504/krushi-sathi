import { fetchAllCropImages } from '../src/services/cropImageService';

if (require.main === module || process.argv[1]?.includes('fetch-crop-images')) {
  const isForce = process.argv.includes('--force');
  const cropArg = process.argv.find(a => a.startsWith('--crop='));
  const singleCropId = cropArg ? cropArg.split('=')[1] : undefined;

  fetchAllCropImages({ force: isForce, singleCropId }).catch(err => {
    console.error('Fatal fetch error:', err);
    process.exit(1);
  });
}
