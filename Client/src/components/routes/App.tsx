import { Outlet } from "react-router-dom";
import Modal from "../modal/Modal";

export default function App() {
  return (
    <>
      <Modal />
      <Outlet />
    </>
  );
}
