import { Outlet } from "react-router-dom";
import Modal from "./Modal";
import { useEffect } from "react";
import useModalStore from "@/stores/modal-store";

export default function App() {
  const openModal = useModalStore((s) => s.openModal);

  useEffect(function () {
    function globalSearch(ev: KeyboardEvent) {
      if (ev.ctrlKey && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        openModal("search");
      }
    }

    window.addEventListener("keydown", globalSearch);

    return function () {
      window.removeEventListener("keydown", globalSearch);
    };
  }, []);

  return (
    <>
      <Modal />
      <Outlet />
    </>
  );
}
