import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import Modal from "../modal/Modal";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ScheduleProvider } from "@components/providers/ScheduleProvider";

const Layout = () => {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <Modal />
        <header className="app-header">
          <NavBar />
        </header>
        <main>
          <Outlet />
        </main>
      </ScheduleProvider>
    </AuthProvider>
  );
};

export default Layout;
