export type DifficultyLevel = 'Fácil' | 'Média' | 'Burocrática';

export type IntegrationStatus = 'Não solicitada' | 'Em solicitação' | 'Homologação' | 'Produção';

export type RiskLevel = 'verde' | 'amarelo' | 'vermelho';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Usuário' | 'Administrador';
  cargoDetalhado: string;
  avatarInitials: string;
  department: string;
  isAdmin?: boolean;
}

export interface Macete {
  id: string;
  autor: string;
  cargo: string;
  data: string;
  conteudo: string;
}

export interface HistoricoItem {
  id: string;
  data: string;
  responsavel: string;
  descricao: string;
}

export interface ApiItem {
  id: string;
  nome: string;
  sigla: string;
  orgao: string;
  orgaoNomeCompleto: string;
  descricaoSimples: string;
  conectaGov: boolean;
  categorias: string[];
  dificuldade: DifficultyLevel;
  dificuldadeMotivo: string;
  verificadoEm: string;
  verificadoPor: string;
  
  // Aba: Visão Geral
  visaoGeral: {
    oQueFaz: string;
    dadosEntrada: string[];
    dadosRetornados: { campo: string; descricao: string }[];
    exemplosFormulario: string[];
    linkDocumentacao: string;
    linkSwagger?: string;
    padraoAutenticacao: string;
  };

  // Aba: Como conseguir acesso
  comoConseguirAcesso: {
    quemSolicita: 'Cliente' | 'YouX' | 'Cliente com apoio YouX' | 'YouX ou Cliente';
    quemSolicitaDetalhes: string;
    anexosAssinaturas: string[];
    prazoEstimadoFaixa: string;
    prazoMinDias: number;
    prazoMaxDias: number;
    ambientes: {
      homologacao: string;
      producao: string;
    };
    passos: {
      numero: number;
      titulo: string;
      descricao: string;
      dica?: string;
    }[];
  };

  // Aba: Antes de usar
  antesDeUsar: {
    avisoDestaque?: string;
    preRequisitos: string[];
    apisVinculadasIds: string[];
    contasRequeridas: string;
  };

  // Aba: Macetes
  macetes: Macete[];

  // Aba: Histórico
  historico: HistoricoItem[];
}

export interface Sprint {
  id: number;
  nome: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  meta: string;
}

export interface PlanoItem {
  id: string;
  apiId: string;
  apiNome: string;
  apiOrgao: string;
  funcionalidadeCampo: string;
  sprintId: number;
  prazoEstimadoFaixa: string;
  prazoMaxDias: number;
  dataLimiteSolicitacao: string; // YYYY-MM-DD
  status: IntegrationStatus;
  responsavel: string;
  responsavelCargo?: string;
  risco: RiskLevel;
  riscoMotivo: string;
  dependeDeApiId?: string;
  dataSolicitacaoReal?: string;
}

export interface ApiComment {
  id: string;
  apiId: string;
  autor: string;
  cargo: string;
  avatarInitials: string;
  dataHora: string; // ISO ou DD/MM/YYYY HH:mm
  texto: string;
  editado?: boolean;
  salvoComoMacete?: boolean;
}

export interface ApiAuditRecord {
  id: string;
  apiId: string;
  autor: string;
  dataHora: string;
  campo: string;
  de: string;
  para: string;
  textoFormatado: string;
}

export interface Projeto {
  id: string;
  nome: string;
  sigla: string;
  cliente: string;
  descricao: string;
  responsavel: string;
  sprints: Sprint[];
  plano: PlanoItem[];
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'json' | 'doc' | 'image';
  url?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  type: 'message' | 'system_log';
  autor: string;
  autorRole?: string;
  autorAvatar?: string;
  dataHora: string;
  texto: string;
  apiId?: string;
  apiNome?: string;
  reactions?: ChatReaction[];
  isPinned?: boolean;
  attachments?: ChatAttachment[];
  threadRepliesCount?: number;
  systemAction?: {
    campo?: string;
    de?: string;
    para?: string;
    tipo?: 'status' | 'risco' | 'sprint' | 'responsavel' | 'macete' | 'alerta';
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  descricao: string;
  isProject?: boolean;
  projectId?: string;
  unreadCount?: number;
  isPrivate?: boolean;
  topic?: string;
}

export type SuggestionStatus = 'pendente' | 'aprovada' | 'rejeitada';

export interface ApiSuggestion {
  id: string;
  nome: string;
  sigla: string;
  orgao: string;
  orgaoNomeCompleto?: string;
  descricaoSimples: string;
  conectaGov: boolean;
  categorias: string[];
  dificuldade: DifficultyLevel;
  linkDocumentacao: string;
  linkSwagger?: string;
  
  // Detalhes aprofundados
  justificativaNegocio: string;
  padraoAutenticacao: string;
  dadosEntrada: string;
  dadosRetorno: string;
  quemSolicita: 'Cliente' | 'YouX' | 'Cliente com apoio YouX' | 'YouX ou Cliente';
  prazoEstimadoDias: string;
  temSandbox: boolean;
  preRequisitos?: string;
  
  // Auditoria e Governança
  status: SuggestionStatus;
  sugeridoPor: string;
  sugeridoPorEmail: string;
  sugeridoPorCargo: string;
  dataCriacao: string;
  
  // Resposta da administração
  avaliadoPor?: string;
  dataAvaliacao?: string;
  motivoRejeicao?: string;
  apiCadastradaId?: string;
}

