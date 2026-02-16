export interface ChecklistItem {
  id: string
  question: string
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
      { id: "intro-01", question: "O tema da pesquisa está claramente delimitado?" },
      { id: "intro-02", question: "O problema de pesquisa está formulado de forma clara e objetiva?" },
      { id: "intro-03", question: "A contextualização apresenta o cenário geral do tema?" },
      { id: "intro-04", question: "Há indicação da relevância acadêmica e/ou social do estudo?" },
      { id: "intro-05", question: "A estrutura do trabalho é apresentada ao final da introdução?" },
      { id: "intro-06", question: "A linguagem utilizada é impessoal e acadêmica (NBR 15287)?" },
    ],
  },
  {
    id: "justificativa",
    title: "Justificativa",
    description: "Avaliação da justificativa e motivação do projeto",
    items: [
      { id: "just-01", question: "A justificativa apresenta argumentos que sustentam a importância do tema?" },
      { id: "just-02", question: "Há menção à lacuna no conhecimento que a pesquisa pretende preencher?" },
      { id: "just-03", question: "São apresentadas contribuições esperadas (teórica, prática ou social)?" },
      { id: "just-04", question: "A justificativa está apoiada em dados ou referências bibliográficas?" },
      { id: "just-05", question: "A viabilidade do estudo é brevemente mencionada?" },
      { id: "just-06", question: "A justificativa diferencia o trabalho de pesquisas anteriores similares?" },
    ],
  },
  {
    id: "objetivos",
    title: "Objetivos",
    description: "Avaliação dos objetivos geral e específicos",
    items: [
      { id: "obj-01", question: "O objetivo geral está formulado com verbo no infinitivo?" },
      { id: "obj-02", question: "O objetivo geral é coerente com o problema de pesquisa?" },
      { id: "obj-03", question: "Os objetivos específicos desdobram o objetivo geral em etapas?" },
      { id: "obj-04", question: "Os objetivos específicos são mensuráveis e alcançáveis?" },
      { id: "obj-05", question: "Há pelo menos 3 objetivos específicos definidos?" },
      { id: "obj-06", question: "Os objetivos específicos seguem uma sequência lógica de execução?" },
    ],
  },
  {
    id: "fundamentacao",
    title: "Fundamentação Teórica",
    description: "Avaliação do referencial teórico e revisão de literatura",
    items: [
      { id: "fund-01", question: "A fundamentação teórica aborda os conceitos-chave do tema?" },
      { id: "fund-02", question: "As fontes utilizadas são confiáveis e atualizadas (últimos 5 anos preferencialmente)?" },
      { id: "fund-03", question: "Há diálogo entre os autores citados (não apenas citações isoladas)?" },
      { id: "fund-04", question: "As citações diretas seguem a NBR 10520 (autor, ano, página)?" },
      { id: "fund-05", question: "As citações indiretas seguem a NBR 10520 (autor, ano)?" },
      { id: "fund-06", question: "A fundamentação está organizada em subseções temáticas coerentes?" },
      { id: "fund-07", question: "Há posicionamento crítico do autor em relação à literatura revisada?" },
    ],
  },
  {
    id: "metodologia",
    title: "Metodologia",
    description: "Avaliação da abordagem metodológica proposta",
    items: [
      { id: "met-01", question: "O tipo de pesquisa está classificado (exploratória, descritiva, explicativa)?" },
      { id: "met-02", question: "A abordagem está definida (qualitativa, quantitativa ou mista)?" },
      { id: "met-03", question: "Os procedimentos de coleta de dados estão descritos?" },
      { id: "met-04", question: "A população/amostra está definida e justificada?" },
      { id: "met-05", question: "Os instrumentos de pesquisa estão descritos (questionário, entrevista, etc.)?" },
      { id: "met-06", question: "O procedimento de análise dos dados está explicado?" },
      { id: "met-07", question: "Há menção a aspectos éticos da pesquisa (quando aplicável)?" },
    ],
  },
  {
    id: "cronograma",
    title: "Cronograma",
    description: "Avaliação do planejamento temporal do projeto",
    items: [
      { id: "cron-01", question: "O cronograma está apresentado em formato de tabela ou quadro?" },
      { id: "cron-02", question: "Todas as etapas do projeto estão contempladas no cronograma?" },
      { id: "cron-03", question: "Os prazos são realistas e compatíveis com a complexidade das atividades?" },
      { id: "cron-04", question: "Há previsão de tempo para revisão e ajustes finais?" },
      { id: "cron-05", question: "O cronograma cobre todo o período previsto para a pesquisa?" },
    ],
  },
  {
    id: "referencias",
    title: "Referências",
    description: "Avaliação das referências bibliográficas conforme ABNT NBR 6023",
    items: [
      { id: "ref-01", question: "As referências estão em ordem alfabética pelo sobrenome do autor (NBR 6023)?" },
      { id: "ref-02", question: "Todas as citações do texto possuem entrada correspondente nas referências?" },
      { id: "ref-03", question: "A formatação segue o padrão NBR 6023:2025 (autor, título, edição, local, editora, ano)?" },
      { id: "ref-04", question: "As referências de meio eletrônico incluem URL e data de acesso?" },
      { id: "ref-05", question: "Há número mínimo adequado de referências para o tipo de trabalho?" },
      { id: "ref-06", question: "As referências incluem fontes primárias (artigos, teses) e não apenas secundárias?" },
    ],
  },
  {
    id: "coerencia",
    title: "Coerência Global",
    description: "Avaliação da coerência e articulação entre as seções do projeto",
    items: [
      { id: "coer-01", question: "Há coerência entre o problema, os objetivos e a metodologia?" },
      { id: "coer-02", question: "O título do trabalho reflete adequadamente o conteúdo proposto?" },
      { id: "coer-03", question: "A fundamentação teórica dá suporte aos objetivos propostos?" },
      { id: "coer-04", question: "O cronograma contempla todas as etapas mencionadas na metodologia?" },
      { id: "coer-05", question: "Há fluxo lógico e progressão entre as seções do projeto?" },
    ],
  },
  {
    id: "escrita",
    title: "Escrita Acadêmica",
    description: "Avaliação da qualidade da escrita e formatação geral",
    items: [
      { id: "esc-01", question: "O texto está redigido em linguagem formal e impessoal?" },
      { id: "esc-02", question: "A ortografia e gramática estão corretas?" },
      { id: "esc-03", question: "Os parágrafos possuem desenvolvimento adequado (não são frases isoladas)?" },
      { id: "esc-04", question: "A formatação geral segue as normas ABNT (margens, fonte, espaçamento)?" },
      { id: "esc-05", question: "Os títulos e subtítulos seguem a hierarquia de numeração da ABNT?" },
      { id: "esc-06", question: "Há uso adequado de conectivos e transições entre parágrafos e seções?" },
    ],
  },
]

export const TOTAL_ITEMS = checklistSections.reduce((acc, s) => acc + s.items.length, 0)
