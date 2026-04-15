import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import Modal from "../modal/Modal";
import useAuthStore, { logout } from "@/stores/authStore";
import signalingClient from "@/services/SignalingClient";
import useModalStore from "@/stores/modalStore";
import { toast } from "sonner";

function handleLogout() {
  toast.message("Session expired. logging out");
  logout();
}

const Layout = () => {
  const jwt = useAuthStore((s) => s.token);
  const openModal = useModalStore((s) => s.openModal);

  useEffect(
    function () {
      if (!jwt) {
        return;
      }

      signalingClient.connect(jwt);
      signalingClient.addEventListener("session-expired", handleLogout);

      return () => signalingClient.close(1000, "Unmounting!");
    },
    [jwt],
  );

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
      <Modal />
      <NavBar />
      <main className="p-8 py-6">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Layout;
