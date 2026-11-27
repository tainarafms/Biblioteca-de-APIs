import { ApiItem, Projeto } from '../types';

export const APIS_MOCK: ApiItem[] = [
  {
    id: 'sigef',
    nome: 'SIGEF',
    sigla: 'SIGEF',
    orgao: 'INCRA',
    orgaoNomeCompleto: 'Instituto Nacional de Colonização e Reforma Agrária',
    descricaoSimples: 'Consulta limites georreferenciados de parcelas rurais certificadas e sobreposições fundiárias.',
    conectaGov: true,
    categorias: ['Geolocalização', 'Órgãos federais'],
    dificuldade: 'Burocrática',
    dificuldadeMotivo: 'Exige Acordo de Cooperação Técnica (ACT) formalizado, publicação no DOU e certificado e-CNPJ.',
    verificadoEm: '14/10/2026',
    verificadoPor: 'Equipe YouX',
    visaoGeral: {
      oQueFaz: 'Verifica se um imóvel rural está medido e certificado pelo Incra, indicando se a poligonal invade terras indígenas, unidades de conservação, assentamentos ou imóveis vizinhos.',
      dadosEntrada: [
        'Código da Parcela SIGEF (ex.: 08b4-3a21...)',
        'CPF ou CNPJ do detentor cadastrado',
        'Polígono Georreferenciado em GeoJSON ou WKT (opcional para análise de sobreposição espacial)'
      ],
      dadosRetornados: [
        { campo: 'codigo_parcela', descricao: 'Identificador único do perímetro certificado no Incra' },
        { campo: 'status_certificacao', descricao: 'Situação legal (Certificado, Pendente, Cancelado)' },
        { campo: 'area_calculada_ha', descricao: 'Área exata em hectares após cálculo geodésico' },
        { campo: 'nome_detentor', descricao: 'Nome completo ou Razão Social do titular da certificação' },
        { campo: 'memorial_descritivo', descricao: 'Lista de vértices cartográficos com azimute e coordenadas' },
        { campo: 'sobreposicoes_detectadas', descricao: 'Booleano e lista de polígonos confrontantes conflitantes' }
      ],
      exemplosFormulario: [
        'Código de Certificação Incra / SIGEF',
        'Área Total Certificada (ha)',
        'Alerta de Sobreposição Fundiária (Sim / Não)',
        'Polígono Georreferenciado no Mapa Interativo'
      ],
      linkDocumentacao: 'https://sigef.incra.gov.br/api/v2/docs',
      linkSwagger: 'https://sigef.incra.gov.br/swagger/v2.json',
      padraoAutenticacao: 'OAuth 2.0 com mTLS (Mutual TLS) e Certificado Digital ICP-Brasil A1/A3'
    },
    comoConseguirAcesso: {
      quemSolicita: 'Cliente com apoio YouX',
      quemSolicitaDetalhes: 'O órgão público contratante (ex.: Secretaria de Meio Ambiente ou Agricultura) é o titular oficial do ofício; a YouX elabora a justificativa técnica e os diagramas de arquitetura.',
      anexosAssinaturas: [
        'Ofício Formal assinado pelo Secretário de Estado ou Diretor-Presidente',
        'Minuta do Acordo de Cooperação Técnica (ACT) com o Incra',
        'Plano de Trabalho com estimativa de volumetria e finalidade pública',
        'Certificado Digital e-CNPJ da instituição contratante e e-CPF do gestor'
      ],
      prazoEstimadoFaixa: '30 a 60 dias úteis',
      prazoMinDias: 30,
      prazoMaxDias: 60,
      ambientes: {
        homologacao: 'https://homolog-sigef.incra.gov.br/api/v2',
        producao: 'https://sigef.incra.gov.br/api/v2'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Coleta de assinatura institucional no Ofício Padrão',
          descricao: 'Submeter para assinatura eletrônica do titular da pasta a minuta padrão de solicitação de interoperabilidade com o Incra.'
        },
        {
          numero: 2,
          titulo: 'Abertura de processo no SEI do Incra Central',
          descricao: 'Autuar processo administrativo endereçado à Diretoria de Governança Fundiária (DGF) com Plano de Trabalho e justificativa da política pública.'
        },
        {
          numero: 3,
          titulo: 'Parecer da Procuradoria Federal e Publicação no DOU',
          descricao: 'Aguardar parecer jurídico favorável e extrato do Acordo de Cooperação Técnica publicado no Diário Oficial da União.'
        },
        {
          numero: 4,
          titulo: 'Whitelist de IP e Liberação de Chave de Homologação',
          descricao: 'Cadastrar os IPs de egress dos servidores de aplicação da YouX e obter Client ID e mTLS em Sandbox.'
        },
        {
          numero: 5,
          titulo: 'Homologação e Validação Técnica com o Incra',
          descricao: 'Executar bateria de testes com 10 imóveis reais amostrais e solicitar virada de chave para Produção.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: 'Esta API possui barreira burocrática alta. Nunca deixe para solicitar após o início da sprint correspondente.',
      preRequisitos: [
        'Convênio de Cooperação Técnica vigente entre o cliente e o Incra.',
        'Certificado Digital de Servidor ICP-Brasil instalado no gateway de integração.',
        'Recomendável integrar primeiro com o SICAR para verificar se o imóvel já tem cadastro ambiental estadual.'
      ],
      apisVinculadasIds: ['sicar', 'sncr'],
      contasRequeridas: 'Certificado ICP-Brasil e-CNPJ da entidade contratante'
    },
    macetes: [
      {
        id: 'm1',
        autor: 'Equipe técnica',
        cargo: 'Equipe técnica',
        data: '18/09/2026',
        conteudo: 'O gateway do Incra rejeita qualquer chamada sem o cabeçalho X-Source-Agency com a sigla oficial cadastrada no ACT. Não esqueça de mapear essa variável de ambiente.'
      },
      {
        id: 'm2',
        autor: 'Equipe de integração',
        cargo: 'Equipe de integração',
        data: '03/10/2026',
        conteudo: 'A homologação do SIGEF fica fora do ar toda terça-feira das 06h às 10h para rotina de sincronização cadastral. Se fizer testes nesse período, você receberá erro 503.'
      }
    ],
    historico: [
      {
        id: 'h1',
        data: '14/10/2026',
        responsavel: 'Equipe YouX',
        descricao: 'Atualizado requisito de mTLS e migração oficial dos endpoints legados para a rota v2 unificada.'
      },
      {
        id: 'h2',
        data: '22/07/2026',
        responsavel: 'Equipe técnica',
        descricao: 'Validação da rota de busca espacial por bounding box (BBOX).'
      }
    ]
  },
  {
    id: 'cpf-luz',
    nome: 'CPF Luz',
    sigla: 'CPF Luz',
    orgao: 'Receita Federal / Serpro',
    orgaoNomeCompleto: 'Secretaria Especial da Receita Federal do Brasil / SERPRO',
    descricaoSimples: 'Consulta cadastral rápida de pessoa física pelo CPF trazendo nome completo e situação cadastral.',
    conectaGov: true,
    categorias: ['Cadastro de pessoas', 'Órgãos federais'],
    dificuldade: 'Fácil',
    dificuldadeMotivo: 'Disponível no catálogo padrão do Conecta gov.br com adesão facilitada.',
    verificadoEm: '20/10/2026',
    verificadoPor: 'Equipe YouX',
    visaoGeral: {
      oQueFaz: 'Recebe o CPF e a data de nascimento e devolve se a pessoa física está Regular, Suspensa, Cancelada ou Falecida na Receita Federal, com o nome oficial grafado sem erros de digitação.',
      dadosEntrada: [
        'Número do CPF (11 dígitos numéricos)',
        'Data de Nascimento (formato AAAA-MM-DD, obrigatório por regra de segurança)'
      ],
      dadosRetornados: [
        { campo: 'nome_pessoa_fisica', descricao: 'Nome civil oficial registrado na Receita Federal' },
        { campo: 'situacao_cadastral', descricao: 'Status cadastral (Regular, Suspensa, Titular Falecido, Cancelada)' },
        { campo: 'codigo_situacao', descricao: 'Código numérico de controle da Receita Federal' },
        { campo: 'data_inscricao', descricao: 'Data original de expedição do documento' }
      ],
      exemplosFormulario: [
        'Nome Completo do Produtor / Cidadão (autopreenchido)',
        'Validação de Situação Regular na Receita Federal',
        'Conferência de Grafia de Nome para Contrato Oficial'
      ],
      linkDocumentacao: 'https://conecta.gov.br/catalogo-de-servicos/cpf-luz/docs',
      linkSwagger: 'https://conecta.gov.br/swagger/cpf-luz-v1.json',
      padraoAutenticacao: 'OAuth 2.0 (Bearer Token Conecta gov / Serpro Gateway)'
    },
    comoConseguirAcesso: {
      quemSolicita: 'YouX ou Cliente',
      quemSolicitaDetalhes: 'Se o cliente já for aderente ao Conecta gov.br, a ativação é imediata no portal. Se for contratação Serpro direta, a YouX pode intermediar.',
      anexosAssinaturas: [
        'Termo de Adesão ao Conecta gov.br assinado digitalmente',
        'Declaração de Conformidade com a LGPD e finalidade do uso'
      ],
      prazoEstimadoFaixa: '5 a 10 dias úteis',
      prazoMinDias: 5,
      prazoMaxDias: 10,
      ambientes: {
        homologacao: 'https://gateway.apiserpro.serpro.gov.br/consulta-cpf-df-trial/v1',
        producao: 'https://gateway.apiserpro.serpro.gov.br/consulta-cpf-df/v1'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Solicitar habilitação no portal Conecta gov.br',
          descricao: 'Acessar o painel do órgão cliente e vincular a API CPF Luz ao identificador do projeto.'
        },
        {
          numero: 2,
          titulo: 'Assinar o termo de finalidade LGPD',
          descricao: 'Informar que os dados são utilizados unicamente para validação cadastral da política pública.'
        },
        {
          numero: 3,
          titulo: 'Geração de credenciais Consumer Key e Secret',
          descricao: 'Gerar chaves de homologação e produção diretamente no portal de desenvolvedores do Serpro/Conecta.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: 'Atenção aos campos: a data de nascimento é mandatória para validação. Não é possível consultar apenas com o número do CPF.',
      preRequisitos: [
        'Formulário precisa coletar a data de nascimento antes de disparar a consulta.',
        'Mecanismo de debounce ou gatilho após completar 11 dígitos para evitar consumo desnecessário de cotas.'
      ],
      apisVinculadasIds: [],
      contasRequeridas: 'Conta de desenvolvedor cadastrada no Conecta gov.br'
    },
    macetes: [
      {
        id: 'm-cpf-1',
        autor: 'Equipe de integração',
        cargo: 'Equipe YouX',
        data: '15/09/2026',
        conteudo: 'A API rejeita CPF com pontuação. Sempre aplique um sanitize simples no frontend (cpf.replace(/\\D/g, "")) antes do envio ao backend.'
      }
    ],
    historico: [
      {
        id: 'h-cpf-1',
        data: '20/10/2026',
        responsavel: 'Equipe YouX',
        descricao: 'Verificada estabilidade da cota de 100 requisições/segundo em ambiente de teste.'
      }
    ]
  },
  {
    id: 'login-gov',
    nome: 'Login gov.br',
    sigla: 'Login gov.br',
    orgao: 'MGI / SGD',
    orgaoNomeCompleto: 'Ministério da Gestão e da Inovação em Serviços Públicos / Secretaria de Governo Digital',
    descricaoSimples: 'Autenticação única padrão do cidadão brasileiro com níveis de confiabilidade bronze, prata e ouro.',
    conectaGov: true,
    categorias: ['Autenticação', 'Órgãos federais'],
    dificuldade: 'Média',
    dificuldadeMotivo: 'Requer aprovação do FSI (Formulário de Solicitação de Integração) pela equipe do MGI e configuração OpenID Connect.',
    verificadoEm: '18/10/2026',
    verificadoPor: 'Equipe YouX',
    visaoGeral: {
      oQueFaz: 'Permite que o cidadão ou produtor rural faça login no sistema com a mesma senha do gov.br. Retorna o CPF, nome civil, e-mail verificado e o nível da conta (Bronze, Prata ou Ouro).',
      dadosEntrada: [
        'Redirecionamento OpenID Connect padrão (client_id, redirect_uri, scope, state, code_challenge PKCE)',
        'Escopos solicitados: openid, email, phone, profile, govbr_confiabilidades'
      ],
      dadosRetornados: [
        { campo: 'sub', descricao: 'Identificador único do usuário no gov.br' },
        { campo: 'cpf', descricao: 'CPF do cidadão logado (sem pontuação)' },
        { campo: 'name', descricao: 'Nome civil completo oficial' },
        { campo: 'email', descricao: 'E-mail cadastrado e verificado no gov.br' },
        { campo: 'nivel_confiabilidade', descricao: 'Nível da conta: Bronze (básico), Prata (bancos) ou Ouro (biometria TSE)' }
      ],
      exemplosFormulario: [
        'Identificação do Beneficiário do Projeto',
        'Verificação de Elegibilidade (exige nível mínimo Prata)',
        'Vínculo de Sessão Segura sem armazenar senhas locais'
      ],
      linkDocumentacao: 'https://manual-roteiro-integracao-login-unico.servicos.gov.br/',
      linkSwagger: 'https://confianca.staging.acesso.gov.br/.well-known/openid-configuration',
      padraoAutenticacao: 'OpenID Connect (OIDC) com Authorization Code Grant e PKCE'
    },
    comoConseguirAcesso: {
      quemSolicita: 'Cliente com apoio YouX',
      quemSolicitaDetalhes: 'O órgão cliente submete o FSI oficial assinado; a YouX configura as rotas de callback, certificados e chaves de segurança.',
      anexosAssinaturas: [
        'FSI (Formulário de Solicitação de Integração) preenchido e assinado digitalmente pelo responsável do órgão',
        'Comprovante de designação do gestor público do serviço',
        'Lista de URLs de redirecionamento (staging e produção)'
      ],
      prazoEstimadoFaixa: '10 a 20 dias úteis',
      prazoMinDias: 10,
      prazoMaxDias: 20,
      ambientes: {
        homologacao: 'https://sso.staging.acesso.gov.br',
        producao: 'https://sso.acesso.gov.br'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Preenchimento do FSI (Formulário de Integração)',
          descricao: 'PO e Arquiteto YouX preenchem os dados técnicos do cliente no portal de serviços gov.br.'
        },
        {
          numero: 2,
          titulo: 'Assinatura digital e submissão ao MGI',
          descricao: 'Secretário do órgão assina via gov.br e o chamado é aberto no sistema de atendimento da SGD.'
        },
        {
          numero: 3,
          titulo: 'Configuração dos Clients no Staging',
          descricao: 'Recebimento do Client ID de homologação e apontamento do callback em domínio governamental (.gov.br ou subdomínio do projeto).'
        },
        {
          numero: 4,
          titulo: 'Bateria de validação de confiabilidade',
          descricao: 'Testar fluxos com contas de teste Bronze, Prata e Ouro fornecidas no manual do integrador.'
        },
        {
          numero: 5,
          titulo: 'Homologação final e liberação em Produção',
          descricao: 'Envio de evidências e gravação de tela para a equipe da SGD validar e liberar as credenciais finais.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: 'PRÉ-REQUISITO FUNDAMENTAL: A API "Assinatura gov.br" depende 100% da homologação prévia do Login gov.br.',
      preRequisitos: [
        'Domínio da aplicação precisa ter certificado SSL/TLS válido.',
        'Se o projeto for estadual, verificar se o órgão possui Termo de Adesão ao gov.br vigente com o MGI.'
      ],
      apisVinculadasIds: ['assinatura-gov'],
      contasRequeridas: 'Conta Gov.br para os gestores e desenvolvedores cadastrados'
    },
    macetes: [
      {
        id: 'm-login-1',
        autor: 'Equipe técnica',
        cargo: 'Equipe técnica',
        data: '28/09/2026',
        conteudo: 'No ambiente de testes (sso.staging), você NÃO pode usar seu CPF real! Use sempre a planilha de CPFs fictícios do manual oficial do MGI (iniciados com 999.xxx).'
      },
      {
        id: 'm-login-2',
        autor: 'Equipe YouX',
        cargo: 'Equipe YouX',
        data: '18/10/2026',
        conteudo: 'Adicione na tela de boas-vindas do sistema um aviso visual explicando a diferença de conta Bronze para Prata/Ouro. Isso reduz pela metade os chamados de suporte.'
      }
    ],
    historico: [
      {
        id: 'h-login-1',
        data: '18/10/2026',
        responsavel: 'Equipe YouX',
        descricao: 'Homologado suporte a PKCE obrigatório conforme nova diretriz de segurança MGI 2026.'
      }
    ]
  },
  {
    id: 'assinatura-gov',
    nome: 'Assinatura gov.br',
    sigla: 'Assinatura gov.br',
    orgao: 'SGD / ITI',
    orgaoNomeCompleto: 'Secretaria de Governo Digital / Instituto Nacional de Tecnologia da Informação',
    descricaoSimples: 'Assinatura eletrônica avançada de documentos PDF com validade jurídica oficial pelo gov.br.',
    conectaGov: true,
    categorias: ['Autenticação', 'Órgãos federais'],
    dificuldade: 'Burocrática',
    dificuldadeMotivo: 'Depende de Login gov.br ativo, conta nível Prata ou Ouro do usuário e adesão ao Decreto 10.543/2020.',
    verificadoEm: '22/10/2026',
    verificadoPor: 'Equipe YouX',
    visaoGeral: {
      oQueFaz: 'Permite ao cidadão assinar digitalmente termos de adesão, contratos e laudos do projeto público com força jurídica garantida por lei federal, sem precisar comprar certificado ICP-Brasil pago.',
      dadosEntrada: [
        'Hash criptográfico SHA-256 do documento PDF a ser assinado',
        'Token de autorização do Login gov.br do signatário',
        'Posição visual da assinatura no PDF (coordenadas x, y, página)'
      ],
      dadosRetornados: [
        { campo: 'hash_assinado', descricao: 'Hash com assinatura criptográfica assimétrica' },
        { campo: 'certificado_pades', descricao: 'Envelope criptográfico PAdES para incorporação no PDF' },
        { campo: 'carimbo_tempo', descricao: 'Timestamp oficial emitido pela autoridade do ITI' },
        { campo: 'dados_signatario', descricao: 'Nome e CPF vinculados à assinatura eletrônica' }
      ],
      exemplosFormulario: [
        'Assinatura do Termo de Adesão ao PSA pelo Produtor Rural',
        'Assinatura do Laudo de Vistoria de Campo pelo Fiscal Ambiental',
        'Homologação de Pagamento pelo Ordenador de Despesa'
      ],
      linkDocumentacao: 'https://manual-integracao-assinador.servicos.gov.br/',
      linkSwagger: 'https://assinador.staging.iti.br/swagger-ui.html',
      padraoAutenticacao: 'OAuth 2.0 (Escopo específico de assinatura delegado pelo Login gov.br)'
    },
    comoConseguirAcesso: {
      quemSolicita: 'Cliente',
      quemSolicitaDetalhes: 'O órgão público precisa enviar ofício fundamentado à SGD/MGI justificando a aplicação da Lei 14.063/2020.',
      anexosAssinaturas: [
        'Ofício assinado pelo dirigente máximo do órgão solicitando permissão de assinador',
        'Justificativa legal do processo administrativo amparado na Lei nº 14.063/2020',
        'Código do Client ID de Login gov.br já homologado e em produção'
      ],
      prazoEstimadoFaixa: '20 a 40 dias úteis',
      prazoMinDias: 20,
      prazoMaxDias: 40,
      ambientes: {
        homologacao: 'https://assinador.staging.iti.br/api/v1',
        producao: 'https://assinador.iti.br/api/v1'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Validar pré-requisito: Login gov.br aprovado',
          descricao: 'Confirmar que o Client ID do Login gov.br está ativo e configurado com escopos governamentais.'
        },
        {
          numero: 2,
          titulo: 'Elaboração e envio do Ofício ao MGI/ITI',
          descricao: 'Elaborar documento apontando que o sistema realiza assinatura de termos de compromisso de serviços ambientais.'
        },
        {
          numero: 3,
          titulo: 'Habilitação do escopo "sign" no Portal do Integrador',
          descricao: 'Equipe do ITI habilita a permissão de assinador avançado na credencial do projeto.'
        },
        {
          numero: 4,
          titulo: 'Implementação de Assinatura por Hash SHA-256',
          descricao: 'Desenvolver a montagem do container PAdES com carimbo de tempo sem trafegar arquivos inteiros.'
        },
        {
          numero: 5,
          titulo: 'Validação jurídica e teste de conformidade ITI',
          descricao: 'Submeter PDF assinado para validação no site https://validar.iti.gov.br e arquivar comprovante.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: '⚠️ ATENÇÃO MÁXIMA: Usuários com conta gov.br nível BRONZE não conseguem assinar! Apenas contas PRATA ou OURO têm validade legal para assinatura eletrônica avançada.',
      preRequisitos: [
        'Login gov.br devidamente homologado e em produção.',
        'Módulo frontend para instruir o cidadão a subir de nível de conta se for Bronze.',
        'Servidor configurado para gerar PDF/A e calcular hash SHA-256.'
      ],
      apisVinculadasIds: ['login-gov'],
      contasRequeridas: 'Conta gov.br nível Prata ou Ouro do cidadão signatário'
    },
    macetes: [
      {
        id: 'm-ass-1',
        autor: 'Equipe técnica',
        cargo: 'Equipe técnica',
        data: '05/10/2026',
        conteudo: 'Nunca envie o arquivo PDF inteiro pela API! Calcule o hash SHA-256 do documento no backend e envie apenas os 64 caracteres hexadecimais. É 100x mais rápido e evita timeout de 30s.'
      },
      {
        id: 'm-ass-2',
        autor: 'Equipe YouX',
        cargo: 'Equipe YouX',
        data: '19/10/2026',
        conteudo: 'Coloque um validador preventivo de nível de conta logo no início do fluxo. Se o cidadão for Bronze, mostre o botão "Subir nível no gov.br via biometria ou banco" antes de abrir o termo.'
      }
    ],
    historico: [
      {
        id: 'h-ass-1',
        data: '22/10/2026',
        responsavel: 'Equipe YouX',
        descricao: 'Revisão das regras de carimbo do tempo conforme resolução mais recente do Comitê Gestor da ICP-Brasil.'
      }
    ]
  },
  {
    id: 'sicar',
    nome: 'SICAR',
    sigla: 'SICAR',
    orgao: 'SFB / MMA',
    orgaoNomeCompleto: 'Serviço Florestal Brasileiro / Ministério do Meio Ambiente e Mudança do Clima',
    descricaoSimples: 'Consulta situação ambiental do imóvel rural, Reserva Legal (RL), APP e polígono no CAR.',
    conectaGov: true,
    categorias: ['Geolocalização', 'Órgãos federais'],
    dificuldade: 'Burocrática',
    dificuldadeMotivo: 'Dados espaciais sensíveis de conformidade ambiental com aprovação pelo Serviço Florestal.',
    verificadoEm: '12/10/2026',
    verificadoPor: 'Equipe de integração',
    visaoGeral: {
      oQueFaz: 'A partir do número de recibo do CAR estadual ou federal, a API retorna a situação do cadastro (Ativo, Pendente, Suspenso), o tamanho da Reserva Legal declarada, Área de Preservação Permanente (APP) e o arquivo vetorial georreferenciado da propriedade.',
      dadosEntrada: [
        'Código de Inscrição no CAR (padrão UF-9999999-XXXX.XXXX...)',
        'CPF ou CNPJ do proprietário/possuidor cadastrado'
      ],
      dadosRetornados: [
        { campo: 'codigo_car', descricao: 'Registro oficial do imóvel no Sistema Nacional de Cadastro Ambiental Rural' },
        { campo: 'status_cadastro', descricao: 'Situação da análise ambiental (Ativo, Pendente de Análise, Suspenso)' },
        { campo: 'area_imovel_ha', descricao: 'Área total do imóvel declarada pelo proprietário' },
        { campo: 'area_reserva_legal_ha', descricao: 'Área destinada à Reserva Legal protegida' },
        { campo: 'area_app_ha', descricao: 'Área de Preservação Permanente (nascentes, margens de rios)' },
        { campo: 'poligono_geojson', descricao: 'Camadas espaciais vetoriais da propriedade e hidrografia' }
      ],
      exemplosFormulario: [
        'Número do Recibo do CAR (UF-XXXXXXX)',
        'Área Elegível de Mata Nativa para Pagamento de PSA (ha)',
        'Polígono da Propriedade sobreposto com Imagens de Satélite'
      ],
      linkDocumentacao: 'https://car.gov.br/api-docs/',
      linkSwagger: 'https://car.gov.br/swagger/api-v1.json',
      padraoAutenticacao: 'Chave de API de Serviço Institucional + Assinatura JWT'
    },
    comoConseguirAcesso: {
      quemSolicita: 'Cliente com apoio YouX',
      quemSolicitaDetalhes: 'O órgão ambiental estadual ou autarquia gestora de recursos hídricos solicita ao Serviço Florestal Brasileiro; a YouX estrutura o pipeline de ingestão espacial.',
      anexosAssinaturas: [
        'Acordo de Cooperação Técnica firmado com o SFB/MMA',
        'Ofício da Secretaria de Meio Ambiente',
        'Termo de Compromisso e Sigilo para tratamento de bases cartográficas',
        'Certidão de Designação de Administradores de Segurança'
      ],
      prazoEstimadoFaixa: '25 a 45 dias úteis',
      prazoMinDias: 25,
      prazoMaxDias: 45,
      ambientes: {
        homologacao: 'https://homologacao.car.gov.br/api/consulta',
        producao: 'https://consultapublica.car.gov.br/api/v1'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Solicitação formal de acesso aos dados espaciais',
          descricao: 'Encaminhar ofício institucional à Coordenação-Geral de Informações Florestais do SFB.'
        },
        {
          numero: 2,
          titulo: 'Análise de finalidade de interesse público',
          descricao: 'SFB avalia se o projeto (ex.: PSA) tem respaldo na Lei de Proteção da Vegetação Nativa (Lei 12.651/2012).'
        },
        {
          numero: 3,
          titulo: 'Publicação de Portaria e Liberação de Chave',
          descricao: 'Publicação no DOU e fornecimento da chave de API e token de acesso federado.'
        },
        {
          numero: 4,
          titulo: 'Calibração de Projeção Cartográfica (SIRGAS 2000)',
          descricao: 'Ajustar conversores de coordenadas e reprojeção de datum para renderização correta no mapa.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: 'Os arquivos de retorno vetoriais podem ser grandes (mais de 15MB para fazendas extensas com múltiplos remanescentes de floresta). Exige compressão e cache espacial.',
      preRequisitos: [
        'Biblioteca de manipulação de GIS (ex.: PostGIS, Turf.js ou GDAL) no backend.',
        'Imprescindível cruzar os dados com o SIGEF para conferir se o proprietário ambiental é o mesmo titular fundiário.'
      ],
      apisVinculadasIds: ['sigef', 'sncr'],
      contasRequeridas: 'Credencial corporativa expedida pelo Serviço Florestal Brasileiro'
    },
    macetes: [
      {
        id: 'm-sicar-1',
        autor: 'Equipe de integração',
        cargo: 'Equipe de integração',
        data: '01/10/2026',
        conteudo: 'Atenção com sistemas de coordenadas: a API do SICAR devolve em SIRGAS 2000 (EPSG:4674). Se você renderizar no Mapbox/Leaflet sem reprojetar para WGS84 Web Mercator (EPSG:3857), o polígono vai parar no meio do oceano!'
      }
    ],
    historico: [
      {
        id: 'h-sicar-1',
        data: '12/10/2026',
        responsavel: 'Equipe de integração',
        descricao: 'Homologação da nova rota GeoJSON unificada do CAR federal.'
      }
    ]
  },
  {
    id: 'sncr',
    nome: 'SNCR',
    sigla: 'SNCR',
    orgao: 'INCRA',
    orgaoNomeCompleto: 'Instituto Nacional de Colonização e Reforma Agrária',
    descricaoSimples: 'Consulta cadastral de imóveis rurais e validação de quitação do CCIR (Certificado de Imóvel Rural).',
    conectaGov: false,
    categorias: ['Cadastro de pessoas', 'Órgãos federais'],
    dificuldade: 'Burocrática',
    dificuldadeMotivo: 'Sistema legado fora do Conecta gov com trâmite via barramento próprio do Incra.',
    verificadoEm: '08/10/2026',
    verificadoPor: 'Equipe YouX',
    visaoGeral: {
      oQueFaz: 'Consulta o código SNCR de 13 dígitos de uma propriedade rural para atestar sua titularidade jurídica, módulo fiscal municipal, fração mínima de parcelamento e quitação da taxa cadastral do CCIR.',
      dadosEntrada: [
        'Código do Imóvel Rural (13 dígitos numéricos)',
        'CPF ou CNPJ do titular declarado'
      ],
      dadosRetornados: [
        { campo: 'codigo_sncr', descricao: 'Identificador nacional de 13 dígitos do imóvel rural' },
        { campo: 'denominacao_imovel', descricao: 'Nome cadastral da fazenda, sítio ou gleba' },
        { campo: 'modulo_fiscal_qtd', descricao: 'Quantidade calculada de módulos fiscais' },
        { campo: 'classificacao_fundiaria', descricao: 'Minifúndio, Pequena, Média ou Grande Propriedade' },
        { campo: 'situacao_ccir', descricao: 'Status de quitação da anuidade cadastral do Incra' }
      ],
      exemplosFormulario: [
        'Código SNCR no Formulário de Inscrição',
        'Enquadramento do Produtor (Agricultura Familiar / Médio Produtor)',
        'Comprovante de Regularidade Cadastral do CCIR'
      ],
      linkDocumentacao: 'https://sncr.serpro.gov.br/documentacao/sncr-api/',
      padraoAutenticacao: 'Certificado Digital de Máquina (ICP-Brasil A1) + Token Corporativo'
    },
    comoConseguirAcesso: {
      quemSolicita: 'Cliente',
      quemSolicitaDetalhes: 'O Estado ou Município precisa peticionar diretamente à presidência do Incra em Brasília.',
      anexosAssinaturas: [
        'Ofício assinado pelo Chefe do Poder Executivo ou Secretário titular',
        'Termo de Adesão ao Barramento SNCR/Incra',
        'Certificado Digital PJ do órgão emitido pela autoridade certificadora federal'
      ],
      prazoEstimadoFaixa: '30 a 50 dias úteis',
      prazoMinDias: 30,
      prazoMaxDias: 50,
      ambientes: {
        homologacao: 'https://sncr-hml.incra.gov.br/ws/v1',
        producao: 'https://sncr.incra.gov.br/ws/v1'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Protocolo formal junto ao Incra Sede',
          descricao: 'Ofício de solicitação encaminhado com minuta do plano operacional.'
        },
        {
          numero: 2,
          titulo: 'Aprovação jurídica na PFE/Incra',
          descricao: 'Parecer da Procuradoria Federal Especializada vinculada à AGU.'
        },
        {
          numero: 3,
          titulo: 'Cadastro de Certificado A1 no Barramento',
          descricao: 'Vincular a chave pública do certificado no servidor de segurança do Incra.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: 'Esta API não faz parte do Conecta gov.br. O tempo de resposta pode variar entre 2 a 5 segundos.',
      preRequisitos: [
        'Código do imóvel precisa ser validado previamente com máscara de 13 dígitos.',
        'Complementar ao SIGEF (SNCR cuida do cadastro jurídico; SIGEF cuida da precisão cartográfica).'
      ],
      apisVinculadasIds: ['sigef'],
      contasRequeridas: 'Certificado ICP-Brasil da entidade pública demandante'
    },
    macetes: [
      {
        id: 'm-sncr-1',
        autor: 'Equipe técnica',
        cargo: 'Equipe técnica',
        data: '14/09/2026',
        conteudo: 'Nunca envie pontos ou traços no código SNCR. Envie a string estritamente limpa com 13 caracteres numéricos, caso contrário o mainframe do Serpro retorna código de erro genérico sem descrição.'
      }
    ],
    historico: [
      {
        id: 'h-sncr-1',
        data: '08/10/2026',
        responsavel: 'Equipe YouX',
        descricao: 'Validação da estrutura de resposta para CCIR eletrônico digital.'
      }
    ]
  },
  {
    id: 'cnpj',
    nome: 'CNPJ Consulta',
    sigla: 'CNPJ Consulta',
    orgao: 'Receita Federal / Serpro',
    orgaoNomeCompleto: 'Secretaria Especial da Receita Federal do Brasil / SERPRO',
    descricaoSimples: 'Consulta cadastral completa de cooperativas, associações rurais e pessoas jurídicas.',
    conectaGov: true,
    categorias: ['Cadastro de pessoas', 'Órgãos federais'],
    dificuldade: 'Fácil',
    dificuldadeMotivo: 'Integração ágil via Conecta gov.br ou APIs públicas credenciadas pela Receita.',
    verificadoEm: '24/10/2026',
    verificadoPor: 'Equipe YouX',
    visaoGeral: {
      oQueFaz: 'Recebe o CNPJ de 14 dígitos e retorna a Razão Social oficial, Nome Fantasia, CNAE principal e secundários, endereço oficial e o Quadro de Sócios e Administradores (QSA).',
      dadosEntrada: [
        'Número do CNPJ (14 dígitos numéricos)'
      ],
      dadosRetornados: [
        { campo: 'razao_social', descricao: 'Razão social registrada na Junta Comercial / Cartório' },
        { campo: 'nome_fantasia', descricao: 'Nome comercial da organização' },
        { campo: 'situacao_cadastral', descricao: 'Situação na Receita (Ativa, Inapta, Suspensa, Baixada)' },
        { campo: 'cnae_fiscal', descricao: 'Código da atividade econômica primária' },
        { campo: 'qsa', descricao: 'Quadro de Sócios e Administradores com qualificações' }
      ],
      exemplosFormulario: [
        'Cadastro de Cooperativas de Produtores Rurais',
        'Conferência do Representante Legal no Estatuto Social',
        'Endereço da Sede da Associação Comunitária'
      ],
      linkDocumentacao: 'https://conecta.gov.br/catalogo-de-servicos/cnpj-v2/docs',
      linkSwagger: 'https://conecta.gov.br/swagger/cnpj-v2.json',
      padraoAutenticacao: 'OAuth 2.0 (Bearer Token via Conecta gov / Serpro)'
    },
    comoConseguirAcesso: {
      quemSolicita: 'YouX ou Cliente',
      quemSolicitaDetalhes: 'Habilitação rápida no painel de APIs do projeto.',
      anexosAssinaturas: [
        'Termo simplificado de consumo cadastral no portal Conecta gov.br'
      ],
      prazoEstimadoFaixa: '3 a 7 dias úteis',
      prazoMinDias: 3,
      prazoMaxDias: 7,
      ambientes: {
        homologacao: 'https://gateway.apiserpro.serpro.gov.br/consulta-cnpj-trial/v2',
        producao: 'https://gateway.apiserpro.serpro.gov.br/consulta-cnpj/v2'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Ativação do serviço no Conecta gov.br',
          descricao: 'Adicionar a API CNPJ Consulta no catálogo de microsserviços do projeto.'
        },
        {
          numero: 2,
          titulo: 'Geração de credenciais de homologação',
          descricao: 'Obter chaves de teste para simulação com CNPJs de cooperativas de teste.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: 'Excelente para automatizar o preenchimento cadastral e evitar erros nos contratos com cooperativas.',
      preRequisitos: [
        'Formatação de CNPJ de 14 dígitos.',
        'Se o cadastro envolver repasse financeiro, cruzar o QSA para validar se o signatário é o presidente atual.'
      ],
      apisVinculadasIds: ['cep-dne'],
      contasRequeridas: 'Conta de desenvolvedor YouX ou credencial Conecta gov'
    },
    macetes: [
      {
        id: 'm-cnpj-1',
        autor: 'Equipe de integração',
        cargo: 'Equipe YouX',
        data: '10/10/2026',
        conteudo: 'Para associações de agricultura familiar, sempre confira a data da última ata de eleição registrada no QSA. Muitas associações operam com mandatos de diretoria vencidos.'
      }
    ],
    historico: [
      {
        id: 'h-cnpj-1',
        data: '24/10/2026',
        responsavel: 'Equipe YouX',
        descricao: 'Verificado suporte a detalhamento do CNAE agrícola 2026.'
      }
    ]
  },
  {
    id: 'cep-dne',
    nome: 'CEP / DNE',
    sigla: 'CEP / DNE',
    orgao: 'Correios / Conecta gov',
    orgaoNomeCompleto: 'Empresa Brasileira de Correios e Telégrafos / Diretório Nacional de Endereços',
    descricaoSimples: 'Preenchimento automático de logradouro, bairro, município, UF e código IBGE a partir do CEP.',
    conectaGov: true,
    categorias: ['Geolocalização', 'Cadastro de pessoas'],
    dificuldade: 'Fácil',
    dificuldadeMotivo: 'API aberta e de rápida implementação técnica com cache simples.',
    verificadoEm: '25/10/2026',
    verificadoPor: 'Equipe YouX',
    visaoGeral: {
      oQueFaz: 'Quando o usuário digita o CEP de 8 dígitos, a API preenche automaticamente a rua, bairro, município e estado, além do código IBGE do município.',
      dadosEntrada: [
        'CEP de 8 dígitos numéricos (sem hífen)'
      ],
      dadosRetornados: [
        { campo: 'logradouro', descricao: 'Nome da rua, avenida ou rodovia' },
        { campo: 'bairro', descricao: 'Bairro ou distrito' },
        { campo: 'localidade', descricao: 'Nome oficial do município' },
        { campo: 'uf', descricao: 'Sigla do Estado da Federação (2 letras)' },
        { campo: 'ibge', descricao: 'Código de 7 dígitos do município no IBGE (fundamental para relatórios)' }
      ],
      exemplosFormulario: [
        'Endereço de Notificação do Produtor Rural',
        'Identificação do Município para Regras de Negócio e Zoneamento',
        'Código IBGE para Carga em Sistemas Contábeis Públicos'
      ],
      linkDocumentacao: 'https://conecta.gov.br/catalogo-de-servicos/cep-dne/docs',
      padraoAutenticacao: 'API Key padrão ou Bearer Token público'
    },
    comoConseguirAcesso: {
      quemSolicita: 'YouX',
      quemSolicitaDetalhes: 'Desenvolvimento direto pela YouX; não exige ofício burocrático do cliente.',
      anexosAssinaturas: [
        'Adesão direta no portal técnico'
      ],
      prazoEstimadoFaixa: '1 a 3 dias úteis',
      prazoMinDias: 1,
      prazoMaxDias: 3,
      ambientes: {
        homologacao: 'https://conecta.gov.br/api/cep/sandbox',
        producao: 'https://conecta.gov.br/api/cep/v1'
      },
      passos: [
        {
          numero: 1,
          titulo: 'Ativar credencial no gateway da YouX',
          descricao: 'Provisionar chave de consulta no ambiente de desenvolvimento.'
        },
        {
          numero: 2,
          titulo: 'Configurar cache local Redis/Memcached',
          descricao: 'Evitar consultas repetidas para CEPs idênticos no sistema.'
        }
      ]
    },
    antesDeUsar: {
      avisoDestaque: 'Em áreas rurais ou pequenos municípios, o CEP pode ser único para toda a cidade (terminado em -000).',
      preRequisitos: [
        'Manter o campo de Logradouro e Bairro editável pelo usuário caso a localidade possua apenas CEP geral.'
      ],
      apisVinculadasIds: [],
      contasRequeridas: 'Chave de gateway YouX'
    },
    macetes: [
      {
        id: 'm-cep-1',
        autor: 'Equipe YouX',
        cargo: 'Equipe YouX',
        data: '05/10/2026',
        conteudo: 'Em projetos rurais, cerca de 40% dos municípios têm CEP único com logradouro em branco. Se o formulário travar os campos de texto como "somente leitura" no autopreenchimento, o produtor não conseguirá completar o cadastro!'
      }
    ],
    historico: [
      {
        id: 'h-cep-1',
        data: '25/10/2026',
        responsavel: 'Equipe YouX',
        descricao: 'Sincronizada base de tabelas do IBGE 2026.'
      }
    ]
  }
];

export const PROJETOS_MOCK: Projeto[] = [
  {
    id: 'psa-florestal',
    nome: 'PSA – Pagamento por Serviços Ambientais',
    sigla: 'PSA',
    cliente: 'Secretaria Estadual de Meio Ambiente e Recursos Hídricos (SEMARH)',
    descricao: 'Plataforma estadual de adesão, habilitação fundiária, monitoramento satelital e remuneração financeira de produtores rurais que conservam nascentes e áreas de Reserva Legal.',
    responsavel: 'Equipe YouX',
    sprints: [
      { id: 1, nome: 'Sprint 1', dataInicio: '2026-11-03', dataFim: '2026-11-16', meta: 'Cadastro inicial do produtor e endereço' },
      { id: 2, nome: 'Sprint 2', dataInicio: '2026-11-17', dataFim: '2026-11-30', meta: 'Login unificado do cidadão e perfil gov.br' },
      { id: 3, nome: 'Sprint 3', dataInicio: '2026-12-01', dataFim: '2026-12-14', meta: 'Validação ambiental do imóvel e polígonos CAR' },
      { id: 4, nome: 'Sprint 4', dataInicio: '2026-12-15', dataFim: '2026-12-28', meta: 'Assinatura digital do termo de compromisso' },
      { id: 5, nome: 'Sprint 5', dataInicio: '2027-01-05', dataFim: '2027-01-18', meta: 'Certificação fundiária no Incra e pagamento' }
    ],
    plano: [
      {
        id: 'plano-1',
        apiId: 'cep-dne',
        apiNome: 'CEP / DNE',
        apiOrgao: 'Correios / Conecta gov',
        funcionalidadeCampo: 'Preenchimento automático do endereço residencial e código IBGE do produtor rural',
        sprintId: 1,
        prazoEstimadoFaixa: '1 a 3 dias úteis',
        prazoMaxDias: 3,
        dataLimiteSolicitacao: '2026-10-26', // Calculada: início 03/11 - 3 dias úteis - 5 folga
        status: 'Produção',
        responsavel: 'Equipe de integração',
        risco: 'verde',
        riscoMotivo: 'API homologada e em produção no ambiente de teste e desenvolvimento.'
      },
      {
        id: 'plano-2',
        apiId: 'cpf-luz',
        apiNome: 'CPF Luz',
        apiOrgao: 'Receita Federal / Serpro',
        funcionalidadeCampo: 'Validação cadastral de CPF e conferência de nome oficial contra a Receita Federal',
        sprintId: 1,
        prazoEstimadoFaixa: '5 a 10 dias úteis',
        prazoMaxDias: 14,
        dataLimiteSolicitacao: '2026-10-15',
        status: 'Homologação',
        responsavel: 'Equipe YouX',
        risco: 'verde',
        riscoMotivo: 'Chaves de teste recebidas e validadas no gateway; aguardando virada para produção na Sprint 1.'
      },
      {
        id: 'plano-3',
        apiId: 'login-gov',
        apiNome: 'Login gov.br',
        apiOrgao: 'MGI / SGD',
        funcionalidadeCampo: 'Acesso único do cidadão ao portal de adesão e leitura do nível de confiabilidade da conta',
        sprintId: 2,
        prazoEstimadoFaixa: '10 a 20 dias úteis',
        prazoMaxDias: 28,
        dataLimiteSolicitacao: '2026-10-15',
        status: 'Em solicitação',
        responsavel: 'Equipe YouX',
        risco: 'amarelo',
        riscoMotivo: 'FSI submetido ao MGI; previsão de entrega de credenciais de teste em 05/11. No limite da margem de segurança.'
      },
      {
        id: 'plano-4',
        apiId: 'sicar',
        apiNome: 'SICAR',
        apiOrgao: 'SFB / MMA',
        funcionalidadeCampo: 'Consulta de Reserva Legal, APP e polígono ambiental do imóvel para cálculo do benefício financeiro',
        sprintId: 3,
        prazoEstimadoFaixa: '25 a 45 dias úteis',
        prazoMaxDias: 60,
        dataLimiteSolicitacao: '2026-09-27', // Ultrapassada!
        status: 'Em solicitação',
        responsavel: 'Equipe de integração',
        risco: 'vermelho',
        riscoMotivo: 'Atraso crítico: data-limite de solicitação estourada em 29 dias e ofício ainda aguarda despacho no Ministério!'
      },
      {
        id: 'plano-5',
        apiId: 'assinatura-gov',
        apiNome: 'Assinatura gov.br',
        apiOrgao: 'SGD / ITI',
        funcionalidadeCampo: 'Assinatura eletrônica avançada do Termo de Compromisso e Pagamento pelo produtor e Secretário',
        sprintId: 4,
        prazoEstimadoFaixa: '20 a 40 dias úteis',
        prazoMaxDias: 56,
        dataLimiteSolicitacao: '2026-10-15', // Ultrapassada!
        status: 'Não solicitada',
        dependeDeApiId: 'login-gov',
        responsavel: 'Equipe YouX',
        risco: 'vermelho',
        riscoMotivo: 'Urgência máxima: depende da aprovação do Login gov.br (Sprint 2) para ser solicitada, e o prazo máximo é de até 40 dias úteis!'
      },
      {
        id: 'plano-6',
        apiId: 'sigef',
        apiNome: 'SIGEF',
        apiOrgao: 'INCRA',
        funcionalidadeCampo: 'Conferência de sobreposição fundiária e limites georreferenciados da propriedade rural certificada',
        sprintId: 5,
        prazoEstimadoFaixa: '30 a 60 dias úteis',
        prazoMaxDias: 80,
        dataLimiteSolicitacao: '2026-10-12', // Ultrapassada para início em 05/01/2027
        status: 'Não solicitada',
        responsavel: 'Equipe técnica',
        risco: 'amarelo',
        riscoMotivo: 'Minuta de ofício pronta para coleta de assinatura do Secretário. Risco de impactar a Sprint 5 se não protocolado esta semana.'
      }
    ]
  },
  {
    id: 'portal-regularizacao',
    nome: 'PRA – Portal de Regularização Ambiental',
    sigla: 'PRA',
    cliente: 'Instituto de Terras e Meio Ambiente (ITERRA)',
    descricao: 'Sistema estadual de conciliação de passivos de Reserva Legal e compensação de áreas desmatadas.',
    responsavel: 'Equipe YouX',
    sprints: [
      { id: 1, nome: 'Sprint 1', dataInicio: '2026-11-10', dataFim: '2026-11-23', meta: 'Estruturação de cadastro' },
      { id: 2, nome: 'Sprint 2', dataInicio: '2026-11-24', dataFim: '2026-12-07', meta: 'Mapeamento ambiental' }
    ],
    plano: [
      {
        id: 'plano-pra-1',
        apiId: 'cnpj',
        apiNome: 'CNPJ Consulta',
        apiOrgao: 'Receita Federal / Serpro',
        funcionalidadeCampo: 'Identificação de empresas e agroindústrias autuadas',
        sprintId: 1,
        prazoEstimadoFaixa: '3 a 7 dias úteis',
        prazoMaxDias: 10,
        dataLimiteSolicitacao: '2026-10-26',
        status: 'Homologação',
        responsavel: 'Equipe YouX',
        risco: 'verde',
        riscoMotivo: 'API no prazo e já em fase final de homologação.'
      }
    ]
  }
];

export const TEMPLATES_DOCUMENTO = {
  oficioCliente: {
    titulo: 'Minuta de Ofício para Solicitação de Acesso a API Pública',
    tipo: 'oficio',
    descricao: 'Modelo formal para ser assinado pelo Secretário ou Diretor do órgão público contratante e enviado ao Ministério ou órgão gestor da API.',
    gerarTexto: (dados: {
      orgaoDestinatario: string;
      gestorNome: string;
      gestorCargo: string;
      orgaoClienteNome: string;
      projetoNome: string;
      apisSelecionadas: ApiItem[];
      justificativa: string;
      observacoesTecnicas: string;
    }) => {
      const dataHojeFormatada = '26 de outubro de 2026';
      const apisNomes = dados.apisSelecionadas.map(a => `${a.nome} (${a.orgao})`).join(', ');
      
      const tabelaApis = dados.apisSelecionadas.map((api, idx) => `
${idx + 1}. API: ${api.nome} (${api.orgaoNomeCompleto})
   • Finalidade no Projeto: ${api.descricaoSimples}
   • Padrão de Integração Requerido: ${api.visaoGeral.padraoAutenticacao}
   • Ambientes Solicitados: Homologação e Produção
   • Responsável Técnico YouX: ${api.verificadoPor}
`).join('');

      return `OFÍCIO Nº [NÚMERO DO OFÍCIO]/2026
Local e Data: [Cidade do Cliente] - [UF], ${dataHojeFormatada}.

A Sua Excelência / Ao Senhor(a):
${dados.orgaoDestinatario || '[Nome e Cargo da Autoridade no Órgão Federal Gestor da API]'}
Endereço Institucional: [Ministério / Autarquia Gestora]
Brasília - DF

Assunto: Solicitação de interoperabilidade técnica e concessão de credenciais de acesso às APIs: ${apisNomes}.

Senhor(a) Gestor(a),

1. Cumprimentando-o(a) cordialmente, dirijo-me a Vossa Senhoria em nome da ${dados.orgaoClienteNome || '[Nome da Secretaria / Órgão Público Contratante]'}, para solicitar a habilitação de interoperabilidade de dados e o fornecimento de credenciais de integração sistêmica aos serviços tecnológicos gerenciados por este órgão, no âmbito da implantação do projeto "${dados.projetoNome || 'Projeto Estratégico'}".

2. A presente solicitação fundamenta-se nos princípios de eficiência, economicidade e desburocratização administrativa previstos na Lei Federal nº 14.129/2021 (Governo Digital) e no Decreto Federal nº 10.332/2020, visando assegurar a continuidade e a efetividade das políticas públicas de interesse coletivo.

3. Detalhamento dos serviços e APIs necessários:
${tabelaApis}

4. Justificativa da Utilização:
${dados.justificativa || 'Os dados solicitados serão consumidos exclusivamente com a finalidade de validação cadastral, segurança jurídica e verificação de conformidade no âmbito dos processos operacionais do projeto, observando-se integralmente as diretrizes da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).'}

5. Informações Técnicas e Contatos:
Para fins de alinhamento operacional, parametrização de segurança (troca de chaves, certificados mTLS e whitelisting de IPs) e homologação dos fluxos de dados, indicamos como interlocutora técnica a equipe especializada de engenharia da empresa parceira de tecnologia (YouX Group):
• Responsável Técnico: ${dados.gestorNome || 'Equipe de Interoperabilidade YouX'}
• Cargo / Função: ${dados.gestorCargo || 'Gestão de Integrações e Produtos GovTech'}
• E-mail Institucional: interoperabilidade@youxgroup.com.br
• Endereço de IP de Saída (Egress Staging): 34.125.102.14 / 34.125.102.15

${dados.observacoesTecnicas ? `6. Observações Complementares:\n${dados.observacoesTecnicas}\n` : ''}
Certos de contar com vossa costumeira colaboração e deferimento para o fortalecimento da gestão pública digital, renovamos nossos protestos de elevada estima e consideração.

Atenciosamente,


______________________________________________________
[NOME DA AUTORIDADE PÚBLICA SOLICITANTE]
[Cargo - Secretário de Estado / Diretor-Presidente]
${dados.orgaoClienteNome || '[Órgão Contratante]'}
`;
    }
  },
  fichaTecnicaDev: {
    titulo: 'Ficha Técnica de Integração para Desenvolvedores',
    tipo: 'tecnico',
    descricao: 'Especificação técnica direta e sem enrolação para o desenvolvedor backend/frontend implementar a chamada, tratar erros e validar payloads.',
    gerarTexto: (dados: {
      orgaoDestinatario: string;
      gestorNome: string;
      gestorCargo: string;
      orgaoClienteNome: string;
      projetoNome: string;
      apisSelecionadas: ApiItem[];
      justificativa: string;
      observacoesTecnicas: string;
    }) => {
      const dataHojeFormatada = '26/10/2026';
      
      const secoesApis = dados.apisSelecionadas.map(api => `
================================================================================
API: ${api.nome} (${api.orgao})
================================================================================
1. DADOS GERAIS
• Órgão Mantenedor: ${api.orgaoNomeCompleto}
• Integração Conecta gov.br: ${api.conectaGov ? 'SIM (Via Catálogo Federal)' : 'NÃO (Barramento Direto do Órgão)'}
• Padrão de Autenticação: ${api.visaoGeral.padraoAutenticacao}
• Documentação Oficial: ${api.visaoGeral.linkDocumentacao}
${api.visaoGeral.linkSwagger ? `• OpenAPI / Swagger: ${api.visaoGeral.linkSwagger}` : ''}
• Ambientes Disponíveis:
  - Homologação: ${api.comoConseguirAcesso.ambientes.homologacao}
  - Produção: ${api.comoConseguirAcesso.ambientes.producao}

2. PARÂMETROS DE ENTRADA (PAYLOAD / QUERY)
${api.visaoGeral.dadosEntrada.map(e => `  [ ] ${e}`).join('\n')}

3. CAMPOS RETORNADOS MAPEADOS
${api.visaoGeral.dadosRetornados.map(r => `  • ${r.campo.padEnd(26)} -> ${r.descricao}`).join('\n')}

4. PRÉ-REQUISITOS E REGRAS DE NEGÓCIO BLOQUEANTES
${api.antesDeUsar.avisoDestaque ? `  [!] ATENÇÃO: ${api.antesDeUsar.avisoDestaque}` : ''}
${api.antesDeUsar.preRequisitos.map(p => `  • ${p}`).join('\n')}
${api.antesDeUsar.apisVinculadasIds.length > 0 ? `  • APIs com dependência técnica encadeada: ${api.antesDeUsar.apisVinculadasIds.join(', ')}` : ''}

5. MACETES DA EQUIPE (PROD / HOMOLOG)
${api.macetes.map(m => `  [Dica - ${m.autor} em ${m.data}]:
  "${m.conteudo}"`).join('\n\n')}

6. CHECKLIST DE TESTE DE HOMOLOGAÇÃO
  [ ] Variáveis de ambiente configuradas no .env (CLIENT_ID, CLIENT_SECRET, BASE_URL)
  [ ] Tratamento de timeout configurado (máximo recomendado: 15s com fallback elegante)
  [ ] Sanitização dos parâmetros de entrada aplicada antes do envio
  [ ] Sanitização e anonimização de logs conforme LGPD (nunca logar token de autenticação completo)
  [ ] Implementação de cache de resposta onde aplicável para economia de cota
`).join('\n');

      return `FICHA TÉCNICA DE INTEGRAÇÃO — YOUX GOVTECH
Projeto: ${dados.projetoNome}
Data de Emissão: ${dataHojeFormatada}
Emissor: ${dados.gestorNome} (${dados.gestorCargo})
Status do Documento: Homologado para Desenvolvimento

${secoesApis}

--------------------------------------------------------------------------------
OBSERVAÇÕES TÉCNICAS COMPLEMENTARES:
${dados.observacoesTecnicas || 'Nenhuma observação complementar registrada. Em caso de dúvidas sobre credenciais, consulte a documentação técnica da API.'}
--------------------------------------------------------------------------------
`;
    }
  }
};
