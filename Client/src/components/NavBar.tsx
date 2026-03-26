import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import {
  ArrowRight,
  Bot,
  History,
  Home,
  Hospital,
  LogOut,
  Mail,
  Menu,
  Minimize2,
  Search,
  Settings,
  Stethoscope,
  Syringe,
  User,
  VenetianMask,
} from "lucide-react";
import useAuthStore, { logout } from "@/stores/authStore";
import type { MobileNavItem } from "@/types/utils";
import MobileNavigationItem from "./MobileNavigationItem";

const NavBar = () => {
  const { pathname = "" } = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(
    function () {
      setShowMobileMenu(false);
    },
    [pathname],
  );

  const ref = useRef<HTMLElement>(null);

  useEffect(
    function () {
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

      return function () {
        document.removeEventListener("keydown", handleKeydown);
        document.removeEventListener("mousedown", handleMouseDown);
      };
    },
    [showMobileMenu],
  );

  const navLinks: Array<MobileNavItem> = [
    {
      label: "Home",
      icon: Home,
      onClick() {
        navigate("/");
      },
    },
    {
      label: "Find",
      icon: Search,
      children: [
        {
          label: "doctor",
          icon: Stethoscope,
          onClick() {
            navigate("/dir/doctors");
          },
        },
        {
          label: "hospital",
          icon: Hospital,
          onClick() {
            console.log("open a map later ..");
          },
        },
        {
          label: "pharmacy",
          icon: Syringe,
          onClick() {
            navigate("/dir/clinics");
          },
        },
        { label: "ask assistant (Pro)", icon: Bot },
      ],
    },
    {
      label: user?.username ?? "profile",
      icon: User,
      children: [
        { label: "settings", icon: Settings },
        { label: "messages", icon: Mail },
        {
          label: "history",
          icon: History,
          onClick() {
            navigate("/auth/me");
          },
        },
        { label: "logout", icon: LogOut, onClick: logout },
      ],
    },
  ];

  return (
    <motion.header className="shadow-xl shadow-slate-300/20 border-b-2 z-10 border-b-slate-300/40 p-8 py-6 relative">
      <div className="container flex items-center justify-between">
        <Button onClick={() => navigate("/")} variant="ghost">
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
              flex flex-col gap-10 shadow-lg p-8"
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
