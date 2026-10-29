import React, { useState, useEffect } from 'react';
import { DengueGroup } from '../types';
import { FullTriagePrintData } from '../types/print';
import { 
  SEVERITY_SIGNS_LIST, 
  WARNING_SIGNS_LIST, 
  SPECIAL_CONDITIONS_LIST 
} from '../data/dengueProtocol';
import { 
  Printer, 
  X, 
  FileText, 
  AlertOctagon, 
  AlertTriangle, 
  Droplets, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  Calendar, 
  User, 
  Activity,
  Check,
  RotateCcw
} from 'lucide-react';

interface PrintableCardModalProps {
  initialData?: Partial<FullTriagePrintData> & {
    name?: string;
    age?: number;
    weight?: number;
    group?: DengueGroup;
    conduct?: any;
    warningSigns?: string[];
  };
  onClose: () => void;
  isModal?: boolean;
}

export const PrintableCardModal: React.FC<PrintableCardModalProps> = ({
  initialData,
  onClose,
  isModal = true,
}) => {
  // Current local date & time formatted
  const now = new Date();
  const defaultDateTimeStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' às ' + now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Card Mode: filled (current patient evaluation) or blank (printed template for manual pen-and-paper triage)
  const [cardMode, setCardMode] = useState<'filled' | 'blank'>('filled');
  const [blankGroupChoice, setBlankGroupChoice] = useState<'geral' | DengueGroup>('geral');

  // Dynamic live print data that mirrors the triage wizard
  const [liveData, setLiveData] = useState<Partial<FullTriagePrintData> | undefined>(initialData);

  const [patientName, setPatientName] = useState<string>(initialData?.patientName || initialData?.name || '');
  const [patientAge, setPatientAge] = useState<number>(initialData?.patientAge || initialData?.age || 35);
  const [patientWeight, setPatientWeight] = useState<number>(initialData?.patientWeight || initialData?.weight || 70);
  const [weightInputStr, setWeightInputStr] = useState<string>(() => String(initialData?.patientWeight || initialData?.weight || 70));
  const [facilityName, setFacilityName] = useState<string>(initialData?.facilityName || '');
  const [attendingProfessional, setAttendingProfessional] = useState<string>(initialData?.attendingProfessional || 'Profissional de Saúde / Médico / Enfermeiro');
  const [evaluationDateTime, setEvaluationDateTime] = useState<string>(initialData?.evaluationDate || defaultDateTimeStr);
  const [selectedGroup, setSelectedGroup] = useState<DengueGroup>(initialData?.group || DengueGroup.GROUP_A);
  const [diseaseDay, setDiseaseDay] = useState<number | ''>(initialData?.diseaseDay ? initialData.diseaseDay : '');
  const [mirrorToast, setMirrorToast] = useState<string | null>(null);

  // Sync weightInputStr with patientWeight
  useEffect(() => {
    if (patientWeight !== undefined && !isNaN(patientWeight)) {
      if (parseFloat(weightInputStr) !== patientWeight && weightInputStr !== '') {
        setWeightInputStr(String(patientWeight));
      }
    }
  }, [patientWeight]);

  // Mirror Risk Classification and parameters from active triage in localStorage
  const mirrorFromTriage = () => {
    try {
      const raw = localStorage.getItem('dengue_triage_progress_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.patientName) setPatientName(parsed.patientName);
        if (parsed.patientAge) setPatientAge(parsed.patientAge);
        if (parsed.patientWeight) {
          setPatientWeight(parsed.patientWeight);
          setWeightInputStr(String(parsed.patientWeight));
        }
        if (parsed.facilityName) setFacilityName(parsed.facilityName);
        if (parsed.diseaseDay !== undefined && parsed.diseaseDay !== '') {
          setDiseaseDay(parsed.diseaseDay);
        }
        if (parsed.classifiedResult?.group) {
          setSelectedGroup(parsed.classifiedResult.group);
          setLiveData({
            ...initialData,
            patientName: parsed.patientName || 'Paciente',
            patientAge: parsed.patientAge,
            patientWeight: parsed.patientWeight,
            facilityName: parsed.facilityName,
            diseaseDay: parsed.diseaseDay,
            group: parsed.classifiedResult.group,
            title: parsed.classifiedResult.title,
            subtitle: parsed.classifiedResult.subtitle,
            setting: parsed.classifiedResult.setting,
            duration: parsed.classifiedResult.duration,
            stage1Severity: {
              data: parsed.severitySigns,
              detectedList: parsed.classifiedResult.detectedSeveritySigns || [],
            },
            stage2Warning: {
              data: parsed.warningSigns,
              detectedList: parsed.classifiedResult.detectedWarningSigns || [],
            },
            stage3Special: {
              data: parsed.specialConditions,
              detectedList: parsed.classifiedResult.detectedSpecialConditions || [],
            },
            stage4Symptoms: {
              data: parsed.symptoms,
              isSuspected: true,
            },
            labData: parsed.labData,
            conduct: parsed.classifiedResult.conduct,
            mandatoryExams: parsed.classifiedResult.mandatoryExams,
            recommendedExams: parsed.classifiedResult.recommendedExams,
          });
          setMirrorToast(`Classificação espelhada da triagem: ${parsed.classifiedResult.group} ✅`);
        } else {
          setMirrorToast('Dados básicos carregados da triagem.');
        }
        setTimeout(() => setMirrorToast(null), 3500);
        return parsed;
      } else {
        setMirrorToast('Nenhuma triagem em andamento encontrada.');
        setTimeout(() => setMirrorToast(null), 3000);
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Auto-mirror triage classification on mount if initialData is not customized
  useEffect(() => {
    if (!initialData || !initialData.group) {
      mirrorFromTriage();
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isPediatric = patientAge < 13;
  const oralDailyVolume = isPediatric
    ? patientWeight <= 10
      ? patientWeight * 130
      : patientWeight <= 20
      ? patientWeight * 100
      : patientWeight * 80
    : patientWeight * 60;
  
  const sroVolume = Math.round(oralDailyVolume * (1 / 3));
  const liquidsVolume = Math.round(oralDailyVolume - sroVolume);

  // Group classification hierarchy for stage visibility in PDF
  const isGroupD = selectedGroup === DengueGroup.GROUP_D;
  const isGroupC = selectedGroup === DengueGroup.GROUP_C;
  const isGroupB = selectedGroup === DengueGroup.GROUP_B;

  // Group styling badges
  const groupBadgeConfig = {
    [DengueGroup.GROUP_A]: {
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-600',
      lightBg: 'bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      name: 'GRUPO A • Dengue sem Sinais de Alarme',
      level: 'Baixo Risco / Manejo Ambulatorial',
      colorHex: '#059669',
    },
    [DengueGroup.GROUP_B]: {
      bg: 'bg-sky-600',
      text: 'text-white',
      border: 'border-sky-600',
      lightBg: 'bg-sky-50',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      name: 'GRUPO B • Sangramento de Pele / Condição Especial / Comorbidade',
      level: 'Observação Necessária no Leito',
      colorHex: '#0284c7',
    },
    [DengueGroup.GROUP_C]: {
      bg: 'bg-amber-600',
      text: 'text-white',
      border: 'border-amber-600',
      lightBg: 'bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-950 border-amber-400',
      name: 'GRUPO C • Presença de Sinais de Alarme',
      level: 'Alto Risco / Internação Hospitalar',
      colorHex: '#d97706',
    },
    [DengueGroup.GROUP_D]: {
      bg: 'bg-red-600',
      text: 'text-white',
      border: 'border-red-600',
      lightBg: 'bg-red-50',
      badgeColor: 'bg-red-100 text-red-950 border-red-400',
      name: 'GRUPO D • Dengue Grave / Choque / Disfunção Orgânica',
      level: 'Emergência Médica / UTI',
      colorHex: '#dc2626',
    },
  }[selectedGroup];

  const showBlankOption = !isModal;
  const activeMode = showBlankOption ? cardMode : 'filled';
  const currentPrintData = liveData || initialData;

  return (
    <div className={`printable-modal-backdrop ${isModal ? 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto' : 'w-full flex justify-center'}`}>
      <div className={`printable-modal-card bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-4 mx-auto ${isModal ? 'max-h-[96vh]' : ''} flex flex-col`}>
        {/* Modal Top Header (No print) */}
        <div className="bg-white border-b border-slate-200 p-3 sm:p-4 flex items-center justify-between no-print flex-shrink-0 border-l-[6px] border-l-[#2563EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold shadow-xs flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cartão Oficial & Laudo de Manejo Clínico</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {activeMode === 'filled' ? 'Laudo Completo e Cartão de Acompanhamento' : 'Cartão em Branco para Preenchimento Manual'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeMode === 'filled' 
                  ? 'Classificação de risco e condutas clínicas do protocolo oficial.' 
                  : 'Modelo oficial com linhas para escrita manual à caneta no acolhimento de saúde.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
              title="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Toolbar (Only on the standalone Cartão do Paciente tab, NOT when clicked from Step 5) */}
        {showBlankOption && (
          <div className="bg-slate-100 p-3 sm:p-4 border-b border-slate-200 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Tipo do Cartão:</span>
              <div className="flex items-center bg-white rounded-xl p-1 border border-slate-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCardMode('filled')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    activeMode === 'filled'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 Cartão Preenchido (Atendimento)
                </button>
                <button
                  type="button"
                  onClick={() => setCardMode('blank')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    activeMode === 'blank'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📄 Cartão em Branco (Manual)
                </button>
              </div>
            </div>

            {mirrorToast && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {mirrorToast}
              </span>
            )}
          </div>
        )}

        {/* Blank Card Group Selector Bar (Only in blank mode on Cartão do Paciente tab, No Print) */}
        {showBlankOption && activeMode === 'blank' && (
          <div className="bg-blue-50/70 p-3 sm:p-4 border-b border-blue-200 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">
                Grupo do Cartão em Branco:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'geral', label: 'Todos os Grupos (Universal)' },
                  { id: DengueGroup.GROUP_A, label: 'Grupo A (Ambulatorial)' },
                  { id: DengueGroup.GROUP_B, label: 'Grupo B (Observação)' },
                  { id: DengueGroup.GROUP_C, label: 'Grupo C (Internação)' },
                  { id: DengueGroup.GROUP_D, label: 'Grupo D (UTI / Choque)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBlankGroupChoice(opt.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                      blankGroupChoice === opt.id
                        ? 'bg-[#2563EB] text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[11px] text-blue-800 font-medium">
              Pronto para impressão em folha A4 com linhas pontilhadas para preenchimento à caneta.
            </span>
          </div>
        )}

        {/* Input Parameters Toolbar (Only in Filled Mode, No Print) */}
        {activeMode === 'filled' && (
          <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200 no-print space-y-2.5 flex-shrink-0 text-xs">
            <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between uppercase tracking-wider">
              <span>✏️ Parâmetros do Laudo (Espelhados da Classificação):</span>
              <span className="text-[10px] text-slate-500 font-normal">Edições aqui afetam apenas o PDF impresso</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Nome do Paciente</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome do paciente"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB] text-xs font-semibold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Unidade de Saúde / Serviço</label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="Ex: UBS Central / UPA 24h"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB] text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Data / Hora</label>
                <input
                  type="text"
                  value={evaluationDateTime}
                  onChange={(e) => setEvaluationDateTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB] text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Faixa Etária</label>
                <select
                  value={
                    patientAge >= 65
                      ? 'idoso'
                      : isPediatric
                      ? 'crianca'
                      : 'adulto'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'crianca') setPatientAge(8);
                    else if (val === 'idoso') setPatientAge(70);
                    else setPatientAge(35);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB] text-xs font-medium"
                >
                  <option value="crianca">Criança (&lt; 13 anos)</option>
                  <option value="adulto">Adulto (&lt; 65 anos)</option>
                  <option value="idoso">Idoso (&gt;= 65 anos)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Peso (kg)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightInputStr}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(',', '.');
                    if (sanitized === '' || /^[0-9]*\.?[0-9]*$/.test(sanitized)) {
                      setWeightInputStr(sanitized);
                      if (sanitized !== '' && !isNaN(Number(sanitized))) {
                        setPatientWeight(parseFloat(sanitized));
                      }
                    }
                  }}
                  onBlur={() => {
                    const num = parseFloat(weightInputStr);
                    if (isNaN(num) || num <= 0) {
                      setWeightInputStr(String(patientAge < 13 ? 20 : 70));
                      setPatientWeight(patientAge < 13 ? 20 : 70);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[#2563EB] focus:outline-none focus:border-[#2563EB] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Dia de Início</label>
                <input
                  type="number"
                  value={diseaseDay}
                  onChange={(e) => setDiseaseDay(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Ex: 3"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold focus:outline-none focus:border-[#2563EB] text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Profissional Responsável</label>
                <input
                  type="text"
                  value={attendingProfessional}
                  onChange={(e) => setAttendingProfessional(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB] text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Grupo Classificado</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value as DengueGroup)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold focus:outline-none focus:border-[#2563EB] text-xs"
                >
                  <option value={DengueGroup.GROUP_A}>GRUPO A</option>
                  <option value={DengueGroup.GROUP_B}>GRUPO B</option>
                  <option value={DengueGroup.GROUP_C}>GRUPO C</option>
                  <option value={DengueGroup.GROUP_D}>GRUPO D</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PRINTABLE DOCUMENT BODY -------------------- */}

        {/* 1. BLANK PATIENT CARD FOR MANUAL FILL-IN */}
        {activeMode === 'blank' && (
          <div className="p-6 sm:p-8 overflow-y-auto bg-white flex-1 print-page space-y-4 text-slate-900 text-xs font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-2xl flex-shrink-0">
                  🦟
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase block">
                    MINISTÉRIO DA SAÚDE • SISTEMA ÚNICO DE SAÚDE (SUS)
                  </span>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase leading-tight">
                    CARTÃO DE ACOMPANHAMENTO DO PACIENTE COM DENGUE
                  </h1>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    {blankGroupChoice === 'geral'
                      ? 'FICHA CLÍNICA DE ACOLHIMENTO E MANEJO • TODOS OS GRUPOS (A, B, C e D)'
                      : blankGroupChoice === DengueGroup.GROUP_A
                      ? 'PROTOCOLO CLÍNICO ESPECÍFICO: GRUPO A • MANEJO AMBULATORIAL (UBS)'
                      : blankGroupChoice === DengueGroup.GROUP_B
                      ? 'PROTOCOLO CLÍNICO ESPECÍFICO: GRUPO B • OBSERVAÇÃO / LEITO E HEMOGRAMA'
                      : blankGroupChoice === DengueGroup.GROUP_C
                      ? 'PROTOCOLO CLÍNICO ESPECÍFICO: GRUPO C • SINAIS DE ALARME / INTERNAÇÃO (MÍN. 48H)'
                      : 'PROTOCOLO CLÍNICO ESPECÍFICO: GRUPO D • EMERGÊNCIA / UTI / CHOQUE'}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="border border-slate-800 px-3 py-1 rounded-lg text-center bg-slate-900 text-white font-black text-xs uppercase">
                  {blankGroupChoice === 'geral' ? 'MODELO GERAL' : `TEMPLATE ${blankGroupChoice}`}
                </div>
                <span className="text-[9px] text-slate-500 block mt-1 uppercase font-bold">PREENCHIMENTO MANUAL</span>
              </div>
            </div>

            {/* Bloco 1: Identificação do Paciente */}
            <div className="border border-slate-400 rounded-xl p-3 bg-slate-50/40 space-y-2">
              <div className="font-black text-[11px] text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">
                1. Identificação do Paciente e Serviço
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs">
                <div className="col-span-8 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">Nome:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                </div>
                <div className="col-span-4 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">CNS / SUS:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                </div>
                <div className="col-span-3 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">Idade:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                  <span className="text-[10px] text-slate-500 font-bold">anos</span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="font-bold">Sexo:</span>
                  <span className="inline-flex items-center gap-1 font-bold">[ &nbsp; ] M</span>
                  <span className="inline-flex items-center gap-1 font-bold">[ &nbsp; ] F</span>
                </div>
                <div className="col-span-3 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">Peso:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                  <span className="text-[10px] text-slate-500 font-bold">kg</span>
                </div>
                <div className="col-span-3 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">Telefone:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">Unidade de Saúde:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                </div>
                <div className="col-span-3 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">1º Dia Sintomas:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                </div>
                <div className="col-span-3 flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">Data Atendimento:</span>
                  <span className="flex-1 border-b border-dashed border-slate-500 min-h-[18px]"></span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Sinais Vitais no Acolhimento & Prova do Laço */}
            <div className="border border-slate-400 rounded-xl p-3 bg-slate-50/40 space-y-2">
              <div className="font-black text-[11px] text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">
                2. Sinais Vitais no Acolhimento & Prova do Laço
              </div>
              <div className="grid grid-cols-12 gap-2 text-xs">
                <div className="col-span-3 flex items-baseline gap-1">
                  <span className="font-bold">PA:</span>
                  <span className="w-10 border-b border-slate-600 text-center"></span>
                  <span>x</span>
                  <span className="w-10 border-b border-slate-600 text-center"></span>
                  <span className="text-[10px]">mmHg</span>
                </div>
                <div className="col-span-2 flex items-baseline gap-1">
                  <span className="font-bold">PAM:</span>
                  <span className="w-12 border-b border-slate-600 text-center"></span>
                  <span className="text-[10px]">mmHg</span>
                </div>
                <div className="col-span-2 flex items-baseline gap-1">
                  <span className="font-bold">FC:</span>
                  <span className="w-10 border-b border-slate-600 text-center"></span>
                  <span className="text-[10px]">bpm</span>
                </div>
                <div className="col-span-2 flex items-baseline gap-1">
                  <span className="font-bold">FR:</span>
                  <span className="w-10 border-b border-slate-600 text-center"></span>
                  <span className="text-[10px]">irpm</span>
                </div>
                <div className="col-span-3 flex items-baseline gap-1">
                  <span className="font-bold">Temp:</span>
                  <span className="w-10 border-b border-slate-600 text-center"></span>
                  <span className="text-[10px]">°C</span>
                </div>

                <div className="col-span-12 pt-1 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <span className="font-bold text-purple-900">Prova do Laço:</span>
                  <span>Resultado: [ &nbsp; ] POSITIVA &nbsp;&nbsp;&nbsp; [ &nbsp; ] NEGATIVA</span>
                  <span>Nº Petéquias no quadrado (2,5×2,5cm): ________</span>
                  <span className="text-[10px] text-slate-500 font-normal">(Positiva se ≥20 em adultos ou ≥10 em crianças)</span>
                </div>
              </div>
            </div>

            {/* Bloco 3: Triagem de Risco e Classificação */}
            <div className="border border-slate-400 rounded-xl p-3 bg-slate-50/40 space-y-2">
              <div className="font-black text-[11px] text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 flex items-center justify-between">
                <span>3. Critérios de Gravidade, Alarme e Condições Especiais</span>
                <span className="text-[10px] text-slate-500 font-normal">Assinale os achados presentes no paciente</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                {/* Sinais de Gravidade (Grupo D) */}
                <div className="border border-red-300 rounded-lg p-2 bg-red-50/40 space-y-1">
                  <span className="font-black text-red-900 block text-xs">🚨 SINAIS DE GRAVIDADE (GRUPO D)</span>
                  <div className="space-y-0.5 text-slate-800">
                    <div>[ &nbsp; ] Choque (pulso fino, TEC &gt; 2s, extremidades frias)</div>
                    <div>[ &nbsp; ] Sangramento grave (digestivo, hematêmese)</div>
                    <div>[ &nbsp; ] Desconforto respiratório / Derrame pleural</div>
                    <div>[ &nbsp; ] Disfunção de órgãos (AST/ALT &gt; 1000, miocardite)</div>
                  </div>
                </div>

                {/* Sinais de Alarme (Grupo C) */}
                <div className="border border-amber-300 rounded-lg p-2 bg-amber-50/40 space-y-1">
                  <span className="font-black text-amber-900 block text-xs">⚠️ SINAIS DE ALARME (GRUPO C)</span>
                  <div className="space-y-0.5 text-slate-800">
                    <div>[ &nbsp; ] Dor abdominal intensa e contínua</div>
                    <div>[ &nbsp; ] Vômitos persistentes</div>
                    <div>[ &nbsp; ] Acúmulo de líquidos (ascite, derrame)</div>
                    <div>[ &nbsp; ] Hipotensão postural / Lipotimia / Tontura</div>
                    <div>[ &nbsp; ] Hepatomegalia dolorosa &gt; 2 cm</div>
                    <div>[ &nbsp; ] Sangramento de mucosas (gengiva, nariz)</div>
                    <div>[ &nbsp; ] Letargia / Irritabilidade / Sonolência</div>
                    <div>[ &nbsp; ] Aumento progressivo do Hematócrito</div>
                  </div>
                </div>

                {/* Condições Especiais (Grupo B) */}
                <div className="border border-sky-300 rounded-lg p-2 bg-sky-50/40 space-y-1">
                  <span className="font-black text-sky-900 block text-xs">👥 CONDIÇÕES ESPECIAIS (GRUPO B)</span>
                  <div className="space-y-0.5 text-slate-800">
                    <div>[ &nbsp; ] Prova do Laço POSITIVA ou Petéquias</div>
                    <div>[ &nbsp; ] Idoso (≥ 65 anos)</div>
                    <div>[ &nbsp; ] Lactente (&lt; 2 anos) / Criança</div>
                    <div>[ &nbsp; ] Gestante</div>
                    <div>[ &nbsp; ] Hipertensão / Diabetes / Obesidade</div>
                    <div>[ &nbsp; ] Cardiopata / Doença Renal Crônica</div>
                    <div>[ &nbsp; ] Risco social ou isolamento familiar</div>
                  </div>
                </div>
              </div>

              {/* Classificação Definida */}
              <div className="pt-2 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-xs uppercase text-slate-900">CLASSIFICAÇÃO ATRIBUÍDA:</span>
                <div className="flex flex-wrap items-center gap-3 font-bold text-xs">
                  <span className="px-2.5 py-1 rounded border border-emerald-600 bg-emerald-50 text-emerald-900">
                    [ &nbsp; ] GRUPO A (Ambulatório)
                  </span>
                  <span className="px-2.5 py-1 rounded border border-sky-600 bg-sky-50 text-sky-900">
                    [ &nbsp; ] GRUPO B (Observação)
                  </span>
                  <span className="px-2.5 py-1 rounded border border-amber-600 bg-amber-50 text-amber-950">
                    [ &nbsp; ] GRUPO C (Internação)
                  </span>
                  <span className="px-2.5 py-1 rounded border border-red-600 bg-red-50 text-red-950">
                    [ &nbsp; ] GRUPO D (UTI / Choque)
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 4: Conduta de Hidratação e Prescrição */}
            <div className="border border-slate-400 rounded-xl p-3 bg-slate-50/40 space-y-2">
              <div className="font-black text-[11px] text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">
                4. Conduta Clínica e Prescrição de Reidratação ({
                  blankGroupChoice === 'geral' ? 'Diretrizes Gerais' : `Específica para ${blankGroupChoice}`
                })
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-300 rounded-lg p-2.5 bg-white space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs">💧 Plano de Hidratação:</span>
                  {blankGroupChoice === DengueGroup.GROUP_C ? (
                    <p className="text-slate-700 leading-snug">
                      • <strong>Fase de Expansão Rápida:</strong> Iniciar imediatamente <strong>10 mL/kg/h</strong> de SF 0,9% ou Ringer Lactato nas primeiras 2 horas: <strong>__________ mL/h</strong>.<br />
                      • Reavaliar clinicamente a cada 1 hora e hematócrito após 2 horas.<br />
                      • Internação obrigatória por no mínimo 48 horas.
                    </p>
                  ) : blankGroupChoice === DengueGroup.GROUP_D ? (
                    <p className="text-slate-700 leading-snug">
                      • <strong>Ressuscitação no Choque:</strong> Administrar <strong>20 mL/kg</strong> de SF 0,9% ou RL em até 20 minutos: <strong>__________ mL</strong>.<br />
                      • Repetir até 3 vezes se necessário.<br />
                      • Se refratário: Albumina 5% ou coloides a 10 mL/kg/h e transferir com urgência para UTI.
                    </p>
                  ) : blankGroupChoice === DengueGroup.GROUP_B ? (
                    <p className="text-slate-700 leading-snug">
                      • <strong>Reidratação Oral no Leito:</strong> Permanecer em observação até o resultado do Hemograma.<br />
                      • Volume supervisionado no leito: <strong>__________ mL</strong> em 4 horas.<br />
                      • Se Ht normal: alta com plano Grupo A. Se Ht elevado: transferir para Grupo C.
                    </p>
                  ) : (
                    <p className="text-slate-700 leading-snug">
                      • <strong>Volume Total Diário Calculado:</strong> ________________ mL / 24 horas.<br />
                      • <strong>1/3 Sais de Reidratação Oral (SRO):</strong> ________________ mL.<br />
                      • <strong>2/3 Líquidos Caseiros (água, sucos, chás):</strong> ________________ mL.<br />
                      • Adultos: 60 mL/kg/dia | Crianças: 80 a 130 mL/kg/dia.
                    </p>
                  )}
                </div>

                <div className="border border-slate-300 rounded-lg p-2.5 bg-white space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs">💊 Medicações e Cuidados:</span>
                  <p className="text-slate-700 text-[11px] leading-snug">
                    • <strong>Permitidos:</strong> Dipirona (500 a 1000mg 6/6h) ou Paracetamol (500 a 750mg 6/6h).<br />
                    • <strong>🚫 PROIBIDOS:</strong> AAS, Ibuprofeno, Diclofenaco, Cetoprofeno, Nimesulida, Corticoides e Injeções Intramusculares (risco de sangramento fatal e hemorragias).<br />
                    • Repouso absoluto e retorno imediato se surgirem sinais de alarme.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloco 5: Tabela de Evolução Diária e Retornos */}
            <div className="border border-slate-400 rounded-xl p-3 bg-slate-50/40 space-y-1.5">
              <div className="font-black text-[11px] text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 flex items-center justify-between">
                <span>5. Acompanhamento Diário e Retornos Programados (Evolução Clínica)</span>
                <span className="text-[10px] text-slate-500 font-normal">Retorno obrigatório no dia da queda da febre</span>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold text-center">
                    <th className="border border-slate-300 p-1 w-20">Data</th>
                    <th className="border border-slate-300 p-1 w-16">Dia Sint.</th>
                    <th className="border border-slate-300 p-1 w-24">PA / FC</th>
                    <th className="border border-slate-300 p-1 w-16">Tax (°C)</th>
                    <th className="border border-slate-300 p-1 w-18">Ht (%)</th>
                    <th className="border border-slate-300 p-1 w-20">Plaquetas</th>
                    <th className="border border-slate-300 p-1">Sinais de Alarme / Diurese</th>
                    <th className="border border-slate-300 p-1 w-32">Assinatura / Carimbo</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row} className="h-8">
                      <td className="border border-slate-300 p-1 text-center"></td>
                      <td className="border border-slate-300 p-1 text-center"></td>
                      <td className="border border-slate-300 p-1 text-center"></td>
                      <td className="border border-slate-300 p-1 text-center"></td>
                      <td className="border border-slate-300 p-1 text-center"></td>
                      <td className="border border-slate-300 p-1 text-center"></td>
                      <td className="border border-slate-300 p-1"></td>
                      <td className="border border-slate-300 p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bloco 6: Assinatura do Profissional Responsável */}
            <div className="pt-3 border-t border-slate-400 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="pt-2">
                <div className="border-b border-slate-500 min-h-[22px]"></div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mt-1">
                  Assinatura e Carimbo do Profissional de Saúde
                </span>
              </div>
              <div className="pt-2">
                <div className="border-b border-slate-500 min-h-[22px]"></div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mt-1">
                  Assinatura do Paciente ou Responsável Legal
                </span>
              </div>
            </div>

            {/* Footer notice */}
            <div className="pt-1 text-[9px] text-slate-400 text-center flex items-center justify-between border-t border-slate-200">
              <span>Sistema Único de Saúde (SUS) • Notificação Compulsória SINAN</span>
              <span>6ª Edição Revisada do Manual de Manejo Clínico de Dengue</span>
            </div>
          </div>
        )}

        {/* 2. FILLED PATIENT CARD (MIRRORED FROM TRIAGE EVALUATION) */}
        {activeMode === 'filled' && (
          <div className="p-6 sm:p-8 overflow-y-auto bg-white flex-1 print-page space-y-5 text-slate-800">
            {/* 1. INSTITUTIONAL HEADER */}
            <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-2xs flex-shrink-0">
                  🦟
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase block">
                    PROTOCOLO CLÍNICO DE MANEJO DA DENGUE
                  </span>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight uppercase">
                    CLASSIFICAÇÃO DE RISCO E MANEJO CLÍNICO DE DENGUE
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Diretrizes de Manejo Clínico e Vigilância Epidemiológica • 6ª Edição Revisada
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 flex-shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black text-xs uppercase tracking-wide bg-slate-900 text-white">
                  <span>DOCUMENTO CLÍNICO</span>
                </div>
              </div>
            </div>

            {/* 2. PATIENT, SERVICE & DATE IDENTIFICATION BLOCK */}
            <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3.5 print:p-2.5 border border-slate-300 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-4 gap-2.5 print:gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Paciente:
                </span>
                <strong className="text-slate-900 text-sm font-black">{patientName || 'Não identificado'}</strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" /> Unidade de Saúde / Serviço:
                </span>
                <strong className="text-slate-800 text-xs block truncate">{facilityName || 'Não informada'}</strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Data / Hora do Atendimento:
                </span>
                <strong className="text-slate-800 text-xs">{evaluationDateTime}</strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Faixa Etária:</span>
                <strong className="text-slate-800 text-xs">
                  {patientAge >= 65 ? 'Idoso (>= 65 anos)' : isPediatric ? 'Criança (< 13 anos)' : 'Adulto (< 65 anos)'}
                </strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Peso Informado:</span>
                <strong className="text-slate-900 text-xs font-bold font-mono">{patientWeight} kg</strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Tempo de Doença / Início:</span>
                <strong className="text-slate-800 text-xs">
                  {diseaseDay ? `${diseaseDay}º dia de febre / sintomas` : 'Não informado'}
                </strong>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Profissional Responsável:</span>
                <strong className="text-slate-800 text-xs truncate block">{attendingProfessional || 'Não informado'}</strong>
              </div>
            </div>

            {/* 3. CLASSIFICATION RESULT BANNER (Compact & Horizontal) */}
            <div className={`p-2.5 sm:p-3 print:p-2 rounded-xl border-2 ${groupBadgeConfig.border} ${groupBadgeConfig.lightBg}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`px-2.5 py-1 rounded-lg font-black text-xs sm:text-sm print:text-xs uppercase tracking-wider ${groupBadgeConfig.bg} ${groupBadgeConfig.text} shadow-xs flex-shrink-0`}>
                    {selectedGroup}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm print:text-xs font-black text-slate-900 uppercase truncate">
                      {currentPrintData?.title || groupBadgeConfig.name}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] print:text-[10px] text-slate-600 font-medium truncate">
                      {currentPrintData?.subtitle || 'Classificação clínica baseada no protocolo oficial de dengue'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 border-l border-slate-300/80 pl-3">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Local de Manejo:</span>
                  <span className="text-[11px] sm:text-xs print:text-[11px] font-black text-slate-900 block whitespace-nowrap">
                    {currentPrintData?.setting || (
                      selectedGroup === DengueGroup.GROUP_A ? 'Ambulatorial (UBS)' :
                      selectedGroup === DengueGroup.GROUP_B ? 'Leito de Observação' :
                      selectedGroup === DengueGroup.GROUP_C ? 'Internação (mín. 48h)' :
                      'UTI / Emergência'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. RESPONSES PROVIDED SEPARATED BY STAGE */}
            <div className="space-y-2.5 print:space-y-2">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <span>📋</span> Respostas da Avaliação Clínica Estruturada ({
                  isGroupD ? 'Etapa 1 - Grupo D Definido' :
                  isGroupC ? 'Etapas 1 e 2 - Grupo C Definido' :
                  isGroupB ? 'Etapas 1, 2 e 3 - Grupo B Definido' :
                  'Etapas 1 a 4 - Grupo A'
                })
              </h3>

              <div className={`grid gap-2.5 print:gap-2 text-xs ${
                isGroupD 
                  ? 'grid-cols-1' 
                  : isGroupC 
                  ? 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2' 
                  : 'grid-cols-1 sm:grid-cols-3 print:grid-cols-3'
              }`}>
                
                {/* ETAPA 1: SINAIS DE GRAVIDADE (GRUPO D) */}
                <div className={`p-2.5 sm:p-3 print:p-2 rounded-xl border ${
                  currentPrintData?.stage1Severity?.detectedList && currentPrintData.stage1Severity.detectedList.length > 0
                    ? 'bg-red-50/80 border-red-300 text-red-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                    <span className="font-black text-[11px] uppercase flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                      Etapa 1 • Sinais de Gravidade
                    </span>
                    <span className="text-[10px] font-bold">
                      {currentPrintData?.stage1Severity?.detectedList && currentPrintData.stage1Severity.detectedList.length > 0
                        ? `${currentPrintData.stage1Severity.detectedList.length} presente(s)`
                        : 'Nenhum sinal'}
                    </span>
                  </div>

                  {currentPrintData?.stage1Severity?.detectedList && currentPrintData.stage1Severity.detectedList.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] font-bold text-red-900">
                      {currentPrintData.stage1Severity.detectedList.map((sig, i) => (
                        <li key={i}>{sig}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Ausência de choque, desconforto respiratório grave, hemorragia volumosa ou disfunção orgânica.
                    </p>
                  )}
                </div>

                {/* ETAPA 2: SINAIS DE ALARME (GRUPO C) */}
                {!isGroupD && (
                  <div className={`p-2.5 sm:p-3 print:p-2 rounded-xl border ${
                    currentPrintData?.stage2Warning?.detectedList && currentPrintData.stage2Warning.detectedList.length > 0
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                      <span className="font-black text-[11px] uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Etapa 2 • Sinais de Alarme
                      </span>
                      <span className="text-[10px] font-bold">
                        {currentPrintData?.stage2Warning?.detectedList && currentPrintData.stage2Warning.detectedList.length > 0
                          ? `${currentPrintData.stage2Warning.detectedList.length} presente(s)`
                          : 'Nenhum alarme'}
                      </span>
                    </div>

                    {currentPrintData?.stage2Warning?.detectedList && currentPrintData.stage2Warning.detectedList.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] font-bold text-amber-900">
                        {currentPrintData.stage2Warning.detectedList.map((sig, i) => (
                          <li key={i}>{sig}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Ausência de dor abdominal contínua, vômitos frequentes, lipotimia, sangramento mucoso ou hipotensão.
                      </p>
                    )}
                  </div>
                )}

                {/* ETAPA 3: CONDIÇÕES ESPECIAIS & SANGRAMENTO PELE (GRUPO B) */}
                {!isGroupD && !isGroupC && (
                  <div className={`p-2.5 sm:p-3 print:p-2 rounded-xl border ${
                    currentPrintData?.stage3Special?.detectedList && currentPrintData.stage3Special.detectedList.length > 0
                      ? 'bg-sky-50/80 border-sky-300 text-sky-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                      <span className="font-black text-[11px] uppercase flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-sky-600" />
                        Etapa 3 • Condições Especiais
                      </span>
                      <span className="text-[10px] font-bold">
                        {currentPrintData?.stage3Special?.detectedList && currentPrintData.stage3Special.detectedList.length > 0
                          ? `${currentPrintData.stage3Special.detectedList.length} presente(s)`
                          : 'Nenhuma condição'}
                      </span>
                    </div>

                    {currentPrintData?.stage3Special?.detectedList && currentPrintData.stage3Special.detectedList.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] font-bold text-sky-900">
                        {currentPrintData.stage3Special.detectedList.map((sig, i) => (
                          <li key={i}>{sig}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Ausência de comorbidades descompensadas, gestação, extremos de idade ou sangramento de pele.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 5. CONDUCT & HYDRATION REGIMEN */}
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/60 space-y-3 text-xs">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#2563EB]" />
                Conduta Clínica e Prescrição de Hidratação
              </h3>

              {/* Group Specific Regimen */}
              {selectedGroup === DengueGroup.GROUP_A || selectedGroup === DengueGroup.GROUP_B ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-2.5 print:gap-2">
                  <div className="bg-white p-2.5 sm:p-3 print:p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] print:text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Volume Diário Recomendado
                    </span>
                    <strong className="text-sm sm:text-base print:text-sm text-slate-900 block font-black">
                      {oralDailyVolume.toLocaleString('pt-BR')} mL / dia
                    </strong>
                    <span className="text-[9px] sm:text-[10px] print:text-[9px] text-slate-500 block leading-tight">
                      {isPediatric ? 'Regra pediátrica oficial' : '60 mL/kg/dia para adultos'}
                    </span>
                  </div>

                  <div className="bg-emerald-50/70 p-2.5 sm:p-3 print:p-2 rounded-lg border border-emerald-200 space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] print:text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                      1/3 Sais Reidratação (SRO)
                    </span>
                    <strong className="text-sm sm:text-base print:text-sm text-emerald-950 block font-black">
                      {sroVolume.toLocaleString('pt-BR')} mL / dia
                    </strong>
                    <span className="text-[9px] sm:text-[10px] print:text-[9px] text-emerald-700 block leading-tight">
                      Maior frequência nas primeiras horas
                    </span>
                  </div>

                  <div className="bg-blue-50/70 p-2.5 sm:p-3 print:p-2 rounded-lg border border-blue-200 space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] print:text-[9px] font-bold text-blue-800 uppercase tracking-wider block">
                      2/3 Líquidos Caseiros
                    </span>
                    <strong className="text-sm sm:text-base print:text-sm text-blue-950 block font-black">
                      {liquidsVolume.toLocaleString('pt-BR')} mL / dia
                    </strong>
                    <span className="text-[9px] sm:text-[10px] print:text-[9px] text-blue-700 block leading-tight">
                      Água, água de coco, sucos e chás
                    </span>
                  </div>
                </div>
              ) : selectedGroup === DengueGroup.GROUP_C ? (
                <div className="bg-white p-3 rounded-lg border border-amber-300 text-xs space-y-1 text-amber-950">
                  <strong className="block text-amber-900 uppercase font-black">
                    Fase de Expansão Rápida Imediata (Grupo C):
                  </strong>
                  <p>
                    • <strong>Volume:</strong> 10 mL/kg/hora de Soro Fisiológico 0,9% ou Ringer Lactato nas primeiras 2 horas ({patientWeight * 10} mL/h).
                  </p>
                  <p>
                    • <strong>Reavaliação:</strong> Clínica a cada 1 hora e hematócrito após 2 horas. Se melhora, prosseguir para manutenção. Se refratário, repetir expansão ou conduzir como Grupo D.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-red-400 text-xs space-y-1 text-red-950">
                  <strong className="block text-red-900 uppercase font-black">
                    Ressuscitação Volêmica Imediata no Choque (Grupo D):
                  </strong>
                  <p>
                    • <strong>Fase de Choque:</strong> 20 mL/kg de SF 0,9% ou Ringer Lactato em até 20 minutos ({patientWeight * 20} mL). Repetir até 3 vezes se necessário.
                  </p>
                  <p>
                    • <strong>Encaminhamento:</strong> Leito de Terapia Intensiva (UTI) com monitorização invasiva e acesso vascular calibroso.
                  </p>
                </div>
              )}

              {/* Reassessment & Specific Warnings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2.5 print:gap-2 pt-1 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    📅 Reavaliação e Retorno Programado:
                  </span>
                  <p className="text-[11px] text-slate-800">
                    {currentPrintData?.conduct?.reassessment || (
                      selectedGroup === DengueGroup.GROUP_A
                        ? 'Retorno obrigatório no dia da queda da febre (início da fase crítica, 3º ao 6º dia). Retorno IMEDIATO se surgir qualquer sinal de alarme.'
                        : selectedGroup === DengueGroup.GROUP_B
                        ? 'Permanecer em observação até o resultado do Hemograma completo. Se Ht normal, alta com retorno diário.'
                        : 'Internação obrigatória por no mínimo 48 horas sob monitorização contínua de sinais vitais e hematócrito seriado.'
                    )}
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    🧪 Exames Laboratoriais Recomendados:
                  </span>
                  <ul className="text-[11px] text-slate-800 list-disc list-inside space-y-0.5">
                    {(currentPrintData?.mandatoryExams || [
                      selectedGroup === DengueGroup.GROUP_A ? 'Exames a critério médico (sorologia/RT-PCR para vigilância)' : 'Hemograma completo com plaquetas obrigatório',
                    ]).slice(0, 3).map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 6. WARNING SIGNS & CONTRAINDICATIONS ALERT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2.5 print:gap-2 text-xs">
              <div className="border border-amber-300 bg-amber-50 p-2.5 sm:p-3 print:p-2.5 rounded-xl space-y-1 text-amber-950">
                <div className="flex items-center gap-1.5 font-black uppercase text-[11px] text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Sinais de Alarme (Retorno Imediato ao Serviço):</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold text-amber-950 pt-0.5">
                  <div>• Dor abdominal intensa e contínua</div>
                  <div>• Vômitos persistentes</div>
                  <div>• Tontura / desmaio ao levantar</div>
                  <div>• Sangramento de mucosas</div>
                  <div>• Letargia ou irritabilidade</div>
                  <div>• Diminuição da diurese</div>
                </div>
              </div>

              <div className="border border-red-300 bg-red-50 p-2.5 sm:p-3 print:p-2.5 rounded-xl space-y-1 text-red-950">
                <div className="flex items-center gap-1.5 font-black uppercase text-[11px] text-red-900">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Contraindicações Absolutas na Dengue:</span>
                </div>
                <p className="text-[10px] font-semibold leading-relaxed">
                  <strong>PROIBIDOS:</strong> AAS (Aspirina), Ibuprofeno, Cetoprofeno, Diclofenaco, Nimesulida, Corticosteroides e Injeções Intramusculares (alto risco de hemorragias graves e insuficiência hepática).
                </p>
              </div>
            </div>

            {/* 7. SIGNATURES AND VALIDATION FOOTER */}
            <div className="pt-3 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="pt-2">
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {attendingProfessional || 'Profissional Responsável'}
                </div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-0.5">
                  Assinatura / Carimbo do Profissional Responsável
                </span>
              </div>

              <div className="pt-2">
                <div className="border-b border-slate-400 pb-1 font-bold text-slate-800">
                  {patientName || 'Paciente / Responsável Legal'}
                </div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-0.5">
                  Assinatura do Paciente ou Responsável Legal
                </span>
              </div>
            </div>

            {/* Institutional sub-footer & Legal Notice */}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-center">
              <p className="text-[10px] text-slate-600 font-medium italic">
                Aviso: Este documento é baseado nas informações fornecidas pelo paciente ou responsável e serve como orientação geral. Não substitui avaliação clínica presencial.
              </p>
              <div className="text-[9px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Sistema Informatizado de Apoio ao Manejo Clínico de Dengue • Notificação Compulsória SINAN</span>
                <span className="font-mono">{evaluationDateTime}</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
