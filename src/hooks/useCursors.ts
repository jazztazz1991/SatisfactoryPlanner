"use client";

import { useCallback, useRef } from "react";

const THROTTLE_MS = 100; // ~10fps for cursor updates

/**
 * Throttled cursor position sender.
 * Returns an onMouseMove handler that calls `sendCursorPosition` at most every THROTTLE_MS.
 */
export function useCursorTracking(sendCursorPosition: (x: number, y: number) => void) {
  const lastSentRef = useRef(0);

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastSentRef.current < THROTTLE_MS) return;
      lastSentRef.current = now;

      // Get position relative to the canvas viewport
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      sendCursorPosition(x, y);
    },
    [sendCursorPosition]
  );

  return { onMouseMove };
}
