import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquarePlus, 
  Send, 
  Server, 
  Link2,
  Calendar,
  Star,
  Copy,
  Check
} from 'lucide-react';
import { ApiItem, Macete } from '../../types';
import { DifficultyBadge } from '../common/Badges';
import { formatDateBR, getReferenceDate } from '../../utils/date';

interface ApiDetailViewProps {
  api: ApiItem;
  allApis: ApiItem[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  onOpenAddToProjectModal: (api: ApiItem) => void;
  onSelectApiById: (id: string) => void;
  onAddMacete: (apiId: string, macete: Macete) => void;
  adminView?: boolean;
}

export const ApiDetailView: React.FC<ApiDetailViewProps> = ({
  api,
  allApis,
  isFavorite,
  onToggleFavorite,
  onBack,
  onOpenAddToProjectModal,
  onSelectApiById,
  onAddMacete,
  adminView = false,
}) => {
  // Aba 'como-acesso' abre por padrão conforme regra de negócio
  const [activeTab, setActiveTab] = useState<'como-acesso' | 'visao-geral' | 'antes-de-usar' | 'macetes' | 'historico'>('como-acesso');

  // Copy feedback states
  const [copiedHomolog, setCopiedHomolog] = useState(false);
  const [copiedProd, setCopiedProd] = useState(false);

  // State for new Macete form
  const [novoAutor, setNovoAutor] = useState('Equipe YouX');
  const [novoCargo, setNovoCargo] = useState('Perfil de acesso');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [maceteSucesso, setMaceteSucesso] = useState(false);

  const handleSubmitMacete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoConteudo.trim()) return;

    const novoMacete: Macete = {
      id: `m-${Date.now()}`,
      autor: novoAutor.trim() || 'PO / Dev Anônimo',
      cargo: novoCargo.trim() || 'Equipe YouX',
      data: formatDateBR(getReferenceDate()),
      conteudo: novoConteudo.trim(),
    };

    onAddMacete(api.id, novoMacete);
    setNovoConteudo('');
    setMaceteSucesso(true);
    setTimeout(() => setMaceteSucesso(false), 3000);
  };

  const copyToClipboard = (text: string, type: 'homolog' | 'prod') => {
    navigator.clipboard.writeText(text);
    if (type === 'homolog') {
      setCopiedHomolog(true);
      setTimeout(() => setCopiedHomolog(false), 2000);
    } else {
      setCopiedProd(true);
      setTimeout(() => setCopiedProd(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-secondary hover:text-primary bg-surface border border-border-default hover:border-primary/40 shadow-2xs transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar para a biblioteca</span>
        </button>

        <div className="flex items-center gap-2">
          {api.visaoGeral.linkDocumentacao && (
            <a
              href={api.visaoGeral.linkDocumentacao}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-main bg-surface border border-border-default transition-colors focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              <span>Manual oficial</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {/* Hero Header Card - Corporate, Delicate & Balanced */}
      <section 
        aria-labelledby="api-detalhe-nome"
        className="bg-surface rounded-2xl p-6 sm:p-7 border border-border-default shadow-2xs space-y-6 transition-colors"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          {/* Main Info */}
          <div className="space-y-3 flex-1 min-w-0">
            {/* Top Tag Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-bg-page border border-border-subtle text-secondary">
                {api.orgao}
              </span>
              {api.conectaGov ? (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-info-bg text-info-text border border-info-border">
                  Conecta gov.br
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-bg-page text-secondary border border-border-default">
                  Barramento próprio
                </span>
              )}
              <DifficultyBadge level={api.dificuldade} />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 id="api-detalhe-nome" className="text-xl sm:text-2xl font-bold text-main tracking-tight">
                {api.nome}
              </h1>
              <p className="text-xs font-medium text-muted">
                {api.orgaoNomeCompleto}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-secondary max-w-3xl leading-relaxed">
              {api.descricaoSimples}
            </p>

            {adminView && (
              <div className="rounded-xl border border-border-default bg-bg-page p-3 text-xs text-secondary">
                <p className="flex items-center gap-1.5 font-semibold text-main"><ShieldCheck className="size-4 text-success-text" /> Metadados de curadoria</p>
                <p className="mt-1">Referência: {api.verificadoEm} · responsável: {api.verificadoPor}</p>
                <p className="mt-1">Manutenção: {api.dificuldade} · {api.dificuldadeMotivo}</p>
              </div>
            )}
          </div>

          {/* Clean Action Cluster */}
          <div className="flex sm:flex-row lg:flex-col items-stretch gap-2.5 shrink-0 sm:self-start lg:min-w-[200px]">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => onOpenAddToProjectModal(api)}
              className="min-h-[44px] px-4 py-2 bg-primary hover:bg-primary-hover text-primary-fg text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Organizar em pasta</span>
            </button>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-300 text-amber-800 dark:text-amber-200 font-semibold'
                  : 'bg-surface border-border-default text-secondary hover:text-amber-600 hover:border-amber-300'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-muted'}`} aria-hidden="true" />
              <span>{isFavorite ? 'API favoritada' : 'Favoritar API'}</span>
            </button>
          </div>
        </div>

        {/* Corporate Underline Tab Navigation */}
        <div 
          role="tablist"
          aria-label="Seções informativas da API"
          className="border-b border-border-subtle flex items-center gap-6 overflow-x-auto pt-2 -mb-2"
        >
          {/* Tab 1: Como conseguir acesso */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'como-acesso'}
            onClick={() => setActiveTab('como-acesso')}
            className={`min-h-[44px] pb-3 text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 font-medium focus-visible:outline-2 focus-visible:outline-focus-ring ${
              activeTab === 'como-acesso'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-main'
            }`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>Como conseguir acesso</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'visao-geral'}
            onClick={() => setActiveTab('visao-geral')}
            className={`min-h-[44px] pb-3 text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 font-medium focus-visible:outline-2 focus-visible:outline-focus-ring ${
              activeTab === 'visao-geral'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-main'
            }`}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Visão geral</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'antes-de-usar'}
            onClick={() => setActiveTab('antes-de-usar')}
            className={`min-h-[44px] pb-3 text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 font-medium focus-visible:outline-2 focus-visible:outline-focus-ring ${
              activeTab === 'antes-de-usar'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-main'
            }`}
          >
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            <span>Antes de usar</span>
            {api.antesDeUsar.apisVinculadasIds.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums ${
                activeTab === 'antes-de-usar' 
                  ? 'bg-primary-light text-primary' 
                  : 'bg-surface text-secondary border border-border-default'
              }`}>
                {api.antesDeUsar.apisVinculadasIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'macetes'}
            onClick={() => setActiveTab('macetes')}
            className={`min-h-[44px] pb-3 text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 font-medium focus-visible:outline-2 focus-visible:outline-focus-ring ${
              activeTab === 'macetes'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-main'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
            <span>Macetes</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums ${
              activeTab === 'macetes' 
                ? 'bg-primary-light text-primary' 
                : 'bg-surface text-secondary border border-border-default'
            }`}>
              {api.macetes.length}
            </span>
          </button>

          {adminView && <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'historico'}
            onClick={() => setActiveTab('historico')}
            className={`min-h-[44px] pb-3 text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 font-medium focus-visible:outline-2 focus-visible:outline-focus-ring ${
              activeTab === 'historico'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-main'
            }`}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Histórico de manutenção</span>
          </button>}
        </div>
      </section>

      {/* Tab 1: Como conseguir acesso */}
      {activeTab === 'como-acesso' && (
        <div className="space-y-6">
          {/* Key Metrics Cards Strip - Delicate & Harmonious */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-xl p-5 border border-border-default space-y-2 shadow-2xs">
              <span className="text-xs font-semibold text-muted block">
                Quem solicita o acesso
              </span>
              <p className="text-sm sm:text-base font-bold text-main">
                {api.comoConseguirAcesso.quemSolicita}
              </p>
              <p className="text-xs text-secondary leading-relaxed">
                {api.comoConseguirAcesso.quemSolicitaDetalhes}
              </p>
            </div>

            <div className="bg-surface rounded-xl p-5 border border-border-default space-y-2 shadow-2xs">
              <span className="text-xs font-semibold text-muted block">
                Prazo estimado de liberação
              </span>
              <p className="text-sm sm:text-base font-bold text-primary">
                {api.comoConseguirAcesso.prazoEstimadoFaixa}
              </p>
              <p className="text-xs text-secondary leading-relaxed">
                Tempo médio do protocolo formal até a emissão de chaves válidas.
              </p>
            </div>

            <div className="bg-surface rounded-xl p-5 border border-border-default space-y-2 shadow-2xs">
              <span className="text-xs font-semibold text-muted block">
                Nível de complexidade
              </span>
              <div className="pt-0.5">
                <DifficultyBadge level={api.dificuldade} />
              </div>
              <p className="text-xs text-secondary leading-relaxed pt-1">
                {api.dificuldadeMotivo}
              </p>
            </div>
          </div>

          {/* Anexos e Assinaturas Exigidos */}
          <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-main flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Documentos e assinaturas exigidos pelo órgão</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {api.comoConseguirAcesso.anexosAssinaturas.map((anexo, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg bg-bg-page border border-border-subtle text-xs sm:text-sm text-main">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="font-medium leading-relaxed">{anexo}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Passo a Passo Numerado - Timeline Stepper Style */}
          <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-main flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Roteiro passo a passo para obtenção de acesso</span>
            </h2>
            <div className="space-y-3">
              {api.comoConseguirAcesso.passos.map((passo) => (
                <div
                  key={passo.numero}
                  className="flex items-start gap-3.5 p-4 rounded-lg bg-bg-page border border-border-subtle"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 tabular-nums">
                    {passo.numero}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-main">
                      {passo.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                      {passo.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ambientes com 1-Click Copy */}
          <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-main flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Ambientes e endpoints de integração</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-lg bg-bg-page border border-border-subtle space-y-2">
                <span className="text-xs font-semibold text-muted block">
                  Homologação / Staging
                </span>
                <div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg border border-border-default">
                  <span className="font-mono text-xs text-main truncate flex-1">
                    {api.comoConseguirAcesso.ambientes.homologacao}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(api.comoConseguirAcesso.ambientes.homologacao, 'homolog')}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-muted hover:text-primary rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                    aria-label="Copiar endereço de homologação"
                  >
                    {copiedHomolog ? <Check className="w-4 h-4 text-success-text" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bg-page border border-border-subtle space-y-2">
                <span className="text-xs font-semibold text-muted block">
                  Produção oficial
                </span>
                <div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg border border-border-default">
                  <span className="font-mono text-xs text-main truncate flex-1">
                    {api.comoConseguirAcesso.ambientes.producao}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(api.comoConseguirAcesso.ambientes.producao, 'prod')}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-muted hover:text-primary rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                    aria-label="Copiar endereço de produção"
                  >
                    {copiedProd ? <Check className="w-4 h-4 text-success-text" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Visão Geral */}
      {activeTab === 'visao-geral' && (
        <div className="space-y-5">
          <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-3 shadow-2xs">
            <h2 className="text-sm font-bold text-main">
              O que esta API faz (em linguagem simples)
            </h2>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              {api.visaoGeral.oQueFaz}
            </p>

            <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="font-medium text-muted">Padrão de autenticação:</span>{' '}
                <strong className="text-main font-mono text-xs font-semibold ml-1">{api.visaoGeral.padraoAutenticacao}</strong>
              </div>
              {api.visaoGeral.linkDocumentacao && (
                <a
                  href={api.visaoGeral.linkDocumentacao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Manual oficial</span>
                </a>
              )}
            </div>
          </section>

          {/* Dados de Entrada e Exemplos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="bg-surface rounded-xl p-5 border border-border-default space-y-3 shadow-2xs">
              <h2 className="text-sm font-bold text-main">
                Dados de entrada necessários
              </h2>
              <ul className="space-y-2">
                {api.visaoGeral.dadosEntrada.map((dado, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true"></span>
                    <span>{dado}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-surface rounded-xl p-5 border border-border-default space-y-3 shadow-2xs">
              <h2 className="text-sm font-bold text-main">
                Exemplos de campos de formulário preenchidos
              </h2>
              <ul className="space-y-2">
                {api.visaoGeral.exemplosFormulario.map((ex, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-text mt-1.5 shrink-0" aria-hidden="true"></span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Dados Retornados */}
          <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-3 shadow-2xs">
            <h2 className="text-sm font-bold text-main">
              Mapeamento de dados retornados
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border-default">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-bg-page text-muted border-b border-border-default">
                  <tr>
                    <th scope="col" className="py-2.5 px-3.5 font-semibold text-xs">Campo JSON</th>
                    <th scope="col" className="py-2.5 px-3.5 font-semibold text-xs">Significado de negócio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {api.visaoGeral.dadosRetornados.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-hover/60">
                      <td className="py-2.5 px-3.5 font-mono font-medium text-primary text-xs">
                        {item.campo}
                      </td>
                      <td className="py-2.5 px-3.5 text-xs sm:text-sm text-secondary">
                        {item.descricao}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Antes de usar */}
      {activeTab === 'antes-de-usar' && (
        <div className="space-y-5">
          {api.antesDeUsar.avisoDestaque && (
            <div 
              role="alert"
              className="p-4 rounded-xl bg-warning-bg border border-warning-border text-warning-text flex items-start gap-3 shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-warning-text shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-warning-text">
                  Aviso de dependência
                </p>
                <p className="text-xs leading-relaxed text-warning-text">
                  {api.antesDeUsar.avisoDestaque}
                </p>
              </div>
            </div>
          )}

          <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-main">
              Pré-requisitos técnicos e administrativos
            </h2>
            <ul className="space-y-2.5">
              {api.antesDeUsar.preRequisitos.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-secondary">
                  <span className="w-5 h-5 rounded-md bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>

            <div className="p-3.5 rounded-lg bg-bg-page border border-border-subtle text-xs">
              <span className="font-semibold text-muted">Tipo de conta requerida:</span>{' '}
              <span className="text-main font-semibold ml-1">{api.antesDeUsar.contasRequeridas}</span>
            </div>
          </section>

          {/* Linked APIs */}
          {api.antesDeUsar.apisVinculadasIds.length > 0 && (
            <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-3 shadow-2xs">
              <h2 className="text-sm font-bold text-main flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>APIs que devem ser integradas antes ou em conjunto</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {api.antesDeUsar.apisVinculadasIds.map((vinculoId) => {
                  const linked = allApis.find((a) => a.id === vinculoId);
                  if (!linked) return null;
                  return (
                    <div
                      key={linked.id}
                      onClick={() => onSelectApiById(linked.id)}
                      className="p-3.5 rounded-lg border border-border-default hover:border-primary/40 bg-bg-page hover:bg-surface cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-main">
                          {linked.nome}
                        </h3>
                        <p className="text-xs text-muted">
                          {linked.orgao} • {linked.dificuldade}
                        </p>
                      </div>
                      <span className="text-xs text-primary font-semibold">
                        Acessar API →
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab 4: Macetes */}
      {activeTab === 'macetes' && (
        <div className="space-y-5">
          <section className="bg-surface rounded-xl p-5 border border-border-default space-y-1 shadow-2xs">
            <h2 className="text-sm font-bold text-main">
              Macetes e lições aprendidas da equipe YouX
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Dicas práticas de homologação e pegadinhas reportadas por POs e desenvolvedores em projetos reais.
            </p>
          </section>

          {/* List of macetes */}
          <div className="space-y-3">
            {api.macetes.map((macete) => (
              <div
                key={macete.id}
                className="bg-surface rounded-xl p-4 sm:p-5 border border-border-default space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                      {macete.autor.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-main">{macete.autor}</span>
                      <span className="text-muted mx-1.5">·</span>
                      <span className="text-muted">{macete.cargo}</span>
                    </div>
                  </div>
                  <span className="text-muted font-sans tabular-nums text-xs">{macete.data}</span>
                </div>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed pl-8">
                  "{macete.conteudo}"
                </p>
              </div>
            ))}
          </div>

          {/* Add Macete Form */}
          <section className="bg-surface rounded-xl p-5 border border-border-default space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-bold text-main">
                Adicionar novo macete para esta API
              </h2>
            </div>

            <form onSubmit={handleSubmitMacete} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="macete-autor" className="block text-xs font-semibold text-secondary mb-1">
                    Seu nome
                  </label>
                  <input
                    id="macete-autor"
                    type="text"
                    value={novoAutor}
                    onChange={(e) => setNovoAutor(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-1.5 bg-bg-page border border-border-default rounded-lg text-xs sm:text-sm text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                  />
                </div>
                <div>
                  <label htmlFor="macete-cargo" className="block text-xs font-semibold text-secondary mb-1">
                    Seu cargo
                  </label>
                  <input
                    id="macete-cargo"
                    type="text"
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-1.5 bg-bg-page border border-border-default rounded-lg text-xs sm:text-sm text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="macete-conteudo" className="block text-xs font-semibold text-secondary mb-1">
                  Macete ou dica prática de homologação
                </label>
                <textarea
                  id="macete-conteudo"
                  rows={3}
                  value={novoConteudo}
                  onChange={(e) => setNovoConteudo(e.target.value)}
                  placeholder="Exemplo: Nunca envie a query com espaços no CNPJ; o gateway retorna erro 500 sem mensagem explicativa..."
                  className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-lg text-xs sm:text-sm text-main focus-visible:outline-2 focus-visible:outline-focus-ring leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {maceteSucesso ? (
                  <span className="text-xs text-success-text font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Macete publicado com sucesso!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  disabled={!novoConteudo.trim()}
                  className="min-h-[44px] px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-fg text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Publicar macete</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Tab 5: Histórico */}
      {adminView && activeTab === 'historico' && (
        <section className="bg-surface rounded-xl p-5 sm:p-6 border border-border-default space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-main">
            Histórico de verificação e atualizações normativas
          </h2>
          <div className="space-y-3.5">
            {api.historico.map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-3.5 border-b border-border-subtle last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true"></div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-sans tabular-nums font-medium text-primary">{item.data}</span>
                    <span className="text-muted">·</span>
                    <span className="font-semibold text-main">{item.responsavel}</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    {item.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
