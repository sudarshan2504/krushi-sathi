import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile virtual keyboard visibility
 * Uses the visualViewport API where supported, with activeElement focus fallback
 */
export function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Only relevant on touch/mobile devices
    if (typeof window === 'undefined') return;

    const isMobileScreen = () => window.innerWidth < 768;

    const handleVisualViewportResize = () => {
      if (!window.visualViewport || !isMobileScreen()) {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
        return;
      }

      const diff = window.innerHeight - window.visualViewport.height;
      // If viewport shrunk by more than 140px, virtual keyboard is active
      if (diff > 140) {
        setIsKeyboardOpen(true);
        setKeyboardHeight(diff);
      } else {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (!isMobileScreen()) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        // Double check input type
        const type = target.getAttribute('type');
        if (type !== 'checkbox' && type !== 'radio' && type !== 'button' && type !== 'submit') {
          setIsKeyboardOpen(true);
        }
      }
    };

    const handleFocusOut = () => {
      if (!isMobileScreen()) return;
      // Slight delay to handle switching between inputs
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (
          !active ||
          (active.tagName !== 'INPUT' &&
            active.tagName !== 'TEXTAREA' &&
            active.getAttribute('contenteditable') !== 'true')
        ) {
          setIsKeyboardOpen(false);
          setKeyboardHeight(0);
        }
      }, 150);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
    }

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return { isKeyboardOpen, keyboardHeight };
}
