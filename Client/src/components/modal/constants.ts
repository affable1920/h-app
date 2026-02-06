import type { Variant } from "motion/react";

export type Position = "top" | "bottom" | "center";

const modalProperties: Record<string, string> = {
  top: `fixed inset-0 w-full h-full max-h-52 rounded-b-md border-b-slate-300 ring-4 ring-blue-600/20 rounded-md`,

  bottom: `fixed bottom-0 rounded-md left-0 w-full rounded-t-md border-t-slate-300 ring-4 ring-blue-400/40`,

  center: `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[300px] rounded-lg 
  border-2 border-slate-400/40`,
};

function YModalVariants(
  pstn: Exclude<Position, "center">,
): Record<string, Variant> {
  if (pstn === "bottom") {
    return {
      initial: {
        y: "100%",
        opacity: 0,
      },
      animate: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.24,
          ease: "easeOut",
          opacity: { duration: 0.2 },
        },
      },
      exit: {
        y: "100%",
        opacity: 0,
        transition: {
          ease: "linear",
          duration: 0.1,
          opacity: { duration: 0.1 },
        },
      },
    };
  }

  return {
    initial: {
      y: "-100%",
    },
    animate: {
      y: 0,
      transition: { duration: 0.22, ease: "easeOut" },
    },
    exit: {
      y: "-100%",
      transition: { duration: 0.1, ease: "linear" },
    },
  };
}

const modalVariants: Record<Position, Record<string, Variant>> = {
  top: YModalVariants("top"),
  bottom: YModalVariants("bottom"),
  center: {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.1,
        ease: "linear",
      },
    },
  },
};

export default function getModalConfig(pstn: Position = "center") {
  const baseModal = `bg-white shadow-lg shadow-slate-400/40 p-2 scrollbar-hidden`;
  const variants = modalVariants[pstn];

  const stylesConfig = [baseModal, modalProperties[pstn]]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    variants,
    stylesConfig,
  };
}
