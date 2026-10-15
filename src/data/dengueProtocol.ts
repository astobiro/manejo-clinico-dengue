import { DengueGroup, TriageResult, WarningSigns, SeveritySigns, SpecialConditions } from '../types';

export const SUSPECTED_DENGUE_DEFINITION = {
  title: 'Definição de Caso Suspeito de Dengue',
  feverCriteria: 'Relato de febre, usualmente entre 2 e 7 dias de duração',
  symptomThreshold: 'E 2 (duas) ou mais das seguintes manifestações clínicas:',
  symptomsList: [
    { id: 'nauseaVomiting', label: 'Náuseas ou vômitos', icon: '🤢' },
    { id: 'rash', label: 'Exantema (manchas vermelhas na pele)', icon: '🔴' },
    { id: 'myalgiaArthralgia', label: 'Mialgia (dor muscular) ou artralgia (dor nas articulações)', icon: '🦴' },
    { id: 'headacheRetroorbital', label: 'Cefaleia (dor de cabeça) ou dor retro-orbital (atrás dos olhos)', icon: '🤕' },
    { id: 'petechiaeOrTourniquet', label: 'Petéquias ou Prova do Laço positiva', icon: '🩸' },
    { id: 'leukopenia', label: 'Leucopenia (contagem de leucócitos reduzida)', icon: '🔬' },
  ],
  pediatricCriterion: 'Toda criança proveniente ou residente em área com transmissão de dengue, com quadro febril agudo (2 a 7 dias) e sem foco de infecção aparente.',
  notificationNotice: 'NOTIFICAR TODO CASO SUSPEITO DE DENGUE NO SINAN (Notificação Compulsória).',
};

export const WARNING_SIGNS_LIST: { id: keyof WarningSigns; label: string; desc: string; icon: string }[] = [
  {
    id: 'intenseContinuousAbdominalPain',
    label: 'Dor abdominal intensa (referida ou à palpação) e contínua',
    desc: 'Indica congestão hepática, isquemia mesentérica ou acúmulo de líquido peritoneal inicial.',
    icon: '⚡',
  },
  {
    id: 'persistentVomiting',
    label: 'Vômitos persistentes',
    desc: 'Mais de 3 episódios em 1 hora ou mais de 4 episódios em 6 horas, impossibilitando hidratação oral.',
    icon: '🤮',
  },
  {
    id: 'fluidAccumulation',
    label: 'Acúmulo de líquidos (ascite, derrame pleural, derrame pericárdico)',
    desc: 'Sinal inequívoco de extravasamento plasmático para terceiro espaço.',
    icon: '💧',
  },
  {
    id: 'posturalHypotensionLipotimia',
    label: 'Hipotensão postural e/ou lipotimia (tontura ao se levantar, desmaio)',
    desc: 'Reflete hipovolemia por perda de volume intravascular.',
    icon: '😵',
  },
  {
    id: 'hepatomegalyOver2cm',
    label: 'Hepatomegalia maior do que 2 cm abaixo do rebordo costal',
    desc: 'Fígado doloroso e aumentado (> 2 cm do RCD), frequente em crianças e adultos.',
    icon: '🫁',
  },
  {
    id: 'mucosalBleeding',
    label: 'Sangramento de mucosa (gengivorragia, epistaxe, metrorragia volumosa, hematúria)',
    desc: 'Hemorragias ativas de mucosas refletindo coagulopatia ou vasculopatia.',
    icon: '🩸',
  },
  {
    id: 'lethargyIrritability',
    label: 'Letargia e/ou irritabilidade intensa',
    desc: 'Hipóxia e hipoperfusão do SNC secundárias à diminuição do fluxo sanguíneo cerebral.',
    icon: '🧠',
  },
  {
    id: 'progressiveHematocritIncrease',
    label: 'Aumento progressivo do hematócrito (hemoconcentração)',
    desc: 'Elevação seriada do Ht confirmando extravasamento de plasma do leito capilar.',
    icon: '📈',
  },
];

export const SEVERITY_SIGNS_LIST: { id: keyof SeveritySigns; label: string; desc: string; icon: string }[] = [
  {
    id: 'severePlasmaLeakageShock',
    label: 'Extravasamento grave de plasma levando ao choque',
    desc: 'Evidenciado por: taquicardia, extremidades frias, pulso fraco/filiforme, enchimento capilar lento (> 2 segundos), PA convergente (PA diferencial < 20 mmHg) e oligúria (< 1,5 mL/kg/h).',
    icon: '🚨',
  },
  {
    id: 'hypotensionCyanosisLateShock',
    label: 'Hipotensão arterial e/ou cianose (sinais de fase tardia do choque)',
    desc: 'PAS < 90 mmHg ou PAM < 65 mmHg em adultos, ou abaixo do percentil 5 em crianças. Choque descompensado.',
    icon: '📉',
  },
  {
    id: 'respiratoryFailureFluidOverload',
    label: 'Acumulação de líquidos com insuficiência respiratória',
    desc: 'Derrame pleural maciço ou edema agudo de pulmão causando taquipneia e hipoxemia.',
    icon: '🫁',
  },
  {
    id: 'severeBleeding',
    label: 'Sangramento grave',
    desc: 'Hemorragia digestiva alta/baixa abundante (hematêmese, melena), sangramento no SNC ou que cause instabilidade hemodinâmica.',
    icon: '🩸',
  },
  {
    id: 'severeOrganImpairment',
    label: 'Comprometimento grave de órgãos',
    desc: 'Hepatite grave (transaminases AST/TGO ou ALT/TGP > 1000 U/L), encefalopatia / miocardite / nefrite aguda.',
    icon: '⚠️',
  },
];

export const SPECIAL_CONDITIONS_LIST: { id: keyof SpecialConditions; label: string; group: string; icon: string }[] = [
  { id: 'infantUnder24Months', label: 'Lactentes (< 24 meses)', group: 'Extremos de Idade', icon: '👶' },
  { id: 'pregnant', label: 'Gestantes (qualquer trimestre)', group: 'Fisiológica', icon: '🤰' },
  { id: 'elderlyOver65', label: 'Adultos idosos (> 65 anos)', group: 'Extremos de Idade', icon: '🧓' },
  { id: 'hypertensionOrCardiovascular', label: 'Hipertensão arterial sistêmica ou cardiopatia grave', group: 'Cardiovascular', icon: '❤️' },
  { id: 'diabetesMellitus', label: 'Diabetes mellitus', group: 'Metabólica', icon: '💉' },
  { id: 'copdOrAsthma', label: 'DPOC (Doença Pulmonar Obstrutiva Crônica) ou asma brônquica', group: 'Respiratória', icon: '🫁' },
  { id: 'obesity', label: 'Obesidade (IMC ≥ 30 em adultos ou percentil elevado em crianças)', group: 'Metabólica', icon: '⚖️' },
  { id: 'chronicHematologicDisease', label: 'Doença hematológica crônica (anemia falciforme, talassemia, etc.)', group: 'Hematológica', icon: '🩸' },
  { id: 'chronicKidneyDisease', label: 'Doença renal crônica (qualquer estágio)', group: 'Renal', icon: '🧪' },
  { id: 'pepticAcidDisease', label: 'Doença ácido-péptica ativa (úlcera gástrica/duodenal)', group: 'Gastrointestinal', icon: '🩺' },
  { id: 'hepatopathyOrAutoimmune', label: 'Hepatopatias crônicas ou doenças autoimunes', group: 'Hepatologia/Imunologia', icon: '🛡️' },
  { id: 'socialRiskOrOralHydrationImpossibility', label: 'Risco social, abandono ou impossibilidade de hidratação oral domiciliar', group: 'Vulnerabilidade', icon: '🏠' },
  { id: 'skinBleedingSpontaneousOrInduced', label: 'Sangramento espontâneo de pele (petéquias) ou induzido (Prova do Laço positiva)', group: 'Sangramento', icon: '⭕' },
];

export const DISCHARGE_CRITERIA_DETAILS = [
  {
    key: 'hemodynamicStability48h',
    title: '1. Estabilização hemodinâmica durante 48 horas',
    description: 'Pressão arterial normal e estável, pulso cheio e simétrico, tempo de enchimento capilar < 2s e diurese adequada (≥ 1 mL/kg/h) mantidos por 48 horas sem expansão volêmica.',
  },
  {
    key: 'noFever24hWithoutAntipyretics',
    title: '2. Ausência de febre por 24 horas',
    description: 'Temperatura axilar < 37,5°C durante pelo menos 24 horas sem o uso de antitérmicos (dipirona/paracetamol).',
  },
  {
    key: 'visibleClinicalImprovement',
    title: '3. Melhora visível do quadro clínico',
    description: 'Retorno espontâneo do apetite, bom estado geral, ausência de prostração excessiva e tolerância total à dieta e hidratação oral.',
  },
  {
    key: 'normalStableHematocrit24h',
    title: '4. Hematócrito normal e estável por 24 horas',
    description: 'Hematócrito nos valores basais do paciente ou de referência populacional sem variação significativa por 24 horas consecutivas.',
  },
  {
    key: 'risingPlatelets',
    title: '5. Plaquetas em franca elevação',
    description: 'Contagem de plaquetas em ascensão progressiva (> 50.000/mm³ e em curva ascendente).',
  },
  {
    key: 'resolvedAbdominalSymptomsAndLeakage',
    title: '6. Resolução dos sintomas abdominais e do extravasamento',
    description: 'Ausência total de dor abdominal e vômitos; reabsorção comprovada de ascite e derrames cavitários.',
  },
];

export const CONTRAINDICATED_MEDICATIONS = [
  { name: 'Ácido Acetilsalicílico (AAS / Aspirina)', reason: 'Risco gravíssimo de hemorragias por antiagregação plaquetária e Síndrome de Reye em crianças.' },
  { name: 'Anti-inflamatórios Não Esteroidais (AINEs)', reason: 'Ibuprofeno, Cetoprofeno, Diclofenaco, Nimesulida, Meloxicam, etc. Aumentam risco de sangramento e lesão renal.' },
  { name: 'Corticosteroides sistêmicos', reason: 'Prednisona, Dexametasona, Hidrocortisona. Não têm benefício no manejo rotineiro e aumentam imunossupressão/sangramento.' },
  { name: 'Injeções por via Intramuscular (IM)', reason: 'Contraindicadas pela formação de volumosos hematomas musculares devido à trombocitopenia.' },
];

export const GROUP_PROTOCOL_DETAILS: Record<DengueGroup, TriageResult> = {
  [DengueGroup.GROUP_A]: {
    group: DengueGroup.GROUP_A,
    title: 'GRUPO A — Dengue sem Sinais de Alarme, sem Condições Especiais',
    subtitle: 'Manejo Ambulatorial com Hidratação Oral Imediata e Cartão de Dengue',
    colorScheme: 'green',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-500',
    bgLight: 'bg-emerald-50/70',
    setting: 'Acompanhamento Ambulatorial (UBS / Centro de Saúde)',
    duration: 'Retorno obrigatório no dia da defervescência da febre ou se houver sinal de alarme',
    mandatoryExams: [
      'Exames complementares a critério médico (não obrigatórios para início do tratamento).',
      'Exames sorológicos/moleculares de confirmação (NS1, IgM, RT-PCR) devem ser colhidos para vigilância epidemiológica conforme protocolo municipal/estadual.',
    ],
    recommendedExams: [
      'Hemograma completo a critério clínico (se dúvida diagnóstica ou evolução atípica).',
    ],
    conduct: {
      hydration: 'Iniciar Hidratação Oral Imediata',
      adultDetails: 'Adultos: 60 mL/kg/dia (sendo 1/3 com Sais de Reidratação Oral - SRO e 2/3 com líquidos caseiros: água, suco de frutas, água de coco, chás). Iniciar com volume maior nas primeiras horas.',
      childDetails: 'Crianças (< 13 anos): Até 10 kg: 130 mL/kg/dia; 10 kg a 20 kg: 100 mL/kg/dia; Acima de 20 kg: 80 mL/kg/dia. Proporção: 1/3 SRO e 2/3 líquidos caseiros.',
      reassessment: 'Retorno diário ou imediato se surgirem sinais de alarme. Retorno obrigatório no dia da queda da febre (início da fase crítica, geralmente 3º a 6º dia). Se a febre persistir, retornar no 5º dia.',
      warnings: [
        'A fase crítica da dengue ocorre no momento da defervescência (queda da febre). É nesse período que surgem os sinais de alarme e risco de choque!',
        'Entregar o Cartão de Acompanhamento do Paciente com Suspeita de Dengue preenchido.',
        'Orientar a família a procurar imediatamente o serviço de saúde na presença de qualquer sinal de alarme.',
      ],
      medications: [
        'Dipirona: Adultos 500 mg a 1000 mg a cada 6h (máx 4g/dia); Crianças 10 a 15 mg/kg/dose a cada 6h.',
        'Paracetamol: Adultos 500 mg a 750 mg a cada 6h (máx 3g/dia); Crianças 10 a 15 mg/kg/dose a cada 6h.',
        'Antieméticos (se náuseas leves): Metoclopramida, Ondansetrona ou Dimenidrinato conforme faixa etária.',
      ],
      contraindications: [
        'PROIBIDO USO DE AAS (Ácido Acetilsalicílico) E ANTI-INFLAMATÓRIOS (AINEs: Ibuprofeno, Cetoprofeno, Nimesulida, Diclofenaco).',
        'PROIBIDO USO DE CORTICOSTEROIDES.',
        'PROIBIDAS INJEÇÕES INTRAMUSCULARES.',
      ],
    },
    detectedWarningSigns: [],
    detectedSeveritySigns: [],
    detectedSpecialConditions: [],
  },

  [DengueGroup.GROUP_B]: {
    group: DengueGroup.GROUP_B,
    title: 'GRUPO B — Dengue com Sangramento de Pele, Condição Especial ou Comorbidade',
    subtitle: 'Acompanhamento em Leito de Observação até Resultado de Exames',
    colorScheme: 'blue',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    badgeText: 'text-sky-700',
    borderColor: 'border-sky-500',
    bgLight: 'bg-sky-50/70',
    setting: 'Leito de Observação (UPA / UBS com leitos / Pronto Atendimento)',
    duration: 'Até resultado do hemograma e reavaliação clínica completa',
    mandatoryExams: [
      'Hemograma Completo OBRIGATÓRIO (Hematócrito, Leucócitos, Contagem de Plaquetas).',
      'Exame para confirmação diagnóstica de dengue (NS1 até o 5º dia; Sorologia IgM a partir do 6º dia).',
    ],
    recommendedExams: [
      'Glicemia de jejum / HGT (em diabéticos).',
      'Ureia e Creatinina (em nefropatas, idosos e cardiopatas).',
      'EAS / Urina 1 (se suspeita de infecção concomitante ou hematúria).',
    ],
    conduct: {
      hydration: 'Hidratação Oral Supervisionada no Leito de Observação',
      adultDetails: 'Iniciar imediatamente hidratação oral (60 mL/kg/dia - 1/3 SRO e 2/3 líquidos caseiros) enquanto aguarda o resultado do hemograma.',
      childDetails: 'Crianças: Hidratação oral no leito conforme peso (< 10kg: 130 mL/kg/dia; 10-20kg: 100 mL/kg/dia; > 20kg: 80 mL/kg/dia).',
      reassessment: 'Decisão após resultado do Hemograma:\n1. Hematócrito normal e paciente estável sem sinais de alarme: ALTA com retorno diário ambulatorial obrigatório até 48h após a remissão da febre (conduzir como Grupo A).\n2. Hemoconcentração (elevação do Ht > 10% do valor basal ou acima da referência) ou surgimento de Sinais de Alarme: CONDUZIR IMEDIATAMENTE COMO GRUPO C (internação e hidratação venosa).',
      warnings: [
        'Pacientes com condições clínicas especiais ou risco social têm maior propensão a complicações graves e desidratação rápida.',
        'Se o paciente não tolerar hidratação oral no leito (vômitos), iniciar hidratação parenteral e reavaliar para Grupo C.',
        'Preencher e entregar o Cartão de Acompanhamento de Dengue na alta.',
      ],
      medications: [
        'Dipirona e/ou Paracetamol para febre e dor.',
        'SRO no leito sob supervisão da equipe de enfermagem.',
      ],
      contraindications: [
        'PROIBIDO AAS E ANTI-INFLAMATÓRIOS (AINEs).',
        'PROIBIDO CORTICOSTEROIDES.',
        'PROIBIDAS INJEÇÕES INTRAMUSCULARES.',
      ],
    },
    detectedWarningSigns: [],
    detectedSeveritySigns: [],
    detectedSpecialConditions: [],
  },

  [DengueGroup.GROUP_C]: {
    group: DengueGroup.GROUP_C,
    title: 'GRUPO C — Dengue com Sinais de Alarme (Extravasamento Plasmático)',
    subtitle: 'Internação em Leito Hospitalar (Mínimo 48h) com Hidratação Venosa Imediata',
    colorScheme: 'amber',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-400',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-500',
    bgLight: 'bg-amber-50/70',
    setting: 'Leito de Internação Hospitalar (Mínimo 48 horas até estabilização completa)',
    duration: 'Permanência mínima de 48h em hidratação venosa contínua e reavaliação seriada',
    mandatoryExams: [
      'Hemograma Completo obrigatório e seriado (Ht inicial e a cada 2h nas fases de expansão).',
      'Dosagem de Albumina sérica.',
      'Dosagem de Transaminases hepáticas (AST/TGO e ALT/TGP).',
      'Exames específicos de confirmação de dengue (NS1 / Sorologia IgM).',
    ],
    recommendedExams: [
      'Raio X de tórax (PA, perfil e incidência de Laurell para pesquisa de derrame pleural).',
      'Ultrassonografia de abdome total (para pesquisa de ascite, espessamento da parede vesicular e hepatomegalia).',
      'Glicemia, Ureia, Creatinina, Eletrólitos (Sódio, Potássio), Gasometria arterial/venosa, Coagulograma (TAP/INR, TTPA) e Ecocardiograma.',
    ],
    conduct: {
      hydration: 'Reposição Volêmica Endovenosa Imediata (Fase de Expansão)',
      adultDetails: '1ª HORA: Iniciar imediatamente 10 mL/kg de Soro Fisiológico 0,9% em 1 hora, em qualquer nível de atenção, mesmo sem exames.\n2ª HORA: Reavaliar após 1h (PA, FC, FR, diurese). Manter SF 0,9% a 10 mL/kg/h na segunda hora até novo hematócrito (em até 2h da reposição).\nFase de Manutenção (após melhora clínica/queda do Ht):\n• 1ª etapa: 25 mL/kg em 6 horas (SF 0,9% ou Ringer Lactato).\n• 2ª etapa (se mantiver melhora): 25 mL/kg em 8 horas (1/3 SF + 2/3 SG 5%).',
      childDetails: 'Pediátrico: Idem proporções (10 mL/kg na 1ª hora e 10 mL/kg na 2ª hora). Manutenção: 25 mL/kg em 6h e 25 mL/kg em 8h.',
      reassessment: 'Reavaliação clínica a cada 1 hora e hematócrito em 2 horas:\n• Com melhora (sinais vitais estáveis, diurese ≥ 1 mL/kg/h, queda do Ht): passar para Fase de Manutenção.\n• Sem melhora do Ht ou dos parâmetros hemodinâmicos: REPETIR FASE DE EXPANSÃO (10 mL/kg/h) até 3 vezes. Se persistir sem melhora após 3ª expansão: CONDUZIR COMO GRUPO D.',
      warnings: [
        'A hidratação venosa deve ser iniciada IMEDIATAMENTE no ponto de primeiro atendimento, mesmo na UBS ou UPA, antes de qualquer transferência.',
        'Controlar rigorosamente o balanço hídrico e a diurese horária (meta: ≥ 1,0 mL/kg/h em adultos e ≥ 1,5 mL/kg/h em crianças).',
        'Cuidado com sobrecarga volêmica em idosos, cardiopatas e nefropatas (monitorar estertoração pulmonar e desconforto respiratório).',
      ],
      medications: [
        'Soro Fisiológico 0,9% ou Ringer Lactato EV.',
        'Sintomáticos endovenosos ou orais (Dipirona / Paracetamol) para dor e febre.',
        'Evitar volume excessivo quando os sinais de extravasamento cessarem.',
      ],
      contraindications: [
        'PROIBIDO AAS, AINEs E CORTICOIDES.',
        'PROIBIDAS INJEÇÕES INTRAMUSCULARES.',
      ],
    },
    detectedWarningSigns: [],
    detectedSeveritySigns: [],
    detectedSpecialConditions: [],
  },

  [DengueGroup.GROUP_D]: {
    group: DengueGroup.GROUP_D,
    title: 'GRUPO D — Dengue Grave (Choque, Sangramento Grave ou Disfunção Orgânica)',
    subtitle: 'Internação Imediata em Leito de UTI com Ressuscitação Volêmica Rápida',
    colorScheme: 'red',
    badgeBg: 'bg-red-100 text-red-900 border-red-400',
    badgeText: 'text-red-700',
    borderColor: 'border-red-600',
    bgLight: 'bg-red-50/70',
    setting: 'Leito de UTI (Terapia Intensiva) até estabilização – Mínimo 48 horas',
    duration: 'Permanência em UTI com monitorização invasiva/hemodinâmica contínua',
    mandatoryExams: [
      'Hemograma Completo imediato e de 2/2h durante expansão rápida.',
      'Albumina sérica, Transaminases (TGO/AST e TGP/ALT), Coagulograma completo (TAP/INR, TTPA, Fibrinogênio).',
      'Gasometria arterial, Lactato sérico, Ureia, Creatinina, Eletrólitos (Na, K, Ca, Mg).',
      'Tipagem sanguínea (ABO/Rh) e prova cruzada de reserva.',
    ],
    recommendedExams: [
      'Ecocardiograma à beira-leito (avaliação de contratilidade e volemia - VTI/VCI).',
      'Ultrassonografia Point-of-Care (POCUS tórax e abdome).',
      'Raio X de tórax no leito.',
    ],
    conduct: {
      hydration: 'Fase de Expansão Rápida Parenteral Imediata (Ressuscitação de Choque)',
      adultDetails: 'FASE DE EXPANSÃO RÁPIDA: Iniciar IMEDIATAMENTE Soro Fisiológico a 0,9%: 20 mL/kg em até 20 minutos (adulto e criança), em qualquer nível de complexidade, inclusive durante eventual transporte/transferência.\nReavaliação clínica a cada 15 a 30 minutos e Hematócrito em 2 horas.\nSe resposta adequada (estabilização do choque e queda do Ht): conduzir conforme GRUPO C (retornar para fase de expansão do grupo C).\nSe persistência do choque (resposta inadequada): avaliar hematócrito:\n• Hematócrito em elevação: Extravasamento maciço. Administrar expansores plasmáticos (Albumina 0,5 a 1 g/kg a 5% [25 mL albumina 20% + 75 mL SF 0,9% a cada 100 mL] ou coloides sintéticos 10 mL/kg/h).\n• Hematócrito em queda: Investigar hemorragia e coagulopatia oculta. Transfundir concentrado de hemácias (10 a 15 mL/kg/dia), plasma fresco congelado (10 mL/kg), crioprecipitado e vitamina K.',
      childDetails: 'Pediátrico: Expansão rápida com SF 0,9% 20 mL/kg em 20 min. Repetir se necessário até 3x antes de coloides.',
      reassessment: 'Reavaliação contínua (monitorização de sinais vitais a cada 15-30 min, diurese horária por sonda vesical de demora, Ht a cada 2h).',
      warnings: [
        'O choque na dengue é eminentemente hipovolêmico por extravasamento de plasma e tem instalação rápida (fase crítica).',
        'A hipotensão e cianose são sinais tardios de choque descompensado com alto risco de parada cardiorrespiratória!',
        'Transfusão de plaquetas indicada apenas em sangramento grave persistente após correção do choque e coagulopatia com plaquetas baixas e INR > 1,5x.',
        'Se surgirem sinais de desconforto respiratório ou insuficiência cardíaca congestiva após melhora do choque: suspender expansão rápida e tratar hiper-hidratação.',
      ],
      medications: [
        'Soro Fisiológico 0,9% em infusão rápida por acesso calibroso.',
        'Albumina humana a 5% ou coloides se choque refratário com hemoconcentração.',
        'Hemoderivados (concentrado de hemácias, plasma, plaquetas) se hemorragia ativa.',
        'Drogas inotrópicas / vasopressoras se disfunção miocárdica associada.',
      ],
      contraindications: [
        'CONTRAINDICAÇÃO ABSOLUTA DE AAS, AINES, CORTICOIDES E INJEÇÕES IM.',
      ],
    },
    detectedWarningSigns: [],
    detectedSeveritySigns: [],
    detectedSpecialConditions: [],
  },
};
