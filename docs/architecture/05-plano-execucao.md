# 05 — Plano de Execução por Fases

Cada fase indica o que é 100% gratuito no código/config vs. o que exige criar/configurar recursos na Azure.

> **Status**: Fase 0 concluída e mergeada. O código da API (Fase 1: scaffold de Azure Functions; Fase 2: endpoints de leitura) já está implementado em `api/` na branch `claude/fase1-2-backend-api`, junto com a atualização de `staticwebapp.config.json` e do workflow (`api_location: "api"`). **A migração do frontend para consumir a API (parte final da Fase 2) foi propositalmente adiada**: como o Cosmos DB e o GitHub OAuth App ainda não foram provisionados manualmente na Azure/GitHub (etapas que exigem acesso à conta do usuário), trocar a fonte de dados agora faria o site quebrar em produção assim que mergeado. O frontend continua servindo `postsData.json` até que o provisionamento da Fase 1 seja confirmado.

## Fase 0 — Higiene do código atual (gratuita, sem Azure)

- Corrigir o bug de paginação em `Research.tsx` (`.slice(visibleCount)` → `.slice(0, visibleCount)`).
- Unificar `Blog.tsx`, `Projects.tsx`, `Research.tsx` em um componente genérico `PostListPage` + hook `usePostsList(type)` (ver [01](01-auditoria-repositorio.md) §10).
- Popular `src/data/blogData.json` com conteúdo real temporário (fixture local), como ponte até a API existir — permite validar a UI antes da Fase 2.
- Resolver a configuração órfã do Tailwind: remover (`tailwind.config.js`, `postcss.config.js`, devDependencies) ou reativar deliberadamente.
- Corrigir os links mortos de "Highlights" na Home.

**Nada aqui requer conta ou recurso Azure.**

## Fase 1 — Provisionamento de infraestrutura (gratuita, configuração Azure)

- Criar conta Azure Cosmos DB (free tier: 1000 RU/s + 25GB grátis por conta, por assinatura).
- Criar os 3 containers (`posts`, `tags`, `accessLogs`) com as partition keys definidas em [02](02-spec-tecnica-dados-api.md) §2.3.
- Criar/configurar a Azure Function App vinculada ao Static Web App (managed functions — dentro do free tier de SWA, sem custo adicional além do Consumption plan da Function, que também tem grant gratuito de 1M execuções/mês).
- Registrar um GitHub OAuth App (gratuito) para o login do admin, e configurar as variáveis de ambiente do SWA (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`).
- Configurar `staticwebapp.config.json` com as rotas `allowedRoles` e `rolesSource` descritas em [04](04-admin-auth-telemetria.md).

**Exige**: conta Azure (o free tier de Cosmos DB é por assinatura, então usar a mesma assinatura do SWA), registro do OAuth App no GitHub.

## Fase 2 — API de leitura + migração do frontend

- Implementar as Functions de leitura: `GET /api/posts`, `GET /api/posts/{id}`, `GET /api/tags`, `GET /api/tags/{slug}`, `GET /api/search-index`, seguindo a estrutura de pastas de [02](02-spec-tecnica-dados-api.md) §2.5.
- Migrar `PostListPage` (da Fase 0) para consumir a API real via `usePostsList`, substituindo a fixture local.
- Implementar a busca client-side com Fuse.js conforme [03](03-estrategia-busca.md).

**Gratuito** dentro dos free tiers já provisionados na Fase 1.

## Fase 3 — Admin: autenticação, CRUD e editor

- Implementar a tela `/admin` (protegida por `allowedRoles: ["admin"]`) com login via `/.auth/login/github`.
- Implementar a Function `GetRoles` para restringir o role `admin` ao dono do portfólio.
- Implementar as Functions de escrita: `POST/PUT/DELETE /api/posts`, incluindo validação (Zod) e reconciliação de tags.
- Implementar o `AdminEditor` (Markdown + preview + sanitização) descrito em [04](04-admin-auth-telemetria.md) §4.3.

**Gratuito**, mesmos recursos da Fase 1.

## Fase 4 — Telemetria e dashboard

- Implementar `POST /api/telemetry` e o beacon no frontend (`visibilitychange`/`sendBeacon`) para `page_view` e `read_more_click`.
- Implementar `POST /api/posts/{id}/view` e `POST /api/posts/{id}/like` com a estratégia de Patch API ([02](02-spec-tecnica-dados-api.md) §2.3).
- Implementar `GET /api/analytics/summary` e a página `/admin/dashboard` consumindo essas agregações.
- Configurar a Function de reconciliação de tags (Timer Trigger) e o TTL do container `accessLogs`.

**Gratuito** dentro dos free tiers já provisionados.

## Checklist resumido de recursos Azure necessários

| Recurso | Fase | Custo |
|---|---|---|
| Conta Azure Cosmos DB (NoSQL, free tier) | 1 | Grátis (1 conta free por assinatura) |
| Azure Function App (Consumption, vinculada ao SWA) | 1 | Grátis até 1M execuções/mês |
| GitHub OAuth App | 1 | Grátis |
| Azure Static Web App | já existente | Grátis (plano atual) |

Nenhuma fase deste plano requer upgrade de plano pago, desde que o volume de conteúdo e tráfego permaneça na ordem de um portfólio pessoal (RNF05 em [02](02-spec-tecnica-dados-api.md)).
