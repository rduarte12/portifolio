# 00 — Relatório Executivo: Reestruturação do Portfólio

## Objetivo

Reestruturar o portfólio pessoal (React 19 + Vite 8, Azure Static Web Apps free tier) para atrair recrutadores de tecnologia e pesquisadores acadêmicos, demonstrando rigor técnico, arquitetura limpa e capacidade de execução — hoje o site tem lacunas funcionais que comprometem essa impressão.

## Estado atual (resumo da auditoria)

O código está bem organizado na superfície (componentização, CSS utilitário próprio, TypeScript), mas tem gaps funcionais concretos:

- **Blog, Projects e Research renderizam sempre vazios** — cada página tem `postsData: Post[] = []` hardcoded, com o import do JSON de dados comentado. Não há, hoje, nenhuma fonte de conteúdo real.
- **A busca existe na UI mas nunca funciona** — não há dados para filtrar.
- **`/auth` é um formulário sem lógica** — nenhuma autenticação implementada.
- **Não existe painel administrativo, persistência em banco de dados, nem telemetria.**
- Há duplicação de código entre as três páginas de listagem e configuração morta (Tailwind configurado mas não usado).

Detalhes completos: [01-auditoria-repositorio.md](01-auditoria-repositorio.md).

## Decisões de arquitetura

Dado que o Azure Static Web Apps free tier não aceita backend gerenciado custom vinculado diretamente, a arquitetura proposta é desacoplada:

```
Frontend (React, SWA free tier)
        │
        ▼
Azure Functions (Consumption plan, managed functions do SWA — grátis)
        │
        ▼
Azure Cosmos DB NoSQL (free tier: 1000 RU/s, 25GB)
```

- **Autenticação do admin**: built-in auth do Azure SWA com provedor **GitHub**, restringindo o role `admin` ao dono via uma Function de roles customizadas.
- **Busca**: 100% client-side com Fuse.js sobre um índice leve buscado uma vez da API — sem custo adicional por busca.
- **Editor de conteúdo**: Markdown com preview lado a lado, sanitizado com DOMPurify antes de renderizar.
- **Telemetria**: eventos e agregações persistidos no próprio Cosmos DB (não Application Insights, para evitar custo de ingestão), com anonimização de IP via hash.

Toda a arquitetura foi desenhada para operar **inteiramente dentro dos free tiers** da Azure, dado o volume esperado de um portfólio pessoal (dezenas a poucas centenas de posts).

## Documentos desta série

| # | Documento | Conteúdo |
|---|---|---|
| 01 | [Auditoria do Repositório](01-auditoria-repositorio.md) | Estrutura de pastas, rotas, componentes, bugs concretos, recomendações de DRY/estilo. |
| 02 | [Spec Técnica: Dados, CRUD e API](02-spec-tecnica-dados-api.md) | Requisitos funcionais/não-funcionais, modelagem da solução, modelagem do Cosmos DB, contratos de API completos, plano de implementação do backend. |
| 03 | [Estratégia de Busca](03-estrategia-busca.md) | Comparação de abordagens e desenho da busca client-side com Fuse.js. |
| 04 | [Admin, Auth e Telemetria](04-admin-auth-telemetria.md) | Login via GitHub, restrição de role admin, dashboard de métricas, editor Markdown. |
| 05 | [Plano de Execução](05-plano-execucao.md) | Fases de implementação, o que é gratuito em cada uma e o que exige provisionamento na Azure. |

## Próximo passo

Este conjunto de documentos é o blueprint para a implementação. A Fase 0 do [plano de execução](05-plano-execucao.md) (correções de código e higiene, sem depender de nenhum recurso Azure) pode começar imediatamente; as fases seguintes dependem do provisionamento descrito na Fase 1.
