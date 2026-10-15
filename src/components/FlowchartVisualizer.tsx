import React, { useState } from 'react';
import { DengueGroup } from '../types';
import { GROUP_PROTOCOL_DETAILS } from '../data/dengueProtocol';
import { 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  ArrowDown, 
  ArrowRight,
  Droplets,
  Bed,
  FileText,
  Activity
} from 'lucide-react';

interface FlowchartVisualizerProps {
  onSelectGroup: (group: DengueGroup) => void;
}

export const FlowchartVisualizer: React.FC<FlowchartVisualizerProps> = ({ onSelectGroup }) => {
  const [activeHighlightedGroup, setActiveHighlightedGroup] = useState<DengueGroup | null>(null);

  const groupA = GROUP_PROTOCOL_DETAILS[DengueGroup.GROUP_A];
  const groupB = GROUP_PROTOCOL_DETAILS[DengueGroup.GROUP_B];
  const groupC = GROUP_PROTOCOL_DETAILS[DengueGroup.GROUP_C];
  const groupD = GROUP_PROTOCOL_DETAILS[DengueGroup.GROUP_D];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold shadow-xs flex-shrink-0">
              🦟
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Algoritmo Decisório</p>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Fluxograma de Manejo Clínico de Dengue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Navegação interativa por todas as etapas da árvore de decisão clínica • Grupos A, B, C e D
              </p>
            </div>
          </div>
          <span className="text-xs bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto border border-red-200 shadow-2xs">
            SINAN: Notificar Todo Caso Suspeito
          </span>
        </div>
      </div>

      {/* Interactive Flowchart Tree Representation */}
      <div className="space-y-6">
        {/* Node 1: Suspeita de Dengue */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#2563EB] px-3.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
            PORTA DE ENTRADA • DEFINIÇÃO DE CASO
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
            SUSPEITA DE DENGUE
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Relato de febre, usualmente entre <strong>2 e 7 dias de duração</strong>, e 2 ou mais das seguintes manifestações: 
            náuseas/vômitos, exantema, mialgia/artralgia, cefaleia/dor retro-orbital, petéquias/prova do laço positiva, leucopenia. 
            Ou toda criança com quadro febril agudo (2 a 7d) sem foco de infecção aparente.
          </p>
        </div>

        {/* Central Decision Question Node */}
        <div className="flex flex-col items-center">
          <ArrowDown className="w-6 h-6 text-slate-400 my-1 animate-bounce" />
          <div className="bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md border border-amber-500 max-w-lg text-center uppercase tracking-wider">
            ❓ TEM SINAL DE ALARME OU GRAVIDADE?
          </div>
        </div>

        {/* Binary Branches: SIM (Groups C and D) vs NÃO (Groups A and B) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* LEFT BRANCH: NÃO TEM ALARME/GRAVIDADE -> Groups A & B */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider">
                RAMAL NÃO • AUSÊNCIA DE ALARME E GRAVIDADE
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <strong className="text-slate-800 block text-sm">
                  Pesquisar sangramento espontâneo de pele (petéquias), induzido (prova do laço positiva), condição clínica especial, risco social ou comorbidades:
                </strong>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Lactentes (&lt;24m), gestantes, adultos &gt;65a, HAS, cardiopatias, DM, DPOC, asma, obesidade, doença hematológica, renal, hepatopatias, autoimunes ou risco social.
                </p>
              </div>
            </div>

            {/* Split A vs B */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* GROUP A */}
              <div 
                onClick={() => {
                  setActiveHighlightedGroup(DengueGroup.GROUP_A);
                  onSelectGroup(DengueGroup.GROUP_A);
                }}
                className="bg-emerald-50/70 hover:bg-emerald-100/80 border-2 border-emerald-500 rounded-2xl p-4 cursor-pointer transition shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      SEM COMORBIDADE
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-base font-black text-emerald-950">GRUPO A</h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-snug">
                    Dengue sem sinais de alarme, sem comorbidades e sem sangramento.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-emerald-200 text-xs text-emerald-900 space-y-1 font-medium">
                  <div>• Acompanhamento: <strong>Ambulatorial</strong></div>
                  <div>• Hidratação Oral: <strong>60 mL/kg/dia</strong></div>
                  <div className="text-[11px] text-emerald-700 font-bold pt-1">Ver Conduta Completa →</div>
                </div>
              </div>

              {/* GROUP B */}
              <div 
                onClick={() => {
                  setActiveHighlightedGroup(DengueGroup.GROUP_B);
                  onSelectGroup(DengueGroup.GROUP_B);
                }}
                className="bg-sky-50/70 hover:bg-sky-100/80 border-2 border-sky-500 rounded-2xl p-4 cursor-pointer transition shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      COM COMORBIDADE / PETÉQUIAS
                    </span>
                    <Activity className="w-4 h-4 text-sky-600" />
                  </div>
                  <h4 className="text-base font-black text-sky-950">GRUPO B</h4>
                  <p className="text-xs text-sky-800 mt-1 leading-snug">
                    Sem alarme, mas com condição especial, risco social ou sangramento de pele.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-sky-200 text-xs text-sky-900 space-y-1 font-medium">
                  <div>• Acompanhamento: <strong>Leito de Observação</strong></div>
                  <div>• Exame: <strong>Hemograma Obrigatório</strong></div>
                  <div className="text-[11px] text-sky-700 font-bold pt-1">Ver Conduta Completa →</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT BRANCH: SIM TEM ALARME/GRAVIDADE -> Groups C & D */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-900 text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider border border-red-200">
                RAMAL SIM • SINAIS DE ALARME OU GRAVIDADE PRESENTES
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <strong className="text-slate-800 block text-sm">
                  Identificar se há choque, sangramento grave ou disfunção de órgãos (Grupo D) OU sinais de alarme isolados (Grupo C):
                </strong>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Iniciar hidratação venosa de imediato em qualquer nível de atenção antes de eventual transferência!
                </p>
              </div>
            </div>

            {/* Split C vs D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* GROUP C */}
              <div 
                onClick={() => {
                  setActiveHighlightedGroup(DengueGroup.GROUP_C);
                  onSelectGroup(DengueGroup.GROUP_C);
                }}
                className="bg-amber-50/70 hover:bg-amber-100/80 border-2 border-amber-500 rounded-2xl p-4 cursor-pointer transition shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      SINAIS DE ALARME
                    </span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="text-base font-black text-amber-950">GRUPO C</h4>
                  <p className="text-xs text-amber-800 mt-1 leading-snug">
                    Dor abdominal intensa, vômitos, ascite/derrame, hipotensão postural, hepatomegalia &gt;2cm.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-amber-200 text-xs text-amber-900 space-y-1 font-medium">
                  <div>• Acompanhamento: <strong>Internação (48h)</strong></div>
                  <div>• Expansão EV: <strong>10 mL/kg em 1h</strong></div>
                  <div className="text-[11px] text-amber-800 font-bold pt-1">Ver Conduta Completa →</div>
                </div>
              </div>

              {/* GROUP D */}
              <div 
                onClick={() => {
                  setActiveHighlightedGroup(DengueGroup.GROUP_D);
                  onSelectGroup(DengueGroup.GROUP_D);
                }}
                className="bg-red-50/70 hover:bg-red-100/80 border-2 border-red-600 rounded-2xl p-4 cursor-pointer transition shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-red-200/80 text-red-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      DENGUE GRAVE / CHOQUE
                    </span>
                    <AlertOctagon className="w-4 h-4 text-red-700" />
                  </div>
                  <h4 className="text-base font-black text-red-950">GRUPO D</h4>
                  <p className="text-xs text-red-900 mt-1 leading-snug">
                    Choque, extremidades frias, pulso filiforme, PA convergente, sangramento grave, disfunção de órgãos.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-red-200 text-xs text-red-900 space-y-1 font-medium">
                  <div>• Acompanhamento: <strong>Leito de UTI (48h)</strong></div>
                  <div>• Expansão Rápida: <strong>20 mL/kg em 20 min</strong></div>
                  <div className="text-[11px] text-red-700 font-bold pt-1">Ver Conduta Completa →</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
