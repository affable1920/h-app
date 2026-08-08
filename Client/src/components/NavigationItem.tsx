import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
} from "react";
import { MobileNavVariants } from "@/utils/motion-variants";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, stagger, type Variant } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";

export type MobileNavItem = {
  label: string;
  icon: ElementType;
  onClick?: () => void;
  route?: string;
  children?: Array<MobileNavItem>;
};

const tabChildrenVariants: Record<string, Variant> = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    x: -15,
    opacity: 0,
    transition: {
      duration: 0.125,
    },
  },
};

export function NavigationItem({ label, children }: MobileNavItem) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  function handleClickInside(this: MobileNavItem) {
    this.onClick ? this.onClick() : navigate(this.route ?? "");
  }

  const setTimer = useCallback(
    function () {
      timerRef.current = setTimeout(function () {
        setIsExpanded(false);
      }, 120);
    },
    [isExpanded],
  );

  useEffect(
    function () {
      setIsExpanded(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [location.pathname],
  );

  return (
    <article className="">
      <motion.button
        onMouseEnter={function () {
          setIsExpanded(true);
        }}
        onMouseLeave={setTimer}
        className={`cursor-pointer flex items-center gap-2.5 w-full font-semibold 
          capitalize hover:text-text-normal`}
      >
        {label}

        {children && (
          <motion.span
            animate={{
              rotate: isExpanded ? 180 : 0,
              transition: {
                duration: 0.22,
                ease: "circIn",
              },
            }}
          >
            <ChevronDown size={12} strokeWidth={4} />
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (children ?? []).length && (
          <motion.div
            layout
            onMouseEnter={function () {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }
            }}
            onMouseLeave={setTimer}
            className="absolute top-[110%] z-50 bg-layout py-4 px-4 
            whitespace-nowrap ring-3 ring-border-vivid/40 rounded-lg shadow-md 
            shadow-black/20 -translate-x-1/2"
            key={label}
            initial="hidden"
            animate="visible"
            exit={{
              transition: {
                delayChildren: stagger(0),
                duration: 0,
              },
            }}
            variants={MobileNavVariants}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: "auto",
              }}
              exit={{
                height: 0,
              }}
              style={{ overflow: "hidden" }}
            >
              <div className="space-y-4">
                {children?.map(function (child) {
                  return (
                    <motion.button
                      onClick={handleClickInside.bind(child)}
                      variants={tabChildrenVariants}
                      className="capitalize cursor-pointer flex items-center gap-2 
                      p-2 px-6 pl-4 text-left rounded-md hover:text-text w-full 
                    hover:bg-indicator-drk/10 transition-colors duration-300 
                    hover:shadow-xs hover:shadow-black/5"
                      key={child.label}
                    >
                      <child.icon size={10} />
                      {child.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default NavigationItem;
