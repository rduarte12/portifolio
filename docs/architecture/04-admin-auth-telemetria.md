# 04 — Painel Administrativo, Segurança e Telemetria

## 4.1 Autenticação do admin

Usa o **built-in auth do Azure Static Web Apps** (sem código de auth custom no frontend), com provedor **GitHub**:

- Login: link/redirecionamento para `/.auth/login/github`. O SWA gerencia o fluxo OAuth com o GitHub e injeta um cookie de sessão automaticamente.
- Logout: `/.auth/logout`.
- O frontend consulta `/.auth/me` para saber se há sessão ativa e quais `userRoles` o usuário tem.

### Restringindo o admin a um único usuário (o dono do portfólio)

O SWA free tier não tem um sistema nativo de "roles customizadas por usuário" fora do que é builtin (`anonymous`, `authenticated`). Para restringir `/admin/*` **apenas ao dono** (não a qualquer conta GitHub que faça login), é necessário uma **Azure Function de roles customizadas** (`/api/GetRoles`), registrada em `staticwebapp.config.json`:

```json
{
  "routes": [
    { "route": "/admin/*", "allowedRoles": ["admin"] },
    { "route": "/api/posts", "methods": ["POST", "PUT", "DELETE"], "allowedRoles": ["admin"] }
  ],
  "auth": {
    "rolesSource": "/api/GetRoles"
  }
}
```

A Function `GetRoles` recebe o `userId`/`userDetails` do provedor (login do GitHub) e retorna `{"roles": ["admin"]}` apenas se o `userDetails` (username do GitHub) bater com o valor configurado (variável de ambiente `OWNER_GITHUB_USERNAME`); caso contrário retorna `{"roles": []}`. Isso evita hardcodar o username diretamente no código.

## 4.2 Dashboard de métricas

**Decisão**: agregados lidos diretamente do container `accessLogs` no Cosmos DB, **não** Application Insights — Application Insights tem custo de ingestão fora do free tier em volume, enquanto os logs já persistidos no Cosmos (dentro do free tier, ver [02](02-spec-tecnica-dados-api.md)) são suficientes e gratuitos para as métricas de um portfólio pessoal.

Página `/admin/dashboard` (protegida pela mesma role `admin`), consumindo uma Function `GET /api/analytics/summary` que roda queries agregadas sobre `accessLogs`:

| Métrica | Query conceitual |
|---|---|
| Páginas mais acessadas | `COUNT(*) GROUP BY postId WHERE eventType = "page_view"` no mês corrente |
| Cliques em "Read More" | `COUNT(*) WHERE eventType = "read_more_click" GROUP BY postId` |
| Tempo médio de permanência | `AVG(durationMs) GROUP BY postId WHERE eventType = "page_view"` |
| Visitantes únicos aproximados | `COUNT(DISTINCT ipHash)` por período |

- **Tempo de permanência**: capturado no frontend via listener de `visibilitychange`/`beforeunload`, enviando `navigator.sendBeacon("/api/telemetry", payload)` com a duração calculada desde o mount da página — `sendBeacon` garante o envio mesmo que a aba feche antes de uma resposta normal de `fetch`.
- **Privacidade**: nunca armazenar IP em texto puro — apenas `ipHash` (SHA-256), suficiente para deduplicação aproximada de visitantes sem reter dado pessoal diretamente identificável (mitigação de risco LGPD, já especificado em [02](02-spec-tecnica-dados-api.md) §2.3).

## 4.3 Editor de conteúdo (Markdown + preview)

Componente `AdminEditor`, usado nas telas de criar/editar post:

- **Layout**: split-view — textarea de Markdown à esquerda, preview renderizado ao vivo à direita (atualização em cada keystroke com debounce leve).
- **Renderização do preview**: lib leve de Markdown→HTML (`marked` ou `markdown-it`), seguida de sanitização com `DOMPurify` antes de inserir no DOM (`dangerouslySetInnerHTML`) — necessário porque Markdown pode conter HTML embutido, e sem sanitização isso seria um vetor de XSS caso o conteúdo venha a ser editado por mais de uma pessoa no futuro, ou caso o campo seja comprometido.
- **Metadados do post**: campos de formulário separados para `title`, `summary`, `type`, `tags` (multi-select/tag-input), `imgUrl`, `status` (`draft`/`published`).
- **Persistência**: submit chama `POST /api/posts` (criação) ou `PUT /api/posts/{id}` (edição), conforme contratos definidos em [02](02-spec-tecnica-dados-api.md) §2.4. As rotas já são protegidas por `allowedRoles: ["admin"]` na configuração do SWA, então a Function em si só precisa confiar no header `x-ms-client-principal` (o SWA já bloqueou o acesso antes de a requisição chegar à Function se o role não bater).
- **Upload de imagem de capa**: fora do escopo desta fase — inicialmente o campo `imgUrl` aceita apenas URL (ex: imagem hospedada externamente ou em `public/`); um pipeline de upload para Azure Blob Storage é uma extensão futura, não necessária para o volume e uso atual.
