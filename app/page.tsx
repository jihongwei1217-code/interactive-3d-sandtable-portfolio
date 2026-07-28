"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AssetKind =
  | "robot"
  | "quadruped"
  | "bench"
  | "screen"
  | "tree"
  | "operator"
  | "chamber"
  | "dynamometer"
  | "impact"
  | "vibration"
  | "rig"
  | "vehicle";
type SceneMode = "indoor" | "outdoor" | "mixed";
type ViewMode = "perspective" | "top";

type SceneItem = {
  id: number;
  kind: AssetKind;
  x: number;
  y: number;
  rotation: number;
  color: string;
};

const assetInfo: Record<
  AssetKind,
  { name: string; icon: string; color: string; className: string }
> = {
  robot: { name: "机器人代理", icon: "R", color: "#ff6838", className: "robot" },
  quadruped: { name: "Q20 四足机器人", icon: "Q", color: "#f15d36", className: "robot" },
  bench: { name: "测试工作台", icon: "B", color: "#22c7a9", className: "bench" },
  screen: { name: "信息看板", icon: "S", color: "#5d7cff", className: "screen" },
  tree: { name: "景观绿植", icon: "T", color: "#79c267", className: "tree" },
  operator: { name: "操作人员", icon: "P", color: "#e7b64d", className: "operator" },
  chamber: { name: "步入式温箱", icon: "C", color: "#49728f", className: "bench" },
  dynamometer: { name: "测功机机台", icon: "D", color: "#1d9e8a", className: "bench" },
  impact: { name: "冲击试验台", icon: "I", color: "#9d7543", className: "bench" },
  vibration: { name: "振动试验台", icon: "V", color: "#337e78", className: "bench" },
  rig: { name: "机器人操作线架", icon: "L", color: "#526de5", className: "screen" },
  vehicle: { name: "车辆装车模块", icon: "A", color: "#bc604d", className: "bench" },
};

const templates: Record<SceneMode, SceneItem[]> = {
  indoor: [
    { id: 1, kind: "chamber", x: 23, y: 25, rotation: 0, color: "#49728f" },
    { id: 2, kind: "dynamometer", x: 49, y: 26, rotation: 0, color: "#1d9e8a" },
    { id: 3, kind: "impact", x: 73, y: 26, rotation: 0, color: "#9d7543" },
    { id: 4, kind: "vibration", x: 27, y: 66, rotation: 0, color: "#337e78" },
    { id: 5, kind: "rig", x: 51, y: 62, rotation: -8, color: "#526de5" },
    { id: 6, kind: "robot", x: 70, y: 63, rotation: 14, color: "#ff6838" },
    { id: 7, kind: "operator", x: 82, y: 72, rotation: 14, color: "#e7b64d" },
  ],
  outdoor: [
    { id: 1, kind: "tree", x: 23, y: 24, rotation: 0, color: "#79c267" },
    { id: 2, kind: "tree", x: 76, y: 23, rotation: 0, color: "#79c267" },
    { id: 3, kind: "quadruped", x: 49, y: 48, rotation: 12, color: "#f15d36" },
    { id: 4, kind: "vehicle", x: 70, y: 60, rotation: -8, color: "#bc604d" },
    { id: 5, kind: "operator", x: 32, y: 70, rotation: 0, color: "#e7b64d" },
    { id: 6, kind: "screen", x: 77, y: 30, rotation: 0, color: "#5d7cff" },
  ],
  mixed: [
    { id: 1, kind: "chamber", x: 20, y: 27, rotation: 0, color: "#49728f" },
    { id: 2, kind: "dynamometer", x: 42, y: 27, rotation: 0, color: "#1d9e8a" },
    { id: 3, kind: "rig", x: 66, y: 26, rotation: 0, color: "#526de5" },
    { id: 4, kind: "robot", x: 37, y: 57, rotation: -15, color: "#ff6838" },
    { id: 5, kind: "quadruped", x: 58, y: 60, rotation: 12, color: "#f15d36" },
    { id: 6, kind: "vehicle", x: 78, y: 62, rotation: -5, color: "#bc604d" },
    { id: 7, kind: "tree", x: 84, y: 28, rotation: 0, color: "#79c267" },
    { id: 8, kind: "operator", x: 20, y: 72, rotation: 12, color: "#e7b64d" },
  ],
};

const projectModules = [
  ["01", "盐雾试验设备", "环境可靠性"],
  ["02", "测功机机台", "动力性能"],
  ["03", "测功机控制柜", "控制系统"],
  ["04", "冲击试验台", "机械冲击"],
  ["05", "振动试验台", "振动可靠性"],
  ["06", "机器人操作线架", "任务训练"],
  ["07A–C", "步入式大温箱", "三段式拼装"],
  ["08", "车辆装车模块", "任务场景"],
  ["09", "D12 人形机器人", "彩色 / 无色"],
  ["10", "Q20 四足机器人", "彩色 / 无色"],
];

const deliveryFlow = [
  ["01", "实拍与需求", "整理多角度照片、尺寸和场景任务"],
  ["02", "数字建模", "建立机器人、设备和场景模块"],
  ["03", "网页检视", "旋转、缩放、复位和单件核对"],
  ["04", "沙盘排布", "室内、室外、混合与历史方案"],
  ["05", "打印交付", "GLB、STL、STP、3MF 与装配说明"],
];

function cloneScene(mode: SceneMode) {
  return templates[mode].map((item) => ({ ...item }));
}

export default function Home() {
  const [mode, setMode] = useState<SceneMode>("mixed");
  const [view, setView] = useState<ViewMode>("perspective");
  const [items, setItems] = useState<SceneItem[]>(() => cloneScene("mixed"));
  const [selected, setSelected] = useState<number | null>(3);
  const [, setHistory] = useState<SceneItem[][]>([]);
  const [toast, setToast] = useState("已载入混合场景模板");
  const boardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selected) ?? null,
    [items, selected],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const snapshot = () => setHistory((past) => [...past.slice(-19), items.map((i) => ({ ...i }))]);

  const changeTemplate = (next: SceneMode) => {
    snapshot();
    setMode(next);
    const nextItems = cloneScene(next);
    setItems(nextItems);
    setSelected(nextItems[0]?.id ?? null);
    setToast(`已切换到${next === "indoor" ? "室内" : next === "outdoor" ? "室外" : "混合"}模板`);
  };

  const addAsset = (kind: AssetKind) => {
    snapshot();
    const id = Math.max(0, ...items.map((item) => item.id)) + 1;
    const offset = (id * 7) % 22;
    setItems((current) => [
      ...current,
      {
        id,
        kind,
        x: 39 + offset,
        y: 38 + ((id * 5) % 20),
        rotation: 0,
        color: assetInfo[kind].color,
      },
    ]);
    setSelected(id);
    setToast(`已添加：${assetInfo[kind].name}`);
  };

  const removeSelected = () => {
    if (!selected) return;
    snapshot();
    setItems((current) => current.filter((item) => item.id !== selected));
    setSelected(null);
    setToast("已删除，可使用撤回恢复");
  };

  const undo = () => {
    setHistory((past) => {
      if (!past.length) {
        setToast("暂无可撤回的操作");
        return past;
      }
      const previous = past[past.length - 1];
      setItems(previous.map((item) => ({ ...item })));
      setSelected(null);
      setToast("已撤回上一步");
      return past.slice(0, -1);
    });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selected) {
        const target = event.target as HTMLElement;
        if (target.tagName !== "INPUT") removeSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const saveLocal = () => {
    localStorage.setItem("sandtable-scene", JSON.stringify({ mode, items }));
    setToast("布局已保存到本机");
  };

  const loadLocal = () => {
    const raw = localStorage.getItem("sandtable-scene");
    if (!raw) {
      setToast("还没有保存过布局");
      return;
    }
    try {
      const data = JSON.parse(raw) as { mode: SceneMode; items: SceneItem[] };
      snapshot();
      setMode(data.mode);
      setItems(data.items);
      setSelected(null);
      setToast("已恢复本机布局");
    } catch {
      setToast("保存的数据无法读取");
    }
  };

  const exportScene = () => {
    const blob = new Blob([JSON.stringify({ version: 1, mode, items }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sandtable-layout.json";
    link.click();
    URL.revokeObjectURL(url);
    setToast("布局文件已导出");
  };

  const importScene = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as { mode?: SceneMode; items?: SceneItem[] };
      if (!Array.isArray(data.items)) throw new Error("invalid");
      snapshot();
      setMode(data.mode ?? "mixed");
      setItems(data.items);
      setSelected(null);
      setToast("布局导入成功");
    } catch {
      setToast("请选择有效的沙盘 JSON 文件");
    }
    event.target.value = "";
  };

  const startDrag = (event: React.PointerEvent, item: SceneItem) => {
    event.stopPropagation();
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    snapshot();
    dragRef.current = {
      id: item.id,
      offsetX: ((event.clientX - rect.left) / rect.width) * 100 - item.x,
      offsetY: ((event.clientY - rect.top) / rect.height) * 100 - item.y,
    };
    setSelected(item.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const x = Math.max(7, Math.min(93, ((event.clientX - rect.left) / rect.width) * 100 - drag.offsetX));
    const y = Math.max(7, Math.min(93, ((event.clientY - rect.top) / rect.height) * 100 - drag.offsetY));
    setItems((current) => current.map((item) => (item.id === drag.id ? { ...item, x, y } : item)));
  };

  const endDrag = () => {
    if (dragRef.current) setToast("位置已更新");
    dragRef.current = null;
  };

  const updateRotation = (rotation: number) => {
    if (!selected) return;
    setItems((current) => current.map((item) => (item.id === selected ? { ...item, rotation } : item)));
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>具身智能中试平台</span>
          <span className="open-badge">PORTFOLIO</span>
        </div>
        <nav className="main-nav" aria-label="作品导航">
          <a href="#overview">项目总览</a>
          <a href="#evidence">建模成果</a>
          <a href="#demo">沙盘工作台</a>
          <a href="#delivery">交付流程</a>
        </nav>
        <div className="top-actions">
          <a className="github-btn" href="https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio" target="_blank" rel="noreferrer">
            查看源码 ↗
          </a>
        </div>
      </header>

      <section className="project-hero" id="overview">
        <div className="project-hero-copy">
          <span className="project-code">EMBODIED AI · DIGITAL SANDBOX · 01:25</span>
          <h1>机器人中试平台<br /><em>数字化沙盘系统</em></h1>
          <p>
            面向真实中试基地的 AI 辅助建模与网页交付项目。把机器人、试验设备、室内外场景和
            3D 打印文件，组织成一套可检视、可排布、可复用的数字工作台。
          </p>
          <div className="project-actions">
            <a href="#demo" className="project-primary">立即操作 3D 沙盘 ↓</a>
            <a href="#evidence">查看真实项目成果</a>
          </div>
          <div className="disclosure-line">
            <span>公开边界</span>
            <b>仅隐藏公司名称与品牌 Logo</b>
            <small>模型、场景、功能与工作流保留</small>
          </div>
        </div>
        <div className="project-hero-visual">
          <img src="/project/d12-hero.webp" alt="D12 人形机器人数字模型效果" />
          <div className="visual-tag tag-a"><span>01</span>D12 人形机器人</div>
          <div className="visual-tag tag-b"><span>02</span>网页实时检视</div>
          <div className="visual-tag tag-c"><span>03</span>打印分件交付</div>
          <p>PHOTO-REFERENCED MODEL / ROUGH PROTOTYPE</p>
        </div>
        <div className="project-metrics">
          <div><strong>41</strong><span>数字资产</span></div>
          <div><strong>14</strong><span>沙盘模板</span></div>
          <div><strong>80</strong><span>打印件</span></div>
          <div><strong>5</strong><span>核心场景</span></div>
        </div>
      </section>

      <section className="proof-section" id="evidence">
        <div className="proof-heading">
          <div>
            <span className="section-kicker">01 / 建模证据</span>
            <h2>从实拍参考，到可检视的粗略数字模型</h2>
          </div>
          <p>这不是通用概念页。建模过程使用正面、背面和双侧实拍持续校正轮廓、关节、外壳分件与材质关系。</p>
        </div>
        <div className="photo-proof">
          {[
            ["/project/d12-front.webp", "正面参考"],
            ["/project/d12-left.webp", "左侧参考"],
            ["/project/d12-back.webp", "背面参考"],
            ["/project/d12-right.webp", "右侧参考"],
          ].map(([src, label]) => (
            <figure key={src}>
              <img src={src} alt={`D12 人形机器人${label}`} />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="module-panel">
          <div className="module-intro">
            <span className="section-kicker">02 / 独立模型库</span>
            <h3>10类设备，12个可独立打印小物件</h3>
            <p>大温箱拆分为 07A / 07B / 07C 三段；机器人与设备均按彩色检视、无色打印两条路径管理。</p>
          </div>
          <div className="module-grid">
            {projectModules.map(([code, name, use]) => (
              <article key={code}>
                <span>{code}</span>
                <div><strong>{name}</strong><small>{use}</small></div>
                <b>↗</b>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scene-proof">
        <div className="scene-image">
          <img src="/project/pilot-lab.webp" alt="机器人中试验证场景效果" />
          <span>AI TRAINING CENTER / PILOT LAB</span>
        </div>
        <div className="scene-copy">
          <span className="section-kicker">03 / 场景体系</span>
          <h2>不是一张效果图，而是五套可组合场景</h2>
          <p>整体沙盘由四个内场中心与一个外场组成，内外场面积约 2:1。设备、绿化、人员、机器人和车辆均作为可调用模块进入排布系统。</p>
          <div className="scene-list">
            {[
              ["01", "AI 训练中心", "分装、装配、装车与动捕采集"],
              ["02", "产品试制中心", "结构、电控与小批样机试制"],
              ["03", "整机性能测试区", "振动、冲击、温湿与动力测试"],
              ["04", "产品发布中心", "产品展示、讲解与方案演示"],
              ["05", "室外综合场", "复杂地形、巡检与任务验证"],
            ].map(([code, name, detail]) => (
              <div key={code}><span>{code}</span><strong>{name}</strong><small>{detail}</small></div>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-strip" id="demo">
        <div>
          <span className="eyebrow">04 / 可交互工作台</span>
          <h2>现在，亲手排布这套<em>中试沙盘。</em></h2>
          <p>添加真实项目中的设备模块，拖动布局、切换视角，并导出一份属于你的沙盘配置。</p>
        </div>
        <div className="hero-meta">
          <button onClick={loadLocal}><strong>打开</strong><span>本地布局</span></button>
          <button onClick={saveLocal}><strong>保存</strong><span>当前布局</span></button>
          <div><strong>{items.length}</strong><span>当前物体</span></div>
        </div>
      </section>

      <section className="workspace">
        <aside className="catalog panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">01 / 资产库</span>
              <h2>拖入一个模块</h2>
            </div>
            <span className="count">{Object.keys(assetInfo).length}</span>
          </div>
          <div className="asset-list">
            {(Object.keys(assetInfo) as AssetKind[]).map((kind) => {
              const info = assetInfo[kind];
              return (
                <button key={kind} className="asset-card" onClick={() => addAsset(kind)}>
                  <span className={`asset-thumb ${info.className}`}>{info.icon}</span>
                  <span><b>{info.name}</b><small>点击添加到画布</small></span>
                  <span className="plus">+</span>
                </button>
              );
            })}
          </div>
          <div className="tip-card">
            <span>TIP</span>
            <p>选择物体后可拖动。按 <kbd>Delete</kbd> 删除，按 <kbd>Ctrl Z</kbd> 撤回。</p>
          </div>
        </aside>

        <div className="stage-wrap">
          <div className="stage-toolbar">
            <div className="segmented">
              {(["indoor", "outdoor", "mixed"] as SceneMode[]).map((item) => (
                <button key={item} className={mode === item ? "active" : ""} onClick={() => changeTemplate(item)}>
                  {item === "indoor" ? "室内" : item === "outdoor" ? "室外" : "混合"}
                </button>
              ))}
            </div>
            <div className="tool-row">
              <button title="撤回" onClick={undo}>↶</button>
              <button title="删除" onClick={removeSelected}>⌫</button>
              <span />
              <button className={view === "perspective" ? "active" : ""} onClick={() => setView("perspective")}>3D</button>
              <button className={view === "top" ? "active" : ""} onClick={() => setView("top")}>2D</button>
            </div>
          </div>

          <div className={`stage ${view}`} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <div className="stage-label"><span className="live-dot" /> LIVE SCENE / {mode.toUpperCase()}</div>
            <div className="scene-shadow" />
            <div className="board" ref={boardRef} onPointerDown={() => setSelected(null)}>
              <div className="zone zone-a">展示区 A</div>
              <div className="zone zone-b">测试区 B</div>
              {items.map((item) => {
                const info = assetInfo[item.kind];
                return (
                  <button
                    key={item.id}
                    className={`scene-object ${info.className} ${selected === item.id ? "selected" : ""}`}
                    style={{ left: `${item.x}%`, top: `${item.y}%`, "--accent": item.color, transform: `translate(-50%, -50%) rotate(${item.rotation}deg)` } as React.CSSProperties}
                    onPointerDown={(event) => startDrag(event, item)}
                    aria-label={info.name}
                  >
                    <span className="object-body"><i /><b>{info.icon}</b></span>
                    <span className="object-label">{info.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="axis"><i className="x">X</i><i className="y">Y</i><i className="z">Z</i></div>
            <div className="zoom-control"><button>＋</button><span>100%</span><button>－</button></div>
          </div>
        </div>

        <aside className="inspector panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">02 / 属性</span>
              <h2>对象设置</h2>
            </div>
          </div>
          {selectedItem ? (
            <div className="property-content">
              <div className="selection-card">
                <span className={`asset-thumb ${assetInfo[selectedItem.kind].className}`}>{assetInfo[selectedItem.kind].icon}</span>
                <span><b>{assetInfo[selectedItem.kind].name}</b><small>ID · {String(selectedItem.id).padStart(3, "0")}</small></span>
                <span className="status-dot" />
              </div>
              <label>位置 X / Y</label>
              <div className="coordinate-row">
                <div><span>X</span><strong>{selectedItem.x.toFixed(0)}</strong></div>
                <div><span>Y</span><strong>{selectedItem.y.toFixed(0)}</strong></div>
              </div>
              <label htmlFor="rotation">旋转角度 <b>{selectedItem.rotation}°</b></label>
              <input id="rotation" type="range" min="-180" max="180" value={selectedItem.rotation} onChange={(e) => updateRotation(Number(e.target.value))} />
              <div className="color-row">
                <span>模块标识色</span>
                <i style={{ background: selectedItem.color }} />
              </div>
              <button className="danger-btn" onClick={removeSelected}>从场景中删除</button>
            </div>
          ) : (
            <div className="empty-state"><span>↖</span><p>选择画布中的物体<br />查看和修改属性</p></div>
          )}
          <div className="io-box">
            <h3>分享这份布局</h3>
            <p>导出 JSON，别人导入后即可继续编辑。</p>
            <div>
              <button onClick={exportScene}>导出</button>
              <button onClick={() => fileRef.current?.click()}>导入</button>
            </div>
            <input ref={fileRef} hidden type="file" accept=".json,application/json" onChange={importScene} />
          </div>
        </aside>
      </section>

      <section className="delivery-section" id="delivery">
        <div className="proof-heading">
          <div>
            <span className="section-kicker">05 / 项目交付</span>
            <h2>把一次建模任务，变成完整产品工作流</h2>
          </div>
          <p>我的价值不只在建模本身，而在于把需求、数字资产、网页交互、场景方案和打印交付串成一套能被团队使用的系统。</p>
        </div>
        <div className="delivery-flow">
          {deliveryFlow.map(([code, title, detail]) => (
            <article key={code}>
              <span>{code}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
            </article>
          ))}
        </div>
        <div className="deliverable-grid">
          <div>
            <span>WEB</span><strong>浏览器工作台</strong>
            <p>单件检视、3D沙盘、模型库、历史方案、文件下载。</p>
          </div>
          <div>
            <span>3D</span><strong>多格式数字资产</strong>
            <p>GLB网页预览，STL / STP / 3MF 打印与工程交付思路。</p>
          </div>
          <div>
            <span>PM</span><strong>产品与协调</strong>
            <p>需求拆解、交互定义、版本验收、反馈闭环与部署协调。</p>
          </div>
        </div>
      </section>

      <footer>
        <p><strong>机器人中试平台数字沙盘作品集</strong> · 仅公司名称与品牌标识已匿名化</p>
        <div>
          <a href="https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio/fork" target="_blank" rel="noreferrer">Fork 一份</a>
          <a href="https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio/archive/refs/heads/main.zip">下载源码</a>
        </div>
      </footer>
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
