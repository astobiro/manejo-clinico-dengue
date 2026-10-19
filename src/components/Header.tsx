import React from 'react';
import { 
  ClipboardList, 
  Droplets, 
  Stethoscope, 
  Network, 
  BookOpen, 
  FileText, 
  Database,
  Menu, 
  X, 
  PhoneCall 
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'triagem', label: 'Classificação de Risco', icon: ClipboardList, emoji: '📋' },
    { id: 'hidratacao', label: 'Calculadora Hidratação', icon: Droplets, emoji: '💧' },
    { id: 'laco', label: 'Prova do Laço', icon: Stethoscope, emoji: '🩺' },
    { id: 'banco', label: 'Banco Local', icon: Database, emoji: '💾' },
    { id: 'fluxograma', label: 'Fluxograma de Manejo', icon: Network, emoji: '🦟' },
    { id: 'guia', label: 'Guia Clínico & Alarme', icon: BookOpen, emoji: '📚' },
    { id: 'cartao', label: 'Cartão do Paciente', icon: FileText, emoji: '📄' },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F3F4F6] pt-3 px-3 sm:px-4 lg:px-6 no-print">
      {/* Top Banner Notice */}
      <div className="max-w-7xl mx-auto mb-2 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
            SINAN
          </span>
          <span className="text-slate-600 hidden sm:inline">
            Notificação compulsória de todo caso suspeito em até 24h/semanal
          </span>
          <span className="text-slate-600 sm:hidden">
            Notificação SINAN obrigatória
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton variant="compact" />
          <span className="hidden md:flex items-center gap-1 text-slate-500">
            <PhoneCall className="w-3 h-3 text-emerald-600" /> Disque Saúde 136
          </span>
          <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            Diretrizes 2024 / 2026
          </span>
        </div>
      </div>

      {/* Main Header Container (Geometric Balance White Card with left blue border) */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-3 sm:p-4 mb-3 transition">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div 
            className="flex items-center justify-between lg:justify-start gap-3 cursor-pointer select-none"
            onClick={() => handleSelectTab('triagem')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
                🦟
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-1.5 tracking-tight">
                  DengueFlow <span className="text-[#2563EB] font-medium text-sm sm:text-base">| Manejo Clínico</span>
                </h1>
                <p className="text-slate-500 text-[11px] sm:text-xs font-normal">
                  Classificação de Risco e Manejo Clínico da Dengue
                </p>
              </div>
            </div>

            {/* Mobile Menu Toggle (visible on mobile next to title) */}
            <div className="lg:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                aria-label="Abrir menu de navegação"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Grid Beside Title */}
          <nav className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-1.5 flex-shrink-0 text-xs font-semibold">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 text-left text-xs whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs shadow-blue-200'
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm flex-shrink-0">{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="max-w-7xl mx-auto mb-3 lg:hidden bg-white rounded-2xl border border-slate-200 shadow-md p-3 space-y-2 transition-all">
          <div className="pb-1 border-b border-slate-100">
            <PWAInstallButton variant="full" />
          </div>
          <div className="space-y-1.5">
            {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-200'
                    : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      )}
    </header>
  );
};
