import { DengueGroup, LaboratoryEvaluation, SeveritySigns, SpecialConditions, SymptomEvaluation, WarningSigns } from '../types';

export interface FullTriagePrintData {
  patientName: string;
  patientAge: number;
  patientWeight: number;
  patientCpfOrSus?: string;
  facilityName: string;
  attendingProfessional: string;
  evaluationDate: string; // ISO or formatted string
  group: DengueGroup;
  title: string;
  subtitle: string;
  setting: string;
  duration: string;
  diseaseDay: number;

  // Answers by stage
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

  // Clinical conduct & recommendations
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
}
