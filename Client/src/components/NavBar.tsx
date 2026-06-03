import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Link,
  useLocation,
  useNavigate,
  type NavigateOptions,
} from "react-router-dom";

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
} from "lucide-react";
import useAuthStore, { logout } from "@/stores/authStore";
import type { MobileNavItem } from "@/types/utils";
import MobileNavigationItem from "./MobileNavigationItem";
import Divider from "./ui/Divider";

function NavBar() {
  const { pathname = "" } = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const moveTo = useCallback(
    function (href: string, options?: NavigateOptions) {
      navigate(href, { ...options });
    },
    [navigate],
  );

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
      route: "",
    },
    {
      label: "Find",
      icon: Search,
      children: [
        {
          label: "doctor",
          icon: Stethoscope,
          route: "idx/doctors",
        },
        {
          label: "hospital",
          icon: Hospital,
        },
        {
          label: "pharmacy",
          icon: Syringe,
          route: "idx/clinics",
        },
        {
          label: "ask assistant (Pro Plan)",
          icon: Bot,
          route: "chat",
        },
      ],
    },
    ...(user
      ? [
          {
            label: "Account",
            icon: Settings,
            children: [
              { label: "profile", icon: User, route: "/view/auth/me" },
              { label: "messages", icon: Mail },
              {
                label: "history",
                icon: History,
              },
              { label: "logout", icon: LogOut, onClick: logout },
            ],
          },
        ]
      : []),
  ];

  function handleLinkClick(this: MobileNavItem) {
    this.onClick ? this.onClick() : navigate(this.route ?? "");
  }

  return (
    <motion.header
      className="absolute top-0 left-0 right-0 z-50 p-4 px-8 rounded-none border-b
      border-border"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Button
          variant="icon"
          onClick={function () {
            moveTo("/");
          }}
        >
          <Stethoscope />
        </Button>

        <div className="hidden md:flex items-center gap-12">
          <nav className="space-x-8 font-semibold [&>a]:hover:text-accent [&>a]:transition-colors md:flex md:items-center">
            {navLinks.map((navItem) => (
              <Button
                variant="icon"
                key={navItem.label}
                className="hover:text-blue-800 transition-colors"
                onClick={handleLinkClick.bind(navItem)}
              >
                {navItem.label}
              </Button>
            ))}
          </nav>

          <Button endIcon={<ArrowRight />} className="w-full" color="brand">
            {user ? (
              <Link to="/">Get started</Link>
            ) : (
              <Link to="/auth">sign in</Link>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <div className="flex md:hidden items-center gap-4 font-bold cursor-pointer">
            <Button
              onClick={function () {
                const ev = new KeyboardEvent("keydown", {
                  ctrlKey: true,
                  key: "k",
                });

                window.dispatchEvent(ev);
              }}
              className="italic gap-2 text-sm tracking-wider"
            >
              Ctrl K
              <Search />
            </Button>
          </div>

          <Button
            variant="icon"
            className="md:hidden"
            onClick={setShowMobileMenu.bind(null, (p) => !p)}
          >
            {showMobileMenu ? <Minimize2 /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.nav
            ref={ref}
            className="md:hidden absolute top-full left-0 w-full flex flex-col gap-10 shadow-md 
            shadow-black/50 p-8 bg-background border-b border-border-strong"
            initial={{
              y: -20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -10,
              opacity: 0,
              transition: { ease: "backOut" },
            }}
          >
            {navLinks.map((navItem) => (
              <MobileNavigationItem key={navItem.label} {...navItem} />
            ))}

            {!user && (
              <Link to="/auth" className="px-4">
                <Button
                  endIcon={<ArrowRight />}
                  className="w-full"
                  color="brand"
                  size="md"
                >
                  sign in
                </Button>
              </Link>
            )}

            <Divider />
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

NavBar.displayName = "NavBar";
export default NavBar;
