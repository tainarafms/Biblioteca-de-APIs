import React from 'react';
import { 
  BookOpen, 
  FolderKanban, 
  FileText,
  Star
} from 'lucide-react';
interface SidebarProps {
  currentTab: 'biblioteca' | 'favoritas' | 'projetos' | 'documentos';
  onSelectTab: (tab: 'biblioteca' | 'favoritas' | 'projetos' | 'documentos') => void;
  apisCount?: number;
  favoritasCount?: number;
  projetosCount?: number;
  riscoCount?: number;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed = false,
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

      <div className="border-t border-border-default p-3">
        <p className={`text-xs font-medium text-text-muted ${isCollapsed ? 'sr-only' : ''}`}>Biblioteca de integrações YouX</p>
      </div>
    </aside>
  );
};
