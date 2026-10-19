import React, { useState } from 'react';
import { 
  DengueGroup, 
  TriageResult, 
  SymptomEvaluation, 
  WarningSigns, 
  SeveritySigns, 
  SpecialConditions, 
  LaboratoryEvaluation
} from '../types';
import { 
  SUSPECTED_DENGUE_DEFINITION, 
  WARNING_SIGNS_LIST, 
  SEVERITY_SIGNS_LIST, 
  SPECIAL_CONDITIONS_LIST, 
  GROUP_PROTOCOL_DETAILS 
} from '../data/dengueProtocol';
import { calculateHydration } from '../utils/hydrationCalculator';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  Droplets, 
  Stethoscope, 
  ShieldAlert, 
  User, 
  Scale, 
  Calendar, 
  Info,
  Clock,
  Printer,
  ChevronRight,
  Database,
  Save,
  Check
} from 'lucide-react';

import { FullTriagePrintData } from '../types/print';
import { localDatabase } from '../services/localDatabase';
import { ClinicalAttendanceRecord } from '../types/database';

interface TriageWizardProps {
  patientWeight?: number;
  onWeightChange?: (weight: number) => void;
  isPediatric?: boolean;
  onPediatricChange?: (isPed: boolean) => void;
  onOpenCardPrint: (data: FullTriagePrintData) => void;
  onOpenTourniquetTest: () => void;
  onOpenHydrationModal: (weight: number, group: DengueGroup, isPediatric: boolean) => void;
  onNavigateToDatabase?: () => void;
}

const TRIAGE_STORAGE_KEY = 'dengue_triage_progress_v1';

interface TriageSavedProgress {
  currentStep: number;
  patientName: string;
  patientAge: number;
  patientWeight: number;
  diseaseDay: number | '';
  facilityName: string;
  symptoms: SymptomEvaluation;
  severitySigns: SeveritySigns;
  warningSigns: WarningSigns;
  specialConditions: SpecialConditions;
  labData: LaboratoryEvaluation;
  classifiedResult: TriageResult | null;
}

const loadSavedTriage = (): TriageSavedProgress | null => {
  try {
    const raw = localStorage.getItem(TRIAGE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const TriageWizard: React.FC<TriageWizardProps> = ({
  patientWeight: externalWeight,
  onWeightChange,
  isPediatric: externalIsPediatric,
  onPediatricChange,
  onOpenCardPrint,
  onOpenTourniquetTest,
  onOpenHydrationModal,
  onNavigateToDatabase,
}) => {
  // Load saved state from localStorage if present
  const saved = React.useMemo(() => loadSavedTriage(), []);

  // Local DB state
  const [isSavingLocal, setIsSavingLocal] = useState<boolean>(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Patient basic info
  const [patientName, setPatientName] = useState<string>(() => saved?.patientName ?? '');
  const [patientAge, setPatientAge] = useState<number>(() => saved?.patientAge ?? (externalIsPediatric ? 8 : 35));
  const [localWeight, setLocalWeight] = useState<number>(() => saved?.patientWeight ?? 70);
  const patientWeight = externalWeight !== undefined ? externalWeight : localWeight;

  const handleWeightChange = (val: number) => {
    const safeVal = Math.max(1, val);
    setLocalWeight(safeVal);
    onWeightChange?.(safeVal);
  };

  const prevIsPediatricRef = React.useRef(externalIsPediatric);
  React.useEffect(() => {
    if (prevIsPediatricRef.current !== externalIsPediatric && externalIsPediatric !== undefined) {
      prevIsPediatricRef.current = externalIsPediatric;
      if (externalIsPediatric && patientAge >= 13) {
        setPatientAge(8);
      } else if (!externalIsPediatric && patientAge < 13) {
        setPatientAge(35);
      }
    }
  }, [externalIsPediatric, patientAge]);

  const [diseaseDay, setDiseaseDay] = useState<number | ''>(() => saved?.diseaseDay ?? '');
  const [facilityName, setFacilityName] = useState<string>(() => saved?.facilityName ?? '');

  // Step 4: Suspected Dengue & Symptoms (Initialized with ALL unselected)
  const [symptoms, setSymptoms] = useState<SymptomEvaluation>(() => saved?.symptoms ?? {
    hasFever: false,
    feverDays: 3,
    symptoms: {
      nauseaVomiting: false,
      rash: false,
      myalgiaArthralgia: false,
      headacheRetroorbital: false,
      petechiaeOrTourniquet: false,
      leukopenia: false,
    },
    isChildAcuteFeverNoFocus: false,
  });

  // Step 2: Severity Signs (Group D)
  const [severitySigns, setSeveritySigns] = useState<SeveritySigns>(() => saved?.severitySigns ?? {
    severePlasmaLeakageShock: false,
    severeBleeding: false,
    severeOrganImpairment: false,
    respiratoryFailureFluidOverload: false,
    hypotensionCyanosisLateShock: false,
  });

  // Step 3: Warning Signs (Group C)
  const [warningSigns, setWarningSigns] = useState<WarningSigns>(() => saved?.warningSigns ?? {
    intenseContinuousAbdominalPain: false,
    persistentVomiting: false,
    fluidAccumulation: false,
    posturalHypotensionLipotimia: false,
    hepatomegalyOver2cm: false,
    mucosalBleeding: false,
    lethargyIrritability: false,
    progressiveHematocritIncrease: false,
  });

  // Step 4: Special Conditions & Skin Bleeding (Group B)
  const [specialConditions, setSpecialConditions] = useState<SpecialConditions>(() => saved?.specialConditions ?? {
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
  });

  // Lab evaluation
  const [labData, setLabData] = useState<LaboratoryEvaluation>(() => saved?.labData ?? {
    hematocritTested: false,
    baselineHematocrit: 40,
    currentHematocrit: 40,
    plateletCount: 180000,
    hasHemoconcentration: false,
  });

  // Current wizard step: 1 (Gravidade), 2 (Alarme), 3 (Condições), 4 (Suspeita), 5 (Resultado & Conduta)
  const [currentStep, setCurrentStep] = useState<number>(() => saved?.currentStep ?? 1);
  const [classifiedResult, setClassifiedResult] = useState<TriageResult | null>(() => saved?.classifiedResult ?? null);

  // Automatically save progress so changing tabs or reloading never loses state
  React.useEffect(() => {
    try {
      const dataToSave: TriageSavedProgress = {
        currentStep,
        patientName,
        patientAge,
        patientWeight,
        diseaseDay,
        facilityName,
        symptoms,
        severitySigns,
        warningSigns,
        specialConditions,
        labData,
        classifiedResult,
      };
      localStorage.setItem(TRIAGE_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      // ignore in case of quota or private mode
    }
  }, [
    currentStep,
    patientName,
    patientAge,
    patientWeight,
    diseaseDay,
    facilityName,
    symptoms,
    severitySigns,
    warningSigns,
    specialConditions,
    labData,
    classifiedResult,
  ]);

  const isPediatric = patientAge < 13;

  // Evaluate suspected dengue criteria
  const countSelectedSymptoms = Object.values(symptoms.symptoms).filter(Boolean).length;
  const isDengueSuspected = 
    (symptoms.hasFever && symptoms.feverDays >= 2 && symptoms.feverDays <= 7 && countSelectedSymptoms >= 2) ||
    symptoms.isChildAcuteFeverNoFocus;

  // Process classification
  const evaluateClassification = (): TriageResult => {
    const detectedSeverity: string[] = [];
    SEVERITY_SIGNS_LIST.forEach((s) => {
      if (severitySigns[s.id]) detectedSeverity.push(s.label);
    });

    const detectedWarning: string[] = [];
    WARNING_SIGNS_LIST.forEach((w) => {
      if (warningSigns[w.id]) detectedWarning.push(w.label);
    });

    const detectedSpecial: string[] = [];
    SPECIAL_CONDITIONS_LIST.forEach((sc) => {
      if (specialConditions[sc.id]) detectedSpecial.push(sc.label);
    });

    let assignedGroup = DengueGroup.GROUP_A;

    if (detectedSeverity.length > 0) {
      assignedGroup = DengueGroup.GROUP_D;
    } else if (detectedWarning.length > 0 || labData.hasHemoconcentration) {
      assignedGroup = DengueGroup.GROUP_C;
    } else if (detectedSpecial.length > 0 || specialConditions.skinBleedingSpontaneousOrInduced) {
      assignedGroup = DengueGroup.GROUP_B;
    } else {
      assignedGroup = DengueGroup.GROUP_A;
    }

    const template = GROUP_PROTOCOL_DETAILS[assignedGroup];
    const result: TriageResult = {
      ...template,
      detectedSeveritySigns: detectedSeverity,
      detectedWarningSigns: detectedWarning,
      detectedSpecialConditions: detectedSpecial,
    };

    setClassifiedResult(result);
    return result;
  };

  const handleFinishWizard = () => {
    const result = evaluateClassification();
    setCurrentStep(5);
  };

  const handleResetAll = () => {
    try {
      localStorage.removeItem(TRIAGE_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setPatientName('');
    setPatientAge(35);
    handleWeightChange(70);
    setDiseaseDay('');
    setFacilityName('');
    setSymptoms({
      hasFever: false,
      feverDays: 3,
      symptoms: {
        nauseaVomiting: false,
        rash: false,
        myalgiaArthralgia: false,
        headacheRetroorbital: false,
        petechiaeOrTourniquet: false,
        leukopenia: false,
      },
      isChildAcuteFeverNoFocus: false,
    });
    setSeveritySigns({
      severePlasmaLeakageShock: false,
      severeBleeding: false,
      severeOrganImpairment: false,
      respiratoryFailureFluidOverload: false,
      hypotensionCyanosisLateShock: false,
    });
    setWarningSigns({
      intenseContinuousAbdominalPain: false,
      persistentVomiting: false,
      fluidAccumulation: false,
      posturalHypotensionLipotimia: false,
      hepatomegalyOver2cm: false,
      mucosalBleeding: false,
      lethargyIrritability: false,
      progressiveHematocritIncrease: false,
    });
    setSpecialConditions({
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
    });
    setLabData({
      hematocritTested: false,
      baselineHematocrit: 40,
      currentHematocrit: 40,
      plateletCount: 180000,
      hasHemoconcentration: false,
    });
    setClassifiedResult(null);
    setCurrentStep(1);
    setSavedRecordId(null);
    setSaveFeedback(null);
    onPediatricChange?.(false);
  };

  const handleSaveAttendance = async () => {
    if (!classifiedResult) return;
    setIsSavingLocal(true);
    setSaveFeedback(null);

    try {
      const recordId = savedRecordId || ('atend_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6));
      const nowIso = new Date().toISOString();

      const record: ClinicalAttendanceRecord = {
        id: recordId,
        createdAt: nowIso,
        updatedAt: nowIso,
        patientName: patientName.trim() || 'Paciente Não Identificado',
        patientAge,
        patientWeight,
        isPediatric,
        facilityName: facilityName.trim() || 'Unidade de Saúde',
        attendingProfessional: 'Profissional de Saúde',
        diseaseDay: typeof diseaseDay === 'number' ? diseaseDay : 0,
        group: classifiedResult.group,
        title: classifiedResult.title,
        subtitle: classifiedResult.subtitle,
        setting: classifiedResult.setting,
        duration: classifiedResult.duration,
        stage1Severity: {
          data: severitySigns,
          detectedList: classifiedResult.detectedSeveritySigns,
        },
        stage2Warning: {
          data: warningSigns,
          detectedList: classifiedResult.detectedWarningSigns,
        },
        stage3Special: {
          data: specialConditions,
          detectedList: classifiedResult.detectedSpecialConditions,
        },
        stage4Symptoms: {
          data: symptoms,
          isSuspected: isDengueSuspected,
        },
        labData,
        conduct: classifiedResult.conduct,
        mandatoryExams: classifiedResult.mandatoryExams,
        recommendedExams: classifiedResult.recommendedExams,
        hydrationCalc: {
          totalDailyVolumeMl: hydrationCalc.totalDailyVolumeMl,
          oralRehydrationMl: hydrationCalc.oralRehydrationMl,
          homeFluidsMl: hydrationCalc.homeFluidsMl,
          expansionStage1VolumeMl: hydrationCalc.expansionStage1VolumeMl,
          expansionStage2VolumeMl: hydrationCalc.expansionStage2VolumeMl,
          rapidExpansionVolume20min: hydrationCalc.rapidExpansionVolume20min,
          albumin5PercentVolumeMl: hydrationCalc.albumin5PercentVolumeMl,
        },
      };

      await localDatabase.saveRecord(record);
      setSavedRecordId(recordId);
      setSaveFeedback({
        type: 'success',
        message: 'Atendimento gravado com sucesso no Banco de Dados Local do aparelho! 💾',
      });
    } catch (e: any) {
      setSaveFeedback({
        type: 'error',
        message: 'Erro ao salvar atendimento no banco local: ' + (e.message || 'desconhecido'),
      });
    } finally {
      setIsSavingLocal(false);
    }
  };

  const hydrationCalc = calculateHydration(
    patientWeight,
    isPediatric,
    classifiedResult ? classifiedResult.group : DengueGroup.GROUP_A,
    patientAge
  );

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-4 sm:p-6 transition">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xl shadow-xs flex-shrink-0">
              🩺
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protocolo de Entrada</p>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Classificação de Risco & Triagem de Dengue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fluxograma de Manejo Clínico • Grupos A, B, C e D
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Etapa {currentStep} de 5 salva
            </span>
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition shadow-xs"
              title="Limpar todos os dados e reiniciar classificação"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Limpar / Novo
            </button>
            <button
              onClick={onOpenTourniquetTest}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Prova do Laço 🩺
            </button>
          </div>
        </div>

        {/* Patient Parameters Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Nome do Paciente (ou ID)
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ex: João da Silva / Leito 03"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-slate-50 font-medium text-slate-800 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Faixa Etária
            </label>
            <select
              value={
                specialConditions.elderlyOver65 || patientAge >= 65
                  ? 'idoso'
                  : patientAge < 13
                  ? 'crianca'
                  : 'adulto'
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'crianca') {
                  setPatientAge(8);
                  setSpecialConditions((prev) => ({ ...prev, elderlyOver65: false }));
                  onPediatricChange?.(true);
                  if (patientWeight > 40) handleWeightChange(20);
                } else if (val === 'idoso') {
                  setPatientAge(70);
                  setSpecialConditions((prev) => ({ ...prev, elderlyOver65: true }));
                  onPediatricChange?.(false);
                  if (patientWeight < 30) handleWeightChange(70);
                } else {
                  setPatientAge(35);
                  setSpecialConditions((prev) => ({ ...prev, elderlyOver65: false }));
                  onPediatricChange?.(false);
                  if (patientWeight < 30) handleWeightChange(70);
                }
              }}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-slate-50 font-medium text-slate-800 transition"
            >
              <option value="crianca">Criança (&lt; 13 anos)</option>
              <option value="adulto">Adulto (&lt; 65 anos)</option>
              <option value="idoso">Idoso (&gt;= 65 anos)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-slate-400" /> Peso (kg)
            </label>
            <input
              type="number"
              min="1"
              max="250"
              step="0.5"
              value={patientWeight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 1)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-slate-50 font-mono font-bold text-[#2563EB] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Dia de Início
            </label>
            <select
              value={diseaseDay}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value);
                setDiseaseDay(val);
                if (typeof val === 'number') {
                  setSymptoms((prev) => ({ ...prev, feverDays: val }));
                }
              }}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-slate-50 font-medium text-slate-800 transition"
            >
              <option value="">Selecione o dia...</option>
              <option value={1}>1º dia (Fase Febril)</option>
              <option value={2}>2º dia (Fase Febril)</option>
              <option value={3}>3º dia (Início Fase Crítica)</option>
              <option value={4}>4º dia (Fase Crítica / Alarme)</option>
              <option value={5}>5º dia (Fase Crítica / Alarme)</option>
              <option value={6}>6º dia (Fase Crítica / Defervescência)</option>
              <option value={7}>7º dia (Fase de Recuperação)</option>
              <option value={8}>8º dia ou mais (Recuperação)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              🏢 Unidade / Serviço
            </label>
            <input
              type="text"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              placeholder="Ex: UBS Central / UPA 24h"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-slate-50 font-medium text-slate-800 transition"
            />
          </div>
        </div>

        {/* Disease phase alert pill */}
        {typeof diseaseDay === 'number' && diseaseDay >= 3 && diseaseDay <= 6 && (
          <div className="mt-4 bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Alerta de Fase Crítica (Dias 3 a 6):</strong> Período de defervescência da febre com maior risco de extravasamento plasmático, choque e manifestação dos sinais de alarme!
            </span>
          </div>
        )}
      </div>

      {/* Progress Steps Navigator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-3">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-xs font-semibold">
          {[
            { step: 1, title: '1. Gravidade', emoji: '🚨', desc: 'Choque / Órgãos (D)' },
            { step: 2, title: '2. Alarme', emoji: '⚠️', desc: 'Sinais de Alarme (C)' },
            { step: 3, title: '3. Condições', emoji: '🩸', desc: 'Comorbidades / Laço (B)' },
            { step: 4, title: '4. Suspeita', emoji: '🦟', desc: 'Febre + Sintomas (A)' },
            { step: 5, title: '5. Conduta', emoji: '📋', desc: 'Resultado & Manejo' },
          ].map((item) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => {
                  if (item.step === 5) {
                    handleFinishWizard();
                  } else {
                    setCurrentStep(item.step);
                  }
                }}
                className={`py-2.5 px-1 sm:px-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-200 border border-blue-600'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span className="font-bold whitespace-nowrap text-[11px] sm:text-xs mt-0.5">{item.title}</span>
                <span className="text-[10px] opacity-75 hidden md:inline truncate">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Sinais de Gravidade (Grupo D) - PRIMEIRO PASSO PRIORITÁRIO */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Prioridade 1 • Classificação Imediata
              </span>
            </div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Passo 1 de 4 • Pesquisa Prioritária de Sinais de Gravidade e Choque (Grupo D)</p>
            <h3 className="text-lg sm:text-xl font-bold text-red-900 flex items-center gap-2 mt-0.5">
              <span>🚨</span> Há Presença de Algum Sinal de Gravidade ou Choque?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              A prioridade clínica inicial na triagem é identificar precocemente sinais de choque, insuficiência respiratória, sangramento grave ou disfunção orgânica. A presença de qualquer um dos itens abaixo classifica IMEDIATAMENTE o paciente como <strong className="text-red-700">GRUPO D (DENGUE GRAVE)</strong> e exige ressuscitação volêmica imediata (20 mL/kg em até 20 min).
            </p>
          </div>

          {/* Severity Checklist */}
          <div className="space-y-2.5">
            {SEVERITY_SIGNS_LIST.map((item) => {
              const isChecked = severitySigns[item.id];
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border transition cursor-pointer ${
                    isChecked
                      ? 'bg-red-50 border-red-500 text-red-950 font-medium shadow-xs'
                      : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/20 text-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      setSeveritySigns({
                        ...severitySigns,
                        [item.id]: e.target.checked,
                      });
                    }}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-slate-300 mt-0.5 flex-shrink-0 accent-red-600"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <h4 className="text-sm font-bold">{item.label}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Quick Alert if Severity detected */}
          {Object.values(severitySigns).some(Boolean) ? (
            <div className="bg-red-50 border-2 border-dashed border-red-400 rounded-xl p-4 text-red-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" />
                <span>ALERTA CRÍTICO: GRUPO D DETECTADO (DENGUE GRAVE / CHOQUE)</span>
              </div>
              <p className="text-xs text-red-900">
                Conduta Imediata: Iniciar expansão rápida parenteral com Soro Fisiológico 0,9% ou Ringer Lactato a <strong>20 mL/kg em até 20 minutos</strong> e providenciar leito de UTI.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Nenhum sinal de gravidade marcado. Avance para avaliar Sinais de Alarme (Grupo C).</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 font-semibold">
              Passo 1 de 4
            </div>
            <div className="flex items-center gap-2">
              {Object.values(severitySigns).some(Boolean) && (
                <button
                  onClick={handleFinishWizard}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-red-200 transition flex items-center gap-2 text-sm"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Concluir como GRUPO D (Dengue Grave) 🚨</span>
                </button>
              )}
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-200 transition flex items-center gap-2 text-sm"
              >
                <span>Avançar para Sinais de Alarme (Passo 2)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Sinais de Alarme (Grupo C) */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Passo 2 de 4 • Pesquisa de Sinais de Alarme (Grupo C)</p>
            <h3 className="text-lg sm:text-xl font-bold text-orange-950 flex items-center gap-2 mt-0.5">
              <span>⚠️</span> Há Presença de Algum Sinal de Alarme (Extravasamento Plasmático)?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Os sinais de alarme surgem tipicamente na queda da febre (dias 3 a 6) e indicam início de extravasamento de plasma. Qualquer sinal positivo classifica como <strong className="text-orange-700">GRUPO C</strong> (internação obrigatória e reposição de 10 mL/kg/h).
            </p>
          </div>

          {/* Warning Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WARNING_SIGNS_LIST.map((item) => {
              const isChecked = warningSigns[item.id];
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                    isChecked
                      ? 'bg-orange-50 border-orange-500 text-orange-950 font-medium shadow-xs'
                      : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 text-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      setWarningSigns({
                        ...warningSigns,
                        [item.id]: e.target.checked,
                      });
                    }}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 mt-1 flex-shrink-0 accent-orange-600"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{item.icon}</span>
                      <h4 className="text-xs sm:text-sm font-bold">{item.label}</h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">{item.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Hematocrit rapid check */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📈</span> Avaliação Rápida de Hemoconcentração (Hematócrito)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Ht Basal (ou ref.) %
                </label>
                <input
                  type="number"
                  value={labData.baselineHematocrit}
                  onChange={(e) => setLabData({ ...labData, baselineHematocrit: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  placeholder="Ex: 38"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Ht Atual %
                </label>
                <input
                  type="number"
                  value={labData.currentHematocrit}
                  onChange={(e) => {
                    const cur = parseFloat(e.target.value) || 0;
                    const bas = labData.baselineHematocrit || 38;
                    const isHemoc = (cur - bas) / bas >= 0.20;
                    setLabData({
                      ...labData,
                      currentHematocrit: cur,
                      hasHemoconcentration: isHemoc,
                    });
                    if (isHemoc) {
                      setWarningSigns((prev) => ({ ...prev, progressiveHematocritIncrease: true }));
                    }
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-blue-900"
                  placeholder="Ex: 46"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Status de Hemoconcentração
                </label>
                <div className={`text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1 border ${
                  labData.hasHemoconcentration
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {labData.hasHemoconcentration ? '⚠️ Elevação > 20% (Alarme)' : '✅ Ht Estável'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              ← Voltar para Gravidade (Passo 1)
            </button>
            <div className="flex items-center gap-2">
              {Object.values(warningSigns).some(Boolean) && (
                <button
                  onClick={handleFinishWizard}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-orange-200 transition flex items-center gap-2 text-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Concluir como GRUPO C (Alarme) ⚠️</span>
                </button>
              )}
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-200 transition flex items-center gap-2 text-sm"
              >
                <span>Avançar para Condições Especiais (Passo 3)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Condições Especiais, Comorbidades e Sangramento (Grupo B) */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Passo 3 de 4 • Pesquisa de Comorbidades, Sangramento de Pele e Prova do Laço (Grupo B)</p>
            <h3 className="text-lg sm:text-xl font-bold text-sky-950 flex items-center gap-2 mt-0.5">
              <span>🩸</span> Há Sangramento de Pele, Prova do Laço Positiva ou Condição Clínica Especial?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pacientes com sangramento cutâneo espontâneo (petéquias), Prova do Laço positiva, extremos de idade (&lt;24m ou &gt;65a), gestantes ou comorbidades crônicas são classificados como <strong className="text-sky-700">GRUPO B</strong> (observação e hemograma obrigatório).
            </p>
          </div>

          {/* Tourniquet Banner inside Step 3 */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🩺</span>
              <div>
                <h4 className="text-sm font-bold text-purple-950">
                  Deseja realizar ou calcular a Prova do Laço agora?
                </h4>
                <p className="text-xs text-purple-700">
                  Calcula a Pressão Arterial Média (PAM) e inicia o temporizador padrão de 5 min (adulto) ou 3 min (criança).
                </p>
              </div>
            </div>
            <button
              onClick={onOpenTourniquetTest}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow whitespace-nowrap transition"
            >
              Abrir Prova do Laço ⏱️
            </button>
          </div>

          {/* Special Conditions Checklist */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Selecione as condições clínicas presentes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {SPECIAL_CONDITIONS_LIST.map((item) => {
                const isChecked = specialConditions[item.id];
                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                      isChecked
                        ? 'bg-sky-50 border-sky-500 text-sky-950 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSpecialConditions((prev) => ({
                          ...prev,
                          [item.id]: checked,
                        }));
                        if (item.id === 'elderlyOver65') {
                          setPatientAge(checked ? 70 : 35);
                        }
                      }}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 flex-shrink-0 accent-sky-600"
                    />
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Summary of Step 3 */}
          <div className={`p-4 rounded-xl border ${
            Object.values(specialConditions).some(Boolean)
              ? 'bg-sky-50 border-sky-300 text-sky-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold">
                  {Object.values(specialConditions).some(Boolean)
                    ? 'Classificação Prevista: GRUPO B (Dengue com Condição Especial / Risco)'
                    : 'Classificação Prevista: GRUPO A (Dengue sem Alarme / sem Comorbidade)'}
                </h5>
                <p className="text-xs mt-0.5 opacity-90">
                  {Object.values(specialConditions).some(Boolean)
                    ? 'O paciente requer leito de observação para hidratação oral supervisionada e realização de hemograma completo obrigatório.'
                    : 'Ausência de sinais de alarme, gravidade e comorbidades. Avance para confirmar os sintomas do caso suspeito.'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              ← Voltar para Alarme (Passo 2)
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-200 transition flex items-center gap-2 text-sm"
            >
              <span>Avançar para Suspeita Clínica (Passo 4)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Suspeita de Dengue & Sintomas Clínicos */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passo 4 de 4 • Definição de Caso Suspeito & Sintomas Clínicos</p>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
              <span>🦟</span> Avaliação de Suspeita Clínica e Sintomas Gerais
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verifique se o paciente preenche os critérios clínicos de caso suspeito de dengue.
            </p>
          </div>

          {/* Fever Switch */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  1. Presença de Febre (usual de 2 a 7 dias)?
                </h4>
                <p className="text-xs text-slate-500">
                  Relato de febre aferida ou referida com início súbito
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptoms.hasFever}
                  onChange={(e) => setSymptoms({ ...symptoms, hasFever: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>

            {/* Child criterion alternative */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700">
                  Ou é Criança com quadro febril agudo (2 a 7d) sem foco aparente?
                </h4>
                <p className="text-[11px] text-slate-500">
                  Residente ou proveniente de área com transmissão de dengue
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptoms.isChildAcuteFeverNoFocus}
                  onChange={(e) => setSymptoms({ ...symptoms, isChildAcuteFeverNoFocus: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>
          </div>

          {/* Classical Symptoms List */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Manifestações Clínicas Associadas (mínimo 2 obrigatórias)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUSPECTED_DENGUE_DEFINITION.symptomsList.map((item) => {
                const isChecked = (symptoms.symptoms as any)[item.id];
                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50 border-[#2563EB] text-blue-950 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setSymptoms({
                          ...symptoms,
                          symptoms: {
                            ...symptoms.symptoms,
                            [item.id]: e.target.checked,
                          },
                        });
                      }}
                      className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 border-slate-300 accent-[#2563EB]"
                    />
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status of Suspected Dengue */}
          <div className={`p-4 rounded-xl border ${
            isDengueSuspected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {isDengueSuspected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className="text-sm font-bold">
                  {isDengueSuspected ? 'CASO SUSPEITO DE DENGUE CONFIRMADO CLINICAMENTE' : 'Critérios de Suspeita Incompletos'}
                </h5>
                <p className="text-xs mt-0.5 opacity-90">
                  {isDengueSuspected
                    ? 'O paciente preenche os critérios clínicos de caso suspeito. Finalize para obter o plano de conduta terapêutica.'
                    : 'Febre entre 2 e 7 dias associada a 2 ou mais sintomas clínicos é necessária para definição de caso de dengue. Reavalie diagnósticos diferenciais.'}
                </p>
              </div>
            </div>
          </div>

          {/* Forward Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              ← Voltar para Condições Especiais (Passo 3)
            </button>
            <button
              onClick={handleFinishWizard}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-200 transition flex items-center gap-2 text-sm"
            >
              <span>Finalizar e Ver Conduta Médica Completa 📋</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: RESULT & ACTIONABLE CLINICAL CONDUCT */}
      {currentStep === 5 && classifiedResult && (
        <div className="space-y-6">
          {/* Main Group Header Result */}
          <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className={`p-5 sm:p-6 text-white ${
              classifiedResult.group === DengueGroup.GROUP_D
                ? 'bg-red-600'
                : classifiedResult.group === DengueGroup.GROUP_C
                ? 'bg-amber-600'
                : classifiedResult.group === DengueGroup.GROUP_B
                ? 'bg-[#0284C7]'
                : 'bg-emerald-600'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 text-white text-[11px] font-bold mb-2 uppercase tracking-wide">
                    Resultado da Classificação Clínica
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                    {classifiedResult.group === DengueGroup.GROUP_D && '🚨 '}
                    {classifiedResult.group === DengueGroup.GROUP_C && '⚠️ '}
                    {classifiedResult.group === DengueGroup.GROUP_B && '💉 '}
                    {classifiedResult.group === DengueGroup.GROUP_A && '✅ '}
                    {classifiedResult.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 mt-1">
                    {classifiedResult.subtitle}
                  </p>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right flex-shrink-0">
                  <div className="text-[11px] text-white/80 font-bold uppercase tracking-wider">Local Indicado:</div>
                  <div className="text-sm sm:text-base font-black text-white">{classifiedResult.setting}</div>
                </div>
              </div>
            </div>

            {/* Detected Factors Summary Bar */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="font-bold text-slate-700 block mb-1">🚨 Sinais de Gravidade:</span>
                  {classifiedResult.detectedSeveritySigns.length > 0 ? (
                    <ul className="list-disc list-inside text-red-700 font-semibold space-y-0.5">
                      {classifiedResult.detectedSeveritySigns.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500">Nenhum detectado</span>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="font-bold text-slate-700 block mb-1">⚠️ Sinais de Alarme:</span>
                  {classifiedResult.detectedWarningSigns.length > 0 ? (
                    <ul className="list-disc list-inside text-amber-800 font-semibold space-y-0.5">
                      {classifiedResult.detectedWarningSigns.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500">Nenhum detectado</span>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="font-bold text-slate-700 block mb-1">🩸 Condições / Risco Social:</span>
                  {classifiedResult.detectedSpecialConditions.length > 0 ? (
                    <ul className="list-disc list-inside text-sky-800 font-semibold space-y-0.5">
                      {classifiedResult.detectedSpecialConditions.map((sc, i) => (
                        <li key={i}>{sc}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500">Nenhuma detectada</span>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Conduct Cards */}
            <div className="p-5 sm:p-6 space-y-6 bg-white">
              {/* Prescribed Hydration Strategy */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-[#2563EB] flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-[#2563EB]" />
                    Prescrição de Hidratação Personalizada ({patientWeight} kg)
                  </h3>
                  <button
                    onClick={() => onOpenHydrationModal(patientWeight, classifiedResult.group, isPediatric)}
                    className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    Ver calculadora completa 💧
                  </button>
                </div>

                {/* Oral Hydration (Group A / B) */}
                {(classifiedResult.group === DengueGroup.GROUP_A || classifiedResult.group === DengueGroup.GROUP_B) && (
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                    <p className="font-bold text-slate-800">
                      {isPediatric
                        ? `Plano de Hidratação Oral Pediátrico (${patientWeight <= 10 ? '130' : patientWeight <= 20 ? '100' : '80'} mL/kg/dia):`
                        : 'Plano de Hidratação Oral Adulto (60 mL/kg/dia):'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200 text-center shadow-xs">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">VOLUME DIÁRIO TOTAL</span>
                        <span className="text-lg font-black text-blue-900">{hydrationCalc.totalDailyVolumeMl.toLocaleString('pt-BR')} mL</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">por dia (24 horas)</span>
                      </div>
                      <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center shadow-xs">
                        <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">1/3 Sais Reidratação (SRO)</span>
                        <span className="text-lg font-black text-emerald-900">{hydrationCalc.oralRehydrationMl.toLocaleString('pt-BR')} mL</span>
                        <span className="text-[10px] text-emerald-700 block mt-0.5">Iniciar de imediato c/ maior volume</span>
                      </div>
                      <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 text-center shadow-xs">
                        <span className="text-[11px] text-sky-800 font-bold uppercase tracking-wider block">2/3 Líquidos Caseiros</span>
                        <span className="text-lg font-black text-sky-900">{hydrationCalc.homeFluidsMl.toLocaleString('pt-BR')} mL</span>
                        <span className="text-[10px] text-sky-700 block mt-0.5">Água, sucos, água de coco, chás</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Venous Hydration (Group C) */}
                {classifiedResult.group === DengueGroup.GROUP_C && (
                  <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                    <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-3 text-amber-950 font-medium">
                      <strong>FASE DE EXPANSÃO IMEDIATA (10 mL/kg/h):</strong> Administrar em qualquer nível de atenção imediatamente antes de qualquer transferência!
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-500 block">1ª HORA (SF 0,9%)</span>
                        <span className="text-base font-black text-amber-900">{hydrationCalc.expansionStage1VolumeMl} mL em 1h</span>
                        <span className="text-[11px] text-slate-500 block">Velocidade: {hydrationCalc.expansionStage1RateMlH} mL/h ({hydrationCalc.expansionStage1DropsMin} gts/min)</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-500 block">2ª HORA (SF 0,9%)</span>
                        <span className="text-base font-black text-amber-900">{hydrationCalc.expansionStage2VolumeMl} mL em 1h</span>
                        <span className="text-[11px] text-slate-500 block">Até reavaliação do Ht em 2 horas</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-500 block">MANUTENÇÃO 1ª FASE (6h)</span>
                        <span className="text-base font-black text-slate-900">{hydrationCalc.maintenancePhase1VolumeMl} mL em 6h</span>
                        <span className="text-[11px] text-slate-500 block">Taxa: {hydrationCalc.maintenancePhase1RateMlH} mL/h ({hydrationCalc.maintenancePhase1DropsMin} gts/min)</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-500 block">MANUTENÇÃO 2ª FASE (8h)</span>
                        <span className="text-base font-black text-slate-900">{hydrationCalc.maintenancePhase2VolumeMl} mL em 8h</span>
                        <span className="text-[11px] text-slate-500 block">Taxa: {hydrationCalc.maintenancePhase2RateMlH} mL/h ({hydrationCalc.maintenancePhase2DropsMin} gts/min)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resuscitation Hydration (Group D) */}
                {classifiedResult.group === DengueGroup.GROUP_D && (
                  <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                    <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-red-950 font-bold">
                      RESSUSCITAÇÃO VOLÊMICA RÁPIDA (20 mL/kg em até 20 minutos com Soro Fisiológico 0,9% EV):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-red-300 shadow-xs">
                        <span className="text-[11px] font-bold text-red-800 block">EXPANSÃO RÁPIDA EM 20 MIN</span>
                        <span className="text-lg font-black text-red-950">{hydrationCalc.rapidExpansionVolume20min} mL em 20 min</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Infusão aberta em acesso calibroso</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-700 block">REAVALIAÇÃO</span>
                        <span className="text-sm font-black text-slate-900">Sinais vitais 15-30 min</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Hematócrito em 2 horas</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-700 block">SE CHOQUE PERSISTENTE + Ht ↑</span>
                        <span className="text-sm font-black text-blue-900">Albumina 5%: {hydrationCalc.albumin5PercentVolumeMl} mL</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">0,5 - 1 g/kg (coloides sintéticos)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Exams Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>🔬</span> Exames Obrigatórios
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    {classifiedResult.mandatoryExams.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>🩺</span> Exames Recomendados / Avaliação Complementar
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    {classifiedResult.recommendedExams.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reassessment & Monitoring Rules */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>⏱️</span> Rotina de Reavaliação e Critérios de Acompanhamento
                </h4>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {classifiedResult.conduct.reassessment}
                </p>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  {classifiedResult.conduct.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medications and Strict Contraindications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>💊</span> Medicações Sintomáticas Permitidas
                  </h4>
                  <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
                    {classifiedResult.conduct.medications.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/80 p-4 rounded-xl border border-red-300 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-red-950 flex items-center gap-1.5">
                    <span>🚫</span> Contraindicações Absolutas na Dengue
                  </h4>
                  <ul className="list-disc list-inside text-xs text-red-900 font-semibold space-y-1">
                    {classifiedResult.conduct.contraindications.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Local Storage & Cloud Sync Card */}
              <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-4 sm:p-5 rounded-xl border border-blue-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                      💾
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Banco de Dados Local do Aparelho</span>
                        {savedRecordId && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Gravado
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Grave este atendimento com todos os parâmetros do fluxo no banco local para consultas, relatórios ou exportação.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={isSavingLocal}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-200 transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingLocal ? 'Salvando...' : savedRecordId ? 'Salvo no Banco Local ✅' : 'Salvar no Banco Local'}</span>
                    </button>

                    {onNavigateToDatabase && (
                      <button
                        type="button"
                        onClick={onNavigateToDatabase}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition"
                      >
                        <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Ver Banco Local</span>
                      </button>
                    )}
                  </div>
                </div>

                {saveFeedback && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    saveFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : saveFeedback.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    <div className="flex items-center gap-2 font-medium">
                      {saveFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                      <span>{saveFeedback.message}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSaveFeedback(null)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 underline"
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar (Admit to Bed, Print Card, Tourniquet, etc.) */}
            <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleResetAll}
                  className="text-xs font-bold px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition flex items-center gap-1.5"
                  title="Limpar todos os dados e iniciar novo paciente"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Limpar / Novo Paciente
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-bold px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                >
                  ← Revisar Respostas
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onOpenHydrationModal(patientWeight, classifiedResult.group, isPediatric)}
                  className="bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <Droplets className="w-4 h-4 text-[#2563EB]" />
                  Calculadora de Hidratação 💧
                </button>

                <button
                  onClick={() => {
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }) + ' às ' + now.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    onOpenCardPrint({
                      patientName: patientName || 'Paciente Não Identificado',
                      patientAge,
                      patientWeight,
                      facilityName: facilityName || '',
                      attendingProfessional: 'Profissional de Saúde / Médico / Enfermeiro',
                      evaluationDate: dateStr,
                      group: classifiedResult.group,
                      title: classifiedResult.title,
                      subtitle: classifiedResult.subtitle,
                      setting: classifiedResult.setting,
                      duration: classifiedResult.duration,
                      diseaseDay: typeof diseaseDay === 'number' ? diseaseDay : 0,
                      stage1Severity: {
                        data: severitySigns,
                        detectedList: classifiedResult.detectedSeveritySigns,
                      },
                      stage2Warning: {
                        data: warningSigns,
                        detectedList: classifiedResult.detectedWarningSigns,
                      },
                      stage3Special: {
                        data: specialConditions,
                        detectedList: classifiedResult.detectedSpecialConditions,
                      },
                      stage4Symptoms: {
                        data: symptoms,
                        isSuspected: isDengueSuspected,
                      },
                      labData: labData,
                      conduct: classifiedResult.conduct,
                      mandatoryExams: classifiedResult.mandatoryExams,
                      recommendedExams: classifiedResult.recommendedExams,
                    });
                  }}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Gerar Laudo Completo / Imprimir PDF 📄
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
