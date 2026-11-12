import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { BottomNav } from '../components/layout/BottomNav';

describe('BottomNav Grid Layout & Active Switching', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders 4 equal vertical tabs in a 4-column grid and switches active pill on navigation', () => {
    render(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="/home" element={<div data-testid="route-home">Home View</div>} />
            <Route path="/crops" element={<div data-testid="route-crops">Crops View</div>} />
            <Route path="/chat" element={<div data-testid="route-chat">Chat View</div>} />
            <Route path="/profile" element={<div data-testid="route-profile">Profile View</div>} />
          </Routes>
          <BottomNav />
        </MemoryRouter>
      </LanguageProvider>
    );

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    const grid = nav.querySelector('.grid-cols-4');
    expect(grid).not.toBeNull();
    expect(screen.getByTestId('bottom-fade')).toBeInTheDocument();

    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(4);
    links.forEach((link) => {
      expect(link.className).toContain('flex-col');
      expect(link.className).toContain('min-h-[44px]');
    });

    // Starts on /home
    const homeLink = screen.getByRole('link', { name: /^home$/i });
    const cropsLink = screen.getByRole('link', { name: /^crops$/i });
    const chatLink = screen.getByRole('link', { name: /^ai chat$/i });
    const profileLink = screen.getByRole('link', { name: /^profile$/i });

    expect(homeLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink.querySelector('[data-testid="active-nav-pill"]')).not.toBeNull();
    expect(cropsLink.querySelector('[data-testid="active-nav-pill"]')).toBeNull();

    // Switch to /crops
    fireEvent.click(cropsLink);
    expect(screen.getByTestId('route-crops')).toBeInTheDocument();
    expect(cropsLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    expect(cropsLink.querySelector('[data-testid="active-nav-pill"]')).not.toBeNull();
    expect(homeLink.querySelector('[data-testid="active-nav-pill"]')).toBeNull();

    // Switch to /chat
    fireEvent.click(chatLink);
    expect(screen.getByTestId('route-chat')).toBeInTheDocument();
    expect(chatLink).toHaveAttribute('aria-current', 'page');
    expect(chatLink.querySelector('[data-testid="active-nav-pill"]')).not.toBeNull();

    // Switch to /profile
    fireEvent.click(profileLink);
    expect(screen.getByTestId('route-profile')).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('aria-current', 'page');
    expect(profileLink.querySelector('[data-testid="active-nav-pill"]')).not.toBeNull();
  });
});

