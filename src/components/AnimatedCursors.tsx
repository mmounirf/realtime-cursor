import { type FC, useEffect } from "react";
import { motion, useSpring } from "motion/react";

interface CursorData {
  name: string;
  color: string;
}

interface AnimatedCursorsProps {
  cursors?: CursorData[];
}

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

const CursorIcon: FC<{ color: string }> = ({ color }) => {
  return (
    <svg
      width="44"
      height="56"
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }}
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
  );
};

const SimulatedCursor = ({ name, color }: CursorData) => {
  const smoothOptions = {
    damping: 20,
    stiffness: 50,
    mass: 1,
  };

  const initialX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const initialY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

  const mouseX = useSpring(initialX, smoothOptions);
  const mouseY = useSpring(initialY, smoothOptions);

  useEffect(() => {
    let timeoutX: number;
    let timeoutY: number;

    const moveX = () => {
      const nextX = random(50, window.innerWidth - 50);
      mouseX.set(nextX);

      timeoutX = setTimeout(moveX, random(2000, 5000));
    };

    const moveY = () => {
      const nextY = random(50, window.innerHeight - 50);
      mouseY.set(nextY);

      timeoutY = setTimeout(moveY, random(2000, 5000));
    };

    timeoutX = setTimeout(moveX, random(0, 1000));
    timeoutY = setTimeout(moveY, random(0, 1000));

    return () => {
      clearTimeout(timeoutX);
      clearTimeout(timeoutY);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: "fixed",
        left: mouseX,
        top: mouseY,
        zIndex: 1,
        pointerEvents: "none",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <CursorIcon color={color} />

        <div
          className="absolute left-2 top-6 rounded-full px-2 py-1 text-xs font-bold text-white shadow-sm whitespace-nowrap"
          style={{ backgroundColor: color }}
        >
          {name}
        </div>
      </div>
    </motion.div>
  );
};

const defaultCursors = [
  { name: "Sarah", color: "#eab308" },
  { name: "Mike", color: "#22c55e" },
  { name: "Alex", color: "#3b82f6" },
  { name: "Emma", color: "#ec4899" },
  { name: "James", color: "#06b6d4" },
  { name: "Lisa", color: "#f43f5e" },
];

export function AnimatedCursors({
  cursors = defaultCursors,
}: AnimatedCursorsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
      {cursors.map((cursor, index) => (
        <SimulatedCursor key={`${cursor.name}-${index}`} {...cursor} />
      ))}
    </div>
  );
}
