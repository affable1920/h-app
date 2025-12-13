import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";

import NavLinks from "./NavLinks.js";
import Button from "./common/Button.js";
import { Menu, Search } from "lucide-react";
import useAuth from "@/hooks/useAuth.js";
import { BiSolidUser } from "react-icons/bi";
import useModalStore from "@/stores/modalStore.js";

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

  const { user } = useAuth();

  function showAuthOptions() {
    return useModalStore.getState().openModal.bind(null, "authOptions", {
      user,
      position: "top",
    });
  }

  return (
    <motion.nav ref={ref} className="navbar">
      <Button
        variant="icon"
        className="lg:hidden"
        onClick={() => setShowRoutes((p) => !p)}
      >
        <Menu />
      </Button>

      <div className="flex items-center gap-4 italic font-bold cursor-pointer lg:order-10">
        <Button className="flex items-center" variant="icon">
          Ctrl K
          <Search />
        </Button>

        {user && (
          <Button onClick={showAuthOptions()} variant="icon">
            <BiSolidUser />
          </Button>
        )}
      </div>

      <NavLinks showRoutes={showRoutes} />
    </motion.nav>
  );
};

NavBar.displayName = "NavBar";
export default NavBar;
