import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Clock, 
  ShieldAlert, 
  AlertCircle
} from 'lucide-react';
import { DifficultyLevel, IntegrationStatus, RiskLevel } from '../../types';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  showIcon?: boolean;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ level, showIcon = true }) => {
  switch (level) {
    case 'Fácil':
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-success-bg text-success-text border border-success-border whitespace-nowrap shrink-0"
        >
          {showIcon && <Zap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>Fácil</span>
        </span>
      );
    case 'Média':
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-warning-bg text-warning-text border border-warning-border whitespace-nowrap shrink-0"
        >
          {showIcon && <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>Média</span>
        </span>
      );
    case 'Burocrática':
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-danger-bg text-danger-text border border-danger-border whitespace-nowrap shrink-0"
        >
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>Burocrática</span>
        </span>
      );
    default:
      return <span className="text-xs font-medium text-text-secondary">{level}</span>;
  }
};

interface RiskBadgeProps {
  risk: RiskLevel;
  showText?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, showText = true }) => {
  switch (risk) {
    case 'verde':
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-success-bg text-success-text border border-success-border" 
          title="Dentro do prazo operacional"
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {showText && <span>No prazo</span>}
        </span>
      );
    case 'amarelo':
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-warning-bg text-warning-text border border-warning-border" 
          title="Prazo próximo ao limite de segurança"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {showText && <span>Atenção</span>}
        </span>
      );
    case 'vermelho':
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-danger-bg text-danger-text border border-danger-border" 
          title="Risco crítico: prazo estourado!"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {showText && <span>Crítico</span>}
        </span>
      );
    default:
      return null;
  }
};

interface StatusBadgeProps {
  status: IntegrationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Não solicitada':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-hover text-text-secondary border border-border-default">
          <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" aria-hidden="true" />
          <span>Não solicitada</span>
        </span>
      );
    case 'Em solicitação':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-info-bg text-info-text border border-info-border">
          <span className="w-1.5 h-1.5 rounded-full bg-info-text shrink-0" aria-hidden="true" />
          <span>Em solicitação</span>
        </span>
      );
    case 'Homologação':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-warning-bg text-warning-text border border-warning-border">
          <span className="w-1.5 h-1.5 rounded-full bg-warning-text shrink-0" aria-hidden="true" />
          <span>Homologação</span>
        </span>
      );
    case 'Produção':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-success-bg text-success-text border border-success-border">
          <span className="w-1.5 h-1.5 rounded-full bg-success-text shrink-0" aria-hidden="true" />
          <span>Produção</span>
        </span>
      );
    default:
      return null;
  }
};
