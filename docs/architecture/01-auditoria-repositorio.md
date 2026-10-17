# 01 — Auditoria do Repositório Atual

> Base: exploração do código em `main` (worktree `portfolio-data-scientist-arch-67c676`), React 19 + Vite 8 + TypeScript, deploy em Azure Static Web Apps (free tier).

## 1. Estrutura de pastas atual

```
portfolio/
├── .github/workflows/
│   └── azure-static-web-apps-proud-river-09fd30b0f.yml   # CI/CD do SWA
├── public/
│   ├── github-icon.svg
│   ├── linkedin-icon.svg
│   ├── statistic-graph.svg      (logo/favicon)
│   └── image.png                (foto de perfil usada na Home)
├── src/
│   ├── assets/
│   │   └── hero.png              (não referenciado em nenhum componente)
│   ├── components/
│   │   ├── Card.tsx
│   │   ├── FeedCard.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── ShareButton.tsx
│   ├── data/
│   │   └── blogData.json         (atualmente `[]`)
│   ├── pages/
│   │   ├── App.tsx                (root + rotas)
│   │   ├── Auth.tsx
│   │   ├── Blog.tsx
│   │   ├── Home.tsx
│   │   ├── Projects.tsx
│   │   └── Research.tsx
│   ├── styles/
│   │   └── index.css              (único stylesheet global)
│   └── main.tsx
├── index.html
├── package.json / package-lock.json
├── postcss.config.js
├── tailwind.config.js             (presente, mas Tailwind NÃO é importado — ver §5)
├── tsconfig*.json
├── vite.config.ts
├── staticwebapp.config.json       (config de rotas/headers do Azure SWA)
├── .oxlintrc.json
└── README.md
```

Não existe pasta `api/` (sem Azure Functions), não existe pipeline de conteúdo em Markdown/MDX, e não há arquivo `.env` versionado.

## 2. Rotas e páginas

Roteamento via `react-router-dom` v7 `BrowserRouter`, definido em [`src/pages/App.tsx`](../../src/pages/App.tsx).

| Rota | Componente | Estado atual |
|---|---|---|
| `/` | `Home.tsx` | Hero, bio, tags de tecnologia, links externos para CV/carta (PDF hospedado em outro repo GitHub), grid de 4 "Highlights" hardcoded apontando para rotas `/projects/...` que **não existem** (links mortos). |
| `/research` | `Research.tsx` | Lista de posts de pesquisa — sempre vazia (ver §4). |
| `/projects` | `Projects.tsx` | Lista de projetos — sempre vazia (ver §4). |
| `/blog` | `Blog.tsx` | Lista de posts de blog — sempre vazia (ver §4). |
| `/auth` | `Auth.tsx` | Formulário de login (usuário/senha) sem nenhuma lógica de autenticação — `handleEnter` só chama `event.preventDefault()`. |

`Blog.tsx`, `Projects.tsx` e `Research.tsx` são implementações quase idênticas (código duplicado): cada uma define localmente uma interface `Post`, um array `postsData: Post[] = []`, estado de busca/tag/paginação ("Load More", 5 por vez), e renderiza via `FeedCard`.

## 3. Componentes

| Componente | Arquivo | Props | Observação |
|---|---|---|---|
| `FeedCard` | [`src/components/FeedCard.tsx`](../../src/components/FeedCard.tsx) | `id, title, summary, date, tags, link, owner?, imgUrl?, likesCount?, viewsCount?, showShareButton?` | Card horizontal usado por Blog/Projects/Research. Usa `<a>` externo se `link` começa com `http`, senão `<Link>` do router. |
| `ShareButton` | [`src/components/ShareButton.tsx`](../../src/components/ShareButton.tsx) | `title, url` | Web Share API com fallback para `clipboard.writeText` + `alert()`. Só renderiza dentro do `FeedCard` quando `showShareButton` é truthy. |
| `Card` | [`src/components/Card.tsx`](../../src/components/Card.tsx) | `title, description, tags, link?, imgUrl?` | Genérico, usado só nos 4 "Highlights" hardcoded da Home. |
| `Header` | [`src/components/Header.tsx`](../../src/components/Header.tsx) | — | Nav com links Home/Research/Projects/Blog. **Sem link para `/auth` ou indicação de login.** |
| `Footer` | [`src/components/Footer.tsx`](../../src/components/Footer.tsx) | — | Copyright + links GitHub/LinkedIn. |

Não existem primitivos compartilhados (Button, Input, Modal, Layout) — estilização mistura classes utilitárias com `style={{...}}` inline nas páginas.

**Ponto de duplicação (DRY)**: a lógica de listagem/filtro/paginação repetida em Blog/Projects/Research é candidata a um hook `usePostsList(type)` + componente genérico `PostListPage`, parametrizado por tipo de conteúdo.

## 4. Fonte de conteúdo (bug crítico)

- [`src/data/blogData.json`](../../src/data/blogData.json) existe mas é literalmente `[]`.
- Nas três páginas de listagem, o import do JSON está **comentado** (`//import postsData from '../data/blogData.json'`) e substituído por `const postsData: Post[] = []` inline. Resultado: as três seções renderizam sempre o estado vazio, independentemente de filtro.
- Não há CMS, não há pipeline Markdown/MDX, não há `fetch`/`axios` em lugar nenhum do código — zero integração com fonte de dados externa hoje.
- Shape de dado duplicado (`Post`) idêntico nas três páginas:
  ```ts
  interface Post {
    id: string;
    title: string;
    summary: string;
    date: string;
    tags: string[];
    link: string;
    owner?: string;
    imgUrl?: string;
    likesCount?: number;
    viewsCount?: number;
    showShareButton?: boolean;
  }
  ```

## 5. CSS / estilo

- Único stylesheet: [`src/styles/index.css`](../../src/styles/index.css) (224 linhas), importado em `main.tsx`.
- Organizado como "blocos de Lego": (1) variáveis/fontes, (2) reset, (3) estrutura macro (`.site-window`, `.container`, `.divider`), (4) utilitários (`.flex-row`, `.gap-md`, `.text-muted`, etc.), (5) componentes prontos (`.btn`, `.card`, `.tag`, `.feed-card`), (6) media query mobile (`max-width: 600px`).
- Tokens de design em `:root` (`--bg-outer`, `--text-main`, `--font-sans` Inter, `--font-serif` Lora via Google Fonts).
- **Tailwind é configuração morta**: `tailwind.config.js`, `postcss.config.js` e as devDependencies `tailwindcss`/`@tailwindcss/postcss`/`autoprefixer` existem, mas `index.css` não tem nenhuma diretiva `@tailwind`/`@import "tailwindcss"` (removida no commit `55ad931`). Isso é peso morto no repositório — decisão pendente: remover de vez ou reativar deliberadamente.
- Sem CSS Modules, sem CSS-in-JS. Uso extensivo (e inconsistente) de `style={{...}}` inline misturado com classes utilitárias.

## 6. Autenticação (stub)

- `/auth` registrado também em `staticwebapp.config.json` (`{"route": "/auth", "rewrite": "/index.html"}`).
- `Auth.tsx`: formulário controlado (`username`/`password` via `useState`), `handleEnter` só previne o submit — sem chamada de API, sem contexto de sessão, sem redirecionamento.
- Nenhum `AuthContext`, nenhuma rota protegida, nenhuma indicação de estado logado no `Header`.
- Sem dependências de auth no `package.json` (`msal`, `firebase`, `auth0` etc. ausentes).
- Confirma o commit `78a6261`: *"adicionar página de autenticação e rotas correspondentes. Autenticação não implementada"*.

## 7. `package.json` (resumo)

```json
{
  "scripts": { "dev": "vite", "build": "tsc -b && vite build", "lint": "oxlint", "preview": "vite preview" },
  "dependencies": { "dotenv": "^17.4.2", "react": "^19.2.7", "react-dom": "^19.2.7", "react-router-dom": "^7.18.1" },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3", "tailwindcss": "^4.3.3", "autoprefixer": "^10.5.4",
    "typescript": "~6.0.2", "vite": "^8.1.1", "oxlint": "^1.71.0",
    "@vitejs/plugin-react": "^6.0.3", "postcss": "^8.5.20"
  }
}
```

React 19, Vite 8, TypeScript ~6, react-router-dom 7. Sem framework de testes (nenhum Jest/Vitest instalado). Linter é `oxlint`, não ESLint. `dotenv` está como dependência mas não é usado em `src/`.

## 8. Busca (parcial/quebrada)

- Existe UI de busca (`<input>` de texto + `<select>` de tag) em Blog/Projects/Research, com filtro local via substring case-insensitive sobre `title`/`summary`/`tags`.
- Sem debounce, sem sincronização com query params da URL, sem índice — e como `postsData` é sempre `[]`, essa UI **nunca tem o que filtrar** hoje. É código morto em efeito prático.
- Não existe busca global no `Header` nem na Home.

## 9. Configuração Azure

`staticwebapp.config.json`:
```json
{
  "routes": [
    { "route": "/research*", "rewrite": "/index.html" },
    { "route": "/projects*", "rewrite": "/index.html" },
    { "route": "/blog*", "rewrite": "/index.html" },
    { "route": "/auth", "rewrite": "/index.html" }
  ],
  "globalHeaders": {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com https://*.cloudflareinsights.com;"
  }
}
```
Sem `navigationFallback`/`mimeTypes` customizados. CSP já libera Cloudflare Insights (vestígio de uma integração de analytics não usada atualmente).

Workflow [`azure-static-web-apps-proud-river-09fd30b0f.yml`](../../.github/workflows/azure-static-web-apps-proud-river-09fd30b0f.yml): `Azure/static-web-apps-deploy@v1`, dispara em push/PR para `main`, `app_location: "/"`, `api_location: ""` (confirma: **nenhuma Azure Function está conectada hoje**), `output_location: "dist"`.

## 10. Recomendações de limpeza (DRY / responsividade / estilo)

1. **Unificar Blog/Projects/Research** em um único componente `PostListPage` parametrizado por `type` (`"blog" | "research" | "project"`), com um hook `usePostsList(type)` cuidando de fetch + filtro + paginação. Elimina ~90% de código duplicado.
2. **Corrigir bug de paginação em `Research.tsx`**: usa `.slice(visibleCount)` em vez de `.slice(0, visibleCount)` como as outras duas páginas — precisa ser corrigido de qualquer forma na unificação acima.
3. **Resolver a config Tailwind órfã**: remover `tailwind.config.js`/`postcss.config.js`/devDependencies se a decisão for manter CSS utilitário manual, ou reativar a diretiva de import se for retomar Tailwind — não deixar as duas coisas configuradas e nenhuma em uso.
4. **Consertar links mortos da Home**: os 4 cards de "Highlights" apontam para `/projects/...` que não existem como rota — devem apontar para posts reais assim que a fonte de dados existir (ver [02](02-spec-tecnica-dados-api.md)).
5. **Adicionar indicação de sessão no `Header`**: link/estado de login será necessário quando a auth do admin existir (ver [04](04-admin-auth-telemetria.md)).
6. **Padronizar estilo**: migrar os `style={{...}}` inline mais recorrentes para classes utilitárias já existentes em `index.css`, reduzindo inconsistência visual entre páginas.
