import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { ProfilePage } from '../pages/ProfilePage';

let mockUser: any = {
  id: 'u1',
  name: 'Ramesh Kumar',
  phone: '9876543210',
  state: 'Karnataka',
  district: 'Mandya',
  taluk: 'Maddur',
  village: 'Koppa',
  farmSize: 2.5,
  farmUnit: 'Acres',
  language: 'en',
};

const mockUpdateUser = vi.fn((next: any) => {
  mockUser = next;
});
const mockLogout = vi.fn().mockResolvedValue(undefined);
const mockUpdateProfile = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    updateUser: mockUpdateUser,
    logout: mockLogout,
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    auth: {
      updateProfile: (...args: any[]) => mockUpdateProfile(...args),
      uploadAvatar: vi.fn(),
    },
  },
}));

function renderProfilePage() {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/profile']}>
            <ProfilePage />
          </MemoryRouter>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

describe('ProfilePage regression tests', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUser = {
      id: 'u1',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      state: 'Karnataka',
      district: 'Mandya',
      taluk: 'Maddur',
      village: 'Koppa',
      farmSize: 2.5,
      farmUnit: 'Acres',
      language: 'en',
    };
    mockUpdateUser.mockClear();
    mockLogout.mockClear();
    mockUpdateProfile.mockReset();
  });

  it('persists Notifications toggle in localStorage under ks_notifications_enabled', () => {
    localStorage.setItem('ks_notifications_enabled', 'false');
    const { unmount } = renderProfilePage();

    const notifSwitch = screen.getByRole('switch', { name: /toggle notifications/i });
    expect(notifSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(notifSwitch);
    expect(notifSwitch).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('ks_notifications_enabled')).toBe('true');

    fireEvent.click(notifSwitch);
    expect(notifSwitch).toHaveAttribute('aria-checked', 'false');
    expect(localStorage.getItem('ks_notifications_enabled')).toBe('false');
    unmount();

    renderProfilePage();
    expect(screen.getByRole('switch', { name: /toggle notifications/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('syncs Edit Profile Modal fields when user props update before opening', async () => {
    const view = renderProfilePage();

    // Update user asynchronously (e.g. after profile fetch/save elsewhere)
    mockUser = {
      ...mockUser,
      name: 'Suresh Gowda',
      district: 'Mysuru',
      taluk: 'Nanjangud',
      farmSize: 4,
      farmUnit: 'Hectares',
    };
    view.rerender(
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/profile']}>
              <ProfilePage />
            </MemoryRouter>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    );

    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);

    expect(screen.getByLabelText(/farmer name/i)).toHaveValue('Suresh Gowda');
    expect(screen.getByLabelText(/district/i)).toHaveValue('Mysuru');
    expect(screen.getByLabelText(/taluk/i)).toHaveValue('Nanjangud');
    expect(screen.getByLabelText(/land size/i)).toHaveValue(4);
    expect(screen.getByLabelText(/unit/i)).toHaveValue('Hectares');

    mockUpdateProfile.mockResolvedValueOnce({
      ...mockUser,
      name: 'Suresh Gowda Jr',
    });
    fireEvent.change(screen.getByLabelText(/farmer name/i), { target: { value: 'Suresh Gowda Jr' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Suresh Gowda Jr',
          district: 'Mysuru',
          farmSize: 4,
          farmUnit: 'Hectares',
        })
      );
    });
    expect(mockUpdateUser).toHaveBeenCalled();
  });

  it('displays non-Acre farmUnit and conversion summary accurately without hardcoding 40 Guntas', () => {
    mockUser = {
      ...mockUser,
      farmSize: 2,
      farmUnit: 'Hectares',
    };

    renderProfilePage();

    expect(screen.getByText('2 Hectares')).toBeInTheDocument();
    // 2 Hectares ≈ 4.9421 Acres (not "80 Guntas")
    expect(screen.getByText(/4\.9421 Acres/i)).toBeInTheDocument();
    expect(screen.queryByText(/80 Guntas/i)).toBeNull();
  });
});

