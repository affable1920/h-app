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
  BellOff,
  Bot,
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
import useAuthStore, { logout } from "@/stores/auth-store";
import type { MobileNavItem } from "@/types/utils";
import MobileNavigationItem from "./MobileNavigationItem";
import Divider from "./ui/Divider";
import NavigationItem from "./NavigationItem";

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
      onClick() {
        navigate("/view");
      },
    },
    {
      label: "Find",
      icon: Search,
      children: [
        {
          label: "doctor",
          icon: Stethoscope,
          route: "/view/idx/doctors",
        },
        {
          label: "hospital",
          icon: Hospital,
        },
        {
          label: "pharmacy",
          icon: Syringe,
          route: "/view/idx/clinics",
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
                label: "DND (Do Not Disturb)",
                icon: BellOff,
                onClick: function () {},
              },
              {
                label: "logout",
                icon: LogOut,
                onClick: function () {
                  logout("/");
                },
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 p-6 px-8 shadow-md rounded-none 
      shadow-black/25 bg-background border-b border-border-strong md:px-12"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Button
          variant="icon"
          aria-label="icon"
          onClick={function () {
            moveTo("/");
          }}
        >
          <Stethoscope />
        </Button>

        <div className="hidden md:flex items-center gap-12">
          <nav className="space-x-18 font-semibold [&>a]:hover:text-accent [&>a]:transition-colors md:flex md:items-center">
            {navLinks.map(function (navItem) {
              return <NavigationItem key={navItem.label} {...navItem} />;
            })}
          </nav>

          {!user && (
            <Button
              endIcon={<ArrowRight />}
              className="w-full"
              border={false}
              color="brand"
            >
              <Link to="/auth">sign in</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <Button
            className="italic text-sm"
            variant="icon"
            onClick={function () {
              const ev = new KeyboardEvent("keydown", {
                ctrlKey: true,
                key: "k",
              });
              window.dispatchEvent(ev);
            }}
          >
            Ctrl K
            <Search />
          </Button>

          <Button
            variant="icon"
            className="md:hidden"
            onClick={function () {
              setShowMobileMenu(function (p) {
                return !p;
              });
            }}
          >
            {showMobileMenu ? <Minimize2 /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.nav
            ref={ref}
            className="md:hidden absolute top-full left-0 right-0 p-6 px-8
             shadow-md shadow-black/25 border-b flex flex-col gap-10 border-border-strong bg-background"
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
            {navLinks.map(function (navItem) {
              return <MobileNavigationItem key={navItem.label} {...navItem} />;
            })}

            {!user && (
              <Link to="/auth" className="px-4">
                <Button
                  endIcon={<ArrowRight />}
                  className="w-full"
                  color="brand"
                  border={false}
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
