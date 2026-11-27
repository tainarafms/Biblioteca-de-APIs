// Central Pure Risk Calculation Module for YouX GovTech
// Standardizes risk assessment across App.tsx, ProjectPlanView, ApiDrawer, and Modals

import { RiskLevel, IntegrationStatus, Sprint } from '../types';
import { getReferenceDate, parseDate, formatDateISO } from './date';

export interface RiskEvaluationResult {
  risco: RiskLevel; // 'verde' | 'amarelo' | 'vermelho'
  riscoMotivo: string;
  dataLimiteSolicitacao: string; // YYYY-MM-DD
  diasParaLimite: number;
}

/**
 * Pure function to calculate risk and deadline for an API within a project sprint.
 *
 * Rules:
 * - data-limite = início da sprint − (prazo máximo + 5 dias de folga)
 * - status 'Produção' ou 'Homologação' => sempre 'verde'
 * - se a data-limite já passou (< hoje) => 'vermelho'
 * - se faltam menos de 15 dias (0 a 14 dias) => 'amarelo'
 * - nos demais casos (>= 15 dias) => 'verde'
 */
export function calcularRisco(
  item: {
    status: IntegrationStatus;
    prazoMaxDias: number;
    dataLimiteSolicitacao?: string;
    [key: string]: any;
  },
  sprint?: Pick<Sprint, 'dataInicio' | 'dataFim'> | { dataInicio: string } | null,
  hoje: Date = getReferenceDate()
): RiskEvaluationResult {
  // 1. Calculate deadline date
  let deadlineDate: Date;
  if (sprint?.dataInicio) {
    const sprintStart = parseDate(sprint.dataInicio) || new Date();
    const leadDays = item.prazoMaxDias + 5; // Prazo máximo + 5 dias de folga
    deadlineDate = new Date(sprintStart.getTime() - leadDays * 24 * 60 * 60 * 1000);
  } else if (item.dataLimiteSolicitacao) {
    deadlineDate = parseDate(item.dataLimiteSolicitacao) || new Date();
  } else {
    deadlineDate = new Date();
  }

  const dataLimiteIso = formatDateISO(deadlineDate);

  // Normalize both dates to midnight local time for calendar day comparison
  const refStart = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const deadlineStart = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate()).getTime();
  const diasParaLimite = Math.round((deadlineStart - refStart) / (24 * 60 * 60 * 1000));

  // 2. Rule: Produção / Homologação => sempre verde
  if (item.status === 'Produção') {
    return {
      risco: 'verde',
      riscoMotivo: 'Etapa concluída: API homologada e em produção.',
      dataLimiteSolicitacao: dataLimiteIso,
      diasParaLimite,
    };
  }

  if (item.status === 'Homologação') {
    return {
      risco: 'verde',
      riscoMotivo: 'Etapa técnica em homologação: chaves de teste validadas.',
      dataLimiteSolicitacao: dataLimiteIso,
      diasParaLimite,
    };
  }

  // 3. Rule: se a data já passou => vermelho
  if (diasParaLimite < 0) {
    const diasAtraso = Math.abs(diasParaLimite);
    return {
      risco: 'vermelho',
      riscoMotivo: `Atraso crítico: data-limite ultrapassada há ${diasAtraso} dia${diasAtraso === 1 ? '' : 's'}!`,
      dataLimiteSolicitacao: dataLimiteIso,
      diasParaLimite,
    };
  }

  // 4. Rule: se faltam menos de 15 dias => amarelo
  if (diasParaLimite < 15) {
    return {
      risco: 'amarelo',
      riscoMotivo: diasParaLimite === 0
        ? 'Atenção máxima: data-limite de solicitação vence hoje!'
        : `Atenção: restam apenas ${diasParaLimite} dia${diasParaLimite === 1 ? '' : 's'} para a data-limite de solicitação.`,
      dataLimiteSolicitacao: dataLimiteIso,
      diasParaLimite,
    };
  }

  // 5. Rule: nos demais casos => verde
  return {
    risco: 'verde',
    riscoMotivo: `Dentro da margem de segurança (${diasParaLimite} dias restantes).`,
    dataLimiteSolicitacao: dataLimiteIso,
    diasParaLimite,
  };
}
