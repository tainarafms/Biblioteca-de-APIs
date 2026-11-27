import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { ApiSuggestion, DifficultyLevel, UserProfile } from '../../types';
import { Modal } from '../common/Modal';

interface SuggestApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuggestion: (suggestion: Omit<ApiSuggestion, 'id' | 'dataCriacao' | 'status'>) => void;
  currentUser: UserProfile;
}

export const SuggestApiModal: React.FC<SuggestApiModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuggestion,
  currentUser,
}) => {
  // Step 1: Identificação
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [orgao, setOrgao] = useState('');
  const [orgaoNomeCompleto, setOrgaoNomeCompleto] = useState('');
  const [categoria, setCategoria] = useState('Cadastro de pessoas');
  const [conectaGov, setConectaGov] = useState(true);

  // Step 2: Finalidade & Negócio
  const [descricao, setDescricao] = useState('');
  const [justificativaNegocio, setJustificativaNegocio] = useState('');

  // Step 3: Técnico & Dados
  const [padraoAutenticacao, setPadraoAutenticacao] = useState('OAuth 2.0 / Conecta gov.br (Bearer JWT)');
  const [dadosEntrada, setDadosEntrada] = useState('');
  const [dadosRetorno, setDadosRetorno] = useState('');
  const [temSandbox, setTemSandbox] = useState(true);

  // Step 4: Trâmites & Prazos
  const [quemSolicita, setQuemSolicita] = useState<'Cliente' | 'YouX' | 'Cliente com apoio YouX' | 'YouX ou Cliente'>('YouX ou Cliente');
  const [prazoEstimadoDias, setPrazoEstimadoDias] = useState('10 a 20 dias úteis');
  const [dificuldade, setDificuldade] = useState<DifficultyLevel>('Média');
  const [linkDocs, setLinkDocs] = useState('');
  const [preRequisitos, setPreRequisitos] = useState('');

  // Feedback state
  const [success, setSuccess] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'geral' | 'tecnico' | 'tramites'>('geral');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !orgao.trim() || !descricao.trim()) return;

    onSubmitSuggestion({
      nome: nome.trim(),
      sigla: sigla.trim() || nome.trim().slice(0, 8).toUpperCase(),
      orgao: orgao.trim(),
      orgaoNomeCompleto: orgaoNomeCompleto.trim() || orgao.trim(),
      descricaoSimples: descricao.trim(),
      conectaGov,
      categorias: [categoria, 'Órgãos federais'],
      dificuldade,
      linkDocumentacao: linkDocs.trim() || 'https://conecta.gov.br',
      justificativaNegocio: justificativaNegocio.trim() || 'Mapeamento preventivo para futuras demandas de interoperabilidade.',
      padraoAutenticacao,
      dadosEntrada: dadosEntrada.trim() || 'Identificador cadastral (CPF/CNPJ ou matrícula)',
      dadosRetorno: dadosRetorno.trim() || 'Status e dados de certidão oficial',
      quemSolicita,
      prazoEstimadoDias,
      temSandbox,
      preRequisitos: preRequisitos.trim() || 'Adesão formal aos termos do órgão custodiante.',
      sugeridoPor: currentUser.name,
      sugeridoPorEmail: currentUser.email,
      sugeridoPorCargo: currentUser.role
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      // Reset form
      setNome('');
      setSigla('');
      setOrgao('');
      setOrgaoNomeCompleto('');
      setDescricao('');
      setJustificativaNegocio('');
      setDadosEntrada('');
      setDadosRetorno('');
      setLinkDocs('');
      setPreRequisitos('');
      setActiveTabSection('geral');
    }, 1600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-main">
                Sugerir nova API para curadoria
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-warning-bg text-warning-text border border-warning-border">
                Fila de avaliação
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              A API sugerida passará pela avaliação dos administradores antes da publicação oficial.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Informative Governance Banner */}
        <div className="p-3 bg-warning-bg border border-warning-border rounded-xl flex items-start gap-2.5 text-xs text-warning-text">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>Fluxo de governança YouX:</strong> Sugestões não entram direto no catálogo público. Após o envio, os administradores de catálogo validarão a documentação, padrões Conecta gov.br e viabilidade técnica.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="border-b border-border-default flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSection('geral')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTabSection === 'geral'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            1. Dados gerais & negócio
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSection('tecnico')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTabSection === 'tecnico'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            2. Aspectos técnicos & dados
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSection('tramites')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTabSection === 'tramites'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            3. Acesso, prazos & documentação
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-success-bg text-success-text border border-success-border flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-main">
                Sugestão registrada com sucesso!
              </h3>
              <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                A API foi encaminhada para o <strong>Banco de sugestões</strong> da equipe de curadoria. Os administradores receberam a notificação e farão a revisão técnica.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: GERAL & NEGÓCIO */}
              {activeTabSection === 'geral' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="input-sug-nome" className="block font-semibold text-text-main mb-1.5">
                        Nome da API *
                      </label>
                      <input
                        id="input-sug-nome"
                        type="text"
                        required
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: CND Trabalhista"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="input-sug-sigla" className="block font-semibold text-text-main mb-1.5">
                        Sigla ou acrônimo
                      </label>
                      <input
                        id="input-sug-sigla"
                        type="text"
                        value={sigla}
                        onChange={(e) => setSigla(e.target.value)}
                        placeholder="Ex: CNDT"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="input-sug-orgao" className="block font-semibold text-text-main mb-1.5">
                        Órgão responsável *
                      </label>
                      <input
                        id="input-sug-orgao"
                        type="text"
                        required
                        value={orgao}
                        onChange={(e) => setOrgao(e.target.value)}
                        placeholder="Ex: TST / CSJT ou INCRA"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="input-sug-orgao-completo" className="block font-semibold text-text-main mb-1.5">
                        Nome completo do órgão
                      </label>
                      <input
                        id="input-sug-orgao-completo"
                        type="text"
                        value={orgaoNomeCompleto}
                        onChange={(e) => setOrgaoNomeCompleto(e.target.value)}
                        placeholder="Ex: Tribunal Superior do Trabalho"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="select-sug-categoria" className="block font-semibold text-text-main mb-1.5">
                        Categoria principal
                      </label>
                      <select
                        id="select-sug-categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none cursor-pointer"
                      >
                        <option value="Cadastro de pessoas">Cadastro de pessoas</option>
                        <option value="Geolocalização">Geolocalização / GIS</option>
                        <option value="Órgãos federais">Órgãos federais</option>
                        <option value="Órgãos estaduais">Órgãos estaduais</option>
                        <option value="Autenticação">Autenticação & Gov.br</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer">
                        <input
                          type="checkbox"
                          checked={conectaGov}
                          onChange={(e) => setConectaGov(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                        />
                        <span>Disponibilizada através do catálogo Conecta gov.br</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="textarea-sug-descricao" className="block font-semibold text-text-main mb-1.5">
                      Descrição em linguagem simples *
                    </label>
                    <textarea
                      id="textarea-sug-descricao"
                      rows={2}
                      required
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Explique com clareza o que ela resolve para o cidadão, servidor público ou operador do sistema..."
                      className="w-full px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label htmlFor="textarea-sug-justificativa" className="block font-semibold text-text-main mb-1.5">
                      Justificativa de negócio ou projeto de aplicação *
                    </label>
                    <textarea
                      id="textarea-sug-justificativa"
                      rows={2}
                      required
                      value={justificativaNegocio}
                      onChange={(e) => setJustificativaNegocio(e.target.value)}
                      placeholder="Ex: Necessária para o projeto PSA Florestal para homologar a regularidade fiscal..."
                      className="w-full px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TÉCNICO & DADOS */}
              {activeTabSection === 'tecnico' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="select-sug-auth" className="block font-semibold text-text-main mb-1.5">
                      Padrão de autenticação
                    </label>
                    <select
                      id="select-sug-auth"
                      value={padraoAutenticacao}
                      onChange={(e) => setPadraoAutenticacao(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none cursor-pointer"
                    >
                      <option value="OAuth 2.0 / Conecta gov.br (Bearer JWT)">OAuth 2.0 / Conecta gov.br (Bearer JWT)</option>
                      <option value="Certificado Digital ICP-Brasil A1/A3 (mTLS)">Certificado Digital ICP-Brasil A1/A3 (mTLS)</option>
                      <option value="API Key / Token no Header">API Key / Token no Header</option>
                      <option value="Login gov.br OpenID Connect (Nível Prata/Ouro)">Login gov.br OpenID Connect (Nível Prata/Ouro)</option>
                      <option value="Convênio Estadual Dedicado / VPN">Convênio Estadual Dedicado / VPN</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="input-sug-entrada" className="block font-semibold text-text-main mb-1.5">
                      Dados de entrada esperados
                    </label>
                    <input
                      id="input-sug-entrada"
                      type="text"
                      value={dadosEntrada}
                      onChange={(e) => setDadosEntrada(e.target.value)}
                      placeholder="Ex: CPF ou CNPJ (11 ou 14 dígitos), código do imóvel ou número de processo"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="textarea-sug-retorno" className="block font-semibold text-text-main mb-1.5">
                      Dados retornados pela API
                    </label>
                    <textarea
                      id="textarea-sug-retorno"
                      rows={2}
                      value={dadosRetorno}
                      onChange={(e) => setDadosRetorno(e.target.value)}
                      placeholder="Ex: Situação cadastral, código de autenticidade, data de emissão, certidão negativa em PDF base64..."
                      className="w-full px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={temSandbox}
                        onChange={(e) => setTemSandbox(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                      <span>Possui ambiente de Sandbox ou homologação aberto para testes</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: TRÂMITES, PRAZOS & DOCS */}
              {activeTabSection === 'tramites' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="select-sug-quem" className="block font-semibold text-text-main mb-1.5">
                        Quem solicita o acesso
                      </label>
                      <select
                        id="select-sug-quem"
                        value={quemSolicita}
                        onChange={(e) => setQuemSolicita(e.target.value as any)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none cursor-pointer"
                      >
                        <option value="YouX ou Cliente">YouX ou Cliente</option>
                        <option value="Cliente com apoio YouX">Cliente com apoio YouX</option>
                        <option value="Cliente">Cliente</option>
                        <option value="YouX">YouX</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="input-sug-prazo" className="block font-semibold text-text-main mb-1.5">
                        Prazo estimado de liberação
                      </label>
                      <input
                        id="input-sug-prazo"
                        type="text"
                        value={prazoEstimadoDias}
                        onChange={(e) => setPrazoEstimadoDias(e.target.value)}
                        placeholder="Ex: 5 a 10 dias úteis ou 30 a 45 dias"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="select-sug-dificuldade" className="block font-semibold text-text-main mb-1.5">
                        Dificuldade estimada
                      </label>
                      <select
                        id="select-sug-dificuldade"
                        value={dificuldade}
                        onChange={(e) => setDificuldade(e.target.value as DifficultyLevel)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none cursor-pointer"
                      >
                        <option value="Fácil">Fácil (Adesão rápida no Conecta gov)</option>
                        <option value="Média">Média (Formulário ou ofício simples)</option>
                        <option value="Burocrática">Burocrática (Portaria, convênio ou auditoria prévia)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="input-sug-link" className="block font-semibold text-text-main mb-1.5">
                        Link da documentação ou Swagger
                      </label>
                      <input
                        id="input-sug-link"
                        type="url"
                        value={linkDocs}
                        onChange={(e) => setLinkDocs(e.target.value)}
                        placeholder="https://servicos.orgao.gov.br/api/docs"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-sug-prereq" className="block font-semibold text-text-main mb-1.5">
                      Pré-requisitos técnicos ou avisos especiais (opcional)
                    </label>
                    <input
                      id="input-sug-prereq"
                      type="text"
                      value={preRequisitos}
                      onChange={(e) => setPreRequisitos(e.target.value)}
                      placeholder="Ex: Exige certificado digital e-CNPJ na máquina do cliente ou credenciamento prévio"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-bg-page border border-border-default rounded-xl text-sm text-main focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-text-muted">
                  Solicitante: <strong className="text-text-main">{currentUser.name}</strong> ({currentUser.role})
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:bg-surface-hover cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>

                  {activeTabSection !== 'tramites' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTabSection === 'geral') setActiveTabSection('tecnico');
                        else if (activeTabSection === 'tecnico') setActiveTabSection('tramites');
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-hover border border-border-default text-text-main text-xs font-bold hover:bg-border-subtle cursor-pointer transition-colors"
                    >
                      Avançar
                    </button>
                  )}

                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-fg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Enviar para curadoria</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </Modal>
  );
};
