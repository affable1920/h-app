import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, NavLink, useLocation } from "react-router-dom";

import Button from "@components/common/Button";
import { ArrowRight, Menu, Minimize2, Search, Stethoscope } from "lucide-react";
import useAuthStore from "@/stores/authStore";

const navLinks = [
  { label: "Home", route: "/" },
  { label: "Find", route: "/" },
  { label: "Ask", route: "/chat" },
];

const NavBar = () => {
  const { pathname = "" } = useLocation();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMore, setShowMore] = useState(false);

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
            <NavLink key={navItem.label} to={navItem.route}>
              {navItem.label}
            </NavLink>
          ))}

          <Button
            endIcon={<ArrowRight />}
            className="w-full"
            color="accent"
            style={{ paddingBlock: "6px" }}
          >
            {user ? (
              <Link to="/" style={{ all: "unset" }}>
                Get started
              </Link>
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

          <Button
            variant="ghost"
            className=""
            onClick={() => setShowMobileMenu((p) => !p)}
          >
            {showMobileMenu ? <Minimize2 /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.nav
              style={{ willChange: "contents" }}
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
                  className="font-semibold"
                >
                  {navItem.label}
                </NavLink>
              ))}

              <Button
                endIcon={<ArrowRight />}
                variant="ghost"
                className={`self-start w-full justify-between!`}
                onClick={() => setShowMore((p) => !p)}
              >
                More
              </Button>

              <AnimatePresence mode="wait">
                {showMore && (
                  <motion.div
                    initial={{
                      x: -20,
                      opacity: 0,
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.22,
                        delayChildren: 0.22,
                        ease: "easeIn",
                        staggerChildren: 0.1,
                      },
                    }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex flex-col gap-4 [&>a]:capitalize"
                  >
                    {["profile", "settings", "about us", "privacy policy"].map(
                      (item) => (
                        <NavLink to={`/auth/me`}>{item}</NavLink>
                      ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                endIcon={<ArrowRight />}
                className="w-full"
                color="accent"
                size="lg"
              >
                {user ? (
                  <Link to="/" style={{ all: "unset" }}>
                    Get started
                  </Link>
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
