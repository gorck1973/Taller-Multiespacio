import { Download, Share, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F59E0B] px-3 text-xs font-semibold text-[#121417] whitespace-nowrap shrink-0 shadow-xs transition-colors hover:bg-[#D97706] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
      >
        <Download className="h-3.5 w-3.5 stroke-[2.25]" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#F59E0B]/60 bg-[#F59E0B]/12 px-3 text-xs font-semibold text-[#B45309] whitespace-nowrap shrink-0 transition-colors hover:bg-[#F59E0B]/20 dark:text-[#F59E0B]"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-[#2E3440] dark:bg-[#1E2229]">
              <div className="flex items-start justify-between gap-3">
                <h2
                  id="ios-install-title"
                  className="font-display text-lg font-bold text-gray-950 dark:text-white"
                >
                  Instalar en iPhone / iPad
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2A303A]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[#F59E0B]">
                    1.
                  </span>
                  <span>
                    Toca el botón{' '}
                    <strong className="inline-flex items-center gap-1 font-semibold">
                      Compartir <Share className="inline h-3.5 w-3.5" />
                    </strong>{' '}
                    en la barra de Safari.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[#F59E0B]">
                    2.
                  </span>
                  <span>
                    Elige <strong>Agregar a inicio</strong> para instalarla con
                    uso sin conexión.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#F59E0B] py-2 text-sm font-semibold text-[#121417] transition-colors hover:bg-[#D97706]"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
