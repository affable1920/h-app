import { stagger, type Variant } from "motion/react";

export const ClinicViewVariants: Record<string, Record<string, Variant>> = {
  containerVariants: {
    initial: { opacity: 0, y: -40 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: stagger(0.12, { startDelay: 0.25 }),
        ease: "easeOut",
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -20, // smaller than initial so it feels like a retreat, not a full replay
      transition: {
        ease: "easeIn",
        duration: 0.2, // slightly faster than enter feels snappier
      },
    },
  },

  articleVariants: {
    initial: { opacity: 0, x: -30 },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -20,
    },
  },

  innerContainerVariants: {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        delayChildren: stagger(0.1, { startDelay: 0.1 }),
      },
    },
  },

  badgeVariants: {
    initial: {
      x: -20,
      opacity: 0,
    },
    animate: { x: 0, opacity: 1 },
  },
};
