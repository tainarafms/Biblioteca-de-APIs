import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ArrowRight, 
  Star, 
  Check,
  Compass,
  Clock,
  UserCheck,
  CheckCircle2,
  FolderPlus,
  ShieldCheck
} from 'lucide-react';
import { ApiItem, UserProfile } from '../../types';
import { DifficultyBadge } from '../common/Badges';

interface ApiLibraryViewProps {
  apis: ApiItem[];
  favoriteIds: string[];
  onToggleFavorite: (apiId: string) => void;
  onSelectApi: (apiId: string) => void;
  onOpenSuggestModal: () => void;
  onOpenAddToProjectModal?: (api: ApiItem) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isFavoritesOnlyView?: boolean;
  onNavigateToLibrary?: () => void;
  currentUser?: UserProfile;
  onOpenSuggestionsBank?: () => void;
  pendingSuggestionsCount?: number;
}

export const ApiLibraryView: React.FC<ApiLibraryViewProps> = ({
  apis,
  favoriteIds,
  onToggleFavorite,
  onSelectApi,
  onOpenSuggestModal,
  onOpenAddToProjectModal,
  searchQuery,
  onSearchChange,
  isFavoritesOnlyView = false,
  onNavigateToLibrary,
  currentUser,
  onOpenSuggestionsBank,
  pendingSuggestionsCount = 0,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [onlyConectaGov, setOnlyConectaGov] = useState<boolean>(false);

  // Filter chips in sentence case
  const filterChips = [
    { id: 'todos', label: 'Todas as categorias' },
    { id: 'orgaos-federais', label: 'Órgãos federais' },
    { id: 'geolocalizacao', label: 'Geolocalização / GIS' },
    { id: 'cadastro-pessoas', label: 'Cadastro de pessoas' },
    { id: 'autenticacao', label: 'Autenticação & Gov.br' },
  ];

  const filteredApis = useMemo(() => {
    return apis.filter((api) => {
      // If favorites-only view, only show favorited APIs
      if (isFavoritesOnlyView && !favoriteIds.includes(api.id)) {
        return false;
      }

      // If favorites view, don't apply the library search/filters
      if (isFavoritesOnlyView) {
        return true;
      }

      // Conecta gov.br toggle chip
      if (onlyConectaGov && !api.conectaGov) {
        return false;
      }

      // 1. Text search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        api.nome.toLowerCase().includes(q) ||
        api.orgao.toLowerCase().includes(q) ||
        api.orgaoNomeCompleto.toLowerCase().includes(q) ||
        api.descricaoSimples.toLowerCase().includes(q) ||
        api.visaoGeral.oQueFaz.toLowerCase().includes(q) ||
        api.visaoGeral.dadosEntrada.some(d => d.toLowerCase().includes(q)) ||
        api.visaoGeral.dadosRetornados.some(r => r.campo.toLowerCase().includes(q) || r.descricao.toLowerCase().includes(q)) ||
        api.categorias.some(c => c.toLowerCase().includes(q))
      );

      // 2. Chip category filter
      let matchesCategory = true;
      if (activeFilter === 'orgaos-federais') {
        matchesCategory = api.categorias.includes('Órgãos federais');
      } else if (activeFilter === 'geolocalizacao') {
        matchesCategory = api.categorias.includes('Geolocalização');
      } else if (activeFilter === 'cadastro-pessoas') {
        matchesCategory = api.categorias.includes('Cadastro de pessoas');
      } else if (activeFilter === 'autenticacao') {
        matchesCategory = api.categorias.includes('Autenticação');
      }

      return matchesSearch && matchesCategory;
    });
  }, [apis, favoriteIds, isFavoritesOnlyView, onlyConectaGov, searchQuery, activeFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-main tracking-tight">
            {isFavoritesOnlyView ? 'APIs Favoritas' : 'Biblioteca de APIs'}
          </h1>
          <p className="text-sm text-secondary mt-1 leading-relaxed">
            {isFavoritesOnlyView
              ? 'Acesso rápido às APIs salvas para acompanhamento de prazos e inclusão em projetos.'
              : 'Consulte rotas oficiais, prazos reais de homologação e requisitos para seus projetos.'}
          </p>
        </div>

        {!isFavoritesOnlyView && (
          <div className="shrink-0 flex items-center gap-2">
            {onOpenSuggestionsBank && (
              <button
                type="button"
                onClick={onOpenSuggestionsBank}
                className="min-h-[44px] px-3.5 bg-surface border border-border-default hover:border-primary text-main hover:text-primary text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Banco de sugestões</span>
                {pendingSuggestionsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warning-bg text-warning-text border border-warning-border">
                    {pendingSuggestionsCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSuggestModal}
              className="min-h-[44px] px-3.5 bg-primary hover:bg-primary-hover text-primary-fg text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Sugerir nova API</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Unified Search & Single-row Filters Toolbar */}
      {!isFavoritesOnlyView && (
        <div className="space-y-3">
          {/* Main Dominant Search Input */}
          <div className="relative w-full">
            <label htmlFor="api-search-input" className="sr-only">
              Pesquisar por nome, sigla, órgão ou dado retornado
            </label>
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="api-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar por nome, sigla, órgão ou dado retornado (ex.: CPF, INCRA, SIGEF, CEP)..."
              className="w-full min-h-[44px] pl-10 pr-9 bg-surface border border-border-default rounded-xl text-sm text-main placeholder-muted focus-visible:outline-2 focus-visible:outline-focus-ring shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpar pesquisa"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center text-sm font-bold text-muted hover:text-main rounded-md cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                ×
              </button>
            )}
          </div>

          {/* Delicate Chips: Categories + 'Apenas Conecta gov.br' */}
          <div 
            role="toolbar" 
            aria-label="Filtros por categoria"
            className="flex flex-wrap items-center gap-1.5"
          >
            {filterChips.map((chip) => {
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveFilter(chip.id)}
                  aria-pressed={isActive}
                  className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring ${
                    isActive
                      ? 'bg-primary text-primary-fg shadow-2xs font-semibold'
                      : 'bg-surface text-secondary hover:text-main hover:bg-surface-hover border border-border-default'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}

            {/* 'Apenas Conecta gov.br' toggle chip */}
            <button
              type="button"
              onClick={() => setOnlyConectaGov(!onlyConectaGov)}
              aria-pressed={onlyConectaGov}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-focus-ring ${
                onlyConectaGov
                  ? 'bg-primary text-primary-fg shadow-2xs font-semibold'
                  : 'bg-surface text-secondary hover:text-main hover:bg-surface-hover border border-border-default'
              }`}
            >
              {onlyConectaGov && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>Apenas Conecta gov.br</span>
            </button>
          </div>
        </div>
      )}

      {/* Counter Placed cleanly above the grid */}
      {!isFavoritesOnlyView && (
        <div className="flex items-center justify-between text-xs text-muted pt-0.5">
          <span>
            Exibindo <strong className="font-semibold text-main tabular-nums">{filteredApis.length}</strong> de{' '}
            <span className="tabular-nums">{apis.length}</span> APIs
          </span>
        </div>
      )}

      {/* 3. Grid of Cards: Delicate, Organized & Balanced */}
      {filteredApis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {filteredApis.map((api) => {
            const isFav = favoriteIds.includes(api.id);

            return (
              <article
                key={api.id}
                className="bg-surface rounded-xl border border-border-default hover:border-primary/40 hover:shadow-sm transition-all duration-150 flex flex-col justify-between h-full group"
              >
                {/* Card Top & Content */}
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                  {/* Top Bar: Organ on left, Star on right */}
                  <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <span 
                      className="text-xs font-semibold text-primary truncate"
                      title={api.orgao}
                    >
                      {api.orgao}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(api.id);
                      }}
                      aria-pressed={isFav}
                      aria-label={isFav ? `Remover ${api.nome} dos favoritos` : `Adicionar ${api.nome} aos favoritos`}
                      className="min-w-[36px] min-h-[36px] -mr-1 rounded-md flex items-center justify-center text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isFav
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-muted'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {/* Title and Badges */}
                  <div className="space-y-1.5">
                    <h2 
                      onClick={() => onSelectApi(api.id)}
                      className="text-base font-bold text-main group-hover:text-primary transition-colors leading-snug cursor-pointer truncate"
                      title={api.nome}
                    >
                      {api.nome}
                    </h2>

                    {/* Dedicated Badges Row: Clear distinction & breathing space */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <DifficultyBadge level={api.dificuldade} />
                      {api.conectaGov && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-info-bg text-info-text border border-info-border shrink-0">
                          Conecta gov.br
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-secondary leading-relaxed line-clamp-2 min-h-[34px]">
                    {api.descricaoSimples}
                  </p>

                  {/* Key Info: Delicate Stats Box */}
                  <div className="bg-bg-page rounded-lg p-2.5 border border-border-subtle grid grid-cols-2 gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-muted flex items-center gap-1 mb-0.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                        Prazo estimado
                      </span>
                      <span 
                        className="text-xs font-semibold text-main truncate block" 
                        title={api.comoConseguirAcesso.prazoEstimadoFaixa}
                      >
                        {api.comoConseguirAcesso.prazoEstimadoFaixa}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-medium text-muted flex items-center gap-1 mb-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                        Solicitação
                      </span>
                      <span 
                        className="text-xs font-semibold text-main truncate block"
                        title={api.comoConseguirAcesso.quemSolicita}
                      >
                        {api.comoConseguirAcesso.quemSolicita}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Delicate Verification & Actions */}
                <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-border-subtle flex flex-col gap-2.5">
                  {/* Verification line */}
                  <div className="flex items-center gap-1.5 text-xs text-muted truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-text shrink-0" aria-hidden="true" />
                    <span className="truncate tabular-nums">
                      Verificado em {api.verificadoEm} · {api.verificadoPor.replace(' (PO YouX)', '').replace(' (Tech Lead)', '')}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAddToProjectModal && onOpenAddToProjectModal(api)}
                      className="min-h-[36px] px-2.5 text-xs font-medium text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-focus-ring"
                    >
                      <FolderPlus className="w-4 h-4" aria-hidden="true" />
                      <span>+ Projeto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectApi(api.id)}
                      className="min-h-[36px] px-3.5 text-xs font-medium text-primary-fg bg-primary hover:bg-primary-hover rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                    >
                      <span>Ver guia</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface rounded-2xl p-10 sm:p-14 border border-border-default text-center max-w-lg mx-auto my-8 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto">
            {isFavoritesOnlyView ? (
              <Star className="w-7 h-7 text-amber-500 fill-amber-400" aria-hidden="true" />
            ) : (
              <Search className="w-7 h-7 text-primary" aria-hidden="true" />
            )}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-main">
              {isFavoritesOnlyView ? 'Nenhuma API favoritada ainda' : 'Nenhuma API encontrada'}
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              {isFavoritesOnlyView
                ? 'Marque o ícone de estrela nas APIs da biblioteca para criar seu acesso rápido aqui.'
                : `Nenhum resultado corresponde à sua pesquisa por "${searchQuery}".`}
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            {isFavoritesOnlyView ? (
              <button
                type="button"
                onClick={onNavigateToLibrary}
                className="min-h-[44px] px-6 py-2.5 text-sm font-semibold text-primary-fg bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>Explorar a biblioteca</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setActiveFilter('todos');
                  setOnlyConectaGov(false);
                }}
                className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-secondary bg-surface hover:bg-surface-hover rounded-xl border border-border-default transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                Limpar busca e filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
