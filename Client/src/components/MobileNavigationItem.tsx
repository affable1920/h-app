import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type Variant } from "motion/react";
import type { MobileNavItem } from "@/types/utils";
import { MobileNavVariants } from "@/utils/motion-variants";

const tabChildrenVariants: Record<string, Variant> = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    x: -20,
    opacity: 0,
  },
};

function MobileNavigationItem({
  label,
  icon: Icon,
  children,
  onclick,
}: MobileNavItem) {
  const hasChildren = !!children?.length;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div key={label}>
      <motion.button
        onClick={function () {
          if (hasChildren) {
            setIsExpanded((p) => !p);
            return;
          }

          onclick?.();
        }}
        className={`cursor-pointer flex items-center justify-between w-full font-semibold 
          capitalize hover:text-text-normal ${isExpanded ? "text-text" : ""}`}
      >
        <span className="inline-flex items-center gap-2 m-0">
          <span className="md:hidden">
            <Icon size={14} />
          </span>
          {label}
        </span>
        {hasChildren && (
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="md:hidden"
          >
            <ChevronRight size={14} strokeWidth={4} />
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
            variants={MobileNavVariants}
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
                {children?.map((child) => (
                  <motion.button
                    onClick={child.onclick}
                    variants={tabChildrenVariants}
                    className="capitalize cursor-pointer flex items-center gap-2 px-6 hover:bg-layout p-2 rounded-md 
                    hover:text-text w-full transition-colors duration-200"
                    key={child.label}
                  >
                    <child.icon size={10} />
                    {child.label}
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
