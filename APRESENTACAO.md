# Apresentação Profissional — Plataforma AppSaúde

## Identidade e Proposta de Valor

O **AppSaúde** é uma plataforma de gestão editorial e curadoria inteligente focada na produção ética de comunicados de saúde preventiva para o ambiente corporativo. Desenvolvido em **Next.js 14 (App Router)**, **TypeScript**, **Notion API** (como Headless CMS) e **OpenAI (GPT-4o-mini)**, o sistema estrutura uma esteira de conteúdo orientada pelo paradigma **Human-in-the-Loop**, assegurando que nenhuma recomendação médica ou sanitária seja veiculada sem validação clínica prévia.

Diferenciais competitivos:
- **Curadoria Ativa de Fontes Oficiais**: Ingestão automatizada de notícias e boletins globais via feeds RSS da Organização Mundial da Saúde (OMS / who.int).
- **Guardrails Clínicos Estritos**: Persona da Enfermeira Isabela parametrizada com proibições categóricas de menção a medicamentos, vacinas, diagnósticos à distância e alarmismo, exigindo formatação fixa em 5 blocos orientativos.
- **Headless CMS com Notion**: Gestão visual do pipeline editorial com controle de estados (`Ideia`, `Gerado`, `Aprovado`, `Rejeitado`) e deduplicação semântica de temas para evitar redundância.
- **Segurança em Profundidade**: Rate limiting por endereço IP e autenticação administrativa obrigatória via cabeçalho HTTP `x-admin-token`.

---

## Texto Estruturado para Publicação / Portfólio

> A comunicação preventiva em saúde corporativa exige um equilíbrio delicado entre agilidade editorial e responsabilidade técnico-sanitária. O **AppSaúde** foi projetado para resolver esse desafio combinando curadoria em tempo real de feeds oficiais da OMS com geração assistida por IA sob **guardrails éticos rigorosos**. Construída em **Next.js 14**, a plataforma integra a API da OpenAI sob o modelo *Human-in-the-Loop*, delegando a persistência e governança editorial ao **Notion** como Headless CMS. Nenhum comunicado é veiculado sem o crivo humano de um profissional de saúde, demonstrando como alinhar inteligência artificial generativa a processos regulatórios sensíveis com foco em prevenção e bem-estar no trabalho.

---

## Resultados da Validação Real

- **Compilação de Produção**: Build do Next.js 14 executado com sucesso (100% dos pacotes e 10 páginas/rotas geradas).
- **Curadoria RSS ao Vivo**: Leitura real e estruturada do feed da OMS (`https://www.who.int/rss-feeds/news-english.xml`), capturando artigos recentes com títulos, datas e snippets.
- **Auditoria de Segurança da API**: Validação automatizada de bloqueio `HTTP 401 Unauthorized` na ausência do token administrativo (`x-admin-token`), confirmando a proteção de custos e integridade de endpoints.

---

## Evidências Visuais e Técnicas

1. **Diagrama Arquitetural da Plataforma**: [`evidencias/arquitetura_editorial_saude.png`](evidencias/arquitetura_editorial_saude.png)
2. **Máquina de Estados e Guardrails Clínicos**: [`evidencias/ciclo_vida_editorial_guardrails.png`](evidencias/ciclo_vida_editorial_guardrails.png)
3. **Registro de Testes e Curadoria RSS Real**: [`evidencias/log_execucao_real.txt`](evidencias/log_execucao_real.txt)
