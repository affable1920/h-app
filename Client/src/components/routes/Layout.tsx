import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import Modal from "../modal/Modal";
import AuthProvider from "@/stores/AuthProvider";

const Layout = () => {
  return (
    <AuthProvider>
      <Modal />
      <header className="app-header">
        <NavBar />
      </header>
      <main>
        <Outlet />
      </main>
    </AuthProvider>
  );
};

export default Layout;
