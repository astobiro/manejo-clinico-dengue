import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          title="Instalar DengueFlow no seu dispositivo para uso offline"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Instalar Aplicativo (Uso Offline)</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported on iOS Safari)
  if (isIOS) {
    return (
      <>
        {variant === 'compact' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            title="Instalar no iPhone ou iPad"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Instalar no iOS</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition ${className}`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Instalar no iPhone / iPad</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Instale o aplicativo na sua tela de início para acessar rapidamente e usar mesmo sem conexão à internet:
              </p>

              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 mb-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    No Safari, toque no botão <strong>Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline text-blue-600" /> na barra inferior.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Role a lista e toque em <strong>Adicionar à Tela de Início</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Toque em <strong>Adicionar</strong> no canto superior direito.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition cursor-pointer"
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
};
