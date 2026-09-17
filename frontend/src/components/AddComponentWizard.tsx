import { useRef, useState, useCallback, useEffect } from "react";
import {
  X, ChevronRight, ChevronLeft, Upload, Check,
  Trash2, RotateCw, Tag, MapPin, Ruler,
  Image as ImageIcon, Pencil,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ComponentLabel {
  id: number;
  text: string;
  x: number; // percentage of image width
  y: number; // percentage of image height
  fontSize: number;
  rotation: number; // 0 | 90 | -90 | 180
}

export interface ComponentPin {
  id: number;
  name: string;
  x: number; // percentage
  y: number; // percentage
}

export interface ComponentItem {
  id: number;
  name: string;
  imageDataUrl: string | null;
  labels: ComponentLabel[];
  pins: ComponentPin[];
  widthMm: number;
  heightMm: number;
}

interface Props {
  onClose: () => void;
  onAdd: (component: Omit<ComponentItem, "id">) => void;
  onEdit?: (component: ComponentItem) => void;
  isOpen?: boolean;
  initialComponent?: ComponentItem | null;
}



// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Image",  icon: ImageIcon },
  { label: "Labels", icon: Tag },
  { label: "Pins",   icon: MapPin },
  { label: "Taille", icon: Ruler },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];
const ROTATIONS  = [0, 90, -90, 180];
const ARDUINO_W_MM = 68.6;
const ARDUINO_H_MM = 53.3;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="wizard-step-bar">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="wizard-step-item">
            <div className={`wizard-step-circle ${done ? "done" : active ? "active" : "idle"}`}>
              {done ? <Check size={14} /> : <Icon size={14} />}
            </div>
            <span className={`wizard-step-label ${active ? "active" : done ? "done" : ""}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`wizard-step-connector ${done ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Image Cropper ───────────────────────────────────────────────────────────
function ImageCropper({
  src, onCrop, onCancel,
}: {
  src: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);
  
  // crop box in percentages [0-100]
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const dragKind = useRef<null | "move" | "tl" | "tr" | "bl" | "br">(null);
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cw: 0, ch: 0 });

  const [zoom, setZoom] = useState(1);
  const [imgSize, setImgSize] = useState({ w: 400, h: 300 }); // base size

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // max initial fit sizes
    const maxW = 600;
    const maxH = 400;
    const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    setImgSize({ w: img.naturalWidth * ratio, h: img.naturalHeight * ratio });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>, kind: typeof dragKind.current) => {
    e.preventDefault();
    e.stopPropagation();
    dragKind.current = kind;
    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
    dragStart.current = { mx: e.clientX - rect.left, my: e.clientY - rect.top, ...crop, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h };
    const onMove = (ev: MouseEvent) => {
      if (!dragKind.current) return;
      const el = document.getElementById('crop-container');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = ((ev.clientX - r.left - dragStart.current.mx) / r.width) * 100;
      const dy = ((ev.clientY - r.top  - dragStart.current.my) / r.height) * 100;
      setCrop(prev => {
        const { cx, cy, cw, ch } = dragStart.current;
        if (dragKind.current === 'move') {
          return { x: clamp(cx + dx, 0, 100 - prev.w), y: clamp(cy + dy, 0, 100 - prev.h), w: prev.w, h: prev.h };
        }
        let x = prev.x, y = prev.y, w = prev.w, h = prev.h;
        if (dragKind.current === 'tl') { x = clamp(cx + dx, 0, cx + cw - 5); y = clamp(cy + dy, 0, cy + ch - 5); w = cw - (x - cx); h = ch - (y - cy); }
        if (dragKind.current === 'tr') { w = clamp(cw + dx, 5, 100 - cx); y = clamp(cy + dy, 0, cy + ch - 5); h = ch - (y - cy); }
        if (dragKind.current === 'bl') { x = clamp(cx + dx, 0, cx + cw - 5); h = clamp(ch + dy, 5, 100 - cy); w = cw - (x - cx); }
        if (dragKind.current === 'br') { w = clamp(cw + dx, 5, 100 - cx); h = clamp(ch + dy, 5, 100 - cy); }
        return { x, y, w, h };
      });
    };
    const onUp = () => { dragKind.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const applyCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    const scaleX = img.naturalWidth / 100;
    const scaleY = img.naturalHeight / 100;
    canvas.width  = crop.w * scaleX;
    canvas.height = crop.h * scaleY;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.w * scaleX, crop.h * scaleY, 0, 0, canvas.width, canvas.height);
    onCrop(canvas.toDataURL('image/png'));
  };

  const handleW = 12;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl p-5 flex flex-col gap-4" style={{ maxWidth: 740, width: '95vw' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-800">Rogner l'image</p>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-700"><X size={18}/></button>
        </div>

        {/* Toolbar (Zoom) */}
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <span className="text-sm font-medium text-gray-600">Zoom :</span>
          <input 
            type="range" 
            min={50} max={400} 
            value={zoom * 100} 
            onChange={(e) => setZoom(Number(e.target.value) / 100)} 
            className="flex-1 max-w-[200px]"
          />
          <span className="text-xs font-mono text-gray-500 w-10">{Math.round(zoom * 100)}%</span>
          
          <button 
            onClick={() => setZoom(1)}
            className="text-xs ml-auto px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Ajuster
          </button>
        </div>
        
        {/* Workspace */}
        <div className="overflow-auto bg-[#e8eef5] rounded-lg border border-gray-200 flex" style={{ height: 420 }}>
          <div className="m-auto p-4 flex items-center justify-center min-w-full min-h-full">
            <div 
              id="crop-container" 
              className="relative select-none overflow-hidden" 
              style={{ width: imgSize.w * zoom, height: imgSize.h * zoom, background: 'transparent' }}
            >
              <img 
                ref={imgRef} 
                src={src} 
                alt="" 
                onLoad={onImgLoad}
                className="absolute inset-0 w-full h-full pointer-events-none" 
                draggable={false} 
              />
              
              {/* Crop cutout */}
              <div
                className="absolute"
                style={{ 
                  left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.w}%`, height: `${crop.h}%`, 
                  background: 'transparent', outline: '2px solid #2563eb', 
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', 
                  cursor: 'move' 
                }}
                onMouseDown={(e) => onMouseDown(e, 'move')}
              >
                {/* Corner handles */}
                {(['tl','tr','bl','br'] as const).map(corner => (
                  <div key={corner} onMouseDown={(e) => onMouseDown(e, corner)}
                    style={{
                      position: 'absolute', width: handleW, height: handleW, background: '#2563eb', borderRadius: 2,
                      top: corner.startsWith('t') ? -handleW/2 : undefined, bottom: corner.startsWith('b') ? -handleW/2 : undefined,
                      left: corner.endsWith('l') ? -handleW/2 : undefined, right: corner.endsWith('r') ? -handleW/2 : undefined,
                      cursor: corner === 'tl' || corner === 'br' ? 'nwse-resize' : 'nesw-resize',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onCancel} className="wizard-btn-secondary">Annuler</button>
          <button onClick={applyCrop} className="wizard-btn-primary">Appliquer le rognage</button>
        </div>

      </div>
    </div>
  );
}


// ─── Step 1: Image ───────────────────────────────────────────────────────────
function Step1Image({
  name, setName, imageDataUrl, setImageDataUrl,
}: {
  name: string;
  setName: (v: string) => void;
  imageDataUrl: string | null;
  setImageDataUrl: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropSrc(result); // open cropper first
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) loadFile(file);
  };

  return (
    <div className="wizard-step-content">
      {/* Cropper modal */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCrop={(dataUrl) => { setImageDataUrl(dataUrl); setCropSrc(null); }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Nom */}
      <div className="wizard-field">
        <label className="wizard-label">Nom du composant</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Résistance 10kΩ"
          className="wizard-input"
        />
      </div>

      <div className="wizard-cols">
        {/* Dropzone */}
        <div className="wizard-dropzone-col">
          <label className="wizard-label">Image du composant</label>
          <div
            className={`wizard-dropzone ${draggingOver ? "drag-over" : ""} ${imageDataUrl ? "has-image" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => !imageDataUrl && inputRef.current?.click()}
          >
            {imageDataUrl ? (
              <>
                <img src={imageDataUrl} alt="Composant" className="wizard-preview-img" />
                <button
                  className="wizard-remove-img"
                  onClick={(e) => { e.stopPropagation(); setImageDataUrl(null); }}
                  title="Supprimer l'image"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="wizard-dropzone-placeholder">
                <Upload size={28} className="wizard-upload-icon" />
                <p className="wizard-dropzone-text">Glisser-déposer ou cliquer</p>
                <p className="wizard-dropzone-hint">PNG, JPG, SVG acceptés</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              className="wizard-btn-secondary"
              onClick={() => setImageDataUrl("/example-resistor.png")}
            >
              <ImageIcon size={14} />
              Utiliser l'exemple
            </button>
            {imageDataUrl && (
              <button
                className="wizard-btn-secondary"
                onClick={() => setCropSrc(imageDataUrl)}
              >
                ✂️ Rogner l'image
              </button>
            )}
          </div>
        </div>

        {/* Exemple */}
        <div className="wizard-example-col">
          <label className="wizard-label">Exemple (style Fritzing)</label>
          <div className="wizard-example-box">
            <img
              src="/example-resistor.png"
              alt="Exemple résistance"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="wizard-example-caption">Vue de dessus · composant simplifié</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Labels (avec drag & drop) ───────────────────────────────────────
function Step2Labels({
  imageDataUrl, labels, setLabels,
}: {
  imageDataUrl: string | null;
  labels: ComponentLabel[];
  setLabels: (v: ComponentLabel[]) => void;
}) {
  const [hasLabels,        setHasLabels]        = useState(labels.length > 0);
  const [editingId,        setEditingId]         = useState<number | null>(null);
  const [nextId,           setNextId]            = useState(1);
  const [selectedFontSize, setSelectedFontSize]  = useState(12);
  const [selectedRotation, setSelectedRotation]  = useState(0);

  // Drag state for moving labels
  const dragState = useRef<{
    id: number;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    containerW: number;
    containerH: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!hasLabels) return;
    if (dragState.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    const newLabel: ComponentLabel = {
      id: nextId, text: "Label", x, y,
      fontSize: selectedFontSize, rotation: selectedRotation,
    };
    setLabels([...labels, newLabel]);
    setNextId(nextId + 1);
    setEditingId(newLabel.id);
  };

  const updateLabel = (id: number, updates: Partial<ComponentLabel>) =>
    setLabels(labels.map((l) => (l.id === id ? { ...l, ...updates } : l)));

  const handleFontSizeChange = (size: number) => {
    setSelectedFontSize(size);
    if (editingId) updateLabel(editingId, { fontSize: size });
  };

  const handleRotationChange = (rot: number) => {
    setSelectedRotation(rot);
    if (editingId) updateLabel(editingId, { rotation: rot });
  };

  const deleteLabel = (id: number) => {
    setLabels(labels.filter((l) => l.id !== id));
    if (editingId === id) setEditingId(null);
  };

  // ── Label drag handlers ──────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent, label: ComponentLabel) => {
    e.preventDefault();
    e.stopPropagation();
    // Use the image rect for bounds and scaling
    const imgEl = e.currentTarget.parentElement?.querySelector('.wizard-canvas-img');
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();
    dragState.current = {
      id: label.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: label.x,
      startY: label.y,
      containerW: rect.width,
      containerH: rect.height,
    };
    setEditingId(label.id);

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const dx = ((ev.clientX - dragState.current.startMouseX) / dragState.current.containerW) * 100;
      const dy = ((ev.clientY - dragState.current.startMouseY) / dragState.current.containerH) * 100;
      const newX = clamp(dragState.current.startX + dx, 0, 100);
      const newY = clamp(dragState.current.startY + dy, 0, 100);
      updateLabel(dragState.current.id, { x: newX, y: newY });
    };

    const onUp = () => {
      dragState.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  return (
    <div className="wizard-step-content">
      {/* Toggle */}
      <div className="wizard-toggle-row">
        <span className="wizard-label" style={{ marginBottom: 0 }}>Ajouter des labels sur l'image ?</span>
        <label className="wizard-toggle">
          <input
            type="checkbox"
            checked={hasLabels}
            onChange={(e) => { setHasLabels(e.target.checked); if (!e.target.checked) setLabels([]); }}
          />
          <span className="wizard-toggle-slider" />
        </label>
      </div>

      {/* Toolbar */}
      {hasLabels && (
        <div className="wizard-label-toolbar">
          <div className="wizard-field-inline">
            <span className="wizard-toolbar-label">Taille :</span>
            <select
              value={editingId ? labels.find(l => l.id === editingId)?.fontSize || selectedFontSize : selectedFontSize}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              className="wizard-select-sm"
            >
              {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>
          <div className="wizard-field-inline">
            <span className="wizard-toolbar-label">Rotation :</span>
            {ROTATIONS.map((r) => {
              const isActive = editingId ? labels.find(l => l.id === editingId)?.rotation === r : selectedRotation === r;
              return (
                <button
                  key={r}
                  className={`wizard-btn-icon ${isActive ? "active" : ""}`}
                  onClick={() => handleRotationChange(r)}
                  title={`${r}°`}
                >
                  <RotateCw size={14} style={{ transform: `rotate(${r}deg)` }} />
                </button>
              );
            })}
          </div>
          <p className="wizard-hint-text" style={{ marginLeft: "auto" }}>
            👆 Cliquez sur l'image pour placer · Sélectionnez pour modifier
          </p>
        </div>
      )}

      {/* Canvas */}
      <div className="wizard-canvas-area">
        {imageDataUrl ? (
          <div
            ref={containerRef}
            className={`wizard-canvas-img-wrap ${hasLabels ? "cursor-crosshair" : ""}`}
          >
            <div style={{ position: "relative", display: "flex" }}>
              <img 
                src={imageDataUrl} 
                alt="Composant" 
                className="wizard-canvas-img" 
                draggable={false} 
                onClick={handleImageClick}
                style={{ pointerEvents: hasLabels ? "auto" : "none" }}
              />

            {/* Labels overlay — toujours affichés */}
            {labels.map((label) => (
              <div
                key={label.id}
                className="wizard-label-chip"
                style={{
                  left: `${label.x}%`,
                  top:  `${label.y}%`,
                  fontSize: label.fontSize,
                  transform: `translate(-50%, -50%) rotate(${label.rotation}deg)`,
                  cursor: "grab",
                }}
                onMouseDown={(e) => {
                  if (e.button === 0) startDrag(e, label);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(label.id);
                }}
              >
                {editingId === label.id ? (
                  <div className="wizard-label-editor" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      type="text"
                      value={label.text}
                      onChange={(e) => updateLabel(label.id, { text: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
                      }}
                      className="wizard-label-input"
                      style={{ fontSize: label.fontSize }}
                    />
                    <button
                      className="wizard-label-delete"
                      onMouseDown={() => deleteLabel(label.id)}
                      title="Supprimer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <span className="wizard-label-text">{label.text}</span>
                )}
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="wizard-canvas-empty">
            <ImageIcon size={32} className="wizard-canvas-empty-icon" />
            <p className="wizard-canvas-empty-text">Aucune image sélectionnée à l'étape 1</p>
          </div>
        )}
      </div>

      {/* Liste des labels */}
      {labels.length > 0 && (
        <div className="wizard-chips-list">
          {labels.map((l) => (
            <div key={l.id} className="wizard-chip">
              <span className="wizard-chip-text">{l.text}</span>
              <button
                onClick={() => setEditingId(l.id)}
                className="wizard-chip-action"
                title="Modifier"
              >
                <Pencil size={9} />
              </button>
              <button
                onClick={() => deleteLabel(l.id)}
                className="wizard-chip-action danger"
                title="Supprimer"
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Pins ────────────────────────────────────────────────────────────
function Step3Pins({
  imageDataUrl, pins, setPins, labels,
}: {
  imageDataUrl: string | null;
  pins: ComponentPin[];
  setPins: (v: ComponentPin[]) => void;
  labels: ComponentLabel[];
}) {
  const [nextId,       setNextId]       = useState(1);
  const [editingPinId, setEditingPinId] = useState<number | null>(null);
  const [editingName,  setEditingName]  = useState("");
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [imgSize, setImgSize] = useState({ w: 400, h: 300 });

  const [crosshair, setCrosshair] = useState({ x: 50, y: 50 });
  const [crosshairVisible, setCrosshairVisible] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef(pins);
  useEffect(() => { pinsRef.current = pins; }, [pins]);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const maxW = 600, maxH = 400;
    const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    setImgSize({ w: img.naturalWidth * ratio, h: img.naturalHeight * ratio });
  };

  const addPinAt = (x: number, y: number) => {
    const name = `Pin ${nextId}`;
    const newPin = { id: nextId, name, x, y };
    setPins([...pinsRef.current, newPin]);
    setNextId(n => n + 1);
    setSelectedPinId(newPin.id);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isKeyboardMode) return; // If keyboard mode, we rely on Enter key
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    addPinAt(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isKeyboardMode) setIsKeyboardMode(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    setCrosshair({ x, y });
  };

  const deletePin = (id: number) => {
    setPins(pinsRef.current.filter((p) => p.id !== id));
    if (selectedPinId === id) setSelectedPinId(null);
  };

  const startRename = (pin: ComponentPin) => { setEditingPinId(pin.id); setEditingName(pin.name); };
  const confirmRename = () => {
    if (editingPinId == null) return;
    const name = editingName.trim();
    if (name) setPins(pinsRef.current.map((p) => (p.id === editingPinId ? { ...p, name } : p)));
    setEditingPinId(null); setEditingName("");
  };

  const startPinDrag = (e: React.MouseEvent, pinId: number) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedPinId(pinId);
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pin = pinsRef.current.find(p => p.id === pinId)!;
    const startMX = e.clientX, startMY = e.clientY;
    const startX = pin.x, startY = pin.y;

    const onMove = (ev: MouseEvent) => {
      const dx = ((ev.clientX - startMX) / rect.width) * 100;
      const dy = ((ev.clientY - startMY) / rect.height) * 100;
      setPins(pinsRef.current.map(p => p.id === pinId
        ? { ...p, x: clamp(startX + dx, 0, 100), y: clamp(startY + dy, 0, 100) }
        : p
      ));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Keyboard navigation for crosshair
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.key)) return;
      
      e.preventDefault();
      
      if (e.key === 'Enter') {
        addPinAt(crosshair.x, crosshair.y);
        return;
      }
      
      setIsKeyboardMode(true);
      setCrosshairVisible(true);
      const step = e.shiftKey ? 0.1 : 0.5; // % units
      const delta: Record<string, { dx: number, dy: number }> = {
        ArrowLeft:  { dx: -step, dy: 0 },
        ArrowRight: { dx:  step, dy: 0 },
        ArrowUp:    { dx: 0, dy: -step },
        ArrowDown:  { dx: 0, dy:  step },
      };
      const { dx, dy } = delta[e.key];
      setCrosshair(prev => ({
        x: clamp(prev.x + dx, 0, 100),
        y: clamp(prev.y + dy, 0, 100)
      }));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [crosshair]);

  return (
    <div className="wizard-step-content">
      <div className="wizard-info-banner">
        <MapPin size={14} />
        <span>
          Cliquez (ou flèches ↑↓←→ puis Entrée) pour placer un pin · Glisser pour déplacer · Clic droit pour supprimer
        </span>
      </div>

      {/* Toolbar (Zoom) */}
      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 my-2">
        <span className="text-sm font-medium text-gray-600">Zoom :</span>
        <input 
          type="range" 
          min={50} max={400} 
          value={zoom * 100} 
          onChange={(e) => setZoom(Number(e.target.value) / 100)} 
          className="flex-1 max-w-[200px]"
        />
        <span className="text-xs font-mono text-gray-500 w-10">{Math.round(zoom * 100)}%</span>
        
        <button 
          onClick={() => setZoom(1)}
          className="text-xs ml-auto px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Ajuster
        </button>
      </div>

      {/* Canvas */}
      <div className="wizard-canvas-area-large" style={{ minHeight: 'auto', background: 'transparent' }}>
        {imageDataUrl ? (
          <div className="overflow-auto bg-[#e8eef5] rounded-lg border border-gray-200 flex" style={{ height: 420, width: '100%' }}>
            <div className="m-auto p-4 flex items-center justify-center min-w-full min-h-full">
              <div 
                ref={containerRef}
                className="relative select-none" 
                style={{ width: imgSize.w * zoom, height: imgSize.h * zoom, background: 'transparent', cursor: isKeyboardMode ? 'default' : 'crosshair' }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setCrosshairVisible(true)}
                onMouseLeave={() => setCrosshairVisible(false)}
                onClick={handleImageClick}
              >
                <img 
                  ref={imgRef} 
                  src={imageDataUrl} 
                  alt="" 
                  onLoad={onImgLoad}
                  className="absolute inset-0 w-full h-full pointer-events-none" 
                  draggable={false} 
                />

                {/* Crosshair Overlay */}
                {crosshairVisible && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${crosshair.x}%`,
                      top: `${crosshair.y}%`,
                      width: '24px',
                      height: '24px',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      zIndex: 30
                    }}
                  >
                    <div style={{ position: 'absolute', top: '11px', left: 0, right: 0, height: '2px', background: '#3b82f6', boxShadow: '0 0 2px #fff' }} />
                    <div style={{ position: 'absolute', left: '11px', top: 0, bottom: 0, width: '2px', background: '#3b82f6', boxShadow: '0 0 2px #fff' }} />
                  </div>
                )}

                {/* Labels overlay — read-only */}
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="wizard-label-chip"
                    style={{
                      left: `${label.x}%`, top: `${label.y}%`,
                      fontSize: label.fontSize,
                      transform: `translate(-50%, -50%) rotate(${label.rotation}deg)`,
                      pointerEvents: 'none',
                    }}
                  >
                    <span className="wizard-label-text">{label.text}</span>
                  </div>
                ))}

                {/* Pins */}
                {pins.map((pin) => (
                  <button
                    key={pin.id}
                    className={`wizard-pin ${selectedPinId === pin.id ? 'selected' : ''}`}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    title={`${pin.name} · Glisser pour déplacer · Clic droit pour supprimer`}
                    onClick={(e) => { e.stopPropagation(); setSelectedPinId(pin.id); }}
                    onMouseDown={(e) => { if (e.button === 0) startPinDrag(e, pin.id); }}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); deletePin(pin.id); }}
                  >
                    <span className="wizard-pin-dot">
                      <span className="wizard-pin-number">{pin.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="wizard-canvas-empty">
            <MapPin size={32} className="wizard-canvas-empty-icon" />
            <p className="wizard-canvas-empty-text">Aucune image sélectionnée à l'étape 1</p>
          </div>
        )}
      </div>

      {/* Selected pin info */}
      {selectedPinId !== null && (() => {
        const p = pins.find(p => p.id === selectedPinId);
        return p ? (
          <div className="wizard-info-banner mt-2" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#15803d' }}>
            <span>Pin sélectionné : <strong>{p.name}</strong> — position {p.x.toFixed(1)}%, {p.y.toFixed(1)}%</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.8 }}>Glissez pour ajuster</span>
          </div>
        ) : null;
      })()}

      {/* Pins list */}
      {pins.length > 0 && (
        <div className="wizard-pins-list mt-2">
          <p className="wizard-section-title">Pins ajoutés ({pins.length}) — cliquez sur le nom pour renommer</p>
          <div className="wizard-pins-grid">
            {pins.map((p) => (
              <div
                key={p.id}
                className={`wizard-pin-row ${selectedPinId === p.id ? 'selected-row' : ''}`}
                onClick={() => setSelectedPinId(p.id)}
              >
                <span className="wizard-pin-badge">{p.id}</span>

                {editingPinId === p.id ? (
                  <div className="wizard-pin-rename">
                    <input
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={confirmRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmRename();
                        if (e.key === "Escape") { setEditingPinId(null); }
                      }}
                      className="wizard-pin-rename-input"
                    />
                    <button className="wizard-btn-confirm" onClick={confirmRename}>
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="wizard-pin-name-btn"
                    onClick={(e) => { e.stopPropagation(); startRename(p); }}
                    title="Cliquer pour renommer"
                  >
                    <span>{p.name}</span>
                    <Pencil size={11} className="wizard-pin-rename-icon" />
                  </button>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); deletePin(p.id); }}
                  className="wizard-pin-delete-btn"
                  title="Supprimer ce pin"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Taille ──────────────────────────────────────────────────────────
function Step4Size({
  widthMm, heightMm, setWidthMm, setHeightMm, imageDataUrl, name, labels, pins,
}: {
  widthMm: number;
  heightMm: number;
  setWidthMm: (v: number) => void;
  setHeightMm: (v: number) => void;
  imageDataUrl: string | null;
  name: string;
  labels: ComponentLabel[];
  pins: ComponentPin[];
}) {
  const PX_PER_MM = 2.5;
  const MAX_MM    = 200;

  const compW = clamp(widthMm  * PX_PER_MM, 8, MAX_MM * PX_PER_MM);
  const compH = clamp(heightMm * PX_PER_MM, 8, MAX_MM * PX_PER_MM);
  const ardW  = ARDUINO_W_MM * PX_PER_MM;
  const ardH  = ARDUINO_H_MM * PX_PER_MM;

  return (
    <div className="wizard-step-content">
      <p className="wizard-desc-text">
        Indiquez les dimensions réelles du composant. La prévisualisation
        comparative avec l'Arduino Uno R3 se met à jour en temps réel.
      </p>

      {/* Inputs + sliders */}
      <div className="wizard-size-rows">
        {/* Largeur */}
        <div className="wizard-size-row">
          <label className="wizard-label" style={{ width: 90 }}>Largeur</label>
          <input
            type="range"
            min={1} max={MAX_MM}
            value={widthMm}
            onChange={(e) => setWidthMm(Number(e.target.value))}
            className="wizard-slider"
          />
          <input
            type="number"
            min={1} max={500}
            value={widthMm}
            onChange={(e) => setWidthMm(Math.max(1, Number(e.target.value)))}
            className="wizard-size-input"
          />
          <span className="wizard-unit">mm</span>
        </div>
        {/* Hauteur */}
        <div className="wizard-size-row">
          <label className="wizard-label" style={{ width: 90 }}>Hauteur</label>
          <input
            type="range"
            min={1} max={MAX_MM}
            value={heightMm}
            onChange={(e) => setHeightMm(Number(e.target.value))}
            className="wizard-slider"
          />
          <input
            type="number"
            min={1} max={500}
            value={heightMm}
            onChange={(e) => setHeightMm(Math.max(1, Number(e.target.value)))}
            className="wizard-size-input"
          />
          <span className="wizard-unit">mm</span>
        </div>
      </div>

      {/* Preview */}
      <div className="wizard-size-preview">
        <p className="wizard-section-title">Prévisualisation à l'échelle (1 px = 0,4 mm)</p>
        <div className="wizard-size-stage">
          {/* Composant */}
          <div className="wizard-size-item">
            <div className="wizard-size-box component" style={{ width: compW, height: compH, position: 'relative' }}>
              {imageDataUrl ? (
                <>
                  <img src={imageDataUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  {/* Labels overlay — lecture seule */}
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="wizard-label-chip"
                      style={{
                        left: `${label.x}%`, top:  `${label.y}%`,
                        fontSize: label.fontSize * (compW / (MAX_MM * PX_PER_MM)), // Scale down roughly if needed, or just let it overflow a bit. Actually we can keep same or scale.
                        transform: `translate(-50%, -50%) scale(${Math.min(compW / 150, 1)}) rotate(${label.rotation}deg)`,
                        pointerEvents: "none",
                      }}
                    >
                      <span className="wizard-label-text">{label.text}</span>
                    </div>
                  ))}
                  {/* Pins overlay — lecture seule */}
                  {pins.map((pin) => (
                    <div
                      key={pin.id}
                      className="wizard-pin"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: `translate(-50%, -50%) scale(${Math.min(compW / 150, 1)})`, pointerEvents: "none" }}
                    >
                      <span className="wizard-pin-dot">
                        <span className="wizard-pin-number">{pin.id}</span>
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <span className="wizard-size-placeholder">?</span>
              )}
            </div>
            <p className="wizard-size-label">
              {name || "Composant"}<br />
              <span className="wizard-size-dims">{widthMm} × {heightMm} mm</span>
            </p>
          </div>

          <div className="wizard-vs">VS</div>

          {/* Arduino */}
          <div className="wizard-size-item">
            <div className="wizard-size-box arduino" style={{ width: ardW, height: ardH }}>
              <img src="/arduino-uno-r3.png" alt="Arduino Uno R3" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <p className="wizard-size-label">
              Arduino Uno R3<br />
              <span className="wizard-size-dims">68.6 × 53.3 mm</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────
export default function AddComponentWizard({ onClose, onAdd, onEdit, isOpen = true, initialComponent = null }: Props) {
  if (!isOpen) return null;
  const [step, setStep] = useState(0);

  const [name,         setName]         = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [labels,       setLabels]       = useState<ComponentLabel[]>([]);
  const [pins,         setPins]         = useState<ComponentPin[]>([]);
  const [widthMm,      setWidthMm]      = useState(10);
  const [heightMm,     setHeightMm]     = useState(10);

  // Initialize state when opened
  useEffect(() => {
    if (isOpen) {
      if (initialComponent) {
        setName(initialComponent.name);
        setImageDataUrl(initialComponent.imageDataUrl);
        setLabels([...initialComponent.labels]);
        setPins([...initialComponent.pins]);
        setWidthMm(initialComponent.widthMm);
        setHeightMm(initialComponent.heightMm);
      } else {
        setName("");
        setImageDataUrl(null);
        setLabels([]);
        setPins([]);
        setWidthMm(10);
        setHeightMm(10);
      }
      setStep(0);
    }
  }, [isOpen, initialComponent]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const canGoNext = useCallback(() => {
    if (step === 0) return name.trim().length > 0;
    return true;
  }, [step, name]);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      const compData = { name: name.trim(), imageDataUrl, labels, pins, widthMm, heightMm };
      if (initialComponent && onEdit) {
        onEdit({ id: initialComponent.id, ...compData });
      } else {
        onAdd(compData);
      }
    }
  };

  return (
    <div className="wizard-overlay" onClick={onClose}>
      <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <div>
            <h2 className="wizard-title">{initialComponent ? "Modifier le composant" : "Nouveau composant"}</h2>
            <p className="wizard-subtitle">Étape {step + 1} / {STEPS.length} — {STEPS[step].label}</p>
          </div>
          <button className="wizard-close" onClick={onClose} title="Fermer"><X size={18} /></button>
        </div>

        <StepBar current={step} />

        {/* Body */}
        <div className="wizard-body">
          {step === 0 && (
            <Step1Image
              name={name} setName={setName}
              imageDataUrl={imageDataUrl} setImageDataUrl={setImageDataUrl}
            />
          )}
          {step === 1 && (
            <Step2Labels imageDataUrl={imageDataUrl} labels={labels} setLabels={setLabels} />
          )}
          {step === 2 && (
            <Step3Pins imageDataUrl={imageDataUrl} pins={pins} setPins={setPins} labels={labels} />
          )}
          {step === 3 && (
            <Step4Size
              widthMm={widthMm} heightMm={heightMm}
              setWidthMm={setWidthMm} setHeightMm={setHeightMm}
              imageDataUrl={imageDataUrl} name={name} labels={labels} pins={pins}
            />
          )}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <button className="wizard-btn-ghost" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
            {step === 0 ? "Annuler" : <><ChevronLeft size={16} /> Précédent</>}
          </button>

          <div className="wizard-footer-dots">
            {STEPS.map((_, i) => (
              <div key={i} className={`wizard-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
            ))}
          </div>

          <button className="wizard-btn-primary" onClick={handleNext} disabled={!canGoNext()}>
            {step === STEPS.length - 1
              ? <><Check size={16} /> {initialComponent ? "Enregistrer" : "Terminer"}</>
              : <>Suivant <ChevronRight size={16} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
