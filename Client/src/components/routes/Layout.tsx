import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import Modal from "../modal/Modal";
import useAuthStore from "@/stores/authStore";
import signalingClient from "@/services/SignalingClient";

const Layout = () => {
  const jwt = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!jwt) {
      return;
    }

    signalingClient.connect(jwt);

    return () => signalingClient.close(1000, "Unmounting!");
  }, [jwt]);

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
