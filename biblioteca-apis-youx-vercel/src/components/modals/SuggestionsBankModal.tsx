import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ExternalLink, 
  Clock, 
  Layers, 
  Key, 
  FileText, 
  AlertCircle, 
  User, 
  Sparkles, 
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  Eye
} from 'lucide-react';
import { ApiSuggestion, UserProfile, SuggestionStatus } from '../../types';
import { Modal } from '../common/Modal';

interface SuggestionsBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: ApiSuggestion[];
  currentUser: UserProfile;
  onApproveSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string, reason: string) => void;
  onSelectApiById?: (apiId: string) => void;
}

export const SuggestionsBankModal: React.FC<SuggestionsBankModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  currentUser,
  onApproveSuggestion,
  onRejectSuggestion,
  onSelectApiById,
}) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | SuggestionStatus>('pendente');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  
  // Rejection reason prompt state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Filter suggestions
  const filteredSuggestions = suggestions.filter((sug) => {
    if (filterStatus !== 'todos' && sug.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = sug.nome.toLowerCase().includes(q) || sug.sigla.toLowerCase().includes(q);
      const matchOrgao = sug.orgao.toLowerCase().includes(q);
      const matchAuthor = sug.sugeridoPor.toLowerCase().includes(q);
      const matchJust = sug.justificativaNegocio.toLowerCase().includes(q);
      return matchName || matchOrgao || matchAuthor || matchJust;
    }
    return true;
  });

  const activeSuggestion = suggestions.find((s) => s.id === (selectedSuggestionId || filteredSuggestions[0]?.id)) || filteredSuggestions[0];

  const pendingCount = suggestions.filter((s) => s.status === 'pendente').length;
  const approvedCount = suggestions.filter((s) => s.status === 'aprovada').length;
  const rejectedCount = suggestions.filter((s) => s.status === 'rejeitada').length;

  const handleConfirmReject = () => {
    if (!activeSuggestion || !rejectReason.trim()) return;
    onRejectSuggestion(activeSuggestion.id, rejectReason.trim());
    setIsRejecting(false);
    setRejectReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-fg flex items-center justify-center font-bold shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-main">
                Banco de sugestões de APIs
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary-light text-primary-text">
                Curadoria & administração
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warning-bg text-warning-text border border-warning-border">
                  {pendingCount} pendente(s)
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Valide os requisitos técnicos e aprove ou recuse sugestões para o catálogo oficial da YouX.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-5 min-h-[500px]">
        {/* Left Column: Filter and List */}
        <div className="lg:w-2/5 flex flex-col border-b lg:border-b-0 lg:border-r border-border-default pb-4 lg:pb-0 lg:pr-4">
          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por API, órgão ou solicitante..."
              className="w-full pl-9 pr-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main placeholder:text-text-muted focus:outline-none"
            />
          </div>

          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-hover rounded-xl mb-3 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('pendente')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                filterStatus === 'pendente'
                  ? 'bg-surface text-main shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('aprovada')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                filterStatus === 'aprovada'
                  ? 'bg-surface text-main shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Aprovadas ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('rejeitada')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                filterStatus === 'rejeitada'
                  ? 'bg-surface text-main shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Rejeitadas ({rejectedCount})
            </button>
          </div>

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[460px] pr-1">
            {filteredSuggestions.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">
                Nenhuma sugestão encontrada com os filtros selecionados.
              </div>
            ) : (
              filteredSuggestions.map((sug) => {
                const isSelected = activeSuggestion?.id === sug.id;
                return (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => {
                      setSelectedSuggestionId(sug.id);
                      setIsRejecting(false);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary-light ring-1 ring-primary'
                        : 'border-border-default hover:bg-surface-hover bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-bold text-xs text-main truncate">
                        {sug.nome}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold shrink-0">
                        {sug.status === 'pendente' && (
                          <span className="bg-warning-bg text-warning-text border border-warning-border px-1.5 py-0.5 rounded">
                            Pendente
                          </span>
                        )}
                        {sug.status === 'aprovada' && (
                          <span className="bg-success-bg text-success-text border border-success-border px-1.5 py-0.5 rounded">
                            Aprovada
                          </span>
                        )}
                        {sug.status === 'rejeitada' && (
                          <span className="bg-danger-bg text-danger-text border border-danger-border px-1.5 py-0.5 rounded">
                            Rejeitada
                          </span>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary truncate mb-1">
                      {sug.orgao} · {sug.sigla}
                    </p>

                    <div className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-border-subtle mt-1">
                      <span>Por: {sug.sugeridoPor}</span>
                      <span className="tabular-nums">{sug.dataCriacao.split(',')[0]}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed View & Action Bar */}
        <div className="lg:w-3/5 flex flex-col">
          {!activeSuggestion ? (
            <div className="m-auto text-center p-8 text-sm text-text-muted">
              Selecione uma sugestão para avaliar seus dados detalhados.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header of selected API */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-main">
                      {activeSuggestion.nome}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-hover border border-border-default text-text-secondary">
                      {activeSuggestion.sigla}
                    </span>
                    {activeSuggestion.conectaGov && (
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-info-bg text-info-text border border-info-border">
                        Conecta gov.br
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {activeSuggestion.orgaoNomeCompleto || activeSuggestion.orgao}
                  </p>
                </div>

                <div className="text-right text-xs text-text-muted">
                  <span>Enviado em <strong className="text-text-main tabular-nums">{activeSuggestion.dataCriacao}</strong></span>
                  <p>por {activeSuggestion.sugeridoPor} ({activeSuggestion.sugeridoPorCargo})</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  Descrição simples
                </span>
                <p className="text-sm text-main leading-relaxed bg-bg-page p-3 rounded-xl border border-border-default">
                  {activeSuggestion.descricaoSimples}
                </p>
              </div>

              {/* Business Justification */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  Justificativa de negócio & aplicação
                </span>
                <p className="text-sm text-main leading-relaxed bg-bg-page p-3 rounded-xl border border-border-default">
                  {activeSuggestion.justificativaNegocio}
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border-default bg-bg-page">
                  <span className="font-semibold text-text-muted block">Autenticação:</span>
                  <span className="text-main font-medium mt-0.5 block">{activeSuggestion.padraoAutenticacao}</span>
                </div>

                <div className="p-3 rounded-xl border border-border-default bg-bg-page">
                  <span className="font-semibold text-text-muted block">Prazo estimado:</span>
                  <span className="text-main font-medium mt-0.5 block">{activeSuggestion.prazoEstimadoDias}</span>
                </div>

                <div className="p-3 rounded-xl border border-border-default bg-bg-page">
                  <span className="font-semibold text-text-muted block">Quem solicita:</span>
                  <span className="text-main font-medium mt-0.5 block">{activeSuggestion.quemSolicita}</span>
                </div>

                <div className="p-3 rounded-xl border border-border-default bg-bg-page">
                  <span className="font-semibold text-text-muted block">Ambiente Sandbox:</span>
                  <span className="text-main font-medium mt-0.5 block">{activeSuggestion.temSandbox ? 'Sim, disponível' : 'Não possui'}</span>
                </div>
              </div>

              {/* Status Notice if already reviewed */}
              {activeSuggestion.status === 'aprovada' && (
                <div className="p-4 rounded-xl border border-success-border bg-success-bg flex items-center justify-between text-xs text-success-text">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-bold">API aprovada e publicada na biblioteca oficial</p>
                      <p className="text-xs mt-0.5">
                        Validada por {activeSuggestion.avaliadoPor || 'Administração YouX'} em {activeSuggestion.dataAvaliacao || 'data recente'}.
                      </p>
                    </div>
                  </div>
                  {activeSuggestion.apiCadastradaId && onSelectApiById && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectApiById(activeSuggestion.apiCadastradaId as string);
                        onClose();
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-fg font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Ver no catálogo
                    </button>
                  )}
                </div>
              )}

              {activeSuggestion.status === 'rejeitada' && (
                <div className="p-4 rounded-xl border border-danger-border bg-danger-bg text-xs text-danger-text">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold">Sugestão rejeitada pela curadoria</p>
                      <p className="mt-1">
                        Motivo informado: <em>"{activeSuggestion.motivoRejeicao || 'Não atende aos critérios atuais de interoperabilidade'}"</em>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reject Input box */}
              {isRejecting && (
                <div className="p-4 rounded-xl border border-danger-border bg-danger-bg/40 space-y-2 text-xs">
                  <label htmlFor="textarea-reject-reason" className="block font-bold text-danger-text">
                    Informe o motivo da recusa para orientar o solicitante:
                  </label>
                  <textarea
                    id="textarea-reject-reason"
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ex: API descontinuada pelo órgão, dados já providos pela rota CPF Luz, documentação incompleta..."
                    className="w-full px-3 py-2 bg-surface border border-danger-border rounded-lg text-xs text-main focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="min-h-[44px] px-3.5 py-1.5 rounded-lg border border-border-default text-xs font-semibold text-text-secondary hover:bg-surface-hover cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      disabled={!rejectReason.trim()}
                      className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-danger-text hover:opacity-90 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Confirmar rejeição
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Actions Bar */}
              {activeSuggestion.status === 'pendente' && (
                <div className="p-4 rounded-xl border border-border-default bg-surface-hover flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                  <span className="text-xs text-text-muted">
                    Apenas administradores podem executar ações de aprovação ou rejeição.
                  </span>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(!isRejecting)}
                      disabled={!currentUser.isAdmin}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-danger-border text-danger-text hover:bg-danger-bg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Rejeitar sugestão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onApproveSuggestion(activeSuggestion.id)}
                      disabled={!currentUser.isAdmin}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-fg text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Aprovar & publicar no catálogo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
