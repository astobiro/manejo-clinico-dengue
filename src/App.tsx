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

const getSavedTriageInitial = () => {
  try {
    const raw = localStorage.getItem('dengue_triage_progress_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        weight: typeof parsed.patientWeight === 'number' ? parsed.patientWeight : 70,
        isPediatric: typeof parsed.patientAge === 'number' ? parsed.patientAge < 13 : false,
      };
    }
  } catch (e) {
    // ignore
  }
  return { weight: 70, isPediatric: false };
};

export default function App() {
  const initialTriage = React.useMemo(() => getSavedTriageInitial(), []);
  const [activeTab, setActiveTab] = useState<string>('triagem');

  // Shared weight and pediatric status across triage and hydration calculator
  const [patientWeight, setPatientWeight] = useState<number>(initialTriage.weight);
  const [isPediatric, setIsPediatric] = useState<boolean>(initialTriage.isPediatric);

  const handlePediatricChange = (pediatric: boolean) => {
    setIsPediatric(pediatric);
    if (pediatric && patientWeight > 40) {
      setPatientWeight(20);
    } else if (!pediatric && patientWeight < 30) {
      setPatientWeight(70);
    }
  };

  // Modals state
  const [isCardPrintModalOpen, setIsCardPrintModalOpen] = useState<boolean>(false);
  const [cardPrintData, setCardPrintData] = useState<any>(undefined);

  const [isHydrationModalOpen, setIsHydrationModalOpen] = useState<boolean>(false);
  const [hydrationModalGroup, setHydrationModalGroup] = useState<DengueGroup>(DengueGroup.GROUP_A);
  const [hydrationModalIsPediatric, setHydrationModalIsPediatric] = useState<boolean>(false);

  const [isTourniquetModalOpen, setIsTourniquetModalOpen] = useState<boolean>(false);

  const handleOpenCardPrint = (data: any) => {
    setCardPrintData(data);
    setIsCardPrintModalOpen(true);
  };

  const handleOpenHydrationModal = (weight: number, group: DengueGroup, isPed: boolean) => {
    setPatientWeight(weight);
    setHydrationModalGroup(group);
    setIsPediatric(isPed);
    setHydrationModalIsPediatric(isPed);
    setIsHydrationModalOpen(true);
  };

  const handleSelectGroupFromFlowchart = (group: DengueGroup) => {
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
          />
        </div>

        {/* TAB 2: CALCULADORA DE HIDRATAÇÃO */}
        {activeTab === 'hidratacao' && (
          <HydrationCalculatorModal
            weight={patientWeight}
            onWeightChange={setPatientWeight}
            isPediatric={isPediatric}
            onPediatricChange={handlePediatricChange}
            initialGroup={DengueGroup.GROUP_A}
            isModal={false}
          />
        )}

        {/* TAB 3: PROVA DO LAÇO */}
        {activeTab === 'laco' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-5 sm:p-6">
            <TourniquetTestCalculator isModal={false} />
          </div>
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
              initialData={cardPrintData || {
                patientName: 'Nome do Paciente',
                patientAge: 30,
                patientWeight: 70,
                facilityName: 'Unidade de Saúde / Pronto Atendimento',
                attendingProfessional: 'Profissional de Saúde',
                group: DengueGroup.GROUP_A,
                title: 'GRUPO A — Dengue sem Sinais de Alarme',
                subtitle: 'Manejo Ambulatorial com Hidratação Oral Imediata',
                setting: 'Ambulatorial (UBS)',
                duration: 'Retorno diário ou no dia da queda da febre',
                diseaseDay: 3,
                stage1Severity: {
                  data: {
                    severePlasmaLeakageShock: false,
                    severeBleeding: false,
                    severeOrganImpairment: false,
                    respiratoryFailureFluidOverload: false,
                    hypotensionCyanosisLateShock: false,
                  },
                  detectedList: [],
                },
                stage2Warning: {
                  data: {
                    intenseContinuousAbdominalPain: false,
                    persistentVomiting: false,
                    fluidAccumulation: false,
                    posturalHypotensionLipotimia: false,
                    hepatomegalyOver2cm: false,
                    mucosalBleeding: false,
                    lethargyIrritability: false,
                    progressiveHematocritIncrease: false,
                  },
                  detectedList: [],
                },
                stage3Special: {
                  data: {
                    infantUnder24Months: false,
                    pregnant: false,
                    elderlyOver65: false,
                    hypertensionOrCardiovascular: false,
                    diabetesMellitus: false,
                    copdOrAsthma: false,
                    obesity: false,
                    chronicHematologicDisease: false,
                    chronicKidneyDisease: false,
                    pepticAcidDisease: false,
                    hepatopathyOrAutoimmune: false,
                    socialRiskOrOralHydrationImpossibility: false,
                    skinBleedingSpontaneousOrInduced: false,
                  },
                  detectedList: [],
                },
                stage4Symptoms: {
                  data: {
                    hasFever: true,
                    feverDays: 3,
                    symptoms: {
                      nauseaVomiting: true,
                      rash: false,
                      myalgiaArthralgia: true,
                      headacheRetroorbital: true,
                      petechiaeOrTourniquet: false,
                      leukopenia: false,
                    },
                    isChildAcuteFeverNoFocus: false,
                  },
                  isSuspected: true,
                },
              }}
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
