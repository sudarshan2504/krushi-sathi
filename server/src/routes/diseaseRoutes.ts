import { Router, Request, Response } from 'express';
import { DISEASES_DATA } from '../data/diseaseKnowledge';
import { config } from '../config';

const router = Router();

// List all diseases & pests
router.get('/', (req: Request, res: Response) => {
  const { crop, search } = req.query;

  let diseases = DISEASES_DATA;

  if (crop) {
    const cropQuery = (crop as string).toLowerCase();
    diseases = diseases.filter(d =>
      d.affectedCrops.some(c => c.toLowerCase().includes(cropQuery))
    );
  }

  if (search) {
    const q = (search as string).toLowerCase();
    diseases = diseases.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.nameKannada.includes(q) ||
        d.nameTamil.includes(q) ||
        d.nameTelugu.includes(q) ||
        d.symptoms.toLowerCase().includes(q) ||
        d.symptomsKn.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    data: diseases,
  });
});

// Get single disease by id
router.get('/:id', (req: Request, res: Response) => {
  const disease = DISEASES_DATA.find(d => d.id === req.params.id);
  if (!disease) {
    return res.status(404).json({ success: false, message: 'Disease details not found' });
  }

  res.json({
    success: true,
    data: disease,
  });
});

// Preliminary Disease Diagnosis
router.post('/diagnose', async (req: Request, res: Response) => {
  try {
    const { cropName, symptomsDescription, hasImage } = req.body;

    // Check if symptoms text was entered
    if (symptomsDescription && symptomsDescription.trim().length > 3) {
      const q = symptomsDescription.toLowerCase();
      // Match against symptoms in database
      const matched = DISEASES_DATA.filter(d => {
        const matchesCrop = !cropName || d.affectedCrops.some(c => c.toLowerCase().includes(cropName.toLowerCase()));
        const matchesSymptom =
          d.symptoms.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          (d.symptomsKn && d.symptomsKn.includes(q)) ||
          q.split(' ').some((word: string) => word.length > 3 && d.symptoms.toLowerCase().includes(word));
        return matchesCrop && matchesSymptom;
      });

      if (matched.length > 0) {
        return res.json({
          success: true,
          mode: 'symptom_match',
          matches: matched,
          note: 'Preliminary diagnosis based on verified ICAR symptom markers. Always confirm with an agricultural officer before applying chemical sprays.',
        });
      }
    }

    if (hasImage) {
      // Per instructions: "If image analysis is not configured, explain that the feature is unavailable rather than pretending to analyze the image."
      if (!config.geminiApiKey) {
        return res.json({
          success: true,
          mode: 'image_unavailable',
          message: 'Direct computer vision leaf scan is currently in local offline mode. To diagnose this problem, please select the crop and matching visual symptoms from our verified disease catalog below, or show this photo to your local Raitha Samparka Kendra / KVK officer.',
          candidates: DISEASES_DATA.slice(0, 3),
        });
      }
    }

    res.json({
      success: true,
      mode: 'general_library',
      message: 'Browse our verified disease library below for symptoms and Integrated Pest Management (IPM) solutions.',
      candidates: DISEASES_DATA,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Diagnosis service error' });
  }
});

export default router;
