import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import { LanguagePill } from '../components/ui/LanguagePill';

const mockUpdateProfile = vi.fn().mockResolvedValue({});
let mockUser: any = null;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    auth: {
      updateProfile: (...args: any[]) => mockUpdateProfile(...args),
    },
  },
}));

describe('LanguagePill Portal Dropdown', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUser = null;
    mockUpdateProfile.mockClear();
  });

  it('renders compact pill closed by default and opens all 4 languages inside a document.body portal', () => {
    const { container } = render(
      <LanguageProvider>
        <div data-testid="clipping-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
          <LanguagePill variant="compact" />
        </div>
      </LanguageProvider>
    );

    const pillButton = screen.getByRole('button', { name: /change language/i });
    expect(pillButton).toHaveAttribute('aria-expanded', 'false');
    expect(within(pillButton).getByText('EN')).toBeInTheDocument();

    fireEvent.click(pillButton);

    expect(pillButton).toHaveAttribute('aria-expanded', 'true');

    // Portal renders directly under document.body, NOT trapped inside clipping-wrapper
    const wrapper = screen.getByTestId('clipping-wrapper');
    expect(within(wrapper).queryByRole('listbox')).toBeNull();

    const listbox = screen.getByRole('listbox', { name: /select language/i });
    expect(document.body.contains(listbox)).toBe(true);
    expect(wrapper.contains(listbox)).toBe(false);
    expect(listbox.className).toContain('bg-white');

    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(within(listbox).getAllByText('English').length).toBeGreaterThanOrEqual(1);
    expect(within(listbox).getByText('ಕನ್ನಡ')).toBeInTheDocument();
    expect(within(listbox).getByText('தமிழ்')).toBeInTheDocument();
    expect(within(listbox).getByText('తెలుగు')).toBeInTheDocument();

    const englishOption = options.find((el) => el.textContent?.includes('English'));
    expect(englishOption).toHaveAttribute('aria-selected', 'true');
  });

  it('switches language on tap, persists selection, syncs authenticated profile, and closes dropdown', () => {
    mockUser = { id: 'u1', name: 'Ramesh', language: 'en' };

    render(
      <LanguageProvider>
        <LanguagePill variant="compact" />
      </LanguageProvider>
    );

    const pillButton = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(pillButton);

    const kannadaOption = screen.getByRole('option', { name: /ಕನ್ನಡ/i });
    fireEvent.click(kannadaOption);

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(pillButton).toHaveAttribute('aria-expanded', 'false');
    expect(within(pillButton).getByText('KN')).toBeInTheDocument();
    expect(localStorage.getItem('krishi_sathi_lang')).toBe('kn');
    expect(mockUpdateProfile).toHaveBeenCalledWith({ language: 'kn' });
  });

  it('closes cleanly on Escape key press and outside tap', () => {
    render(
      <LanguageProvider>
        <div>
          <LanguagePill variant="compact" />
          <button type="button" data-testid="outside-element">
            Outside
          </button>
        </div>
      </LanguageProvider>
    );

    const pillButton = screen.getByRole('button', { name: /change language/i });

    // Close via Escape
    fireEvent.click(pillButton);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();

    // Close via outside mousedown
    fireEvent.click(pillButton);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
