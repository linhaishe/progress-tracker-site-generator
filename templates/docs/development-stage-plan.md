# AI SEO 官网分阶段开发执行文档

> 基于 PRD：`docs/superpowers/specs/2026-06-30-homepage-prd.md`
>
> UI 参考：`design-demos/animated-homepage-prototype.html`
>
> 适用范围：首页完整单页 MVP、首页 SEO 与上线质量强化、线索管理、数据追踪与增长闭环。

## 1. 总体开发原则

- 先上线可获客、可信、可维护的完整单页官网，再逐步补齐 SEO 质量、线索保存、数据追踪。
- 当前版本不做博客、不做多页面内容站、不做 CMS、不做 OG Image、不做真实 AI API 调用、不做 AI 工具页。
- 所有案例、场景、服务、FAQ、联系入口都放在首页一个页面中，页面样式参考高保真原型。
- 每个阶段必须拆清：产品需求、前端开发内容、后端/API 开发内容、数据/内容模型、接口契约、测试要求、验收标准。
- 技术栈以 PRD `## 7. 技术需求 / stack` 为准；阶段计划不得另行引入不必要的新框架。
- 后端接口只在确实需要提交、保存、通知、查询、统计时新增。
- 服务端/API 测试必须单独列出；不能混在 Vitest 单元测试下面。
- 无后端工作的阶段，验收记录必须写明“服务端/API 测试不适用”及原因。

## 2. 技术栈基准

本项目开发、测试和部署应使用 PRD 中的 stack。PRD 原始 stack 中提到 OG Image，但本阶段范围已确认不做 OG Image。

| 模块 | 技术 |
| --- | --- |
| 前端 | Next.js App Router + React + TypeScript |
| 样式 | Tailwind CSS + shadcn/ui |
| 后端 | Next.js Route Handlers / Server Actions |
| 数据库 | MySQL |
| ORM | Drizzle ORM + mysql2 |
| 校验 | Zod |
| SEO | Metadata、sitemap、robots、JSON-LD；不做 OG Image |
| 内容管理 | 首页结构化 TypeScript 内容；当前不做博客、CMS、多页面 MDX |
| 缓存 | Next.js cache；Redis 后期再加 |
| 测试 | Vitest + Testing Library + Playwright |
| 部署 | Vercel + PlanetScale / TiDB Cloud / Railway MySQL |
| CI/CD | GitHub Actions |
| 监控 | Pino；Prometheus/Grafana 后期再加 |

### 2.1 CI/CD 文件规划

当前仓库尚未创建 `.github/workflows`。后续接入 CI/CD 时，建议按阶段逐步增加或扩展以下文件：

| 文件 | 阶段 | 职责 | 触发 |
| --- | --- | --- | --- |
| `.github/workflows/ci.yml` | 阶段 1 起 | 基础质量检查：安装依赖、类型检查、构建、单元/组件测试 | `pull_request`、`push` 到主分支 |
| `.github/workflows/e2e.yml` | 阶段 1 后半段起 | Playwright E2E、移动端导航、CTA、原型关键视口截图检查 | `pull_request`、手动触发 |
| `.github/workflows/db.yml` | 阶段 3 起 | Drizzle schema 生成检查、迁移 dry-run 或测试库迁移 | `pull_request`、手动触发 |
| `.github/workflows/deploy-preview.yml` | 阶段 2 起 | Vercel Preview 部署、预览地址回写、上线前 smoke check | `pull_request` |
| `.github/workflows/deploy-production.yml` | 正式上线前 | 主分支生产部署、构建校验、部署后 smoke check | `push` 到主分支、手动触发 |

CI/CD 文件只描述自动化检查与部署流程，不应在阶段 1 提前引入数据库、真实线索提交、AI API 或多页面能力。

### 2.2 分阶段 CI/CD 内容说明

| 阶段 | 必需 CI/CD 检查 | 可选 CI/CD 检查 | 不应加入 |
| --- | --- | --- | --- |
| 阶段 1：首页完整单页 MVP | `pnpm install --frozen-lockfile`、`pnpm run check-types`、`pnpm run build`、首页内容/JSON-LD 单元测试、组件测试 | Playwright 首页访问、CTA、移动端菜单、原型截图对照 | DB migrate、真实 `/api/leads`、通知服务、AI API secrets |
| 阶段 2：首页 SEO 与上线质量强化 | 阶段 1 全部检查、sitemap/robots/metadata/JSON-LD 测试、Preview 部署 smoke check | Lighthouse、可访问性检查、部署预览 URL 回写 | 博客路径、内容详情页、OG Image 生成 |
| 阶段 3：线索管理 | 阶段 2 全部检查、`pnpm run db:generate`、服务端/API 测试、线索表迁移检查、通知服务 mock 测试 | 测试库迁移、内部线索页保护 smoke check | 无保护的 `GET /api/leads`、生产通知真实发送测试 |
| 阶段 4A：基础事件追踪 | 事件 schema 测试、事件写入服务端/API 测试、埋点失败降级测试 | Playwright 验证 CTA/FAQ/表单事件请求 | GA4/GSC 必填 secrets、自动化建议 |
| 阶段 4B：轻量转化统计 | 指标聚合测试、内部统计页保护测试 | 内部统计页 smoke check | 公开统计页 |
| 阶段 4C：外部数据源 | 第三方服务 mock、超时/失败/缓存降级测试 | 手动触发外部数据同步检查 | 把 GA4/GSC 失败作为发布阻断 |
| 阶段 4D：自动化建议边界 | 规则建议测试或队列任务测试 | 手动触发任务 dry-run | 未审批的真实 AI 生成和自动发布 |

### 2.3 推荐 `ci.yml` 基础结构

阶段 1 可先建立最小 CI：

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.20.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check types
        run: pnpm run check-types

      - name: Build
        run: pnpm run build
```

当 `pnpm test`、Playwright、数据库迁移脚本稳定后，再按阶段追加 job。不要为了未来能力提前添加空 job 或依赖不存在的 secrets。

### 2.4 测试分层原则

- **类型检查**：所有阶段至少运行 `pnpm run check-types`。
- **构建验证**：涉及页面、metadata、JSON-LD、sitemap、robots 时运行 `pnpm run build`。
- **单元测试**：使用 Vitest 覆盖内容模型、纯函数、数据转换、展示层辅助函数。
- **服务端/API 测试**：使用 Vitest 覆盖 Zod schema、Route Handler / Server Action、数据库访问函数、错误码、限流/去重、通知降级、统计聚合。
- **组件测试**：使用 Testing Library 覆盖 tabs、accordion、表单状态、按钮可用性、错误提示。
- **端到端测试**：使用 Playwright 覆盖公开访问、CTA 跳转、移动端导航、表单提交、关键页面 SEO/可访问性结构。
- **视觉/原型对照**：阶段 1 必须用 Playwright 截图或人工截图对照原型关键视口。
- **数据库验证**：涉及 Drizzle schema 时运行 `pnpm run db:generate`；涉及真实数据库迁移时按环境补充 `pnpm run db:migrate` 或 `pnpm run db:push`。

## 3. UI 原型实现基准

阶段 1 首页实现应以 `design-demos/animated-homepage-prototype.html` 作为 UI、交互和内容结构基准。该文件是高保真 HTML 原型，不是生产代码；开发时需要转译为 Next.js + React + TypeScript + Tailwind CSS 组件。

### 3.1 页面结构基准

1. Sticky 顶部导航：Logo、案例、场景、服务、QA、查看场景、预约咨询、移动端菜单。
2. Hero：左侧定位文案、主 CTA、次 CTA、信任提示；右侧 AI SEO 工作流动画面板。
3. Marquee 关键词条：外贸获客、多语言 SEO、服务页优化、FAQ Schema、关键词矩阵等。
4. 痛点模块：大色块背景、痛点节点或等效可视化表达。
5. 核心能力模块：5 个能力卡片。
6. 场景模块：4 个场景 tabs，右侧动态场景内容。
7. 案例模块：3 个行业化案例卡片。
8. 服务模块：4 个服务卡片和咨询 CTA。
9. FAQ + Contact：FAQ accordion 和无登录联系表单并列。
10. Final CTA：底部再次引导预约咨询。
11. Footer：内容、转化、范围说明。

### 3.2 视觉基准

原型视觉语言需要转译为项目设计 token：

```ts
export type HomepageVisualTokens = {
  colors: {
    ink: "#050505";
    canvas: "#ffffff";
    surface: "#f6f6f2";
    hairline: "#d9d9d2";
    lime: "#d9ff5b";
    lilac: "#d8c7ff";
    cream: "#fff2c2";
    mint: "#bbf2d0";
    coral: "#ff856f";
    navy: "#18182f";
    pink: "#ffd1e8";
  };
  layout: {
    maxWidth: "1280px";
    navHeight: "64px";
    sectionPaddingDesktop: "96px";
    sectionPaddingMobile: "70px";
    radiusLarge: "24px";
  };
};
```

页面观感应保留：高对比黑白、亮色块分区、圆角卡片、轻量动效、宽松首屏、专业但不夸张的 B2B 表达。

### 3.3 交互基准

- 顶部滚动进度条。
- 桌面端 sticky 导航和移动端全屏菜单。
- Hero 工作流 tabs：关键词策略、页面优化、内容生成，支持自动轮播和手动切换。
- 场景 tabs：外贸获客、中小企业官网增长、营销团队提效、代理商交付。
- FAQ accordion，首项默认展开，按钮具备 `aria-expanded`。
- 联系表单原型状态：联系方式为空时提示错误，成功时展示提交状态。
- Section reveal 动效；同时支持 `prefers-reduced-motion` 降低动画。

## 4. 角色分工

| 角色 | 职责 | 主要产出 |
| --- | --- | --- |
| 产品/业务 | 明确业务目标、目标客户、转化路径、文案边界 | 阶段需求、内容清单、验收意见 |
| UI/视觉 | 定义页面信息层级、响应式布局、组件状态 | 页面设计、组件规范、视觉验收 |
| 前端 | 实现 Next.js 页面、组件、SEO metadata、交互状态、表单状态、埋点触发 | 页面代码、内容配置、客户端交互、前端验收 |
| 后端/API | 实现 Route Handlers / Server Actions，处理校验、存储、通知、统计查询 | API 接口、Zod schema、错误码、服务端验收 |
| 数据库 | 设计 Drizzle schema、迁移、索引、数据保留规则 | 数据表、迁移脚本、数据字典 |
| QA/验收 | 按产品、前端、后端、SEO、响应式、联调场景验证 | 验收记录、缺陷清单 |

## 5. 阶段 1：首页完整单页 MVP

### 5.1 阶段目标

快速上线一个可信、可转化、SEO 友好的 AI SEO / AI 营销工具完整单页官网。

### 5.2 产品需求

必须包含：

- 顶部导航：Logo、案例、场景、服务、QA、预约咨询。
- Hero 首屏：清晰表达 AI SEO / AI 营销工具定位，包含主 CTA 和次 CTA。
- 痛点模块：至少 5 个痛点，每个痛点能对应后续能力模块。
- 核心能力模块：关键词策略、AI 内容生成展示、页面优化、内容管理、表现追踪预留。
- 场景模块：外贸获客、中小企业官网增长、营销团队提效、代理商交付。
- 案例模块：3 个行业化案例或示例案例，不使用虚假客户名和夸大指标。
- 服务模块：AI SEO 诊断、内容增长方案、官网 SEO 改造、长期运营陪跑。
- QA 模块：至少 6 个 FAQ，回答克制可信，不承诺排名保证。
- 底部转化模块：再次提供预约演示或提交需求 CTA。
- 联系入口：阶段 1 使用页面内模拟表单状态、邮件、企业微信说明、外部表单链接或临时跳转承接。

明确不做：登录系统、后台 CMS、数据库存储线索、真实 `/api/leads`、真实 AI 生成流程、排名追踪、数据看板、付费订阅、OG Image。

### 5.3 前端开发内容

- 替换 `apps/web/src/app/page.tsx` 初始页面，改为公开官网首页。
- 建立首页内容配置文件，例如 `apps/web/src/features/homepage/homepage-content.ts`。
- 建立首页内容类型文件，例如 `apps/web/src/features/homepage/homepage-types.ts`。
- 拆分展示组件：Hero、PainPoints、Capabilities、Scenarios、CaseStudies、Services、FAQ、FinalCTA、ContactEntry。
- 增加原型相关组件：ScrollProgress、HeroWorkflowDemo、KeywordMarquee、ScenarioTabs、MobileMenu、RevealSection。
- 使用 Tailwind CSS 和现有 shadcn/ui 组件实现响应式布局。
- 将原型中的 `workflowData`、`scenarioData`、`faqData` 转为类型化内容配置，不在组件中硬编码文案。
- Hero 右侧实现 AI SEO 工作流演示面板；该面板仅为静态/模拟展示，不调用 AI 服务。
- 场景模块实现 tabs 切换，切换内容需要有可访问的状态反馈，例如 `aria-live="polite"`。
- FAQ 使用可访问 accordion，按钮状态同步 `aria-expanded`。
- 联系表单保留原型的无登录体验：联系方式为空提示错误，成功时显示模拟提交或外部承接说明。
- 实现滚动 reveal 和滚动进度条；动效需遵守 `prefers-reduced-motion`。
- 在页面级配置中更新 metadata。
- 在页面中输出 FAQ Schema、Organization 或 WebSite JSON-LD、Service 或 Product JSON-LD。

### 5.4 后端/API 开发内容

阶段 1 不开发后端接口。

- 不创建真实 `/api/leads`。
- 不保存线索到数据库。
- 不发送真实通知。
- 不调用 AI API。
- 联系入口只做前端状态、外部承接或人工联系方式展示。

### 5.5 数据与内容模型

阶段 1 使用本地结构化内容，不要求数据库。

```ts
export type HomepageContent = {
  hero: HeroSection;
  workflow: WorkflowDemoItem[];
  marqueeItems: string[];
  painPoints: PainPoint[];
  capabilities: Capability[];
  scenarios: Scenario[];
  caseStudies: CaseStudy[];
  services: ServiceItem[];
  faqItems: FaqItem[];
  finalCta: CtaSection;
};
```

```ts
export type WorkflowDemoItem = {
  title: "关键词策略" | "页面优化" | "内容生成";
  keywords: Array<{ name: string; intent: string }>;
  checks: Array<{ name: string; value: string; level?: "high" | "medium" | "manual" }>;
};
```

```ts
export type LeadDraft = {
  contact: string;
  requirement?: string;
  sourcePage: "/";
};
```

`LeadDraft` 仅用于前端表单状态，不代表真实 API 请求。

### 5.6 接口契约

阶段 1 无浏览器调用的后端接口。

| 接口 | 方法 | 用途 | 状态 |
| --- | --- | --- | --- |
| `/api/leads` | `POST` | 提交咨询线索 | 阶段 1 不做，阶段 3 实现 |

### 5.7 测试要求

- 单元测试：测试首页内容配置数量和关键字段，确保至少 4 个场景、3 个案例、4 个服务项、6 个 FAQ。
- 单元测试：测试 FAQ JSON-LD、Organization/WebSite JSON-LD 的生成函数输出合法结构。
- 服务端/API 测试：不适用。阶段 1 无后端接口、无数据库写入、无通知服务。
- Testing Library：测试 Hero workflow tabs 可切换，scenario tabs 可切换，FAQ accordion 可展开/收起。
- Testing Library：测试联系表单空联系方式时显示错误提示，成功时显示模拟提交或外部承接状态。
- Playwright：测试 `/` 公开访问、首屏 H1、CTA 跳转到 `#contact`、移动端菜单打开和关闭。
- Playwright：在桌面和移动端截图检查原型关键布局：Hero 双栏/单栏、场景 tabs、FAQ/联系表单、Final CTA。
- 构建检查：运行 `pnpm run check-types` 和 `pnpm run build`。

### 5.8 验收标准

- 首页公开可访问，无需登录。
- 页面模块顺序与 UI 原型一致，除非有明确产品调整记录。
- 首屏无需滚动即可理解这是 AI SEO / AI 营销工具。
- 首页包含案例、场景、服务、QA 四类核心内容。
- 至少包含 4 个场景、3 个案例、4 个服务项、6 个 QA。
- 首屏、服务模块、底部转化模块均有 CTA，CTA 能滚动或跳转到联系入口。
- 工作流 tabs、场景 tabs、FAQ accordion、移动端菜单均可用并具备基础无障碍属性。
- 联系入口展示前端状态或外部承接方式，但不声称线索已真实入库。
- 页面只有一个清晰 H1，模块标题层级语义正确。
- metadata、FAQ Schema、Organization/WebSite JSON-LD、Service/Product JSON-LD 已完成。
- 不做 OG Image。
- 验收记录写明服务端/API 测试不适用。

## 6. 阶段 2：首页 SEO 与上线质量强化

### 6.1 阶段目标

在不新增博客、不新增多页面、不新增 CMS 的前提下，把首页打磨到可上线、可索引、可稳定投放的质量。

### 6.2 产品需求

必须包含：

- 首页 title、description、canonical、robots、sitemap 完整。
- 首页内容覆盖 AI SEO、AI 营销、SEO 内容优化、搜索流量、营销获客等关键词，但不堆砌。
- 首页 JSON-LD 完整：FAQ、Organization 或 WebSite、Service 或 Product。
- 页面标题层级、链接、CTA、FAQ 结构对搜索引擎和用户都可读。
- 移动端、桌面端、低性能设备下均可阅读和操作。
- 不出现无法证明的排名承诺、客户名和夸大指标。

明确不做：博客、案例详情页、场景详情页、服务详情页、资源中心、CMS、OG Image、动态 OG、后端业务 API。

### 6.3 前端开发内容

- 优化首页语义结构：H1 唯一，H2/H3 按模块层级组织。
- 抽离 SEO 内容配置，例如 `homepage-seo.ts`。
- 实现或完善 `metadata`、canonical、robots、sitemap。
- 实现 FAQ JSON-LD、Organization/WebSite JSON-LD、Service/Product JSON-LD。
- 检查并补齐图片/图标的 `alt` 或可访问替代文本。
- 检查桌面与移动端 CTA、表单、tabs、accordion 的键盘可用性。
- 优化首屏加载、字体、动效和长列表渲染，避免非必要 JS。
- 建立上线检查清单，记录不做 OG Image 的明确范围。

### 6.4 后端/API 开发内容

阶段 2 默认不开发业务 API。

可包含的服务端工作仅限：

- sitemap 数据函数。
- robots 配置。
- metadata / JSON-LD 生成辅助函数。

这些函数不访问数据库，不引入登录、CMS 或内容管理后台。

### 6.5 数据与内容模型

```ts
export type HomepageSeoContent = {
  title: string;
  description: string;
  canonicalPath: "/";
  keywords: string[];
};
```

```ts
export type StructuredDataConfig = {
  faq: FaqItem[];
  organization: {
    name: string;
    url: string;
  };
  serviceOrProduct: {
    name: string;
    description: string;
    audience: string[];
  };
};
```

### 6.6 接口契约

阶段 2 无浏览器调用的后端接口。

内部函数契约：

| 函数 | 用途 | 输入 | 输出 |
| --- | --- | --- | --- |
| `buildHomepageMetadata` | 生成首页 metadata | `HomepageSeoContent` | Next.js metadata 对象 |
| `buildFaqJsonLd` | 生成 FAQ Schema | `FaqItem[]` | JSON-LD 对象 |
| `buildOrganizationJsonLd` | 生成组织 Schema | `StructuredDataConfig` | JSON-LD 对象 |
| `getHomepageSitemapEntry` | 生成首页 sitemap 条目 | 无 | `{ url: string; lastModified?: Date }` |

### 6.7 测试要求

- 单元测试：测试 metadata、canonical、FAQ JSON-LD、Organization/WebSite JSON-LD、Service/Product JSON-LD 构造函数。
- 单元测试：测试 sitemap 只包含当前范围允许的公开首页，不生成博客、案例详情、场景详情、服务详情路径。
- 服务端/API 测试：不适用。阶段 2 无浏览器调用 API、无数据库写入、无第三方服务。
- Testing Library：测试首页标题层级、FAQ 渲染、CTA 渲染、关键链接可访问。
- Playwright：测试首页 title、description、H1、CTA、移动端导航、FAQ 结构。
- Playwright：测试 `/robots.txt` 和 `/sitemap.xml` 可访问且不阻止首页索引。
- 构建检查：运行 `pnpm run check-types` 和 `pnpm run build`。

### 6.8 验收标准

- 首页 metadata、canonical、robots、sitemap 完整。
- 首页 JSON-LD 可解析，且内容与页面可见文案一致。
- sitemap 不包含当前不做的博客、多页面内容路径。
- 页面没有 OG Image 生成逻辑或 OG Image 依赖。
- 首页文案可信，不承诺确定排名、确定流量或无法证明的收益。
- 桌面端和移动端无布局溢出、按钮文字溢出、内容遮挡。
- 验收记录写明阶段 2 无浏览器调用 API。

## 7. 阶段 3：线索管理：保存、通知与临时查看

### 7.1 阶段目标

让官网从展示站升级为可保存、可通知、可跟进的获客系统。

### 7.2 产品需求

必须包含：

- 无登录咨询表单提交。
- Zod 字段校验。
- MySQL + Drizzle 线索表。
- 成功、失败、重复提交、异常状态。
- 来源页面和来源模块记录。
- 至少一种运营通知方式，例如邮件、企业微信、飞书。

可选包含：

- 临时内部只读线索页，用于查看线索列表。
- 临时保护方式：环境变量 token、Basic Auth、内网限制或部署平台访问控制。

明确不做：访客注册登录、会员中心、正式后台、复杂权限系统、完整销售 CRM。

### 7.3 前端开发内容

- 将阶段 1 联系入口升级为真实表单组件。
- 字段包含联系方式、需求描述，并自动带上来源页面和来源模块。
- 实现 loading、success、error、disabled 状态。
- 表单提交失败时保留用户已输入内容。
- 在 Hero、服务模块、底部 CTA 中传入不同 `sourceModule`。
- 成功后展示下一步说明，例如“提交成功，我们会尽快联系你。”
- 如提供内部线索查看页，前端实现简单列表、分页/空状态/错误状态；正式后台另行规划。

### 7.4 后端/API 开发内容

- 创建 `POST /api/leads`。
- 使用 Zod 定义 `CreateLeadRequest` schema。
- 使用 Drizzle ORM 写入 MySQL。
- 实现重复提交判断或基础限流。
- 记录 `contact`、`requirement`、`sourcePage`、`sourceModule`、`status`、`createdAt`、`updatedAt`。
- 接入邮件、企业微信、飞书或其他通知方式。
- 可选实现 `GET /api/leads` 供内部查看，必须有临时保护方式；正式权限后台另行规划。

### 7.5 数据模型

```ts
export type LeadRecord = {
  id: string;
  contact: string;
  requirement: string | null;
  sourcePage: string;
  sourceModule: string | null;
  status: "new" | "contacted" | "invalid" | "closed";
  createdAt: Date;
  updatedAt: Date;
};
```

### 7.6 接口契约

| 接口 | 方法 | 用途 | 前端调用方 | 后端职责 | 鉴权 |
| --- | --- | --- | --- | --- | --- |
| `/api/leads` | `POST` | 访客提交咨询线索 | 首页联系表单 | 校验、去重/限流、保存、通知 | 无需登录 |
| `/api/leads` | `GET` | 内部查看线索列表 | 内部临时查看页 | 查询、分页、过滤状态 | 需要临时保护或内网限制 |

`POST /api/leads` 请求：

```ts
export type CreateLeadRequest = {
  contact: string;
  requirement?: string;
  sourcePage: "/";
  sourceModule?: "hero" | "service" | "final-cta" | "nav" | "faq-contact" | "unknown";
};
```

成功响应：

```ts
export type CreateLeadSuccess = {
  ok: true;
  leadId: string;
  message: "提交成功，我们会尽快联系你。";
};
```

失败响应：

```ts
export type CreateLeadError = {
  ok: false;
  code:
    | "INVALID_CONTACT"
    | "REQUIREMENT_TOO_LONG"
    | "DUPLICATE_SUBMISSION"
    | "RATE_LIMITED"
    | "SUBMIT_FAILED";
  message: string;
};
```

### 7.7 测试要求

- 服务端/API 测试：测试 `CreateLeadRequest` Zod schema，覆盖空联系方式、超长需求描述、合法请求。
- 服务端/API 测试：测试 `/api/leads` 成功响应、`INVALID_CONTACT`、`REQUIREMENT_TOO_LONG`、`DUPLICATE_SUBMISSION`、`RATE_LIMITED`、`SUBMIT_FAILED`。
- 服务端/API 测试：测试 Drizzle 写入函数能构造正确字段：contact、requirement、sourcePage、sourceModule、status、createdAt、updatedAt。
- 服务端/API 测试：测试通知失败不会导致已保存线索丢失，数据库错误不会把内部异常返回给浏览器。
- 单元测试：测试来源模块映射、表单请求 payload 构造、错误码到前端文案映射。
- Testing Library：测试联系表单 loading、success、error、disabled 状态和失败不清空输入。
- Playwright：测试从 Hero、服务模块、Final CTA 打开的提交路径都能带上正确 `sourceModule`。
- 数据库检查：运行 `pnpm run db:generate`；根据环境运行 `pnpm run db:migrate` 或 `pnpm run db:push`。
- 构建检查：运行 `pnpm run check-types` 和 `pnpm run build`。

### 7.8 验收标准

- 访客无需登录即可提交联系方式和需求。
- 联系方式为空、需求描述超长、重复提交、限流、服务端异常都有稳定错误码和清晰反馈。
- 提交失败后不清空用户已输入内容。
- 线索可以稳定保存到数据库。
- 线索记录包含来源页面、来源模块、提交时间。
- 通知失败不能导致已保存线索丢失。
- `GET /api/leads` 如果实现，不能公开暴露无保护线索列表。
- 前端请求字段与后端 schema 一致。

## 8. 阶段 4：数据追踪与增长闭环（分步实施）

### 8.1 阶段目标

分步建立从访问、点击、提交到复盘的增长数据闭环。事件数据优先保存到 MySQL 自有事件表；GA4、Google Search Console 和自动化建议后置。

### 8.2 阶段 4A：基础事件追踪

产品需求：

- 追踪 `page_view`、`cta_click`、`lead_submit`、`faq_open`。
- 事件包含页面路径、模块名、发生时间和有限 metadata。
- 事件数据先落 MySQL 自有事件表。

前端开发内容：

- 在首页关键模块触发埋点。
- 事件名和模块名使用白名单。
- 埋点失败不能影响页面交互和表单提交。

后端/API 开发内容：

- 创建 `POST /api/analytics/events`。
- 使用 Zod 校验事件名、页面路径、模块名、metadata。
- 使用 Drizzle 写入 MySQL。
- 实现字段白名单、长度限制、基础限流。

测试要求：

- 服务端/API 测试：事件 schema、非法事件名、非法路径、超长 metadata、成功写入、限流错误。
- 单元测试：事件 payload 构造、模块名映射、埋点失败降级。
- Playwright：测试 CTA 点击、FAQ 展开、表单提交能触发事件请求。

验收标准：

- 关键事件能写入 MySQL。
- 埋点失败不阻塞用户操作。
- 事件表不保存敏感明文内容。

### 8.3 阶段 4B：轻量转化统计

产品需求：

- 统计访问量、CTA 点击、线索提交、基础转化率、Top 模块。
- 提供内部只读统计视图，正式后台另行规划。

前端开发内容：

- 新增内部统计页，例如 `/internal/analytics`。
- 展示时间范围、访问量、CTA 点击、线索提交、转化率、Top 模块。
- 提供 loading、empty、error 状态。

后端/API 开发内容：

- 创建 `GET /api/analytics/dashboard`。
- 聚合 MySQL 事件表和线索表。
- 内部接口必须有临时保护方式。

测试要求：

- 服务端/API 测试：指标聚合、空数据、时间范围、权限保护、数据库异常。
- Testing Library：统计页 loading、empty、error、数据状态。
- Playwright：内部统计页在保护条件满足时可访问。

验收标准：

- 能查看核心转化指标。
- 指标与事件表、线索表数据口径一致。
- 内部统计页不能公开暴露。

### 8.4 阶段 4C：外部数据源接入

产品需求：

- 按需接入 GA4、Google Search Console 或其他 SEO 数据源。
- 外部数据仅作为补充，不替代自有事件表。

前端开发内容：

- 在统计页标识外部数据来源和更新时间。
- 外部数据失败时显示可读降级状态。

后端/API 开发内容：

- 封装 GA4/GSC 读取服务。
- 记录同步时间、失败原因和重试边界。
- 不把第三方异常原样返回给浏览器。

测试要求：

- 服务端/API 测试：第三方成功、失败、超时、空数据、缓存命中。
- 单元测试：外部数据到内部指标的转换。

验收标准：

- 外部数据接入失败不影响自有事件统计。
- 用户能看到外部数据更新时间和失败状态。

### 8.5 阶段 4D：自动化优化建议边界

产品需求：

- 在有足够数据后，再考虑规则化或半自动优化建议。
- 当前只定义边界，不立即开发真实 AI 生成或自动发布。

可能范围：

- 基于低转化模块、FAQ 展开率、CTA 点击率给出人工复盘建议。
- 需要异步任务时再评估 Redis、队列或独立服务。
- 真实 AI 模型调用、自动生成内容、自动发布必须单独立项和验收。

测试要求：

- 若只做规则建议，服务端/API 测试覆盖规则输入、输出、边界值和无数据状态。
- 若引入异步任务，必须补充队列、重试、幂等和失败告警测试。

验收标准：

- 不出现未经确认的真实 AI 生成能力。
- 自动化建议只作为内部辅助，不自动改动公开页面。

### 8.6 数据模型

```ts
export type AnalyticsEventRecord = {
  id: string;
  eventName: "page_view" | "cta_click" | "lead_submit" | "faq_open";
  pagePath: "/";
  module: string | null;
  metadataJson: unknown;
  occurredAt: Date;
  createdAt: Date;
};
```

```ts
export type AnalyticsDashboardMetrics = {
  range: { from: string; to: string };
  pageViews: number;
  ctaClicks: number;
  leadSubmits: number;
  conversionRate: number;
  topModules: Array<{ module: string; events: number }>;
};
```

### 8.7 接口契约

| 接口 | 方法 | 用途 | 前端调用方 | 后端职责 | 鉴权 |
| --- | --- | --- | --- | --- | --- |
| `/api/analytics/events` | `POST` | 上报前端行为事件 | 公开首页埋点 | 校验、限流、保存事件 | 无需登录，需字段白名单 |
| `/api/analytics/dashboard` | `GET` | 获取内部统计指标 | 内部统计页 | 聚合指标、查询趋势 | 需要临时保护或内网限制 |

```ts
export type AnalyticsEventRequest = {
  eventName: "page_view" | "cta_click" | "lead_submit" | "faq_open";
  pagePath: "/";
  module?: "hero" | "service" | "final-cta" | "nav" | "faq-contact" | "faq" | "unknown";
  metadata?: Record<string, string | number | boolean>;
};
```

## 9. 阶段交付清单

每个阶段完成时必须提交：

- 阶段需求清单。
- 页面或功能截图。
- 前端开发完成项。
- 后端/API 开发完成项；无后端工作时写明不适用。
- 接口契约和错误码；无接口时写明不适用。
- 数据模型或内容模型。
- 单元测试、服务端/API 测试、Testing Library、Playwright 的执行记录或不适用说明。
- 验收记录。
- 未完成项和下一阶段风险。

## 10. 当前推荐下一步

当前仓库仍是 Better-T-Stack 初始页面，首页 PRD 已完成。建议下一步先执行阶段 1：

1. 从 `design-demos/animated-homepage-prototype.html` 提取首页模块、token、交互和响应式规则。
2. 创建首页内容模型和结构化内容。
3. 替换 `apps/web/src/app/page.tsx` 初始页面。
4. 完成首页模块组件、Hero 工作流演示、场景 tabs、FAQ、联系入口。
5. 配置 metadata 和 JSON-LD；明确不做 OG Image。
6. 联系入口使用前端模拟状态或外部承接，不实现真实 `/api/leads`。
7. 补充阶段 1 测试：内容/JSON-LD 单元测试、组件交互测试、Playwright 公开访问和原型关键视口检查。
8. 按阶段 1 验收标准完成记录，再进入阶段 2 首页 SEO 与上线质量强化。
