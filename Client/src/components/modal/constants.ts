import type { Variant } from "motion/react";

export type Position = "top" | "bottom" | "center";

const modalProperties: Record<string, string> = {
  top: "top",
  bottom: "bottom",
  center: "center",
};

function YModalVariants(pstn: Position): Record<string, Variant> {
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
    },
  },
};

export default function getModalConfig(pstn: Position = "center") {
  const variants = modalVariants[pstn];
  const stylesConfig = ["modal", modalProperties[pstn]]
    .filter(Boolean)
    .join(" ");

  return {
    variants,
    stylesConfig,
  };
}
