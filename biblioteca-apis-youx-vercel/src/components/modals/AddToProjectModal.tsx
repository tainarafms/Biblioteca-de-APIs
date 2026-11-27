import React, { useState } from 'react';
import { Plus, FolderKanban, CheckCircle2 } from 'lucide-react';
import { ApiItem, Projeto, PlanoItem, IntegrationStatus, RiskLevel } from '../../types';
import { Modal } from '../common/Modal';
import { calcularRisco } from '../../utils/risk';
import { getReferenceDate } from '../../utils/date';

interface AddToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedApi?: ApiItem | null;
  allApis: ApiItem[];
  projetos: Projeto[];
  onAddApiToProject: (projetoId: string, item: PlanoItem) => void;
  referenceDate?: Date;
}

export const AddToProjectModal: React.FC<AddToProjectModalProps> = ({
  isOpen,
  onClose,
  preselectedApi,
  allApis,
  projetos,
  onAddApiToProject,
  referenceDate = getReferenceDate(),
}) => {
  const [selectedProjetoId, setSelectedProjetoId] = useState(projetos[0]?.id || '');
  const [selectedApiId, setSelectedApiId] = useState(preselectedApi?.id || allApis[0]?.id || '');
  const [sprintId, setSprintId] = useState<number>(3);
  const [funcionalidade, setFuncionalidade] = useState('');
  const [responsavel, setResponsavel] = useState('Equipe YouX');
  const [status, setStatus] = useState<IntegrationStatus>('Não solicitada');
  const [success, setSuccess] = useState(false);

  const currentApi = allApis.find((a) => a.id === (preselectedApi?.id || selectedApiId)) || allApis[0];
  const currentProj = projetos.find((p) => p.id === selectedProjetoId) || projetos[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApi || !currentProj) return;

    // Calculate deadline and risk based on chosen sprint via pure calcularRisco
    const targetSprint = currentProj.sprints.find((s) => s.id === sprintId) || currentProj.sprints[0];
    const prazoMax = currentApi.comoConseguirAcesso?.prazoMaxDias || 30;

    const riskResult = calcularRisco(
      {
        status,
        prazoMaxDias: prazoMax,
      },
      targetSprint,
      referenceDate
    );

    const novoPlanoItem: PlanoItem = {
      id: `plano-${Date.now()}`,
      apiId: currentApi.id,
      apiNome: currentApi.nome,
      apiOrgao: currentApi.orgao,
      funcionalidadeCampo: funcionalidade.trim() || currentApi.descricaoSimples,
      sprintId,
      prazoEstimadoFaixa: currentApi.comoConseguirAcesso?.prazoEstimadoFaixa || '15 a 30 dias úteis',
      prazoMaxDias: prazoMax,
      dataLimiteSolicitacao: riskResult.dataLimiteSolicitacao,
      status,
      responsavel: responsavel.trim() || 'Equipe YouX',
      risco: riskResult.risco,
      riscoMotivo: riskResult.riscoMotivo,
      dependeDeApiId: currentApi.antesDeUsar?.apisVinculadasIds?.[0]
    };

    onAddApiToProject(selectedProjetoId, novoPlanoItem);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      setFuncionalidade('');
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-fg flex items-center justify-center shrink-0">
            <FolderKanban className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="text-base font-bold text-main">
            Adicionar API ao Plano de Integrações
          </span>
        </div>
      }
      description="Defina a sprint de entrega e acompanhe o semáforo de risco automático."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-success-text mx-auto" aria-hidden="true" />
            <p className="text-base font-bold text-main">API adicionada ao projeto!</p>
            <p className="text-sm text-text-muted">Data-limite e risco calculados com sucesso.</p>
          </div>
        ) : (
          <>
            {/* Project selector */}
            <div>
              <label htmlFor="select-modal-projeto" className="block text-xs font-semibold text-text-secondary mb-1.5">
                Selecione o projeto
              </label>
              <select
                id="select-modal-projeto"
                value={selectedProjetoId}
                onChange={(e) => setSelectedProjetoId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main font-medium focus:outline-none cursor-pointer"
              >
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sigla} – {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* API selector */}
            <div>
              <label htmlFor="select-modal-api" className="block text-xs font-semibold text-text-secondary mb-1.5">
                API a integrar
              </label>
              {preselectedApi ? (
                <div className="min-h-[44px] flex items-center px-3.5 py-2.5 bg-primary-light border border-primary/20 rounded-xl text-sm font-bold text-primary-text">
                  {preselectedApi.nome} ({preselectedApi.orgao})
                </div>
              ) : (
                <select
                  id="select-modal-api"
                  value={selectedApiId}
                  onChange={(e) => setSelectedApiId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main font-medium focus:outline-none cursor-pointer"
                >
                  {allApis.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({a.orgao}) — {a.dificuldade}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Feature / Form field that depends on it */}
            <div>
              <label htmlFor="input-modal-funcionalidade" className="block text-xs font-semibold text-text-secondary mb-1.5">
                Funcionalidade ou campo dependente *
              </label>
              <input
                id="input-modal-funcionalidade"
                type="text"
                required
                value={funcionalidade}
                onChange={(e) => setFuncionalidade(e.target.value)}
                placeholder="Ex: Validação do polígono de Reserva Legal no mapa"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main placeholder:text-text-muted focus:outline-none"
              />
            </div>

            {/* Sprint & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="select-modal-sprint" className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Sprint de entrega
                </label>
                <select
                  id="select-modal-sprint"
                  value={sprintId}
                  onChange={(e) => setSprintId(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main font-medium focus:outline-none cursor-pointer tabular-nums"
                >
                  {currentProj.sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({s.dataInicio.split('-').reverse().join('/')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="select-modal-status" className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Status atual
                </label>
                <select
                  id="select-modal-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IntegrationStatus)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main font-medium focus:outline-none cursor-pointer"
                >
                  <option value="Não solicitada">Não solicitada</option>
                  <option value="Em solicitação">Em solicitação</option>
                  <option value="Homologação">Homologação</option>
                  <option value="Produção">Produção</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="input-modal-responsavel" className="block text-xs font-semibold text-text-secondary mb-1.5">
                Responsável pelo acompanhamento
              </label>
              <input
                id="input-modal-responsavel"
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
              />
            </div>

            {/* Info rule */}
            <div className="p-3.5 rounded-xl bg-info-bg border border-info-border text-xs text-info-text leading-relaxed">
              <strong>Cálculo automático:</strong> A data-limite é calculada como <em>Início da sprint selecionada − Prazo máximo ({currentApi?.comoConseguirAcesso?.prazoMaxDias || 30} dias) − 5 dias de folga</em>.
            </div>

            {/* Grouped Actions */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 bg-primary hover:bg-primary-hover text-primary-fg text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Incluir no plano</span>
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
