import { test, expect, Page } from '@playwright/test';

async function authenticateDemo(page: Page, language = 'en') {
  await page.goto('/login');
  await page.evaluate(async (lang) => {
    const res = await fetch('/api/auth/demo-login', { method: 'POST' });
    if (!res.ok) {
      throw new Error(`Demo login failed with HTTP ${res.status}`);
    }
    const json = await res.json();
    localStorage.setItem('krishi_sathi_token', json.data.token);
    localStorage.setItem('krishi_sathi_user', JSON.stringify({ ...json.data.user, language: lang }));
    localStorage.setItem('krishi_sathi_lang', lang);
  }, language);
}

async function mockGeolocationCoords(page: Page, lat: number, lon: number, accuracy = 25) {
  await page.addInitScript(
    ({ latitude, longitude, acc }) => {
      const mockPosition = {
        coords: {
          latitude,
          longitude,
          accuracy: acc,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: (success: PositionCallback) => {
            setTimeout(() => success(mockPosition as GeolocationPosition), 15);
          },
          watchPosition: (success: PositionCallback) => {
            setTimeout(() => success(mockPosition as GeolocationPosition), 15);
            return 1;
          },
          clearWatch: () => {},
        },
      });
    },
    { latitude: lat, longitude: lon, acc: accuracy }
  );
}

async function mockGeolocationDenied(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error?: PositionErrorCallback) => {
          setTimeout(() => {
            error?.({
              code: 1,
              message: 'User denied Geolocation',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            } as GeolocationPositionError);
          }, 15);
        },
        watchPosition: () => 1,
        clearWatch: () => {},
      },
    });
  });
}

test.describe('Core User Flows (Mobile 390x844)', () => {
  test('Flow 1: Onboarding Splash -> Kannada Language Select -> Demo Login -> Home & reload persistence', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await mockGeolocationCoords(page, 12.2958, 76.6394); // Mysuru

    await page.goto('/');
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
    await page.getByRole('button', { name: /Get Started/i }).click();

    await expect(page).toHaveURL(/\/language$/);
    await expect(page.getByRole('button', { name: /ಕನ್ನಡ/i })).toBeVisible();
    await page.getByRole('button', { name: /ಕನ್ನಡ/i }).click();

    // Clicking Kannada translates the Continue button immediately
    const continueKnBtn = page.getByRole('button', { name: /ಮುಂದುವರಿಯಿರಿ/i });
    await expect(continueKnBtn).toBeVisible();
    await continueKnBtn.click();

    await expect(page).toHaveURL(/\/login$/);
    const demoBtn = page.getByRole('button', { name: /ರಮೇಶ್ ಕುಮಾರ್ ಆಗಿ ಪ್ರವೇಶಿಸಿ/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('heading', { level: 1, name: /ನಮಸ್ಕಾರ Ramesh!/i })).toBeVisible();
    await expect(page.locator('nav[aria-label="Main navigation"]')).toContainText('ಮುಖಪುಟ');

    // Language persists across hard reload
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: /ನಮಸ್ಕಾರ Ramesh!/i })).toBeVisible();
    const persistedLang = await page.evaluate(() => localStorage.getItem('krishi_sathi_lang'));
    expect(persistedLang).toBe('kn');
    expect(errors).toEqual([]);
  });

  test('Flow 2: Auth lifecycle Logout -> OTP Login -> Logout -> OTP Registration -> Home', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await mockGeolocationCoords(page, 12.5244, 76.8969); // Mandya

    // 1. Start authenticated -> logout from /profile
    await authenticateDemo(page, 'en');
    await page.goto('/profile');
    await page.getByRole('button', { name: /Logout/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: /Logout/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    const clearedToken = await page.evaluate(() => localStorage.getItem('krishi_sathi_token'));
    expect(clearedToken).toBeNull();

    // 2. Log back in as Ramesh Kumar using OTP flow
    await page.getByLabel('Mobile Number').fill('9876543210');
    await page.getByRole('button', { name: /Send Verification Code/i }).click();

    const otpInputs = page.locator('input[aria-label^="Digit "]');
    await expect(otpInputs).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(String(i + 1));
    }
    await page.getByRole('button', { name: /Verify OTP & Continue/i }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('heading', { level: 1, name: /Hello Ramesh!/i })).toBeVisible();

    // 3. Logout again & register a fresh farmer with verified OTP
    await page.goto('/profile');
    await page.getByRole('button', { name: /Logout/i }).click();
    await page.getByRole('dialog').getByRole('button', { name: /Logout/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByRole('link', { name: /Create New Account/i }).click();
    await expect(page).toHaveURL(/\/register$/);

    await page.locator('#reg-full-name').fill('Suresh Gowda');
    const uniquePhone = `9${Math.floor(100000000 + Math.random() * 899999999)}`;
    await page.locator('#reg-phone').fill(uniquePhone);
    await page.getByRole('button', { name: /Send Verification Code/i }).click();

    const regOtpInputs = page.locator('input[aria-label^="Digit "]');
    await expect(regOtpInputs).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await regOtpInputs.nth(i).fill(String(i + 1));
    }
    await page.getByRole('button', { name: /Verify OTP & Continue/i }).click();
    await expect(page.getByText('Verified', { exact: true })).toBeVisible();

    await page.locator('#reg-state').selectOption('Karnataka');
    await page.locator('#reg-district').selectOption('Mandya');

    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('heading', { level: 1, name: /Hello Suresh!/i })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('Flow 3a: WeatherWidget displays live Chennai data outside the 14 Karnataka districts', async ({
    page,
  }) => {
    await mockGeolocationCoords(page, 13.0827, 80.2707); // Chennai, Tamil Nadu
    await authenticateDemo(page, 'en');

    await page.goto('/home');
    const label = page.getByTestId('weather-location-label');
    await expect(label).toHaveText('Chennai, Tamil Nadu');
    await expect(page.getByText(/Live Open-Meteo API/i)).toBeVisible();
    await expect(page.getByText(/33°C/)).toBeVisible();
    await expect(page.getByTestId('weather-fallback-hint')).toHaveCount(0);
  });

  test('Flow 3b: WeatherWidget shows "Your location (lat, lon)" when reverse-geocode fails', async ({
    page,
  }) => {
    // E2E preload sentinel: (11.1111, 77.1111) forces Nominatim 404
    await mockGeolocationCoords(page, 11.1111, 77.1111);
    await authenticateDemo(page, 'en');

    await page.goto('/home');
    const label = page.getByTestId('weather-location-label');
    await expect(label).toHaveText('Your location (11.11°, 77.11°)');
    await expect(label).not.toContainText('Mandya');
  });

  test('Flow 3c: WeatherWidget falls back visibly to registered district when GPS is denied', async ({
    page,
  }) => {
    await mockGeolocationDenied(page);
    await authenticateDemo(page, 'en');

    await page.goto('/home');
    const hint = page.getByTestId('weather-fallback-hint');
    await expect(hint).toBeVisible();
    await expect(hint).toContainText(/Using your registered location \(Mandya\)/i);
    await expect(hint.getByRole('button', { name: /Use my current location/i })).toBeVisible();
  });

  test('Flow 3d: WeatherWidget displays Weather Unavailable + Retry when uncached live API fails', async ({
    page,
  }) => {
    // E2E preload sentinel: (9.9999, 77.9999) forces Open-Meteo 500
    await mockGeolocationCoords(page, 9.9999, 77.9999);
    await authenticateDemo(page, 'en');

    await page.goto('/home');
    await expect(page.getByRole('heading', { name: /Weather Unavailable/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Retry$/i })).toBeVisible();
  });

  test('Flow 3e: Sample data fallback shows visible "Sample data" badge and current non-October dates', async ({
    page,
  }) => {
    // Use failed upstream sentinel (9.9999, 77.9999) + demo=true query flag
    await mockGeolocationCoords(page, 9.9999, 77.9999);
    await authenticateDemo(page, 'en');

    let capturedDates: string[] = [];
    await page.route('**/api/weather?*', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/weather' && !url.searchParams.has('demo')) {
        url.searchParams.set('demo', 'true');
        const response = await route.fetch({ url: url.toString() });
        const json = await response.json();
        capturedDates = (json?.data?.forecast7Days || []).map((d: any) => d.date);
        await route.fulfill({ response, json });
        return;
      }
      await route.continue();
    });

    await page.goto('/home');
    await expect(page.getByText('Sample data', { exact: true })).toBeVisible();

    const todayIso = new Date().toISOString().split('T')[0];
    expect(capturedDates.length).toBeGreaterThanOrEqual(5);
    expect(capturedDates[0]).toBe(todayIso);
    if (new Date().getMonth() !== 9) {
      expect(capturedDates.some((d) => d.includes('-10-'))).toBe(false);
    }

    await page.unroute('**/api/weather?*');
  });

  test('Flow 4: Language Pill Portal dropdown renders above everything with all 4 languages and proper close behavior', async ({
    page,
  }) => {
    await mockGeolocationCoords(page, 12.2958, 76.6394);

    // Verify on Splash (unauthenticated)
    await page.goto('/');
    const splashPill = page.locator('button[aria-label^="Change language"]');
    await splashPill.click();
    const splashMenu = page.getByRole('listbox', { name: 'Select language' });
    await expect(splashMenu).toBeVisible();
    await expect(splashMenu.getByRole('option')).toHaveCount(4);
    await page.keyboard.press('Escape');
    await expect(splashMenu).toBeHidden();

    // Authenticate and verify on Home & Profile
    await authenticateDemo(page, 'en');
    await page.goto('/home');

    const pill = page.locator('button[aria-label^="Change language"]');
    await pill.click();

    const menu = page.getByRole('listbox', { name: 'Select language' });
    await expect(menu).toBeVisible();

    // Portaled into body, opaque white background, z-index >= 50, fits in viewport
    const menuStyle = await menu.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        isBodyChild: el.parentElement === document.body,
        bgColor: cs.backgroundColor,
        zIndex: Number(cs.zIndex),
        top: rect.top,
        bottom: rect.bottom,
        right: rect.right,
        left: rect.left,
      };
    });
    expect(menuStyle.isBodyChild).toBe(true);
    expect(menuStyle.bgColor).toBe('rgb(255, 255, 255)');
    expect(menuStyle.zIndex).toBeGreaterThanOrEqual(50);
    expect(menuStyle.top).toBeGreaterThanOrEqual(0);
    expect(menuStyle.bottom).toBeLessThanOrEqual(844);
    expect(menuStyle.left).toBeGreaterThanOrEqual(0);
    expect(menuStyle.right).toBeLessThanOrEqual(390);

    const options = menu.getByRole('option');
    await expect(options).toHaveCount(4);
    for (const label of ['English', 'ಕನ್ನಡ', 'தமிழ்', 'తెలుగు']) {
      await expect(options.filter({ hasText: label })).toBeVisible();
    }
    await expect(options.filter({ hasText: 'English' })).toHaveAttribute('aria-selected', 'true');

    // Escape closes dropdown
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();

    // Outside click/tap closes dropdown without navigating underneath
    await pill.click();
    await expect(menu).toBeVisible();
    await page.mouse.click(20, 450);
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/\/home$/);

    // Selecting Kannada updates UI immediately
    await pill.click();
    await menu.getByRole('option', { name: /ಕನ್ನಡ/i }).click();
    await expect(menu).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: /ನಮಸ್ಕಾರ Ramesh!/i })).toBeVisible();

    // Verify LanguagePill works identically on /profile
    await page.goto('/profile');
    await page.locator('button[aria-label^="Change language"]').click();
    const profMenu = page.getByRole('listbox', { name: 'Select language' });
    await expect(profMenu).toBeVisible();
    await expect(profMenu.getByRole('option')).toHaveCount(4);
    await profMenu.getByRole('option', { name: /English/i }).click();
    await expect(profMenu).toBeHidden();
  });

  test('Flow 5: Quick Actions on Home navigate to all 4 destination screens', async ({ page }) => {
    await mockGeolocationCoords(page, 12.2958, 76.6394);
    await authenticateDemo(page, 'en');

    const destinations = [
      { button: /Check My Soil/i, url: /\/soil$/ },
      { button: /Recommend a Crop/i, url: /\/crops$/ },
      { button: /Detect Pests/i, url: /\/diseases$/ },
      { button: /Market Prices/i, url: /\/market-prices$/ },
    ];

    for (const dest of destinations) {
      await page.goto('/home');
      await page.getByRole('button', { name: dest.button }).click();
      await expect(page).toHaveURL(dest.url);
    }
  });

  test('Flow 6: BottomNav 4 equal tabs, single pill indicator & bottom fade clearance', async ({
    page,
  }) => {
    await mockGeolocationCoords(page, 12.2958, 76.6394);
    await authenticateDemo(page, 'en');
    await page.goto('/home');

    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(page.getByTestId('bottom-fade')).toBeAttached();
    await expect(page.getByTestId('active-nav-pill')).toHaveCount(1);

    const tabs = nav.locator('a');
    await expect(tabs).toHaveCount(4);

    // Record cell boxes at Home, switch to Crops / AI Chat / Profile, assert zero layout shift
    const homeBoxes = await tabs.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, width: r.width, height: r.height };
      })
    );
    const widths = homeBoxes.map((b) => b.width);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1.5);
    homeBoxes.forEach((b) => expect(b.height).toBeGreaterThanOrEqual(44));

    await tabs.nth(1).click();
    await expect(page).toHaveURL(/\/crops$/);
    await expect(page.getByTestId('active-nav-pill')).toHaveCount(1);

    await tabs.nth(2).click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByTestId('active-nav-pill')).toHaveCount(1);

    await tabs.nth(3).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByTestId('active-nav-pill')).toHaveCount(1);

    const profileBoxes = await tabs.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, width: r.width, height: r.height };
      })
    );
    for (let i = 0; i < 4; i++) {
      expect(Math.abs(profileBoxes[i].left - homeBoxes[i].left)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(profileBoxes[i].width - homeBoxes[i].width)).toBeLessThanOrEqual(1.5);
    }
  });

  test('Flow 7: Soil Assessment -> Recommendations -> Crop Details -> Start Plan -> Task persists across reload', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await mockGeolocationCoords(page, 12.5244, 76.8969); // Mandya
    await authenticateDemo(page, 'en');

    await page.goto('/soil');

    // Step 1: Red Soil
    await page.getByRole('button', { name: /Red Soil/i }).click();
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 2: Good Drainage
    await expect(page.getByText(/Field Drainage Condition/i)).toBeVisible();
    await page.getByRole('button', { name: /Good \/ Well Drained/i }).click();
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 3: Location & Land Size
    await expect(page.locator('#soil-farm-size')).toBeVisible();
    await page.locator('#soil-farm-size').fill('2');
    // Wait for location conditions auto-fetch to populate district (or ensure populated)
    await expect(page.getByRole('button', { name: /Next Step/i })).toBeEnabled();
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 4: Water Source
    await expect(page.getByText(/Primary Water Source/i)).toBeVisible();
    await page.getByRole('button', { name: /Borewell/i }).click();
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 5: Season (wait for auto-detection or pick Kharif manually if empty)
    const changeSeasonBtn = page.getByRole('button', { name: /^Change$/i });
    if (await changeSeasonBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.getByText(/Detected:/i)).toBeVisible({ timeout: 5000 }).catch(async () => {
        await changeSeasonBtn.click();
        await page.getByRole('button', { name: /Kharif/i }).click();
      });
    }
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 6: pH & NPK
    await expect(page.getByText(/Soil Health Card/i)).toBeVisible();
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 7: Review & Generate
    await expect(page.getByText(/Review & Generate Recommendations/i)).toBeVisible();
    await page.getByRole('button', { name: /Generate Crop Recommendations/i }).click();

    await expect(page).toHaveURL(/\/crops$/);
    const viewDetailsBtn = page.getByRole('button', { name: /View Details/i }).first();
    await expect(viewDetailsBtn).toBeVisible();
    await viewDetailsBtn.click();

    await expect(page).toHaveURL(/\/crops\/crop-/);
    await expect(page.getByRole('button', { name: /Select This Crop/i })).toBeVisible();
    await page.getByRole('button', { name: /Select This Crop/i }).click();

    await expect(page).toHaveURL(/\/crops\/lifecycle\/.+/);

    // Toggle first uncompleted task and verify persistence across reload
    const incompleteBtn = page.locator('button[aria-pressed="false"]').first();
    await expect(incompleteBtn).toBeVisible();
    const taskTitle = (await incompleteBtn.locator('span.text-xs').innerText()).trim();

    const togglePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/lifecycle/tasks/') && resp.request().method() === 'PATCH'
    );
    await incompleteBtn.click();
    const toggleResp = await togglePromise;
    expect(toggleResp.status()).toBe(200);

    await expect(page.locator(`button[aria-pressed="true"]:has-text("${taskTitle}")`)).toBeVisible();

    await page.reload();
    await expect(page.locator(`button[aria-pressed="true"]:has-text("${taskTitle}")`)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('Flow 8: AI Chat Text Advisor + Voice quick query & graceful missing SpeechRecognition', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await authenticateDemo(page, 'en');

    await page.goto('/chat');

    // 1. Switch to Chat tab and send message
    await page.getByRole('button', { name: /^Chat$/i }).click();
    const input = page.getByLabel('Ask any farming question');
    await expect(input).toBeVisible();
    await input.fill('Which crop suits red soil in Mandya?');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText('Which crop suits red soil in Mandya?')).toBeVisible();
    // Assistant response bubble (brand badge + advice text)
    await expect(page.locator('.bg-gray-50').first()).toBeVisible({ timeout: 10000 });

    // 2. Switch to Voice tab and submit quick question without error
    await page.getByRole('button', { name: /^Voice$/i }).click();
    const quickQ = page.getByRole('button', { name: /Which fertilizer is best for tomato/i });
    await expect(quickQ).toBeVisible();
    await quickQ.click();

    // Advice card renders in VoiceConversationView
    await expect(page.getByText('Krushi Sathi').last()).toBeVisible({ timeout: 10000 });

    // 3. Tapping main mic button when SpeechRecognition is unavailable handles gracefully with clear error UI & zero crashes
    await page.evaluate(() => {
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
    });
    const micBtn = page.getByTestId('voice-mic-button');
    await expect(micBtn).toBeVisible();
    await micBtn.click();
    await expect(page.locator('button[aria-label="Tap to retry"]')).toBeVisible();
    await expect(page.getByText(/Speech recognition is not supported/i)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('Flow 9: Profile edit Farm Size & Unit, Dark Mode & Notifications persist across reload', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await authenticateDemo(page, 'en');

    await page.goto('/profile');

    // Edit land size to 2 Hectares
    await page.getByRole('button', { name: /Edit Profile/i }).click();
    await page.locator('#profile-edit-farmsize').fill('2');
    await page.locator('#profile-edit-farmunit').selectOption('Hectares');
    await page.getByRole('button', { name: /Save Changes/i }).click();

    await expect(page.getByText('2 Hectares')).toBeVisible();

    // Toggle Dark Mode ON
    const darkSwitch = page.getByRole('switch', { name: 'Toggle dark mode' });
    await darkSwitch.click();
    await expect(darkSwitch).toHaveAttribute('aria-checked', 'true');
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);

    // Toggle Notifications OFF
    const notifSwitch = page.getByRole('switch', { name: 'Toggle notifications' });
    await notifSwitch.click();
    await expect(notifSwitch).toHaveAttribute('aria-checked', 'false');

    // Reload and verify all 3 persisted
    await page.reload();
    await expect(page.getByText('2 Hectares')).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Toggle dark mode' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
    await expect(page.getByRole('switch', { name: 'Toggle notifications' })).toHaveAttribute(
      'aria-checked',
      'false'
    );

    // Restore Ramesh's seeded defaults cleanly so other suites see baseline profile
    await page.evaluate(async () => {
      const token = localStorage.getItem('krishi_sathi_token');
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ farmSize: 2.5, farmUnit: 'Acres', language: 'en' }),
      });
    });

    expect(errors).toEqual([]);
  });
});
