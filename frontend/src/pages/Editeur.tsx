import { Link } from "react-router-dom";
import { site } from "../config/site";
import {
  MousePointer2, Type, StickyNote, Cable, GripHorizontal, Plus, Trash2, X, RotateCw, Focus, Settings, Download, Upload, ChevronDown, File, Pencil, Undo2, Redo2
} from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useDraggable } from "../hooks/useDraggable";
import { PostItCard, type PostitData } from "../components/PostItCard";
import AddComponentWizard, { type ComponentItem } from "../components/AddComponentWizard";

type Tool = "select" | "wire" | "text" | "postit";

// ComponentItem is imported from AddComponentWizard

interface TextElement {
  id: number;
  x: number;
  y: number;
  content: string;
  color: string;
  fontSize: number;
  editing: boolean;
}

interface CanvasComponent {
  id: number;
  componentId: number; // reference to base ComponentItem
  x: number;
  y: number;
  rotation: number;
}

interface WireConnection {
  canvasComponentId: number;
  pinId: number;
}

interface Wire {
  id: number;
  points: { x: number; y: number }[];
  color: string;
  startConn?: WireConnection;
  endConn?: WireConnection;
}

// ─── Helper functions ───────────────────────────────────────────────────────
// snapToGrid will be passed as a prop or defined in context

function generateOrthogonalPath(A: {x: number, y: number}, B: {x: number, y: number}) {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const minD = Math.min(Math.abs(dx), Math.abs(dy));
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  
  const mid = { x: A.x + minD * sx, y: A.y + minD * sy };
  const points = [A];
  if (mid.x !== A.x || mid.y !== A.y) points.push(mid);
  if (B.x !== mid.x || B.y !== mid.y) points.push(B);
  return points.length > 1 ? points : [A, B]; // ensure at least a segment
}

// ─── Grip bar shared ────────────────────────────────────────────────────────
function GripBar({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-full bg-gray-200 hover:bg-gray-300 flex justify-center py-1.5 cursor-move transition-colors shrink-0"
    >
      <GripHorizontal size={16} className="text-gray-500 pointer-events-none" />
    </div>
  );
}

// ─── Tool button ─────────────────────────────────────────────────────────────
function ToolButton({
  icon, label, isActive, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
        isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
    </button>
  );
}

// ─── Inline text element on canvas ───────────────────────────────────────────
function CanvasTextEl({
  el,
  zoom,
  onUpdate,
  onDelete,
}: {
  el: TextElement;
  zoom: number;
  onUpdate: (id: number, updates: Partial<TextElement>) => void;
  onDelete: (id: number) => void;
}) {
  const FONT_SIZES = [12, 14, 16, 20, 24, 32, 48];

  return (
    <div
      className="absolute z-20"
      style={{ left: el.x, top: el.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Barre de contrôle au-dessus */}
      {el.editing && (
        <div style={{ position: "absolute", bottom: "100%", left: 0, paddingBottom: `${5 / zoom}px`, pointerEvents: "none" }}>
          <div
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg shadow-md px-2 py-1 w-max"
            style={{
              transform: `scale(${1 / zoom})`,
              transformOrigin: "bottom left",
              pointerEvents: "auto",
            }}
          >
            <select
              value={el.fontSize}
              onChange={(e) => onUpdate(el.id, { fontSize: Number(e.target.value) })}
              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none cursor-pointer"
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
            <input
              type="color"
              value={el.color}
              onChange={(e) => onUpdate(el.id, { color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border border-gray-200"
              title="Couleur"
            />
            <button
              onClick={() => onDelete(el.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Zone de texte */}
      <textarea
        autoFocus={el.editing}
        onClick={() => !el.editing && onUpdate(el.id, { editing: true })}
        value={el.content}
        onChange={(e) => onUpdate(el.id, { content: e.target.value })}
        onBlur={() => {
          if (!el.content.trim()) onDelete(el.id);
          else onUpdate(el.id, { editing: false });
        }}
        placeholder="Tapez votre texte..."
        className="bg-transparent outline-none resize-none min-w-[120px] min-h-[32px]"
        style={{
          color: el.color,
          fontSize: el.fontSize,
          lineHeight: 1.3,
          border: el.editing ? "1px dashed #94a3b8" : "1px solid transparent",
          borderRadius: 4,
          padding: 4,
        }}
        rows={1}
        onInput={(e) => {
          const t = e.currentTarget;
          t.style.height = "auto";
          t.style.height = t.scrollHeight + "px";
        }}
      />
    </div>
  );
}

// ─── Canvas Component Element ────────────────────────────────────────────────
function CanvasComponentEl({
  el,
  component,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  zoom,
  activeTool,
  snapToGrid,
}: {
  el: CanvasComponent;
  component?: ComponentItem;
  onUpdate: (id: number, updates: Partial<CanvasComponent>) => void;
  onDelete: (id: number) => void;
  isSelected: boolean;
  onSelect: () => void;
  zoom: number;
  activeTool: Tool;
  snapToGrid: (val: number) => number;
}) {
  const PX_PER_MM = 2.5;

  if (!component) return null;

  const widthPx = component.widthMm * PX_PER_MM;
  const heightPx = component.heightMm * PX_PER_MM;

  const handleRotate = () => {
    onUpdate(el.id, { rotation: (el.rotation + 90) % 360 });
  };

  return (
    <div
      data-canvas-component="true"
      className={`absolute z-10 ${activeTool === "select" ? "cursor-move" : ""} ${isSelected ? "ring-2 ring-blue-500 rounded-md" : ""}`}
      style={{
        left: el.x,
        top: el.y,
        width: widthPx,
        height: heightPx,
        transform: `rotate(${el.rotation}deg)`,
        transformOrigin: "center center",
        pointerEvents: activeTool === "wire" ? "none" : "auto",
      }}
      onMouseDown={(e) => {
        if (activeTool === "wire") return;
        e.stopPropagation();
        onSelect();
        // Request focus on the main canvas to enable keyboard events
        const canvasMain = document.querySelector('main[tabindex="0"]') as HTMLElement;
        if (canvasMain) canvasMain.focus();
        if (activeTool !== "select") return;
        if (e.button !== 0) return; // only left click
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startElX = el.x;
        const startElY = el.y;

        const handleMove = (ev: MouseEvent) => {
          const rawX = startElX + (ev.clientX - startX) / zoom;
          const rawY = startElY + (ev.clientY - startY) / zoom;
          onUpdate(el.id, { x: snapToGrid(rawX), y: snapToGrid(rawY) });
        };
        const handleUp = () => {
          window.removeEventListener("mousemove", handleMove);
          window.removeEventListener("mouseup", handleUp);
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
      }}
    >
      {isSelected && (
        // Wrapper positioned at top of component in canvas space
        <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, display: "flex", justifyContent: "center", paddingBottom: `${5 / zoom}px`, pointerEvents: "none" }}>
          <div
            className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1"
            style={{
              // Counter-rotate + counter-zoom → constant screen size
              transform: `rotate(${-el.rotation}deg) scale(${1 / zoom})`,
              transformOrigin: "center bottom",
              whiteSpace: "nowrap",
              pointerEvents: "auto",
            }}
          >
            <button onClick={handleRotate} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Tourner (90°)">
              <RotateCw size={14} />
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <button onClick={() => onDelete(el.id)} className="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Supprimer">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
      
      {component.imageDataUrl ? (
        <img
          src={component.imageDataUrl}
          alt={component.name}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-xs text-center font-mono">{component.name}</span>
        </div>
      )}

      {/* Render persistent labels & pins (readonly) */}
      {(component.labels || []).map(label => (
        <div
          key={label.id}
          className="absolute"
          style={{
            left: `${label.x}%`, top: `${label.y}%`,
            transform: `translate(-50%, -50%) rotate(${label.rotation}deg)`,
            pointerEvents: "none",
            background: "rgba(37, 99, 235, 0.85)",
            color: "#fff",
            padding: "0.1em 0.4em",
            borderRadius: "0.25rem",
            fontWeight: 600,
            fontSize: `${Math.max(1, label.fontSize * (widthPx / 150))}px`,
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono)"
          }}
        >
          {label.text}
        </div>
      ))}
      {(component.pins || []).map(pin => (
        <div
          key={pin.id}
          className="absolute z-20"
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            width: 0,
            height: 0,
          }}
        >
          {/* Pin marker: constant screen size regardless of zoom */}
          <div style={{
            position: "absolute",
            transform: `translate(-50%, -50%) scale(${1 / zoom})`,
            transformOrigin: "center center",
            height: "16px",
            minWidth: "16px",
            padding: "0 6px",
            borderRadius: "8px",
            background: "#e11d48",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px #e11d48, 0 2px 4px rgba(225,29,72,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}>
            <span style={{ color: "#fff", fontSize: "9px", fontFamily: "var(--font-mono)", fontWeight: 700, lineHeight: 1 }}>{pin.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Minimap ─────────────────────────────────────────────────────────────────
function Minimap({
  camera, setCamera,
  postits, canvasComponents, components, textElements
}: {
  camera: { x: number, y: number, z: number };
  setCamera: React.Dispatch<React.SetStateAction<{ x: number, y: number, z: number }>>;
  postits: PostitData[];
  canvasComponents: CanvasComponent[];
  components: ComponentItem[];
  textElements: TextElement[];
}) {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight - 64; // header offset

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  let hasContent = false;

  postits.forEach(p => {
    hasContent = true;
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + p.width); maxY = Math.max(maxY, p.y + p.height);
  });
  textElements.forEach(t => {
    hasContent = true;
    minX = Math.min(minX, t.x); minY = Math.min(minY, t.y);
    maxX = Math.max(maxX, t.x + 100); maxY = Math.max(maxY, t.y + 30);
  });
  canvasComponents.forEach(c => {
    const comp = components.find(cp => cp.id === c.componentId);
    if (comp) {
      hasContent = true;
      const w = comp.widthMm * 2.5;
      const h = comp.heightMm * 2.5;
      minX = Math.min(minX, c.x); minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + w); maxY = Math.max(maxY, c.y + h);
    }
  });

  // If empty, fallback to current view
  if (!hasContent) {
    minX = -camera.x / camera.z;
    minY = -camera.y / camera.z;
    maxX = minX + viewportW / camera.z;
    maxY = minY + viewportH / camera.z;
  }
  
  const contentMinX = minX;
  const contentMinY = minY;
  const contentMaxX = maxX;
  const contentMaxY = maxY;

  // View bounds for map scaling
  minX = Math.min(minX, -camera.x / camera.z);
  minY = Math.min(minY, -camera.y / camera.z);
  maxX = Math.max(maxX, -camera.x / camera.z + viewportW / camera.z);
  maxY = Math.max(maxY, -camera.y / camera.z + viewportH / camera.z);
  
  const padding = 200;
  minX -= padding; minY -= padding; maxX += padding; maxY += padding;

  const mapW = 160;
  const mapH = 120;
  const scaleX = mapW / (maxX - minX);
  const scaleY = mapH / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);
  
  const contentW = (maxX - minX) * scale;
  const contentH = (maxY - minY) * scale;
  const offsetX = (mapW - contentW) / 2;
  const offsetY = (mapH - contentH) / 2;

  const toMapX = (x: number) => offsetX + (x - minX) * scale;
  const toMapY = (y: number) => offsetY + (y - minY) * scale;
  const toMapW = (w: number) => w * scale;
  const toMapH = (h: number) => h * scale;

  const vpX = toMapX(-camera.x / camera.z);
  const vpY = toMapY(-camera.y / camera.z);
  const vpW = toMapW(viewportW / camera.z);
  const vpH = toMapH(viewportH / camera.z);

  const handleMapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const canvasCenterX = minX + (mx - offsetX) / scale;
    const canvasCenterY = minY + (my - offsetY) / scale;
    
    setCamera({
      ...camera,
      x: -(canvasCenterX * camera.z) + viewportW / 2,
      y: -(canvasCenterY * camera.z) + viewportH / 2
    });
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasContent) return;
    const cx = (contentMinX + contentMaxX) / 2;
    const cy = (contentMinY + contentMaxY) / 2;
    const cw = contentMaxX - contentMinX + 100; // 100px padding
    const ch = contentMaxY - contentMinY + 100;
    
    // fit zoom to screen
    let targetZ = Math.min(viewportW / cw, viewportH / ch);
    targetZ = Math.min(Math.max(0.1, targetZ), 2); // clamp zoom

    setCamera({
      x: -(cx * targetZ) + viewportW / 2,
      y: -(cy * targetZ) + viewportH / 2,
      z: targetZ
    });
  };

  return (
    <div 
      className="absolute right-6 top-24 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-40 cursor-crosshair group"
      style={{ width: mapW, height: mapH }}
      onMouseDown={handleMapClick}
      title="Minimap (cliquez pour vous déplacer)"
    >
      <div className="absolute inset-0 bg-gray-50" />
      {postits.map(p => (
        <div key={`p${p.id}`} className="absolute bg-yellow-300 rounded-sm opacity-60" style={{ left: toMapX(p.x), top: toMapY(p.y), width: toMapW(p.width), height: toMapH(p.height) }} />
      ))}
      {textElements.map(t => (
        <div key={`t${t.id}`} className="absolute bg-gray-400 rounded-sm opacity-60" style={{ left: toMapX(t.x), top: toMapY(t.y), width: toMapW(50), height: toMapH(20) }} />
      ))}
      {canvasComponents.map(c => {
        const comp = components.find(cp => cp.id === c.componentId);
        if (!comp) return null;
        const w = comp.widthMm * 2.5;
        const h = comp.heightMm * 2.5;
        return <div key={`c${c.id}`} className="absolute bg-blue-400 rounded-sm opacity-60" style={{ left: toMapX(c.x), top: toMapY(c.y), width: toMapW(w), height: toMapH(h) }} />
      })}
      <div className="absolute border-[1.5px] border-red-500 bg-red-500/10 pointer-events-none transition-all duration-75" style={{ left: vpX, top: vpY, width: vpW, height: vpH }} />
      
      <button 
        className="absolute bottom-2 right-2 bg-white/80 backdrop-blur border border-gray-200 p-1.5 rounded-md shadow-sm text-gray-500 hover:text-blue-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        onMouseDown={handleRecenter}
        title="Recentrer"
      >
        <Focus size={14} />
      </button>
    </div>
  );
}

// ─── Editeur ─────────────────────────────────────────────────────────────────
const loadInitialState = () => {
  const savedProject = localStorage.getItem("snailwire_project");
  if (savedProject) {
    try {
      const parsed = JSON.parse(savedProject);
      return parsed || {};
    } catch(e) {}
  }
  return {};
};

export default function Editeur() {
  const initialState = loadInitialState();

  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState("#000000");
  const colors = [
    "#000000", "#FFFFFF", "#E11D48", "#16A34A", "#2563EB", 
    "#CA8A04", "#9333EA", "#06B6D4", "#F97316", "#8B5CF6"
  ];

  // Components panel
  const [components, setComponents] = useState<ComponentItem[]>(() => {
    const saved = localStorage.getItem("snailwire_components");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return parsed || [];
      } catch (e) {}
    }
    return [];
  });
  
  useEffect(() => {
    localStorage.setItem("snailwire_components", JSON.stringify(components));
  }, [components]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);

  // Canvas elements
  const [textElements, setTextElements] = useState<TextElement[]>(initialState.textElements || []);
  const [postits, setPostits] = useState<PostitData[]>(initialState.postits || []);
  const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>(initialState.canvasComponents || []);
  const [selectedCanvasComp, setSelectedCanvasComp] = useState<number | null>(null);
  const [camera, setCamera] = useState(initialState.camera || { x: 0, y: 0, z: 1 });
  const [isPanning, setIsPanning] = useState(false);

  // Prevent body scrolling while in editor
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Wires
  const [wires, setWires] = useState<Wire[]>(initialState.wires || []);
  const [pendingWire, setPendingWire] = useState<{ points: {x:number,y:number}[]; startConn: WireConnection | null } | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<number | null>(null);
  const [wireMenuPos, setWireMenuPos] = useState<{x: number, y: number} | null>(null);

  // Settings & Project Name
  const [projectName, setProjectName] = useState(initialState.projectName || "Nouveau Projet");
  
  const defaultShortcuts = { select: 'v', wire: 'w', text: 't', postit: 'p' };
  const loadedSettings = initialState.settings || {};
  const [settings, setSettings] = useState({ 
    wireWidth: 2, gridSize: 12, snapEnabled: true,
    ...loadedSettings,
    shortcuts: { ...defaultShortcuts, ...(loadedSettings.shortcuts || {}) }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listeningKeyFor, setListeningKeyFor] = useState<string | null>(null);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);

  // File Handlers
  const handleExport = () => {
    const usedComponentIds = new Set(canvasComponents.map((c) => c.componentId));
    const exportedComponents = components.filter((c) => usedComponentIds.has(c.id));
    const data = JSON.stringify({ 
      textElements, postits, canvasComponents, wires, camera, settings, projectName,
      components: exportedComponents
    });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFileMenuOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.textElements) setTextElements(data.textElements);
        if (data.postits) setPostits(data.postits);
        if (data.canvasComponents) setCanvasComponents(data.canvasComponents);
        if (data.wires) setWires(data.wires);
        if (data.camera) setCamera(data.camera);
        if (data.settings) setSettings(data.settings);
        if (data.projectName) setProjectName(data.projectName);
        if (data.components) {
          setComponents(prev => {
            const newComps = [...prev];
            data.components.forEach((importedComp: ComponentItem) => {
              if (!newComps.find(c => c.id === importedComp.id)) {
                newComps.push(importedComp);
              }
            });
            return newComps;
          });
        }
      } catch(err) {
        alert("Fichier invalide");
      }
    };
    reader.readAsText(file);
    setFileMenuOpen(false);
    // Reset input value to allow importing the same file again if needed
    e.target.value = "";
  };

  const handleNewProject = () => {
    if (confirm("Voulez-vous vraiment tout effacer ?")) {
      setTextElements([]);
      setPostits([]);
      setCanvasComponents([]);
      setWires([]);
      setCamera({ x: 0, y: 0, z: 1 });
    }
    setFileMenuOpen(false);
  };

  // ── Helper functions for canvas logic
  const snapToGrid = useCallback((val: number) => {
    return settings.snapEnabled ? Math.round(val / settings.gridSize) * settings.gridSize : val;
  }, [settings.gridSize, settings.snapEnabled]);

  // Stable refs for use in closures
  const canvasComponentsRef = useRef(canvasComponents);
  // ─── HISTORY UNDO / REDO ───
  const historyRef = useRef<any[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    historyRef.current = [{ textElements, postits, canvasComponents, wires }];
    historyIndexRef.current = 0;
  }, []);

  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const currentState = { textElements, postits, canvasComponents, wires };
      let hist = historyRef.current.slice(0, historyIndexRef.current + 1);
      
      const lastState = hist[hist.length - 1];
      if (lastState && JSON.stringify(lastState) === JSON.stringify(currentState)) return;

      hist.push(currentState);
      if (hist.length > 50) hist.shift();
      historyRef.current = hist;
      historyIndexRef.current = hist.length - 1;
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [textElements, postits, canvasComponents, wires]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const state = historyRef.current[historyIndexRef.current];
      isUndoRedoRef.current = true;
      setTextElements(state.textElements);
      setPostits(state.postits);
      setCanvasComponents(state.canvasComponents);
      setWires(state.wires);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const state = historyRef.current[historyIndexRef.current];
      isUndoRedoRef.current = true;
      setTextElements(state.textElements);
      setPostits(state.postits);
      setCanvasComponents(state.canvasComponents);
      setWires(state.wires);
    }
  }, []);

  useEffect(() => { canvasComponentsRef.current = canvasComponents; }, [canvasComponents]);
  const componentsRef = useRef(components);
  useEffect(() => { componentsRef.current = components; }, [components]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("snailwire_project", JSON.stringify({
        textElements, postits, canvasComponents, wires, camera, settings, projectName
      }));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [textElements, postits, canvasComponents, wires, camera, settings, projectName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA";
      
      // Undo / Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          if (!isInput) {
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          if (!isInput) {
            e.preventDefault();
            handleRedo();
          }
        }
      }

      // Tool shortcuts
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey && !listeningKeyFor) {
        const key = e.key.toLowerCase();
        if (key === settings.shortcuts.select) setActiveTool('select');
        if (key === settings.shortcuts.wire) setActiveTool('wire');
        if (key === settings.shortcuts.text) setActiveTool('text');
        if (key === settings.shortcuts.postit) setActiveTool('postit');
      }

      if (e.key === "Escape") {
        setActiveTool("select");
        setFileMenuOpen(false);
        setSettingsOpen(false);
        if (pendingWire && pendingWire.points.length > 1) {
          setWires(prev => [...prev, { id: Date.now(), points: pendingWire.points, color: activeColor, startConn: pendingWire.startConn ?? undefined }]);
        }
        setPendingWire(null);
        setSelectedWireId(null);
        setWireMenuPos(null);
      } else if (e.key === "Delete" && selectedWireId !== null) {
        setWires(prev => prev.filter(w => w.id !== selectedWireId));
        setSelectedWireId(null);
        setWireMenuPos(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingWire, activeColor, selectedWireId, handleUndo, handleRedo, settings.shortcuts, listeningKeyFor]);

  // Close file menu on outside click (separate effect to avoid drag interference)
  const fileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fileMenuOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false);
      }
    };
    // Delay slightly so the button's own click doesn't immediately close it
    const id = setTimeout(() => window.addEventListener("mousedown", handleMouseDown), 10);
    return () => {
      clearTimeout(id);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [fileMenuOpen]);

  const canvasRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.002;
      setCamera(prevCam => {
        const newZ = Math.min(Math.max(0.1, prevCam.z - e.deltaY * zoomSensitivity), 50);
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const ratio = newZ / prevCam.z;
        const dx = (mouseX - prevCam.x) * (1 - ratio);
        const dy = (mouseY - prevCam.y) * (1 - ratio);
        return { x: prevCam.x + dx, y: prevCam.y + dy, z: newZ };
      });
    };
    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, []);

  const screenToCanvas = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (clientX - rect.left - camera.x) / camera.z,
      y: (clientY - rect.top - camera.y) / camera.z,
    };
  };

  // Draggables for the two panels
  const compPanel = useDraggable({ x: 24, y: 100 });
  const toolPanel = useDraggable({ x: 310, y: 100 });

  // Helper: get absolute world position of a pin on a placed component
  const getPinWorldPos = (canvasComp: CanvasComponent, compDef: ComponentItem, pinId: number) => {
    const pin = (compDef.pins || []).find(p => p.id === pinId);
    if (!pin) return null;
    const w = compDef.widthMm * 2.5, h = compDef.heightMm * 2.5;
    const cx = canvasComp.x + w / 2, cy = canvasComp.y + h / 2;
    const localX = w * (pin.x / 100) - w / 2;
    const localY = h * (pin.y / 100) - h / 2;
    const rad = (canvasComp.rotation * Math.PI) / 180;
    return { x: cx + localX * Math.cos(rad) - localY * Math.sin(rad), y: cy + localX * Math.sin(rad) + localY * Math.cos(rad) };
  };

  // Helper: snap cursor to nearby pins or free wire endpoints, returns pos + connection info
  const getSnappedPosition = (rawPos: {x:number,y:number}): { pos: {x:number,y:number}; conn: WireConnection | null } => {
    const SNAP_DIST = 18 / camera.z;
    let closestDist = SNAP_DIST;
    let snappedPos = rawPos;
    let conn: WireConnection | null = null;

    // Snap to component pins
    canvasComponents.forEach(c => {
      const comp = components.find(cp => cp.id === c.componentId);
      if (!comp) return;
      (comp.pins || []).forEach(pin => {
        const pinPos = getPinWorldPos(c, comp, pin.id);
        if (!pinPos) return;
        const dist = Math.sqrt((rawPos.x - pinPos.x) ** 2 + (rawPos.y - pinPos.y) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          snappedPos = pinPos;
          conn = { canvasComponentId: c.id, pinId: pin.id };
        }
      });
    });

    // Also snap to free wire endpoints (endpoints without a connection)
    wires.forEach(w => {
      const checkEndpoint = (pt: {x:number,y:number}) => {
        const dist = Math.sqrt((rawPos.x - pt.x) ** 2 + (rawPos.y - pt.y) ** 2);
        if (dist < closestDist) { closestDist = dist; snappedPos = pt; conn = null; }
      };
      if (!w.startConn) checkEndpoint(w.points[0]);
      if (!w.endConn) checkEndpoint(w.points[w.points.length - 1]);
    });

    return { pos: snappedPos, conn };
  };

  // Helper: point-to-segment distance for wire click detection
  const pointToSegmentDist = (p:{x:number,y:number}, a:{x:number,y:number}, b:{x:number,y:number}) => {
    const dx = b.x-a.x, dy = b.y-a.y, lenSq = dx*dx+dy*dy;
    if (lenSq === 0) return Math.sqrt((p.x-a.x)**2+(p.y-a.y)**2);
    const t = Math.max(0, Math.min(1, ((p.x-a.x)*dx+(p.y-a.y)*dy)/lenSq));
    return Math.sqrt((p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2);
  };

  const getWireAtPoint = (canvasPos: {x:number,y:number}): number | null => {
    const threshold = 7 / camera.z;
    for (const w of wires) {
      for (let i = 0; i < w.points.length - 1; i++) {
        if (pointToSegmentDist(canvasPos, w.points[i], w.points[i+1]) < threshold) return w.id;
      }
    }
    return null;
  };

  const getConstrainedPosition = (lastPt: {x:number,y:number}, target: {x:number,y:number}) => {
    const dx = target.x - lastPt.x, dy = target.y - lastPt.y;
    const angle = Math.atan2(dy, dx);
    const roundedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
    const dist = Math.sqrt(dx*dx + dy*dy);
    return { x: lastPt.x + Math.cos(roundedAngle) * dist, y: lastPt.y + Math.sin(roundedAngle) * dist };
  };

  // ── Add component (called by wizard on finish)
  const handleAddComponent = (data: Omit<ComponentItem, "id">) => {
    setComponents((prev) => [...prev, { id: Date.now() + Math.random(), ...data }]);
    setWizardOpen(false);
  };

  const handleEditComponent = (comp: ComponentItem) => {
    setComponents((prev) => prev.map((c) => (c.id === comp.id ? comp : c)));
    setWizardOpen(false);
    setEditingComponent(null);
  };

  // ── Canvas mousedown
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (activeTool !== "wire") setSelectedCanvasComp(null);
    if (activeTool === "text") {
      return; // handled on mouseup to allow focus
    } else if (activeTool === "postit") {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setPostits(prev => [...prev, { id: Date.now(), x: snapToGrid(pos.x), y: snapToGrid(pos.y), width: 220, height: 160, content: "" }]);
    } else if (activeTool === "wire") {
      if (e.button === 2) { // Right-click: stop wire
        e.preventDefault();
        if (pendingWire && pendingWire.points.length > 1) {
          setWires(prev => [...prev, { id: Date.now(), points: pendingWire.points, color: activeColor, startConn: pendingWire.startConn ?? undefined }]);
        }
        setPendingWire(null);
        return;
      }
      if (e.button !== 0) return;

      const rawPos = screenToCanvas(e.clientX, e.clientY);
      const { pos: snappedPos, conn } = getSnappedPosition(rawPos);
      const isSnapped = snappedPos.x !== rawPos.x || snappedPos.y !== rawPos.y;

      if (pendingWire) {
        let newPoints = [...pendingWire.points];
        if (isSnapped) {
          // Snap to target: generate orthogonal connection to ensure 45/90 deg
          const lastPt = pendingWire.points[pendingWire.points.length - 1];
          const orthoPath = generateOrthogonalPath(lastPt, snappedPos);
          // orthoPath includes lastPt, so we slice it to avoid duplicate
          newPoints = [...pendingWire.points.slice(0, -1), ...orthoPath];
          
          setWires(prev => [...prev, { id: Date.now(), points: newPoints, color: activeColor, startConn: pendingWire.startConn ?? undefined, endConn: conn ?? undefined }]);
          setPendingWire(null);
        } else {
          // Add intermediate point
          const endPt = getConstrainedPosition(pendingWire.points[pendingWire.points.length - 1], rawPos);
          newPoints.push(endPt);
          setPendingWire({ ...pendingWire, points: newPoints });
        }
      } else {
        // Start a new wire
        setPendingWire({ points: [snappedPos], startConn: conn });
      }
    } else if (activeTool === "select") {
      if (e.button !== 0 && e.button !== 1) return;
      // Only pan if the click landed directly on the canvas or the transform layer, NOT on a component
      if ((e.target as HTMLElement).closest('[data-canvas-component]')) return;
      // Check if clicking on a wire
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const hitWireId = getWireAtPoint(canvasPos);
      if (hitWireId !== null) {
        setSelectedWireId(hitWireId);
        setWireMenuPos({ x: e.clientX, y: e.clientY - 60 });
        return;
      }
      setSelectedWireId(null);
      setWireMenuPos(null);
      // Pan
      setIsPanning(true);
      const startX = e.clientX, startY = e.clientY;
      const startCamX = camera.x, startCamY = camera.y;
      const onMove = (ev: MouseEvent) => {
        setCamera(prev => ({ ...prev, x: startCamX + ev.clientX - startX, y: startCamY + ev.clientY - startY }));
      };
      const onUp = () => {
        setIsPanning(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
  };

  // Double-click: stop wire in void
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (activeTool !== "wire" || !pendingWire) return;
    e.preventDefault();
    if (pendingWire.points.length > 1) {
      setWires(prev => [...prev, { id: Date.now(), points: pendingWire.points, color: activeColor, startConn: pendingWire.startConn ?? undefined }]);
    }
    setPendingWire(null);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    if (activeTool === "text" && e.button === 0) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setTextElements((prev) => [
        ...prev,
        { id: Date.now(), x: snapToGrid(pos.x), y: snapToGrid(pos.y), content: "", color: activeColor, fontSize: 16, editing: true },
      ]);
    }
  };

  // ── Drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const compIdStr = e.dataTransfer.getData("componentId");
    if (compIdStr && canvasRef.current) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setCanvasComponents((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), componentId: parseFloat(compIdStr), x: snapToGrid(pos.x), y: snapToGrid(pos.y), rotation: 0 },
      ]);
      setActiveTool("select"); // switch back to select to manipulate the new component
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateText = (id: number, updates: Partial<TextElement>) => {
    setTextElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };
  const deleteText = (id: number) => setTextElements((prev) => prev.filter((el) => el.id !== id));

  const updatePostit = (id: number, updates: Partial<PostitData>) => {
    setPostits((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };
  const deletePostit = (id: number) => setPostits((prev) => prev.filter((p) => p.id !== id));

  const updateCanvasComponent = useCallback((id: number, updates: Partial<CanvasComponent>) => {
    setCanvasComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    // Update any wire endpoints connected to this component's pins
    if (updates.x !== undefined || updates.y !== undefined || updates.rotation !== undefined) {
      const currentComp = canvasComponentsRef.current.find(c => c.id === id);
      if (!currentComp) return;
      const updatedComp = { ...currentComp, ...updates };
      const compDef = componentsRef.current.find(cd => cd.id === updatedComp.componentId);
      if (!compDef) return;
      setWires(prev => prev.map(w => {
        let changed = false;
        let pts = [...w.points];

        if (w.startConn?.canvasComponentId === id && w.endConn?.canvasComponentId === id) {
          // If both ends are on this same component, just translate all points if it was a move.
          let dx = 0; let dy = 0;
          if (updates.x !== undefined && currentComp.x !== undefined) dx = updates.x - currentComp.x;
          if (updates.y !== undefined && currentComp.y !== undefined) dy = updates.y - currentComp.y;
          if (dx !== 0 || dy !== 0) {
            pts = pts.map(pt => ({ x: pt.x + dx, y: pt.y + dy }));
            changed = true;
          }
          // Note: if rotation changed, we rely on the pin positions, but full point rotation is complex.
          // For simplicity, we just let it translate. If they want to re-route, they can drag handles.
        } else {
          if (w.startConn?.canvasComponentId === id) {
            const p = getPinWorldPos(updatedComp, compDef, w.startConn.pinId);
            if (p) {
              const targetIdx = Math.min(2, pts.length - 1);
              const targetPt = pts[targetIdx];
              const ortho = generateOrthogonalPath(p, targetPt);
              pts.splice(0, targetIdx + 1, ...ortho);
              changed = true;
            }
          }
          if (w.endConn?.canvasComponentId === id) {
            const p = getPinWorldPos(updatedComp, compDef, w.endConn.pinId);
            if (p) {
              const targetIdx = Math.max(0, pts.length - 3);
              const targetPt = pts[targetIdx];
              const ortho = generateOrthogonalPath(targetPt, p);
              const deleteCount = pts.length - targetIdx;
              pts.splice(targetIdx, deleteCount, ...ortho);
              changed = true;
            }
          }
        }
        
        if (changed) {
          return { ...w, points: pts };
        }
        return w;
      }));
    }
  }, []);
  const deleteCanvasComponent = (id: number) => setCanvasComponents((prev) => prev.filter((c) => c.id !== id));

  const handleWirePointMouseDown = (e: React.MouseEvent, wireId: number, pointIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeTool !== "select") return;

    const startX = e.clientX;
    const startY = e.clientY;
    
    // Get the initial point coordinate to apply delta
    const wire = wires.find(w => w.id === wireId);
    if (!wire) return;
    const initialPt = wire.points[pointIndex];

    const onMove = (ev: MouseEvent) => {
      const rawX = initialPt.x + (ev.clientX - startX) / camera.z;
      const rawY = initialPt.y + (ev.clientY - startY) / camera.z;
      
      setWires(prev => prev.map(w => {
        if (w.id === wireId) {
          const pts = [...w.points];
          const rawPt = { x: rawX, y: rawY };
          
          // 1. Cascade constraints forward from start to the dragged point
          for (let j = 1; j < pointIndex; j++) {
            pts[j] = getConstrainedPosition(pts[j - 1], pts[j]);
            pts[j].x = snapToGrid(pts[j].x);
            pts[j].y = snapToGrid(pts[j].y);
          }

          // 2. Cascade constraints backward from end to the dragged point
          for (let j = pts.length - 2; j > pointIndex; j--) {
            pts[j] = getConstrainedPosition(pts[j + 1], pts[j]);
            pts[j].x = snapToGrid(pts[j].x);
            pts[j].y = snapToGrid(pts[j].y);
          }

          // 3. Determine the constrained position of the dragged point itself
          let newPt = { x: snapToGrid(rawPt.x), y: snapToGrid(rawPt.y) };

          if (pointIndex > 0 && pointIndex < pts.length - 1) {
            // Middle point: must satisfy both previous and next points (45/90 deg)
            const p1 = pts[pointIndex - 1];
            const p2 = pts[pointIndex + 1];
            
            const lines1 = [
              { type: 'H', y: p1.y },
              { type: 'V', x: p1.x },
              { type: 'D1', c: p1.y - p1.x },
              { type: 'D2', c: p1.y + p1.x },
            ];
            const lines2 = [
              { type: 'H', y: p2.y },
              { type: 'V', x: p2.x },
              { type: 'D1', c: p2.y - p2.x },
              { type: 'D2', c: p2.y + p2.x },
            ];
            const intersections: {x:number, y:number}[] = [];
            
            for (const l1 of lines1) {
              for (const l2 of lines2) {
                if (l1.type === l2.type) continue;
                let x = 0, y = 0;
                if (l1.type === 'H') {
                  y = l1.y!;
                  if (l2.type === 'V') x = l2.x!;
                  if (l2.type === 'D1') x = y - l2.c!;
                  if (l2.type === 'D2') x = l2.c! - y;
                } else if (l1.type === 'V') {
                  x = l1.x!;
                  if (l2.type === 'H') y = l2.y!;
                  if (l2.type === 'D1') y = x + l2.c!;
                  if (l2.type === 'D2') y = -x + l2.c!;
                } else if (l1.type === 'D1') {
                  if (l2.type === 'H') { y = l2.y!; x = y - l1.c!; }
                  if (l2.type === 'V') { x = l2.x!; y = x + l1.c!; }
                  if (l2.type === 'D2') { y = (l1.c! + l2.c!) / 2; x = y - l1.c!; }
                } else if (l1.type === 'D2') {
                  if (l2.type === 'H') { y = l2.y!; x = l1.c! - y; }
                  if (l2.type === 'V') { x = l2.x!; y = -x + l1.c!; }
                  if (l2.type === 'D1') { y = (l1.c! + l2.c!) / 2; x = y - l2.c!; }
                }
                intersections.push({x, y});
              }
            }
            
            let closest = intersections[0];
            let minDist = Infinity;
            for (const pt of intersections) {
              const d = (pt.x - rawX)**2 + (pt.y - rawY)**2;
              if (d < minDist) {
                minDist = d;
                closest = pt;
              }
            }
            newPt = closest;
          } else if (pointIndex > 0) {
            // Last point
            newPt = getConstrainedPosition(pts[pointIndex - 1], rawPt);
            newPt.x = snapToGrid(newPt.x);
            newPt.y = snapToGrid(newPt.y);
          } else if (pts.length > 1) {
            // First point
            newPt = getConstrainedPosition(pts[1], { x: rawX, y: rawY });
            newPt.x = snapToGrid(newPt.x);
            newPt.y = snapToGrid(newPt.y);
          }
          
          pts[pointIndex] = newPt;
          return { ...w, points: pts };
        }
        return w;
      }));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className="flex-1 w-full overflow-hidden bg-white flex flex-col relative font-sans select-none">
      {/* ── Bandeau ── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm z-50">
        
        {/* Left: Logo & File Menu */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={site.logo.svg} alt={site.name} className="h-10 w-auto" />
            <span className="font-display text-xl font-bold tracking-tight text-ink-950 hidden sm:block">{site.name}</span>
          </Link>
          
          <div className="relative" ref={fileMenuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setFileMenuOpen(!fileMenuOpen); }}
              className="flex items-center gap-1 font-mono text-sm font-medium text-gray-500 hover:text-ink-950"
            >
              Fichier <ChevronDown size={14} />
            </button>
            {fileMenuOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={handleNewProject} className="flex items-center w-full gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                  <File size={16} className="text-gray-400" /> Nouveau
                </button>
                <button onClick={handleExport} className="flex items-center w-full gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                  <Download size={16} className="text-gray-400" /> Exporter
                </button>
                <label className="flex items-center w-full gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left cursor-pointer">
                  <Upload size={16} className="text-gray-400" /> Importer
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Center: Project Name */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-lg font-bold text-center bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-0 rounded px-3 py-1 outline-none transition-colors w-64"
            placeholder="Nom du projet"
          />
        </div>

        {/* Right: Settings & Links */}
        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1 font-mono text-sm font-medium text-gray-500 hover:text-ink-950"
          >
            <Settings size={14} /> Paramètres
          </button>
          {/* <Link to="/tutoriels" className="font-mono text-sm font-medium text-gray-500 hover:text-ink-950">Tutoriels</Link> */}
        </nav>
      </header>

      {/* ── Zone de dessin ── */}
      <main
        ref={canvasRef as React.RefObject<HTMLElement>}
        tabIndex={0}
        className={`flex-1 relative bg-white overflow-hidden outline-none ${isPanning ? "cursor-grabbing" : activeTool === "text" ? "cursor-text" : activeTool === "postit" ? "cursor-crosshair" : activeTool === "wire" ? "cursor-crosshair" : "cursor-default"}`}
        onKeyDown={(e) => {
          if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
          
          if (e.key === "Backspace" || e.key === "Delete") {
            if (selectedCanvasComp !== null) deleteCanvasComponent(selectedCanvasComp);
            return;
          }

          if (selectedCanvasComp !== null && activeTool === "select") {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
              e.preventDefault();
              e.stopPropagation();
              
              const step = e.shiftKey ? 1 : settings.gridSize;
              let dx = 0, dy = 0;
              if (e.key === 'ArrowUp') dy = -step;
              if (e.key === 'ArrowDown') dy = step;
              if (e.key === 'ArrowLeft') dx = -step;
              if (e.key === 'ArrowRight') dx = step;

              setCanvasComponents(prev => prev.map(c => {
                if (c.id === selectedCanvasComp) {
                  // If shift is held, we bypass snapToGrid to allow 1px precision
                  const newX = e.shiftKey ? c.x + dx : snapToGrid(c.x + dx);
                  const newY = e.shiftKey ? c.y + dy : snapToGrid(c.y + dy);
                  return { ...c, x: newX, y: newY };
                }
                return c;
              }));
            }
          }
        }}
        onMouseDown={(e) => {
          canvasRef.current?.focus();
          handleCanvasMouseDown(e);
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseMove={(e) => {
          if (activeTool === "wire") {
            setMousePos(screenToCanvas(e.clientX, e.clientY));
          }
        }}
        onContextMenu={(e) => {
          if (activeTool === "wire" && pendingWire) {
            e.preventDefault();
            handleCanvasMouseDown(e); // Trigger right click logic
          }
        }}
        onMouseUp={handleCanvasMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
      >
          {/* Grid bg */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.15]"
            style={{ 
              backgroundImage: settings.snapEnabled ? "radial-gradient(#94A3B8 1px, transparent 1px)" : "none", 
              backgroundSize: `${settings.gridSize * camera.z}px ${settings.gridSize * camera.z}px`,
              backgroundPosition: `${camera.x}px ${camera.y}px`
            }}
          />

        {/* Espace transformé */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`, 
            transformOrigin: "0 0" 
          }}
        >
          {/* Wires — SVG layer with click interaction */}
          <svg className="absolute inset-0" style={{ width: "100%", height: "100%", overflow: "visible", zIndex: 15, pointerEvents: "none" }}>
            {wires.map(w => (
              <g key={w.id}>
                {/* Invisible wide hit area for easy clicking */}
                <polyline
                  points={w.points.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none" stroke="transparent" strokeWidth={12 / camera.z}
                  style={{ pointerEvents: "stroke", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWireId(w.id);
                    setWireMenuPos({ x: e.clientX, y: e.clientY - 60 });
                  }}
                />
                {/* Visible wire */}
                <polyline
                  points={w.points.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none" stroke={w.color}
                  strokeWidth={settings.wireWidth / camera.z}
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ pointerEvents: "none" }}
                />
                {/* Selection highlight & Draggable Handles */}
                {selectedWireId === w.id && (
                  <>
                    <polyline
                      points={w.points.map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none" stroke="#3B82F6" strokeWidth={4 / camera.z}
                      strokeLinecap="round" strokeLinejoin="round" opacity={0.4}
                      style={{ pointerEvents: "none" }}
                    />
                    {w.points.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x} cy={p.y} r={6 / camera.z}
                        fill="#ffffff" stroke="#3B82F6" strokeWidth={2 / camera.z}
                        style={{ pointerEvents: "auto", cursor: "move" }}
                        onMouseDown={(e) => handleWirePointMouseDown(e, w.id, i)}
                      />
                    ))}
                  </>
                )}
                {/* Free endpoint markers */}
                {!w.startConn && <circle cx={w.points[0].x} cy={w.points[0].y} r={4/camera.z} fill={w.color} opacity={0.7} style={{ pointerEvents: "none" }} />}
                {!w.endConn && <circle cx={w.points[w.points.length-1].x} cy={w.points[w.points.length-1].y} r={4/camera.z} fill={w.color} opacity={0.7} style={{ pointerEvents: "none" }} />}
              </g>
            ))}
            {pendingWire && mousePos && (() => {
              const { pos: snapped, conn } = getSnappedPosition(mousePos);
              const isSnapped = snapped.x !== mousePos.x || snapped.y !== mousePos.y;
              const endPt = isSnapped ? snapped : getConstrainedPosition(pendingWire.points[pendingWire.points.length - 1], mousePos);
              return (
                <>
                  <polyline
                    points={[...pendingWire.points, endPt].map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none" stroke={activeColor} strokeWidth={2 / camera.z}
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={`${6/camera.z},${4/camera.z}`}
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Snap ring (green = pin, blue = wire endpoint) */}
                  {isSnapped && (
                    <circle cx={snapped.x} cy={snapped.y} r={11 / camera.z}
                      fill="none" stroke={conn ? "#16A34A" : "#3B82F6"}
                      strokeWidth={2.5 / camera.z} opacity={0.9}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </>
              );
            })()}
          </svg>

          {/* Textes sur canvas */}
          {textElements.map((el) => (
            <CanvasTextEl key={el.id} el={el} zoom={camera.z} onUpdate={updateText} onDelete={deleteText} />
          ))}

          {/* Post-its */}
          {postits.map((p) => (
            <PostItCard
              key={p.id}
              data={p}
              onDelete={() => deletePostit(p.id)}
              onUpdate={(updates) => updatePostit(p.id, updates)}
              zoom={camera.z}
            />
          ))}

          {/* Canvas Components */}
          {canvasComponents.map((c) => {
            const baseComp = components.find((comp) => comp.id === c.componentId);
            return (
              <CanvasComponentEl
                key={c.id}
                el={c}
                component={baseComp}
                onUpdate={updateCanvasComponent}
                onDelete={deleteCanvasComponent}
                isSelected={selectedCanvasComp === c.id}
                onSelect={() => setSelectedCanvasComp(c.id)}
                zoom={camera.z}
                activeTool={activeTool}
                snapToGrid={snapToGrid}
              />
            );
          })}
        </div>

        <Minimap 
          camera={camera} 
          setCamera={setCamera} 
          postits={postits} 
          canvasComponents={canvasComponents} 
          components={components} 
          textElements={textElements}
        />

        {/* ── Wire selection panel */}
        {selectedWireId !== null && wireMenuPos && (
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 flex items-center gap-2"
            style={{ left: wireMenuPos.x, top: wireMenuPos.y, transform: "translateX(-50%)" }}
            onMouseDown={e => e.stopPropagation()}
          >
            <span className="text-xs text-gray-400 font-mono px-1">Fil</span>
            <div className="w-px h-5 bg-gray-200" />
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setWires(prev => prev.map(w => w.id === selectedWireId ? { ...w, color: c } : w))}
                className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                  wires.find(w => w.id === selectedWireId)?.color === c ? "border-gray-900 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                title={`Couleur`}
              />
            ))}
            <div className="w-px h-5 bg-gray-200" />
            <button
              onClick={() => {
                setWires(prev => prev.filter(w => w.id !== selectedWireId));
                setSelectedWireId(null);
                setWireMenuPos(null);
              }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Supprimer le fil"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => { setSelectedWireId(null); setWireMenuPos(null); }}
              className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
              title="Fermer"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </main>

      {/* ── Panneau Composants ── */}
      <div
        className="absolute z-40 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl resize min-w-[220px] min-h-[200px]"
        style={{
          left: compPanel.pos.x,
          top: compPanel.pos.y,
          width: 280,
          height: 420,
        }}
      >
        <GripBar onMouseDown={compPanel.onMouseDown} />

        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-semibold uppercase text-gray-700">Composants</h2>
            <button
              onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2 py-0.5 rounded-md transition-colors"
              title="Ajouter un composant"
            >
              <Plus size={12} /> Ajouter
            </button>
          </div>
        </div>

        {/* Le formulaire inline est remplacé par le wizard */}

        {/* Liste */}
        <div
          className="flex-1 min-h-0 overflow-auto cursor-default select-text"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <p className="text-sm text-gray-400">Aucun composant.</p>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur « Ajouter ».</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {components.map((c) => (
                <li 
                  key={c.id} 
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 group cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("componentId", c.id.toString());
                  }}
                >
                  {/* Miniature */}
                  <div className="flex items-center gap-2 min-w-0">
                    {c.imageDataUrl ? (
                      <img
                        src={c.imageDataUrl}
                        alt={c.name}
                        className="w-8 h-8 rounded border border-gray-200 object-contain bg-white flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
                        ?
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {c.pins.length} pin{c.pins.length !== 1 ? "s" : ""} · {c.widthMm}×{c.heightMm}mm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditingComponent(c); setWizardOpen(true); }}
                      className="text-gray-300 group-hover:text-blue-500 hover:text-blue-600 transition-colors px-1"
                      title="Modifier"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setComponents((prev) => prev.filter((x) => x.id !== c.id))}
                      className="text-gray-300 group-hover:text-red-400 hover:text-red-600 transition-colors px-1 ml-1"
                      title="Retirer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <GripBar onMouseDown={compPanel.onMouseDown} />
      </div>

      {/* ── Barre d'outils ── */}
      <div
        className="absolute z-40 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl resize-x min-w-[300px]"
        style={{ left: toolPanel.pos.x, top: toolPanel.pos.y }}
      >
        <GripBar onMouseDown={toolPanel.onMouseDown} />

        <div
          className="flex p-1.5 gap-1 items-center bg-white border-y border-gray-100 cursor-default"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ToolButton icon={<MousePointer2 size={18} />} label={`Sélection (${settings.shortcuts.select.toUpperCase()})`} isActive={activeTool === "select"} onClick={() => setActiveTool("select")} />
          <ToolButton icon={<Cable size={18} />} label={`Fil électrique (${settings.shortcuts.wire.toUpperCase()})`} isActive={activeTool === "wire"} onClick={() => setActiveTool("wire")} />
          <ToolButton icon={<Type size={18} />} label={`Texte (${settings.shortcuts.text.toUpperCase()})`} isActive={activeTool === "text"} onClick={() => setActiveTool("text")} />
          <ToolButton icon={<StickyNote size={18} />} label={`Post-it (${settings.shortcuts.postit.toUpperCase()})`} isActive={activeTool === "postit"} onClick={() => setActiveTool("postit")} />

          <div className="mx-2 h-7 w-px bg-gray-200" />
          <ToolButton icon={<Undo2 size={18} />} label="Annuler (Ctrl+Z)" isActive={false} onClick={handleUndo} />
          <ToolButton icon={<Redo2 size={18} />} label="Rétablir (Ctrl+Y)" isActive={false} onClick={handleRedo} />
          
          <div className="mx-2 h-7 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5 px-1 pr-1">
            {colors.map((c) => {
              const disabled = activeTool === "select";
              return (
                <button
                  key={c}
                  disabled={disabled}
                  onClick={() => setActiveColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${
                    disabled
                      ? "opacity-20 cursor-not-allowed border-transparent grayscale"
                      : activeColor === c
                      ? "border-gray-900 scale-110"
                      : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  title={`Couleur`}
                />
              );
            })}
          </div>
        </div>

        <GripBar onMouseDown={toolPanel.onMouseDown} />
      </div>

      {/* ── Wizard ajout composant ── */}
      <AddComponentWizard 
        isOpen={wizardOpen} 
        onClose={() => { setWizardOpen(false); setEditingComponent(null); }} 
        onAdd={handleAddComponent} 
        onEdit={handleEditComponent}
        initialComponent={editingComponent}
      />

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onMouseDown={() => setSettingsOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px]" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Paramètres</h2>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Épaisseur des fils</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="1" max="10" 
                    value={settings.wireWidth} 
                    onChange={e => setSettings({ ...settings, wireWidth: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-gray-500 w-8">{settings.wireWidth}px</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taille de la grille</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="6" max="48" step="6"
                    value={settings.gridSize} 
                    onChange={e => setSettings({ ...settings, gridSize: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-gray-500 w-8">{settings.gridSize}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="snapEnabled"
                  checked={settings.snapEnabled}
                  onChange={e => setSettings({ ...settings, snapEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="snapEnabled" className="text-sm text-gray-700 cursor-pointer">Activer le magnétisme sur la grille</label>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Raccourcis Clavier</h3>
                <div className="space-y-2">
                  {[
                    { id: 'select', label: 'Outil Sélection' },
                    { id: 'wire', label: 'Outil Fil électrique' },
                    { id: 'text', label: 'Outil Texte' },
                    { id: 'postit', label: 'Outil Post-it' },
                  ].map(tool => (
                    <div key={tool.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{tool.label}</span>
                      <button
                        onClick={() => setListeningKeyFor(tool.id)}
                        onKeyDown={(e) => {
                          if (listeningKeyFor === tool.id) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.key === "Escape") {
                              setListeningKeyFor(null);
                              return;
                            }
                            if (e.key.length === 1) { // Only allow single character keys
                              setSettings({
                                ...settings,
                                shortcuts: { ...settings.shortcuts, [tool.id]: e.key.toLowerCase() }
                              });
                              setListeningKeyFor(null);
                            }
                          }
                        }}
                        className={`w-12 h-8 flex items-center justify-center border rounded text-sm font-mono transition-colors ${
                          listeningKeyFor === tool.id 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200 outline-none' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {listeningKeyFor === tool.id ? '?' : settings.shortcuts[tool.id as keyof typeof settings.shortcuts].toUpperCase()}
                      </button>
                    </div>
                  ))}
                  {listeningKeyFor && <p className="text-xs text-blue-600 mt-2">Appuyez sur une touche pour l'assigner (ou Échap pour annuler).</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
