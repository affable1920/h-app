import { Outlet } from "react-router-dom";
import Modal from "./Modal";
import { usePrevious } from "@/hooks/use-previous";

export default function App() {
  usePrevious();

  return (
    <>
      <Modal />
      <Outlet />
    </>
  );
}
