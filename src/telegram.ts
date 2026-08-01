import {
  backButton,
  init,
  miniApp,
  themeParams,
  viewport,
  swipeBehavior,
} from '@telegram-apps/sdk';

/**
 * Initializes the Telegram Mini App runtime. Safe to call outside Telegram
 * (e.g. in a regular browser during development) — every call is wrapped
 * so the app still renders standalone.
 */
export function initTelegram() {
  try {
    init();

    if (miniApp.mount.isAvailable()) {
      miniApp.mount();
    }
    if (themeParams.mount.isAvailable()) {
      themeParams.mount();
    }
    if (viewport.mount.isAvailable()) {
      viewport.mount();
    }
    if (viewport.expand.isAvailable()) {
      viewport.expand();
    }
    if (swipeBehavior.mount.isAvailable()) {
      swipeBehavior.mount();
    }
    if (swipeBehavior.disableVertical.isAvailable()) {
      swipeBehavior.disableVertical();
    }
    if (backButton.mount.isAvailable()) {
      backButton.mount();
    }
    if (miniApp.setHeaderColor.isAvailable()) {
      miniApp.setHeaderColor('#0A0B0D');
    }
    if (miniApp.setBackgroundColor.isAvailable()) {
      miniApp.setBackgroundColor('#0A0B0D');
    }
    if (miniApp.ready.isAvailable()) {
      miniApp.ready();
    }
  } catch (err) {
    // Running outside Telegram (e.g. `npm run dev` in a plain browser tab).
    console.info('Telegram SDK not available in this environment:', err);
  }
}
