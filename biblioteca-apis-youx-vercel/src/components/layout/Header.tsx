import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { UserProfile, AppNotification } from '../../types';
import { MOCK_USERS } from '../../data/mockUsers';
import { formatDateBR, formatDateISO, isReferenceDateOverridden, getReferenceDate } from '../../utils/date';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  currentScreenName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchUser: (user: UserProfile) => void;
  riscoCount: number;
  onNavigateToProjects: () => void;
  notifications?: AppNotification[];
  onOpenProjectApiDrawer?: (projectId: string, apiId: string) => void;
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
  currentUser,
  onLogout,
  onSwitchUser,
  riscoCount,
  onNavigateToProjects,
  notifications = [],
  onOpenProjectApiDrawer,
  isSidebarCollapsed = false,
  onToggleSidebar,
  pendingSuggestionsCount = 0,
  onOpenSuggestionsBank,
  adminView,
  onToggleAdminView,
  referenceDate = getReferenceDate(),
  onReferenceDateChange,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.lida).length;
  const isOverridden = isReferenceDateOverridden();

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="h-18 bg-surface border-b border-border-default px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Accessible Breadcrumb Context & Sidebar Toggle */}
      <nav aria-label="Localização atual" className="flex items-center gap-2 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-text-muted hover:text-primary-text hover:bg-surface-hover transition-colors cursor-pointer mr-1"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
        <span className="font-bold text-sm text-primary-text">
          YouX
        </span>
        <span className="text-sm text-text-muted" aria-hidden="true">/</span>
        <span className="text-sm font-semibold text-main truncate">
          {currentScreenName}
        </span>
      </nav>

      {/* Right Actions: Notifications, Theme Switch, and User Profile (Target size >= 44x44px) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Admin Suggestions Bank Quick Access */}
        {adminView && onOpenSuggestionsBank && (
          <button
            type="button"
            onClick={onOpenSuggestionsBank}
            title="Banco de sugestões de APIs (curadoria & aprovação)"
            aria-label="Abrir banco de sugestões de APIs"
            className="min-h-[44px] px-3.5 rounded-xl border border-border-default bg-surface hover:bg-surface-hover text-xs font-semibold text-main hover:border-primary flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-primary-text" aria-hidden="true" />
            <span className="hidden md:inline font-bold">Sugestões</span>
            {pendingSuggestionsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-warning-bg text-warning-text border border-warning-border">
                {pendingSuggestionsCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            title="Notificações e menções em APIs"
            aria-label={`Notificações e menções em APIs. ${unreadCount} não lidas.`}
            aria-expanded={isNotificationsOpen}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-secondary hover:text-primary-text hover:bg-surface-hover transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {(unreadCount > 0 || riscoCount > 0) && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-danger-text ring-2 ring-surface" aria-hidden="true" />
            )}
          </button>

          {isNotificationsOpen && (
            <div 
              role="region"
              aria-label="Painel de notificações"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-elevated border border-border-default rounded-2xl shadow-xl p-4 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="font-bold text-sm text-main">
                  Notificações das APIs
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary-light text-primary-text font-bold">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo lido'}
                </span>
              </div>

              <div className="py-3 space-y-2.5 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">
                    Nenhuma notificação no momento.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        if (onOpenProjectApiDrawer) {
                          onOpenProjectApiDrawer(notif.projetoId, notif.apiId);
                        } else {
                          onNavigateToProjects();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsNotificationsOpen(false);
                          if (onOpenProjectApiDrawer) {
                            onOpenProjectApiDrawer(notif.projetoId, notif.apiId);
                          } else {
                            onNavigateToProjects();
                          }
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        !notif.lida
                          ? 'bg-primary-light border-primary/30 text-main'
                          : 'bg-surface border-border-default hover:bg-surface-hover text-main'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-xs text-main truncate">
                          {notif.titulo}
                        </span>
                        <span className="text-xs text-text-muted shrink-0 tabular-nums">
                          {notif.tempo}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">
                        {notif.descricao}
                      </p>
                      <span className="mt-2 inline-block text-xs font-bold text-primary-text hover:underline">
                        Abrir painel da API →
                      </span>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  onNavigateToProjects();
                }}
                className="w-full min-h-[44px] py-2.5 bg-primary hover:bg-primary-hover text-primary-fg font-semibold rounded-xl text-center text-sm transition-colors cursor-pointer mt-2"
              >
                Ver plano de integrações completo
              </button>
            </div>
          )}
        </div>

        {/* Data de referência da demonstração, visível apenas na visualização administrativa */}
        {adminView && <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            onClick={() => {
              setIsDatePickerOpen(!isDatePickerOpen);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            title="Data de referência da demonstração"
            aria-label={`Data de referência da demonstração: ${formatDateBR(referenceDate)}. Clique para alterar.`}
            aria-expanded={isDatePickerOpen}
            className={`min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isOverridden
                ? 'border-primary/40 bg-primary-light text-primary-text'
                : 'border-border-default bg-surface hover:bg-surface-hover text-text-secondary hover:text-main'
            }`}
          >
            <Calendar className="w-4 h-4 text-primary-text" aria-hidden="true" />
            <span className="hidden sm:inline font-bold tabular-nums">
              {formatDateBR(referenceDate)}
            </span>
            {isOverridden && (
              <span className="w-2 h-2 rounded-full bg-primary" title="Data customizada ativa" />
            )}
          </button>

          {isDatePickerOpen && (
            <div
              role="region"
              aria-label="Controle de data de referência da demonstração"
              className="absolute right-0 mt-2 w-80 bg-surface-elevated border border-border-default rounded-2xl shadow-xl p-4 z-50 text-sm animate-in fade-in zoom-in-95 duration-100 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="font-bold text-sm text-main flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary-text" aria-hidden="true" />
                  Data de referência da demo
                </span>
                {isOverridden && (
                  <span className="text-xs px-2 py-0.5 rounded bg-warning-bg text-warning-text font-bold">
                    Customizada
                  </span>
                )}
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Define a data base usada para calcular riscos, prazos de sprints e notificações relativas.
              </p>

              <div>
                <label htmlFor="ref-date-input" className="block text-xs font-bold text-main mb-1">
                  Selecione uma data:
                </label>
                <input
                  id="ref-date-input"
                  type="date"
                  value={formatDateISO(referenceDate)}
                  onChange={(e) => {
                    if (onReferenceDateChange && e.target.value) {
                      onReferenceDateChange(e.target.value);
                    }
                  }}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-border-default rounded-xl text-sm font-semibold text-main focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-border-subtle space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onReferenceDateChange) {
                      onReferenceDateChange(null);
                    }
                    setIsDatePickerOpen(false);
                  }}
                  className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-border-default bg-surface hover:bg-surface-hover text-xs font-semibold text-main flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                  <span>Usar data real do sistema (Hoje)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onReferenceDateChange) {
                      onReferenceDateChange('2026-10-29');
                    }
                    setIsDatePickerOpen(false);
                  }}
                  className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-primary/20 bg-primary-light hover:bg-primary/20 text-xs font-semibold text-primary-text flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Cenário baseline (29/10/2026)</span>
                </button>
              </div>
            </div>
          )}
        </div>}

        <button
          type="button"
          onClick={onToggleAdminView}
          aria-pressed={adminView}
          aria-label={`Alternar perfil de visualização. Perfil atual: ${adminView ? 'Administrador' : 'Usuário'}`}
          className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold transition-colors ${adminView ? 'bg-primary-light border-primary/30 text-primary-text' : 'bg-surface border-border-default text-text-secondary hover:bg-surface-hover'}`}
        >
          {adminView ? 'Administrador' : 'Usuário'}
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
          aria-label={isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-secondary hover:text-primary-text hover:bg-surface-hover transition-colors cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-warning-text" aria-hidden="true" />
          ) : (
            <Moon className="w-5 h-5 text-primary-text" aria-hidden="true" />
          )}
        </button>

        <div className="h-6 w-[1px] bg-border-default mx-1" aria-hidden="true" />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            aria-label={`Menu do usuário: ${currentUser.name}`}
            aria-expanded={isProfileOpen}
            className="min-h-[44px] flex items-center gap-2.5 p-1.5 px-2.5 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-fg flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-main leading-tight group-hover:text-primary-text transition-colors">
                {currentUser.name}
              </p>
              <span className="text-xs text-text-muted font-medium block">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-main transition-colors" aria-hidden="true" />
          </button>

          {isProfileOpen && (
            <div 
              role="menu"
              aria-label="Opções do usuário"
              className="absolute right-0 mt-2 w-72 bg-surface-elevated border border-border-default rounded-2xl shadow-xl p-4 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
            >
              {/* User details */}
              <div className="pb-3 border-b border-border-subtle">
                <p className="font-bold text-main text-sm">
                  {currentUser.name}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {currentUser.email}
                </p>
                <span className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-primary-light text-primary-text border border-primary/20">
                  {currentUser.cargoDetalhado}
                </span>
              </div>

              {/* Quick switch between available team accounts */}
              <div className="py-3 border-b border-border-subtle space-y-1.5">
                <span className="text-xs font-bold text-text-secondary block mb-1">
                  Trocar de perfil da equipe
                </span>
                {MOCK_USERS.map((user) => {
                  const isActive = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSwitchUser(user);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full min-h-[44px] flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-primary-light font-bold text-primary-text'
                          : 'text-main hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-md bg-primary/10 text-primary-text flex items-center justify-center text-xs font-bold">
                          {user.avatarInitials}
                        </span>
                        <div>
                          <p className="text-sm truncate">{user.name}</p>
                          <p className="text-xs text-text-muted">{user.role}</p>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-primary-text" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {/* Logout button */}
              <div className="pt-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2 text-danger-text hover:bg-danger-bg rounded-xl transition-colors cursor-pointer font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Sair da conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
