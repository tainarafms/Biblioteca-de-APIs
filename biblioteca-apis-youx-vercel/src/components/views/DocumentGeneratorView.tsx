import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  AlertCircle, 
  Code2, 
  CheckSquare, 
  Square, 
  Eye, 
  Edit3,
  Layers,
  Building2,
  User,
  Sparkles,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { Projeto, ApiItem } from '../../types';
import { TEMPLATES_DOCUMENTO } from '../../data/mockData';

interface DocumentGeneratorViewProps {
  projeto: Projeto;
  allApis: ApiItem[];
  allProjetos?: Projeto[];
  onSelectProjeto?: (id: string) => void;
}

export const DocumentGeneratorView: React.FC<DocumentGeneratorViewProps> = ({
  projeto,
  allApis,
  allProjetos,
  onSelectProjeto,
}) => {
  // Output format toggle: 'oficio' vs 'dev'
  const [docType, setDocType] = useState<'oficio' | 'dev'>('oficio');

  // Active step / tab on left configuration panel
  const [activeConfigTab, setActiveConfigTab] = useState<'escopo' | 'partes' | 'texto'>('escopo');

  // Project selector dropdown menu state
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Selected APIs IDs from the project's plan
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>(() => {
    // Default to SICAR and SIGEF if available, else first 2
    const available = projeto.plano.map((p) => p.apiId);
    const defaults = ['sicar', 'sigef'].filter((id) => available.includes(id));
    return defaults.length > 0 ? defaults : available.slice(0, 2);
  });

  // Filter query for APIs inside the selection tab
  const [apiSearchQuery, setApiSearchQuery] = useState('');

  // Editable fields before exporting
  const [orgaoDestinatario, setOrgaoDestinatario] = useState('Secretaria de Governo Digital — MGI / Presidência do INCRA');
  const [gestorNome, setGestorNome] = useState('');
  const [gestorCargo, setGestorCargo] = useState('');
  const [orgaoClienteNome, setOrgaoClienteNome] = useState(projeto.cliente);
  const [projetoNome, setProjetoNome] = useState(projeto.nome);
  const [justificativa, setJustificativa] = useState(
    'Os dados e serviços solicitados são estritamente necessários para a execução da plataforma de Pagamento por Serviços Ambientais (PSA), permitindo a validação da conformidade do Cadastro Ambiental Rural (CAR), a sobreposição fundiária georreferenciada e a emissão de termos digitais com validade jurídica.'
  );
  const [observacoesTecnicas, setObservacoesTecnicas] = useState(
    'Para fins de conformidade técnica, solicitamos a liberação prévia em ambiente de homologação (Staging) com cota suficiente para 500 requisições diárias de teste e suporte a mTLS.'
  );

  // Sync project info when active project changes
  useEffect(() => {
    setOrgaoClienteNome(projeto.cliente);
    setProjetoNome(projeto.nome);
    // keep valid api selections
    const validIds = projeto.plano.map((p) => p.apiId);
    setSelectedApiIds((prev) => {
      const filtered = prev.filter((id) => validIds.includes(id));
      return filtered.length > 0 ? filtered : validIds.slice(0, 2);
    });
  }, [projeto]);

  // Preview Mode: 'formatted' (with highlighted variable brackets) vs 'raw-edit' (direct inline textarea)
  const [previewMode, setPreviewMode] = useState<'formatted' | 'raw-edit'>('formatted');
  const [customEditedText, setCustomEditedText] = useState<string | null>(null);

  // Copy feedback state
  const [copied, setCopied] = useState(false);

  // Resolve selected ApiItem objects
  const apisSelecionadas = useMemo(() => {
    return selectedApiIds
      .map((id) => allApis.find((a) => a.id === id))
      .filter((a): a is ApiItem => Boolean(a));
  }, [selectedApiIds, allApis]);

  // Generate document text dynamically
  const generatedBaseText = useMemo(() => {
    const dados = {
      orgaoDestinatario,
      gestorNome,
      gestorCargo,
      orgaoClienteNome,
      projetoNome,
      apisSelecionadas,
      justificativa,
      observacoesTecnicas,
    };

    if (docType === 'oficio') {
      return TEMPLATES_DOCUMENTO.oficioCliente.gerarTexto(dados);
    } else {
      return TEMPLATES_DOCUMENTO.fichaTecnicaDev.gerarTexto(dados);
    }
  }, [
    docType,
    orgaoDestinatario,
    gestorNome,
    gestorCargo,
    orgaoClienteNome,
    projetoNome,
    apisSelecionadas,
    justificativa,
    observacoesTecnicas,
  ]);

  // The active text displayed / exported
  const currentDocumentText = customEditedText !== null ? customEditedText : generatedBaseText;

  // Count bracketed placeholders (e.g. [NÚMERO DO OFÍCIO])
  const pendingBrackets = useMemo(() => {
    const matches = currentDocumentText.match(/\[[^\]\n]+\]/g);
    return matches || [];
  }, [currentDocumentText]);

  // Toggle selection
  const handleToggleApi = (apiId: string) => {
    setSelectedApiIds((prev) =>
      prev.includes(apiId) ? prev.filter((id) => id !== apiId) : [...prev, apiId]
    );
    setCustomEditedText(null); // reset custom edits to reflect new API list
  };

  const handleSelectAll = () => {
    setSelectedApiIds(projeto.plano.map((p) => p.apiId));
    setCustomEditedText(null);
  };

  const handleClearSelection = () => {
    setSelectedApiIds([]);
    setCustomEditedText(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDocumentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([currentDocumentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docType === 'oficio' ? 'Minuta_Oficio' : 'Ficha_Tecnica_Dev'}_${projeto.sigla}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Preset quick fill options for POs
  const destinatarioPresets = [
    { label: 'SGD / Conecta gov.br', value: 'Secretaria de Governo Digital — MGI / Coordenação-Geral de Serviços e Dados' },
    { label: 'INCRA / Fundiário', value: 'Instituto Nacional de Colonização e Reforma Agrária — INCRA' },
    { label: 'Receita Federal / Serpro', value: 'Secretaria Especial da Receita Federal do Brasil / SERPRO' },
    { label: 'SFB / Meio Ambiente', value: 'Serviço Florestal Brasileiro — SFB / Ministério do Meio Ambiente e Mudança do Clima' },
  ];

  const justificativaPresets = [
    {
      label: 'Ambiental & CAR (PSA)',
      text: 'Os dados e serviços solicitados são estritamente necessários para a execução da plataforma de Pagamento por Serviços Ambientais (PSA), permitindo a validação da conformidade do Cadastro Ambiental Rural (CAR), a sobreposição fundiária georreferenciada e a emissão de termos digitais com validade jurídica.'
    },
    {
      label: 'Governo Digital & Desburocratização',
      text: 'A presente integração fundamenta-se nos preceitos da Lei Federal nº 14.129/2021 (Governo Digital) e no princípio do não-retrabalho documental do cidadão, simplificando a prestação de serviços públicos de interesse coletivo com plena rastreabilidade e segurança.'
    },
    {
      label: 'Conformidade Cadastral & LGPD',
      text: 'O acesso destina-se estritamente à confirmação de autenticidade documental e integridade cadastral de titulares, operando em estrita observância aos princípios de finalidade, necessidade e segurança da Lei nº 13.709/2018 (LGPD).'
    }
  ];

  const observacoesPresets = [
    {
      label: 'Cota Homologação 500 req/dia',
      text: 'Solicitamos liberação prévia em ambiente de homologação (Staging) com cota de pelo menos 500 requisições diárias de teste para validação dos casos de borda.'
    },
    {
      label: 'Certificado mTLS ICP-Brasil',
      text: 'Informamos que a conexão em produção operará com autenticação mTLS baseada em certificado institucional emitido no padrão ICP-Brasil (A1).'
    }
  ];

  // Filtered project APIs
  const filteredPlanoApis = useMemo(() => {
    if (!apiSearchQuery.trim()) return projeto.plano;
    const q = apiSearchQuery.toLowerCase();
    return projeto.plano.filter(
      (p) => p.apiNome.toLowerCase().includes(q) || p.apiOrgao.toLowerCase().includes(q)
    );
  }, [projeto.plano, apiSearchQuery]);

  // Split and highlight bracketed template fields (e.g. [NÚMERO DO OFÍCIO])
  const renderHighlightedDocument = useMemo(() => {
    const regex = /(\[[^\]\n]+\])/g;
    const parts = currentDocumentText.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <mark
            key={index}
            className="bg-[#FBEFF3] dark:bg-[#3D1424] text-[#8B1D47] dark:text-[#F391B3] px-1.5 py-0.5 rounded font-mono text-[13px] font-semibold border border-[#E55488]/40 dark:border-[#E55488]/30 inline-block my-0.5"
            title="Campo pendente de preenchimento antes do protocolo"
          >
            {part}
          </mark>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  }, [currentDocumentText]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Project Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE4E8] dark:border-[#261C22]">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1A1C] dark:text-[#F7EFF2] tracking-tight">
            Gerador de documentos
          </h1>
          <p className="text-sm text-[#54494E] dark:text-[#A3969C] mt-1">
            Elabore minutas oficiais para protocolo no órgão ou especificações para desenvolvimento.
          </p>
        </div>

        {/* Project Selector */}
        {allProjetos && allProjetos.length > 0 && onSelectProjeto && (
          <div className="relative shrink-0" ref={projectMenuRef}>
            <button
              type="button"
              onClick={() => setIsProjectMenuOpen((prev) => !prev)}
              aria-expanded={isProjectMenuOpen}
              aria-haspopup="listbox"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1519] border border-[#EDE4E8] dark:border-[#2E2328] hover:border-[#8B1D47]/40 dark:hover:border-[#E55488]/40 shadow-xs transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#8B1D47]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F8] dark:bg-[#251A21] border border-[#EDE4E8] dark:border-[#38262E] flex items-center justify-center shrink-0 text-[#8B1D47] dark:text-[#E55488]">
                <FolderKanban className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 pr-1">
                <span className="block text-xs font-medium text-muted leading-none mb-0.5">
                  Projeto ativo
                </span>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-xs font-bold text-main truncate max-w-[150px] sm:max-w-[200px]">
                    {projeto.nome}
                  </span>
                  <span className="text-xs text-muted truncate max-w-[90px] hidden sm:inline">
                    · {projeto.cliente}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted transition-transform duration-200 shrink-0 ${
                  isProjectMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            {isProjectMenuOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full mt-1.5 w-76 max-w-[90vw] bg-surface border border-border-default rounded-xl shadow-lg z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1 text-xs font-semibold text-muted">
                  Selecionar projeto
                </div>
                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {allProjetos.map((proj) => {
                    const isSelected = proj.id === projeto.id;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => {
                          onSelectProjeto(proj.id);
                          setIsProjectMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary-light text-primary font-semibold'
                            : 'hover:bg-surface-hover text-main'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate">{proj.nome}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-surface border border-border-default text-muted">
                              {proj.sigla}
                            </span>
                          </div>
                          <span className="block text-xs text-muted truncate">
                            {proj.cliente} · {proj.plano.length} {proj.plano.length === 1 ? 'API' : 'APIs'}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Delicate Summary Kicker Bar (Replacing heavy alert banner) */}
      <div className="bg-[#FAF7F8] dark:bg-[#181116] border border-[#EDE4E8] dark:border-[#261C22] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#4A3E44] dark:text-[#D1C6CB]">
          <ShieldCheck className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488] shrink-0" />
          <span>
            Documento baseado nas <strong>{apisSelecionadas.length} APIs selecionadas</strong> do plano <strong>{projeto.nome}</strong>.
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#695E63] dark:text-[#A3969C]">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${pendingBrackets.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {pendingBrackets.length > 0 ? (
              <span><strong>{pendingBrackets.length}</strong> campos com [tag] para preencher</span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Todos os campos preenchidos</span>
            )}
          </span>
          <span aria-hidden="true" className="text-[#EDE4E8] dark:text-[#2E2328]">|</span>
          <span>Padrão Conecta gov.br & LGPD</span>
        </div>
      </div>

      {/* 3. Main Workbench: Left Configuration (5 cols) | Right Paper Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Organized Tabbed Configurator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#1C1519] rounded-2xl border border-[#EDE4E8] dark:border-[#261C22] shadow-xs overflow-hidden">
            
            {/* Step Tabs Header */}
            <div className="flex border-b border-[#EDE4E8] dark:border-[#261C22] bg-[#FAF7F8]/80 dark:bg-[#181116]/80 p-1">
              <button
                type="button"
                onClick={() => setActiveConfigTab('escopo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeConfigTab === 'escopo'
                    ? 'bg-white dark:bg-[#24171F] text-[#8B1D47] dark:text-[#E55488] shadow-xs'
                    : 'text-[#695E63] dark:text-[#A3969C] hover:text-[#1F1A1C] dark:hover:text-[#F7EFF2]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1. Escopo & APIs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveConfigTab('partes')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeConfigTab === 'partes'
                    ? 'bg-white dark:bg-[#24171F] text-[#8B1D47] dark:text-[#E55488] shadow-xs'
                    : 'text-[#695E63] dark:text-[#A3969C] hover:text-[#1F1A1C] dark:hover:text-[#F7EFF2]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>2. Partes & Contato</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveConfigTab('texto')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeConfigTab === 'texto'
                    ? 'bg-white dark:bg-[#24171F] text-[#8B1D47] dark:text-[#E55488] shadow-xs'
                    : 'text-[#695E63] dark:text-[#A3969C] hover:text-[#1F1A1C] dark:hover:text-[#F7EFF2]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>3. Justificativa</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-5 space-y-5">
              
              {/* TAB 1: ESCOPO & APIS */}
              {activeConfigTab === 'escopo' && (
                <div className="space-y-5">
                  {/* Tipo de Documento */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#695E63] dark:text-[#A3969C] mb-2">
                      Finalidade do documento
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setDocType('oficio');
                          setCustomEditedText(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          docType === 'oficio'
                            ? 'border-[#8B1D47] dark:border-[#E55488] bg-[#FAF7F8] dark:bg-[#28141F] text-[#8B1D47] dark:text-[#E55488] ring-1 ring-[#8B1D47] dark:ring-[#E55488]'
                            : 'border-[#EDE4E8] dark:border-[#2E2328] hover:bg-[#FAF7F8] dark:hover:bg-[#20151C] text-[#1F1A1C] dark:text-[#F7EFF2]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488]" />
                          <span className="text-xs font-bold">Minuta de ofício</span>
                        </div>
                        <p className="text-xs text-[#695E63] dark:text-[#A3969C] leading-snug">
                          Ofício protocolar do cliente para os órgãos gestores
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDocType('dev');
                          setCustomEditedText(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          docType === 'dev'
                            ? 'border-[#8B1D47] dark:border-[#E55488] bg-[#FAF7F8] dark:bg-[#28141F] text-[#8B1D47] dark:text-[#E55488] ring-1 ring-[#8B1D47] dark:ring-[#E55488]'
                            : 'border-[#EDE4E8] dark:border-[#2E2328] hover:bg-[#FAF7F8] dark:hover:bg-[#20151C] text-[#1F1A1C] dark:text-[#F7EFF2]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Code2 className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488]" />
                          <span className="text-xs font-bold">Ficha técnica</span>
                        </div>
                        <p className="text-xs text-[#695E63] dark:text-[#A3969C] leading-snug">
                          Especificação direta para o time de desenvolvimento
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Seleção de APIs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#695E63] dark:text-[#A3969C]">
                        APIs a incluir ({selectedApiIds.length} de {projeto.plano.length})
                      </label>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-[#8B1D47] dark:text-[#E55488] hover:underline font-semibold cursor-pointer"
                        >
                          Todas
                        </button>
                        <span className="text-[#EDE4E8] dark:text-[#2E2328]">·</span>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="text-[#695E63] dark:text-[#A3969C] hover:underline cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>

                    {/* Quick search input if more than 3 APIs */}
                    {projeto.plano.length > 3 && (
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-[#968B90] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar nas APIs do projeto..."
                          value={apiSearchQuery}
                          onChange={(e) => setApiSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F8] dark:bg-[#181116] border border-[#EDE4E8] dark:border-[#261C22] rounded-lg text-xs text-[#1F1A1C] dark:text-[#F7EFF2] placeholder:text-[#968B90] focus:outline-none focus:ring-1 focus:ring-[#8B1D47]"
                        />
                      </div>
                    )}

                    {/* APIs Checklist */}
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                      {filteredPlanoApis.length === 0 ? (
                        <p className="text-xs text-[#695E63] py-4 text-center">Nenhuma API encontrada para o filtro.</p>
                      ) : (
                        filteredPlanoApis.map((item) => {
                          const isSelected = selectedApiIds.includes(item.apiId);
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleApi(item.apiId)}
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                  e.preventDefault();
                                  handleToggleApi(item.apiId);
                                }
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#FAF7F8] dark:bg-[#25151F] border-[#8B1D47]/40 dark:border-[#E55488]/40'
                                  : 'bg-white dark:bg-[#1A1317] border-[#EDE4E8] dark:border-[#261C22] hover:bg-[#FAF7F8] dark:hover:bg-[#1F161B]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-[#8B1D47] dark:text-[#E55488] shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-[#968B90] shrink-0" />
                                )}
                                <div className="truncate">
                                  <span className={`font-semibold ${isSelected ? 'text-[#8B1D47] dark:text-[#E55488]' : 'text-[#1F1A1C] dark:text-[#F7EFF2]'}`}>
                                    {item.apiNome}
                                  </span>
                                  <span className="text-secondary ml-1.5">
                                    · {item.apiOrgao}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-sans tabular-nums text-muted shrink-0 ml-2">
                                Sprint {item.sprintId}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Forward button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveConfigTab('partes')}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-fg flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                    >
                      <span>Avançar para partes & contato</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PARTES & CONTATO */}
              {activeConfigTab === 'partes' && (
                <div className="space-y-4 text-xs">
                  {/* Órgão Destinatário */}
                  <div>
                    <label className="block text-xs font-semibold text-main mb-1">
                      Órgão ou autoridade destinatária
                    </label>
                    <input
                      type="text"
                      value={orgaoDestinatario}
                      onChange={(e) => {
                        setOrgaoDestinatario(e.target.value);
                        setCustomEditedText(null);
                      }}
                      className="w-full min-h-[44px] px-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                      placeholder="Ex: Secretaria de Governo Digital — MGI"
                    />

                    {/* Quick Presets */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted">Preenchimento rápido:</span>
                      {destinatarioPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setOrgaoDestinatario(preset.value);
                            setCustomEditedText(null);
                          }}
                          className="min-h-[32px] px-2.5 py-0.5 rounded-md bg-surface border border-border-default hover:border-primary text-secondary text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Órgão Cliente & Projeto */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-main mb-1">
                        Órgão solicitante (Cliente)
                      </label>
                      <input
                        type="text"
                        value={orgaoClienteNome}
                        onChange={(e) => {
                          setOrgaoClienteNome(e.target.value);
                          setCustomEditedText(null);
                        }}
                        className="w-full min-h-[44px] px-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-main mb-1">
                        Nome do projeto
                      </label>
                      <input
                        type="text"
                        value={projetoNome}
                        onChange={(e) => {
                          setProjetoNome(e.target.value);
                          setCustomEditedText(null);
                        }}
                        className="w-full min-h-[44px] px-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                      />
                    </div>
                  </div>

                  <hr className="border-border-subtle my-2" />

                  {/* Interlocutor Técnico YouX */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted mb-2">
                      Interlocutor técnico YouX
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-1">
                          Nome do responsável
                        </label>
                        <input
                          type="text"
                          value={gestorNome}
                          onChange={(e) => {
                            setGestorNome(e.target.value);
                            setCustomEditedText(null);
                          }}
                          className="w-full min-h-[44px] px-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-1">
                          Cargo / Função
                        </label>
                        <input
                          type="text"
                          value={gestorCargo}
                          onChange={(e) => {
                            setGestorCargo(e.target.value);
                            setCustomEditedText(null);
                          }}
                          className="w-full min-h-[44px] px-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveConfigTab('escopo')}
                      className="min-h-[44px] px-3 py-1.5 text-xs font-medium text-muted hover:text-main cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConfigTab('texto')}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-fg flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                    >
                      <span>Avançar para justificativa</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: TEXTO & JUSTIFICATIVA */}
              {activeConfigTab === 'texto' && (
                <div className="space-y-4 text-xs">
                  {/* Justificativa */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-main">
                        Justificativa de interesse público
                      </label>
                      <span className="text-xs text-muted tabular-nums">
                        {justificativa.length} caracteres
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={justificativa}
                      onChange={(e) => {
                        setJustificativa(e.target.value);
                        setCustomEditedText(null);
                      }}
                      className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main focus-visible:outline-2 focus-visible:outline-focus-ring leading-relaxed"
                    />

                    {/* Presets */}
                    <div className="mt-2 space-y-1">
                      <span className="text-xs text-muted block">Inserir modelo pré-aprovado:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {justificativaPresets.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setJustificativa(preset.text);
                              setCustomEditedText(null);
                            }}
                            className="min-h-[32px] px-2.5 py-0.5 rounded-md bg-surface border border-border-default hover:border-primary text-secondary text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <hr className="border-border-subtle my-2" />

                  {/* Observações Técnicas */}
                  <div>
                    <label className="block text-xs font-semibold text-main mb-1">
                      Observações técnicas e de homologação
                    </label>
                    <textarea
                      rows={3}
                      value={observacoesTecnicas}
                      onChange={(e) => {
                        setObservacoesTecnicas(e.target.value);
                        setCustomEditedText(null);
                      }}
                      className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-xl text-xs text-main focus-visible:outline-2 focus-visible:outline-focus-ring leading-relaxed"
                    />

                    {/* Presets */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {observacoesPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setObservacoesTecnicas(preset.text);
                            setCustomEditedText(null);
                          }}
                          className="min-h-[32px] px-2.5 py-0.5 rounded-md bg-surface border border-border-default hover:border-primary text-secondary text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Back to Step 2 */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveConfigTab('partes')}
                      className="min-h-[44px] px-3 py-1.5 text-xs font-medium text-muted hover:text-main cursor-pointer focus-visible:outline-2 focus-visible:outline-focus-ring"
                    >
                      Voltar para partes
                    </button>
                    <span className="text-xs text-success-text font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Dados sincronizados
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Paper Canvas Studio */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#1C1519] rounded-2xl border border-[#EDE4E8] dark:border-[#261C22] shadow-xs overflow-hidden">
            
            {/* Studio Action Toolbar */}
            <div className="p-3.5 sm:px-5 bg-[#FAF7F8] dark:bg-[#181116] border-b border-[#EDE4E8] dark:border-[#261C22] flex flex-wrap items-center justify-between gap-3">
              
              {/* Left side: View Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#EDE4E8]/60 dark:bg-[#281D23] p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode('formatted')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    previewMode === 'formatted'
                      ? 'bg-white dark:bg-[#1C1519] text-[#8B1D47] dark:text-[#E55488] shadow-xs'
                      : 'text-[#695E63] dark:text-[#A3969C]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Destaques</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMode('raw-edit');
                    if (customEditedText === null) {
                      setCustomEditedText(generatedBaseText);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    previewMode === 'raw-edit'
                      ? 'bg-white dark:bg-[#1C1519] text-[#8B1D47] dark:text-[#E55488] shadow-xs'
                      : 'text-[#695E63] dark:text-[#A3969C]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edição Direta</span>
                </button>
              </div>

              {/* Right side: Action Buttons */}
              <div className="flex items-center gap-2">
                {customEditedText !== null && (
                  <button
                    type="button"
                    onClick={() => setCustomEditedText(null)}
                    className="p-2 text-xs font-medium text-[#695E63] hover:text-[#8B1D47] transition-colors cursor-pointer rounded-lg hover:bg-[#8B1D47]/5"
                    title="Restaurar texto gerado automaticamente"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Baixar TXT */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 border border-[#EDE4E8] dark:border-[#2E2328] hover:border-[#8B1D47] text-[#1F1A1C] dark:text-[#F7EFF2] text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Baixar arquivo TXT"
                >
                  <Download className="w-3.5 h-3.5 text-[#695E63]" />
                  <span>Baixar</span>
                </button>

                {/* Imprimir */}
                <button
                  type="button"
                  onClick={handlePrint}
                  aria-label="Imprimir documento"
                  className="p-2 border border-[#EDE4E8] dark:border-[#2E2328] hover:border-[#8B1D47] text-[#1F1A1C] dark:text-[#F7EFF2] rounded-xl transition-colors cursor-pointer"
                  title="Imprimir documento"
                >
                  <Printer className="w-3.5 h-3.5 text-[#695E63]" />
                </button>

                {/* Copiar Texto (Primary) */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    copied
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#8B1D47] hover:bg-[#731639] text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar texto'}</span>
                </button>
              </div>
            </div>

            {/* Document Paper Presentation */}
            <div className="p-6 sm:p-8 bg-[#FAF7F8] dark:bg-[#120D10] overflow-y-auto max-h-[640px]">
              
              {previewMode === 'formatted' ? (
                /* Formatted Paper View */
                <article className="bg-white dark:bg-[#1A1317] text-[#1F1A1C] dark:text-[#F7EFF2] rounded-xl border border-[#EDE4E8] dark:border-[#2E2328] shadow-sm p-6 sm:p-10 max-w-[68ch] mx-auto text-sm leading-[1.7] whitespace-pre-wrap selection:bg-[#FBEFF3] dark:selection:bg-[#3D1424] font-sans">
                  {renderHighlightedDocument}
                </article>
              ) : (
                /* Raw Direct Edit View */
                <div className="bg-surface rounded-xl border border-border-default shadow-sm p-4 sm:p-6 max-w-[68ch] mx-auto">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted">
                    <span>Modo de edição manual ativa</span>
                    <span className="text-xs text-warning-text font-medium">Qualquer alteração feita aqui será mantida ao copiar ou baixar.</span>
                  </div>
                  <textarea
                    rows={24}
                    value={currentDocumentText}
                    onChange={(e) => setCustomEditedText(e.target.value)}
                    className="w-full font-mono text-xs leading-relaxed p-3 bg-bg-page border border-border-default rounded-lg text-main focus-visible:outline-2 focus-visible:outline-focus-ring"
                  />
                </div>
              )}
            </div>

            {/* Document Footer Bar */}
            <div className="px-5 py-3 bg-[#FAF7F8] dark:bg-[#181116] border-t border-[#EDE4E8] dark:border-[#261C22] flex items-center justify-between text-xs text-[#695E63] dark:text-[#A3969C]">
              <div className="flex items-center gap-2">
                <span>{apisSelecionadas.length} API(s) no documento</span>
                <span aria-hidden="true">·</span>
                <span>{currentDocumentText.split(/\s+/).filter(Boolean).length} palavras</span>
              </div>
              <span className="font-semibold text-[#8B1D47] dark:text-[#E55488]">
                Padrão YouX GovTech
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
