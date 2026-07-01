# Development Stage Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Maintain PRD-based development stage documentation that clearly defines phase responsibilities, PRD stack usage, frontend work, backend/API work, testing requirements, interfaces, acceptance criteria, and reusable development standards.

**Architecture:** Keep planning and standards in Markdown so the project can use them before implementation begins. Split the output into one phase execution document and one reusable standards document: the phase document explains what to build in each product stage, while the standards document explains how requirements, interfaces, testing, CI/CD, and acceptance records must be written.

**Tech Stack:** Markdown documentation; PRD stack references: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Next.js Route Handlers / Server Actions, MySQL, Drizzle ORM + mysql2, Zod, Metadata/sitemap/robots/JSON-LD, Vitest, Testing Library, Playwright, Vercel, GitHub Actions. OG Image is explicitly out of scope for the current plan.

---

## File Structure

- Modify: `docs/development-stage-plan.md`
  - Owns the active staged execution plan derived from `docs/superpowers/specs/2026-06-30-homepage-prd.md`.
  - Must include responsibilities, product requirements, PRD stack usage, frontend work, backend/API work, testing requirements, CI/CD file content, interfaces/content models, acceptance criteria, and stage deliverables.
  - Must incorporate `design-demos/animated-homepage-prototype.html` as the Stage 1 UI, interaction, responsive, and visual reference.
- Modify: `docs/development-standards.md`
  - Owns reusable documentation rules for requirements, API contracts, data/content rules, frontend rules, SEO rules, testing rules, CI/CD rules, acceptance records, and verification commands.
  - Must define how HTML/UI prototypes are translated into production requirements.
  - Must define unit tests, service/API tests, Testing Library, and Playwright expectations for each stage.
- Modify: `docs/superpowers/plans/2026-06-30-development-stage-docs.md`
  - Owns this implementation plan and gives future workers a task-by-task path for reproducing or reviewing the documentation work.

## Current Scope Decisions

Record these decisions in the documentation:

- Stage 1 is a complete single-page homepage MVP based on `design-demos/animated-homepage-prototype.html`.
- Stage 1 does not implement real `/api/leads`, database lead storage, notifications, login, CMS, analytics dashboards, or real AI API calls.
- Stage 2 is homepage SEO and launch-quality hardening, not content-page expansion.
- No blog, no case detail pages, no scenario detail pages, no service detail pages, no resource center, and no CMS in the current plan.
- No OG Image or dynamic OG Image in the current plan.
- Stage 3 implements lead persistence and notification. A temporary internal read-only leads page is allowed only with basic protection.
- Stage 4 is split into sub-stages:
  - 4A: Basic event tracking stored first in MySQL.
  - 4B: Lightweight conversion statistics and internal read-only metrics.
  - 4C: Optional GA4/GSC external data sources.
  - 4D: Future automation or optimization suggestions boundary.
- Real AI model calls, AI generation records, automatic content generation, and automatic publishing require separate requirements and acceptance.
- Service/API tests must be listed separately from generic Vitest unit tests.

## Revision Requirement: Use The PRD Stack And Add Tests

`docs/development-stage-plan.md` and `docs/development-standards.md` must use the PRD stack as the source of truth, with current-scope exclusions noted:

- Frontend: Next.js App Router + React + TypeScript.
- Styling: Tailwind CSS + shadcn/ui.
- Backend: Next.js Route Handlers / Server Actions.
- Database: MySQL.
- ORM: Drizzle ORM + mysql2.
- Validation: Zod.
- SEO: Metadata, sitemap, robots, JSON-LD. OG Image is out of scope.
- Content: homepage structured TypeScript content. Blog/CMS/multi-page MDX is out of scope for this plan.
- Cache: Next.js cache; Redis later.
- Tests: Vitest + Testing Library + Playwright.
- Deploy/CI: Vercel plus PlanetScale / TiDB Cloud / Railway MySQL, GitHub Actions.
- Monitoring: Pino now; Prometheus/Grafana later.

The documents must include explicit testing requirements:

- Unit tests for content models, pure functions, data transforms, display helpers, metadata, sitemap, and JSON-LD builders.
- Service/API tests for Zod schemas, Route Handlers / Server Actions, database access functions, API response builders, error codes, rate limiting, duplicate handling, third-party fallback, and aggregation functions.
- Testing Library for React component states and interactions such as tabs, accordion, forms, buttons, and errors.
- Playwright for public pages, CTA flows, mobile navigation, form submission, key user paths, robots/sitemap checks, and Stage 1 prototype screenshot comparison.
- Required commands: `pnpm run check-types`, `pnpm run build`, future `pnpm test`, future `pnpm exec playwright test`, and `pnpm run db:generate` when Drizzle schema changes.
- CI/CD documentation for `.github/workflows/ci.yml`, `e2e.yml`, `deploy-preview.yml`, `db.yml`, and `deploy-production.yml`, introduced only when the corresponding stage needs them.

## Revision Requirement: Separate Frontend And Backend Work

The stage plan must not merge frontend and backend responsibilities into one generic step list. Each stage must include:

```md
阶段目标
产品需求
前端开发内容
后端/API 开发内容
数据与内容模型
接口契约
测试要求
验收标准
```

Stage ownership rules:

- Stage 1: Frontend owns homepage sections, responsive layout, CTA, metadata, JSON-LD, and simulated/external contact entry. Backend is explicitly not implemented.
- Stage 2: Frontend owns homepage SEO hardening, semantics, metadata, sitemap, robots, JSON-LD, accessibility, and performance. Backend/API tests are not applicable unless helper functions are server-only.
- Stage 3: Frontend owns the real form and states. Backend owns Zod validation, Drizzle persistence, duplicate/limit handling, notifications, and optional protected internal lead viewing.
- Stage 4A: Frontend owns event triggers. Backend owns event ingestion, validation, MySQL storage, field whitelist, and rate limits.
- Stage 4B: Frontend owns internal metrics UI. Backend owns aggregation and protected access.
- Stage 4C: Backend owns external GA4/GSC service boundaries and degradation.
- Stage 4D: Only define future automation boundaries unless separately approved.

## Revision Requirement: Use The Homepage UI Prototype

Stage 1 documentation must treat `design-demos/animated-homepage-prototype.html` as a high-fidelity prototype reference. The implementation docs must extract:

- Module order: sticky nav, Hero, keyword marquee, pain points, capabilities, scenarios, cases, services, FAQ/contact, final CTA, footer.
- Visual tokens: ink/canvas/surface/hairline plus lime, lilac, cream, mint, coral, navy, pink; max width 1280px; nav height 64px; large radius 24px.
- Interactions: scroll progress, mobile menu, Hero workflow tabs with auto-rotation, scenario tabs, FAQ accordion, form status, reveal animation.
- Responsive rules: two-column desktop sections, 1080px collapse behavior, 760px mobile navigation and full-width CTA behavior.
- Accessibility requirements: `aria-expanded` for menus/FAQ, `aria-live` or equivalent for dynamic scenario content, and `prefers-reduced-motion`.

Production implementation must convert the prototype into Next.js + React + TypeScript components. It must not paste the HTML file directly into `page.tsx`.

## Task 1: Audit The PRD And Project Context

**Files:**
- Read: `docs/superpowers/specs/2026-06-30-homepage-prd.md`
- Read: `design-demos/animated-homepage-prototype.html`
- Read: `README.md`
- Read: `package.json`

- [x] Read the PRD and confirm homepage modules, stack, lead requirements, interaction principles, and acceptance criteria.
- [x] Read the prototype and confirm module order, tokens, interactions, responsive behavior, and content structure.
- [x] Read repository setup and confirm Better-T-Stack monorepo, `apps/web`, `packages/ui`, `packages/api`, `packages/db`, MySQL, Drizzle, and pnpm scripts.
- [x] Record scope decisions: single page, no blog, no OG Image, no real AI tool, Stage 1 no real `/api/leads`, Stage 4 split into 4A-4D.

## Task 2: Update The Development Stage Plan

**File:** `docs/development-stage-plan.md`

- [x] Update document header and principles to say the active scope is homepage single-page MVP, homepage SEO hardening, lead management, and data tracking/growth loop.
- [x] Add PRD stack table and explicitly note OG Image is out of scope.
- [x] Keep the UI prototype reference and extract module order, visual tokens, interactions, and responsive requirements.
- [x] Keep role responsibilities split by product, UI, frontend, backend/API, database, and QA.
- [x] Rewrite Stage 1 as complete single-page homepage MVP.
- [x] Ensure Stage 1 says no real `/api/leads`, no database lead storage, no notifications, no real AI API, no OG Image.
- [x] Rewrite Stage 2 as homepage SEO and launch-quality hardening.
- [x] Ensure Stage 2 says no blog, no multi-page, no CMS, no OG Image, no backend business API.
- [x] Keep Stage 3 as lead management with `POST /api/leads`, MySQL + Drizzle, notification, and optional protected internal read-only lead view.
- [x] Rewrite Stage 4 as data tracking and growth loop split into 4A, 4B, 4C, and 4D.
- [x] Ensure Stage 4A stores event data first in MySQL.
- [x] Ensure service/API tests are listed separately in every stage and marked not applicable when appropriate.
- [x] End with stage deliverables and current recommended next steps.

## Task 3: Update The Development Standards Document

**File:** `docs/development-standards.md`

- [x] Add current scope boundary: no blog, no multi-page content site, no CMS, no OG Image, no real AI tool, no Stage 1 real `/api/leads`.
- [x] Update requirements template to include frontend, backend/API, data/content, test, and acceptance fields.
- [x] Update stack table and note OG Image is out of scope.
- [x] Require service/API tests to be written separately from generic unit tests.
- [x] Update frontend route examples to the single-page structure and optional internal protected routes.
- [x] Update content rules so cases, scenarios, services, and FAQ are homepage sections in the current plan.
- [x] Update database rules so Stage 3 leads and Stage 4 events use MySQL; remove AI generation-record default language.
- [x] Update SEO rules to require metadata, canonical, sitemap, robots, and JSON-LD, while excluding OG Image.
- [x] Update stage minimum tests to reflect Stage 1, Stage 2, Stage 3, Stage 4A-4D.
- [x] Keep acceptance record template with service/API not-applicable handling.

## Task 4: Add Phased CI/CD File Content Documentation

**Files:**
- Modify: `docs/development-stage-plan.md`
- Modify: `docs/development-standards.md`
- Modify: `docs/superpowers/plans/2026-06-30-development-stage-docs.md`

- [x] Add CI/CD file planning to `docs/development-stage-plan.md`.
- [x] Document recommended workflow files: `.github/workflows/ci.yml`, `.github/workflows/e2e.yml`, `.github/workflows/deploy-preview.yml`, `.github/workflows/db.yml`, and `.github/workflows/deploy-production.yml`.
- [x] Add phased CI/CD content requirements for Stage 1, Stage 2, Stage 3, Stage 4A, Stage 4B, Stage 4C, and Stage 4D.
- [x] Add a minimal Stage 1 `ci.yml` example that runs dependency install, `pnpm run check-types`, and `pnpm run build`.
- [x] Make clear that CI/CD should not introduce database migration, real `/api/leads`, notification secrets, AI API secrets, blog paths, or OG Image before the relevant stage.
- [x] Add CI/CD rules to `docs/development-standards.md`, including trigger conditions, job responsibilities, secrets, production database safety, and external service degradation rules.

## Task 5: Self-Review Documentation Coverage

Run:

```bash
rg -n "首页完整单页|首页 SEO 与上线质量强化|线索管理|数据追踪与增长闭环|4A|4B|4C|4D|服务端/API 测试|CI/CD|\\.github/workflows|ci.yml|e2e.yml|db.yml" docs/development-stage-plan.md docs/development-standards.md
```

Expected:

- Both documents mention the active stage model.
- Service/API tests appear explicitly.
- Stage 4 sub-stages appear explicitly.
- CI/CD workflow files and phased CI/CD requirements appear explicitly.

Run:

```bash
rg -n "博客|多页面|OG Image|/api/leads|AI API|AI 工具" docs/development-stage-plan.md docs/development-standards.md
```

Expected:

- Matches should describe exclusions or Stage 3 implementation only.
- There should be no instruction to build blogs, multi-page content pages, OG Image, Stage 1 real `/api/leads`, or real AI tooling.

Run:

```bash
rg -n "TB[D]|TO[D]O|待[定]|后续[补]|fi[l]l|placeho[l]der|类[似]" docs/development-stage-plan.md docs/development-standards.md docs/superpowers/plans/2026-06-30-development-stage-docs.md
```

Expected:

- The command exits with no matches.

## Task 6: Record Repository State

Run:

```bash
git status --short
```

Expected:

- Documentation files are modified.
- No application source code changes are required for this documentation update.

Run:

```bash
git diff -- docs/development-stage-plan.md docs/development-standards.md docs/superpowers/plans/2026-06-30-development-stage-docs.md
```

Expected:

- The diff only includes documentation changes.
- Scope reflects the user-confirmed decisions.

## Self-Review

- Spec coverage: The plan maps current product work to four active stages: single-page MVP, homepage SEO hardening, lead management, and data tracking/growth loop.
- Scope consistency: The docs exclude blogs, multi-page content, OG Image, real AI tooling, and Stage 1 real lead submission.
- Test coverage: The docs explicitly separate unit tests, service/API tests, Testing Library tests, and Playwright tests.
- Data consistency: Stage 3 leads and Stage 4 events use MySQL + Drizzle; GA4/GSC and automation are later sub-stages, not immediate dependencies.

## Execution Handoff

After this plan is updated, review the documentation with:

```bash
sed -n '1,260p' docs/development-stage-plan.md
sed -n '1,260p' docs/development-standards.md
rg -n "首页完整单页|首页 SEO 与上线质量强化|服务端/API 测试|4A|4B|4C|4D" docs/development-stage-plan.md docs/development-standards.md
```

Expected:

- The two documentation files exist.
- They cover active stages only.
- They include requirements, interfaces, tests, and acceptance criteria.
- They are aligned with the confirmed single-page scope.
