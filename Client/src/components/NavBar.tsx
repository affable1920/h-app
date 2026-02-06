import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLocation } from "react-router-dom";

import NavLinks from "./NavLinks.js";
import Button from "@components/common/Button";
import useModalStore from "@/stores/modalStore";
import { Menu, Search, SquareChevronDown } from "lucide-react";

const NavBar = () => {
  const { pathname = "" } = useLocation();
  const [showRoutes, setShowRoutes] = useState(false);

  useEffect(() => {
    if (showRoutes) setShowRoutes(false);
  }, [pathname]);

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const navbar = ref?.current as HTMLElement;
    const handleMouseDown = (e: MouseEvent) => {
      if (navbar && showRoutes && !navbar.contains(e.target as Node))
        setShowRoutes(false);
    };

    document.addEventListener("click", handleMouseDown);
    return () => document.removeEventListener("click", handleMouseDown);
  }, [showRoutes]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (showRoutes && e.key == "Escape") setShowRoutes(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showRoutes]);

  function showAuthOptions() {
    useModalStore.getState().openModal("authOptions", {
      position: "top",
    });
  }

  return (
    <motion.nav
      ref={ref}
      className="container flex min-h-14 justify-between items-center relative"
    >
      <Button
        variant="icon"
        className="lg:hidden"
        onClick={() => setShowRoutes((p) => !p)}
      >
        <Menu />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex items-center gap-4 italic font-bold cursor-pointer lg:order-10">
        <div className="flex items-center gap-2">
          Ctrl K
          <Button variant="icon">
            <Search />
          </Button>
        </div>

        <Button onClick={showAuthOptions} variant="icon">
          <SquareChevronDown />
        </Button>
      </div>

      <NavLinks showRoutes={showRoutes} />
    </motion.nav>
  );
};

NavBar.displayName = "NavBar";
export default NavBar;
