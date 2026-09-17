import { useCallback, useRef, useState } from "react";

export interface Position { x: number; y: number; }

export function useDraggable(initial: Position, zoom: number = 1) {
  const [pos, setPos] = useState<Position>(initial);
  const posRef = useRef(initial);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = posRef.current.x;
    const initialPosY = posRef.current.y;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      const next = { x: initialPosX + dx, y: initialPosY + dy };
      posRef.current = next;
      setPos(next);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return { pos, onMouseDown };
}
