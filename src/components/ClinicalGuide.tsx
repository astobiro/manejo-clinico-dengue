import React, { useState } from 'react';
import { 
  WARNING_SIGNS_LIST, 
  SEVERITY_SIGNS_LIST, 
  SPECIAL_CONDITIONS_LIST, 
  CONTRAINDICATED_MEDICATIONS, 
  DISCHARGE_CRITERIA_DETAILS 
} from '../data/dengueProtocol';
import { 
  BookOpen, 
  AlertTriangle, 
  ShieldAlert, 
  HeartHandshake, 
  FileText, 
  AlertOctagon, 
  Droplets, 
  Pill, 
  Info,
  Activity,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export const ClinicalGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('alarme');

  const sections = [
    { id: 'alarme', title: '⚠️ Sinais de Alarme', icon: AlertTriangle, desc: 'Extravasamento plasmático' },
    { id: 'gravidade', title: '🚨 Sinais de Gravidade', icon: AlertOctagon, desc: 'Choque e falência orgânica' },
    { id: 'alta', title: '📋 Critérios de Alta', icon: CheckCircle2, desc: '6 regras de alta hospitalar' },
    { id: 'medicamentos', title: '💊 Medicamentos', icon: Pill, desc: 'Permitidos e contraindicados' },
    { id: 'diferencial', title: '🔍 Diagnóstico Diferencial', icon: Info, desc: 'Dengue, Zika e Chikungunya' },
    { id: 'notificacao', title: '📢 Vigilância & SINAN', icon: FileText, desc: 'Prazos de notificação' },
    { id: 'laco', title: '🩺 Prova do Laço', icon: Activity, desc: 'Técnica e interpretação' },
    { id: 'exames', title: '🧪 Diagnóstico Laboratorial', icon: Droplets, desc: 'NS1, Sorologia e Hemograma' },
    { id: 'grupos', title: '📊 Estadiamento dos Grupos', icon: ShieldAlert, desc: 'Condutas dos Grupos A, B, C e D' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] border-l-[#2563EB] p-5 sm:p-6">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold shadow-xs flex-shrink-0">
            📚
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referência e Condutas</p>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Guia Clínico & Critérios de Manejo da Dengue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manual de Manejo Clínico de Dengue • Diretrizes de Diagnóstico e Conduta (6ª Edição)
            </p>
          </div>
        </div>

        {/* Section Tabs in 3x3 Grid centered without any overflow */}
        <div className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-w-5xl mx-auto">
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl transition text-left border ${
                    isActive
                      ? 'bg-[#2563EB] text-white border-blue-600 shadow-md shadow-blue-200 ring-2 ring-blue-300'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold truncate">{sec.title}</span>
                    <span className={`block text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {sec.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION: SINAIS DE ALARME */}
      {activeSection === 'alarme' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Sinais de Alarme na Dengue (Extravasamento Plasmático)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Os sinais de alarme indicam que o plasma está saindo dos vasos sanguíneos para o espaço extravascular (terceiro espaço). Surgem caracteristicamente na <strong>queda da febre (dias 3 a 6)</strong> e antecedem o choque.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {WARNING_SIGNS_LIST.map((w) => (
              <div key={w.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{w.icon}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950">{w.label}</h4>
                </div>
                <p className="text-xs text-slate-600 pl-7">{w.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-1">
            <strong className="text-sm">Conduta Obrigatória no Grupo C:</strong>
            <p>• Internação hospitalar imediata em leito por no mínimo 48 horas.</p>
            <p>• Iniciar imediatamente <strong>10 mL/kg de SF 0,9% em 1 hora</strong> antes de qualquer transferência.</p>
            <p>• Monitorar diurese (meta ≥ 1,0 mL/kg/h) e dosar hematócrito seriado a cada 2 horas.</p>
          </div>
        </div>
      )}

      {/* SECTION: SINAIS DE GRAVIDADE */}
      {activeSection === 'gravidade' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-red-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-700" />
              Sinais de Gravidade (Dengue Grave / Choque)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Classifica o paciente como <strong className="text-red-700">GRUPO D</strong> e exige leito de Terapia Intensiva (UTI) com expansão rápida de 20 mL/kg em 20 min.
            </p>
          </div>

          <div className="space-y-3">
            {SEVERITY_SIGNS_LIST.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-red-200 bg-red-50/60 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <h4 className="text-sm font-bold text-red-950">{s.label}</h4>
                </div>
                <p className="text-xs text-slate-600 pl-7">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Shock Management with Albumin & Blood Products */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 border border-slate-800">
            <h4 className="text-sm font-bold text-red-300 flex items-center gap-2 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Manejo do Choque Refratário à Expansão Cristalóide
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-200">
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                <strong className="text-amber-300 block">1. Hematócrito em Elevação (Extravasamento Maciço):</strong>
                <p>• Administrar expansores plasmáticos: <strong>Albumina humana 5%</strong> (0,5 a 1,0 g/kg) ou coloides sintéticos a 10 mL/kg/h.</p>
                <p>• Preparo da Albumina 5%: Para cada 100 mL, usar 25 mL de Albumina 20% + 75 mL de SF 0,9%.</p>
              </div>
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                <strong className="text-red-300 block">2. Hematócrito em Queda (Hemorragia Oculta):</strong>
                <p>• Investigar sangramento digestivo e coagulopatia de consumo.</p>
                <p>• Transfusão de Concentrado de Hemácias: <strong>10 a 15 mL/kg/dia</strong>.</p>
                <p>• Plasma Fresco Congelado (10 mL/kg), Vitamina K e Crioprecipitado.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: CRITÉRIOS DE ALTA */}
      {activeSection === 'alta' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Os 6 Critérios Oficiais para Alta Hospitalar
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              O paciente internado (Grupos C ou D) só deve receber alta após preencher <strong>TODOS os 6 critérios abaixo</strong>:
            </p>
          </div>

          <div className="space-y-3">
            {DISCHARGE_CRITERIA_DETAILS.map((c, i) => (
              <div key={c.key} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <h4 className="text-sm font-bold text-emerald-950">{c.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: MEDICAMENTOS & CONTRAINDICAÇÕES */}
      {activeSection === 'medicamentos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-red-950 flex items-center gap-2">
              <Pill className="w-5 h-5 text-red-700" />
              Medicamentos Sintomáticos & Contraindicações Absolutas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              A dengue causa trombocitopenia e disfunção endotelial. O uso de fármacos errados pode precipitar choque hemorrágico fatal.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
              🚫 Substâncias Terminantemente Proibidas na Dengue:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTRAINDICATED_MEDICATIONS.map((med, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-red-300 bg-red-50 space-y-1">
                  <span className="text-xs font-bold text-red-950 block">{med.name}</span>
                  <p className="text-[11px] text-red-900 leading-snug">{med.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              💊 Analgésicos e Antitérmicos Permitidos:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-950 block">Dipirona</span>
                <p className="text-emerald-900">• Adultos: 500 mg a 1000 mg a cada 6h (máximo 4g/dia).</p>
                <p className="text-emerald-900">• Crianças: 10 a 15 mg/kg/dose a cada 6 horas.</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-950 block">Paracetamol</span>
                <p className="text-emerald-900">• Adultos: 500 mg a 750 mg a cada 6h (máximo 3g/dia).</p>
                <p className="text-emerald-900">• Crianças: 10 a 15 mg/kg/dose a cada 6 horas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: DIAGNÓSTICO DIFERENCIAL */}
      {activeSection === 'diferencial' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Diagnóstico Diferencial das Arboviroses e Síndromes Febris
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-sm">🦟 Dengue</span>
              <p>• Febre alta e súbita (2 a 7 dias).</p>
              <p>• Mialgia intensa, dor retro-orbital, cefaleia.</p>
              <p>• <strong>Alarme:</strong> Extravasamento de plasma, choque e hemoconcentração no 3º a 6º dia.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-purple-900 block text-sm">🦟 Chikungunya</span>
              <p>• Febre alta de início abrupto.</p>
              <p>• <strong>Artrite/artralgia intensa, simétrica e incapacitante</strong> em pequenas articulações (mãos e pés).</p>
              <p>• Edema articular e tenossinovite frequentes.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-emerald-900 block text-sm">🦟 Zika Vírus</span>
              <p>• Febre baixa ou ausente.</p>
              <p>• <strong>Exantema maculopapular pruriginoso precoce</strong> (1º-2º dia).</p>
              <p>• Hiperemia conjuntival não purulenta, poliartralgia leve.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: NOTIFICAÇÃO & SINAN */}
      {activeSection === 'notificacao' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-blue-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Regras Oficiais de Notificação Compulsória (SINAN)
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-1">
              <strong className="text-sm font-bold text-blue-950 block">
                1. Notificação de Todo Caso Suspeito
              </strong>
              <p>• Todo caso suspeito de dengue deve ser notificado à vigilância epidemiológica municipal e inserido no Sistema de Informação de Agravos de Notificação (SINAN).</p>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-1">
              <strong className="text-sm font-bold text-red-950 block">
                2. Notificação Imediata em até 24 Horas (Casos Graves e Óbitos)
              </strong>
              <p>• Casos graves de dengue (Grupo D), gestantes hospitalizadas e todo óbito com suspeita de dengue devem ser notificados imediatamente em até 24 horas para investigação epidemiológica oportuna.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PROVA DO LAÇO */}
      {activeSection === 'laco' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-purple-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Técnica e Interpretação da Prova do Laço (Fragilidade Capilar)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              A prova do laço deve ser realizada em <strong>todo caso suspeito de dengue</strong> que não apresente sangramento espontâneo de pele prévio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-700">
            <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-2">
              <strong className="text-purple-950 text-sm block">Passo a Passo da Técnica:</strong>
              <ol className="list-decimal list-inside space-y-1.5 text-purple-900">
                <li>Medir a Pressão Arterial (PAS e PAD) com paciente sentado ou deitado.</li>
                <li>Calcular a <strong>Pressão Arterial Média (PAM)</strong>: <code className="bg-purple-200/60 px-1 py-0.5 rounded font-mono font-bold">(PAS + 2×PAD) ÷ 3</code>.</li>
                <li>Insuflar novamente o manguito até o valor da PAM calculada.</li>
                <li>Manter o manguito insuflado por <strong>5 minutos em adultos</strong> ou <strong>3 minutos em crianças</strong>.</li>
                <li>Desinsuflar e desenhar um quadrado de <strong>2,5 × 2,5 cm</strong> (ou área de uma moeda de 1 Real) na face anterior do antebraço.</li>
                <li>Contar o número de petéquias formadas dentro do quadrado.</li>
              </ol>
            </div>

            <div className="space-y-3">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                <span className="font-bold text-emerald-950 block text-sm">Critérios de Positividade:</span>
                <p>• <strong>Adultos:</strong> Positiva se surgirem <strong>≥ 20 petéquias</strong> no quadrado.</p>
                <p>• <strong>Crianças:</strong> Positiva se surgirem <strong>≥ 10 petéquias</strong> no quadrado.</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 space-y-1 text-amber-950">
                <strong className="block text-amber-900 font-bold">Impacto na Classificação:</strong>
                <p>
                  A prova do laço positiva caracteriza <strong>sangramento induzido de pele</strong> e enquadra o paciente no <strong>GRUPO B</strong>, exigindo observação e realização obrigatória de Hemograma Completo com plaquetas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: DIAGNÓSTICO LABORATORIAL */}
      {activeSection === 'exames' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-blue-900 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              Diagnóstico Laboratorial & Janela Imunológica na Dengue
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              A escolha do exame diagnóstico depende estritamente do <strong>dia de início dos sintomas</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
              <span className="text-sm font-bold text-blue-950 block">1. Fase Virêmica (Do 1º ao 5º dia de febre):</span>
              <p>• <strong>Antígeno NS1 (Teste Rápido ou ELISA):</strong> Pesquisa direta da proteína viral. Alta especificidade nas primeiras 72 a 120 horas.</p>
              <p>• <strong>RT-PCR / Isolamento Viral:</strong> Identifica o sorotipo viral (DENV-1, DENV-2, DENV-3, DENV-4). Padrão-ouro em centros de referência (LACEN).</p>
            </div>

            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 space-y-2">
              <span className="text-sm font-bold text-indigo-950 block">2. Fase Sorológica (A partir do 6º dia):</span>
              <p>• <strong>Sorologia IgM (ELISA):</strong> Detecta anticorpos da resposta primária. Positiva do 6º até o 30º dia de infecção.</p>
              <p>• <strong>Sorologia IgG:</strong> Indica infecção prévia por flavivírus ou infecção secundária quando com títulos muito elevados.</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <strong className="text-sm font-bold text-slate-800 block">3. Exames Inespecíficos Fundamentais:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Hematócrito (Ht)</span>
                <p className="text-slate-600">Marcador fidedigno de hemoconcentração e perda plasmática. Elevação &gt; 10% indica alarme; elevação &gt; 20% indica extravasamento grave.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Plaquetometria</span>
                <p className="text-slate-600">&lt; 100.000/mm³ demanda vigilância estrita; &lt; 50.000/mm³ eleva risco hemorrágico e exige monitorização seriada.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Enzimas Hepáticas</span>
                <p className="text-slate-600">AST e ALT podem se elevar na hepatite por dengue. AST &gt; 1.000 U/L caracteriza acometimento orgânico grave (Grupo D).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ESTADIAMENTO E CONDUTAS DOS GRUPOS */}
      {activeSection === 'grupos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              Resumo do Estadiamento e Condutas nos Grupos A, B, C e D
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Síntese comparativa dos critérios de entrada, local de manejo e conduta segundo o Ministério da Saúde.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* GRUPO A */}
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-xs uppercase">GRUPO A</span>
                <span className="font-bold text-emerald-800 text-[11px]">Ambulatorial (UBS)</span>
              </div>
              <p className="text-slate-700"><strong>Critério:</strong> Dengue suspeita sem sinais de alarme, sem comorbidades e prova do laço negativa.</p>
              <p className="text-slate-700"><strong>Hidratação:</strong> 60 mL/kg/dia oral (1/3 SRO + 2/3 líquidos caseiros).</p>
              <p className="text-slate-600"><strong>Retorno:</strong> Diário ou no dia do desaparecimento da febre.</p>
            </div>

            {/* GRUPO B */}
            <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-600 text-white font-black text-xs uppercase">GRUPO B</span>
                <span className="font-bold text-sky-800 text-[11px]">Observação / Acolhimento</span>
              </div>
              <p className="text-slate-700"><strong>Critério:</strong> Sangramento de pele espontâneo ou prova do laço positiva OU condições especiais / comorbidades.</p>
              <p className="text-slate-700"><strong>Conduta:</strong> Hemograma completo obrigatório. Reidratação oral supervisionada no leito de observação.</p>
              <p className="text-slate-600"><strong>Decisão:</strong> Se Ht normal → alta com Grupo A. Se Ht elevado (&gt;10%) → reclassificar para Grupo C.</p>
            </div>

            {/* GRUPO C */}
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-600 text-white font-black text-xs uppercase">GRUPO C</span>
                <span className="font-bold text-amber-800 text-[11px]">Internação Hospitalar (mín. 48h)</span>
              </div>
              <p className="text-slate-700"><strong>Critério:</strong> Presença de qualquer sinal de alarme (dor abdominal, vômitos, lipotimia, sangramento mucoso, etc.).</p>
              <p className="text-slate-700"><strong>Hidratação Venosa:</strong> Iniciar imediatamente 10 mL/kg/hora de SF 0,9% nas primeiras 2 horas.</p>
              <p className="text-slate-600"><strong>Monitorização:</strong> Diurese de hora em hora e Ht seriado a cada 2 horas.</p>
            </div>

            {/* GRUPO D */}
            <div className="p-4 rounded-xl border border-red-300 bg-red-50/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black text-xs uppercase">GRUPO D</span>
                <span className="font-bold text-red-800 text-[11px]">Emergência / UTI</span>
              </div>
              <p className="text-slate-700"><strong>Critério:</strong> Choque por extravasamento, sangramento grave, insuficiência respiratória ou disfunção orgânica.</p>
              <p className="text-slate-700"><strong>Ressuscitação:</strong> 20 mL/kg em 20 minutos de SF 0,9% ou RL. Repetir até 3 vezes se necessário.</p>
              <p className="text-slate-600"><strong>Se refratário:</strong> Albumina 5% (0,5 a 1,0 g/kg), hemotransfusão e drogas vasoativas em UTI.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
