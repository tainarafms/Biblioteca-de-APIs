import { UserProfile } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'demo-user',
    name: 'Usuário',
    email: 'usuario@demo.local',
    role: 'Usuário',
    cargoDetalhado: 'Perfil de acesso padrão',
    avatarInitials: 'US',
    department: 'Acesso à Biblioteca de APIs',
    isAdmin: false,
  },
  {
    id: 'demo-admin',
    name: 'Administrador',
    email: 'administrador@demo.local',
    role: 'Administrador',
    cargoDetalhado: 'Perfil administrativo',
    avatarInitials: 'AD',
    department: 'Curadoria da Biblioteca de APIs',
    isAdmin: true,
  },
];

export const DEFAULT_USER = MOCK_USERS[0];
export const ADMIN_USER = MOCK_USERS[1];
