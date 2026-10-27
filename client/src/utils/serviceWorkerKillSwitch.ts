/**
 * Service Worker & Cache Recovery Utility (Kill Switch)
 * Provides mechanisms to unregister broken/stale service workers,
 * purge cache storage, and recover from blank screens or chunk loading failures.
 */

export async function unregisterServiceWorkers(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const results = await Promise.all(
      registrations.map(async (reg) => {
        try {
          return await reg.unregister();
        } catch (err) {
          console.warn('[SW KillSwitch] Failed to unregister worker:', err);
          return false;
        }
      })
    );
    return results.some(Boolean);
  } catch (err) {
    console.warn('[SW KillSwitch] Error querying registrations:', err);
    return false;
  }
}

export async function clearAllCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (name) => {
        try {
          await caches.delete(name);
          console.info(`[SW KillSwitch] Cleared cache: ${name}`);
        } catch (err) {
          console.warn(`[SW KillSwitch] Failed to clear cache ${name}:`, err);
        }
      })
    );
  } catch (err) {
    console.warn('[SW KillSwitch] Error clearing caches:', err);
  }
}

/**
 * Hard reset: unregisters service workers, purges caches, and reloads the window.
 */
export async function hardResetApp(): Promise<void> {
  try {
    await unregisterServiceWorkers();
    await clearAllCaches();
  } catch (err) {
    console.warn('[SW KillSwitch] Reset encountered an error:', err);
  } finally {
    // Strip any cache-busting or failure query params and force a clean reload
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.replace(cleanUrl);
  }
}

/**
 * Automatic recovery trigger:
 * If URL has `?reset-cache=1` or `?kill-sw=1`, execute kill switch immediately.
 */
export function checkUrlKillSwitch(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (params.has('reset-cache') || params.has('kill-sw') || params.has('sw-reset')) {
    console.warn('[SW KillSwitch] Triggered by URL parameter, resetting...');
    hardResetApp();
  }
}
