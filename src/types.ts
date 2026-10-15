export enum DengueGroup {
  GROUP_A = 'GRUPO A',
  GROUP_B = 'GRUPO B',
  GROUP_C = 'GRUPO C',
  GROUP_D = 'GRUPO D',
}

export type DiseasePhase = 'febril' | 'critica' | 'recuperacao';

export type AlertLevel = 'leve' | 'moderado' | 'alarme' | 'grave';

export interface SymptomEvaluation {
  hasFever: boolean;
  feverDays: number;
  symptoms: {
    nauseaVomiting: boolean;
    rash: boolean;
    myalgiaArthralgia: boolean;
    headacheRetroorbital: boolean;
    petechiaeOrTourniquet: boolean;
    leukopenia: boolean;
  };
  isChildAcuteFeverNoFocus: boolean;
}

export interface WarningSigns {
  intenseContinuousAbdominalPain: boolean;
  persistentVomiting: boolean;
  fluidAccumulation: boolean; // ascite, derrame pleural/pericárdico
  posturalHypotensionLipotimia: boolean;
  hepatomegalyOver2cm: boolean;
  mucosalBleeding: boolean;
  lethargyIrritability: boolean;
  progressiveHematocritIncrease: boolean;
}

export interface SeveritySigns {
  severePlasmaLeakageShock: boolean; // taquicardia, extremidades frias, pulso filiforme, TEC > 2s, PA convergente < 20mmHg
  severeBleeding: boolean;
  severeOrganImpairment: boolean; // encefalopatia, hepatite grave, miocardite
  respiratoryFailureFluidOverload: boolean;
  hypotensionCyanosisLateShock: boolean;
}

export interface SpecialConditions {
  infantUnder24Months: boolean;
  pregnant: boolean;
  elderlyOver65: boolean;
  hypertensionOrCardiovascular: boolean;
  diabetesMellitus: boolean;
  copdOrAsthma: boolean;
  obesity: boolean;
  chronicHematologicDisease: boolean;
  chronicKidneyDisease: boolean;
  pepticAcidDisease: boolean;
  hepatopathyOrAutoimmune: boolean;
  socialRiskOrOralHydrationImpossibility: boolean;
  skinBleedingSpontaneousOrInduced: boolean;
}

export interface LaboratoryEvaluation {
  hematocritTested: boolean;
  baselineHematocrit?: number;
  currentHematocrit?: number;
  plateletCount?: number;
  leukocyteCount?: number;
  albuminLevel?: number;
  astGotLevel?: number;
  altGptLevel?: number;
  hasHemoconcentration?: boolean;
}

export interface TriageResult {
  group: DengueGroup;
  title: string;
  subtitle: string;
  colorScheme: 'green' | 'blue' | 'amber' | 'red';
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  bgLight: string;
  setting: string; // Ambulatorial, Leito de Observação, Leito de Internação, Leito de UTI
  duration: string;
  mandatoryExams: string[];
  recommendedExams: string[];
  conduct: {
    hydration: string;
    adultDetails?: string;
    childDetails?: string;
    reassessment: string;
    warnings: string[];
    medications: string[];
    contraindications: string[];
  };
  detectedWarningSigns: string[];
  detectedSeveritySigns: string[];
  detectedSpecialConditions: string[];
}

export interface HydrationCalculation {
  weightKg: number;
  isPediatric: boolean;
  group: DengueGroup;
  totalDailyVolumeMl: number;
  oralRehydrationMl: number;
  homeFluidsMl: number;
  
  // Group C & D IV
  expansionStage1VolumeMl?: number;
  expansionStage1DurationHours?: number;
  expansionStage1RateMlH?: number;
  expansionStage1DropsMin?: number;
  expansionStage1MicrodropsMin?: number;

  expansionStage2VolumeMl?: number;
  expansionStage2DurationHours?: number;
  expansionStage2RateMlH?: number;
  expansionStage2DropsMin?: number;

  maintenancePhase1VolumeMl?: number;
  maintenancePhase1DurationHours?: number;
  maintenancePhase1RateMlH?: number;
  maintenancePhase1DropsMin?: number;

  maintenancePhase2VolumeMl?: number;
  maintenancePhase2DurationHours?: number;
  maintenancePhase2RateMlH?: number;
  maintenancePhase2DropsMin?: number;

  // Group D special
  rapidExpansionVolume20min?: number;
  rapidExpansionRateMlH?: number;
  albumin5PercentVolumeMl?: number;
}

export interface VitalSignLog {
  id: string;
  timestamp: string;
  systolicBP: number;
  diastolicBP: number;
  pulsePressure: number; // PAS - PAD
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  capillaryRefillSec: number; // Tempo de Enchimento Capilar
  diuresisVolumeMl: number;
  diuresisPeriodHours: number;
  diuresisRateMlKgH: number; // desejável >= 1.0 mL/kg/h
  isOliguric: boolean;
  hematocritPercent?: number;
  plateletCount?: number;
  abdominalPainScore: number; // 0 to 10
  vomitingCount: number;
  alertnessState: 'alerta' | 'irritado' | 'letargico' | 'comatoso';
  bleedingPresent: boolean;
  bleedingSites?: string;
  respiratoryDistress: boolean;
  ivInfusionRateMlH?: number;
  notes?: string;
  evaluatedBy?: string;
}

export interface DischargeCriteriaChecklist {
  hemodynamicStability48h: boolean;
  noFever24hWithoutAntipyretics: boolean;
  visibleClinicalImprovement: boolean;
  normalStableHematocrit24h: boolean;
  risingPlatelets: boolean;
  resolvedAbdominalSymptomsAndLeakage: boolean;
}

export interface MonitoredPatient {
  id: string;
  name: string;
  ageYears: number;
  ageMonths?: number;
  weightKg: number;
  gender: 'M' | 'F' | 'Outro';
  cpfOrSusCard?: string;
  bedNumber?: string;
  facilityName: string;
  attendingPhysician?: string;
  admissionDate: string; // ISO string
  diseaseStartDay: number;
  diseasePhase: DiseasePhase;
  currentGroup: DengueGroup;
  initialGroup: DengueGroup;
  baselineHematocrit?: number;
  currentExpansionStep: number; // 1, 2, 3, or maintenance 1, maintenance 2
  fluidStatus: 'expansao_1' | 'expansao_2' | 'expansao_3' | 'manutencao_1' | 'manutencao_2' | 'coloide' | 'alta_ambulatorial';
  specialConditions: string[];
  warningSignsPresent: string[];
  vitalSigns: VitalSignLog[];
  dischargeCriteria: DischargeCriteriaChecklist;
  isDischarged: boolean;
  dischargeDate?: string;
  notes?: string;
}

export interface TourniquetTestState {
  systolicBP: number;
  diastolicBP: number;
  meanArterialPressure: number;
  isPediatric: boolean;
  timerDurationSeconds: number;
  timerRemainingSeconds: number;
  isTimerRunning: boolean;
  petéquiasCount: number;
  isCompleted: boolean;
  isPositive: boolean;
}
