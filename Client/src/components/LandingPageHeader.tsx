import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import MobileNavigationItem from "./MobileNavigationItem";
import {
  Stethoscope,
  Menu,
  Waypoints,
  StepForward,
  LucideCurrency,
  Minimize2,
  Home,
} from "lucide-react";
import Button from "./ui/Button";
import useAuthStore from "@/stores/authStore";
import { Link, useNavigate } from "react-router-dom";
import { createStagger } from "@/utils/motion-variants";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.token);
  const navigate = useNavigate();

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
      shadow-black/25 bg-background border-b border-border-strong"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Button variant="icon">
          <Stethoscope />
        </Button>

        <div className="md:flex items-center gap-12 hidden">
          <nav className="space-x-8 font-semibold [&>a]:hover:text-text [&>a]:transition-colors">
            <a href="#features">Features</a>
            <a href="#steps">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          {user ? (
            <Link to="/view">
              <Button color="brand" border={false}>
                Get Started
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button color="brand" border={false}>
                Sign in
              </Button>
            </Link>
          )}
        </div>

        <Button
          needsMotion={true}
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
            variants={createStagger().parent}
            initial={"initial"}
            animate={"animate"}
            exit="exit"
            className="md:hidden absolute top-full left-0 right-0 p-6 px-8
             shadow-md shadow-black/25 border-b flex flex-col gap-8 border-border-strong bg-background"
          >
            {[
              {
                label: "Home",
                icon: Home,
                onClick() {
                  navigate("/view");
                },
              },
              { label: "features", icon: Waypoints },
              { label: "how it works", icon: StepForward },
              { label: "pricing", icon: LucideCurrency },
            ].map((item) => {
              return (
                <motion.article variants={createStagger().children}>
                  <MobileNavigationItem {...item} />
                </motion.article>
              );
            })}
            {user ? (
              <Link to="/view">
                <Button
                  color="brand"
                  border={false}
                  className="w-full"
                  size="md"
                >
                  Get Started
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button
                  color="brand"
                  border={false}
                  className="w-full"
                  size="md"
                >
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
