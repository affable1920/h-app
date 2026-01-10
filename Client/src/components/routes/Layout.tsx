import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import Modal from "../modal/Modal";
import { ScheduleProvider } from "@components/providers/ScheduleProvider";

const Layout = () => {
  return (
    <ScheduleProvider>
      <Modal />
      <header className="bg-white shadow-md shadow-slate-200/50 relative z-5">
        <NavBar />
      </header>
      <main className="container">
        <Outlet />
      </main>
    </ScheduleProvider>
  );
};

export default Layout;
