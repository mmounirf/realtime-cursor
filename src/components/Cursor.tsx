import { usePerfectCursor } from "@/hooks/usePerfectCursor";
import { useRef, useCallback, useLayoutEffect } from "react";

export default function Cursor({
  point,
  color,
  label,
}: {
  point: number[];
  color: string;
  label: string;
}) {
  const cursorRef = useRef<SVGSVGElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const animateCursor = useCallback((point: number[]) => {
    const elm = cursorRef.current;
    const label = labelRef.current;

    if (!elm) return;
    elm.style.setProperty(
      "transform",
      `translate(${point[0]}px, ${point[1]}px)`
    );

    if (label) {
      label.style.setProperty(
        "transform",
        `translate(${point[0] + 15}px, ${point[1] + 25}px)`
      );
    }
  }, []);

  const onPointMove = usePerfectCursor(animateCursor);

  useLayoutEffect(() => onPointMove(point), [onPointMove, point]);

  return (
    <>
      <svg
        ref={cursorRef}
        width="44"
        height="56"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 45,
          height: 45,
          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))",
          pointerEvents: "none",
        }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
        />
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      <div
        ref={labelRef}
        style={{
          position: "fixed",
          top: -5,
          left: -5,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: color,
            color: "white",
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: "500",
            whiteSpace: "nowrap",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.15)",
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
}
