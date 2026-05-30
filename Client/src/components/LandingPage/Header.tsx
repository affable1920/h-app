import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, stagger, type Variant } from "motion/react";
import MobileNavigationItem from "../MobileNavigationItem";
import {
  Stethoscope,
  Menu,
  Waypoints,
  StepForward,
  LucideCurrency,
  Minimize2,
} from "lucide-react";
import Button from "../ui/Button";
import useAuthStore from "@/stores/authStore";
import { Link } from "react-router-dom";

const container: Record<string, Variant> = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delayChildren: stagger(0.1, { startDelay: 0.05 }) },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      delayChildren: stagger(0.1, { startDelay: 0.05 }),
      ease: "backOut",
    },
  },
};

const items = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.token);

  useEffect(
    function () {
      function handleMousedown(ev: MouseEvent) {
        if (isMobileMenuOpen && !ref.current?.contains(ev.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }

      function escape(ev: KeyboardEvent) {
        if (isMobileMenuOpen && ev.key === "Escape") {
          setIsMobileMenuOpen(false);
        }
      }

      document.addEventListener("keydown", escape);
      document.addEventListener("mousedown", handleMousedown);

      return function () {
        document.removeEventListener("keydown", escape);
        document.removeEventListener("mousedown", handleMousedown);
      };
    },
    [isMobileMenuOpen],
  );

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 p-6 px-8 shadow-md rounded-none 
      shadow-black/25 bg-background border-b border-border"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Button variant="icon">
          <Stethoscope />
        </Button>

        <div className="md:flex items-center gap-12 hidden">
          <nav className="space-x-8 font-semibold [&>a]:hover:text-accentdark [&>a]:transition-colors">
            <a href="#features">Features</a>
            <a href="#steps">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          {user ? (
            <Link to="/view">
              <Button color="brand">Get Started</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button color="brand">Sign in</Button>
            </Link>
          )}
        </div>

        <Button
          initial={{ scale: 0.75 }}
          animate={{ scale: 1 }}
          onClick={() => setIsMobileMenuOpen((p) => !p)}
          className="md:hidden"
          variant="icon"
        >
          {isMobileMenuOpen ? <Minimize2 /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={ref}
            variants={container}
            initial={"hidden"}
            animate={"visible"}
            exit="exit"
            className="md:hidden absolute top-full left-0 right-0 p-6 px-8
             shadow-lg border-b flex flex-col gap-8 border-border-vivid bg-background"
          >
            {[
              { label: "features", icon: Waypoints },
              { label: "how it works", icon: StepForward },
              { label: "pricing", icon: LucideCurrency },
            ].map((item) => {
              return (
                <motion.article variants={items}>
                  <MobileNavigationItem {...item} />
                </motion.article>
              );
            })}
            {user ? (
              <Link to="/view">
                <Button color="brand" className="w-full" size="md">
                  Get Started
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button color="brand" className="w-full" size="md">
                  Sign in
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
