import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import useModalStore from "@/stores/modal-store";

function Layout() {
  const openModal = useModalStore((s) => s.openModal);

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
      <NavBar />

      <main className="pt-28 p-6 px-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default Layout;
