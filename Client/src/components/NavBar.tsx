import { useEffect, useRef, useState } from "react";
import NavLinks from "./NavLinks.js";
import { HiMenuAlt2 } from "react-icons/hi";
import AuthActions from "./AuthActions.js";

const Logo = ({ toggleFn }: { toggleFn: () => void }) => {
  return (
    <button onClick={toggleFn} className="lg:hidden">
      <HiMenuAlt2 />
    </button>
  );
};

const NavBar = () => {
  const [showRoutes, setShowRoutes] = useState(false);
  const onRouteChange = () => setShowRoutes(false);

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
    <nav className="navbar lg:flex-nowrap" ref={ref}>
      <Logo toggleFn={() => setShowRoutes((p) => !p)} />
      <NavLinks showRoutes={showRoutes} onRouteChange={onRouteChange} />
      <AuthActions />
    </nav>
  );
};

export default NavBar;
