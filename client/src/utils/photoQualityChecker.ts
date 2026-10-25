/**
 * Krushi Sathi — In-Browser Client Photo Quality Checker
 * Evaluates:
 * 1. Image resolution/dimensions
 * 2. Exposure & Brightness (too dark or overexposed)
 * 3. Blurriness using Variance of Laplacian algorithm on Canvas ImageData
 */

export interface QualityCheckResult {
  passed: boolean;
  issue?: 'blurry' | 'too_dark' | 'overexposed' | 'too_small';
  score: number;
  messageEn: string;
  messageKn: string;
  messageTa: string;
  messageTe: string;
  compressedDataUrl: string;
}

/**
 * Calculates variance of Laplacian on grayscale image to detect focus / blurriness.
 * Higher variance = sharper edges. Low variance = blurry / motion blur.
 */
function calculateLaplacianVariance(imageData: ImageData): number {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // 1. Convert to grayscale buffer
  const gray = new Float32Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    // Standard perceptual luminance weights: 0.299 R + 0.587 G + 0.114 B
    gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // 2. Convolve with standard 3x3 Laplacian kernel:
  // [ 0,  1,  0 ]
  // [ 1, -4,  1 ]
  // [ 0,  1,  0 ]
  let sum = 0;
  let count = 0;
  const laplacian = new Float32Array((width - 2) * (height - 2));

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const val =
        gray[idx - width] +          // Top
        gray[idx + width] +          // Bottom
        gray[idx - 1] +              // Left
        gray[idx + 1] -              // Right
        4 * gray[idx];               // Center

      laplacian[count] = val;
      sum += val;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;

  let varianceSum = 0;
  for (let i = 0; i < count; i++) {
    const diff = laplacian[i] - mean;
    varianceSum += diff * diff;
  }

  return varianceSum / count;
}

/**
 * Computes average brightness (0 - 255)
 */
function calculateAverageBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let total = 0;
  const step = 4 * 4; // Sample every 4th pixel for speed
  let samples = 0;

  for (let i = 0; i < data.length; i += step) {
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    samples++;
  }

  return samples > 0 ? total / samples : 128;
}

/**
 * Resizes, checks quality, and compresses plant photo on client.
 */
export async function checkAndCompressPlantPhoto(
  file: File,
  maxDimension = 1280
): Promise<QualityCheckResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to decode image data.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Check if image is too small
        if (width < 250 || height < 250) {
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = width;
          smallCanvas.height = height;
          const ctx = smallCanvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);
          resolve({
            passed: false,
            issue: 'too_small',
            score: 20,
            messageEn: 'Photo resolution is too low. Please take a closer, higher-resolution picture of the plant.',
            messageKn: 'ಫೋಟೋ ಗಾತ್ರ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ. ದಯವಿಟ್ಟು ಸಸ್ಯದ ಸ್ಪಷ್ಟ ಹತ್ತಿರದ ಚಿತ್ರವನ್ನು ತೆಗೆಯಿರಿ.',
            messageTa: 'புகைப்படம் மிகவும் சிறியதாக உள்ளது. தயவுசெய்து பயிரை நெருக்கமாக படம் எடுக்கவும்.',
            messageTe: 'ఫోటో పరిమాణం చాలా చిన్నగా ఉంది. దయచేసి మొక్కకు దగ్గరగా స్పష్టమైన ఫోటో తీయండి.',
            compressedDataUrl: smallCanvas.toDataURL('image/jpeg', 0.8),
          });
          return;
        }

        // Scale down to maxDimension
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Drawing onto canvas strips EXIF / GPS metadata
        ctx.drawImage(img, 0, 0, width, height);

        // Quality check on smaller analysis canvas (faster)
        const checkCanvas = document.createElement('canvas');
        const checkW = Math.min(400, width);
        const checkH = Math.round((height * checkW) / width);
        checkCanvas.width = checkW;
        checkCanvas.height = checkH;
        const checkCtx = checkCanvas.getContext('2d');

        let isBlurry = false;
        let isDark = false;
        let isOverexposed = false;
        let blurScore = 100;

        if (checkCtx) {
          checkCtx.drawImage(canvas, 0, 0, checkW, checkH);
          const imageData = checkCtx.getImageData(0, 0, checkW, checkH);

          // 1. Exposure Check
          const brightness = calculateAverageBrightness(imageData);
          if (brightness < 38) isDark = true;
          if (brightness > 235) isOverexposed = true;

          // 2. Blur / Focus Check
          blurScore = calculateLaplacianVariance(imageData);
          // Threshold of 30 identifies out-of-focus and severe motion blur
          if (blurScore < 28) isBlurry = true;
        }

        // Compress output (prefer WebP, fallback to JPEG)
        let compressedDataUrl = '';
        try {
          compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
          if (!compressedDataUrl.startsWith('data:image/webp')) {
            compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          }
        } catch {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        }

        if (isBlurry) {
          resolve({
            passed: false,
            issue: 'blurry',
            score: Math.round(blurScore),
            messageEn: 'The photo appears blurry or out of focus. Clear veins and spots help AI identify the exact disease.',
            messageKn: 'ಚಿತ್ರವು ಮಸುಕಾಗಿದೆ (Blurry). ರೋಗವನ್ನು ನಿಖರವಾಗಿ ಗುರುತಿಸಲು ಎಲೆಯ ಚುಕ್ಕೆಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣಬೇಕು.',
            messageTa: 'படம் மங்கலாக உள்ளது. நோயை சரியாகக் கண்டறிய இலைப்புள்ளிகள் தெளிவாகத் தெரிய வேண்டும்.',
            messageTe: 'ఫోటో అస్పష్టంగా (Blurry) ఉంది. తెగులును గుర్తించడానికి ఆకు మచ్చలు స్పష్టంగా ఉండాలి.',
            compressedDataUrl,
          });
          return;
        }

        if (isDark) {
          resolve({
            passed: false,
            issue: 'too_dark',
            score: 30,
            messageEn: 'The photo is too dark or in shadow. Please take it in good daytime sunlight.',
            messageKn: 'ಚಿತ್ರದಲ್ಲಿ ಬೆಳಕು ಕಡಿಮೆಯಾಗಿದೆ (ತುಂಬಾ ಕತ್ತಲಿದೆ). ದಯವಿಟ್ಟು ಉತ್ತಮ ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
            messageTa: 'புகைப்படம் மிகவும் இருட்டாக உள்ளது. நல்ல வெளிச்சத்தில் படம் எடுக்கவும்.',
            messageTe: 'ఫోటో చాలా చీకటిగా ఉంది. దయచేసి మంచి వెలుతురులో ఫోటో తీయండి.',
            compressedDataUrl,
          });
          return;
        }

        if (isOverexposed) {
          resolve({
            passed: false,
            issue: 'overexposed',
            score: 30,
            messageEn: 'The photo is washed out by harsh glare. Try angling away from direct sun reflection.',
            messageKn: 'ಅತಿಯಾದ ಬೆಳಕಿನಿಂದ ಎಲೆಯ ಗುರುತುಗಳು ಬಿಳಿಯಾಗಿ ಕಾಣುತ್ತಿವೆ. ನೆರಳಿನಲ್ಲಿ ಅಥವಾ ಸೂಕ್ತ ಕೋನದಲ್ಲಿ ತೆಗೆಯಿರಿ.',
            messageTa: 'அதிக வெளிச்சத்தால் இலை வெளிறித் தெரிகிறது. நிழலில் படம் எடுக்கவும்.',
            messageTe: 'ఎక్కువ కాంతి వల్ల ఆకు గుర్తులు కనిపించడం లేదు. సరైన కోణంలో ఫోటో తీయండి.',
            compressedDataUrl,
          });
          return;
        }

        // Passed quality check
        resolve({
          passed: true,
          score: Math.round(blurScore),
          messageEn: 'Photo quality is good.',
          messageKn: 'ಚಿತ್ರದ ಗುಣಮಟ್ಟ ಉತ್ತಮವಾಗಿದೆ.',
          messageTa: 'புகைப்பட தரம் நன்றாக உள்ளது.',
          messageTe: 'ఫోటో నాణ్యత బాగుంది.',
          compressedDataUrl,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
