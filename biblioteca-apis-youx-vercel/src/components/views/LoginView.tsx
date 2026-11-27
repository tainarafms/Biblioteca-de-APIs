import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../../types';
import { MOCK_USERS } from '../../data/mockUsers';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// Geometric 6-ray rounded asterisk matching the reference design
const StylizedAsterisk: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <img src="/youx-icon.png" alt="" aria-hidden="true" className={`${className} rounded-lg`} />
);

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('tainara.souza@youxgroup.com.br');
  const [password, setPassword] = useState('govtech2026');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Squad GovTech');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState<string>('user-tainara');

  // Forgot password flow
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'forgot') {
      if (!forgotEmail.trim()) {
        setErrorMessage('Por favor, informe seu e-mail corporativo.');
        return;
      }
      setForgotSent(true);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user from mock list or dynamically authenticate
      const foundUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (foundUser) {
        setIsLoading(false);
        onLogin(foundUser);
      } else {
        const namePart = (mode === 'signup' && name.trim()) 
          ? name.trim() 
          : email.split('@')[0].replace('.', ' ');
        const initials = namePart
          .split(' ')
          .map((n) => n[0]?.toUpperCase())
          .slice(0, 2)
          .join('') || 'YX';

        const customUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: email.trim(),
          role: mode === 'signup' ? 'Desenvolvedor' : 'Product Owner',
          cargoDetalhado: 'Especialista em Integrações e Setor Público',
          avatarInitials: initials,
          department: department || 'Tecnologia do Setor Público'
        };

        setIsLoading(false);
        onLogin(customUser);
      }
    }, 450);
  };

  const handleQuickLogin = (user: UserProfile) => {
    setActiveDemoId(user.id);
    setEmail(user.email);
    setPassword('govtech2026');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(user);
    }, 350);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#181115] text-[#1F1A1C] dark:text-[#F7EFF2] transition-colors relative selection:bg-[#8B1D47]/20 selection:text-[#8B1D47] overflow-x-hidden">
      
      {/* Left Visual Panel with YouX Ethereal Mesh Gradient & High-Contrast Scrim */}
      <div className="w-full md:w-1/2 lg:w-[48%] xl:w-[50%] min-h-[440px] md:min-h-screen flex flex-col justify-between p-8 sm:p-12 md:p-14 lg:p-16 xl:p-20 relative overflow-hidden bg-[#4A0822] text-white select-none">
        {/* Ambient Fluid Mesh Orbs */}
        <div 
          className="absolute -top-16 -right-16 w-96 h-96 lg:w-[460px] lg:h-[460px] rounded-full pointer-events-none opacity-75 blur-3xl"
          style={{ background: 'radial-gradient(circle, #E53974 0%, rgba(229,57,116,0) 70%)' }}
        />
        <div 
          className="absolute top-1/3 -left-20 w-96 h-96 lg:w-[440px] lg:h-[440px] rounded-full pointer-events-none opacity-45 blur-3xl"
          style={{ background: 'radial-gradient(circle, #831843 0%, rgba(131,24,67,0) 70%)' }}
        />
        <div 
          className="absolute -bottom-16 right-10 w-96 h-96 lg:w-[420px] lg:h-[420px] rounded-full pointer-events-none opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #BE185D 0%, rgba(190,24,93,0) 70%)' }}
        />

        {/* Dark contrast scrim ensuring text contrast >= 7:1 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Top Brand Asterisk */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-white drop-shadow-md">
              <StylizedAsterisk className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                YouX
              </span>
              <span className="text-sm text-rose-200 font-semibold tracking-wide mt-0.5">
                GovTech Hub
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copy Block - Clean short title + single supporting line (No "Você pode facilmente") */}
        <div className="relative z-10 space-y-3 mt-auto pt-16 md:pt-24 max-w-[500px]">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.25]">
            Acesse seu hub central de APIs governamentais.
          </h2>
          
          <p className="text-base sm:text-lg text-white/95 font-medium leading-relaxed">
            Prazos reais, semáforos de risco e minutas formais no padrão Conecta gov.br.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-1/2 lg:w-[52%] xl:w-[50%] min-h-screen flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 bg-surface overflow-y-auto">
        
        {/* Top bar inside right column */}
        <div className="w-full flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:invisible">
            <div className="text-primary">
              <StylizedAsterisk className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-main">YouX GovTech</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              aria-label={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" /> : <Moon className="w-5 h-5 text-primary" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Centered Form Area */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-4">
          
          {/* Top Brand Asterisk & Headers */}
          <div className="mb-8 space-y-3">
            <div className="text-primary mb-1">
              <StylizedAsterisk className="w-8 h-8" />
            </div>

            {mode === 'login' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
                  Entrar na sua conta
                </h1>
                <p className="text-sm sm:text-base text-secondary mt-1.5 leading-relaxed">
                  Acesse seu catálogo de APIs, gerencie riscos e gere documentações em um só lugar.
                </p>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
                  Criar nova conta
                </h1>
                <p className="text-sm sm:text-base text-secondary mt-1.5 leading-relaxed">
                  Cadastre-se na rede interna de interoperabilidade YouX GovTech.
                </p>
              </div>
            )}

            {mode === 'forgot' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
                  Recuperar senha
                </h1>
                <p className="text-sm sm:text-base text-secondary mt-1.5 leading-relaxed">
                  Enviaremos um link de autenticação seguro para o seu e-mail corporativo.
                </p>
              </div>
            )}
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div 
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-danger-bg border border-danger-border text-danger-text text-sm flex items-center gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-danger-text" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          {mode === 'forgot' && forgotSent ? (
            <div className="p-6 rounded-2xl bg-success-bg border border-success-border text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-success-text mx-auto" aria-hidden="true" />
              <h2 className="text-base font-bold text-success-text">
                Link de acesso enviado!
              </h2>
              <p className="text-sm text-success-text leading-relaxed">
                Verifique sua caixa de entrada em <strong>{forgotEmail}</strong> e siga as instruções.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotSent(false);
                }}
                className="mt-2 min-h-[44px] px-4 py-2 text-sm font-bold text-primary hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring rounded-lg"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label htmlFor="input-nome-completo" className="block text-sm font-semibold text-main mb-1.5">
                      Nome completo
                    </label>
                    <input
                      id="input-nome-completo"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex.: Lucas Mendes"
                      className="w-full min-h-[48px] px-4 py-3 bg-surface border border-border-default rounded-xl text-base text-main placeholder-muted focus-visible:outline-2 focus-visible:outline-focus-ring transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-area" className="block text-sm font-semibold text-main mb-1.5">
                      Área / Equipe
                    </label>
                    <input
                      id="input-area"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Ex.: Squad GovTech"
                      className="w-full min-h-[48px] px-4 py-3 bg-surface border border-border-default rounded-xl text-base text-main placeholder-muted focus-visible:outline-2 focus-visible:outline-focus-ring transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="input-email" className="block text-sm font-semibold text-main mb-1.5">
                  E-mail corporativo
                </label>
                <input
                  id="input-email"
                  type="email"
                  required
                  value={mode === 'forgot' ? forgotEmail : email}
                  onChange={(e) => mode === 'forgot' ? setForgotEmail(e.target.value) : setEmail(e.target.value)}
                  placeholder="nome.sobrenome@youxgroup.com.br"
                  className="w-full min-h-[48px] px-4 py-3 bg-surface border border-border-default rounded-xl text-base text-main placeholder-muted focus-visible:outline-2 focus-visible:outline-focus-ring transition-all"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="input-senha" className="block text-sm font-semibold text-main">
                      Senha
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage('');
                        }}
                        className="text-sm font-semibold text-primary hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring rounded"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="input-senha"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full min-h-[48px] pl-4 pr-12 py-3 bg-surface border border-border-default rounded-xl text-base text-main placeholder-muted focus-visible:outline-2 focus-visible:outline-focus-ring transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-main focus-visible:outline-2 focus-visible:outline-focus-ring rounded-lg cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border-default cursor-pointer"
                  />
                  <label 
                    htmlFor="remember-me-checkbox"
                    className="text-sm font-medium text-secondary cursor-pointer select-none"
                  >
                    Lembrar meu acesso neste navegador
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[50px] mt-2 py-3 px-6 bg-primary hover:bg-primary-hover text-primary-fg text-base font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring active:scale-98 disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' ? 'Acessar plataforma' : mode === 'signup' ? 'Concluir cadastro' : 'Enviar link de recuperação'}
                    </span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 1-Click Demo Profiles Row: labeled "Entrar como (demonstração)" */}
          {mode !== 'forgot' && (
            <div className="pt-6 mt-6 border-t border-border-subtle">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-main">
                  Entrar como (demonstração)
                </span>
                <span className="text-xs text-primary font-bold">1-clique</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {MOCK_USERS.map((user) => {
                  const isSelected = activeDemoId === user.id && email === user.email;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className={`min-h-[52px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center gap-1 focus-visible:outline-2 focus-visible:outline-focus-ring ${
                        isSelected
                          ? 'border-primary bg-primary-light ring-1 ring-primary/40'
                          : 'border-border-default bg-bg-page hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-md bg-primary text-primary-fg flex items-center justify-center text-xs font-bold shrink-0">
                          {user.avatarInitials}
                        </span>
                        <span className="text-sm font-bold text-main truncate">
                          {user.name.split(' ')[0]}
                        </span>
                      </div>
                      <span className="text-xs text-primary font-bold truncate">
                        {user.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Toggle: Switch between Login & Signup / Back to Login */}
          <div className="mt-6 pt-2 text-center text-sm text-secondary">
            {mode === 'login' && (
              <span>
                Não tem uma conta corporativa?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  className="font-bold text-primary hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring rounded"
                >
                  Solicitar acesso
                </button>
              </span>
            )}

            {mode === 'signup' && (
              <span>
                Já possui uma conta ativa?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                  className="font-bold text-primary hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring rounded"
                >
                  Entrar agora
                </button>
              </span>
            )}

            {mode === 'forgot' && !forgotSent && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="font-bold text-primary hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring rounded"
              >
                Voltar para o login
              </button>
            )}
          </div>

        </div>

        {/* Clean Bottom Subtle Footer */}
        <div className="w-full pt-6 text-center text-xs text-muted border-t border-border-default">
          Plataforma interna YouX GovTech • Conexão com Conecta gov.br, SIGEF, SICAR e Autarquias Federais
        </div>

      </div>
    </div>
  );
};
