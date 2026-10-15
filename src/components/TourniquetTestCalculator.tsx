import React, { useState, useEffect } from 'react';
import { calculateMeanArterialPressure, evaluateTourniquetTest } from '../utils/hydrationCalculator';
import { Stethoscope, Clock, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface TourniquetTestCalculatorProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const TourniquetTestCalculator: React.FC<TourniquetTestCalculatorProps> = ({
  onClose,
  isModal = false,
}) => {
  const [systolicBP, setSystolicBP] = useState<number>(120);
  const [diastolicBP, setDiastolicBP] = useState<number>(80);
  const [isPediatric, setIsPediatric] = useState<boolean>(false);
  const [petechiaeCount, setPetechiaeCount] = useState<number>(0);

  // Timer states
  const totalDuration = isPediatric ? 180 : 300; // 3 min (child) or 5 min (adult)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalDuration);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);

  // Recalculate MAP
  const mapValue = calculateMeanArterialPressure(systolicBP, diastolicBP);
  const evaluation = evaluateTourniquetTest(petechiaeCount, isPediatric);

  // Update timer when category changes
  useEffect(() => {
    setIsTimerActive(false);
    setRemainingSeconds(isPediatric ? 180 : 300);
    setTimerFinished(false);
  }, [isPediatric]);

  // Active countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isTimerActive) {
      setIsTimerActive(false);
      setTimerFinished(true);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        // Optional audio beep
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, remainingSeconds]);

  const handleStartTimer = () => {
    setIsTimerActive(true);
    setTimerFinished(false);
  };

  const handlePauseTimer = () => {
    setIsTimerActive(false);
  };

  const handleResetTimer = () => {
    setIsTimerActive(false);
    setRemainingSeconds(isPediatric ? 180 : 300);
    setTimerFinished(false);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = ((totalDuration - remainingSeconds) / totalDuration) * 100;

  const content = (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold shadow-xs flex-shrink-0">
            🩺
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fragilidade Capilar</p>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Prova do Laço (Teste do Torniquete)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Avaliação de Fragilidade Capilar e Sangramento Induzido • Protocolo Clínico
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

      {/* Step by Step Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Calculation & Steps */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Aferição da Pressão Arterial & PAM
            </p>

            {/* Profile Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPediatric(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  !isPediatric
                    ? 'bg-[#2563EB] text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👤 Adulto (5 minutos)
              </button>
              <button
                type="button"
                onClick={() => setIsPediatric(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  isPediatric
                    ? 'bg-[#2563EB] text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👶 Criança (3 minutos)
              </button>
            </div>

            {/* Blood Pressure Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  PA Sistólica (PAS)
                </label>
                <input
                  type="number"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(parseInt(e.target.value) || 0)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB]"
                  placeholder="Ex: 120"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  PA Diastólica (PAD)
                </label>
                <input
                  type="number"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(parseInt(e.target.value) || 0)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB]"
                  placeholder="Ex: 80"
                />
              </div>
            </div>

            {/* Computed MAP */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-center space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                PRESSÃO ARTERIAL MÉDIA (PAM) CALCULADA
              </span>
              <span className="text-2xl font-black text-blue-950 block">
                {mapValue} mmHg
              </span>
              <span className="text-xs text-blue-800 block">
                Insuflar o manguito exatamente em <strong>{mapValue} mmHg</strong> e manter constante.
              </span>
            </div>
          </div>

          {/* Technique Instruction */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Passo a Passo da Técnica Padrão:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
              <li>Desenhar um quadrado de <strong>2,5 x 2,5 cm</strong> (ou a largura da polpa do polegar) no antebraço.</li>
              <li>Insuflar o manguito do esfigmomanômetro até o valor médio da PAM ({mapValue} mmHg).</li>
              <li>Manter a pressão durante <strong>{isPediatric ? '3 minutos (criança)' : '5 minutos (adulto)'}</strong>.</li>
              <li>Desinsuflar o manguito, aguardar 2 minutos para normalizar a circulação e contar as petéquias dentro do quadrado.</li>
            </ol>
          </div>
        </div>

        {/* Right: Timer & Result Counter */}
        <div className="space-y-4">
          {/* Countdown Card */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg text-center space-y-4 border border-slate-800">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>Temporizador do Manguito</span>
            </div>

            {/* Timer Digits */}
            <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2563EB] h-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Timer Buttons */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {!isTimerActive ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                >
                  <Play className="w-4 h-4 fill-current" /> Iniciar Insuflação
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Pause className="w-4 h-4 fill-current" /> Pausar
                </button>
              )}
              <button
                type="button"
                onClick={handleResetTimer}
                className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
              </button>
            </div>

            {timerFinished && (
              <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold p-3 rounded-xl animate-pulse">
                ✓ TEMPO ESGOTADO! Desinsufle o manguito, aguarde 2 min e conte as petéquias.
              </div>
            )}
          </div>

          {/* Petechiae Counter & Positivity Assessment */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Contagem de Petéquias no Quadrado (2,5 x 2,5 cm)
            </p>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="200"
                value={petechiaeCount}
                onChange={(e) => setPetechiaeCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 text-center text-xl font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
              <div className="text-xs text-slate-600">
                <span>Ponto de corte para positividade:</span>
                <strong className="block text-slate-800 text-sm mt-0.5">
                  ≥ {isPediatric ? '10 petéquias (Criança)' : '20 petéquias (Adulto)'}
                </strong>
              </div>
            </div>

            {/* Diagnosis Result Box */}
            <div className={`p-4 rounded-xl border ${
              evaluation.isPositive
                ? 'bg-red-50 border-red-300 text-red-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex items-start gap-3">
                {evaluation.isPositive ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h5 className="text-sm font-bold">
                    {evaluation.isPositive ? 'PROVA DO LAÇO POSITIVA 🩸' : 'PROVA DO LAÇO NEGATIVA'}
                  </h5>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">
                    {evaluation.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              * Nota: A prova do laço não é necessária em pacientes que já apresentam sangramento espontâneo de pele (petéquias visíveis) ou em estado de choque.
            </div>
          </div>
        </div>
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
