import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ClipboardCopy, FolderPlus, Layers3, NotebookPen, Pencil, Plus, Trash2, X } from 'lucide-react';
import { ApiItem } from '../../types';

type Etapa = { id: string; apiId: string; observacao?: string };
type Pasta = { id: string; nome: string; observacoes: string; etapas: Etapa[] };

interface ProjectsWorkspaceViewProps {
  apis: ApiItem[];
  onSelectApi: (apiId: string) => void;
}

const STORAGE_KEY = 'youx_project_folders';
const initialFolders: Pasta[] = [{ id: 'sicarf', nome: 'SICARF', observacoes: '', etapas: [] }];

export const ProjectsWorkspaceView: React.FC<ProjectsWorkspaceViewProps> = ({ apis, onSelectApi }) => {
  const [pastas, setPastas] = useState<Pasta[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as Pasta[] : initialFolders;
    } catch {
      return initialFolders;
    }
  });
  const [pastaAtivaId, setPastaAtivaId] = useState('sicarf');
  const [nomeNovaPasta, setNomeNovaPasta] = useState('');
  const [apiSelecionada, setApiSelecionada] = useState('');
  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [mensagemExportacao, setMensagemExportacao] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pastas)); } catch { /* armazenamento indisponível */ }
  }, [pastas]);

  const pastaAtiva = pastas.find((pasta) => pasta.id === pastaAtivaId) ?? pastas[0];
  const apisMap = useMemo(() => new Map(apis.map((api) => [api.id, api])), [apis]);

  const atualizarPasta = (atualizar: (pasta: Pasta) => Pasta) => {
    if (!pastaAtiva) return;
    setPastas((anteriores) => anteriores.map((pasta) => pasta.id === pastaAtiva.id ? atualizar(pasta) : pasta));
  };

  const criarPasta = (event: React.FormEvent) => {
    event.preventDefault();
    const nome = nomeNovaPasta.trim();
    if (!nome || pastas.some((pasta) => pasta.nome.toLocaleLowerCase() === nome.toLocaleLowerCase())) return;
    const nova = { id: `pasta-${Date.now()}`, nome, observacoes: '', etapas: [] };
    setPastas((anteriores) => [...anteriores, nova]);
    setPastaAtivaId(nova.id);
    setNomeNovaPasta('');
  };

  const adicionarEtapa = () => {
    if (!apiSelecionada || !pastaAtiva || pastaAtiva.etapas.some((etapa) => etapa.apiId === apiSelecionada)) return;
    atualizarPasta((pasta) => ({ ...pasta, etapas: [...pasta.etapas, { id: `etapa-${Date.now()}`, apiId: apiSelecionada }] }));
    setApiSelecionada('');
  };

  const removerEtapa = (etapaId: string) => atualizarPasta((pasta) => ({ ...pasta, etapas: pasta.etapas.filter((etapa) => etapa.id !== etapaId) }));
  const atualizarEtapa = (etapaId: string, observacao: string) => atualizarPasta((pasta) => ({
    ...pasta,
    etapas: pasta.etapas.map((etapa) => etapa.id === etapaId ? { ...etapa, observacao } : etapa),
  }));
  const salvarNome = (event: React.FormEvent) => {
    event.preventDefault();
    const nome = nomeEditado.trim();
    if (!nome || !pastaAtiva || pastas.some((pasta) => pasta.id !== pastaAtiva.id && pasta.nome.toLocaleLowerCase() === nome.toLocaleLowerCase())) return;
    atualizarPasta((pasta) => ({ ...pasta, nome }));
    setEditandoNome(false);
  };
  const copiarResumo = async () => {
    if (!pastaAtiva) return;
    const linhas = [
      `# ${pastaAtiva.nome}`,
      '',
      '## Etapas',
      ...(pastaAtiva.etapas.length ? pastaAtiva.etapas.map((etapa, index) => {
        const api = apisMap.get(etapa.apiId);
        return `${index + 1}. ${api?.nome ?? 'API removida'}${etapa.observacao?.trim() ? `\n   - Observação: ${etapa.observacao.trim()}` : ''}`;
      }) : ['Nenhuma API vinculada.']),
      '',
      '## Anotações',
      pastaAtiva.observacoes.trim() || 'Sem anotações.',
    ];
    try {
      await navigator.clipboard.writeText(linhas.join('\n'));
      setMensagemExportacao('Resumo copiado.');
    } catch {
      setMensagemExportacao('Não foi possível copiar o resumo neste navegador.');
    }
  };
  const moverEtapa = (index: number, direcao: -1 | 1) => atualizarPasta((pasta) => {
    const destino = index + direcao;
    if (destino < 0 || destino >= pasta.etapas.length) return pasta;
    const etapas = [...pasta.etapas];
    [etapas[index], etapas[destino]] = [etapas[destino], etapas[index]];
    return { ...pasta, etapas };
  });

  return (
    <div className="min-h-full bg-bg-page p-5 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-text"><Layers3 className="size-4" /> Espaço de trabalho</div>
            <h1 className="text-2xl font-bold tracking-tight text-main sm:text-3xl">Pastas de integrações</h1>
            <p className="mt-1 text-sm text-secondary">Organize as APIs por projeto, em etapas simples e sem cronogramas.</p>
          </div>
          <form onSubmit={criarPasta} className="flex w-full gap-2 sm:w-auto">
            <label className="sr-only" htmlFor="nova-pasta">Nome da nova pasta</label>
            <input id="nova-pasta" value={nomeNovaPasta} onChange={(event) => setNomeNovaPasta(event.target.value)} placeholder="Nome da pasta" className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-default bg-surface px-3 text-sm text-main outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-52" />
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover"><FolderPlus className="size-4" /> Criar pasta</button>
          </form>
        </header>

        <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside aria-label="Pastas de projetos" className="h-fit rounded-2xl border border-border-default bg-surface p-3">
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Minhas pastas</p>
              <span aria-label={`${pastas.length} pastas`} className="inline-flex min-w-6 items-center justify-center rounded-full bg-bg-page px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary">{pastas.length}</span>
            </div>
            <nav className="flex gap-1 overflow-x-auto lg:flex-col">
              {pastas.map((pasta) => (
                <button key={pasta.id} type="button" onClick={() => setPastaAtivaId(pasta.id)} aria-current={pastaAtivaId === pasta.id ? 'page' : undefined} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold transition-colors lg:w-full ${pastaAtivaId === pasta.id ? 'bg-primary-light text-primary-text' : 'text-text-secondary hover:bg-surface-hover'}`}>
                  <BookOpen className="size-4" /> <span className="truncate">{pasta.nome}</span>
                </button>
              ))}
            </nav>
          </aside>

          {pastaAtiva ? (
            <section className="space-y-5 rounded-2xl border border-border-default bg-surface p-5 sm:p-7" aria-labelledby="pasta-title">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-text">Pasta do projeto</p>
                  {editandoNome ? (
                    <form onSubmit={salvarNome} className="mt-2 flex max-w-lg gap-2">
                      <label className="sr-only" htmlFor="renomear-pasta">Novo nome da pasta</label>
                      <input id="renomear-pasta" autoFocus value={nomeEditado} onChange={(event) => setNomeEditado(event.target.value)} className="min-h-10 min-w-0 flex-1 rounded-lg border border-border-default bg-bg-page px-3 text-sm text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                      <button type="submit" className="min-h-10 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-fg">Salvar</button>
                      <button type="button" onClick={() => setEditandoNome(false)} className="min-h-10 rounded-lg px-3 text-xs font-semibold text-text-muted hover:bg-surface-hover">Cancelar</button>
                    </form>
                  ) : <h2 id="pasta-title" className="mt-1 text-2xl font-bold text-main">{pastaAtiva.nome}</h2>}
                  <p className="mt-1 text-sm text-text-muted">{pastaAtiva.etapas.length} {pastaAtiva.etapas.length === 1 ? 'API vinculada' : 'APIs vinculadas'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setNomeEditado(pastaAtiva.nome); setEditandoNome(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-default px-3 text-xs font-semibold text-text-secondary hover:bg-surface-hover"><Pencil className="size-4" /> Renomear</button>
                  <button type="button" onClick={() => { const restante = pastas.filter((pasta) => pasta.id !== pastaAtiva.id); setPastas(restante); setPastaAtivaId(restante[0]?.id ?? ''); setEditandoNome(false); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-text-muted hover:bg-danger-bg hover:text-danger-text"><Trash2 className="size-4" /> Excluir pasta</button>
                  <button type="button" onClick={copiarResumo} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-default px-3 text-xs font-semibold text-text-secondary hover:bg-surface-hover"><ClipboardCopy className="size-4" /> Copiar resumo</button>
                </div>
                {mensagemExportacao && <p aria-live="polite" className="w-full text-right text-xs text-text-muted">{mensagemExportacao}</p>}
              </div>

              <section aria-labelledby="etapas-title" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 id="etapas-title" className="font-bold text-main">Etapas de uso</h3><p className="mt-0.5 text-xs text-text-muted">A sequência pode ser ajustada quando o fluxo mudar.</p></div></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="selecionar-api" className="sr-only">Selecionar API da biblioteca</label>
                  <select id="selecionar-api" value={apiSelecionada} onChange={(event) => setApiSelecionada(event.target.value)} className="min-h-11 flex-1 rounded-xl border border-border-default bg-bg-page px-3 text-sm text-main outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="">Escolha uma API da biblioteca</option>
                    {apis.filter((api) => !pastaAtiva.etapas.some((etapa) => etapa.apiId === api.id)).map((api) => <option key={api.id} value={api.id}>{api.nome} · {api.orgao}</option>)}
                  </select>
                  <button type="button" onClick={adicionarEtapa} disabled={!apiSelecionada} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-default px-4 text-sm font-semibold text-main hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"><Plus className="size-4" /> Adicionar etapa</button>
                </div>
                {pastaAtiva.etapas.length ? <ol className="space-y-2" aria-label="Sequência de APIs">
                  {pastaAtiva.etapas.map((etapa, index) => {
                    const api = apisMap.get(etapa.apiId);
                    if (!api) return null;
                    return <li key={etapa.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-border-default bg-bg-page p-3 sm:p-4">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-sm font-bold text-primary-text tabular-nums">{index + 1}</span>
                      <div className="min-w-0">
                        <button type="button" onClick={() => onSelectApi(api.id)} className="block max-w-full text-left"><span className="block truncate text-sm font-bold text-main hover:text-primary-text">Etapa {index + 1}: {api.nome}</span><span className="mt-0.5 block truncate text-xs text-text-muted">{api.orgao} · {api.descricaoSimples}</span></button>
                        <label htmlFor={`observacao-etapa-${etapa.id}`} className="sr-only">Observação da etapa {index + 1} para {api.nome}</label>
                        <input id={`observacao-etapa-${etapa.id}`} value={etapa.observacao ?? ''} onChange={(event) => atualizarEtapa(etapa.id, event.target.value)} placeholder="Observação opcional sobre o papel desta API" className="mt-2 min-h-9 w-full rounded-lg border border-border-default bg-surface px-2.5 text-xs text-main placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                      </div>
                      <div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => moverEtapa(index, -1)} disabled={index === 0} aria-label={`Mover ${api.nome} para cima`} className="size-9 rounded-lg text-text-muted hover:bg-surface-hover disabled:opacity-30">↑</button><button type="button" onClick={() => moverEtapa(index, 1)} disabled={index === pastaAtiva.etapas.length - 1} aria-label={`Mover ${api.nome} para baixo`} className="size-9 rounded-lg text-text-muted hover:bg-surface-hover disabled:opacity-30">↓</button><button type="button" onClick={() => removerEtapa(etapa.id)} aria-label={`Remover ${api.nome} da pasta`} className="size-9 rounded-lg text-text-muted hover:bg-danger-bg hover:text-danger-text"><X className="mx-auto size-4" /></button></div>
                    </li>;
                  })}
                </ol> : <div className="rounded-xl border border-dashed border-border-default px-4 py-8 text-center"><Layers3 className="mx-auto size-6 text-text-muted" /><p className="mt-2 text-sm font-semibold text-main">Nenhuma etapa por enquanto</p><p className="mt-1 text-xs text-text-muted">Adicione as APIs que fazem parte deste projeto.</p></div>}
              </section>

              <section aria-labelledby="notas-title" className="rounded-2xl border border-border-default bg-bg-page p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2"><NotebookPen className="size-4 text-primary-text" /><h3 id="notas-title" className="text-sm font-bold text-main">Bloco de anotações</h3><span className="ml-auto text-xs text-text-muted">Salvo automaticamente</span></div>
                <label className="sr-only" htmlFor="notas-pasta">Anotações da pasta {pastaAtiva.nome}</label>
                <textarea id="notas-pasta" value={pastaAtiva.observacoes} onChange={(event) => atualizarPasta((pasta) => ({ ...pasta, observacoes: event.target.value }))} placeholder="Registre lembretes, observações ou detalhes desta integração..." rows={5} className="w-full resize-y rounded-xl border border-border-default bg-surface p-3 text-sm leading-relaxed text-main outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary" />
              </section>
            </section>
          ) : (
            <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface p-8 text-center">
              <FolderPlus className="size-8 text-primary-text" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-main">Crie sua primeira pasta</h2>
              <p className="mt-1 max-w-sm text-sm text-text-muted">Use o campo “Nome da pasta” acima para começar a organizar suas integrações.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
