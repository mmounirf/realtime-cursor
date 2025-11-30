import supabase from "@/lib/supabase";
import {
  RealtimeChannel,
  REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import useDeviceOrientation from "./useDeviceOrientation";

const useThrottleCallback = <Params extends unknown[], Return>(
  callback: (...args: Params) => Return,
  delay: number
) => {
  const lastCall = useRef(0);
  const timeout = useRef<number | null>(null);

  return useCallback(
    (...args: Params) => {
      const now = Date.now();
      const remainingTime = delay - (now - lastCall.current);

      if (remainingTime <= 0) {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
        lastCall.current = now;
        callback(...args);
      } else if (!timeout.current) {
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeout.current = null;
          callback(...args);
        }, remainingTime);
      }
    },
    [callback, delay]
  );
};

const generateRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;

const generateRandomNumber = () => Math.floor(Math.random() * 100);

const EVENT_NAME = "realtime-cursor-move";

type CursorEventPayload = {
  position: {
    x: number;
    y: number;
  };
  user: {
    id: number;
    name: string;
  };
  color: string;
  timestamp: number;
};

// Helper to detect if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const useRealtimeCursors = ({
  roomName,
  username,
  throttleMs,
}: {
  roomName: string;
  username: string;
  throttleMs: number;
}) => {
  const [color] = useState(generateRandomColor());
  const [userId] = useState(generateRandomNumber());
  const [cursors, setCursors] = useState<Record<string, CursorEventPayload>>(
    {}
  );
  const cursorPayload = useRef<CursorEventPayload | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Device orientation for mobile
  const orientation = useDeviceOrientation();
  const isMobile = useRef(isMobileDevice());

  // Smoothing buffer for orientation values to reduce jitter
  const orientationBuffer = useRef<Array<{ gamma: number; beta: number }>>([]);
  const BUFFER_SIZE = 5; // Number of readings to average

  const broadcastPosition = useCallback(
    (normalizedX: number, normalizedY: number) => {
      const payload: CursorEventPayload = {
        position: {
          x: normalizedX,
          y: normalizedY,
        },
        user: {
          id: userId,
          name: username,
        },
        color: color,
        timestamp: new Date().getTime(),
      };

      cursorPayload.current = payload;

      channelRef.current?.send({
        type: "broadcast",
        event: EVENT_NAME,
        payload: payload,
      });
    },
    [color, userId, username]
  );

  const throttledBroadcast = useThrottleCallback(broadcastPosition, throttleMs);

  // Desktop mouse handler
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY } = event;

      // Normalize to 0-1 range based on viewport
      const normalizedX = clientX / window.innerWidth;
      const normalizedY = clientY / window.innerHeight;

      broadcastPosition(normalizedX, normalizedY);
    },
    [broadcastPosition]
  );

  const throttledMouseMove = useThrottleCallback(handleMouseMove, throttleMs);

  // Mobile motion handler
  useEffect(() => {
    if (!isMobile.current) return;
    if (orientation.gamma === null || orientation.beta === null) return;

    // Add current reading to buffer
    orientationBuffer.current.push({
      gamma: orientation.gamma,
      beta: orientation.beta,
    });

    // Keep buffer size limited
    if (orientationBuffer.current.length > BUFFER_SIZE) {
      orientationBuffer.current.shift();
    }

    // Need enough samples before calculating
    if (orientationBuffer.current.length < BUFFER_SIZE) return;

    // Calculate moving average to smooth out jitter
    const avgGamma =
      orientationBuffer.current.reduce((sum, r) => sum + r.gamma, 0) /
      BUFFER_SIZE;
    const avgBeta =
      orientationBuffer.current.reduce((sum, r) => sum + r.beta, 0) /
      BUFFER_SIZE;

    // Apply deadzone to ignore very small movements
    const DEADZONE = 0.5; // Ignore movements smaller than 0.5 degrees
    const lastReading =
      orientationBuffer.current[orientationBuffer.current.length - 2];

    if (lastReading) {
      const gammaDiff = Math.abs(avgGamma - lastReading.gamma);
      const betaDiff = Math.abs(avgBeta - lastReading.beta);

      // If movement is too small, don't update
      if (gammaDiff < DEADZONE && betaDiff < DEADZONE) {
        return;
      }
    }

    // Sensitivity: how many degrees of tilt for full screen traversal
    const tiltRange = 30; // ±30 degrees for full range

    // Map gamma to x position (0 to 1)
    // Reverse the direction: when you tilt/point device LEFT (negative gamma), cursor goes LEFT
    // When you tilt/point device RIGHT (positive gamma), cursor goes RIGHT
    let normalizedX = 0.5 - (avgGamma / tiltRange) * 0.5;
    normalizedX = Math.max(0, Math.min(1, normalizedX));

    // Map beta to y position
    // Reverse the direction: when you tilt/point device UP (backward, negative beta), cursor goes UP
    // When you tilt/point device DOWN (forward, positive beta), cursor goes DOWN
    const betaCenter = 80;
    let normalizedY = 0.5 - ((avgBeta - betaCenter) / tiltRange) * 0.5;
    normalizedY = Math.max(0, Math.min(1, normalizedY));

    // Broadcast directly - let perfect-cursors handle smoothing
    throttledBroadcast(normalizedX, normalizedY);
  }, [orientation.gamma, orientation.beta, throttledBroadcast]);

  useEffect(() => {
    const channel = supabase.channel(roomName, { config: { private: true } });

    channel
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach(function (element) {
          setCursors((prev) => {
            if (prev[element.key]) {
              delete prev[element.key];
            }

            return { ...prev };
          });
        });
      })
      .on("presence", { event: "join" }, () => {
        if (!cursorPayload.current) return;

        channelRef.current?.send({
          type: "broadcast",
          event: EVENT_NAME,
          payload: cursorPayload.current,
        });
      })
      .on(
        "broadcast",
        { event: EVENT_NAME },
        (data: { payload: CursorEventPayload }) => {
          const { user } = data.payload;
          // Don't render your own cursor
          if (user.id === userId) return;

          setCursors((prev) => {
            if (prev[userId]) {
              delete prev[userId];
            }

            return {
              ...prev,
              [user.id]: data.payload,
            };
          });
        }
      )
      .subscribe(async (status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          await channel.track({ key: userId });
          channelRef.current = channel;
        } else {
          setCursors({});
          channelRef.current = null;
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomName, userId]);

  // Only add mouse listener on desktop
  useEffect(() => {
    if (isMobile.current) return;

    window.addEventListener("mousemove", throttledMouseMove);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
    };
  }, [throttledMouseMove]);

  return { cursors };
};
