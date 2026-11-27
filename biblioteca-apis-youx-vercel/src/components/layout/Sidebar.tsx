import React from 'react';
import { 
  BookOpen, 
  FolderKanban, 
  FileText,
  Star,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { UserProfile } from '../../types';

interface SidebarProps {
  currentTab: 'biblioteca' | 'favoritas' | 'projetos' | 'documentos';
  onSelectTab: (tab: 'biblioteca' | 'favoritas' | 'projetos' | 'documentos') => void;
  apisCount?: number;
  favoritasCount?: number;
  projetosCount?: number;
  riscoCount?: number;
  currentUser: UserProfile;
  onLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems: { id: 'biblioteca' | 'favoritas' | 'projetos' | 'documentos'; label: string; icon: React.ElementType; badge?: string }[] = [
    {
      id: 'biblioteca',
      label: 'Biblioteca de APIs',
      icon: BookOpen,
    },
    {
      id: 'favoritas',
      label: 'APIs favoritas',
      icon: Star,
    },
    {
      id: 'projetos',
      label: 'Projetos',
      icon: FolderKanban,
    },
    {
      id: 'documentos',
      label: 'Gerador de documentos',
      icon: FileText,
    },
  ];

  return (
    <aside 
      aria-label="Menu principal"
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } shrink-0 bg-surface border-r border-border-default flex flex-col h-screen sticky top-0 z-30 select-none transition-all duration-200`}
    >
      {/* Brand Header */}
      <div className={`border-b border-border-default ${isCollapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-4 flex items-center justify-between'}`}>
        <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
          <img src="/youx-icon.png" alt="YouX" className="w-10 h-10 rounded-xl shadow-xs shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-base tracking-tight text-main block leading-tight truncate">
                Biblioteca de APIs
              </span>
              <p className="text-xs text-text-muted font-medium flex items-center gap-1.5 mt-0.5 truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                <span>YouX GovTech</span>
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-text-muted hover:text-primary-text hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav aria-label="Navegação da plataforma" className={`flex-1 ${isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-1.5'} overflow-y-auto`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
              className={`w-full min-h-[44px] flex items-center ${
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl text-sm transition-all text-left cursor-pointer group relative ${
                isActive
                  ? 'bg-primary text-primary-fg font-bold shadow-xs'
                  : 'text-text-secondary font-semibold hover:bg-surface-hover hover:text-primary-text'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-primary-fg'
                      : 'text-text-muted group-hover:text-primary-text'
                  }`}
                  aria-hidden="true"
                />
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-success-text ring-2 ring-surface" aria-hidden="true" />
                )}
              </div>

              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-white/20 text-primary-fg'
                          : 'bg-primary-light text-primary-text'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & explicit logout button */}
      <div className={`border-t border-border-default bg-surface-hover ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3.5'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg bg-primary text-primary-fg flex items-center justify-center font-bold text-xs shadow-xs"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              {currentUser.avatarInitials}
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sair da conta"
              aria-label="Sair da conta"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-danger-text hover:bg-danger-bg rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary text-primary-fg flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {currentUser.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-main truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-text-muted font-medium truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Sair da conta"
              aria-label="Sair da conta"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-danger-text hover:bg-danger-bg rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
