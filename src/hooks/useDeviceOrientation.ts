import { useState, useEffect } from "react";
import { toast } from "sonner";

const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<
    Pick<DeviceOrientationEvent, "alpha" | "beta" | "gamma" | "absolute">
  >({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false,
  });

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
      });
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    } else {
      toast.error("Browser or device does not support orientation API");
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener(
          "deviceorientation",
          handleDeviceOrientation
        );
      }
    };
  }, []);

  return orientation;
};

export default useDeviceOrientation;
