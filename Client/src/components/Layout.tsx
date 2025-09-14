import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Modal from "./Modal";

const Layout = () => {
  return (
    <>
      <Modal />
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
