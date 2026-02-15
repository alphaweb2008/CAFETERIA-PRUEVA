import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { updateManifest } from '../utils/pwa';

/**
 * This component watches business config changes and
 * dynamically updates the PWA manifest, favicon, and meta tags.
 * It renders nothing visually.
 */
export function PWAManager() {
  const { business } = useApp();
  const initialized = useRef(false);

  useEffect(() => {
    // Debounce to avoid updating manifest on every keystroke in admin
    const timeout = setTimeout(() => {
      updateManifest(
        business.name,
        business.subtitle,
        business.description,
        business.logo
      );
      initialized.current = true;
    }, initialized.current ? 1000 : 100); // Fast first load, debounced after

    return () => clearTimeout(timeout);
  }, [business.name, business.subtitle, business.description, business.logo]);

  return null;
}
