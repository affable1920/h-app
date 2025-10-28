import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../NavBar";
import Modal from "../Modal";
import { useEffect } from "react";
import useModalStore, { removeModal } from "../../stores/modalStore";

const Layout = () => {
  const { pathname: route } = useLocation();

  useEffect(() => {
    removeModal();
  }, [route]);

  useEffect(() => {
    if (useModalStore.getState().currModal) {
      const root = document.documentElement;
      root.style.scrollBehavior = "unset";
    }
  }, []);

  return (
    <>
      <Modal />
      <header className="app-header">
        <NavBar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
