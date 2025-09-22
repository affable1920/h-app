import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Modal from "./Modal";

const Layout = () => {
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
