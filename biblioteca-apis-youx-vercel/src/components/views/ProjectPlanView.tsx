import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  GitBranch, 
  Plus, 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  Activity, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink,
  Layers,
  FolderKanban,
  Check
} from 'lucide-react';
import { 
  Projeto, 
  PlanoItem, 
  IntegrationStatus, 
  RiskLevel, 
  UserProfile,
  ApiComment,
  ApiAuditRecord,
  Sprint,
  ApiItem
} from '../../types';
import { RiskBadge } from '../common/Badges';
import { ApiDrawer } from './ApiDrawer';
import { ProjectActivityFeed } from './ProjectActivityFeed';
import { calcularRisco } from '../../utils/risk';
import { getReferenceDate, formatDateBR } from '../../utils/date';

interface ProjectPlanViewProps {
  projeto: Projeto;
  allProjetos: Projeto[];
  onSelectProjeto: (projId: string) => void;
  onUpdatePlanoItem: (planoId: string, updates: Partial<PlanoItem>) => void;
  onOpenAddApiModal: () => void;
  onSelectApiById: (apiId: string) => void;
  currentUser: UserProfile;
  comments: ApiComment[];
  auditLogs: ApiAuditRecord[];
  activeDrawerApiId: string | null;
  onOpenDrawer: (apiId: string | null) => void;
  followingApiIds: string[];
  onToggleFollowApi: (apiId: string) => void;
  onAddComment: (apiId: string, texto: string) => void;
  onEditComment: (commentId: string, newText: string) => void;
  onSaveAsMacete: (apiId: string, texto: string, autor: string, cargo: string) => void;
  allCatalogApis?: ApiItem[];
  referenceDate?: Date;
}

export const ProjectPlanView: React.FC<ProjectPlanViewProps> = ({
  projeto,
  allProjetos,
  onSelectProjeto,
  onUpdatePlanoItem,
  onOpenAddApiModal,
  onSelectApiById,
  currentUser,
  comments,
  auditLogs,
  activeDrawerApiId,
  onOpenDrawer,
  followingApiIds,
  referenceDate = getReferenceDate(),
  onToggleFollowApi,
  onAddComment,
  onEditComment,
  onSaveAsMacete,
  allCatalogApis = [],
}) => {
  // Navigation tabs: 'tabela' | 'timeline' | 'atividade'
  const [activeTab, setActiveTab] = useState<'tabela' | 'timeline' | 'atividade'>('tabela');
  const [showProjectsList, setShowProjectsList] = useState(false);
  const [ganttTooltipApi, setGanttTooltipApi] = useState<string | null>(null);

  // Summary calculations
  const totalConexoes = projeto.plano.length;
  const apisEmRisco = projeto.plano.filter((p) => p.risco === 'vermelho').length;

  const sortedDeadlines = [...projeto.plano].sort(
    (a, b) => new Date(a.dataLimiteSolicitacao).getTime() - new Date(b.dataLimiteSolicitacao).getTime()
  );
  const proximaDataLimite = sortedDeadlines[0]?.dataLimiteSolicitacao || 'N/A';

  const statusOptions: IntegrationStatus[] = [
    'Não solicitada',
    'Em solicitação',
    'Homologação',
    'Produção'
  ];

  // Currently selected API for side drawer
  const activePlanoItem = activeDrawerApiId
    ? projeto.plano.find((p) => p.apiId === activeDrawerApiId) || null
    : null;

  const activeCatalogApi = activePlanoItem
    ? allCatalogApis.find((a) => a.id === activePlanoItem.apiId)
    : undefined;

  // Comments & audit logs for currently active API in drawer
  const drawerComments = comments.filter((c) => c.apiId === activeDrawerApiId);
  const drawerAuditLogs = auditLogs.filter((a) => a.apiId === activeDrawerApiId);

  // Helper to count comments for a given API
  const getCommentsCount = (apiId: string) => {
    return comments.filter((c) => c.apiId === apiId).length;
  };

  // Helper to handle field change from drawer
  const handleDrawerFieldChange = (
    field: string,
    oldValue: string,
    newValue: string,
    updates: Partial<PlanoItem>
  ) => {
    if (!activePlanoItem) return;
    onUpdatePlanoItem(activePlanoItem.id, updates);
  };

  // Helper for situation sentence of each project in the list
  const getProjectSituation = (p: Projeto) => {
    const emRisco = p.plano.filter((item) => item.risco === 'vermelho').length;
    const sorted = [...p.plano].sort(
      (a, b) => new Date(a.dataLimiteSolicitacao).getTime() - new Date(b.dataLimiteSolicitacao).getTime()
    );
    const prox = sorted[0]?.dataLimiteSolicitacao ? formatDateBR(sorted[0].dataLimiteSolicitacao) : 'N/A';
    if (emRisco > 0) {
      return `${emRisco} ${emRisco === 1 ? 'API em risco' : 'APIs em risco'} · próxima data-limite: ${prox}`;
    }
    return `Nenhuma API em risco · próxima data-limite: ${prox}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Projects List Strip / Switcher */}
      <section 
        aria-label="Lista e seleção de projetos" 
        className="bg-white dark:bg-[#1C1519] rounded-2xl border border-[#E8DFE3] dark:border-[#2E2328] shadow-xs p-5 transition-colors space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FAF7F8] dark:bg-[#251A21] border border-[#E8DFE3] dark:border-[#38262E] text-[#8B1D47] dark:text-[#E55488]">
                {projeto.sigla}
              </span>
              <span className="text-xs font-semibold text-[#54494E] dark:text-[#A3969C]">
                Cliente: <strong className="text-[#1F1A1C] dark:text-[#F7EFF2]">{projeto.cliente}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1A1C] dark:text-[#F7EFF2] tracking-tight mt-1">
              {projeto.nome}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProjectsList(!showProjectsList)}
              aria-expanded={showProjectsList}
              aria-label="Alternar ou visualizar outros projetos"
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8DFE3] dark:border-[#38262E] hover:border-[#8B1D47] dark:hover:border-[#E55488] bg-[#FAF7F8] dark:bg-[#22181E] text-xs font-bold text-[#1F1A1C] dark:text-[#F7EFF2] flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
            >
              <FolderKanban className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488]" aria-hidden="true" />
              <span>{showProjectsList ? 'Ocultar outros projetos' : 'Alternar projeto'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProjectsList ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onOpenAddApiModal}
              className="min-h-[44px] px-4 py-2 bg-[#8B1D47] dark:bg-[#C8376A] hover:bg-[#731639] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Adicionar API</span>
            </button>
          </div>
        </div>

        {/* Expanded Projects List (Simples, uma linha por projeto com nome, cliente, frase de situação e responsável) */}
        {showProjectsList && (
          <div className="pt-4 border-t border-[#E8DFE3] dark:border-[#2C1F25] space-y-2 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] uppercase tracking-wider block mb-2">
              Todos os projetos ativos
            </span>
            <div className="space-y-2">
              {allProjetos.map((proj) => {
                const isSelected = proj.id === projeto.id;
                const situation = getProjectSituation(proj);

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onSelectProjeto(proj.id);
                      setShowProjectsList(false);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectProjeto(proj.id);
                        setShowProjectsList(false);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none ${
                      isSelected
                        ? 'bg-[#FAF7F8] dark:bg-[#251A21] border-[#8B1D47] dark:border-[#E55488] shadow-xs'
                        : 'bg-white dark:bg-[#181115] border-[#E8DFE3] dark:border-[#2C1F25] hover:border-[#8B1D47]/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1F1A1C] dark:text-[#F7EFF2]">
                          {proj.nome}
                        </span>
                        <span className="text-xs text-secondary">
                          · {proj.cliente}
                        </span>
                      </div>
                      <p className="text-xs text-secondary font-semibold mt-0.5">
                        {situation}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-6 h-6 rounded-md bg-primary text-primary-fg text-xs font-bold flex items-center justify-center">
                          {proj.responsavel.substring(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium text-main">
                          {proj.responsavel}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary-light flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ativo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Three Tabs: Tabela, Linha do tempo, Atividade */}
      <section 
        aria-label="Navegação do projeto"
        className="bg-white dark:bg-[#1C1519] p-3 rounded-2xl border border-[#E8DFE3] dark:border-[#2E2328] shadow-xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F8] dark:bg-[#22181E] rounded-xl border border-[#E8DFE3] dark:border-[#38262E]">
          <button
            type="button"
            onClick={() => setActiveTab('tabela')}
            aria-pressed={activeTab === 'tabela'}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none ${
              activeTab === 'tabela'
                ? 'bg-[#8B1D47] dark:bg-[#C8376A] text-white font-bold shadow-xs'
                : 'text-[#4A3E44] dark:text-[#D1C6CB] font-semibold hover:text-[#1F1A1C] dark:hover:text-[#F7EFF2]'
            }`}
          >
            <TableIcon className="w-4 h-4" aria-hidden="true" />
            <span>Tabela</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            aria-pressed={activeTab === 'timeline'}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none ${
              activeTab === 'timeline'
                ? 'bg-[#8B1D47] dark:bg-[#C8376A] text-white font-bold shadow-xs'
                : 'text-[#4A3E44] dark:text-[#D1C6CB] font-semibold hover:text-[#1F1A1C] dark:hover:text-[#F7EFF2]'
            }`}
          >
            <GitBranch className="w-4 h-4" aria-hidden="true" />
            <span>Linha do tempo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('atividade')}
            aria-pressed={activeTab === 'atividade'}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none ${
              activeTab === 'atividade'
                ? 'bg-[#8B1D47] dark:bg-[#C8376A] text-white font-bold shadow-xs'
                : 'text-[#4A3E44] dark:text-[#D1C6CB] font-semibold hover:text-[#1F1A1C] dark:hover:text-[#F7EFF2]'
            }`}
          >
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span>Atividade</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-[#8B1D47]/10 dark:bg-[#C8376A]/20 text-[#8B1D47] dark:text-[#E55488] font-bold">
              {comments.length + auditLogs.length}
            </span>
          </button>
        </div>

        {/* Active Tab Helper Info */}
        <span className="text-xs text-[#54494E] dark:text-[#A3969C] hidden md:inline font-medium">
          Clique em qualquer API para abrir o painel lateral de conversa e auditoria
        </span>
      </section>

      {/* TAB 1: TABELA (Mais limpa, com resumo de uma linha e aviso compacto) */}
      {activeTab === 'tabela' && (
        <div className="space-y-4">
          {/* 1-Line Summary Text (Substitui os 4 cartões coloridos) */}
          <div className="p-3.5 px-4 rounded-xl bg-surface border border-border-default flex items-center justify-between text-sm font-semibold text-main">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" aria-hidden="true" />
              <span>
                <strong className="tabular-nums">{totalConexoes} conexões</strong> · <span className="text-danger-text font-bold tabular-nums">{apisEmRisco} em risco</span> · próxima data-limite: <strong className="font-sans tabular-nums">{formatDateBR(proximaDataLimite)}</strong>
              </span>
            </div>
            <span className="text-xs text-muted hidden sm:inline tabular-nums">
              Referência operacional: {formatDateBR(referenceDate)}
            </span>
          </div>

          {/* Compact 1-line Bottleneck Alert (Apenas este aviso usa vermelho em destaque) */}
          {apisEmRisco > 0 && (
            <div 
              role="alert"
              className="p-3 px-4 rounded-xl bg-danger-bg border border-danger-border text-danger-text text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-danger-text shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Gargalo identificado: SICAR e Assinatura gov.br estão em situação crítica de prazo.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenDrawer('sicar')}
                className="text-xs font-bold text-danger-text hover:underline shrink-0 cursor-pointer min-h-[44px] px-2 flex items-center focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                Ver detalhes →
              </button>
            </div>
          )}

          {/* Streamlined Clean Table */}
          <section 
            aria-label="Tabela do plano de integração"
            className="bg-surface rounded-2xl border border-border-default shadow-xs overflow-hidden transition-colors"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-bg-page text-secondary border-b border-border-default">
                  <tr>
                    <th scope="col" className="py-3.5 px-4 font-bold">API</th>
                    <th scope="col" className="py-3.5 px-4 font-bold">Status</th>
                    <th scope="col" className="py-3.5 px-4 font-bold">Sprint</th>
                    <th scope="col" className="py-3.5 px-4 font-bold">Data-limite</th>
                    <th scope="col" className="py-3.5 px-4 font-bold">Responsável</th>
                    <th scope="col" className="py-3.5 px-4 font-bold text-center">Risco</th>
                    <th scope="col" className="py-3.5 px-4 font-bold text-center">Conversa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {projeto.plano.map((item) => {
                    const commentsCount = getCommentsCount(item.apiId);
                    const isDrawerOpenForThis = activeDrawerApiId === item.apiId;

                    return (
                      <tr 
                        key={item.id}
                        onClick={() => onOpenDrawer(item.apiId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenDrawer(item.apiId);
                          }
                        }}
                        className={`transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-focus-ring ${
                          isDrawerOpenForThis
                            ? 'bg-primary-light'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        {/* Column 1: API (nome + órgão em texto de apoio) */}
                        <td className="py-3.5 px-4">
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-main group-hover:text-primary transition-colors block">
                              {item.apiNome}
                            </span>
                            <span className="text-xs text-muted block mt-0.5">
                              {item.apiOrgao}
                            </span>
                            {item.dependeDeApiId && (
                              <span className="mt-1 inline-flex items-center gap-1 text-xs text-warning-text bg-warning-bg px-2 py-0.5 rounded border border-warning-border font-semibold">
                                <GitBranch className="w-3.5 h-3.5" /> Exige Login gov.br
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 2: Status (inline editável, com indicação de edição ao passar o mouse e focar) */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.status}
                            aria-label={`Status da API ${item.apiNome}`}
                            onChange={(e) => {
                              const newStatus = e.target.value as IntegrationStatus;
                              let novoRisco = item.risco;
                              if (newStatus === 'Produção' || newStatus === 'Homologação') {
                                novoRisco = 'verde';
                              }
                              onUpdatePlanoItem(item.id, {
                                status: newStatus,
                                risco: novoRisco,
                              });
                            }}
                            className="min-h-[38px] px-2.5 py-1 bg-transparent hover:bg-white dark:hover:bg-[#20151B] border border-transparent hover:border-[#E8DFE3] dark:hover:border-[#38262E] focus:border-[#8B1D47] rounded-lg text-xs font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
                          >
                            {statusOptions.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Column 3: Sprint (inline editável) */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.sprintId}
                            aria-label={`Sprint da API ${item.apiNome}`}
                            onChange={(e) => {
                              const newSprintId = Number(e.target.value);
                              const targetSprint = projeto.sprints.find((s) => s.id === newSprintId);
                              if (targetSprint) {
                                const riskResult = calcularRisco(
                                  { ...item, sprintId: newSprintId },
                                  targetSprint,
                                  referenceDate
                                );

                                onUpdatePlanoItem(item.id, {
                                  sprintId: newSprintId,
                                  dataLimiteSolicitacao: riskResult.dataLimiteSolicitacao,
                                  risco: riskResult.risco,
                                });
                              }
                            }}
                            className="min-h-[38px] px-2.5 py-1 bg-transparent hover:bg-white dark:hover:bg-[#20151B] border border-transparent hover:border-[#E8DFE3] dark:hover:border-[#38262E] focus:border-[#8B1D47] rounded-lg text-xs font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
                          >
                            {projeto.sprints.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nome}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Column 4: Data-limite */}
                        <td className="py-3.5 px-4 font-sans tabular-nums font-bold text-xs text-main">
                          {formatDateBR(item.dataLimiteSolicitacao)}
                        </td>

                        {/* Column 5: Responsável (avatar + nome) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-primary text-primary-fg text-xs font-bold flex items-center justify-center shrink-0">
                              {item.responsavel.substring(0, 2).toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-main truncate">
                              {item.responsavel}
                            </span>
                          </div>
                        </td>

                        {/* Column 6: Risco (ícone + texto) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex justify-center">
                            <RiskBadge risk={item.risco} />
                          </div>
                        </td>

                        {/* Column 7: Comentários (balão + número) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-hover text-xs font-bold text-secondary group-hover:text-primary transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                            <span className="tabular-nums">{commentsCount}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: LINHA DO TEMPO (Gantt Interativo com tipografia sans-serif legível e sem rótulos cortados) */}
      {activeTab === 'timeline' && (
        <section 
          aria-labelledby="gantt-title"
          className="bg-surface rounded-2xl p-6 border border-border-default shadow-xs space-y-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 id="gantt-title" className="text-lg font-bold text-main">
                Cronograma de integrações por sprint
              </h2>
              <p className="text-xs text-muted">
                Clique em qualquer barra para abrir o painel lateral da API correspondente.
              </p>
            </div>
          </div>

          {/* Sprints header */}
          <div className="grid grid-cols-5 gap-3 bg-bg-page p-4 rounded-xl border border-border-default text-xs">
            {projeto.sprints.map((sprint) => (
              <div key={sprint.id} className="text-center">
                <span className="font-bold text-sm text-main block">
                  {sprint.nome}
                </span>
                <span className="text-xs text-secondary block mt-0.5 tabular-nums">
                  {formatDateBR(sprint.dataInicio)} - {formatDateBR(sprint.dataFim)}
                </span>
                <span className="text-xs font-semibold text-primary mt-1 block truncate" title={sprint.meta}>
                  {sprint.meta}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Rows with Sans-serif typography and accessible Tooltips */}
          <div className="space-y-3 pt-2">
            {projeto.plano.map((item) => {
              const startSprint = Math.max(1, item.sprintId - 1);
              const targetSprint = item.sprintId;
              const isChained = Boolean(item.dependeDeApiId);
              const commentsCount = getCommentsCount(item.apiId);

              return (
                <div 
                  key={item.id} 
                  className="space-y-2 bg-surface-hover/70 p-3.5 rounded-xl border border-border-subtle"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenDrawer(item.apiId)}
                        className="font-bold text-sm text-main hover:text-primary cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring rounded"
                      >
                        {item.apiNome}
                      </button>
                      <span className="text-xs text-muted">({item.apiOrgao})</span>
                      {isChained && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-warning-bg border border-warning-border text-warning-text flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Exige Login gov.br (Sprint 2)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-muted">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{commentsCount}</span>
                      </div>
                      <span className="text-xs font-semibold text-secondary tabular-nums">
                        Limite: {formatDateBR(item.dataLimiteSolicitacao)}
                      </span>
                      <RiskBadge risk={item.risco} />
                    </div>
                  </div>

                  {/* Bar track */}
                  <div className="grid grid-cols-5 gap-3 h-10 items-center relative bg-white dark:bg-[#181115] rounded-lg p-1 border border-[#E8DFE3] dark:border-[#38262E]">
                    <div className="absolute inset-0 grid grid-cols-5 divide-x divide-[#E8DFE3]/50 dark:divide-[#2E2328] pointer-events-none">
                      <div></div><div></div><div></div><div></div><div></div>
                    </div>

                    {/* Interactive Gantt Bar (Clickable -> Opens Drawer) */}
                    <button
                      type="button"
                      onClick={() => onOpenDrawer(item.apiId)}
                      onMouseEnter={() => setGanttTooltipApi(item.apiId)}
                      onMouseLeave={() => setGanttTooltipApi(null)}
                      onFocus={() => setGanttTooltipApi(item.apiId)}
                      onBlur={() => setGanttTooltipApi(null)}
                      aria-label={`${item.apiNome}: Entrega na Sprint ${targetSprint}, Risco ${item.risco}. Clique para abrir painel.`}
                      className={`h-8 rounded-md flex items-center justify-between px-3 text-xs font-bold z-10 transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none ${
                        item.risco === 'vermelho'
                          ? 'bg-rose-700 hover:bg-rose-800 text-white'
                          : item.risco === 'amarelo'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-[#8B1D47] hover:bg-[#731639] text-white'
                      }`}
                      style={{
                        gridColumnStart: startSprint,
                        gridColumnEnd: targetSprint + 1,
                      }}
                    >
                      <span className="truncate">
                        {isChained ? '↳ Solicitação formal' : item.apiNome}
                      </span>
                      <span className="text-xs shrink-0 font-medium ml-2 opacity-90">
                        Sprint {targetSprint}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: ATIVIDADE (Feed Consolidado por Dia com Filtros) */}
      {activeTab === 'atividade' && (
        <ProjectActivityFeed
          comments={comments}
          auditLogs={auditLogs}
          planoItems={projeto.plano}
          referenceDate={referenceDate}
          onOpenApiDrawer={(apiId) => onOpenDrawer(apiId)}
        />
      )}

      {/* 3. Lateral Side Drawer (~520px) */}
      {activePlanoItem && (
        <ApiDrawer
          isOpen={Boolean(activeDrawerApiId)}
          onClose={() => onOpenDrawer(null)}
          apiItem={activePlanoItem}
          apiCatalogData={activeCatalogApi}
          allSprints={projeto.sprints}
          allPlanoItems={projeto.plano}
          currentUser={currentUser}
          referenceDate={referenceDate}
          comments={drawerComments}
          auditLogs={drawerAuditLogs}
          isFollowing={followingApiIds.includes(activePlanoItem.apiId)}
          onToggleFollow={() => onToggleFollowApi(activePlanoItem.apiId)}
          onUpdateField={handleDrawerFieldChange}
          onAddComment={(texto) => onAddComment(activePlanoItem.apiId, texto)}
          onEditComment={onEditComment}
          onSaveAsMacete={(texto, autor, cargo) => onSaveAsMacete(activePlanoItem.apiId, texto, autor, cargo)}
          onSelectAnotherApi={(anotherApiId) => onOpenDrawer(anotherApiId)}
        />
      )}
    </div>
  );
};
