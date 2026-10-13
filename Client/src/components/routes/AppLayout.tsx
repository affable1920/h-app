import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";

function Layout() {
  return (
    <>
      <NavBar />

      <main className="pt-16 px-8 py-6">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
