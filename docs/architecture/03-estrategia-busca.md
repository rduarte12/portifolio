# 03 — Estratégia de Busca

## Opções avaliadas

| Opção | Custo | Latência | Complexidade | Adequação ao volume esperado |
|---|---|---|---|---|
| **Fuse.js client-side** | Zero (roda no browser) | Instantânea após carregar índice | Baixa | Ótima até milhares de documentos |
| Endpoint dedicado de busca (query Cosmos por texto) | RU por cada keystroke/busca | Depende de rede + cold start da Function | Média | Desnecessária no volume atual |
| Azure Cognitive Search (free tier: 50MB, 3 índices) | Zero até o limite gratuito | Baixa, mas com setup de indexador | Alta | Overkill para um portfólio pessoal |

## Recomendação: Fuse.js 100% client-side

- O frontend busca **uma vez** (ao carregar a página de listagem, com cache HTTP) o endpoint `GET /api/search-index`, que retorna um array leve:
  ```json
  [
    { "id": "post_2026_01_...", "type": "research", "title": "...", "summary": "...", "tags": ["nlp", "transformers"] }
  ]
  ```
  Note que o corpo Markdown completo **não** é incluído — reduz o payload para poucos KB mesmo com algumas centenas de posts.
- A busca em si (fuzzy matching sobre `title`, `summary`, `tags`) roda inteiramente no browser via [Fuse.js](https://fusejs.io/), sem round-trip de rede por keystroke.
- **Justificativa de custo**: cada busca não gera RU adicional no Cosmos DB (o índice já foi buscado uma vez e cacheado), e não há cold start de Azure Function a cada tecla digitada — que seria o caso de um endpoint de busca dedicado no plano Consumption.
- **Limite de escala**: adequado até a ordem de milhares de posts (Fuse.js indexa e busca em memória, performance permanece sub-100ms nessa faixa). É mais que suficiente para o caso realista de um portfólio pessoal (RNF05 do documento [02](02-spec-tecnica-dados-api.md): dezenas a poucas centenas de posts).

### Implementação no frontend

- Um hook `useSearchIndex()` busca `/api/search-index` uma vez (com `Cache-Control` de alguns minutos definido na Function), guarda em memória/estado do React.
- Um hook `useFuseSearch(index, query)` instancia `Fuse` com `keys: ["title", "summary", "tags"]` e `threshold` ajustado para tolerar pequenos erros de digitação, retornando os resultados ordenados por relevância.
- A busca substitui o filtro por substring atual em Blog/Projects/Research (hoje quebrado por falta de dados, ver [01](01-auditoria-repositorio.md)), unificada dentro do componente `PostListPage` proposto na auditoria.

## Plano B (extensão futura, não implementar agora)

Se o volume de conteúdo crescer muito além do esperado para um portfólio pessoal (milhares de posts, o que seria atípico), migrar para **Azure Cognitive Search free tier** (50MB de índice, 3 índices, 10k documentos), indexando os posts do Cosmos DB via indexador nativo Cosmos→Cognitive Search. Esta é uma nota de arquitetura para o futuro — não faz parte do escopo de implementação atual.
