import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

export function useVideoControls(delay: number = 3000) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    function () {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      setVisible(true);
      timer.current = setTimeout(function () {
        setVisible(false);
      }, delay);
    },
    [delay],
  );

  function hide() {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    setVisible(false);
  }

  useEffect(function () {
    return function () {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return {
    visible,
    show,
    // spread on the surface that toggles the controls when tapped
    surfaceProps: {
      onPointerUp(ev: PointerEvent) {
        ev.stopPropagation();

        if (ev.pointerType === "mouse") {
          return;
        }

        if (visible) {
          hide();
        } else {
          show();
        }
      },
    },
    // spread on the controls: using them keeps them up and resets the timer
    controlProps: {
      onPointerUp(ev: PointerEvent) {
        ev.stopPropagation();
        if (ev.pointerType !== "mouse") {
          show();
        }
      },
    },
  };
}
