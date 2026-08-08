import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";

function Layout() {
  return (
    <>
      <NavBar />

      <main className="pt-28 p-6 px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default Layout;
