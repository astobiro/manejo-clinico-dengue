import React, { useState } from 'react';
import { DengueGroup } from './types';
import { Header } from './components/Header';
import { TriageWizard } from './components/TriageWizard';
import { HydrationCalculatorModal } from './components/HydrationCalculatorModal';
import { TourniquetTestCalculator } from './components/TourniquetTestCalculator';
import { FlowchartVisualizer } from './components/FlowchartVisualizer';
import { ClinicalGuide } from './components/ClinicalGuide';
import { PrintableCardModal } from './components/PrintableCardModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LocalDatabaseView } from './components/LocalDatabaseView';
import { ClinicalAttendanceRecord } from './types/database';

const getSavedTriageInitial = () => {
  try {
    const raw = localStorage.getItem('dengue_triage_progress_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      const isPed = typeof parsed.patientAge === 'number' ? parsed.patientAge < 13 : false;
      const isEld = Boolean(parsed.specialConditions?.elderlyOver65 || (typeof parsed.patientAge === 'number' && parsed.patientAge >= 65));

      let grp = DengueGroup.GROUP_A;
      if (parsed.classifiedResult?.group) {
        grp = parsed.classifiedResult.group;
      } else {
        const hasSeverity = parsed.severitySigns && Object.values(parsed.severitySigns).some(Boolean);
        const hasWarning = (parsed.warningSigns && Object.values(parsed.warningSigns).some(Boolean)) || parsed.labData?.hasHemoconcentration;
        const hasSpecial = (parsed.specialConditions && Object.values(parsed.specialConditions).some(Boolean)) || isEld;
        if (hasSeverity) grp = DengueGroup.GROUP_D;
        else if (hasWarning) grp = DengueGroup.GROUP_C;
        else if (hasSpecial) grp = DengueGroup.GROUP_B;
      }

      return {
        weight: typeof parsed.patientWeight === 'number' ? parsed.patientWeight : (isPed ? 20 : 70),
        isPediatric: isPed,
        isElderly: isEld,
        group: grp,
      };
    }
  } catch (e) {
    // ignore
  }
  return { weight: 70, isPediatric: false, isElderly: false, group: DengueGroup.GROUP_A };
};

export default function App() {
  const initialTriage = React.useMemo(() => getSavedTriageInitial(), []);
  const [activeTab, setActiveTab] = useState<string>('triagem');

  // Record selected from database for editing/updating in TriageWizard
  const [recordToLoadInTriage, setRecordToLoadInTriage] = useState<ClinicalAttendanceRecord | null>(null);

  // Shared weight, pediatric, elderly status and group across triage and hydration calculator
  const [patientWeight, setPatientWeight] = useState<number>(initialTriage.weight);
  const [isPediatric, setIsPediatric] = useState<boolean>(initialTriage.isPediatric);
  const [isElderly, setIsElderly] = useState<boolean>(initialTriage.isElderly);
  const [patientGroup, setPatientGroup] = useState<DengueGroup>(initialTriage.group);

  const handlePediatricChange = (pediatric: boolean) => {
    setIsPediatric(pediatric);
    if (pediatric && patientWeight > 40) {
      setPatientWeight(20);
    } else if (!pediatric && patientWeight < 30) {
      setPatientWeight(70);
    }
  };

  const handleClassificationChange = (group: DengueGroup, isPed?: boolean, isEld?: boolean, weight?: number) => {
    setPatientGroup(group);
    if (isPed !== undefined) setIsPediatric(isPed);
    if (isEld !== undefined) setIsElderly(isEld);
    if (weight !== undefined && weight > 0) setPatientWeight(weight);
  };

  // Modals state
  const [isCardPrintModalOpen, setIsCardPrintModalOpen] = useState<boolean>(false);
  const [cardPrintData, setCardPrintData] = useState<any>(undefined);

  const [isHydrationModalOpen, setIsHydrationModalOpen] = useState<boolean>(false);
  const [hydrationModalGroup, setHydrationModalGroup] = useState<DengueGroup>(initialTriage.group);
  const [hydrationModalIsPediatric, setHydrationModalIsPediatric] = useState<boolean>(false);

  const [isTourniquetModalOpen, setIsTourniquetModalOpen] = useState<boolean>(false);

  const handleOpenCardPrint = (data: any) => {
    setCardPrintData(data);
    setIsCardPrintModalOpen(true);
  };

  const handleOpenHydrationModal = (weight: number, group: DengueGroup, isPed: boolean) => {
    setPatientWeight(weight);
    setHydrationModalGroup(group);
    setPatientGroup(group);
    setIsPediatric(isPed);
    setHydrationModalIsPediatric(isPed);
    setIsHydrationModalOpen(true);
  };

  const handleSelectGroupFromFlowchart = (group: DengueGroup) => {
    setPatientGroup(group);
    setActiveTab('triagem');
  };

  const handleLoadRecordToTriage = (record: ClinicalAttendanceRecord) => {
    setRecordToLoadInTriage(record);
    if (record.patientWeight) {
      setPatientWeight(record.patientWeight);
    }
    if (record.isPediatric !== undefined) {
      setIsPediatric(record.isPediatric);
    }
    if (record.group) {
      setPatientGroup(record.group);
      setHydrationModalGroup(record.group);
    }
    const isEld = Boolean(
      record.ageGroup?.includes('Idoso') || 
      record.stage3Special?.data?.elderlyOver65 || 
      (record.patientAge && record.patientAge >= 65)
    );
    setIsElderly(isEld);
    setActiveTab('triagem');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col text-slate-800 font-sans antialiased">
      {/* App Official Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main App Content Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-6 ${isCardPrintModalOpen ? 'no-print' : ''}`}>
        {/* TAB 1: TRIAGEM & CLASSIFICAÇÃO INICIAL (Mantém estado ao alternar abas) */}
        <div className={activeTab === 'triagem' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'triagem'}>
          <TriageWizard
            patientWeight={patientWeight}
            onWeightChange={setPatientWeight}
            isPediatric={isPediatric}
            onPediatricChange={handlePediatricChange}
            onOpenCardPrint={handleOpenCardPrint}
            onOpenTourniquetTest={() => setIsTourniquetModalOpen(true)}
            onOpenHydrationModal={handleOpenHydrationModal}
            onNavigateToDatabase={() => setActiveTab('banco')}
            recordToLoad={recordToLoadInTriage}
            onRecordLoaded={() => setRecordToLoadInTriage(null)}
            onClassificationChange={handleClassificationChange}
          />
        </div>

        {/* TAB 2: CALCULADORA DE HIDRATAÇÃO */}
        {activeTab === 'hidratacao' && (
          <HydrationCalculatorModal
            weight={patientWeight}
            onWeightChange={setPatientWeight}
            isPediatric={isPediatric}
            onPediatricChange={handlePediatricChange}
            initialIsElderly={isElderly}
            initialGroup={patientGroup}
            isModal={false}
          />
        )}

        {/* TAB 3: PROVA DO LAÇO */}
        {activeTab === 'laco' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-5 sm:p-6">
            <TourniquetTestCalculator isModal={false} />
          </div>
        )}

        {/* TAB: BANCO DE DADOS LOCAL (INDEXEDDB) */}
        {activeTab === 'banco' && (
          <LocalDatabaseView
            onOpenCardPrint={handleOpenCardPrint}
            onNavigateToTriage={() => setActiveTab('triagem')}
            onLoadRecordToTriage={handleLoadRecordToTriage}
          />
        )}

        {/* TAB 4: FLUXOGRAMA DE MANEJO */}
        {activeTab === 'fluxograma' && (
          <FlowchartVisualizer onSelectGroup={handleSelectGroupFromFlowchart} />
        )}

        {/* TAB 5: GUIA CLÍNICO & CRITÉRIOS */}
        {activeTab === 'guia' && <ClinicalGuide />}

        {/* TAB 6: CARTÃO DE ACOMPANHAMENTO (STANDALONE GENERATOR) */}
        {activeTab === 'cartao' && (
          <div className="w-full flex justify-center">
            <PrintableCardModal
              isModal={false}
              onClose={() => setActiveTab('triagem')}
              initialData={cardPrintData}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {isCardPrintModalOpen && (
        <PrintableCardModal
          initialData={cardPrintData}
          onClose={() => setIsCardPrintModalOpen(false)}
        />
      )}

      {isHydrationModalOpen && (
        <HydrationCalculatorModal
          weight={patientWeight}
          onWeightChange={setPatientWeight}
          initialGroup={hydrationModalGroup}
          initialIsPediatric={hydrationModalIsPediatric}
          initialIsElderly={isElderly}
          isModal={true}
          onClose={() => setIsHydrationModalOpen(false)}
        />
      )}

      {isTourniquetModalOpen && (
        <TourniquetTestCalculator
          isModal={true}
          onClose={() => setIsTourniquetModalOpen(false)}
        />
      )}

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Geometric Balance Footer with Status Dots */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 px-4 no-print text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-700 flex items-center justify-center md:justify-start gap-2">
              <span>Manejo Clínico de Dengue</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#2563EB]">Protocolo Clínico de Dengue</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Baseado na 6ª edição revisada do Guia de Vigilância em Saúde e no Manual de Diagnóstico e Manejo Clínico da Dengue.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></div>
              <span className="text-[10px] text-slate-600 font-bold uppercase">Grupo A</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-xs"></div>
              <span className="text-[10px] text-slate-600 font-bold uppercase">Grupo B</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-xs"></div>
              <span className="text-[10px] text-slate-600 font-bold uppercase">Grupo C</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-xs"></div>
              <span className="text-[10px] text-slate-600 font-bold uppercase">Grupo D</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
          <span>Aviso: Ferramenta digital de apoio clínico e decisão médica/enfermagem.</span>
          <span className="font-mono text-slate-400 uppercase">Protocolo Clínico 2024 / 2026</span>
        </div>
      </footer>
    </div>
  );
}
