import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import MobileNavigationItem from "../../MobileNavigationItem";
import {
  Stethoscope,
  Menu,
  Waypoints,
  StepForward,
  LucideCurrency,
  Minimize2,
  Home,
} from "lucide-react";
import Button from "../../ui/Button";
import useAuthStore from "@/stores/auth-store";
import { Link, useNavigate } from "react-router-dom";
import { createStagger } from "@/utils/motion-variants";

function LandingPageHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const navLinks = [
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
  ];

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
      className="fixed top-0 left-0 right-0 z-50 h-18 px-8 shadow-md rounded-none 
      shadow-black/30 bg-background border-b border-border"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto h-full">
        <Button variant="icon" size="md">
          <Stethoscope />
        </Button>

        <div className="hidden lg:flex items-center gap-12 xl:gap-16">
          <nav className="space-x-12 font-semibold [&>a]:hover:text-text text-sm [&>a]:transition-colors">
            <a href="#features">Features</a>
            <a href="#steps">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <Link className="shrink-0" to={user ? "/view" : "/auth"}>
            <Button color={user ? "white" : "brand"} border={false}>
              {user ? "Get Started" : "Sign in"}
            </Button>
          </Link>
        </div>

        <Button
          needsMotion={true}
          initial={{ scale: 0.75 }}
          animate={{ scale: 1 }}
          onClick={function () {
            setIsMobileMenuOpen(function (p) {
              return !p;
            });
          }}
          size="md"
          className="lg:hidden"
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
            className="lg:hidden absolute top-full left-0 right-0 p-6 px-8
             shadow-md shadow-black/25 border-b flex flex-col gap-8 border-border-strong bg-background"
          >
            {navLinks.map(function (item) {
              return (
                <motion.article variants={createStagger().children}>
                  <MobileNavigationItem {...item} />
                </motion.article>
              );
            })}
            <Link className="shrink-0" to={user ? "/view" : "/auth"}>
              <Button
                size="md"
                className="w-full"
                color={user ? "white" : "brand"}
                border={false}
              >
                {user ? "Get Started" : "Sign in"}
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default LandingPageHeader;
