import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, stagger, type Variant } from "motion/react";
import type { MobileNavItem } from "@/types/utils";

const tabVariants: Record<string, Variant> = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.1, { startDelay: 0.05 }),
    },
  },
  exit: {
    transition: {
      delayChildren: stagger(0.075),
    },
  },
};

const tabChildrenVariants: Record<string, Variant> = {
  hidden: { x: -25, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: {
    x: -20,
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const EMPTY = Object.create(null);

function MobileNavigationItem({ label, icon: Icon, children }: MobileNavItem) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = !!children?.length;

  return (
    <div>
      <motion.button
        whileTap={{ scale: hasChildren ? 0.975 : 1, originX: 0 }}
        key={label}
        onClick={setIsExpanded.bind(EMPTY, (p) => !p)}
        className="cursor-pointer flex items-center justify-between w-full font-semibold capitalize"
      >
        <span className="inline-flex items-center gap-2">
          <Icon size={14} />
          {label}
        </span>
        {hasChildren && (
          <motion.span
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              color: "#3a4050",
              display: "inline-block",
            }}
          >
            <ChevronRight
              className={`${isExpanded ? "rotate-90" : "rotate-0"}`}
              size={14}
              strokeWidth={4}
            />
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            key={label}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: "auto",
              }}
              exit={{ height: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              style={{ overflow: "hidden" }}
            >
              <div className="mt-6 space-y-6">
                {children?.map(({ icon: Icon, label, onClick }) => (
                  <motion.button
                    onClick={onClick}
                    variants={tabChildrenVariants}
                    className="capitalize cursor-pointer flex items-center gap-2 px-6"
                    key={label}
                  >
                    <Icon size={10} />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileNavigationItem;
