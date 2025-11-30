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

  const orientation = useDeviceOrientation();
  const isMobile = useRef(isMobileDevice());

  const mobilePosition = useRef({ x: 0.5, y: 0.5 });

  const calibration = useRef<{ gamma: number; beta: number } | null>(null);

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

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY } = event;

      const normalizedX = clientX / window.innerWidth;
      const normalizedY = clientY / window.innerHeight;

      broadcastPosition(normalizedX, normalizedY);
    },
    [broadcastPosition]
  );

  const throttledMouseMove = useThrottleCallback(handleMouseMove, throttleMs);

  useEffect(() => {
    if (!isMobile.current) return;
    if (orientation.gamma === null || orientation.beta === null) return;

    if (!calibration.current) {
      calibration.current = {
        gamma: orientation.gamma,
        beta: orientation.beta,
      };
      return;
    }

    const deltaGamma = orientation.gamma - calibration.current.gamma;
    const deltaBeta = orientation.beta - calibration.current.beta;

    const sensitivity = 30;

    const deltaX = deltaGamma / sensitivity;
    const deltaY = deltaBeta / sensitivity;

    mobilePosition.current = {
      x: Math.max(0, Math.min(1, mobilePosition.current.x + deltaX)),
      y: Math.max(0, Math.min(1, mobilePosition.current.y + deltaY)),
    };

    broadcastPosition(mobilePosition.current.x, mobilePosition.current.y);
  }, [orientation.gamma, orientation.beta, broadcastPosition]);

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

  useEffect(() => {
    if (isMobile.current) return;

    window.addEventListener("mousemove", throttledMouseMove);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
    };
  }, [throttledMouseMove]);

  return { cursors };
};
