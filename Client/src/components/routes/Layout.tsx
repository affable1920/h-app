import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import useAuthStore, { logout } from "@/stores/authStore";
import useModalStore from "@/stores/modalStore";
import { toast } from "sonner";
import Button from "../ui/Button";
import { ArrowBigDown } from "lucide-react";

function handleLogout() {
  toast.message("Session expired. logging out");
  logout();
}

const Layout = () => {
  const jwt = useAuthStore((s) => s.token);
  const openModal = useModalStore((s) => s.openModal);

  // useEffect(
  //   function () {
  //     if (!jwt) {
  //       return;
  //     }

  //     signalingClient.connect(jwt);
  //     signalingClient.addEventListener("session-expired", handleLogout);

  //     return () => signalingClient.close(1000, "Unmounting!");
  //   },
  //   [jwt],
  // );

  useEffect(function () {
    function keydown(ev: KeyboardEvent) {
      if (ev.ctrlKey && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        openModal("search");
      }
    }

    window.addEventListener("keydown", keydown);

    return function () {
      window.removeEventListener("keydown", keydown);
    };
  }, []);

  return (
    <>
      <NavBar />
      <main className="pt-24 md:pt-32 py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Layout;
