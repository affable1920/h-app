import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, NavLink, useLocation } from "react-router-dom";

import Button from "@/components/ui/Button";
import {
  ArrowRight,
  Home,
  LogOut,
  Mail,
  Menu,
  Minimize2,
  Search,
  Settings,
  Stethoscope,
  User,
  VenetianMask,
} from "lucide-react";
import useAuthStore, { logout } from "@/stores/authStore";
import type { MobileNavItem } from "@/types/utils";
import MobileNavigationItem from "./MobileNavigationItem";

const navLinks: Array<MobileNavItem> = [
  { label: "Home", icon: Home },
  { label: "Find", icon: Search },
  { label: "Ask", icon: VenetianMask },
  {
    label: "profile",
    icon: User,
    children: [
      { label: "settings", icon: Settings },
      { label: "messages", icon: Mail },
      { label: "logout", icon: LogOut, onClick: logout },
    ],
  },
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
    <motion.header className="shadow-xl shadow-slate-300/20 border-b-2 z-10 border-b-slate-300/40 p-8 py-6 relative">
      <div className="container flex items-center justify-between">
        <Button variant="ghost">
          <Stethoscope />
        </Button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center font-semibold text-sm gap-12">
          {navLinks.map((navItem) => (
            <NavLink key={navItem.label} to={`/${navItem.label}`}>
              <h1 className="capitalize">{navItem.label}</h1>
            </NavLink>
          ))}

          <Button endIcon={<ArrowRight />} className="w-full" color="secondary">
            {user ? (
              <Link to="/">Get started</Link>
            ) : (
              <Link to="/auth">sign in</Link>
            )}
          </Button>
        </nav>

        <div className="flex md:hidden items-center gap-4 font-bold cursor-pointer">
          <Button className="italic gap-2 text-sm" variant="ghost">
            Ctrl K
            <Search />
          </Button>

          <Button variant="ghost" onClick={() => setShowMobileMenu((p) => !p)}>
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
                y: -30,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -20,
                opacity: 0,
                transition: { type: "tween", ease: "backOut" },
              }}
            >
              {navLinks.map((navItem) => (
                <MobileNavigationItem {...navItem} />
              ))}

              <Button
                endIcon={<ArrowRight />}
                className="w-full"
                color="secondary"
                size="lg"
              >
                {user ? (
                  <Link to="/">Get started</Link>
                ) : (
                  <Link to="/auth">sign in</Link>
                )}
              </Button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

NavBar.displayName = "NavBar";
export default NavBar;
