export interface ChecklistItem {
  id: string
  question: string
  hint: string
}

export interface ChecklistSection {
  id: string
  title: string
  description: string
  items: ChecklistItem[]
}

export const checklistSections: ChecklistSection[] = [
  {
    id: "introducao",
    title: "Introdução",
    description: "Avaliação da seção introdutória do projeto de pesquisa",
    items: [
      {
        id: "intro-01",
        question: "O tema da pesquisa está claramente delimitado?",
        hint: "Verifique se o aluno partiu de uma área ampla e restringiu progressivamente até chegar a um recorte específico com limites claros (temporal, espacial ou conceitual). Um tema bem delimitado indica exatamente o que será estudado e em qual contexto.",
      },
      {
        id: "intro-02",
        question: "O problema de pesquisa está formulado de forma clara e objetiva?",
        hint: "O problema deve estar expresso em forma de pergunta ou afirmação que evidencie uma lacuna a ser investigada. Avalie se é específico o suficiente para ser respondido pela pesquisa proposta e se evita ambiguidades.",
      },
      {
        id: "intro-03",
        question: "A contextualização apresenta o cenário geral do tema?",
        hint: "Observe se o texto situa o leitor no panorama do assunto, apresentando dados, fatos ou referências que demonstrem a relevância atual do tema. A contextualização deve conduzir naturalmente ao problema de pesquisa.",
      },
      {
        id: "intro-04",
        question: "Há indicação da relevância acadêmica e/ou social do estudo?",
        hint: "Verifique se o aluno explicita por que este estudo importa — seja para avançar o conhecimento científico, seja para gerar impacto prático na sociedade, na área profissional ou em políticas públicas.",
      },
      {
        id: "intro-05",
        question: "A estrutura do trabalho é apresentada ao final da introdução?",
        hint: "É esperado que o último parágrafo da introdução descreva brevemente como o trabalho está organizado (ex.: 'O capítulo 2 apresenta a fundamentação teórica...'). Isso orienta o leitor sobre o que encontrará em cada seção.",
      },
      {
        id: "intro-06",
        question: "A linguagem utilizada é impessoal e acadêmica (NBR 15287)?",
        hint: "Conforme a NBR 15287, o texto deve usar terceira pessoa ou voz passiva (ex.: 'observou-se que...' em vez de 'eu observei...'). Verifique se há trechos coloquiais, gírias ou primeira pessoa do singular.",
      },
    ],
  },
  {
    id: "justificativa",
    title: "Justificativa",
    description: "Avaliação da justificativa e motivação do projeto",
    items: [
      {
        id: "just-01",
        question: "A justificativa apresenta argumentos que sustentam a importância do tema?",
        hint: "Avalie se o texto vai além de opiniões pessoais e apresenta argumentos baseados em evidências, dados estatísticos ou referências teóricas que demonstrem por que o tema merece ser investigado.",
      },
      {
        id: "just-02",
        question: "Há menção à lacuna no conhecimento que a pesquisa pretende preencher?",
        hint: "Verifique se o aluno identificou explicitamente o que ainda não foi suficientemente estudado ou compreendido na área. A lacuna deve conectar-se diretamente ao problema de pesquisa formulado.",
      },
      {
        id: "just-03",
        question: "São apresentadas contribuições esperadas (teórica, prática ou social)?",
        hint: "Observe se o texto indica concretamente o que a pesquisa trará de novo — seja um avanço conceitual, uma aplicação prática, um produto, uma metodologia ou um benefício para determinado grupo social.",
      },
      {
        id: "just-04",
        question: "A justificativa está apoiada em dados ou referências bibliográficas?",
        hint: "Uma boa justificativa não se baseia apenas em impressões pessoais. Verifique se há citações de autores, dados estatísticos, relatórios ou pesquisas anteriores que reforcem os argumentos apresentados.",
      },
      {
        id: "just-05",
        question: "A viabilidade do estudo é brevemente mencionada?",
        hint: "Observe se há alguma indicação de que a pesquisa é realizável considerando tempo, recursos, acesso a dados e competências do pesquisador. Não precisa ser extenso, mas deve demonstrar consciência das condições de execução.",
      },
      {
        id: "just-06",
        question: "A justificativa diferencia o trabalho de pesquisas anteriores similares?",
        hint: "Verifique se o aluno posiciona seu trabalho em relação ao que já existe, mostrando o diferencial — seja na abordagem metodológica, no recorte, no público-alvo ou na perspectiva teórica adotada.",
      },
    ],
  },
  {
    id: "objetivos",
    title: "Objetivos",
    description: "Avaliação dos objetivos geral e específicos",
    items: [
      {
        id: "obj-01",
        question: "O objetivo geral está formulado com verbo no infinitivo?",
        hint: "Objetivos devem começar com verbos como 'analisar', 'investigar', 'compreender', 'desenvolver'. Verifique se o verbo é adequado ao nível da pesquisa — verbos como 'verificar' ou 'constatar' podem ser vagos demais.",
      },
      {
        id: "obj-02",
        question: "O objetivo geral é coerente com o problema de pesquisa?",
        hint: "O objetivo geral deve ser a resposta direta ao problema formulado. Se o problema pergunta 'como X influencia Y?', o objetivo deve ser algo como 'analisar a influência de X sobre Y'. Verifique esse alinhamento.",
      },
      {
        id: "obj-03",
        question: "Os objetivos específicos desdobram o objetivo geral em etapas?",
        hint: "Os objetivos específicos devem funcionar como passos que, juntos, levam ao cumprimento do objetivo geral. Cada um deve abordar uma dimensão ou etapa distinta da pesquisa.",
      },
      {
        id: "obj-04",
        question: "Os objetivos específicos são mensuráveis e alcançáveis?",
        hint: "Avalie se cada objetivo específico pode ser efetivamente verificado ao final da pesquisa. Objetivos vagos como 'entender melhor' são difíceis de mensurar. Prefira formulações como 'identificar os fatores que...' ou 'comparar os índices de...'.",
      },
      {
        id: "obj-05",
        question: "Há pelo menos 3 objetivos específicos definidos?",
        hint: "Projetos de pesquisa acadêmicos geralmente requerem no mínimo 3 objetivos específicos para garantir um desdobramento adequado do objetivo geral. Verifique a quantidade e se cada um é suficientemente distinto.",
      },
      {
        id: "obj-06",
        question: "Os objetivos específicos seguem uma sequência lógica de execução?",
        hint: "Observe se os objetivos estão ordenados de forma progressiva — geralmente do mais básico (levantamento, identificação) para o mais complexo (análise, proposição). Essa sequência deve refletir o percurso metodológico da pesquisa.",
      },
    ],
  },
  {
    id: "fundamentacao",
    title: "Fundamentação Teórica",
    description: "Avaliação do referencial teórico e revisão de literatura",
    items: [
      {
        id: "fund-01",
        question: "A fundamentação teórica aborda os conceitos-chave do tema?",
        hint: "Verifique se todos os termos e conceitos centrais do tema de pesquisa são definidos e discutidos. Os conceitos-chave devem estar diretamente relacionados ao problema e aos objetivos da pesquisa.",
      },
      {
        id: "fund-02",
        question: "As fontes utilizadas são confiáveis e atualizadas (últimos 5 anos preferencialmente)?",
        hint: "Avalie se predominam artigos de periódicos revisados por pares, livros de referência da área e teses/dissertações recentes. Fontes como blogs, Wikipedia ou sites sem autoria identificada não são adequadas. Clássicos da área são exceção à regra dos 5 anos.",
      },
      {
        id: "fund-03",
        question: "Há diálogo entre os autores citados (não apenas citações isoladas)?",
        hint: "Observe se o aluno confronta, complementa ou articula ideias de diferentes autores, em vez de apenas listar citações sequenciais sem conexão. O texto deve demonstrar análise crítica e síntese da literatura.",
      },
      {
        id: "fund-04",
        question: "As citações diretas seguem a NBR 10520 (autor, ano, página)?",
        hint: "Citações diretas com até 3 linhas devem estar entre aspas no corpo do texto; com mais de 3 linhas, em bloco recuado de 4 cm, fonte menor, sem aspas. Em ambos os casos, exige-se indicação de autor, ano e página (NBR 10520).",
      },
      {
        id: "fund-05",
        question: "As citações indiretas seguem a NBR 10520 (autor, ano)?",
        hint: "Citações indiretas (paráfrases) devem indicar autor e ano, mas não exigem número de página. Verifique se o texto claramente parafraseia a ideia do autor sem copiar trechos literais sem aspas.",
      },
      {
        id: "fund-06",
        question: "A fundamentação está organizada em subseções temáticas coerentes?",
        hint: "Verifique se a revisão de literatura está dividida em subtópicos lógicos que progressivamente constroem o embasamento para a pesquisa, em vez de ser um bloco único sem organização interna.",
      },
      {
        id: "fund-07",
        question: "Há posicionamento crítico do autor em relação à literatura revisada?",
        hint: "Observe se o aluno apenas reproduz o que os autores dizem ou se também interpreta, questiona e posiciona-se criticamente. A fundamentação deve mostrar maturidade intelectual e não ser mera compilação.",
      },
    ],
  },
  {
    id: "metodologia",
    title: "Metodologia",
    description: "Avaliação da abordagem metodológica proposta",
    items: [
      {
        id: "met-01",
        question: "O tipo de pesquisa está classificado (exploratória, descritiva, explicativa)?",
        hint: "Verifique se o aluno identifica e justifica o tipo de pesquisa com base em referências metodológicas (Gil, Lakatos, Prodanov). Cada tipo tem características próprias que devem ser coerentes com os objetivos propostos.",
      },
      {
        id: "met-02",
        question: "A abordagem está definida (qualitativa, quantitativa ou mista)?",
        hint: "Observe se a escolha da abordagem é justificada e compatível com o problema de pesquisa. Pesquisas qualitativas focam em compreender fenômenos; quantitativas medem variáveis; mistas combinam ambas.",
      },
      {
        id: "met-03",
        question: "Os procedimentos de coleta de dados estão descritos?",
        hint: "Verifique se está claro como os dados serão obtidos: entrevistas, questionários, observação, análise documental, experimentos, etc. Cada procedimento deve ser descrito com detalhes suficientes para replicação.",
      },
      {
        id: "met-04",
        question: "A população/amostra está definida e justificada?",
        hint: "Avalie se o aluno define quem ou o quê será estudado, o tamanho da amostra e o critério de seleção. A justificativa deve explicar por que essa amostra é representativa ou adequada para os objetivos.",
      },
      {
        id: "met-05",
        question: "Os instrumentos de pesquisa estão descritos (questionário, entrevista, etc.)?",
        hint: "Verifique se os instrumentos são apresentados em detalhe: número de questões, tipo (abertas/fechadas), escala utilizada, roteiro de entrevista, etc. Instrumentos validados devem ter suas fontes referenciadas.",
      },
      {
        id: "met-06",
        question: "O procedimento de análise dos dados está explicado?",
        hint: "Observe se o aluno descreve como os dados coletados serão tratados e interpretados: análise de conteúdo, análise estatística, categorização temática, software utilizado, etc. A técnica deve ser compatível com a abordagem escolhida.",
      },
      {
        id: "met-07",
        question: "Há menção a aspectos éticos da pesquisa (quando aplicável)?",
        hint: "Para pesquisas com seres humanos, verifique se há menção ao Comitê de Ética (CEP), Termo de Consentimento Livre e Esclarecido (TCLE) e garantia de sigilo. Mesmo pesquisas documentais podem exigir considerações éticas.",
      },
    ],
  },
  {
    id: "cronograma",
    title: "Cronograma",
    description: "Avaliação do planejamento temporal do projeto",
    items: [
      {
        id: "cron-01",
        question: "O cronograma está apresentado em formato de tabela ou quadro?",
        hint: "Conforme convenções acadêmicas, o cronograma deve estar em formato visual (tabela ou gráfico de Gantt) com atividades nas linhas e períodos nas colunas. Textos corridos descrevendo prazos não substituem a tabela.",
      },
      {
        id: "cron-02",
        question: "Todas as etapas do projeto estão contempladas no cronograma?",
        hint: "Compare as atividades listadas no cronograma com as etapas descritas na metodologia e nos objetivos específicos. Cada etapa metodológica deve ter correspondência temporal no cronograma.",
      },
      {
        id: "cron-03",
        question: "Os prazos são realistas e compatíveis com a complexidade das atividades?",
        hint: "Avalie se o tempo alocado para cada etapa é razoável. Coleta de dados em campo, por exemplo, geralmente requer mais tempo que a revisão bibliográfica. Períodos muito curtos para etapas complexas indicam planejamento frágil.",
      },
      {
        id: "cron-04",
        question: "Há previsão de tempo para revisão e ajustes finais?",
        hint: "Verifique se o cronograma reserva tempo para revisão do texto, correções sugeridas pelo orientador, formatação final e preparação da defesa. É comum que alunos subestimem esta etapa.",
      },
      {
        id: "cron-05",
        question: "O cronograma cobre todo o período previsto para a pesquisa?",
        hint: "Observe se o cronograma abrange do início das atividades até a entrega/defesa final, sem lacunas temporais. Todos os meses do período do projeto devem ter ao menos uma atividade associada.",
      },
    ],
  },
  {
    id: "referencias",
    title: "Referências",
    description: "Avaliação das referências bibliográficas conforme ABNT NBR 6023",
    items: [
      {
        id: "ref-01",
        question: "As referências estão em ordem alfabética pelo sobrenome do autor (NBR 6023)?",
        hint: "Conforme a NBR 6023:2025, as referências devem ser organizadas em ordem alfabética pelo sobrenome do primeiro autor. Verifique se não há agrupamento por tipo de fonte (livros, artigos, sites) — tudo deve estar em lista única alfabética.",
      },
      {
        id: "ref-02",
        question: "Todas as citações do texto possuem entrada correspondente nas referências?",
        hint: "Confira se cada autor citado no corpo do texto aparece na lista de referências e vice-versa. Referências sem citação correspondente ou citações sem referência são erros frequentes e graves.",
      },
      {
        id: "ref-03",
        question: "A formatação segue o padrão NBR 6023:2025 (autor, título, edição, local, editora, ano)?",
        hint: "Verifique elementos como: sobrenome em maiúsculas, título em itálico/negrito, uso correto de pontuação entre elementos. Cada tipo de fonte (livro, artigo, site) tem formato específico na NBR 6023.",
      },
      {
        id: "ref-04",
        question: "As referências de meio eletrônico incluem URL e data de acesso?",
        hint: "Documentos online devem conter 'Disponível em: URL. Acesso em: dia mês ano.' (NBR 6023). Verifique se as URLs estão completas e se a data de acesso está no formato correto.",
      },
      {
        id: "ref-05",
        question: "Há número mínimo adequado de referências para o tipo de trabalho?",
        hint: "Projetos de pesquisa de graduação geralmente requerem ao menos 15-20 referências; de pós-graduação, 30 ou mais. Avalie se a quantidade é compatível com a profundidade esperada da fundamentação teórica.",
      },
      {
        id: "ref-06",
        question: "As referências incluem fontes primárias (artigos, teses) e não apenas secundárias?",
        hint: "Verifique se há diversidade de fontes: artigos científicos, dissertações, teses, livros especializados — não apenas manuais didáticos ou fontes genéricas. Fontes primárias demonstram aprofundamento na revisão de literatura.",
      },
    ],
  },
  {
    id: "coerencia",
    title: "Coerência Global",
    description: "Avaliação da coerência e articulação entre as seções do projeto",
    items: [
      {
        id: "coer-01",
        question: "Há coerência entre o problema, os objetivos e a metodologia?",
        hint: "Verifique se o problema pergunta algo que os objetivos se propõem a responder e se a metodologia descreve como isso será feito. Esses três elementos formam o 'tripé' do projeto e devem estar perfeitamente alinhados.",
      },
      {
        id: "coer-02",
        question: "O título do trabalho reflete adequadamente o conteúdo proposto?",
        hint: "O título deve ser conciso e indicar o tema, o recorte e, quando possível, a abordagem. Compare o título com o problema e os objetivos — eles devem estar alinhados. Títulos vagos ou genéricos demais indicam falta de delimitação.",
      },
      {
        id: "coer-03",
        question: "A fundamentação teórica dá suporte aos objetivos propostos?",
        hint: "Observe se os conceitos e teorias apresentados na fundamentação são os que o aluno precisará para alcançar seus objetivos. Conceitos abordados mas não utilizados, ou objetivos sem base teórica, indicam incoerência.",
      },
      {
        id: "coer-04",
        question: "O cronograma contempla todas as etapas mencionadas na metodologia?",
        hint: "Compare item a item: cada procedimento descrito na metodologia deve ter um período correspondente no cronograma. Etapas órfãs (sem prazo) ou períodos sem atividade definida revelam desconexão entre as seções.",
      },
      {
        id: "coer-05",
        question: "Há fluxo lógico e progressão entre as seções do projeto?",
        hint: "Leia o projeto como uma narrativa contínua: a introdução prepara o terreno, a justificativa defende a pesquisa, os objetivos direcionam, a fundamentação embasa, a metodologia operacionaliza. Verifique se uma seção conduz naturalmente à próxima.",
      },
    ],
  },
  {
    id: "escrita",
    title: "Escrita Acadêmica",
    description: "Avaliação da qualidade da escrita e formatação geral",
    items: [
      {
        id: "esc-01",
        question: "O texto está redigido em linguagem formal e impessoal?",
        hint: "Verifique se o texto mantém tom acadêmico do início ao fim, sem expressões coloquiais, jargões informais ou primeira pessoa do singular. A impessoalidade pode ser obtida com voz passiva ou terceira pessoa.",
      },
      {
        id: "esc-02",
        question: "A ortografia e gramática estão corretas?",
        hint: "Observe erros recorrentes: concordância verbal e nominal, regência, crase, acentuação e pontuação. Erros frequentes indicam que o texto não passou por revisão cuidadosa. Atenção especial a termos técnicos da área.",
      },
      {
        id: "esc-03",
        question: "Os parágrafos possuem desenvolvimento adequado (não são frases isoladas)?",
        hint: "Cada parágrafo deve ter no mínimo 3-4 frases que desenvolvem uma ideia: tópico frasal, desenvolvimento e conclusão parcial. Parágrafos de uma ou duas frases são superficiais e fragmentam o raciocínio.",
      },
      {
        id: "esc-04",
        question: "A formatação geral segue as normas ABNT (margens, fonte, espaçamento)?",
        hint: "Conforme NBR 15287: margens superior e esquerda de 3 cm, inferior e direita de 2 cm; fonte Times New Roman ou Arial tamanho 12; espaçamento 1,5 entre linhas. Citações longas, notas e referências usam espaçamento simples e fonte menor.",
      },
      {
        id: "esc-05",
        question: "Os títulos e subtítulos seguem a hierarquia de numeração da ABNT?",
        hint: "Verifique a numeração progressiva (1, 1.1, 1.1.1) conforme NBR 6024. Seções primárias em negrito e maiúsculas, secundárias em negrito, terciárias sem negrito. Não deve haver seção com apenas uma subseção (ex.: 2.1 sem 2.2).",
      },
      {
        id: "esc-06",
        question: "Há uso adequado de conectivos e transições entre parágrafos e seções?",
        hint: "Observe se o texto utiliza conectivos que estabelecem relações lógicas entre ideias (adição, contraste, causa, consequência). A ausência de conectivos torna o texto telegráfico; o excesso de 'porém', 'contudo' repetidos empobrece a escrita.",
      },
    ],
  },
]

export const TOTAL_ITEMS = checklistSections.reduce((acc, s) => acc + s.items.length, 0)
