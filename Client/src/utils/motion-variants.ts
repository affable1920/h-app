import { stagger, type Variant } from "motion/react";

export const ClinicViewVariants: Record<string, Record<string, Variant>> = {
  containerVariants: {
    initial: { opacity: 0, y: -40 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: stagger(0.2, { startDelay: 0.25 }),
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
};

export const MobileNavVariants: Record<string, Variant> = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.1, { startDelay: 0.05 }),
    },
  },
  exit: {
    transition: {
      delayChildren: stagger(0.05, { from: "last" }),
    },
  },
};

export const MobileNavItemVariants: Record<string, Variant> = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

type StaggerArgs = {
  exitDelay?: boolean;
};

export function createStagger({ exitDelay = true }: StaggerArgs = {}): Record<
  "parent" | "children",
  Record<string, Variant>
> {
  const VARIANT_1 = {
    parent: {
      initial: {},
      animate: {
        transition: {
          delayChildren: stagger(0.1, { startDelay: 0.05 }),
        },
      },
      exit: {
        transition: exitDelay
          ? {
              delayChildren: stagger(0.05, { from: "last" }),
            }
          : {},
      },
    },
    children: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
  };

  return VARIANT_1;
}
