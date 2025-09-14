import { NavLink, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", route: "/" },
  { label: "Dashboard", route: "/dashboard" },
  { label: "Education", route: "/edu" },
  { label: "Diagnosis", route: "/diagnosis" },
];

const NavItem = ({
  href,
  label,
  onRouteClick,
}: {
  href: string;
  label: string;
  onRouteClick?: () => void;
}) => {
  return (
    <NavLink className="navlink" onClick={onRouteClick} to={href}>
      {label}
    </NavLink>
  );
};

interface NavLinksProps {
  showRoutes: boolean;
  onRouteChange: () => void;
}

const NavLinks = ({ showRoutes, onRouteChange }: NavLinksProps) => {
  return (
    <ul className={`navlinks ${showRoutes && "show"}`}>
      {navLinks.map(({ label, route }) => (
        <NavItem
          href={route}
          label={label}
          key={label}
          onRouteClick={onRouteChange}
        />
      ))}
    </ul>
  );
};

export default NavLinks;
