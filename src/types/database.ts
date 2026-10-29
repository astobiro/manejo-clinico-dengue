import { 
  DengueGroup, 
  LaboratoryEvaluation, 
  SeveritySigns, 
  SpecialConditions, 
  SymptomEvaluation, 
  WarningSigns 
} from '../types';

export interface TourniquetSummary {
  systolicBP?: number;
  diastolicBP?: number;
  meanArterialPressure?: number;
  petechiaeCount?: number;
  isPositive?: boolean;
}

export interface HydrationSummaryData {
  totalDailyVolumeMl: number;
  oralRehydrationMl: number;
  homeFluidsMl: number;
  expansionStage1VolumeMl?: number;
  expansionStage2VolumeMl?: number;
  rapidExpansionVolume20min?: number;
  albumin5PercentVolumeMl?: number;
}

export interface ClinicalAttendanceRecord {
  id: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  
  // Patient details
  patientName: string;
  ageGroup: string; // e.g. "Criança (< 13 anos)", "Adulto (< 65 anos)", "Idoso (>= 65 anos)"
  patientAge?: number;
  patientWeight: number;
  isPediatric: boolean;
  patientGender?: 'M' | 'F' | 'Outro';
  patientCpfOrSus?: string;
  facilityName: string;
  attendingProfessional: string;
  diseaseDay: number;
  
  // Classification
  group: DengueGroup;
  title: string;
  subtitle: string;
  setting: string;
  duration: string;

  // Stages & Clinical Criteria
  stage1Severity: {
    data: SeveritySigns;
    detectedList: string[];
  };
  stage2Warning: {
    data: WarningSigns;
    detectedList: string[];
  };
  stage3Special: {
    data: SpecialConditions;
    detectedList: string[];
  };
  stage4Symptoms: {
    data: SymptomEvaluation;
    isSuspected: boolean;
  };
  labData?: LaboratoryEvaluation;
  tourniquetTest?: TourniquetSummary;

  // Conduct & Hydration
  conduct: {
    hydration: string;
    adultDetails?: string;
    childDetails?: string;
    reassessment: string;
    warnings: string[];
    medications: string[];
    contraindications: string[];
  };
  mandatoryExams: string[];
  recommendedExams: string[];
  hydrationCalc?: HydrationSummaryData;
  notes?: string;
}
