import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLocation } from "react-router-dom";

import NavLinks from "./NavLinks.js";
import Button from "./common/Button.js";
import { Menu, Search } from "lucide-react";

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

  return (
    <motion.nav ref={ref} className="navbar">
      <Button
        variant="icon"
        className="lg:hidden"
        onClick={() => setShowRoutes((p) => !p)}
      >
        <Menu />
      </Button>

      <div className="flex items-center gap-2 italic font-bold cursor-pointer lg:order-10">
        <Button className="flex items-center" variant="icon">
          Ctrl K
          <Search />
        </Button>
      </div>

      <NavLinks showRoutes={showRoutes} />
    </motion.nav>
  );
};

NavBar.displayName = "NavBar";
export default NavBar;
