import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

const items = [
  "🫀 Cardiology",
  "🧠 Neurology",
  "🦴 Orthopedics",
  "👁️ Ophthalmology",
  "🧒 Pediatrics",
  "🦷 Dentistry",
  "🫁 Pulmonology",
  "🩻 Radiology",
  "💊 Psychiatry",
];

interface MarqueeProps {
  direction?: "rtl" | "ltr";
  speed?: number;
}

export function Marquee({ direction = "rtl", speed = 25 }: MarqueeProps) {
  const doubled = [...items, ...items];
  const controls = useAnimationControls();

  function start() {
    controls.start({
      x: direction === "rtl" ? ["0%", "-50%"] : ["0%", "50%"],

      transition: {
        duration: speed,
        ease: "linear",
        repeat: Infinity,
      },
    });
  }

  useEffect(function () {
    start();
  }, []);

  return (
    <div
      className="overflow-hidden relative w-full"
      style={{ userSelect: "none" }}
      onMouseEnter={controls.stop}
      onMouseLeave={start}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 h-full w-8 z-10"
        style={{
          background:
            "linear-gradient(to right, var(--color-background), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 h-full w-8 z-10"
        style={{
          background:
            "linear-gradient(to left, var(--color-background), transparent)",
        }}
      />

      <motion.div animate={controls} className="flex gap-4 w-max">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="px-5 py-2 rounded-full  bg-layout-50 text-text text-sm font-medium whitespace-nowrap shadow-sm"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
