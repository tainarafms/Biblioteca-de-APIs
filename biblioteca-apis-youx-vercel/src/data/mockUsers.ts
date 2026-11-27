import { UserProfile } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-tainara',
    name: 'Tainara Souza',
    email: 'tainara.souza@youxgroup.com.br',
    role: 'Product Owner',
    cargoDetalhado: 'Líder de Produtos GovTech',
    avatarInitials: 'TS',
    department: 'Squad Ambiental & Regularização Fundiária',
    isAdmin: true
  },
  {
    id: 'user-lucas',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@youxgroup.com.br',
    role: 'Tech Lead',
    cargoDetalhado: 'Arquiteto de Integrações & Backend',
    avatarInitials: 'LM',
    department: 'Engenharia de Interoperabilidade',
    isAdmin: true
  },
  {
    id: 'user-mariana',
    name: 'Mariana Dias',
    email: 'mariana.dias@youxgroup.com.br',
    role: 'Desenvolvedor',
    cargoDetalhado: 'Desenvolvedora Full-Stack GovTech',
    avatarInitials: 'MD',
    department: 'Squad Conecta gov & Plataformas',
    isAdmin: false
  }
];

export const DEFAULT_USER = MOCK_USERS[0];
