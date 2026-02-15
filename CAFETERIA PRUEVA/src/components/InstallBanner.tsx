import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, MoreVertical } from 'lucide-react';
import { onInstallAvailable, promptInstall, isStandalone } from '../utils/pwa';
import { useApp } from '../context/AppContext';

export function InstallBanner() {
  const { business } = useApp();
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed as standalone
    if (isStandalone()) return;

    // Check if dismissed recently (24h)
    const dismissedAt = localStorage.getItem('kairo_install_dismissed');
    if (dismissedAt) {
      const diff = Date.now() - parseInt(dismissedAt);
      if (diff < 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    // Detect iOS
    const isApple =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isApple);

    // If iOS and not standalone, show the iOS guide banner after a delay
    if (isApple) {
      const timer = setTimeout(() => setCanInstall(true), 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Desktop, listen for the install prompt
    const unsubscribe = onInstallAvailable((available) => {
      setCanInstall(available);
    });

    return unsubscribe;
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    const accepted = await promptInstall();
    if (accepted) {
      setCanInstall(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('kairo_install_dismissed', Date.now().toString());
  };

  if (!canInstall || dismissed || isStandalone()) return null;

  return (
    <>
      {/* Install Banner — Fixed at bottom */}
      <AnimatePresence>
        {!showIOSGuide && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="max-w-lg mx-auto bg-stone-900 text-white rounded-2xl shadow-2xl shadow-black/30 border border-white/10 overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                {/* App Icon */}
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {business.logo ? (
                    <img
                      src={business.logo}
                      alt={business.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">☕</span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm leading-tight">
                    Instalar {business.name}
                  </h3>
                  <p className="text-white/50 text-xs mt-0.5 leading-snug">
                    Agrega la app a tu pantalla de inicio para acceso rápido
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDismiss}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleInstall}
                    className="flex items-center gap-2 bg-white text-stone-900 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/90 transition-colors active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Instalar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => {
              setShowIOSGuide(false);
              handleDismiss();
            }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden mb-[env(safe-area-inset-bottom)]"
            >
              <div className="p-6 text-center">
                {/* App Icon */}
                <div className="w-20 h-20 rounded-2xl bg-stone-900 flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
                  {business.logo ? (
                    <img
                      src={business.logo}
                      alt={business.name}
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    <span className="text-3xl">☕</span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-stone-900">
                  Instalar {business.name}
                </h3>
                <p className="text-stone-500 text-sm mt-1">
                  Sigue estos pasos para agregar la app a tu dispositivo:
                </p>
              </div>

              <div className="px-6 pb-6 space-y-4">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-stone-900 font-medium">
                      Toca el botón{' '}
                      <Share className="w-4 h-4 inline-block text-blue-500 -mt-0.5" />{' '}
                      Compartir
                    </p>
                    <p className="text-xs text-stone-400">
                      En la barra inferior de Safari
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-stone-900 font-medium">
                      Selecciona "Añadir a pantalla de inicio"
                    </p>
                    <p className="text-xs text-stone-400">
                      Desplaza hacia abajo en el menú
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-stone-900 font-medium">
                      Toca "Añadir"
                    </p>
                    <p className="text-xs text-stone-400">
                      ¡Listo! La app aparecerá en tu inicio
                    </p>
                  </div>
                </div>

                {/* Android hint if not iOS */}
                <div className="flex items-start gap-4 bg-stone-50 rounded-xl p-3">
                  <Smartphone className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500">
                      <strong>¿Android?</strong> Toca{' '}
                      <MoreVertical className="w-3 h-3 inline-block -mt-0.5" />{' '}
                      menú → "Instalar app" o "Añadir a pantalla de inicio"
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    setShowIOSGuide(false);
                    handleDismiss();
                  }}
                  className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-700 transition-colors active:scale-[0.98]"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
