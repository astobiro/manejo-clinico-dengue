import React, { useState } from 'react';
import { DengueGroup } from '../types';
import { FullTriagePrintData } from '../types/print';
import { SEVERITY_SIGNS_LIST, WARNING_SIGNS_LIST, SPECIAL_CONDITIONS_LIST, SUSPECTED_DENGUE_DEFINITION } from '../data/dengueProtocol';
import { Printer, X, FileText, AlertOctagon, AlertTriangle, Droplets, CheckCircle2, ShieldAlert, HeartPulse, Building2, Calendar, User, Stethoscope } from 'lucide-react';

interface PrintableCardModalProps {
  initialData?: Partial<FullTriagePrintData> & {
    name?: string;
    age?: number;
    weight?: number;
    group?: DengueGroup;
    conduct?: string;
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

  const [patientName, setPatientName] = useState<string>(initialData?.patientName || initialData?.name || '');
  const [patientAge, setPatientAge] = useState<number>(initialData?.patientAge || initialData?.age || 35);
  const [patientWeight, setPatientWeight] = useState<number>(initialData?.patientWeight || initialData?.weight || 70);
  const [facilityName, setFacilityName] = useState<string>(initialData?.facilityName || '');
  const [attendingProfessional, setAttendingProfessional] = useState<string>(initialData?.attendingProfessional || 'Profissional de Saúde / Médico / Enfermeiro');
  const [evaluationDateTime, setEvaluationDateTime] = useState<string>(initialData?.evaluationDate || defaultDateTimeStr);
  const [selectedGroup, setSelectedGroup] = useState<DengueGroup>(initialData?.group || DengueGroup.GROUP_A);
  const [diseaseDay, setDiseaseDay] = useState<number | ''>(initialData?.diseaseDay ? initialData.diseaseDay : '');

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
  const isGroupA = selectedGroup === DengueGroup.GROUP_A;

  // Group styling badges
  const groupBadgeConfig = {
    [DengueGroup.GROUP_A]: {
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-600',
      lightBg: 'bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      name: 'GRUPO A • Dengue Clássica / Manejo Ambulatorial',
      level: 'Baixo Risco',
      colorHex: '#059669',
    },
    [DengueGroup.GROUP_B]: {
      bg: 'bg-sky-600',
      text: 'text-white',
      border: 'border-sky-600',
      lightBg: 'bg-sky-50',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      name: 'GRUPO B • Sangramento de Pele / Condição Especial / Comorbidade',
      level: 'Observação Necessária',
      colorHex: '#0284c7',
    },
    [DengueGroup.GROUP_C]: {
      bg: 'bg-amber-600',
      text: 'text-white',
      border: 'border-amber-600',
      lightBg: 'bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-950 border-amber-400',
      name: 'GRUPO C • Sinais de Alarme (Extravasamento Plasmático)',
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relatório Completo de Atendimento & Classificação</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Laudo de Classificação de Risco e Manejo Clínico de Dengue
              </h3>
              <p className="text-xs text-slate-500">
                Documento formatado para Impressão / PDF com etapas avaliadas, conduta médica e identificação.
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

        {/* Input Parameters Toolbar (No Print) */}
        <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200 no-print space-y-2.5 flex-shrink-0 text-xs">
          <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <span>✏️</span> Editar Dados de Cabeçalho da Impressão:
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
                type="number"
                value={patientWeight}
                onChange={(e) => setPatientWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[#2563EB] focus:outline-none focus:border-[#2563EB] text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Dia de Início / Sintomas</label>
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

        {/* PRINTABLE COMPREHENSIVE DOCUMENT BODY */}
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
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-300 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
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
              <strong className="text-slate-900 text-xs font-bold">{patientWeight} kg</strong>
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

          {/* 3. CLASSIFICATION RESULT BANNER */}
          <div className={`p-4 rounded-xl border-2 ${groupBadgeConfig.border} ${groupBadgeConfig.lightBg} space-y-1.5`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 rounded-lg font-black text-sm uppercase tracking-wider ${groupBadgeConfig.bg} ${groupBadgeConfig.text} shadow-xs`}>
                  {selectedGroup}
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase">
                    {initialData?.title || groupBadgeConfig.name}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {initialData?.subtitle || 'Classificação clínica baseada no protocolo de manejo de dengue'}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Local de Manejo:</span>
                <span className="text-xs font-black text-slate-800 block">
                  {initialData?.setting || (
                    selectedGroup === DengueGroup.GROUP_A ? 'Ambulatorial (UBS)' :
                    selectedGroup === DengueGroup.GROUP_B ? 'Leito de Observação (até hemograma)' :
                    selectedGroup === DengueGroup.GROUP_C ? 'Internação Hospitalar (mín. 48h)' :
                    'UTI / Emergência Imediata'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 4. RESPONSES PROVIDED SEPARATED BY STAGE (Hides subsequent steps once group is determined) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <span>📋</span> Respostas da Avaliação Clínica Estruturada ({
                isGroupD ? 'Etapa 1 - Grupo D Definido' :
                isGroupC ? 'Etapas 1 e 2 - Grupo C Definido' :
                isGroupB ? 'Etapas 1, 2 e 3 - Grupo B Definido' :
                'Etapas 1 a 4 - Grupo A'
              })
            </h3>

            <div className={`grid gap-3 text-xs ${
              isGroupD ? 'grid-cols-1' :
              isGroupC ? 'grid-cols-1 md:grid-cols-2' :
              isGroupB ? 'grid-cols-1 md:grid-cols-3' :
              'grid-cols-1 md:grid-cols-2'
            }`}>
              
              {/* ETAPA 1: SINAIS DE GRAVIDADE (GRUPO D) */}
              <div className={`p-3 rounded-xl border ${
                initialData?.stage1Severity?.detectedList && initialData.stage1Severity.detectedList.length > 0
                  ? 'bg-red-50/80 border-red-300 text-red-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-sm">🚨</span>
                    <span className="uppercase text-[11px] font-black">Etapa 1: Sinais de Gravidade e Choque (Grupo D)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase ${
                    initialData?.stage1Severity?.detectedList && initialData.stage1Severity.detectedList.length > 0
                      ? 'bg-red-200 text-red-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {initialData?.stage1Severity?.detectedList && initialData.stage1Severity.detectedList.length > 0 ? 'POSITIVO' : 'NEGATIVO'}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {initialData?.stage1Severity?.data ? (
                    <div className="space-y-1 text-[11px]">
                      {SEVERITY_SIGNS_LIST.map((item) => {
                        const isChecked = initialData.stage1Severity?.data[item.id];
                        return (
                          <div key={item.id} className="flex items-start gap-1.5">
                            <span className={isChecked ? 'text-red-600 font-bold' : 'text-slate-400'}>
                              {isChecked ? '☒' : '☐'}
                            </span>
                            <span className={isChecked ? 'font-bold text-red-900' : 'text-slate-600'}>
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      {selectedGroup === DengueGroup.GROUP_D
                        ? 'Sinais de gravidade / choque identificados na triagem emergencial.'
                        : 'Nenhum sinal de gravidade ou choque constatado na avaliação inicial.'}
                    </p>
                  )}
                </div>
              </div>

              {/* ETAPA 2: SINAIS DE ALARME (GRUPO C) - Only shown if not Group D */}
              {!isGroupD && (
                <div className={`p-3 rounded-xl border ${
                  initialData?.stage2Warning?.detectedList && initialData.stage2Warning.detectedList.length > 0
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-sm">⚠️</span>
                      <span className="uppercase text-[11px] font-black">Etapa 2: Sinais de Alarme (Grupo C)</span>
                    </div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase ${
                      initialData?.stage2Warning?.detectedList && initialData.stage2Warning.detectedList.length > 0
                        ? 'bg-amber-200 text-amber-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {initialData?.stage2Warning?.detectedList && initialData.stage2Warning.detectedList.length > 0 ? 'POSITIVO' : 'NEGATIVO'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    {initialData?.stage2Warning?.data ? (
                      <div className="grid grid-cols-1 gap-1 text-[11px]">
                        {WARNING_SIGNS_LIST.map((item) => {
                          const isChecked = initialData.stage2Warning?.data[item.id];
                          return (
                            <div key={item.id} className="flex items-start gap-1.5">
                              <span className={isChecked ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                                {isChecked ? '☒' : '☐'}
                              </span>
                              <span className={isChecked ? 'font-bold text-amber-950' : 'text-slate-600'}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        {selectedGroup === DengueGroup.GROUP_C
                          ? 'Presença de sinais de alarme / extravasamento plasmático.'
                          : 'Ausência de sinais de alarme na avaliação.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA 3: CONDIÇÕES ESPECIAIS & SANGRAMENTO (GRUPO B) - Only shown if Group B or Group A */}
              {!isGroupD && !isGroupC && (
                <div className={`p-3 rounded-xl border ${
                  initialData?.stage3Special?.detectedList && initialData.stage3Special.detectedList.length > 0
                    ? 'bg-sky-50/80 border-sky-300 text-sky-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-sm">🩸</span>
                      <span className="uppercase text-[11px] font-black">Etapa 3: Condições Especiais, Comorbidades & Laço (Grupo B)</span>
                    </div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase ${
                      initialData?.stage3Special?.detectedList && initialData.stage3Special.detectedList.length > 0
                        ? 'bg-sky-200 text-sky-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {initialData?.stage3Special?.detectedList && initialData.stage3Special.detectedList.length > 0 ? 'POSITIVO' : 'NEGATIVO'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    {initialData?.stage3Special?.data ? (
                      <div className="grid grid-cols-1 gap-1 text-[11px]">
                        {SPECIAL_CONDITIONS_LIST.map((item) => {
                          const isChecked = initialData.stage3Special?.data[item.id];
                          return (
                            <div key={item.id} className="flex items-start gap-1.5">
                              <span className={isChecked ? 'text-sky-700 font-bold' : 'text-slate-400'}>
                                {isChecked ? '☒' : '☐'}
                              </span>
                              <span className={isChecked ? 'font-bold text-sky-950' : 'text-slate-600'}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        {selectedGroup === DengueGroup.GROUP_B
                          ? 'Paciente com comorbidades, extremos de idade ou sangramento de pele.'
                          : 'Sem comorbidades descompensadas ou extremos de idade indicados.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA 4: SUSPEITA CLÍNICA & SINTOMAS (GRUPO A) - Only shown if Group A */}
              {isGroupA && (
                <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-sm">🦟</span>
                      <span className="uppercase text-[11px] font-black">Etapa 4: Definição de Caso Suspeito & Sintomas</span>
                    </div>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase bg-blue-100 text-blue-900">
                      {initialData?.stage4Symptoms?.isSuspected !== false ? 'CONFIRMADO' : 'INCOMPLETO'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    {initialData?.stage4Symptoms?.data ? (
                      <div className="grid grid-cols-1 gap-1 text-[11px]">
                        <div className="flex items-start gap-1.5 font-semibold text-slate-800">
                          <span>{initialData.stage4Symptoms.data.hasFever ? '☒' : '☐'}</span>
                          <span>Febre com início súbito ({initialData.stage4Symptoms.data.feverDays} dias de duração)</span>
                        </div>
                        {SUSPECTED_DENGUE_DEFINITION.symptomsList.map((item) => {
                          const isChecked = (initialData.stage4Symptoms?.data.symptoms as any)?.[item.id];
                          return (
                            <div key={item.id} className="flex items-start gap-1.5">
                              <span className={isChecked ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                                {isChecked ? '☒' : '☐'}
                              </span>
                              <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-600'}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Quadro febril agudo com manifestações clínicas compatíveis com dengue.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 5. CONDUCT, HYDRATION PRESCRIPTION & MANAGEMENT RECOMMENDATIONS */}
          <div className="border border-blue-300 bg-blue-50/50 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-black text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-200 pb-1.5">
              <Droplets className="w-4 h-4" /> Conduta Terapêutica e Prescrição de Hidratação ({selectedGroup})
            </h3>

            {/* Hydration details for Group A / B (Oral) vs Group C / D (Venous) */}
            {(selectedGroup === DengueGroup.GROUP_A || selectedGroup === DengueGroup.GROUP_B) ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Volume Diário Total</span>
                    <span className="text-base font-black text-slate-900">{oralDailyVolume.toLocaleString('pt-BR')} mL / 24h</span>
                    <span className="text-[10px] text-slate-500 block">({isPediatric ? 'Pediátrico por faixa' : `${patientWeight} kg × 60 mL/kg`})</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-300 shadow-2xs">
                    <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider block">1/3 Sais Reidratação (SRO)</span>
                    <span className="text-base font-black text-emerald-950">{sroVolume.toLocaleString('pt-BR')} mL</span>
                    <span className="text-[10px] text-emerald-700 block">Solução OMS / sachê</span>
                  </div>
                  <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-300 shadow-2xs">
                    <span className="text-[9px] text-sky-800 font-bold uppercase tracking-wider block">2/3 Líquidos Caseiros</span>
                    <span className="text-base font-black text-sky-950">{liquidsVolume.toLocaleString('pt-BR')} mL</span>
                    <span className="text-[10px] text-sky-700 block">Água, sucos, água de coco, chás</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-700">
                  <strong>Instrução ao Paciente:</strong> Fracionar a ingestão de líquidos continuamente ao longo de todo o dia e noite. Não aguardar ter sede.
                </p>
              </div>
            ) : selectedGroup === DengueGroup.GROUP_C ? (
              <div className="bg-white p-3 rounded-lg border border-amber-300 text-xs space-y-1 text-amber-950">
                <strong className="block text-amber-900 uppercase font-black">
                  Fase de Expansão Rápida Parenteral (Grupo C):
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  📅 Reavaliação e Retorno Programado:
                </span>
                <p className="text-[11px] text-slate-800">
                  {initialData?.conduct?.reassessment || (
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
                  {(initialData?.mandatoryExams || [
                    selectedGroup === DengueGroup.GROUP_A ? 'Exames a critério médico (sorologia/RT-PCR para vigilância)' : 'Hemograma completo com plaquetas obrigatório',
                  ]).slice(0, 3).map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 6. WARNING SIGNS & CONTRAINDICATIONS ALERT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="border border-amber-300 bg-amber-50 p-3 rounded-xl space-y-1 text-amber-950">
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

            <div className="border border-red-300 bg-red-50 p-3 rounded-xl space-y-1 text-red-950">
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
      </div>
    </div>
  );
};
