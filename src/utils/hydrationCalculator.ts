import { DengueGroup, HydrationCalculation } from '../types';

export function calculateHydration(
  weightKg: number,
  isPediatric: boolean,
  group: DengueGroup,
  customAgeYears?: number
): HydrationCalculation {
  const safeWeight = Math.max(1, Math.min(250, weightKg || 60));
  
  // Calculate oral volumes
  let totalDailyVolumeMl = 0;
  if (isPediatric || (customAgeYears !== undefined && customAgeYears < 13)) {
    if (safeWeight <= 10) {
      totalDailyVolumeMl = safeWeight * 130;
    } else if (safeWeight <= 20) {
      totalDailyVolumeMl = safeWeight * 100;
    } else {
      totalDailyVolumeMl = safeWeight * 80;
    }
  } else {
    // Adult: 60 mL/kg/day
    totalDailyVolumeMl = safeWeight * 60;
  }

  const oralRehydrationMl = Math.round((totalDailyVolumeMl * (1 / 3)));
  const homeFluidsMl = Math.round(totalDailyVolumeMl - oralRehydrationMl);

  // Group C Expansion: 10 mL/kg in 1 hour, and 10 mL/kg in 2nd hour
  const expansion1hVol = Math.round(safeWeight * 10);
  const expansion1hRate = expansion1hVol; // in 1h -> rate is same
  const expansion1hDrops = Math.round(expansion1hRate / 3);

  // Group C Maintenance:
  // 1st phase: 25 mL/kg in 6 hours
  const maintenance6hVol = Math.round(safeWeight * 25);
  const maintenance6hRate = Math.round(maintenance6hVol / 6);
  const maintenance6hDrops = Math.round(maintenance6hRate / 3);

  // 2nd phase: 25 mL/kg in 8 hours
  const maintenance8hVol = Math.round(safeWeight * 25);
  const maintenance8hRate = Math.round(maintenance8hVol / 8);
  const maintenance8hDrops = Math.round(maintenance8hRate / 3);

  // Group D Rapid Expansion: 20 mL/kg in 20 minutes (0.333 hours)
  const rapidExp20minVol = Math.round(safeWeight * 20);
  const rapidExpRate = Math.round(rapidExp20minVol * 3); // mL per hour equivalent

  // Albumin 5%: 0.5 - 1.0 g/kg (avg 0.75 g/kg) -> at 5% (0.05 g/mL) = 15 mL/kg of 5% solution
  const albuminVol = Math.round(safeWeight * 15);

  return {
    weightKg: safeWeight,
    isPediatric,
    group,
    totalDailyVolumeMl: Math.round(totalDailyVolumeMl),
    oralRehydrationMl,
    homeFluidsMl,

    expansionStage1VolumeMl: expansion1hVol,
    expansionStage1DurationHours: 1,
    expansionStage1RateMlH: expansion1hRate,
    expansionStage1DropsMin: expansion1hDrops,
    expansionStage1MicrodropsMin: expansion1hRate,

    expansionStage2VolumeMl: expansion1hVol,
    expansionStage2DurationHours: 1,
    expansionStage2RateMlH: expansion1hRate,
    expansionStage2DropsMin: expansion1hDrops,

    maintenancePhase1VolumeMl: maintenance6hVol,
    maintenancePhase1DurationHours: 6,
    maintenancePhase1RateMlH: maintenance6hRate,
    maintenancePhase1DropsMin: maintenance6hDrops,

    maintenancePhase2VolumeMl: maintenance8hVol,
    maintenancePhase2DurationHours: 8,
    maintenancePhase2RateMlH: maintenance8hRate,
    maintenancePhase2DropsMin: maintenance8hDrops,

    rapidExpansionVolume20min: rapidExp20minVol,
    rapidExpansionRateMlH: rapidExpRate,
    albumin5PercentVolumeMl: albuminVol,
  };
}

export function calculateMeanArterialPressure(pas: number, pad: number): number {
  if (!pas || !pad) return 0;
  return Math.round((pas + 2 * pad) / 3);
}

export function calculatePulsePressure(pas: number, pad: number): number {
  if (!pas || !pad) return 0;
  return pas - pad;
}

export function evaluateTourniquetTest(
  petechiaeCount: number,
  isPediatric: boolean
): { isPositive: boolean; message: string; threshold: number } {
  const threshold = isPediatric ? 10 : 20;
  const isPositive = petechiaeCount >= threshold;
  
  return {
    isPositive,
    threshold,
    message: isPositive
      ? `Prova do Laço POSITIVA (≥ ${threshold} petéquias no quadrado de 2,5 x 2,5 cm). Indica fragilidade capilar e sangramento induzido. Classificar no mínimo como GRUPO B.`
      : `Prova do Laço NEGATIVA (< ${threshold} petéquias no quadrado de 2,5 x 2,5 cm). Não afasta diagnóstico de dengue. Reavaliar clinicamente.`,
  };
}

export function calculateDiuresisRate(
  volumeMl: number,
  periodHours: number,
  weightKg: number
): { rateMlKgH: number; isOliguric: boolean; statusLabel: string; statusColor: string } {
  if (!volumeMl || !periodHours || !weightKg || periodHours <= 0 || weightKg <= 0) {
    return {
      rateMlKgH: 0,
      isOliguric: false,
      statusLabel: 'Aguardando dados',
      statusColor: 'text-slate-500',
    };
  }

  const rate = Number((volumeMl / (periodHours * weightKg)).toFixed(2));
  const isOliguric = rate < 1.0;

  if (rate < 0.5) {
    return {
      rateMlKgH: rate,
      isOliguric: true,
      statusLabel: 'Oligúria Grave / Anúria (< 0,5 mL/kg/h)',
      statusColor: 'text-red-700 font-bold',
    };
  } else if (rate < 1.0) {
    return {
      rateMlKgH: rate,
      isOliguric: true,
      statusLabel: 'Oligúria (< 1,0 mL/kg/h - meta não atingida)',
      statusColor: 'text-amber-700 font-semibold',
    };
  } else {
    return {
      rateMlKgH: rate,
      isOliguric: false,
      statusLabel: 'Diurese Adequada (≥ 1,0 mL/kg/h)',
      statusColor: 'text-emerald-700 font-semibold',
    };
  }
}
