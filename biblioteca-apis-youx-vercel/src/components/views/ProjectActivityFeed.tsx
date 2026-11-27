import React, { useState } from 'react';
import { 
  MessageSquare, 
  Activity, 
  Filter, 
  User, 
  Layers, 
  Calendar, 
  ChevronRight, 
  ExternalLink 
} from 'lucide-react';
import { ApiComment, ApiAuditRecord, PlanoItem } from '../../types';
import { getReferenceDate, getRelativeDateLabel } from '../../utils/date';

interface ProjectActivityFeedProps {
  comments: ApiComment[];
  auditLogs: ApiAuditRecord[];
  planoItems: PlanoItem[];
  onOpenApiDrawer: (apiId: string) => void;
  referenceDate?: Date;
}

export const ProjectActivityFeed: React.FC<ProjectActivityFeedProps> = ({
  comments,
  auditLogs,
  planoItems,
  onOpenApiDrawer,
  referenceDate = getReferenceDate(),
}) => {
  const [filterType, setFilterType] = useState<'tudo' | 'conversa' | 'alteracoes'>('tudo');
  const [filterPerson, setFilterPerson] = useState<string>('todas');
  const [filterApi, setFilterApi] = useState<string>('todas');

  // Unified items
  type FeedItem = 
    | { type: 'comment'; dateKey: string; dataHora: string; autor: string; apiId: string; apiNome: string; data: ApiComment }
    | { type: 'audit'; dateKey: string; dataHora: string; autor: string; apiId: string; apiNome: string; data: ApiAuditRecord };

  // Dynamically compute day label relative to active reference date
  const getDateLabel = (dataHoraStr: string) => {
    return getRelativeDateLabel(dataHoraStr, referenceDate, { includeFullDate: true });
  };

  const getApiName = (apiId: string) => {
    const item = planoItems.find((p) => p.apiId === apiId);
    return item ? item.apiNome : apiId;
  };

  const allFeedItems: FeedItem[] = [
    ...comments.map((c) => ({
      type: 'comment' as const,
      dateKey: getDateLabel(c.dataHora),
      dataHora: c.dataHora,
      autor: c.autor,
      apiId: c.apiId,
      apiNome: getApiName(c.apiId),
      data: c,
    })),
    ...auditLogs.map((a) => ({
      type: 'audit' as const,
      dateKey: getDateLabel(a.dataHora),
      dataHora: a.dataHora,
      autor: a.autor,
      apiId: a.apiId,
      apiNome: getApiName(a.apiId),
      data: a,
    })),
  ];

  // Distinct persons for filter
  const distinctPersons = Array.from(new Set(allFeedItems.map((i) => i.autor)));

  // Filtered items
  const filtered = allFeedItems.filter((item) => {
    if (filterType === 'conversa' && item.type !== 'comment') return false;
    if (filterType === 'alteracoes' && item.type !== 'audit') return false;
    if (filterPerson !== 'todas' && item.autor !== filterPerson) return false;
    if (filterApi !== 'todas' && item.apiId !== filterApi) return false;
    return true;
  });

  // Group by day label
  const groups: { [key: string]: FeedItem[] } = {};
  filtered.forEach((item) => {
    if (!groups[item.dateKey]) {
      groups[item.dateKey] = [];
    }
    groups[item.dateKey].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Filter toolbar */}
      <section 
        aria-label="Filtros de atividade do projeto" 
        className="bg-white dark:bg-[#1C1519] p-4 rounded-2xl border border-[#E8DFE3] dark:border-[#2E2328] shadow-xs flex flex-wrap items-center justify-between gap-3 text-sm"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488]" aria-hidden="true" />
          <span className="font-bold text-[#1F1A1C] dark:text-[#F7EFF2]">
            Filtrar atividades:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type filter */}
          <div className="flex items-center gap-1 bg-[#FAF7F8] dark:bg-[#22181E] p-1 rounded-xl border border-[#E8DFE3] dark:border-[#38262E]">
            <button
              type="button"
              onClick={() => setFilterType('tudo')}
              aria-pressed={filterType === 'tudo'}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'tudo'
                  ? 'bg-[#8B1D47] text-white shadow-xs'
                  : 'text-[#54494E] dark:text-[#D1C6CB] hover:text-[#1F1A1C]'
              }`}
            >
              Tudo
            </button>
            <button
              type="button"
              onClick={() => setFilterType('conversa')}
              aria-pressed={filterType === 'conversa'}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'conversa'
                  ? 'bg-[#8B1D47] text-white shadow-xs'
                  : 'text-[#54494E] dark:text-[#D1C6CB] hover:text-[#1F1A1C]'
              }`}
            >
              Conversa
            </button>
            <button
              type="button"
              onClick={() => setFilterType('alteracoes')}
              aria-pressed={filterType === 'alteracoes'}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'alteracoes'
                  ? 'bg-[#8B1D47] text-white shadow-xs'
                  : 'text-[#54494E] dark:text-[#D1C6CB] hover:text-[#1F1A1C]'
              }`}
            >
              Alterações
            </button>
          </div>

          {/* Filter by API */}
          <select
            value={filterApi}
            onChange={(e) => setFilterApi(e.target.value)}
            aria-label="Filtrar por API"
            className="min-h-[40px] px-3 py-1.5 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl text-xs font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none cursor-pointer"
          >
            <option value="todas">Todas as APIs</option>
            {planoItems.map((p) => (
              <option key={p.apiId} value={p.apiId}>
                {p.apiNome}
              </option>
            ))}
          </select>

          {/* Filter by Person */}
          <select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
            aria-label="Filtrar por pessoa"
            className="min-h-[40px] px-3 py-1.5 bg-[#FAF7F8] dark:bg-[#20151B] border border-[#E8DFE3] dark:border-[#38262E] rounded-xl text-xs font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none cursor-pointer"
          >
            <option value="todas">Todas as pessoas</option>
            {distinctPersons.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Feed Groups */}
      {Object.keys(groups).length === 0 ? (
        <div className="bg-white dark:bg-[#1C1519] rounded-2xl p-12 text-center border border-[#E8DFE3] dark:border-[#2E2328]">
          <p className="text-sm font-semibold text-[#54494E] dark:text-[#D1C6CB]">
            Nenhuma atividade corresponde aos filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([dayLabel, items]) => (
            <div key={dayLabel} className="space-y-3">
              {/* Day divider header */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8B1D47]/10 dark:bg-[#C8376A]/20 text-[#8B1D47] dark:text-[#E55488] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{dayLabel}</span>
                </span>
                <div className="flex-1 h-[1px] bg-[#E8DFE3] dark:border-[#2C1F25]" />
              </div>

              {/* Items in that day */}
              <div className="space-y-2.5">
                {items.map((item) => {
                  if (item.type === 'audit') {
                    const log = item.data;
                    return (
                      <div
                        key={log.id}
                        onClick={() => onOpenApiDrawer(item.apiId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenApiDrawer(item.apiId);
                          }
                        }}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#1C1519] border border-[#E8DFE3] dark:border-[#2E2328] hover:border-[#8B1D47] dark:hover:border-[#E55488] transition-colors cursor-pointer flex items-center justify-between gap-3 group focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                            <Activity className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1F1A1C] dark:text-[#F7EFF2] truncate">
                              {log.textoFormatado}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#54494E] dark:text-[#A3969C]">
                              <span className="font-bold text-[#8B1D47] dark:text-[#E55488]">
                                {item.apiNome}
                              </span>
                              <span>·</span>
                              <span>{log.dataHora}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-[#54494E] dark:text-[#A3969C] group-hover:text-[#8B1D47] dark:group-hover:text-[#E55488] font-bold shrink-0">
                          <span>Ver painel</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  }

                  const comment = item.data;
                  return (
                    <div
                      key={comment.id}
                      onClick={() => onOpenApiDrawer(item.apiId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenApiDrawer(item.apiId);
                        }
                      }}
                      className="p-4 rounded-xl bg-white dark:bg-[#1C1519] border border-[#E8DFE3] dark:border-[#2E2328] hover:border-[#8B1D47] dark:hover:border-[#E55488] transition-colors cursor-pointer space-y-2 group focus-visible:ring-2 focus-visible:ring-[#8B1D47] focus-visible:outline-none shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-[#8B1D47] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {comment.avatarInitials}
                          </span>
                          <span className="font-bold text-sm text-[#1F1A1C] dark:text-[#F7EFF2]">
                            {comment.autor}
                          </span>
                          <span className="text-xs text-[#8B1D47] dark:text-[#E55488] font-semibold">
                            ({comment.cargo})
                          </span>
                          <span className="text-xs text-[#54494E] dark:text-[#A3969C] hidden sm:inline">
                            comentou na API <strong className="text-[#1F1A1C] dark:text-[#F7EFF2]">{item.apiNome}</strong>
                          </span>
                        </div>

                        <span className="text-xs text-[#54494E] dark:text-[#A3969C] shrink-0">
                          {comment.dataHora}
                        </span>
                      </div>

                      <p className="text-sm text-[#362C31] dark:text-[#EAE1E5] line-clamp-2 leading-relaxed pl-9">
                        "{comment.texto}"
                      </p>

                      <div className="flex items-center justify-between pl-9 pt-1 text-xs">
                        <span className="font-bold text-[#8B1D47] dark:text-[#E55488] flex items-center gap-1 sm:hidden">
                          API {item.apiNome}
                        </span>
                        <span className="font-bold text-[#8B1D47] dark:text-[#E55488] flex items-center gap-1 group-hover:underline ml-auto">
                          Abrir conversa completa <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
