import { NavLink } from "react-router-dom";
import { MdOutlineArrowDropDown } from "react-icons/md";

interface NavItemProps {
  href: string;
  label: string;
  onRouteClick?: () => void;
}

const NavItem = ({ href, label, onRouteClick }: NavItemProps) => {
  return (
    <NavLink className="navlink" onClick={onRouteClick} to={href}>
      {label}
    </NavLink>
  );
};

const navLinks = [
  { label: "Home", route: "/" },
  { label: "Find", route: "/find" },
  { label: "AI Chat", route: "/chat" },
  { label: "Directories", route: "/doctors", hasChildren: true },
];

interface NavLinksProps {
  showRoutes: boolean;
  onRouteChange: () => void;
}

const NavLinks = ({ showRoutes, onRouteChange }: NavLinksProps) => {
  return (
    <ul className={`navlinks ${showRoutes && "show"}`}>
      {navLinks.map(({ label, route, hasChildren }) => (
        <div className="flex justify-between items-center" key={label}>
          <NavItem href={route} label={label} onRouteClick={onRouteChange} />
          {hasChildren && <MdOutlineArrowDropDown />}
        </div>
      ))}
    </ul>
  );
};

export default NavLinks;
