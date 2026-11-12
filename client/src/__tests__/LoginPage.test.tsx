import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { LoginPage } from '../pages/LoginPage';

const mockSendOtp = vi.fn();
const mockLogin = vi.fn();
const mockDemoLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: (...args: any[]) => mockLogin(...args),
    demoLogin: (...args: any[]) => mockDemoLogin(...args),
    user: null,
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    auth: {
      sendOtp: (...args: any[]) => mockSendOtp(...args),
    },
  },
}));

function renderLoginPage() {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<div data-testid="home-screen">Home Screen</div>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('LoginPage Phone & OTP Validation', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSendOtp.mockReset();
    mockLogin.mockReset();
    mockDemoLogin.mockReset();
  });

  it('shows validation error when mobile number has fewer than 10 digits', () => {
    renderLoginPage();

    const phoneInput = screen.getByLabelText(/mobile number/i);
    fireEvent.change(phoneInput, { target: { value: '98765' } });

    const sendBtn = screen.getByRole('button', { name: /send verification code|send otp/i });
    fireEvent.click(sendBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/valid 10-digit mobile number/i);
    expect(mockSendOtp).not.toHaveBeenCalled();
  });

  it('transitions to 6-digit OTP step on valid phone, validates incomplete OTP, and completes login', async () => {
    mockSendOtp.mockResolvedValueOnce({ message: 'OTP sent' });
    mockLogin.mockResolvedValueOnce({ isNewUser: false });

    renderLoginPage();

    const phoneInput = screen.getByLabelText(/mobile number/i);
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    const sendBtn = screen.getByRole('button', { name: /send verification code|send otp/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockSendOtp).toHaveBeenCalledWith('9876543210', 'login');
    });

    await waitFor(() => {
      expect(screen.getByText(/\+91 9876543210/)).toBeInTheDocument();
    });

    // Incomplete OTP (only 3 digits)
    fireEvent.change(screen.getByLabelText('Digit 1 of 6'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Digit 2 of 6'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Digit 3 of 6'), { target: { value: '3' } });

    const verifyBtn = screen.getByRole('button', { name: /verify otp & continue/i });
    fireEvent.click(verifyBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/6-digit otp/i);
    expect(mockLogin).not.toHaveBeenCalled();

    // Complete 6 digits
    fireEvent.change(screen.getByLabelText('Digit 4 of 6'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Digit 5 of 6'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Digit 6 of 6'), { target: { value: '6' } });

    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('9876543210', '123456');
    });
    await waitFor(() => {
      expect(screen.getByTestId('home-screen')).toBeInTheDocument();
    });
  });
});
