import type { Variant } from "motion/react";

export type Position = "top" | "bottom" | "center" | "left";

const modalProperties: Record<Position, string> = {
  top: `fixed inset-0 w-full h-full max-h-52 rounded-b-md border-2 border-border-strong rounded-md`,
  bottom: `fixed bottom-0 min-h-48 left-0 w-full rounded-t-md`,
  center: `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[300px] rounded-lg 
  border-2 border-border`,
  left: `absolute inset-0 max-w-72`,
};

function YModalVariants(
  pstn: Exclude<Position, "center">,
): Record<string, Variant> {
  if (pstn === "bottom") {
    return {
      initial: {
        y: "50%",
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
        y: "25%",
        opacity: 0,
        transition: {
          ease: "easeIn",
          duration: 0.1,
        },
      },
    };
  }

  return {
    initial: {
      y: "-50%",
    },
    animate: {
      y: 0,
      transition: { duration: 0.22, ease: "easeOut" },
    },
    exit: {
      y: "-25%",
      transition: { duration: 0.1, ease: "easeIn" },
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
      transition: {
        ease: "easeOut",
        duration: 0.25,
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.12,
        ease: "easeIn",
      },
    },
  },
  left: {
    initial: {
      x: "-40px",
    },
    animate: {
      x: 0,
      transition: {
        duration: 0.24,
        ease: "easeOut",
      },
    },
    exit: {
      x: "-20px",
      transition: {
        duration: 0.05,
        type: "tween",
      },
    },
  },
};

export default function getModalConfig(pstn: Position = "center") {
  const baseModal = `bg-layout shadow-lg shadow-black/40 scrollbar-hidden`;
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
