import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NavLink, useLocation } from "react-router-dom";

import Button from "@components/common/Button";
import { Menu, Minimize2, Search, Stethoscope } from "lucide-react";
import useAuthStore from "@/stores/authStore";

const navLinks = [
  { label: "Home", route: "/" },
  { label: "Find", route: "/" },
  { label: "Ask", route: "/chat" },
];

const NavBar = () => {
  const { pathname = "" } = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const navbar = ref?.current as HTMLElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (showMobileMenu && !navbar?.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (showMobileMenu && e.key == "Escape") {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [showMobileMenu]);

  return (
    <motion.header className="shadow-xl shadow-slate-300/20 border-b-2 border-b-slate-300/40 p-8 py-6 relative">
      <div className="max-w-7xl flex items-center justify-between mx-auto">
        <Button variant="icon">
          <Stethoscope />
        </Button>

        {/* Large screen navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((navItem) => (
            <NavLink key={navItem.label} to={navItem.route}>
              {navItem.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-6 font-bold cursor-pointer">
          <Button className="italic gap-2" variant="icon">
            Ctrl K
            <Search />
          </Button>

          <Button
            variant="icon"
            className="md:hidden"
            onClick={() => setShowMobileMenu((p) => !p)}
          >
            {showMobileMenu ? <Minimize2 /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.nav
              ref={ref}
              className="md:hidden absolute top-full left-0 w-full bg-white 
              flex flex-col gap-6 shadow-lg p-8"
              initial={{
                y: -20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{ y: -20, opacity: 0 }}
            >
              {navLinks.map((navItem) => (
                <NavLink
                  key={navItem.label}
                  to={navItem.route}
                  className="text-lg font-semibold"
                >
                  {navItem.label}
                </NavLink>
              ))}
              <Button size="xl">Sign in</Button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

NavBar.displayName = "NavBar";
export default NavBar;
