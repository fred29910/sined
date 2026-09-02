如果你准备把 **Solid 当成大型项目的长期基础框架**，尤其结合 **Three.js / 3D Editor / 游戏开发引擎**，核心原则应该是：

> **Solid 负责 UI 响应式与组件系统；业务状态、领域模型、Engine、Renderer 与 UI 解耦。**

下面是一套经评审优化后，可以直接落地的**大型 Solid + TypeScript + Three.js 3D 编辑器/引擎项目架构方案**。

---

# 一、总体架构

```mermaid
flowchart TB
    subgraph A[Application]
        A1[Router / Layout / Feature / Page / UI]
    end

    subgraph P[Presentation]
        P1[Components / Hooks / ViewModels / UI State]
    end

    subgraph AP[Application Layer]
        AP1[UseCases / Commands / Queries / Services]
    end

    subgraph D[Domain]
        D1[Entity / ValueObject / Model / Rules / Events]
    end

    subgraph I[Infrastructure]
        I1[HTTP / WebSocket / IndexedDB / Storage / Worker]
    end

    A --> P --> AP --> D
    I -.-> AP
    I -.-> D
```

应用到 3D Engine / Editor 的具体分层：

```mermaid
flowchart TB
    UI["**Solid UI**<br/>Toolbar / Inspector / Tree<br/>Asset Browser / Timeline"]
    APP[Application API]
    CORE["**Editor Core**<br/>Command / Undo / Selection<br/>Scene / Asset / Prefab"]
    ENG[Engine]
    THREE["**Three.js**<br/>Scene / Camera / Renderer<br/>Material / Geometry / GPU"]

    UI -- "UI Events / Commands" --> APP
    APP --> CORE
    CORE --> ENG
    ENG --> THREE
```

---

# 二、技术栈与 Monorepo 工程基底

## 2.1 推荐技术栈
```text
TypeScript
SolidJS
Vite
Three.js (WebGL/WebGPU)
Vitest
Playwright
ESLint
Prettier
pnpm
```

> **注意**：对于纯 3D Editor / 游戏引擎 SPA 应用，强烈推荐先采用 **`Solid + Vite`** 结构，避免一开始引入 SolidStart 带来不必要的 SSR 复杂度与 3D 渲染环境 DOM 兼容性干扰。

## 2.2 Day 1 物理边界：pnpm workspace Monorepo

为了防止项目规模扩大后，代码在单体 `src/` 中随意跨层 import 导致隐式循环依赖，建议从第一天起建立最简 Monorepo 物理隔离：

```mermaid
flowchart TB
    subgraph packages["packages/"]
        direction TB
        domain["**domain/**<br/>纯 TS：实体、值对象、领域逻辑<br/>(Zero Dependencies)"]
        engine["**engine/**<br/>纯 TS：3D 渲染控制、ECS、物理、<br/>渲染循环、GPU 资源释放"]
        editor_core["**editor-core/**<br/>纯 TS：CommandBus, Undo/Redo,<br/>EventBus, Selection, Plugin Engine"]
        editor_ui["**editor-ui/**<br/>SolidJS：Inspector, Hierarchy,<br/>Viewport UI, Asset Browser"]
        ui["**ui/**<br/>SolidJS：基础原子组件库<br/>(Button, Input, Modal, Splitter)"]
        shared["**shared/**<br/>纯 TS：通用 Utils, Types,<br/>Math, Constants"]
    end

    subgraph apps["apps/"]
        editor["**editor/**<br/>Vite + Solid 顶层应用装配与路由入口"]
    end

    editor --> editor_ui
    editor --> ui
    editor --> shared
    editor_ui --> editor_core
    editor_ui --> ui
    editor_ui --> shared
    editor_core --> engine
    editor_core --> shared
    engine --> domain
    engine --> shared
```

---

# 三、目录结构 (Feature-First)

大型项目必须避免按技术类型划分目录（如 `components/`, `stores/`, `utils/`），推荐**按业务能力划分**：

```mermaid
flowchart TB
    subgraph src["packages/editor-ui/src/"]
        direction TB

        subgraph app["app/"]
            App1[App.tsx]
            App2[AppProviders.tsx]
            App3[routes.tsx]
            App4[bootstrap.ts]
        end

        subgraph features["features/"]
            direction TB
            scene_editor["scene-editor/"]
            inspector["**inspector/**"]
            hierarchy["hierarchy/"]
            viewport["viewport/"]
            asset_browser["asset-browser/"]

            subgraph inspector_inner["inspector/ 内部分层"]
                direction TB
                insp_comp["**components/**<br/>Inspector.tsx<br/>TransformPanel.tsx<br/>MaterialPanel.tsx"]
                insp_state["**state/**<br/>inspector.store.ts<br/>inspector.selectors.ts"]
                insp_adapter["**adapters/**<br/>gizmo-bridge.ts<br/>(Viewport ↔ Inspector 桥接)"]
                insp_cmd["**commands/**<br/>update-transform.ts"]
                insp_idx["index.ts"]
            end
        end

        subgraph components_dir["components/"]
            comp_ui["**ui/**<br/>无业务原子基础组件<br/>(Button, Input)"]
            comp_composite["**composite/**<br/>组合型 UI<br/>(PropertyEditor, ColorPicker)"]
            comp_domain["**domain/**<br/>业务关联型组件<br/>(EntityTree)"]
        end

        subgraph infra["infrastructure/"]
            inf_http["http/"]
            inf_idb["indexeddb/"]
            inf_worker["**workers/**<br/>Zero-Copy Web Worker 桥接封装"]
        end
    end
```

---

# 四、Solid State Architecture (状态分层)

避免"所有数据都塞入 `createStore`"或者"把所有属性都变成了 `createSignal`"。

```mermaid
flowchart TB
    State(["State"])

    State --> LS["**Local State**<br/>组件内部 UI 临时状态<br/>(Dropdown / Tab / Modal)"]
    State --> FS["**Feature State**<br/>结构化 Feature 状态<br/>(Inspector 面板展开、选中节点 ID)"]
    State --> DS["**Domain State**<br/>引擎与场景树<br/>(Scene, Entity, Component)"]

    LS -- "createSignal" --> Comp["Component"]
    FS -- "createStore" --> Feat["Feature"]
    DS -- "Plain TS Class/Struct" --> Eng["Engine"]
```

1. **Local State (`createSignal`)**：Dropdown 展开/收起、Tab 切换等组件内部 UI 临时状态。
2. **Feature State (`createStore`)**：Inspector 展开面板状态、选中节点 ID 集合等，利用 Solid `createStore` 提供属性级响应式。
3. **Domain State (Plain TS)**：引擎与场景树（Scene, Entity, Component），使用**纯 TypeScript 类/结构**维护，禁止直接绑定 Solid 响应式。

---

# 五、三频率数据模型与 Gizmo/Inspector 同步

3D 编辑器性能暴跌的主要原因是在高频更新时触动了 UI 响应式图谱。必须严格区分数据的更新频率：

```mermaid
flowchart TB
    subgraph HF["**High Frequency (60 / 120 FPS)**"]
        HF_desc["Three.js Render Loop / Physics / Gizmo Dragging"]
        HF_mech["机制：Direct Mutate / Native Event /<br/>RequestAnimationFrame"]
    end

    subgraph MF["**Medium Frequency (10 ~ 30 FPS / Interaction)**"]
        MF_desc["Inspector 数值显示 / Viewport Gizmo 状态同步"]
        MF_mech["机制：rAF Throttle Signal Sync /<br/>Uncontrolled Input"]
    end

    subgraph LF["**Low Frequency (User Action Finalized)**"]
        LF_desc["Command History / State Persistence /<br/>Undo-Redo Stack"]
        LF_mech["机制：CommandBus.execute(new MoveCommand(...))"]
    end

    HF -- "Throttle / Drag End" --> MF
    MF -- "User Action / Event Finalize" --> LF
```

### Viewport Gizmo 与 Inspector 实时同步规范：
1. **拖拽中（Dragging）**：Gizmo 拖拽直接修改 Three.js `Object3D.position`。通过 rAF 节流（Throttle）同步更新 Inspector 的 Signal/Store，或对高频输入框采用 Uncontrolled Input + 帧刷新。**严禁在 drag 过程中每帧生成 Command**。
2. **拖拽结束（Drag End）**：提交一次完整的 `MoveEntityCommand` 到 `CommandBus`，触发撤销重做历史记录压栈与持久化。

---

# 六、Command 架构与 Undo/Redo

```ts
interface Command {
  id: string
  execute(): void
  undo(): void
}
```

修改场景树或实体属性的操作必须经过 `CommandBus`：

```mermaid
flowchart LR
    UI[UI Action] -- "execute(new UpdateTransformCommand(...))" --> Bus["**CommandBus**"]

    Bus -- "1. execute()" --> Engine["Engine / Domain Entity"]
    Bus -- "2. push()" --> History["**HistoryStack**<br/>(Undo / Redo)"]
    Bus -- "3. emit Event" --> Store["Solid Reactive Store<br/>(Sync UI)"]
```

---

# 七、内存泄漏防护与 GPU 资源管理

3D 编辑器必须在第一天建立**资源销毁（Disposal）与引用计数规范**：

```mermaid
flowchart TB
    subgraph Cleanup["资源销毁三原则"]
        direction TB
        C1["**1. GPU 资源销毁 (Three.js Cleanup)**<br/>移除 3D 对象时递归调用：<br/>• Geometry.dispose()<br/>• Material.dispose()<br/>• Texture.dispose()<br/>• RenderTarget 显式释放"]
        C2["**2. Solid & EventBus 订阅清理**<br/>所有全局 EventBus / Engine 监听：<br/>onCleanup(() => bus.off(...))"]
        C3["**3. Asset Reference Counting**<br/>AssetManager 维护纹理/材质/网格的 Ref Count<br/>计数归零时立即释放 GPU 显存"]
    end
```

---

# 八、Web Worker 通信与零拷贝优化

涉及密集型计算（如 GLTF/FBX 解析、物理模拟、网格生成）必须提取到 Web Worker：

```mermaid
flowchart LR
    subgraph Main["Main Thread"]
        SolidUI["Solid UI"]
        Three["Three.js Render"]
    end

    subgraph Worker["Worker Thread"]
        Parser["Asset Parser / Physics Engine"]
    end

    SolidUI -- "postMessage(buffer, [buffer])<br/>**Zero-Copy Transferable**" --> Parser
    Parser -- "Transferable Result" --> Three
```

* **禁用**：在 Worker 与主线程间直接传输深层复杂 JSON 对象，避免 `Structured Clone` 阻塞主线程。
* **规范**：网格顶点、索引、纹理像素使用 `ArrayBuffer` / `TypedArray`，强制采用 **Transferable Objects** 模式实现所有权零拷贝转移。

---

# 九、Plugin Architecture (插件架构)

```ts
interface EditorPlugin {
  id: string
  name: string
  activate(ctx: PluginContext): void
  deactivate(): void
}

interface PluginContext {
  commands: CommandRegistry
  panels: PanelRegistry
  inspectors: InspectorRegistry
  importers: AssetImporterRegistry
  eventBus: EventBus
}
```

```mermaid
flowchart TB
    subgraph Core["Editor Core"]
        PM["**PluginManager**"]
        subgraph Registries["Registries (注册表)"]
            CR[CommandRegistry]
            PR[PanelRegistry]
            IR[InspectorRegistry]
            AIR[AssetImporterRegistry]
        end
    end

    subgraph Plugins["Plugins (插件)"]
        GLTF[GLTF Importer]
        FBX[FBX Importer]
        Terrain[Terrain Builder]
        Physics[Physics Debugger]
        AI[AI Plugin]
    end

    PM --> CR
    PM --> PR
    PM --> IR
    PM --> AIR

    GLTF -.activate.-> PM
    FBX -.activate.-> PM
    Terrain -.activate.-> PM
    Physics -.activate.-> PM
    AI -.activate.-> PM
```

通过核心注册表管理核心能力，GLTF Importer、Terrain Builder、Physics Debugger 等均作为插件模式接入。

---

# 十、依赖规则（Dependency Rules）与黄金法则

### 10.1 严格单向依赖

```mermaid
flowchart TB
    A["**apps/editor**"]
    B["**packages/editor-ui**"]
    C["**packages/editor-core**"]
    D["**packages/engine**"]
    E["**packages/domain**"]

    A --> B --> C --> D --> E
```

### 10.2 黄金法则（10 Golden Rules）
1. **Signal** = 组件内部 Local State。
2. **Store** = 结构化 Feature State，切勿做全局 God Store。
3. **Context** = 依赖注入容器与顶级隔离域，禁止滥用放置高频变动数据。
4. **Domain / Engine** = 框架独立（Framework Independent），绝对禁止 `import Solid`。
5. **Command** = 用户意图与历史栈基础，禁止 UI 组件直接篡改 Engine 内部状态。
6. **Three.js Scene Graph ≠ Solid State**，Three.js 对象图由 Engine 管理，Solid 只观察 metadata 和 selected 状态。
7. **高频数据（60FPS）禁止入 UI State**，必须使用三频率同步模型。
8. **GPU 资源与事件必须成对销毁**，显式管理 `.dispose()` 与 `onCleanup`。
9. **Worker 通信优先 Transferable**，拒绝大规模 JSON 序列化传输。
10. **Day 1 设立物理边界**，使用 Monorepo 物理隔离防范循环依赖。

---

# 十一、项目实施路线图 (Roadmap)

```mermaid
flowchart TB
    P0["**Phase 0：基础设施与 Monorepo 搭建**<br/>• pnpm workspace 建立 (apps/editor, packages/*)<br/>• TypeScript + Vite + Solid + Vitest + ESLint 环境校验"]

    P1["**Phase 1：Core Architecture & Domain/Engine 解耦**<br/>• 纯 TS 场景树与实体 (Domain/Engine)<br/>• CommandBus, Undo/Redo, EventBus (Editor Core)<br/>• 基础 Three.js Viewport 渲染循环 (Engine)"]

    P2["**Phase 2：UI 组件库与设计系统**<br/>• Atomic UI Components (Button, Input, Modal, Splitter)<br/>• Design Tokens (Colors, Spacing, Typography)"]

    P3["**Phase 3：Viewport 交互与 Inspector 同步桥接**<br/>• Gizmo 拖拽与 Transform Panel 节流同步 (rAF Bridge)<br/>• Selection 系统与 Inspector 动态渲染"]

    P4["**Phase 4：资源生命周期与 Web Worker 架构**<br/>• AssetManager 引用计数与 GPU 显存 dispose 机制<br/>• Transferable 零拷贝 Worker 资源解析 (GLTF/Texture)"]

    P5["**Phase 5：核心编辑器 Feature 扩展**<br/>• Scene Hierarchy 树状视图<br/>• Asset Browser 资产浏览器<br/>• Timeline & Animation 界面"]

    P6["**Phase 6：持久化与 Plugin 机制**<br/>• IndexedDB 场景与工程保存<br/>• PluginManager 与 Inspector/Panel 动态注册表"]

    P7["**Phase 7：性能调优与测试覆盖**<br/>• 内存泄漏排查与 Bundle Size 优化<br/>• Vitest 单元测试 + Playwright E2E 自动化测试"]

    P0 ==> P1 ==> P2 ==> P3 ==> P4 ==> P5 ==> P6 ==> P7
```
