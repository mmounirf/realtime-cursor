import { PerfectCursor } from "perfect-cursors";
import { useCallback, useLayoutEffect, useState } from "react";

export function usePerfectCursor(
  cb: (point: number[]) => void,
  point?: number[]
) {
  const [perfectCursor] = useState(() => new PerfectCursor(cb));

  useLayoutEffect(() => {
    if (point) perfectCursor.addPoint(point);
    return () => perfectCursor.dispose();
  }, [perfectCursor]);

  const onPointChange = useCallback(
    (point: number[]) => perfectCursor.addPoint(point),
    [perfectCursor]
  );

  return onPointChange;
}
