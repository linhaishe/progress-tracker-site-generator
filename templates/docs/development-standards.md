# 开发规范：需求、接口与验收

> 本规范用于约束后续所有阶段开发。任何功能开始前必须写清需求，开发中必须遵守接口契约，完成后必须按验收项验证。

## 1. 当前范围边界

当前开发计划只覆盖：

- 首页完整单页 MVP。
- 首页 SEO 与上线质量强化。
- 线索保存、通知与临时查看。
- 数据追踪与增长闭环。

当前明确不做：

- 博客、案例详情页、场景详情页、服务详情页、资源中心。
- CMS、多页面内容站、正式后台、复杂权限系统。
- OG Image、动态 OG Image。
- 真实 AI API 调用、AI 工具页、自动生成内容、自动发布。
- 阶段 1 真实 `/api/leads` 和数据库线索保存。

如后续要加入以上能力，必须单独写需求、接口、测试和验收。

## 2. 需求规范

每个需求必须包含以下字段，并明确区分前端、后端/API、数据/内容、测试、验收：

| 字段 | 要求 |
| --- | --- |
| 背景 | 说明为什么要做，关联 PRD 或阶段目标 |
| 用户 | 写清目标用户或运营角色 |
| 目标 | 写清业务目标和用户目标 |
| 范围 | 明确本次做什么、不做什么 |
| 页面/入口 | 写清用户从哪里进入、完成什么动作 |
| 内容 | 写清需要展示或维护的文案、字段、模块 |
| UI 原型 | 如存在 HTML/Figma/截图原型，写清原型路径、模块顺序、视觉 token、交互和差异处理 |
| 前端 | 写清页面、组件、交互、状态、路由、SEO 输出 |
| 后端/API | 写清接口、校验、存储、通知、第三方服务、错误码；无后端工作时写明不适用 |
| 数据/内容 | 写清 TypeScript 类型、数据库表或内容来源 |
| 状态 | 写清 loading、empty、success、error、disabled |
| SEO | 公开页面必须写 title、description、canonical、JSON-LD、sitemap、robots 要求；当前不做 OG Image |
| 测试 | 写清单元测试、服务端/API 测试、组件测试、E2E 测试分别覆盖什么 |
| 验收 | 使用可验证句式，不写主观描述 |

需求写法示例：

```md
## 需求：官网首页 Hero

背景：首屏需要让访客快速理解 AI SEO / AI 营销工具定位。
用户：外贸企业、中小企业官网负责人、营销团队、代理商。
目标：访客无需滚动即可理解产品价值，并点击预约演示或查看服务场景。
范围：实现标题、副标题、主 CTA、次 CTA、信任提示和工作流演示；不实现登录、AI API 调用和真实线索提交。
入口：`/`
内容：标题、副标题、CTA、适用对象提示。
前端：实现 Hero 组件、主 CTA、次 CTA、移动端布局和 H1。
后端/API：不需要接口；CTA 跳转到页面内联系入口。
数据/内容：Hero 文案来自首页结构化内容配置。
UI 原型：参考 `design-demos/animated-homepage-prototype.html` 的 Hero 双栏、工作流面板、CTA 和信任提示。
状态：首屏静态展示；CTA 点击可跳转到联系表单或服务场景。
SEO：页面只能有一个 H1。
测试：单元测试测 Hero 内容配置；服务端/API 测试不适用；Testing Library 测 CTA 渲染；Playwright 测首屏 H1 和 CTA 跳转。
验收：首屏包含 AI SEO / AI 营销关键词，包含至少一个主要 CTA，移动端按钮不溢出。
```

## 3. 技术栈与测试栈规范

项目技术栈以 PRD `## 7. 技术需求 / stack` 为准。PRD 中提到 OG Image，但当前阶段已确认不做 OG Image。

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

### 3.1 CI/CD 文件规范

CI/CD 文件统一放在 `.github/workflows`。当前仓库尚未创建该目录，后续应按阶段逐步添加，不为未实现能力提前创建无效 job。

推荐文件职责：

| 文件 | 职责 | 引入阶段 |
| --- | --- | --- |
| `.github/workflows/ci.yml` | 基础质量检查：依赖安装、类型检查、构建、单元/组件测试 | 阶段 1 |
| `.github/workflows/e2e.yml` | Playwright E2E、移动端导航、CTA、原型截图对照 | 阶段 1 后半段 |
| `.github/workflows/deploy-preview.yml` | Vercel Preview 部署和预览 smoke check | 阶段 2 |
| `.github/workflows/db.yml` | Drizzle schema、迁移检查、测试库迁移 | 阶段 3 |
| `.github/workflows/deploy-production.yml` | 主分支生产部署和部署后 smoke check | 正式上线前 |

基础 `ci.yml` 必须包含：

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

CI/CD 规范：

- 每个 workflow 必须写清触发条件、job 名称、运行命令和所需 secrets。
- 不得引用仓库中不存在的脚本；如 `pnpm test` 尚未配置，不能把它作为必跑命令。
- 涉及 secrets 的 job 必须说明用途，例如 `DATABASE_URL`、`VERCEL_TOKEN`、`VERCEL_PROJECT_ID`、`VERCEL_ORG_ID`、通知服务 webhook。
- Pull Request CI 不应真实发送运营通知、不应写生产数据库、不应调用真实 AI API。
- 数据库迁移在 CI 中优先使用测试数据库或 dry-run，不直接改生产库。
- 外部数据源失败不能默认阻断发布，除非该阶段验收明确要求。

### 3.2 分阶段 CI/CD 最低要求

| 阶段 | CI/CD 必跑内容 | 可选内容 | 禁止提前加入 |
| --- | --- | --- | --- |
| 阶段 1 | 安装依赖、类型检查、构建、首页内容/JSON-LD 单元测试、组件测试 | Playwright 首页访问、CTA、移动端菜单、截图对照 | DB migrate、真实 `/api/leads`、AI API secrets |
| 阶段 2 | 阶段 1 检查、sitemap/robots/metadata/JSON-LD 测试、Preview smoke check | Lighthouse、可访问性检查 | 博客路径、内容详情页、OG Image 生成 |
| 阶段 3 | 阶段 2 检查、`pnpm run db:generate`、服务端/API 测试、通知 mock 测试 | 测试库迁移、内部线索页保护 smoke check | 生产通知真实发送、无保护线索列表 |
| 阶段 4A | 事件 schema、事件写入、埋点失败降级测试 | Playwright 验证关键事件请求 | GA4/GSC 必填 secrets |
| 阶段 4B | 指标聚合、内部统计页保护测试 | 内部统计页 smoke check | 公开统计页 |
| 阶段 4C | 第三方服务 mock、超时/失败/缓存降级测试 | 手动触发外部数据同步检查 | 把外部数据失败默认设为发布阻断 |
| 阶段 4D | 规则建议或队列任务测试 | 手动触发任务 dry-run | 未审批真实 AI 生成和自动发布 |

### 3.3 测试分层

- 单元测试：使用 Vitest 覆盖内容模型、纯函数、数据转换、展示层辅助函数。
- 服务端/API 测试：使用 Vitest 覆盖 Zod schema、Route Handler / Server Action、数据库访问函数、错误码、限流/去重、通知或第三方服务降级、指标聚合函数。
- Testing Library：覆盖 React 组件状态和交互，例如 tabs、accordion、表单、按钮可用性、错误提示。
- Playwright：覆盖公开页面访问、CTA 跳转、移动端导航、表单提交、关键用户路径、基础视觉/原型对照。
- TypeScript：所有阶段至少运行 `pnpm run check-types`。
- Build：涉及页面、metadata、JSON-LD、sitemap、robots 时运行 `pnpm run build`。
- Drizzle：涉及数据库 schema 时运行 `pnpm run db:generate`，按环境补充 `pnpm run db:migrate` 或 `pnpm run db:push`。

### 3.4 测试要求写法

每个阶段或功能必须写清：

- 单元测试测什么输入、什么输出、什么失败场景。
- 服务端/API 测试测什么 schema、接口响应、数据库读写、错误码和异常降级。
- 组件测试测什么交互、状态和无障碍属性。
- E2E 测试测什么用户路径、视口和关键断言。
- 哪些测试不适用，以及不适用原因。
- 最终需要运行的命令。
- 对应 CI/CD workflow 是否需要新增或调整。

服务端/API 测试必须独立列出。不能只写“Vitest 覆盖接口”，也不能把 Route Handler、schema、db helper 的测试混在普通单元测试里。

## 4. 前后端分工规范

### 4.1 UI 原型转生产规范

当需求引用 `design-demos/animated-homepage-prototype.html` 或其他 UI 原型时，开发文档必须写清：

- 原型路径和适用范围。
- 需要保留的模块顺序。
- 需要保留的视觉 token：颜色、间距、圆角、最大宽度、字体层级。
- 需要保留的交互：tabs、accordion、菜单、表单状态、滚动进度、reveal 动效。
- 需要保留的响应式规则：桌面布局、平板断点、移动端导航、按钮宽度、色块贴边。
- 允许调整的内容：生产组件拆分、Tailwind 类名、shadcn/ui 组件替换、无障碍增强。
- 必须说明的差异：与原型不一致的模块、样式、动效或文案，都要写明原因。

HTML 原型不得直接复制为生产页面。必须转译为 Next.js + React + TypeScript 组件，并把原型中的数组数据迁移为类型化内容配置。

### 4.2 前端必须写清

- 页面路径和锚点，例如 `/`、`#cases`、`#scenarios`、`#services`、`#faq`、`#contact`。
- 可选内部路径，例如 `/internal/leads`、`/internal/analytics`，必须说明临时保护方式。
- 组件拆分和组件职责。
- 内容来源：结构化 TypeScript、接口返回或第三方嵌入。
- 用户交互：点击、提交、展开/折叠、tabs 切换、菜单开关。
- UI 状态：loading、empty、success、error、disabled。
- UI 原型映射：哪些组件来自原型的哪些区块，哪些样式或交互做了生产化调整。
- 响应式要求：桌面端、移动端、按钮文字、卡片布局、导航折叠。
- SEO 输出：metadata、canonical、JSON-LD、标题层级；当前不做 OG Image。
- 前端验收：页面可访问、内容完整、交互可用、移动端无溢出。

### 4.3 后端/API 必须写清

- 接口路径、方法和调用方。
- 是否需要登录、限流、临时保护或内部访问。
- Zod 请求 schema 和响应类型。
- 业务规则：校验、去重、限流、保存、通知、聚合统计。
- 数据落库规则：表名、字段、状态枚举、时间字段。
- 错误码和错误信息。
- 第三方服务边界：邮件、企业微信、飞书、GA4、Google Search Console。
- 后端验收：成功路径、失败路径、异常路径、数据写入、权限边界。

### 4.4 联调必须写清

- 前端请求字段与后端 schema 是否一致。
- 成功响应如何展示。
- 失败响应如何展示。
- 前端是否保留用户输入。
- 数据是否按预期落库或进入第三方系统。
- 相关事件、来源页面、来源模块是否能追踪。
- UI 原型关键路径是否已通过截图或人工对照验收。

## 5. 接口规范

### 5.1 接口优先级

- 页面静态内容优先使用 TypeScript 结构化配置。
- 需要提交、保存、通知、查询、统计时再新增接口。
- 首版官网不因未来后台需求提前做复杂权限和 CMS 接口。
- 阶段 1 不创建真实 `/api/leads`；真实线索接口在阶段 3 实现。

### 5.2 接口文档格式

每个接口必须写清：

- 路径和方法。
- 使用场景。
- 前端调用方。
- 是否需要登录。
- 请求类型。
- 成功响应。
- 失败响应。
- 错误码。
- 校验规则。
- 数据落库规则。

接口写法示例：

````md
### POST /api/leads

用途：访客提交咨询线索。
前端调用方：首页联系表单。
鉴权：无需登录。

请求：
```ts
type CreateLeadRequest = {
  contact: string;
  requirement?: string;
  sourcePage: "/";
  sourceModule?: "hero" | "service" | "final-cta" | "nav" | "faq-contact" | "unknown";
};
```

成功响应：
```ts
type CreateLeadSuccess = {
  ok: true;
  leadId: string;
  message: string;
};
```

失败响应：
```ts
type CreateLeadError = {
  ok: false;
  code: "INVALID_CONTACT" | "REQUIREMENT_TOO_LONG" | "SUBMIT_FAILED";
  message: string;
};
```
````

### 5.3 错误码规范

- 错误码使用全大写蛇形命名，例如 `INVALID_CONTACT`。
- 前端不得直接展示技术异常堆栈。
- 后端返回给用户的 `message` 必须可读、克制、可行动。
- 服务器日志可以记录详细异常，但不能把敏感信息返回给浏览器。

### 5.4 校验规范

- 表单和 API 必须共享同一套字段规则，优先使用 Zod。
- 必填字段必须在前端和服务端同时校验。
- 所有用户输入都必须限制长度。
- 无登录接口必须考虑重复提交和限流。

## 6. 数据与内容规范

### 6.1 内容管理

- 首页固定内容优先放在结构化 TypeScript 文件。
- 当前阶段不做博客、案例详情页、服务详情页、场景详情页或 CMS。
- 案例、场景、服务、FAQ 作为首页区块内容维护。
- 内容字段必须有类型定义，避免组件直接依赖散落文案。
- 案例没有真实数据时，只能使用行业化案例或过程型结果。

### 6.2 数据库

- 当前仓库默认 MySQL + Drizzle ORM。
- 第三阶段线索管理使用 MySQL。
- 第四阶段基础事件追踪和轻量统计优先使用 MySQL 自有事件表。
- Redis、队列、外部数据源和自动化建议只在阶段 4 后续子阶段按需要引入。
- 数据表必须包含 `createdAt` 和 `updatedAt`。
- 公开提交的数据必须记录来源页面和来源模块。

## 7. 前端规范

- 使用 Next.js App Router、React、TypeScript。
- 使用 Tailwind CSS 和现有 shadcn/ui 风格组件。
- 公共 UI 组件优先放在 `packages/ui`，业务页面模块优先放在 `apps/web/src`。
- 首页模块组件应只负责展示，内容从结构化配置传入。
- 有 UI 原型时，先从原型提取 token、模块顺序、交互数据和响应式规则，再进入组件实现。
- 原型中的交互数据，例如 workflow、scenario、faq，不应硬编码在组件 JSX 中，应进入类型化内容配置。
- CTA、表单、FAQ 必须具备移动端可用状态。
- 按钮文字不得在移动端溢出。
- 页面标题层级必须语义化，首页只保留一个 H1。
- 前端不得假设接口一定成功，必须处理后端返回的失败响应。
- 表单提交失败时应尽量保留用户已输入内容。
- 动效必须兼容 `prefers-reduced-motion`。

## 8. 后端/API 规范

- 首版不单独拆 NestJS / FastAPI，优先使用 Next.js Route Handlers 或 Server Actions。
- 需要类型安全的内部业务 API 时可使用现有 `packages/api` tRPC 结构。
- 公开无登录接口必须限制字段、限制长度，并考虑重复提交或限流。
- 后端不得把数据库错误或第三方服务异常原样返回给浏览器。
- 涉及数据库写入时，服务端必须负责最终校验，前端校验只作为体验优化。
- 通知类能力失败时，应区分“保存失败”和“通知失败”，避免已保存数据丢失。
- 内部查看页或内部统计页必须有临时保护方式，不能公开暴露。

## 9. SEO 规范

公开首页必须包含：

- `metadata.title`
- `metadata.description`
- canonical 规则
- sitemap 收录规则
- robots 可访问规则
- FAQ Schema
- Organization 或 WebSite Schema
- Service 或 Product Schema，按最终定位选择

当前不做：

- OG Image。
- 动态 OG Image。
- 为博客、案例详情、场景详情、服务详情生成独立 sitemap 路径。

SEO 文案要求：

- 自然覆盖 AI SEO、AI 营销、SEO 内容优化、搜索流量、营销获客。
- 不堆砌关键词。
- 不承诺确定排名、确定流量或无法证明的收益。

## 10. 测试规范

### 10.1 测试文件建议

- 单元测试：与被测文件同目录或 `__tests__` 目录，命名为 `*.test.ts`。
- 服务端/API 测试：建议与 Route Handler、Server Action、schema、db helper 同目录，命名为 `*.test.ts`，用 mock 或测试数据库覆盖成功和失败路径。
- 组件测试：命名为 `*.test.tsx`，使用 Testing Library。
- E2E 测试：建议放在 `apps/web/e2e` 或项目约定的 Playwright 目录中。
- 测试数据：优先使用小型 fixture，避免复制整份生产内容。

### 10.2 阶段最低测试要求

- 阶段 1：首页内容数量、JSON-LD 构造、tabs、accordion、联系表单模拟状态、移动端菜单、CTA 跳转、原型截图对照；服务端/API 测试不适用。
- 阶段 2：首页 metadata、JSON-LD、sitemap、robots、标题层级、可访问性、移动端结构；服务端/API 测试不适用。
- 阶段 3：Zod schema、`POST /api/leads` 成功和失败错误码、Drizzle 写入字段、通知降级、表单状态。
- 阶段 4A：事件 schema、事件保存、限流、埋点失败降级、CTA/FAQ/表单事件触发。
- 阶段 4B：指标聚合、内部统计页保护、空数据、错误状态。
- 阶段 4C：GA4/GSC 第三方成功、失败、超时、缓存和降级。
- 阶段 4D：规则建议或异步任务的边界值、无数据状态、重试和幂等。

### 10.3 测试命令记录

在测试脚本未配置前，阶段文档仍必须写清预期命令。脚本接入后，优先使用：

```bash
pnpm run check-types
pnpm run build
pnpm test
pnpm exec playwright test
```

如果仓库暂未提供 `pnpm test` 或 Playwright 配置，验收记录必须明确写出“未运行原因”和“需要补充的脚本”。

## 11. 验收规范

### 11.1 验收记录格式

每个功能完成后追加验收记录：

```md
## 验收记录：功能名称

日期：
验收人：
关联需求：

### 内容验收
- [ ] 页面内容完整。
- [ ] 文案不包含无法证明的夸大承诺。

### 交互验收
- [ ] 主路径可完成。
- [ ] loading、success、error 状态可见。

### 前端验收
- [ ] 页面路径可访问。
- [ ] 组件内容和结构符合需求。
- [ ] 如存在 UI 原型，关键模块顺序、视觉风格和交互与原型一致，差异已记录。
- [ ] 桌面端和移动端均可用。
- [ ] CTA、表单或工具交互符合前端需求。

### 接口验收
- [ ] 请求字段符合接口文档。
- [ ] 成功响应符合接口文档。
- [ ] 失败响应包含稳定错误码。
- [ ] 无后端接口时已写明不适用原因。

### 测试验收
- [ ] 单元测试覆盖内容模型、纯函数或数据转换。
- [ ] 服务端/API 测试覆盖 schema、接口响应、数据库访问或第三方服务降级；无服务端工作时已写明不适用原因。
- [ ] Testing Library 覆盖关键组件状态和交互。
- [ ] Playwright 覆盖关键用户路径。
- [ ] 未覆盖项已写明不适用原因或新增跟进任务。

### 后端/API 验收
- [ ] 服务端校验覆盖必填、长度和枚举。
- [ ] 数据写入或查询符合数据模型。
- [ ] 无登录接口具备必要限制。
- [ ] 第三方服务失败时有可控降级或错误响应。
- [ ] 无后端工作时已写明不适用原因。

### 联调验收
- [ ] 前端能正确展示成功响应。
- [ ] 前端能正确展示失败响应。
- [ ] 数据能按预期落库、通知或上报。

### SEO 验收
- [ ] metadata 完整。
- [ ] 标题层级正确。
- [ ] JSON-LD 可被解析。
- [ ] 当前范围不包含 OG Image。

### 响应式验收
- [ ] 桌面端阅读正常。
- [ ] 移动端阅读正常。
- [ ] 按钮和卡片无文字溢出。
```

### 11.2 阶段完成定义

一个阶段只有在以下条件同时满足时才算完成：

- 阶段需求范围内的功能全部完成。
- 前端开发内容完成并通过前端验收。
- 后端/API 开发内容完成并通过后端验收；无后端工作的阶段需明确记录。
- 接口契约与实现一致；无接口的阶段需明确记录。
- 测试要求已完成；无法运行的测试必须记录原因和补充任务。
- 内容、转化、SEO、响应式、联调验收通过。
- 已记录未完成项和下一阶段风险。
- 不包含该阶段明确排除的能力。

## 12. 提交与检查规范

开发完成前必须至少运行：

```bash
pnpm run check-types
```

涉及页面构建或 SEO metadata 时必须运行：

```bash
pnpm run build
```

涉及数据库 schema 时必须运行：

```bash
pnpm run db:generate
```

涉及表单、接口或核心流程时必须补充自动化测试或记录明确的不适用原因。测试脚本尚未接入时，也必须在阶段计划中写清单元测试、服务端/API 测试、Testing Library、Playwright 后续应覆盖的测试点。
