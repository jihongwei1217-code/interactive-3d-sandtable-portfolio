"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AssetKind = "robot" | "bench" | "screen" | "tree" | "operator";
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
  bench: { name: "测试工作台", icon: "B", color: "#22c7a9", className: "bench" },
  screen: { name: "信息看板", icon: "S", color: "#5d7cff", className: "screen" },
  tree: { name: "景观绿植", icon: "T", color: "#79c267", className: "tree" },
  operator: { name: "操作人员", icon: "P", color: "#e7b64d", className: "operator" },
};

const templates: Record<SceneMode, SceneItem[]> = {
  indoor: [
    { id: 1, kind: "bench", x: 28, y: 32, rotation: 0, color: "#22c7a9" },
    { id: 2, kind: "robot", x: 52, y: 50, rotation: -12, color: "#ff6838" },
    { id: 3, kind: "screen", x: 70, y: 27, rotation: 0, color: "#5d7cff" },
    { id: 4, kind: "operator", x: 70, y: 66, rotation: 14, color: "#e7b64d" },
  ],
  outdoor: [
    { id: 1, kind: "tree", x: 23, y: 24, rotation: 0, color: "#79c267" },
    { id: 2, kind: "tree", x: 76, y: 23, rotation: 0, color: "#79c267" },
    { id: 3, kind: "robot", x: 49, y: 48, rotation: 12, color: "#ff6838" },
    { id: 4, kind: "operator", x: 65, y: 70, rotation: 0, color: "#e7b64d" },
  ],
  mixed: [
    { id: 1, kind: "bench", x: 28, y: 35, rotation: 0, color: "#22c7a9" },
    { id: 2, kind: "screen", x: 67, y: 27, rotation: 0, color: "#5d7cff" },
    { id: 3, kind: "robot", x: 52, y: 53, rotation: -15, color: "#ff6838" },
    { id: 4, kind: "tree", x: 78, y: 68, rotation: 0, color: "#79c267" },
    { id: 5, kind: "operator", x: 28, y: 69, rotation: 12, color: "#e7b64d" },
  ],
};

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
          <span>3D 沙盘实验室</span>
          <span className="open-badge">OPEN TEMPLATE</span>
        </div>
        <div className="top-actions">
          <button className="ghost-btn" onClick={loadLocal}>打开布局</button>
          <button className="primary-btn" onClick={saveLocal}>保存布局</button>
          <a className="github-btn" href="https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio" target="_blank" rel="noreferrer">
            GitHub 源码 ↗
          </a>
        </div>
      </header>

      <section className="hero-strip">
        <div>
          <span className="eyebrow">可交互 · 可复制 · 已脱敏</span>
          <h1>把想法拖进场景，<em>搭出你的系统。</em></h1>
          <p>这是作品的公开演示版。选择模块、拖动布局、切换视角，并导出一份属于你的沙盘配置。</p>
        </div>
        <div className="hero-meta">
          <div><strong>{items.length}</strong><span>场景物体</span></div>
          <div><strong>100%</strong><span>浏览器运行</span></div>
          <div><strong>MIT</strong><span>模板许可</span></div>
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

      <footer>
        <p><strong>3D Sandtable Starter</strong> · 公开演示模板，不包含企业私有模型与数据</p>
        <div>
          <a href="https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio/fork" target="_blank" rel="noreferrer">Fork 一份</a>
          <a href="https://github.com/jihongwei1217-code/interactive-3d-sandtable-portfolio/archive/refs/heads/main.zip">下载源码</a>
        </div>
      </footer>
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
