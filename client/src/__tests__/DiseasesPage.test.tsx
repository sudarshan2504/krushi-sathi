import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { DiseasesPage } from '../pages/DiseasesPage';

const mockGetCropsCatalog = vi.fn();
const mockDiagnoseImage = vi.fn();
const mockGetReports = vi.fn();
const mockGetReportById = vi.fn();
const mockDeleteReport = vi.fn();
const mockDownloadReportPdf = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Ramesh Kumar', language: 'en' },
    updateUser: vi.fn(),
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    diseases: {
      getCropsCatalog: () => mockGetCropsCatalog(),
      diagnoseImage: (formData: FormData) => mockDiagnoseImage(formData),
      getReports: () => mockGetReports(),
      getReportById: (id: string) => mockGetReportById(id),
      deleteReport: (id: string) => mockDeleteReport(id),
      downloadReportPdf: (id: string) => mockDownloadReportPdf(id),
    },
  },
}));

function renderDiseasesPage() {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <MemoryRouter>
          <DiseasesPage />
        </MemoryRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}

describe('DiseasesPage — Photo-Based Crop Health Diagnosis (Phase 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-preview-url');
    window.URL.revokeObjectURL = vi.fn();
    mockGetCropsCatalog.mockResolvedValue([
      { id: 'tomato', name: 'Tomato', nameKannada: 'ಟೊಮೆಟೊ' },
      { id: 'paddy', name: 'Paddy', nameKannada: 'ಭತ್ತ' },
    ]);
    mockGetReports.mockResolvedValue([
      {
        id: 'rep-1',
        crop: { name: 'Tomato', scientificName: 'Solanum lycopersicum' },
        status: 'disease',
        topFindings: [
          {
            name: 'Early Blight',
            confidence: 85,
            severity: 'medium',
            spreadRisk: 'moderate',
            localNames: { en: 'Early Blight of Tomato' },
          },
        ],
        createdAt: '2026-11-20T10:00:00.000Z',
      },
    ]);
  });

  it('renders photo upload area, camera/gallery buttons, and crop selector', async () => {
    renderDiseasesPage();

    expect(screen.getAllByText(/Photo-Based Crop Health Diagnosis/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Diagnose Plant/i)).toBeInTheDocument();
    expect(screen.getByText(/My Past Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Tap or drop 1 to 3 plant photos here/i)).toBeInTheDocument();
    expect(screen.getByText(/Take Photo/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose from Gallery/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Unsure \/ Let AI Identify Crop/i)).toBeInTheDocument();
    });
  });

  it('switches to My Past Reports tab and displays saved reports', async () => {
    renderDiseasesPage();

    const reportsTab = screen.getByText(/My Past Reports/i);
    fireEvent.click(reportsTab);

    await waitFor(() => {
      expect(screen.getByText(/Your Diagnostic History/i)).toBeInTheDocument();
      expect(screen.getByText(/Early Blight/i)).toBeInTheDocument();
    });
  });

  it('submits photos and renders complete diagnostic report view with treatment sections', async () => {
    mockDiagnoseImage.mockResolvedValue({
      id: 'rep-new-123',
      crop: { name: 'Tomato', scientificName: 'Solanum lycopersicum', confidence: 90 },
      status: 'disease',
      imageQuality: 'good',
      topFindings: [
        {
          name: 'Early Blight (Alternaria solani)',
          type: 'disease',
          confidence: 88,
          severity: 'medium',
          spreadRisk: 'moderate',
          observedSymptoms: ['Dark concentric rings', 'Yellow halo'],
          likelyCauses: ['Alternaria solani fungus'],
          localNames: { en: 'Early Blight of Tomato' },
        },
      ],
      treatment: {
        immediateSteps: ['Prune lower leaves', 'Avoid overhead watering'],
        culturalAndOrganic: ['Spray neem seed kernel extract', 'Stake tomato plants'],
        chemical: [
          {
            activeIngredient: 'Mancozeb 75% WP',
            class: 'Protective Fungicide',
            purpose: 'Fungal control',
            applicationNotes: 'Follow product label for dose and waiting period.',
          },
        ],
        safetyPrecautions: ['Wear mask and gloves', 'Keep away from children'],
        preventionTips: ['3-year crop rotation'],
        recheckInDays: 5,
        whenToSeeExpert: 'If spots spread to new growth',
      },
      disclaimer: 'Preliminary AI advisory.',
      generatedAt: '2026-11-21T10:00:00.000Z',
      model: 'gemini-2.5-flash',
      verifiedSource: 'verified entry',
      helpline: '1800-180-1551',
    });

    renderDiseasesPage();

    // Select a file
    const file = new File(['fake-image-bytes'], 'leaf.jpg', { type: 'image/jpeg' });
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], { target: { files: [file] } });

    // Click diagnose button
    const diagnoseBtn = screen.getByText(/Diagnose Crop Health/i);
    expect(diagnoseBtn).not.toBeDisabled();
    fireEvent.click(diagnoseBtn);

    await waitFor(() => {
      expect(mockDiagnoseImage).toHaveBeenCalled();
      expect(screen.getAllByText(/Early Blight/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/1\. Immediate First-Response Actions/i)).toBeInTheDocument();
      expect(screen.getByText(/Prune lower leaves/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Cultural & Organic Solutions/i)).toBeInTheDocument();
      expect(screen.getByText(/Download PDF Report/i)).toBeInTheDocument();
      expect(screen.getByText(/Share via WhatsApp/i)).toBeInTheDocument();
    });
  });

  it('triggers PDF download when Download PDF Report button is clicked', async () => {
    const fakeBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
    mockDownloadReportPdf.mockResolvedValue(fakeBlob);

    // Mock window.URL.createObjectURL
    const mockCreateObjectUrl = vi.fn().mockReturnValue('blob:mock-url');
    const mockRevokeObjectUrl = vi.fn();
    window.URL.createObjectURL = mockCreateObjectUrl;
    window.URL.revokeObjectURL = mockRevokeObjectUrl;

    mockDiagnoseImage.mockResolvedValue({
      id: 'rep-download-456',
      crop: { name: 'Tomato', confidence: 90 },
      status: 'healthy',
      imageQuality: 'good',
      topFindings: [],
      treatment: {
        immediateSteps: ['Routine inspection'],
        culturalAndOrganic: [],
        chemical: [],
        safetyPrecautions: [],
        preventionTips: [],
        recheckInDays: 7,
        whenToSeeExpert: 'None needed',
      },
      disclaimer: 'Advisory.',
      generatedAt: '2026-11-21T10:00:00.000Z',
      model: 'gemini-2.5-flash',
    });

    renderDiseasesPage();

    const file = new File(['test'], 'leaf.jpg', { type: 'image/jpeg' });
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], { target: { files: [file] } });

    const diagnoseBtn = screen.getByText(/Diagnose Crop Health/i);
    fireEvent.click(diagnoseBtn);

    await waitFor(() => {
      expect(screen.getByText(/Download PDF Report/i)).toBeInTheDocument();
    });

    const downloadPdfBtn = screen.getByText(/Download PDF Report/i);
    fireEvent.click(downloadPdfBtn);

    await waitFor(() => {
      expect(mockDownloadReportPdf).toHaveBeenCalledWith('rep-download-456');
      expect(mockCreateObjectUrl).toHaveBeenCalledWith(fakeBlob);
    });
  });
});
