/**
 * PWA utilities — dynamic manifest, service worker, install prompt
 */

// Generate icon as a canvas data URL from the business logo
async function generateIconFromLogo(
  logoUrl: string,
  size: number
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(generateDefaultIcon(size));
      return;
    }

    // Draw rounded rect background
    const radius = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = '#1c1917';
    ctx.fill();

    if (!logoUrl) {
      // Draw coffee emoji text
      ctx.font = `${size * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☕', size / 2, size / 2);
      resolve(canvas.toDataURL('image/png'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Center the logo inside with padding
      const padding = size * 0.15;
      const availableSize = size - padding * 2;
      const aspectRatio = img.width / img.height;
      let drawWidth = availableSize;
      let drawHeight = availableSize;
      if (aspectRatio > 1) {
        drawHeight = drawWidth / aspectRatio;
      } else {
        drawWidth = drawHeight * aspectRatio;
      }
      const x = (size - drawWidth) / 2;
      const y = (size - drawHeight) / 2;
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      // Fallback: draw coffee emoji
      ctx.font = `${size * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☕', size / 2, size / 2);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = logoUrl;
  });
}

function generateDefaultIcon(size: number): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'><rect width='${size}' height='${size}' rx='${size * 0.15}' fill='%231c1917'/><text x='${size / 2}' y='${size * 0.65}' font-size='${size * 0.5}' text-anchor='middle' fill='white'>☕</text></svg>`
  )}`;
}

/**
 * Updates the manifest.json dynamically and refreshes the link tag
 */
export async function updateManifest(
  businessName: string,
  businessSubtitle: string,
  description: string,
  logoUrl: string
) {
  try {
    // Generate icons at multiple sizes
    const sizes = [192, 512];
    const icons = await Promise.all(
      sizes.map(async (size) => {
        const iconDataUrl = await generateIconFromLogo(logoUrl, size);
        return {
          src: iconDataUrl,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: 'any maskable' as const,
        };
      })
    );

    const manifest = {
      name: `${businessName} ${businessSubtitle}`.trim(),
      short_name: businessName,
      description: description,
      start_url: '/',
      display: 'standalone' as const,
      background_color: '#1c1917',
      theme_color: '#1c1917',
      orientation: 'portrait-primary' as const,
      categories: ['food', 'lifestyle'],
      icons,
    };

    // Create a blob URL for the manifest
    const blob = new Blob([JSON.stringify(manifest)], {
      type: 'application/json',
    });
    const manifestUrl = URL.createObjectURL(blob);

    // Update the <link rel="manifest"> tag
    let manifestLink = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement;
    if (manifestLink) {
      // Revoke old blob URL if it was one
      if (manifestLink.href.startsWith('blob:')) {
        URL.revokeObjectURL(manifestLink.href);
      }
      manifestLink.href = manifestUrl;
    } else {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestUrl;
      document.head.appendChild(manifestLink);
    }

    // Update favicon
    await updateFavicon(logoUrl);

    // Update apple-touch-icon
    await updateAppleTouchIcon(logoUrl);

    // Update page title
    document.title = `${businessName} ${businessSubtitle}`.trim();

    // Update meta tags
    const metaAppName = document.querySelector('meta[name="application-name"]');
    if (metaAppName) metaAppName.setAttribute('content', businessName);
    
    const metaAppleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (metaAppleTitle) metaAppleTitle.setAttribute('content', businessName);

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // Notify service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_MANIFEST',
        manifest,
      });
    }
  } catch (err) {
    console.error('Error updating manifest:', err);
  }
}

async function updateFavicon(logoUrl: string) {
  try {
    const iconDataUrl = await generateIconFromLogo(logoUrl, 64);
    let faviconLink = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = iconDataUrl;
      faviconLink.type = 'image/png';
    } else {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      faviconLink.href = iconDataUrl;
      document.head.appendChild(faviconLink);
    }
  } catch {
    // ignore
  }
}

async function updateAppleTouchIcon(logoUrl: string) {
  try {
    const iconDataUrl = await generateIconFromLogo(logoUrl, 180);
    let appleLink = document.querySelector(
      'link[rel="apple-touch-icon"]'
    ) as HTMLLinkElement;
    if (appleLink) {
      appleLink.href = iconDataUrl;
    } else {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = iconDataUrl;
      document.head.appendChild(appleLink);
    }
  } catch {
    // ignore
  }
}

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registrado:', registration.scope);
      return registration;
    } catch (err) {
      console.error('Error registrando Service Worker:', err);
      return null;
    }
  }
  return null;
}

/**
 * PWA Install Prompt Management
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installPromptCallbacks: Array<(available: boolean) => void> = [];

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    installPromptCallbacks.forEach((cb) => cb(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installPromptCallbacks.forEach((cb) => cb(false));
  });
}

export function onInstallAvailable(callback: (available: boolean) => void) {
  installPromptCallbacks.push(callback);
  // Check if already available
  if (deferredPrompt) callback(true);
  return () => {
    installPromptCallbacks = installPromptCallbacks.filter((cb) => cb !== callback);
  };
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  
  try {
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installPromptCallbacks.forEach((cb) => cb(false));
    return result.outcome === 'accepted';
  } catch {
    return false;
  }
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
