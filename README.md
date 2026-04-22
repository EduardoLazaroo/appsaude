# Newsletter & Conteúdo de Saúde Preventiva

MVP de central de conteúdo para gerar posts de saúde preventiva com Notion + OpenAI.

## Estrutura

- `app/page.tsx` — interface simples para buscar ideias, gerar textos e aprovar posts
- `app/api/ideas/route.ts` — lista páginas do Notion filtradas por status
- `app/api/generate/route.ts` — gera texto via OpenAI e atualiza o Notion
- `app/api/approve/route.ts` — marca post como aprovado
- `lib/notion.ts` — funções de leitura e atualização do Notion
- `lib/openai.ts` — gerador de post com prompt de prevenção e linguagem acessível

## Notion - base mínima necessária

Crie um database com as seguintes propriedades:

- `Tema` (title)
- `Subtema` (rich text)
- `Status` (select: Ideia, Gerado, Aprovado, Postado)
- `Texto` (rich text)
- `Tipo` (select: Base, Atualidade)
- `Data Postagem` (date)
- `Tags` (multi-select)
- `Created` (created_time) — usado para ordenar

## Como usar

1. Copie `.env.example` para `.env`
2. Preencha `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `OPENAI_API_KEY` e `ADMIN_TOKEN`
3. Rode:
   - `npm install`
   - `npm run dev`
4. Abra `http://localhost:3000`

## Segurança (IMPORTANTE)

As rotas `api/*` exigem o header `x-admin-token` com o valor do seu `ADMIN_TOKEN`.
Sem isso, o app pode ser abusado para gerar custo de OpenAI/Notion.

## Fluxo MVP

1. O sistema puxa ideias com `Status = Ideia | Gerado | Aprovado`
2. Clique `Gerar` para produzir texto via IA
3. Clique `Aprovar` para marcar como aprovado
4. Clique `Copiar` para colar no LinkedIn

## Observações

- A publicação final continua manual, com revisão humana.
- A geração evita temas recentes e mantém foco em prevenção e rotina.
