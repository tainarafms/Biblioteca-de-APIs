import React, { useState, useEffect } from 'react';
import { APIS_MOCK, PROJETOS_MOCK } from './data/mockData';
import { DEFAULT_USER, MOCK_USERS } from './data/mockUsers';
import { 
  ApiItem, 
  Projeto, 
  PlanoItem, 
  Macete, 
  IntegrationStatus, 
  RiskLevel, 
  UserProfile,
  ApiComment,
  ApiAuditRecord,
  AppNotification,
  ApiSuggestion
} from './types';
import { 
  INITIAL_COMMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockCollaboration';
import { INITIAL_SUGGESTIONS } from './data/mockSuggestions';
import { getReferenceDate, setReferenceDate } from './utils/date';
import { calcularRisco } from './utils/risk';
import { getCoherentProjetos } from './utils/coherentData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/views/LoginView';
import { ApiLibraryView } from './components/views/ApiLibraryView';
import { ApiDetailView } from './components/views/ApiDetailView';
import { ProjectsWorkspaceView } from './components/views/ProjectsWorkspaceView';
import { DocumentGeneratorView } from './components/views/DocumentGeneratorView';
import { SuggestApiModal } from './components/modals/SuggestApiModal';
import { AddToProjectModal } from './components/modals/AddToProjectModal';
import { SuggestionsBankModal } from './components/modals/SuggestionsBankModal';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('youx_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USER; // Default authenticated session (Tainara Souza - PO YouX)
  });

  // Collaborative timeline, comments, audits and notifications state
  const [comments, setComments] = useState<ApiComment[]>(INITIAL_COMMENTS);
  const [auditLogs, setAuditLogs] = useState<ApiAuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [followingApiIds, setFollowingApiIds] = useState<string[]>(['sicar', 'assinatura-gov']);
  const [activeDrawerApiId, setActiveDrawerApiId] = useState<string | null>(null);

  const [adminView, setAdminView] = useState(false);

  // Navegação principal
  const [currentTab, setCurrentTab] = useState<'biblioteca' | 'favoritas' | 'projetos' | 'documentos'>('biblioteca');
  
  // Detail view state: if non-null, displays Tela 2 (Página da API)
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);

  // Active project ID
  const [selectedProjectId, setSelectedProjectId] = useState<string>('psa-florestal');

  // Search query (synchronized between top header and library view)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('youx_favorite_apis');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['sigef', 'login-gov', 'cpf-luz'];
  });

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('youx_theme');
      if (savedTheme) return savedTheme === 'dark';
    } catch {
      // ignore
    }
    return false;
  });

  // Collapsible Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('youx_sidebar_collapsed');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return false;
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('youx_sidebar_collapsed', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Sync dark class on <html> document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('youx_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('youx_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist favorites in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('youx_favorite_apis', JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  // Persist user in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('youx_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('youx_auth_user');
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('youx_auth_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('youx_auth_user');
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('youx_auth_user', JSON.stringify(user));
  };

  // Toggle favorite handler
  const handleToggleFavorite = (apiId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(apiId) ? prev.filter((id) => id !== apiId) : [...prev, apiId]
    );
  };

  // Toggle dark mode handler
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Modals state
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isAddToProjectModalOpen, setIsAddToProjectModalOpen] = useState(false);
  const [apiForProjectModal, setApiForProjectModal] = useState<ApiItem | null>(null);

  // Reactive data with active reference date
  const [referenceDate, setRefDateState] = useState<Date>(() => getReferenceDate());
  const [apis, setApis] = useState<ApiItem[]>(APIS_MOCK);
  const [projetos, setProjetos] = useState<Projeto[]>(() =>
    getCoherentProjetos(getReferenceDate(), PROJETOS_MOCK)
  );

  const handleReferenceDateChange = (dateStr: string | null) => {
    setReferenceDate(dateStr);
    const newRef = getReferenceDate();
    setRefDateState(newRef);
    setProjetos((prevProjetos) => getCoherentProjetos(newRef, prevProjetos));
  };

  // Current active project
  const currentProjeto = projetos.find((p) => p.id === selectedProjectId) || projetos[0];

  // Count of APIs in risk for the active project
  const riscoCount = currentProjeto?.plano.filter((p) => p.risco === 'vermelho').length || 0;

  // Handler to open API details (Tela 2)
  const handleSelectApi = (apiId: string) => {
    setSelectedApiId(apiId);
  };

  // Handler to go back from API details to library
  const handleBackToLibrary = () => {
    setSelectedApiId(null);
  };

  // Handler to switch tabs
  const handleSelectTab = (tab: 'biblioteca' | 'favoritas' | 'projetos' | 'documentos') => {
    setCurrentTab(tab);
    setSelectedApiId(null);
  };

  // Handler to open Add to Project modal
  const handleOpenAddToProjectModal = (api?: ApiItem) => {
    setApiForProjectModal(api || null);
    setIsAddToProjectModalOpen(true);
  };

  // Banco de Sugestões de APIs (persisted in localStorage)
  const [suggestions, setSuggestions] = useState<ApiSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem('youx_api_suggestions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SUGGESTIONS;
  });

  const [isSuggestionsBankOpen, setIsSuggestionsBankOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('youx_api_suggestions', JSON.stringify(suggestions));
    } catch {
      // ignore
    }
  }, [suggestions]);

  const pendingSuggestionsCount = suggestions.filter((s) => s.status === 'pendente').length;

  // Handler de envio de sugestão (Adiciona na Fila de Curadoria, NÃO cadastra direto na biblioteca)
  const handleSubmitSuggestion = (suggestionData: Omit<ApiSuggestion, 'id' | 'dataCriacao' | 'status'>) => {
    const newSug: ApiSuggestion = {
      ...suggestionData,
      id: `sug-${Date.now()}`,
      dataCriacao: new Date().toLocaleDateString('pt-BR') + ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'pendente'
    };

    setSuggestions((prev) => [newSug, ...prev]);

    // Notificação automática para administradores
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      apiId: newSug.id,
      apiNome: newSug.nome,
      projetoId: 'psa-florestal',
      tipo: 'alteracao',
      titulo: 'Nova sugestão de API enviada',
      descricao: `${newSug.sugeridoPor} (${newSug.sugeridoPorCargo}) sugeriu a API "${newSug.nome}" para avaliação.`,
      tempo: 'Agora',
      lida: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handler de aprovação: Apenas admins podem liberar a API e publicá-la no catálogo
  const handleApproveSuggestion = (suggestionId: string) => {
    const sug = suggestions.find((s) => s.id === suggestionId);
    if (!sug) return;

    const newApiId = `api-${Date.now()}`;
    const newApi: ApiItem = {
      id: newApiId,
      nome: sug.nome,
      sigla: sug.sigla || sug.nome.slice(0, 6).toUpperCase(),
      orgao: sug.orgao,
      orgaoNomeCompleto: sug.orgaoNomeCompleto || sug.orgao,
      descricaoSimples: sug.descricaoSimples,
      conectaGov: sug.conectaGov,
      categorias: sug.categorias.length > 0 ? sug.categorias : ['Órgãos federais'],
      dificuldade: sug.dificuldade,
      dificuldadeMotivo: `Aprovada por curadoria da administração YouX a partir de sugestão de ${sug.sugeridoPor}.`,
      verificadoEm: new Date().toLocaleDateString('pt-BR'),
      verificadoPor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Tainara Souza (PO YouX)',
      visaoGeral: {
        oQueFaz: sug.descricaoSimples,
        dadosEntrada: sug.dadosEntrada ? [sug.dadosEntrada] : ['Identificador cadastral (CPF/CNPJ)'],
        dadosRetornados: sug.dadosRetorno 
          ? [{ campo: 'resposta_oficial', descricao: sug.dadosRetorno }]
          : [{ campo: 'registro_dados', descricao: 'Conteúdo principal retornado pela API' }],
        exemplosFormulario: ['Formulário eletrônico oficial'],
        linkDocumentacao: sug.linkDocumentacao || 'https://conecta.gov.br',
        linkSwagger: sug.linkSwagger,
        padraoAutenticacao: sug.padraoAutenticacao
      },
      comoConseguirAcesso: {
        quemSolicita: sug.quemSolicita,
        quemSolicitaDetalhes: `Solicitação oficial perante o órgão ${sug.orgao}.`,
        anexosAssinaturas: ['Ofício de solicitação formal assinado digitalmente ICP-Brasil'],
        prazoEstimadoFaixa: sug.prazoEstimadoDias || '15 a 30 dias úteis',
        prazoMinDias: 10,
        prazoMaxDias: 30,
        ambientes: {
          homologacao: sug.temSandbox ? 'https://sandbox.api.gov.br' : 'Não possui sandbox aberto',
          producao: 'https://api.gov.br'
        },
        passos: [
          {
            numero: 1,
            titulo: 'Credenciamento no portal do órgão',
            descricao: `Adesão formal ao catálogo de serviços do ${sug.orgao}.`
          },
          {
            numero: 2,
            titulo: 'Emissão de credenciais e chaves',
            descricao: 'Configuração de tokens e certificados digitais.'
          }
        ]
      },
      antesDeUsar: {
        avisoDestaque: 'API recém-aprovada na curadoria interna da YouX.',
        preRequisitos: sug.preRequisitos ? [sug.preRequisitos] : ['Adesão aos termos de sigilo e conformidade do órgão.'],
        apisVinculadasIds: [],
        contasRequeridas: 'Conta institucional / Certificado digital'
      },
      macetes: [],
      historico: [
        {
          id: `h-${Date.now()}`,
          data: new Date().toLocaleDateString('pt-BR'),
          responsavel: currentUser ? currentUser.name : 'Administrador YouX',
          descricao: `API aprovada no Banco de Sugestões e publicada no catálogo oficial.`
        }
      ]
    };

    // Publica no catálogo público oficial
    setApis((prev) => [newApi, ...prev]);

    // Atualiza status no banco de sugestões
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestionId
          ? {
              ...s,
              status: 'aprovada' as const,
              avaliadoPor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Administrador',
              dataAvaliacao: new Date().toLocaleDateString('pt-BR') + ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              apiCadastradaId: newApiId
            }
          : s
      )
    );

    // Notificação de publicação
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      apiId: newApiId,
      apiNome: sug.nome,
      projetoId: 'psa-florestal',
      tipo: 'alteracao',
      titulo: 'API Aprovada e Publicada',
      descricao: `A sugestão "${sug.nome}" foi aprovada por ${currentUser?.name || 'Administrador'} e publicada no catálogo público.`,
      tempo: 'Agora',
      lida: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Handler de rejeição
  const handleRejectSuggestion = (suggestionId: string, reason: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestionId
          ? {
              ...s,
              status: 'rejeitada' as const,
              avaliadoPor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Administrador',
              dataAvaliacao: new Date().toLocaleDateString('pt-BR') + ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              motivoRejeicao: reason
            }
          : s
      )
    );
  };

  // Handler to add a Macete to an API
  const handleAddMacete = (apiId: string, macete: Macete) => {
    setApis((prev) =>
      prev.map((a) => {
        if (a.id === apiId) {
          return {
            ...a,
            macetes: [macete, ...a.macetes],
          };
        }
        return a;
      })
    );
  };

  // Handler to update a PlanoItem directly in the project (status, sprint, etc.)
  const handleUpdatePlanoItem = (planoId: string, updates: Partial<PlanoItem>) => {
    let affectedApiId = '';
    let affectedApiNome = '';
    let fieldName = '';
    let oldVal = '';
    let newVal = '';

    setProjetos((prevProjetos) =>
      prevProjetos.map((proj) => {
        if (proj.id !== selectedProjectId) return proj;

        const updatedPlano = proj.plano.map((item) => {
          if (item.id !== planoId) return item;

          affectedApiId = item.apiId;
          affectedApiNome = item.apiNome;

          const newItem = { ...item, ...updates };

          if (updates.status && updates.status !== item.status) {
            fieldName = 'Status';
            oldVal = item.status;
            newVal = updates.status;
          } else if (updates.sprintId && updates.sprintId !== item.sprintId) {
            fieldName = 'Sprint';
            oldVal = `Sprint ${item.sprintId}`;
            newVal = `Sprint ${updates.sprintId}`;
          } else if (updates.responsavel && updates.responsavel !== item.responsavel) {
            fieldName = 'Responsável';
            oldVal = item.responsavel;
            newVal = updates.responsavel;
          } else if (updates.dataLimiteSolicitacao && updates.dataLimiteSolicitacao !== item.dataLimiteSolicitacao) {
            fieldName = 'Data-limite';
            oldVal = item.dataLimiteSolicitacao;
            newVal = updates.dataLimiteSolicitacao;
          } else if (updates.funcionalidadeCampo && updates.funcionalidadeCampo !== item.funcionalidadeCampo) {
            fieldName = 'Funcionalidade dependente';
            oldVal = item.funcionalidadeCampo;
            newVal = updates.funcionalidadeCampo;
          }

          // Central pure risk & deadline recalculation whenever sprint, status or deadline changes
          if (updates.sprintId || updates.status || updates.dataLimiteSolicitacao) {
            const targetSprintId = updates.sprintId || newItem.sprintId;
            const targetSprint = proj.sprints.find((s) => s.id === targetSprintId);
            const riskResult = calcularRisco(newItem, targetSprint, referenceDate);
            newItem.dataLimiteSolicitacao = riskResult.dataLimiteSolicitacao;
            newItem.risco = riskResult.risco;
            newItem.riscoMotivo = riskResult.riscoMotivo;
          }

          return newItem;
        });

        return { ...proj, plano: updatedPlano };
      })
    );

    // Record system audit entry automatically
    if (affectedApiId && fieldName) {
      const nowFormatted = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      const auditEntry: ApiAuditRecord = {
        id: `audit-${Date.now()}`,
        apiId: affectedApiId,
        autor: currentUser ? currentUser.name : 'Equipe YouX',
        dataHora: nowFormatted,
        campo: fieldName,
        de: oldVal,
        para: newVal,
        textoFormatado: `${currentUser ? currentUser.name : 'Equipe'} mudou ${fieldName} de "${oldVal}" para "${newVal}"`,
      };
      setAuditLogs((prev) => [...prev, auditEntry]);

      // If user follows this API, register notification
      if (followingApiIds.includes(affectedApiId)) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          apiId: affectedApiId,
          apiNome: affectedApiNome,
          projetoId: selectedProjectId,
          tipo: 'alteracao',
          titulo: `Alteração na API seguida: ${affectedApiNome}`,
          descricao: auditEntry.textoFormatado,
          tempo: 'Agora mesmo',
          lida: false,
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  // Add Comment Handler
  const handleAddComment = (apiId: string, texto: string) => {
    if (!currentUser) return;
    const nowFormatted = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    const newComment: ApiComment = {
      id: `comm-${Date.now()}`,
      apiId,
      autor: currentUser.name,
      cargo: currentUser.role,
      avatarInitials: currentUser.avatarInitials,
      dataHora: nowFormatted,
      texto,
      editado: false,
      salvoComoMacete: false,
    };
    setComments((prev) => [...prev, newComment]);

    // Push notification if following
    const targetPlano = currentProjeto?.plano.find((p) => p.apiId === apiId);
    const apiNome = targetPlano ? targetPlano.apiNome : apiId;
    if (followingApiIds.includes(apiId) || texto.includes('@')) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        apiId,
        apiNome,
        projetoId: selectedProjectId,
        tipo: 'mencao',
        titulo: `Novo comentário em ${apiNome}`,
        descricao: `${currentUser.name}: "${texto.slice(0, 80)}${texto.length > 80 ? '...' : ''}"`,
        tempo: 'Agora mesmo',
        lida: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Edit Comment Handler
  const handleEditComment = (commentId: string, newText: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, texto: newText, editado: true } : c))
    );
  };

  // Save as Macete Handler
  const handleSaveCommentAsMacete = (apiId: string, texto: string, autor: string, cargo: string) => {
    const newMacete: Macete = {
      id: `macete-${Date.now()}`,
      autor,
      cargo,
      data: new Date().toLocaleDateString('pt-BR'),
      conteudo: texto,
    };
    handleAddMacete(apiId, newMacete);
    setComments((prev) =>
      prev.map((c) =>
        c.apiId === apiId && c.texto === texto ? { ...c, salvoComoMacete: true } : c
      )
    );
  };

  // Toggle follow API
  const handleToggleFollowApi = (apiId: string) => {
    setFollowingApiIds((prev) =>
      prev.includes(apiId) ? prev.filter((id) => id !== apiId) : [...prev, apiId]
    );
  };

  // Open Project and API Drawer from Header Notification
  const handleOpenProjectApiDrawer = (projId: string, apiId: string) => {
    setSelectedProjectId(projId);
    setCurrentTab('projetos');
    setSelectedApiId(null);
    setActiveDrawerApiId(apiId);
    setNotifications((prev) =>
      prev.map((n) => (n.apiId === apiId ? { ...n, lida: true } : n))
    );
  };

  // Handler to add a new API to a project's integration plan
  const handleAddApiToProject = (projetoId: string, novoItem: PlanoItem) => {
    setProjetos((prevProjetos) =>
      prevProjetos.map((proj) => {
        if (proj.id === projetoId) {
          return {
            ...proj,
            plano: [...proj.plano, novoItem],
          };
        }
        return proj;
      })
    );
    // Switch to project view so user sees it right away
    setCurrentTab('projetos');
    setSelectedProjectId(projetoId);
    setSelectedApiId(null);
  };

  // Determine screen header title
  const currentScreenName = (() => {
    if (selectedApiId) {
      const selected = apis.find((a) => a.id === selectedApiId);
      return selected ? `API ${selected.nome}` : 'Detalhes da API';
    }
    if (currentTab === 'biblioteca') return 'Biblioteca de APIs';
    if (currentTab === 'favoritas') return 'APIs Favoritas';
    if (currentTab === 'projetos') return 'Pastas de projetos';
    if (currentTab === 'documentos') return 'Gerador de Documentos';
    return 'Biblioteca de APIs';
  })();

  // If user is not logged in, render the dedicated LoginView
  if (!currentUser) {
    return (
      <LoginView
        onLogin={handleLogin}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-page text-main flex transition-colors">
      {/* Skip to Content Link (Acessibilidade WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-fg focus:rounded-xl focus:shadow-lg focus:outline-none font-semibold text-sm"
      >
        Pular para o conteúdo
      </a>

      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        apisCount={apis.length}
        favoritasCount={favoriteIds.length}
        projetosCount={projetos.length}
        riscoCount={riscoCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentTab !== 'biblioteca' && currentTab !== 'favoritas') {
              setCurrentTab('biblioteca');
              setSelectedApiId(null);
            }
          }}
          currentScreenName={currentScreenName}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
          riscoCount={riscoCount}
          onNavigateToProjects={() => {
            setCurrentTab('projetos');
            setSelectedApiId(null);
          }}
          notifications={notifications}
          onOpenProjectApiDrawer={handleOpenProjectApiDrawer}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          pendingSuggestionsCount={pendingSuggestionsCount}
          onOpenSuggestionsBank={() => setIsSuggestionsBankOpen(true)}
          adminView={adminView}
          onToggleAdminView={() => setAdminView((ativo) => !ativo)}
          referenceDate={referenceDate}
          onReferenceDateChange={handleReferenceDateChange}
        />

        {/* Dynamic Screen Content */}
        <main
          id="main-content"
          tabIndex={-1}
          className={
            currentTab === 'projetos' && !selectedApiId
              ? 'flex-1 w-full min-w-0 flex flex-col p-0 outline-none'
              : 'flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none'
          }
        >
          {/* TELA 2: PÁGINA DA API (quando uma API é selecionada) */}
          {selectedApiId ? (
            (() => {
              const api = apis.find((a) => a.id === selectedApiId);
              if (!api) {
                return (
                  <div className="text-center py-12">
                    <p className="text-sm text-[#695E63] dark:text-[#A3969C]">API não encontrada.</p>
                    <button
                      onClick={handleBackToLibrary}
                      className="mt-3 text-xs font-semibold text-[#8B1D47] dark:text-[#E55488] underline"
                    >
                      Voltar para a Biblioteca
                    </button>
                  </div>
                );
              }
              return (
                <ApiDetailView
                  api={api}
                  allApis={apis}
                  isFavorite={favoriteIds.includes(api.id)}
                  onToggleFavorite={() => handleToggleFavorite(api.id)}
                  onBack={handleBackToLibrary}
                  onOpenAddToProjectModal={() => {
                    setCurrentTab('projetos');
                    setSelectedApiId(null);
                  }}
                  onSelectApiById={handleSelectApi}
                  onAddMacete={handleAddMacete}
                  adminView={adminView}
                />
              );
            })()
          ) : (
            <>
              {/* TELA 1: BIBLIOTECA DE APIS */}
              {currentTab === 'biblioteca' && (
                <ApiLibraryView
                  apis={apis}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectApi={handleSelectApi}
                  onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
                  onOpenAddToProjectModal={() => setCurrentTab('projetos')}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isFavoritesOnlyView={false}
                  currentUser={currentUser}
                  onOpenSuggestionsBank={adminView ? () => setIsSuggestionsBankOpen(true) : undefined}
                  pendingSuggestionsCount={adminView ? pendingSuggestionsCount : 0}
                  adminView={adminView}
                />
              )}

              {/* TELA: APIS FAVORITAS */}
              {currentTab === 'favoritas' && (
                <ApiLibraryView
                  apis={apis}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectApi={handleSelectApi}
                  onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
                  onOpenAddToProjectModal={() => setCurrentTab('projetos')}
                  searchQuery=""
                  onSearchChange={setSearchQuery}
                  isFavoritesOnlyView={true}
                  onNavigateToLibrary={() => setCurrentTab('biblioteca')}
                  currentUser={currentUser}
                  onOpenSuggestionsBank={adminView ? () => setIsSuggestionsBankOpen(true) : undefined}
                  pendingSuggestionsCount={adminView ? pendingSuggestionsCount : 0}
                  adminView={adminView}
                />
              )}

              {/* TELA 3: PROJETOS > PLANO DE INTEGRAÇÕES */}
              {currentTab === 'projetos' && (
                <ProjectsWorkspaceView apis={apis} onSelectApi={handleSelectApi} />
              )}

              {/* TELA 4: GERADOR DE DOCUMENTOS */}
              {currentTab === 'documentos' && (
                <DocumentGeneratorView
                  projeto={currentProjeto}
                  allApis={apis}
                  allProjetos={projetos}
                  onSelectProjeto={(projId) => setSelectedProjectId(projId)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Suggest API Modal */}
      <SuggestApiModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSubmitSuggestion={handleSubmitSuggestion}
        currentUser={currentUser}
      />

      {/* Admin Suggestions Bank Modal */}
      <SuggestionsBankModal
        isOpen={isSuggestionsBankOpen}
        onClose={() => setIsSuggestionsBankOpen(false)}
        suggestions={suggestions}
        currentUser={currentUser}
        onApproveSuggestion={handleApproveSuggestion}
        onRejectSuggestion={handleRejectSuggestion}
        onSelectApiById={handleSelectApi}
      />

      {/* Add To Project Modal */}
      <AddToProjectModal
        isOpen={isAddToProjectModalOpen}
        onClose={() => {
          setIsAddToProjectModalOpen(false);
          setApiForProjectModal(null);
        }}
        preselectedApi={apiForProjectModal}
        allApis={apis}
        projetos={projetos}
        referenceDate={referenceDate}
        onAddApiToProject={handleAddApiToProject}
      />
    </div>
  );
}
