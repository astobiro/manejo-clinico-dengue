import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-amber-500/50 animate-bounce no-print">
      <WifiOff className="w-4 h-4 text-amber-200 flex-shrink-0" />
      <div>
        <p className="leading-tight">Modo Offline Ativo</p>
        <p className="text-[10px] text-amber-200 font-normal">Todas as calculadoras e fluxogramas continuam disponíveis sem internet</p>
      </div>
    </div>
  );
};
