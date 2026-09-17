import { useRef, useState } from "react";
import { GripHorizontal, X } from "lucide-react";
import { useDraggable } from "../hooks/useDraggable";

export interface PostitData {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

interface PostItCardProps {
  data: PostitData;
  onDelete: () => void;
  onUpdate: (updates: Partial<PostitData>) => void;
  zoom?: number;
}

export function PostItCard({ data, onDelete, onUpdate, zoom = 1 }: PostItCardProps) {
  const drag = useDraggable({ x: data.x, y: data.y }, zoom);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [content, setContent] = useState(data.content);
  const [size, setSize] = useState({ w: data.width, h: data.height });
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Sync drag pos back to parent
  const prevPos = useRef({ x: data.x, y: data.y });
  if (prevPos.current.x !== drag.pos.x || prevPos.current.y !== drag.pos.y) {
    prevPos.current = drag.pos;
    // Use a timeout to avoid setState during render
    setTimeout(() => onUpdate({ x: drag.pos.x, y: drag.pos.y }), 0);
  }

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = (ev.clientX - resizeRef.current.startX) / zoom;
      const dy = (ev.clientY - resizeRef.current.startY) / zoom;
      const newW = Math.max(160, resizeRef.current.startW + dx);
      const newH = Math.max(100, resizeRef.current.startH + dy);
      setSize({ w: newW, h: newH });
      onUpdate({ width: newW, height: newH });
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className="absolute z-30 flex flex-col overflow-hidden rounded-lg shadow-xl border border-yellow-300"
      style={{ left: drag.pos.x, top: drag.pos.y, width: size.w, height: size.h, background: "#FEFCE8" }}
    >
      {/* Poignée drag haut */}
      <div
        onMouseDown={drag.onMouseDown}
        className="flex items-center justify-between px-2 py-1 cursor-move bg-yellow-200 hover:bg-yellow-300 transition-colors"
      >
        <GripHorizontal size={14} className="text-yellow-700 pointer-events-none" />
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setConfirmDelete(true)}
          className="text-yellow-700 hover:text-red-600 transition-colors"
          title="Supprimer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Contenu editable */}
      <textarea
        className="flex-1 bg-transparent p-2 text-sm text-gray-800 resize-none outline-none font-sans leading-relaxed"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onUpdate({ content: e.target.value });
        }}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Écrivez votre note..."
      />

      {/* Poignée drag bas */}
      <div
        onMouseDown={drag.onMouseDown}
        className="flex items-center justify-center py-1 cursor-move bg-yellow-200 hover:bg-yellow-300 transition-colors"
      >
        <GripHorizontal size={14} className="text-yellow-700 pointer-events-none" />
      </div>

      {/* Poignée resize coin bas-droit */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5"
        title="Redimensionner"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="2" y1="10" x2="10" y2="2" stroke="#a16207" strokeWidth="1.5" />
          <line x1="5" y1="10" x2="10" y2="5" stroke="#a16207" strokeWidth="1.5" />
          <line x1="8" y1="10" x2="10" y2="8" stroke="#a16207" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Confirmation de suppression */}
      {confirmDelete && (
        <div
          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 rounded-lg"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p className="text-white text-sm font-medium text-center px-3">Supprimer ce post-it ?</p>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
