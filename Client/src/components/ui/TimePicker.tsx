import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Stack } from "./Stack";
import { AnimatePresence, motion } from "motion/react";
import Badge from "./Badge";

const HOURS = Array.from({ length: 24 }, function (_, i) {
  return String(i).padStart(2, "0");
});
const MINUTES = ["00", "15", "30", "45"];

type TimeCol = "hh" | "mm";

const FRAME_MAP: Record<TimeCol, Array<string>> = {
  hh: HOURS,
  mm: MINUTES,
};

type ColumnProps = {
  colType: TimeCol;
  selected: string | null;
  onSelect: (v: string) => void;
};

function TimeColumn({ colType, selected, onSelect }: ColumnProps) {
  const frames = FRAME_MAP[colType];
  const [showFrames, setShowFrames] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const displayItem: string = (frames.find(function (item) {
    return item === selected;
  }) ?? frames[0])!;

  useEffect(
    function () {
      if (!showFrames) return;

      function mousedown(ev: MouseEvent) {
        if (!(ev.target as Element).closest(`#time-picker-${colType}`)) {
          setShowFrames(false);
        }
      }

      document.addEventListener("mousedown", mousedown);
      return function () {
        document.removeEventListener("mousedown", mousedown);
      };
    },
    [showFrames, colType],
  );

  const rect = btnRef.current?.getBoundingClientRect();
  const portal = document.getElementById("portal");

  return (
    <article className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={function () {
          setShowFrames(function (p) {
            return !p;
          });
        }}
        className="px-4 py-1.5 rounded-md text-sm cursor-pointer transition-colors bg-layout-raised font-semibold"
      >
        {displayItem}
      </button>

      {portal &&
        createPortal(
          <AnimatePresence>
            {showFrames && rect && (
              <motion.div
                id={`time-picker-${colType}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="fixed bg-layout-raised rounded-lg shadow-lg border-2 border-border-strong p-3 
                flex flex-wrap gap-2 justify-center items-center"
                style={{
                  top: rect.bottom + 6,
                  left: rect.left,
                  width: 180,
                  zIndex: 99999,
                }}
              >
                {frames.map(function (item) {
                  return (
                    <Badge
                      size="md"
                      key={item}
                      full={false}
                      selected={item === selected}
                      onClick={function () {
                        onSelect(item);
                        setShowFrames(false);
                      }}
                    >
                      {item}
                    </Badge>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          portal,
        )}
    </article>
  );
}

export function TimePicker({
  selected = "00:00",
  onChange,
}: {
  selected: string;
  onChange: (val: string) => void;
}) {
  const [selectedFrame, setSelectedFrame] = useState<
    Record<string, null | string>
  >({
    hh: null,
    mm: null,
  });

  useEffect(
    function () {
      const calculated = selected.split(":");

      setSelectedFrame({
        hh: calculated[0]!,
        mm: calculated[1]!,
      });
    },
    [selected],
  );

  return (
    <Stack
      gap="sm"
      align="center"
      className="bg-layout p-3 rounded-xl border border-border-strong shadow-md"
    >
      <TimeColumn
        selected={selectedFrame.hh ?? null}
        colType="hh"
        onSelect={function (h) {
          setSelectedFrame(function (p) {
            return { ...p, hh: h };
          });
          onChange(`${h}:${selectedFrame.mm}`);
        }}
      />
      <span className="text-text-secondary font-bold">:</span>
      <TimeColumn
        colType="mm"
        onSelect={function (m) {
          setSelectedFrame(function (p) {
            return { ...p, mm: m };
          });
          onChange(`${selectedFrame.hh}:${m}`);
        }}
        selected={selectedFrame.mm ?? null}
      />
    </Stack>
  );
}
