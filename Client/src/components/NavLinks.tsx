import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

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

const NavLinks = ({ showRoutes = false }: { showRoutes: boolean }) => {
  return (
    <motion.ul
      initial={false}
      animate={{
        opacity: showRoutes ? 1 : 0,
        y: showRoutes ? 0 : -30,
        pointerEvents: showRoutes ? "auto" : "none",
      }}
      transition={{
        duration: 0.24,
        ease: "easeOut",
        opacity: { duration: 0.15 },
      }}
      className="navlinks"
    >
      {navLinks.map((navItem, i) => (
        <motion.li
          initial={false}
          key={navItem.label}
          animate={{
            opacity: showRoutes ? 1 : 0,
            y: showRoutes ? 0 : -20,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
            delay: showRoutes ? i * 0.08 : 0,
          }}
          className="navlink"
        >
          <NavLink to={navItem.route}>
            {navItem.label}
            {navItem.hasChildren && <ChevronDown />}
          </NavLink>
        </motion.li>
      ))}
    </motion.ul>
  );
};

export default NavLinks;
