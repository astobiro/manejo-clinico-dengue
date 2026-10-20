import React, { useState } from 'react';
import { DengueGroup } from '../types';
import { calculateHydration } from '../utils/hydrationCalculator';
import { Droplets, Scale, User, AlertTriangle, X, Calculator, Info } from 'lucide-react';

interface HydrationCalculatorModalProps {
  weight?: number;
  initialWeight?: number;
  onWeightChange?: (weight: number) => void;
  isPediatric?: boolean;
  initialIsPediatric?: boolean;
  onPediatricChange?: (isPed: boolean) => void;
  initialGroup?: DengueGroup;
  onClose?: () => void;
  isModal?: boolean;
}

export const HydrationCalculatorModal: React.FC<HydrationCalculatorModalProps> = ({
  weight,
  initialWeight = 70,
  onWeightChange,
  isPediatric: externalIsPediatric,
  initialIsPediatric = false,
  onPediatricChange,
  initialGroup = DengueGroup.GROUP_A,
  onClose,
  isModal = false,
}) => {
  const [localWeight, setLocalWeight] = useState<number>(initialWeight);
  const weightKg = weight !== undefined ? weight : localWeight;

  // Weight text input string to allow fluid backspacing without forcing 1 on mobile
  const [weightInputStr, setWeightInputStr] = useState<string>(() => String(weightKg));

  const handleWeightChange = (newVal: number) => {
    const safeVal = Math.max(1, newVal);
    setLocalWeight(safeVal);
    setWeightInputStr(String(safeVal));
    onWeightChange?.(safeVal);
  };

  React.useEffect(() => {
    if (weightKg !== undefined && !isNaN(weightKg)) {
      if (parseFloat(weightInputStr) !== weightKg && weightInputStr !== '') {
        setWeightInputStr(String(weightKg));
      }
    }
  }, [weightKg]);

  const [localIsPediatric, setLocalIsPediatric] = useState<boolean>(
    externalIsPediatric !== undefined ? externalIsPediatric : initialIsPediatric
  );

  const isPediatric = externalIsPediatric !== undefined ? externalIsPediatric : localIsPediatric;
  const [isElderly, setIsElderly] = useState<boolean>(false);

  const handlePediatricToggle = (val: boolean) => {
    setLocalIsPediatric(val);
    onPediatricChange?.(val);
    if (val && weightKg > 40) {
      handleWeightChange(20);
    } else if (!val && weightKg < 30) {
      handleWeightChange(70);
    }
  };

  const [selectedGroup, setSelectedGroup] = useState<DengueGroup>(initialGroup);
  const [hasHeartOrKidneyDisease, setHasHeartOrKidneyDisease] = useState<boolean>(false);

  const calc = calculateHydration(weightKg, isPediatric, selectedGroup);

  const content = (
    <div className="space-y-6">
      {/* Title & Top Info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold shadow-xs flex-shrink-0">
            💧
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protocolo de Fluidoterapia</p>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Calculadora de Hidratação na Dengue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Diretrizes Clínicas • Adultos, Idosos e Crianças (Grupos A, B, C e D)
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Patient Category with Idoso Button */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Faixa Etária / Perfil
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsElderly(false);
                  handlePediatricToggle(true);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition border text-center ${
                  isPediatric
                    ? 'bg-[#2563EB] text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👶 Criança (&lt;13a)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsElderly(false);
                  handlePediatricToggle(false);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition border text-center ${
                  !isPediatric && !isElderly
                    ? 'bg-[#2563EB] text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👤 Adulto (&lt;65a)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsElderly(true);
                  handlePediatricToggle(false);
                  if (weightKg < 30) handleWeightChange(70);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition border text-center ${
                  isElderly
                    ? 'bg-[#2563EB] text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👴 Idoso (≥65a)
              </button>
            </div>
          </div>

          {/* Weight Input with fluid backspace */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-400" /> Peso Corporal (kg)
              </label>
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightInputStr}
                  placeholder="Ex: 70"
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(',', '.');
                    if (sanitized === '' || /^[0-9]*\.?[0-9]*$/.test(sanitized)) {
                      setWeightInputStr(sanitized);
                      if (sanitized !== '' && !isNaN(Number(sanitized))) {
                        const num = parseFloat(sanitized);
                        if (num > 0) {
                          setLocalWeight(num);
                          onWeightChange?.(num);
                        }
                      }
                    }
                  }}
                  onBlur={() => {
                    const num = parseFloat(weightInputStr);
                    if (isNaN(num) || num <= 0) {
                      const defaultW = isPediatric ? 20 : 70;
                      setWeightInputStr(String(defaultW));
                      handleWeightChange(defaultW);
                    } else {
                      const clamped = Math.min(250, Math.max(1, num));
                      setWeightInputStr(String(clamped));
                      handleWeightChange(clamped);
                    }
                  }}
                  className="w-16 bg-transparent text-right text-xs font-black text-[#2563EB] font-mono focus:outline-none"
                />
                <span className="text-xs font-black text-[#2563EB]">kg</span>
              </div>
            </div>
            <input
              type="range"
              min={isPediatric ? 2 : 30}
              max={isPediatric ? 60 : 180}
              step="1"
              value={weightKg}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>{isPediatric ? '2 kg' : '30 kg'}</span>
              <span>{isPediatric ? '30 kg' : '100 kg'}</span>
              <span>{isPediatric ? '60 kg' : '180 kg'}</span>
            </div>
          </div>
        </div>

        {/* Group Selector with Buttons (no select dropdown) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Classificação do Grupo
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: DengueGroup.GROUP_A, label: 'GRUPO A', sub: 'Ambulatorial • Reidratação Oral' },
              { id: DengueGroup.GROUP_B, label: 'GRUPO B', sub: 'Observação • Oral no Leito' },
              { id: DengueGroup.GROUP_C, label: 'GRUPO C', sub: 'Internação • Venoso 10 mL/kg' },
              { id: DengueGroup.GROUP_D, label: 'GRUPO D', sub: 'UTI • Choque 20 mL/kg em 20 min' },
            ].map((g) => {
              const isSelected = selectedGroup === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroup(g.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-[#2563EB] text-white border-blue-600 shadow-md shadow-blue-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs font-black">{g.label}</span>
                  <span className={`block text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {g.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comorbidity Risk Toggle Button (No checkboxes) */}
        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setHasHeartOrKidneyDisease(!hasHeartOrKidneyDisease)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
              hasHeartOrKidneyDisease
                ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>❤️ Cardiopatia Grave ou Insuficiência Renal</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${hasHeartOrKidneyDisease ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'}`}>
              {hasHeartOrKidneyDisease ? 'Ativo' : 'Não'}
            </span>
          </button>
        </div>

        {(hasHeartOrKidneyDisease || isElderly) && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 font-medium flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Alerta de Cautela Volêmica {isElderly ? '(Paciente Idoso)' : ''}:</strong> Em idosos, cardiopatas e pacientes com insuficiência renal, monitorar ausculta pulmonar, estase jugular e diurese a cada hora. Evitar sobrecarga hídrica, insuficiência cardíaca congestiva e edema agudo de pulmão.
            </span>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY ACCORDING TO GROUP */}
      <div className="space-y-4">
        {/* GRUPO A & B: ORAL HYDRATION */}
        {(selectedGroup === DengueGroup.GROUP_A || selectedGroup === DengueGroup.GROUP_B) && (
          <div className="bg-white rounded-2xl border border-emerald-300 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Plano de Reidratação Oral ({selectedGroup})
                </span>
                <h4 className="text-base font-bold text-slate-800">
                  {isPediatric
                    ? `Crianças (${weightKg <= 10 ? '130' : weightKg <= 20 ? '100' : '80'} mL/kg/dia para ${weightKg} kg)`
                    : `Adultos (60 mL/kg/dia para ${weightKg} kg)`}
                </h4>
              </div>
              <span className="text-2xl font-black text-emerald-700">
                {calc.totalDailyVolumeMl.toLocaleString('pt-BR')} mL / 24h
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1.5 shadow-2xs">
                <span className="text-xs font-bold text-emerald-900 block uppercase tracking-wider">
                  1/3 Sais de Reidratação Oral (SRO)
                </span>
                <span className="text-3xl font-black text-emerald-950 block">
                  {calc.oralRehydrationMl.toLocaleString('pt-BR')} mL
                </span>
                <p className="text-xs text-emerald-800 mt-1">
                  Ofertar no início com maior frequência e volume. 1 envelope de SRO diluído em 1000 mL de água tratada/filtrada.
                </p>
              </div>

              <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-1.5 shadow-2xs">
                <span className="text-xs font-bold text-sky-900 block uppercase tracking-wider">
                  2/3 Líquidos Caseiros
                </span>
                <span className="text-3xl font-black text-sky-950 block">
                  {calc.homeFluidsMl.toLocaleString('pt-BR')} mL
                </span>
                <p className="text-xs text-sky-800 mt-1">
                  Água, sucos de frutas naturais, água de coco, soro caseiro, chás. Evitar refrigerantes e bebidas açucaradas.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <strong className="text-slate-800">Orientações de Administração:</strong>
              <p>• Iniciar imediatamente no momento da consulta/atendimento.</p>
              <p>• Fracionar em pequenas porções a cada 15 a 30 minutos para evitar vômitos.</p>
              <p>• Se houver vômitos incoercíveis ou recusa alimentar completa, encaminhar para hidratação venosa.</p>
            </div>
          </div>
        )}

        {/* GRUPO C: VENOUS EXPANSION & MAINTENANCE */}
        {selectedGroup === DengueGroup.GROUP_C && (
          <div className="bg-white rounded-2xl border border-amber-300 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Protocolo de Hidratação Venosa (GRUPO C - Leito Hospitalar)
              </span>
              <h4 className="text-base font-bold text-slate-800">
                Fase de Expansão (10 mL/kg/h) e Fases de Manutenção para {weightKg} kg
              </h4>
            </div>

            {/* Expansion Phase 1 and 2 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                1. Fase de Expansão Rápida Imediata (SF 0,9% ou Ringer Lactato):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-amber-900 block uppercase tracking-wider">1ª HORA (10 mL/kg)</span>
                  <span className="text-2xl font-black text-amber-950 block">
                    {calc.expansionStage1VolumeMl} mL
                  </span>
                  <div className="text-xs text-amber-900 pt-2 border-t border-amber-200/80 space-y-1">
                    <div>Bomba de Infusão: <strong>{calc.expansionStage1RateMlH} mL/h</strong></div>
                    <div>Equipo Macrogotas: <strong>{calc.expansionStage1DropsMin} gotas/min</strong></div>
                    <div>Equipo Microgotas: <strong>{calc.expansionStage1MicrodropsMin} microgotas/min</strong></div>
                  </div>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-amber-900 block uppercase tracking-wider">2ª HORA (10 mL/kg)</span>
                  <span className="text-2xl font-black text-amber-950 block">
                    {calc.expansionStage2VolumeMl} mL
                  </span>
                  <div className="text-xs text-amber-900 pt-2 border-t border-amber-200/80 space-y-1">
                    <div>Bomba de Infusão: <strong>{calc.expansionStage2RateMlH} mL/h</strong></div>
                    <div>Equipo Macrogotas: <strong>{calc.expansionStage2DropsMin} gotas/min</strong></div>
                    <div className="text-[11px] text-amber-800 italic mt-0.5">Reavaliar Ht no final de 2h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Phases */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                2. Fase de Manutenção (Após estabilização e queda do Ht):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">1ª ETAPA DE MANUTENÇÃO (25 mL/kg em 6h)</span>
                  <span className="text-xl font-black text-slate-900 block">
                    {calc.maintenancePhase1VolumeMl} mL em 6 horas
                  </span>
                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                    <div>Bomba: <strong>{calc.maintenancePhase1RateMlH} mL/h</strong></div>
                    <div>Macrogotas: <strong>{calc.maintenancePhase1DropsMin} gts/min</strong></div>
                    <div className="text-[11px] text-slate-400">Solução: SF 0,9% ou Ringer</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">2ª ETAPA DE MANUTENÇÃO (25 mL/kg em 8h)</span>
                  <span className="text-xl font-black text-slate-900 block">
                    {calc.maintenancePhase2VolumeMl} mL em 8 horas
                  </span>
                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                    <div>Bomba: <strong>{calc.maintenancePhase2RateMlH} mL/h</strong></div>
                    <div>Macrogotas: <strong>{calc.maintenancePhase2DropsMin} gts/min</strong></div>
                    <div className="text-[11px] text-slate-400">Solução: 1/3 SF 0,9% + 2/3 SG 5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GRUPO D: SHOCK RESUSCITATION */}
        {selectedGroup === DengueGroup.GROUP_D && (
          <div className="bg-white rounded-2xl border border-red-400 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                Protocolo de Ressuscitação Volêmica em UTI (GRUPO D - Dengue Grave / Choque)
              </span>
              <h4 className="text-base font-bold text-slate-800">
                Expansão Rápida (20 mL/kg em até 20 min) para {weightKg} kg
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-red-50/70 p-4 rounded-2xl border border-red-300 space-y-1.5 shadow-2xs">
                <span className="text-xs font-bold text-red-900 block uppercase tracking-wider">
                  EXPANSÃO RÁPIDA (SF 0,9%)
                </span>
                <span className="text-2xl font-black text-red-950 block">
                  {calc.rapidExpansionVolume20min} mL em 20 min
                </span>
                <p className="text-xs text-red-900 pt-2 border-t border-red-200">
                  Infusão imediata em acesso venoso periférico calibroso. Reavaliar a cada 15-30 minutos. Repetir até 3 vezes se choque persistir.
                </p>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-300 space-y-1.5 shadow-2xs">
                <span className="text-xs font-bold text-blue-900 block uppercase tracking-wider">
                  SE CHOQUE PERSISTENTE + Ht ELEVADO (Albumina 5%)
                </span>
                <span className="text-2xl font-black text-blue-950 block">
                  {calc.albumin5PercentVolumeMl} mL (solução a 5%)
                </span>
                <p className="text-xs text-blue-900 pt-2 border-t border-blue-200">
                  Dose: 0,5 - 1 g/kg (15 mL/kg de solução 5%). Preparo: 25 mL de Albumina 20% + 75 mL de SF 0,9% para cada 100 mL.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <strong className="text-slate-800">Se Choque Persistente com Hematócrito em Queda:</strong>
              <p>• Investigar hemorragia digestiva oculta ou coagulopatia de consumo.</p>
              <p>• Transfusão de Concentrado de Hemácias: <strong>10 a 15 mL/kg/dia</strong>.</p>
              <p>• Avaliar Plasma Fresco Congelado (10 mL/kg) e Crioprecipitado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden p-5 sm:p-6 my-6 max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-5 sm:p-6">
      {content}
    </div>
  );
};
