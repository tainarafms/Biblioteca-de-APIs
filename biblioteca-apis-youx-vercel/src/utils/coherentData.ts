// Coherent Mock Data Generator
// Keeps mock sprint dates and deadlines synchronized with the active reference date

import { Projeto, PlanoItem } from '../types';
import { PROJETOS_MOCK } from '../data/mockData';
import { parseDate, formatDateISO, getReferenceDate } from './date';
import { calcularRisco } from './risk';

const BASELINE_DATE = new Date(2026, 9, 29, 12, 0, 0); // 2026-10-29

/**
 * Generates project data where sprint dates and deadlines are aligned with the reference date.
 * If reference date is changed, dates shift coherently so the demo never shows everything broken.
 */
export function getCoherentProjetos(referenceDate: Date = getReferenceDate(), baseProjects: Projeto[] = PROJETOS_MOCK): Projeto[] {
  const refStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 12, 0, 0);
  const offsetMs = refStart.getTime() - BASELINE_DATE.getTime();

  return baseProjects.map((proj) => {
    // 1. Shift sprints
    const shiftedSprints = proj.sprints.map((sprint) => {
      const origStart = parseDate(sprint.dataInicio);
      const origEnd = parseDate(sprint.dataFim);

      const newStart = origStart ? new Date(origStart.getTime() + offsetMs) : new Date();
      const newEnd = origEnd ? new Date(origEnd.getTime() + offsetMs) : new Date();

      return {
        ...sprint,
        dataInicio: formatDateISO(newStart),
        dataFim: formatDateISO(newEnd),
      };
    });

    // 2. Recalculate each plano item with pure calcularRisco
    const shiftedPlano: PlanoItem[] = proj.plano.map((item) => {
      const sprint = shiftedSprints.find((s) => s.id === item.sprintId);
      const riskResult = calcularRisco(item, sprint, referenceDate);

      return {
        ...item,
        dataLimiteSolicitacao: riskResult.dataLimiteSolicitacao,
        risco: riskResult.risco,
        riscoMotivo: item.riscoMotivo || riskResult.riscoMotivo,
      };
    });

    return {
      ...proj,
      sprints: shiftedSprints,
      plano: shiftedPlano,
    };
  });
}
