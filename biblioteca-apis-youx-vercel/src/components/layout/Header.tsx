import React from 'react';
import { Calendar, LogOut, Moon, PanelLeftClose, PanelLeftOpen, RotateCcw, ShieldCheck, Sun } from 'lucide-react';
import { formatDateBR, formatDateISO, getReferenceDate, isReferenceDateOverridden } from '../../utils/date';

interface HeaderProps {
  currentScreenName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  pendingSuggestionsCount?: number;
  onOpenSuggestionsBank?: () => void;
  adminView: boolean;
  onToggleAdminView: () => void;
  referenceDate?: Date;
  onReferenceDateChange?: (dateStr: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreenName,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
  isSidebarCollapsed = false,
  onToggleSidebar,
  pendingSuggestionsCount = 0,
  onOpenSuggestionsBank,
  adminView,
  onToggleAdminView,
  referenceDate = getReferenceDate(),
  onReferenceDateChange,
}) => {
  const isOverridden = isReferenceDateOverridden();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border-default bg-surface px-4 transition-colors lg:px-8">
      <nav aria-label="Localização atual" className="flex min-w-0 items-center gap-2">
        {onToggleSidebar && (
          <button type="button" onClick={onToggleSidebar} title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} className="mr-1 flex min-h-11 min-w-11 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-hover hover:text-primary-text">
            {isSidebarCollapsed ? <PanelLeftOpen className="size-5" aria-hidden="true" /> : <PanelLeftClose className="size-5" aria-hidden="true" />}
          </button>
        )}
        <span className="text-sm font-bold text-primary-text">YouX</span>
        <span className="text-sm text-text-muted" aria-hidden="true">/</span>
        <span className="truncate text-sm font-semibold text-main">{currentScreenName}</span>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        {adminView && onOpenSuggestionsBank && (
          <button type="button" onClick={onOpenSuggestionsBank} aria-label="Abrir banco de sugestões de APIs" className="flex min-h-11 items-center gap-2 rounded-xl border border-border-default bg-surface px-3.5 text-xs font-semibold text-main shadow-xs transition-colors hover:border-primary hover:bg-surface-hover">
            <ShieldCheck className="size-4 text-primary-text" aria-hidden="true" />
            <span className="hidden font-bold md:inline">Sugestões</span>
            {pendingSuggestionsCount > 0 && <span className="rounded-full border border-warning-border bg-warning-bg px-1.5 py-0.5 text-xs font-bold text-warning-text">{pendingSuggestionsCount}</span>}
          </button>
        )}

        {adminView && (
          <details className="relative">
            <summary aria-label={`Data de referência da demonstração: ${formatDateBR(referenceDate)}`} className={`flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 ${isOverridden ? 'border-primary/40 bg-primary-light text-primary-text' : 'border-border-default bg-surface text-text-secondary hover:bg-surface-hover'}`}>
              <Calendar className="size-4 text-primary-text" aria-hidden="true" />
              <span className="hidden font-bold tabular-nums sm:inline">{formatDateBR(referenceDate)}</span>
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-border-default bg-surface-elevated p-4 text-sm shadow-xl">
              <h2 className="flex items-center gap-2 font-bold text-main"><Calendar className="size-4 text-primary-text" /> Data de referência da demo</h2>
              <p className="text-xs leading-relaxed text-text-muted">Data de referência para o cenário demonstrativo.</p>
              <label htmlFor="ref-date-input" className="block text-xs font-bold text-main">Selecione uma data:</label>
              <input id="ref-date-input" type="date" value={formatDateISO(referenceDate)} onChange={(event) => event.target.value && onReferenceDateChange?.(event.target.value)} className="min-h-11 w-full rounded-xl border border-border-default bg-surface px-3 py-2 text-sm font-semibold text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              <button type="button" onClick={() => onReferenceDateChange?.(null)} className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-main transition-colors hover:bg-surface-hover"><RotateCcw className="size-3.5 text-text-muted" aria-hidden="true" /> Usar data real do sistema</button>
            </div>
          </details>
        )}

        <button type="button" onClick={onToggleAdminView} aria-pressed={adminView} aria-label={`Alternar perfil de visualização. Perfil atual: ${adminView ? 'Administrador' : 'Usuário'}`} className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition-colors ${adminView ? 'border-primary/30 bg-primary-light text-primary-text' : 'border-border-default bg-surface text-text-secondary hover:bg-surface-hover'}`}>
          {adminView ? 'Administrador' : 'Usuário'}
        </button>
        <button type="button" onClick={onToggleDarkMode} title={isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro'} aria-label={isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro'} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-hover hover:text-primary-text">
          {isDarkMode ? <Sun className="size-5 text-warning-text" aria-hidden="true" /> : <Moon className="size-5 text-primary-text" aria-hidden="true" />}
        </button>
        <span className="mx-1 h-6 w-px bg-border-default" aria-hidden="true" />
        <button type="button" onClick={onLogout} title="Sair da demonstração" aria-label="Sair da demonstração" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-danger-bg hover:text-danger-text"><LogOut className="size-4" aria-hidden="true" /></button>
      </div>
    </header>
  );
};
