import { NavLink } from "react-router-dom";
import { MdOutlineArrowDropDown } from "react-icons/md";

interface NavItemProps {
  href: string;
  label: string;
}

const NavItem = ({ href, label }: NavItemProps) => {
  return (
    <NavLink className="navlink" to={href}>
      {label}
    </NavLink>
  );
};

const navLinks = [
  { label: "Home", route: "/" },
  { label: "Find", route: "/find" },
  { label: "AI Chat", route: "/chat" },
  {
    label: "Directories",
    route: "/doctors",
    hasChildren: true,
    children: [
      { label: "Doctors", route: "/doctors" },
      { label: "Clinics", route: "/clinics" },
    ],
  },
];

const NavLinks = ({ showRoutes }: { showRoutes: boolean }) => {
  return (
    <ul className={`navlinks ${showRoutes && "show"}`}>
      {navLinks.map((navItem) => (
        <div className="flex justify-between items-center" key={navItem.label}>
          <NavItem href={navItem.route} label={navItem.label} />
          {navItem.hasChildren && <MdOutlineArrowDropDown />}
        </div>
      ))}
    </ul>
  );
};

export default NavLinks;
