# 02 — Especificação Técnica: Ingestão de Dados, CRUD e Armazenamento

> Documento de engenharia de software para a camada de persistência e API do portfólio. Cobre requisitos, modelagem da solução, modelagem de banco de dados, contratos de API e plano de implementação.

## 2.1 Requisitos

### Requisitos Funcionais

| ID | Descrição |
|---|---|
| RF01 | O sistema deve permitir criar um post (blog, research ou project) via painel admin autenticado. |
| RF02 | O sistema deve permitir editar um post existente (título, resumo, corpo Markdown, tags, imagem). |
| RF03 | O sistema deve permitir deletar um post existente. |
| RF04 | O sistema deve permitir listar posts publicamente, filtráveis por `type` (blog/research/project) e por `tag`, com paginação. |
| RF05 | O sistema deve permitir incrementar o contador de visualizações (`viewsCount`) de um post quando ele é aberto. |
| RF06 | O sistema deve permitir incrementar o contador de curtidas (`likesCount`) de um post, de forma idempotente por visitante (sem múltiplos likes do mesmo visitante). |
| RF07 | O sistema deve permitir consulta reversa por tag: dado um slug de tag, retornar todos os posts relacionados (cross-referência tag → posts). |
| RF08 | O sistema deve manter um índice leve de busca (id, title, summary, tags, type) consultável publicamente para alimentar a busca client-side (ver [03](03-estrategia-busca.md)). |
| RF09 | O sistema deve registrar eventos de acesso (page view, clique em "Read More") para consumo do dashboard de telemetria (ver [04](04-admin-auth-telemetria.md)). |

### Requisitos Não-Funcionais

| ID | Descrição |
|---|---|
| RNF01 | A solução deve operar inteiramente dentro do free tier do Azure Cosmos DB (1000 RU/s provisionados, 25 GB de armazenamento) e do plano de Consumo do Azure Functions (1M execuções/mês grátis). |
| RNF02 | Operações de leitura (GET) devem ser públicas, sem autenticação, para servir visitantes do portfólio. |
| RNF03 | Operações de escrita (POST/PUT/DELETE) devem ser restritas ao usuário admin autenticado via Azure SWA built-in auth (GitHub). |
| RNF04 | Latência de leitura deve ser P95 < 300ms para as queries de listagem (volume baixo justifica esse alvo sem necessidade de cache adicional). |
| RNF05 | Volume de dados esperado: dezenas a poucas centenas de posts no total, dezenas de tags, milhares de eventos de log por mês — dimensionamento de um portfólio pessoal, não de uma plataforma multi-tenant. |
| RNF06 | O corpo Markdown dos posts não deve ser incluído no índice de busca (RF08) nem no payload de listagem (RF04), apenas no `GET /api/posts/{id}` — reduz RU de leitura e tamanho de payload. |
| RNF07 | Contadores (`viewsCount`, `likesCount`) devem ser atualizados sem exigir reescrita do documento inteiro, para minimizar custo de RU em operações de alta frequência relativa. |

## 2.2 Modelagem da solução

Fluxo de alto nível:

```
┌────────────┐      HTTPS       ┌──────────────────────┐      Cosmos SDK     ┌─────────────┐
│  Browser   │ ───────────────► │  Azure Functions API  │ ──────────────────► │  Cosmos DB   │
│ (React SPA │                  │  (/api/*, Consumption) │                     │  (NoSQL,     │
│  no SWA)   │ ◄─────────────── │                        │ ◄────────────────── │  free tier)  │
└────────────┘      JSON        └──────────────────────┘      JSON docs       └─────────────┘
       │                                    │
       │ SWA built-in auth                  │ valida x-ms-client-principal
       │ (/.auth/login/github)              │ para rotas de escrita
       ▼                                    ▼
  Cookie de sessão                   Bloqueia 401/403 se
  gerenciado pelo SWA                não houver role "admin"
```

- **Leitura (visitante lista posts)**: `Browser → GET /api/posts?type=blog → Function lê container posts (query por partition key /type) → retorna JSON → React renderiza FeedCard`. Nenhuma autenticação envolvida.
- **Escrita (admin cria post)**: `Browser (logado via GitHub) → POST /api/posts com header x-ms-client-principal (injetado automaticamente pelo SWA) → Function valida role "admin" → grava documento em posts → atualiza array postRefs no(s) documento(s) de tags correspondentes → retorna 201`.
- A separação física entre estático (SWA) e dinâmico (Functions) é obrigatória no plano free do SWA: ele não hospeda backend custom próprio além da integração "managed functions" (que é exatamente uma Azure Function App vinculada, gratuita até o limite do Consumption plan).

## 2.3 Modelagem do banco de dados (Cosmos DB NoSQL)

Uma única conta Cosmos DB (free tier), um database, três containers:

### Container `posts`

**Partition key: `/type`** — justificativa: quase todas as queries de leitura filtram por seção (`blog`, `research` ou `project`), então colocar todos os posts de um mesmo tipo na mesma partição lógica torna essas queries eficientes (sem fan-out entre partições) e mantém o RU de leitura baixo. Com o volume esperado (RNF05), o tamanho de partição não é um risco (limite físico é 20GB por partition key).

```json
{
  "id": "post_2026_01_attention-is-all-you-need-review",
  "type": "research",
  "title": "Uma releitura crítica de \"Attention Is All You Need\"",
  "summary": "Como o mecanismo de atenção mudou o design de arquiteturas de deep learning.",
  "body": "## Introdução\n\n...(markdown completo)...",
  "tags": ["nlp", "transformers", "deep-learning"],
  "date": "2026-01-14",
  "owner": "Rafael Mendonça Duarte",
  "imgUrl": "/uploads/attention-review-cover.png",
  "link": "/research/attention-is-all-you-need-review",
  "viewsCount": 0,
  "likesCount": 0,
  "showShareButton": true,
  "status": "published",
  "createdAt": "2026-01-14T18:32:00Z",
  "updatedAt": "2026-01-14T18:32:00Z"
}
```

Campos-chave:
- `id`: slug único prefixado por tipo/ano, gerado no backend na criação (evita colisão e serve como parte da URL amigável).
- `status`: `"draft" | "published"` — permite salvar rascunhos no admin sem expô-los nas listagens públicas (query pública sempre filtra `status = "published"`).
- `body`: Markdown puro (renderizado no frontend com sanitização — ver [04](04-admin-auth-telemetria.md)).

**Indexação**: política de indexação customizada excluindo o caminho `/body/*` do índice automático do Cosmos (reduz RU de escrita, já que o corpo Markdown pode ser grande e nunca é filtrado/ordenado por query).

### Container `tags`

**Partition key: `/tagSlug`** — cada tag é seu próprio documento/partição; buscas por tag são sempre point-reads ou queries de partição única.

```json
{
  "id": "tag_nlp",
  "tagSlug": "nlp",
  "label": "NLP",
  "postRefs": [
    { "postId": "post_2026_01_attention-is-all-you-need-review", "type": "research", "title": "Uma releitura crítica de \"Attention Is All You Need\"", "date": "2026-01-14" },
    { "postId": "post_2025_11_fine-tuning-llms-portugues", "type": "blog", "title": "Fine-tuning de LLMs para português", "date": "2025-11-02" }
  ],
  "postCount": 2
}
```

Este é o "nó de tags cruzadas": em vez de fazer uma query custosa em `posts` filtrando por `ARRAY_CONTAINS(tags, @tagSlug)` (que faria fan-out entre as 3 partições de `type`), a leitura de "todos os posts com a tag X" é um único point-read no container `tags` — muito mais barato em RU.

### Container `accessLogs`

**Partition key: `/yearMonth`** (ex: `"2026-01"`) — agrupa logs por mês, permitindo definir TTL (`defaultTtl`) para expirar logs antigos automaticamente e manter o container dentro do free tier de armazenamento.

```json
{
  "id": "log_a1b2c3d4",
  "yearMonth": "2026-01",
  "postId": "post_2026_01_attention-is-all-you-need-review",
  "eventType": "page_view",
  "timestamp": "2026-01-15T10:22:31Z",
  "durationMs": 48210,
  "ipHash": "9f86d081884c7d659a2feaa0c55ad015",
  "userAgentFamily": "Chrome"
}
```

- `ipHash`: hash (SHA-256) do IP, nunca o IP em texto puro — mitigação de privacidade (o requisito de negócio pede "IPs" no dashboard, mas armazenar IP bruto é desnecessário para "páginas mais acessadas" e é um risco de LGPD; hash permite ainda contar visitantes únicos aproximados sem reter dado pessoal identificável diretamente).
- `eventType`: `"page_view" | "read_more_click" | "like" | "share"`.
- TTL sugerido: `defaultTtl: 15552000` (180 dias) no container, para não acumular indefinidamente.

### Estratégia de atualização de contadores (RNF07)

Usar a **Patch API** do Cosmos DB (`items.patch`) para incrementar `viewsCount`/`likesCount` via operação `incr`, em vez de ler o documento inteiro, alterar em memória e regravar com `replace`. Isso:
- Custa menos RU (patch parcial é mais barato que replace de documento inteiro, especialmente com `body` grande).
- Evita condição de corrida entre dois incrementos concorrentes (o Cosmos serializa patches no mesmo documento).

```js
await container.item(postId, postType).patch([
  { op: "incr", path: "/viewsCount", value: 1 }
]);
```

### Consistência de tags cruzadas na escrita

Ao criar/editar um post com tags `["nlp", "transformers"]`, a Function executa:
1. Upsert do documento em `posts` (operação 1).
2. Para cada tag, upsert do documento em `tags` adicionando/atualizando a entrada correspondente em `postRefs` (operação 2, 3, ...).

Como Cosmos DB não suporta transações cross-partition/cross-container nativamente, essas operações são **idempotentes e sequenciais**, não atômicas: se a operação 1 tiver sucesso e uma das operações de tag falhar, o post fica publicado mas uma tag fica temporariamente desatualizada. Plano de reconciliação: uma Function agendada (Timer Trigger, dentro do free tier) roda periodicamente reconstruindo `postRefs` de cada tag a partir de uma varredura de `posts` (idempotente, corrige qualquer drift). Como o volume é baixo (RNF05), essa reconciliação é barata e suficiente — não justifica a complexidade de um Change Feed neste estágio.

## 2.4 Contratos de API

Todas as rotas sob `/api/*`, implementadas como Azure Functions HTTP-triggered. Autorização via header `x-ms-client-principal` (injetado pelo Azure SWA quando o usuário está autenticado) — a Function decodifica o header (Base64 JSON) e verifica `userRoles.includes("admin")`.

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/posts?type={type}&tag={tag}&limit={n}&cursor={c}` | Público | Lista posts publicados, filtráveis por tipo e/ou tag, paginados por cursor (continuation token do Cosmos). |
| GET | `/api/posts/{id}` | Público | Retorna um post completo (incluindo `body`). 404 se não existir ou não estiver publicado. |
| POST | `/api/posts` | Admin | Cria um novo post. |
| PUT | `/api/posts/{id}` | Admin | Atualiza um post existente. |
| DELETE | `/api/posts/{id}` | Admin | Remove um post (e reconcilia `postRefs` das tags afetadas). |
| POST | `/api/posts/{id}/view` | Público (rate-limited) | Incrementa `viewsCount` via patch. Rate-limit simples por IP+postId (ex: 1 por minuto) para mitigar abuso. |
| POST | `/api/posts/{id}/like` | Público (idempotente) | Incrementa `likesCount`; idempotência garantida por um cookie/fingerprint de sessão gravado no browser (não por conta de usuário, já que visitantes não têm login). |
| GET | `/api/tags` | Público | Lista todas as tags com `postCount`. |
| GET | `/api/tags/{slug}` | Público | Retorna a tag e seus `postRefs` (posts relacionados). |
| GET | `/api/search-index` | Público | Retorna array leve `{id, type, title, summary, tags}[]` de todos os posts publicados, para o Fuse.js client-side (ver [03](03-estrategia-busca.md)). |
| POST | `/api/telemetry` | Público | Registra um evento em `accessLogs` (page_view, read_more_click, etc). |

### Exemplos de request/response

**`POST /api/posts`** (admin)
```json
// Request
{
  "type": "blog",
  "title": "Fine-tuning de LLMs para português",
  "summary": "Notas práticas sobre adaptação de modelos para PT-BR.",
  "body": "## Contexto\n\n...",
  "tags": ["nlp", "llm", "pt-br"],
  "imgUrl": "/uploads/llm-ptbr.png",
  "status": "published"
}
// Response 201
{
  "id": "post_2026_02_fine-tuning-llms-portugues",
  "createdAt": "2026-02-03T14:00:00Z",
  ...
}
```
Erros: `400` (payload inválido — ex: `type` fora do enum, `title` vazio), `401` (sem sessão), `403` (sessão sem role admin).

**`GET /api/posts?type=research&limit=5`**
```json
// Response 200
{
  "items": [
    { "id": "post_2026_01_...", "type": "research", "title": "...", "summary": "...", "date": "2026-01-14", "tags": [...], "viewsCount": 12, "likesCount": 3 }
  ],
  "nextCursor": "eyJvZmZzZXQiOjV9"
}
```
Nota: itens de listagem **não incluem `body`** (RNF06).

**`POST /api/posts/{id}/like`**
```json
// Response 200 (primeira vez)
{ "likesCount": 4, "likedByYou": true }
// Response 200 (já curtiu antes, idempotente)
{ "likesCount": 4, "likedByYou": true }
```
Erro: `429` se rate-limit de `/view` for excedido.

**Formato de erro padronizado** (todas as rotas):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Field 'title' is required." } }
```

Códigos de status usados: `200` (sucesso leitura), `201` (criado), `204` (deletado sem corpo), `400` (validação), `401` (não autenticado), `403` (autenticado sem permissão), `404` (não encontrado), `409` (conflito, ex: slug duplicado), `429` (rate limit).

## 2.5 Plano de implementação

Estrutura de pastas para `api/` (Azure Functions v4, Node.js + TypeScript):

```
api/
├── src/
│   ├── functions/
│   │   ├── posts-list.ts        (GET /api/posts)
│   │   ├── posts-get.ts         (GET /api/posts/{id})
│   │   ├── posts-create.ts      (POST /api/posts)
│   │   ├── posts-update.ts      (PUT /api/posts/{id})
│   │   ├── posts-delete.ts      (DELETE /api/posts/{id})
│   │   ├── posts-view.ts        (POST /api/posts/{id}/view)
│   │   ├── posts-like.ts        (POST /api/posts/{id}/like)
│   │   ├── tags-list.ts         (GET /api/tags)
│   │   ├── tags-get.ts          (GET /api/tags/{slug})
│   │   ├── search-index.ts      (GET /api/search-index)
│   │   ├── telemetry-ingest.ts  (POST /api/telemetry)
│   │   └── tags-reconcile.ts    (Timer Trigger — reconciliação periódica)
│   ├── repositories/
│   │   ├── postsRepository.ts   (isola o SDK do Cosmos para o container posts)
│   │   ├── tagsRepository.ts
│   │   └── accessLogsRepository.ts
│   ├── validation/
│   │   ├── postSchema.ts        (schema Zod para criar/editar post)
│   │   └── telemetrySchema.ts
│   └── shared/
│       ├── cosmosClient.ts      (singleton do CosmosClient, lido de env vars)
│       └── auth.ts              (parse do x-ms-client-principal, helper requireAdmin())
├── host.json
├── local.settings.json          (não versionado — connection string local/emulador)
└── package.json
```

Princípios de implementação:
- **Repository pattern**: nenhuma Function chama o SDK do Cosmos diretamente; todas passam por `postsRepository`/`tagsRepository`/`accessLogsRepository`, o que isola a lógica de queries/patches e facilita testes com mocks.
- **Validação de entrada**: todo body de POST/PUT passa por um schema Zod antes de tocar o repository; falha de validação retorna `400` com o formato de erro padronizado.
- **Tratamento de erros**: um middleware/wrapper comum captura exceções não tratadas e as converte para o payload `{error: {code, message}}` com status apropriado, evitando vazamento de stack trace.
- **Testes de integração mínimos recomendados**: suíte cobrindo (a) CRUD feliz-caminho de um post, (b) tentativa de escrita sem sessão admin retorna 401/403, (c) incremento de view/like é idempotente/cumulativo conforme esperado, (d) reconciliação de tags corrige um `postRefs` desatualizado — rodando contra o **Cosmos DB Emulator** local (gratuito, container Docker) para não consumir RU do ambiente de produção durante CI.
