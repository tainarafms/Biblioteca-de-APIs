import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Send, 
  AtSign, 
  Link as LinkIcon, 
  Bookmark, 
  BookmarkCheck, 
  Edit3, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Activity, 
  Check, 
  MessageSquare
} from 'lucide-react';
import { 
  PlanoItem, 
  ApiComment, 
  ApiAuditRecord, 
  IntegrationStatus, 
  RiskLevel, 
  UserProfile, 
  Sprint,
  ApiItem
} from '../../types';
import { RiskBadge } from '../common/Badges';
import { MOCK_USERS } from '../../data/mockUsers';
import { Modal } from '../common/Modal';
import { calcularRisco } from '../../utils/risk';
import { getReferenceDate } from '../../utils/date';

interface ApiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiItem: PlanoItem;
  apiCatalogData?: ApiItem;
  allSprints: Sprint[];
  allPlanoItems: PlanoItem[];
  currentUser: UserProfile;
  comments: ApiComment[];
  auditLogs: ApiAuditRecord[];
  isFollowing: boolean;
  onToggleFollow: () => void;
  onUpdateField: (field: string, oldValue: string, newValue: string, updates: Partial<PlanoItem>) => void;
  onAddComment: (texto: string) => void;
  onEditComment: (commentId: string, newText: string) => void;
  onSaveAsMacete: (texto: string, autor: string, cargo: string) => void;
  onSelectAnotherApi: (apiId: string) => void;
  referenceDate?: Date;
}

export const ApiDrawer: React.FC<ApiDrawerProps> = ({
  isOpen,
  onClose,
  apiItem,
  apiCatalogData,
  allSprints,
  allPlanoItems,
  currentUser,
  comments,
  auditLogs,
  isFollowing,
  onToggleFollow,
  onUpdateField,
  onAddComment,
  onEditComment,
  onSaveAsMacete,
  onSelectAnotherApi,
  referenceDate = getReferenceDate(),
}) => {
  const [activeFilter, setActiveFilter] = useState<'tudo' | 'conversa' | 'alteracoes'>('tudo');
  const [messageText, setMessageText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isEditingResponsavel, setIsEditingResponsavel] = useState(false);
  const [isEditingFuncionalidade, setIsEditingFuncionalidade] = useState(false);
  const [tempFuncionalidade, setTempFuncionalidade] = useState(apiItem.funcionalidadeCampo);
  const [isEditingDataLimite, setIsEditingDataLimite] = useState(false);
  const [tempDataLimite, setTempDataLimite] = useState(apiItem.dataLimiteSolicitacao);
  const [maceteSavedToast, setMaceteSavedToast] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal state when apiItem changes
  useEffect(() => {
    setTempFuncionalidade(apiItem.funcionalidadeCampo);
    setTempDataLimite(apiItem.dataLimiteSolicitacao);
    setIsEditingFuncionalidade(false);
    setIsEditingDataLimite(false);
    setIsEditingResponsavel(false);
  }, [apiItem]);

  // Scroll to bottom of chat when new comments arrive
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, auditLogs.length, isOpen]);

  if (!isOpen) return null;

  // Format date helper: YYYY-MM-DD -> DD/MM/YYYY
  const formatDateBR = (iso: string) => {
    if (!iso || !iso.includes('-')) return iso;
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const statusOptions: IntegrationStatus[] = [
    'Não solicitada',
    'Em solicitação',
    'Homologação',
    'Produção'
  ];

  // Merge and sort chronological timeline items
  type TimelineItem = 
    | { type: 'comment'; timestamp: string; data: ApiComment }
    | { type: 'audit'; timestamp: string; data: ApiAuditRecord };

  const timelineItems: TimelineItem[] = [
    ...comments.map((c) => ({ type: 'comment' as const, timestamp: c.dataHora, data: c })),
    ...auditLogs.map((a) => ({ type: 'audit' as const, timestamp: a.dataHora, data: a })),
  ];

  const filteredTimeline = timelineItems.filter((item) => {
    if (activeFilter === 'conversa') return item.type === 'comment';
    if (activeFilter === 'alteracoes') return item.type === 'audit';
    return true;
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    onAddComment(messageText.trim());
    setMessageText('');
  };

  const handleKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const insertMention = (mentionName: string) => {
    setMessageText((prev) => `${prev}@${mentionName} `);
    textareaRef.current?.focus();
  };

  const handleSaveMaceteClick = (comment: ApiComment) => {
    onSaveAsMacete(comment.texto, comment.autor, comment.cargo);
    setMaceteSavedToast('Dica salva com sucesso na aba Macetes da biblioteca!');
    setTimeout(() => {
      setMaceteSavedToast(null);
    }, 3500);
  };

  // Helper to render text with @mentions and links
  const renderMessageContent = (text: string) => {
    // Regex for URLs and @mentions
    const parts = text.split(/(@[\w\s.-]+(?:\([^)]+\))?|https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B1D47] dark:text-[#E55488] font-bold underline hover:opacity-80 inline-flex items-center gap-0.5 break-all"
          >
            {part}
          </a>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="inline-block px-1.5 py-0.5 rounded-md bg-[#8B1D47]/10 dark:bg-[#C8376A]/20 text-[#8B1D47] dark:text-[#E55488] font-bold text-xs"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const prerequisiteApi = apiItem.dependeDeApiId 
    ? allPlanoItems.find((p) => p.apiId === apiItem.dependeDeApiId) 
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      maxWidth="xl"
      hideCloseButton
      titleId="drawer-api-title"
      className="sm:max-w-[540px] flex flex-col h-full bg-surface text-main select-text"
    >
        {/* 1. Header: API Name, Follow Button, Close */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFE3] dark:border-[#2C1F25] flex items-center justify-between gap-3 bg-[#FAF7F8] dark:bg-[#1C1519] shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#8B1D47]/10 dark:bg-[#C8376A]/20 text-[#8B1D47] dark:text-[#E55488]">
                {apiItem.apiOrgao}
              </span>
              <span className="text-xs text-[#54494E] dark:text-[#A3969C] font-medium">
                Conexão do plano
              </span>
            </div>
            <h2 
              id="drawer-api-title" 
              className="text-xl sm:text-2xl font-bold text-[#1F1A1C] dark:text-[#F7EFF2] truncate mt-1 tracking-tight"
            >
              {apiItem.apiNome}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Seguir button */}
            <button
              type="button"
              onClick={onToggleFollow}
              title={isFollowing ? 'Você está seguindo esta API' : 'Seguir atualizações desta API'}
              aria-label={isFollowing ? 'Deixar de seguir esta API' : 'Seguir atualizações desta API'}
              aria-pressed={isFollowing}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none ${
                isFollowing
                  ? 'bg-[#8B1D47] dark:bg-[#C8376A] text-white shadow-xs'
                  : 'bg-white dark:bg-[#251A21] border border-[#E8DFE3] dark:border-[#38262E] text-[#4A3E44] dark:text-[#D1C6CB] hover:border-[#8B1D47]'
              }`}
            >
              {isFollowing ? (
                <>
                  <BellRing className="w-4 h-4 text-white" aria-hidden="true" />
                  <span>Seguindo</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488]" aria-hidden="true" />
                  <span>Seguir</span>
                </>
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel da API"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#54494E] dark:text-[#A3969C] hover:text-[#1F1A1C] dark:hover:text-[#F7EFF2] hover:bg-[#E8DFE3]/50 dark:hover:bg-[#2C1F25] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Toast confirmation for "Salvar como macete" */}
        {maceteSavedToast && (
          <div 
            role="status"
            aria-live="polite"
            className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0" aria-hidden="true" />
              <span>{maceteSavedToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setMaceteSavedToast(null)}
              className="text-emerald-800 dark:text-emerald-200 hover:opacity-70 p-1"
              aria-label="Dispensar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Main Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E8DFE3] dark:divide-[#2C1F25]">
          {/* 2. Structured Fields Grid (2 Columns on Desktop) */}
          <section aria-label="Detalhes e campos da API" className="p-5 bg-white dark:bg-[#181115] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Status */}
              <div className="space-y-1">
                <label htmlFor="field-status" className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] block">
                  Status da integração
                </label>
                <select
                  id="field-status"
                  value={apiItem.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as IntegrationStatus;
                    let novoRisco = apiItem.risco;
                    if (newStatus === 'Produção' || newStatus === 'Homologação') {
                      novoRisco = 'verde';
                    }
                    onUpdateField('Status', apiItem.status, newStatus, {
                      status: newStatus,
                      risco: novoRisco,
                    });
                  }}
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl text-sm font-bold text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none cursor-pointer"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Sprint */}
              <div className="space-y-1">
                <label htmlFor="field-sprint" className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] block">
                  Sprint planejada
                </label>
                <select
                  id="field-sprint"
                  value={apiItem.sprintId}
                  onChange={(e) => {
                    const newSprintId = Number(e.target.value);
                    const targetSprint = allSprints.find((s) => s.id === newSprintId);
                    if (targetSprint) {
                      const riskResult = calcularRisco(
                        { ...apiItem, sprintId: newSprintId },
                        targetSprint,
                        referenceDate
                      );

                      onUpdateField(
                        'Sprint',
                        `Sprint ${apiItem.sprintId}`,
                        `Sprint ${newSprintId}`,
                        {
                          sprintId: newSprintId,
                          dataLimiteSolicitacao: riskResult.dataLimiteSolicitacao,
                          risco: riskResult.risco,
                        }
                      );
                    }
                  }}
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl text-sm font-bold text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none cursor-pointer"
                >
                  {allSprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({formatDateBR(s.dataInicio)} a {formatDateBR(s.dataFim)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Responsável */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] block">
                  Responsável
                </label>
                {isEditingResponsavel ? (
                  <div className="space-y-1.5">
                    <select
                      value={apiItem.responsavel}
                      onChange={(e) => {
                        const newResp = e.target.value;
                        onUpdateField('Responsável', apiItem.responsavel, newResp, {
                          responsavel: newResp,
                        });
                        setIsEditingResponsavel(false);
                      }}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#8B1D47] dark:border-[#E55488] rounded-xl text-sm font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none cursor-pointer"
                    >
                      {MOCK_USERS.map((user) => (
                        <option key={user.id} value={`${user.name} (${user.role})`}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsEditingResponsavel(false)}
                      className="text-xs text-[#54494E] dark:text-[#A3969C] hover:underline"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingResponsavel(true)}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] hover:border-[#8B1D47] rounded-xl flex items-center justify-between text-left text-sm transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-6 h-6 rounded-md bg-[#8B1D47] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {apiItem.responsavel.substring(0, 2).toUpperCase()}
                      </span>
                      <span className="font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] truncate">
                        {apiItem.responsavel}
                      </span>
                    </div>
                    <Edit3 className="w-3.5 h-3.5 text-[#54494E] dark:text-[#A3969C] group-hover:text-[#8B1D47] shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Field 4: Risco de prazo */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] block">
                  Risco de prazo
                </span>
                <div className="min-h-[44px] px-3 py-2 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl flex items-center justify-between">
                  <RiskBadge risk={apiItem.risco} />
                  <span className="text-xs text-[#54494E] dark:text-[#A3969C] truncate max-w-[140px]" title={apiItem.riscoMotivo}>
                    {apiItem.risco === 'vermelho' ? 'Atraso crítico' : apiItem.risco === 'amarelo' ? 'Atenção' : 'No prazo'}
                  </span>
                </div>
              </div>

              {/* Field 5: Prazo Estimado */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] block">
                  Prazo estimado (órgão gestor)
                </span>
                <div className="min-h-[44px] px-3 py-2 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl flex items-center gap-2 text-sm font-semibold text-[#1F1A1C] dark:text-[#F7EFF2]">
                  <Clock className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488] shrink-0" aria-hidden="true" />
                  <span>{apiItem.prazoEstimadoFaixa}</span>
                </div>
              </div>

              {/* Field 6: Data-limite para solicitar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="field-data-limite" className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] block">
                    Data-limite para solicitar
                  </label>
                  {!isEditingDataLimite && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDataLimite(true)}
                      className="text-xs font-semibold text-[#8B1D47] dark:text-[#E55488] hover:underline"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {isEditingDataLimite ? (
                  <div className="flex items-center gap-2">
                    <input
                      id="field-data-limite"
                      type="date"
                      value={tempDataLimite}
                      onChange={(e) => setTempDataLimite(e.target.value)}
                      className="flex-1 min-h-[44px] px-3 py-1.5 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#8B1D47] rounded-xl text-sm font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempDataLimite !== apiItem.dataLimiteSolicitacao) {
                          onUpdateField(
                            'Data-limite para solicitar',
                            formatDateBR(apiItem.dataLimiteSolicitacao),
                            formatDateBR(tempDataLimite),
                            { dataLimiteSolicitacao: tempDataLimite }
                          );
                        }
                        setIsEditingDataLimite(false);
                      }}
                      className="min-h-[44px] min-w-[44px] bg-[#8B1D47] text-white rounded-xl flex items-center justify-center font-bold"
                      aria-label="Confirmar nova data-limite"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="min-h-[44px] px-3 py-2 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl flex items-center gap-2 text-sm font-bold text-[#1F1A1C] dark:text-[#F7EFF2]">
                    <Calendar className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488] shrink-0" aria-hidden="true" />
                    <span>{formatDateBR(apiItem.dataLimiteSolicitacao)}</span>
                  </div>
                )}
                <p className="text-xs text-[#54494E] dark:text-[#A3969C] leading-tight">
                  Início da Sprint menos {apiItem.prazoMaxDias} dias de prazo + 5 dias de margem técnica.
                </p>
              </div>
            </div>

            {/* Field 7: Funcionalidade / Campo Dependente */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="field-funcionalidade" className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] block">
                  Funcionalidade ou campo dependente
                </label>
                {!isEditingFuncionalidade && (
                  <button
                    type="button"
                    onClick={() => setIsEditingFuncionalidade(true)}
                    className="text-xs font-semibold text-[#8B1D47] dark:text-[#E55488] hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>

              {isEditingFuncionalidade ? (
                <div className="space-y-2">
                  <textarea
                    id="field-funcionalidade"
                    rows={2}
                    value={tempFuncionalidade}
                    onChange={(e) => setTempFuncionalidade(e.target.value)}
                    className="w-full p-3 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#8B1D47] rounded-xl text-sm font-medium text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTempFuncionalidade(apiItem.funcionalidadeCampo);
                        setIsEditingFuncionalidade(false);
                      }}
                      className="px-3 py-1.5 text-xs text-[#54494E] dark:text-[#A3969C] hover:underline"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (tempFuncionalidade.trim() && tempFuncionalidade !== apiItem.funcionalidadeCampo) {
                          onUpdateField(
                            'Funcionalidade dependente',
                            apiItem.funcionalidadeCampo,
                            tempFuncionalidade.trim(),
                            { funcionalidadeCampo: tempFuncionalidade.trim() }
                          );
                        }
                        setIsEditingFuncionalidade(false);
                      }}
                      className="px-3 py-1.5 bg-[#8B1D47] text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingFuncionalidade(true)}
                  className="p-3 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl text-sm font-medium text-[#1F1A1C] dark:text-[#F7EFF2] cursor-pointer hover:border-[#8B1D47] transition-colors leading-relaxed"
                >
                  {apiItem.funcionalidadeCampo || 'Nenhuma funcionalidade especificada. Clique para descrever.'}
                </div>
              )}
            </div>

            {/* Field 8: Pré-requisito (se houver) */}
            {prerequisiteApi && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-100 block">
                      Pré-requisito técnico bloqueante
                    </span>
                    <p className="text-xs text-amber-900 dark:text-amber-200 truncate">
                      Requer aprovação e homologação prévia de <strong>{prerequisiteApi.apiNome}</strong> (Sprint {prerequisiteApi.sprintId})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAnotherApi(prerequisiteApi.apiId)}
                  className="min-h-[36px] px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
                >
                  Ver {prerequisiteApi.apiNome}
                </button>
              </div>
            )}
          </section>

          {/* 3. Timeline: Unified Chat & Audit Records */}
          <section aria-label="Histórico e conversa da API" className="p-5 space-y-4 bg-[#FAF7F8]/50 dark:bg-[#140E12]">
            {/* Filter Chips Bar */}
            <div className="flex items-center justify-between gap-2 pb-2">
              <span className="text-xs font-bold text-[#54494E] dark:text-[#A3969C] uppercase tracking-wider">
                Linha do tempo
              </span>

              <div className="flex items-center gap-1 bg-white dark:bg-[#1E161C] p-1 rounded-xl border border-[#E8DFE3] dark:border-[#2C1F25]">
                <button
                  type="button"
                  onClick={() => setActiveFilter('tudo')}
                  aria-pressed={activeFilter === 'tudo'}
                  className={`min-h-[32px] px-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeFilter === 'tudo'
                      ? 'bg-[#8B1D47] text-white shadow-xs'
                      : 'text-[#54494E] dark:text-[#D1C6CB] hover:text-[#1F1A1C]'
                  }`}
                >
                  Tudo ({timelineItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('conversa')}
                  aria-pressed={activeFilter === 'conversa'}
                  className={`min-h-[32px] px-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeFilter === 'conversa'
                      ? 'bg-[#8B1D47] text-white shadow-xs'
                      : 'text-[#54494E] dark:text-[#D1C6CB] hover:text-[#1F1A1C]'
                  }`}
                >
                  Conversa ({comments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('alteracoes')}
                  aria-pressed={activeFilter === 'alteracoes'}
                  className={`min-h-[32px] px-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeFilter === 'alteracoes'
                      ? 'bg-[#8B1D47] text-white shadow-xs'
                      : 'text-[#54494E] dark:text-[#D1C6CB] hover:text-[#1F1A1C]'
                  }`}
                >
                  Alterações ({auditLogs.length})
                </button>
              </div>
            </div>

            {/* List of Timeline Items */}
            <div className="space-y-3.5">
              {filteredTimeline.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#54494E] dark:text-[#A3969C]">
                  Nenhuma atividade registrada nesta categoria.
                </div>
              ) : (
                filteredTimeline.map((item) => {
                  if (item.type === 'audit') {
                    const log = item.data;
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-2.5 py-1.5 px-3 rounded-lg bg-white/70 dark:bg-[#1E161C]/60 border border-[#E8DFE3]/70 dark:border-[#2C1F25] text-xs text-[#54494E] dark:text-[#D1C6CB]"
                      >
                        <Activity className="w-3.5 h-3.5 text-[#8B1D47] dark:text-[#E55488] shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-[#1F1A1C] dark:text-[#F7EFF2]">
                            {log.textoFormatado}
                          </span>
                          <span className="text-[#695E63] dark:text-[#8E7E85] ml-2">
                            · {log.dataHora}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const comment = item.data;
                  const isEditingThis = editingCommentId === comment.id;
                  const isAuthorCurrentUser = comment.autor === currentUser.name;

                  return (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#1E161C] border border-[#E8DFE3] dark:border-[#2C1F25] shadow-xs space-y-2"
                    >
                      {/* Comment Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-[#8B1D47] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {comment.avatarInitials}
                          </span>
                          <div className="min-w-0 truncate">
                            <span className="font-bold text-sm text-[#1F1A1C] dark:text-[#F7EFF2]">
                              {comment.autor}
                            </span>
                            <span className="ml-1.5 text-xs text-[#8B1D47] dark:text-[#E55488] font-semibold">
                              ({comment.cargo})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span 
                            title={comment.dataHora} 
                            className="text-xs text-[#695E63] dark:text-[#8E7E85] cursor-help"
                          >
                            {comment.dataHora.split(',')[1] || comment.dataHora}
                          </span>
                          {comment.editado && (
                            <span className="text-xs text-[#695E63] dark:text-[#8E7E85] bg-[#FAF7F8] dark:bg-[#281D23] px-1.5 py-0.5 rounded">
                              editado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment Content or Edit Form */}
                      {isEditingThis ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={3}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2.5 bg-[#FAF7F8] dark:bg-[#251A21] border border-[#8B1D47] rounded-xl text-sm font-medium text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-2.5 py-1 text-xs text-[#54494E] dark:text-[#A3969C] hover:underline"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editText.trim()) {
                                  onEditComment(comment.id, editText.trim());
                                  setEditingCommentId(null);
                                }
                              }}
                              className="px-3 py-1 bg-[#8B1D47] text-white text-xs font-bold rounded-lg shadow-xs"
                            >
                              Salvar edição
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-[#1F1A1C] dark:text-[#EAE0E4] leading-relaxed break-words">
                          {renderMessageContent(comment.texto)}
                        </p>
                      )}

                      {/* Comment Actions Footer */}
                      {!isEditingThis && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#E8DFE3]/50 dark:border-[#2C1F25]">
                          <button
                            type="button"
                            onClick={() => handleSaveMaceteClick(comment)}
                            title="Salvar esta dica na aba Macetes da biblioteca de APIs"
                            aria-label="Salvar mensagem como macete na biblioteca"
                            className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              comment.salvoComoMacete
                                ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 font-bold'
                                : 'text-[#54494E] dark:text-[#A3969C] hover:text-[#8B1D47] dark:hover:text-[#E55488] hover:bg-[#FAF7F8] dark:hover:bg-[#251A21]'
                            }`}
                          >
                            {comment.salvoComoMacete ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                                <span>Salvo como macete</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Salvar como macete</span>
                              </>
                            )}
                          </button>

                          {/* Edit Own Message Button */}
                          {isAuthorCurrentUser && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditText(comment.texto);
                              }}
                              className="min-h-[32px] px-2 py-1 text-xs font-semibold text-[#54494E] dark:text-[#A3969C] hover:text-[#8B1D47] dark:hover:text-[#E55488] flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>
          </section>
        </div>

        {/* 4. Fixed Composer Bar at Bottom */}
        <div className="p-4 bg-white dark:bg-[#181115] border-t border-[#E8DFE3] dark:border-[#2C1F25] shrink-0 space-y-2">
          {/* Quick Mention Suggestions */}
          <div className="flex items-center gap-1.5 text-xs text-[#54494E] dark:text-[#A3969C]">
            <span className="font-semibold flex items-center gap-1">
              <AtSign className="w-3 h-3" /> Menção rápida:
            </span>
            <button
              type="button"
              onClick={() => insertMention('Equipe de integração')}
              className="px-2 py-0.5 rounded-md bg-[#FAF7F8] dark:bg-[#251A21] hover:bg-[#8B1D47]/10 hover:text-[#8B1D47] font-semibold transition-colors cursor-pointer"
            >
              @Camila
            </button>
            <button
              type="button"
              onClick={() => insertMention('Equipe técnica')}
              className="px-2 py-0.5 rounded-md bg-[#FAF7F8] dark:bg-[#251A21] hover:bg-[#8B1D47]/10 hover:text-[#8B1D47] font-semibold transition-colors cursor-pointer"
            >
              @Mariana
            </button>
            <button
              type="button"
              onClick={() => insertMention(apiItem.apiNome)}
              className="px-2 py-0.5 rounded-md bg-[#FAF7F8] dark:bg-[#251A21] hover:bg-[#8B1D47]/10 hover:text-[#8B1D47] font-semibold transition-colors cursor-pointer"
            >
              @{apiItem.apiNome}
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] focus-within:border-[#8B1D47] rounded-2xl p-2 transition-colors">
              <textarea
                ref={textareaRef}
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDownTextarea}
                placeholder={`Comente sobre ${apiItem.apiNome}... (Enter envia, Shift+Enter pula linha)`}
                aria-label={`Comentário sobre a API ${apiItem.apiNome}`}
                className="w-full bg-transparent resize-none text-sm text-[#1F1A1C] dark:text-[#F7EFF2] placeholder-[#766A70] dark:placeholder-[#9C8F95] focus:outline-none"
              />
              <div className="flex items-center justify-between pt-1 border-t border-[#E8DFE3]/50 dark:border-[#2E2328]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertMention('')}
                    title="Mencionar colega ou API"
                    aria-label="Mencionar"
                    className="p-1.5 text-[#54494E] dark:text-[#A3969C] hover:text-[#8B1D47] rounded-lg transition-colors cursor-pointer"
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => `${prev} https:// `)}
                    title="Inserir link"
                    aria-label="Inserir link"
                    className="p-1.5 text-[#54494E] dark:text-[#A3969C] hover:text-[#8B1D47] rounded-lg transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-[#695E63] dark:text-[#8E7E85]">
                  Pressione Enter para enviar
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              aria-label="Enviar mensagem"
              className={`min-h-[44px] min-w-[44px] px-3.5 py-3 rounded-2xl flex items-center justify-center font-bold text-white transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none ${
                messageText.trim()
                  ? 'bg-[#8B1D47] hover:bg-[#731639] text-white opacity-100'
                  : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
    </Modal>
  );
};
