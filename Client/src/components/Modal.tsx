import React from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import Overlay from "./Overlay";
import { CgClose } from "react-icons/cg";
import useModalStore from "../stores/modalStore";
import useInjectModalHandlers from "../hooks/useModalHandlers";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const MODALS: Record<string, React.ElementType> = {
  AIGenerateModal: () => (
    <div>
      <h2>Hello there !</h2>
    </div>
  ),
  schedule: () => (
    <motion.ul
      layout
      className="flex flex-col italic font-semibold justify-center items-center"
      initial={{ y: -10, opacity: 0, fontSize: "var(--text-sm)" }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.29 }}
    >
      <h2 className="underline underline-offset-2 mb-1">Schedule on</h2>
      {["Nearest Date", "Specific date"].map((item, i) => (
        <motion.li
          key={item}
          layoutId={item}
          transition={{ delay: i * 0.1, staggerChildren: 0.1 }}
        >
          <Link to="/schedule">{item}</Link>
        </motion.li>
      ))}
    </motion.ul>
  ),
};

const Modal = React.memo(() => {
  const currModal = useModalStore((s) => s.currModal);

  // Inject modal handlers for modal closers
  useInjectModalHandlers();
  const portal = document.getElementById("portal");

  const modalProps = useModalStore((s) => s.modalProps);
  const closeModal = useModalStore((s) => s.closeModal);

  if (!portal) return null;
  if (!currModal) return null;

  const ModalElement = MODALS[currModal];
  const { x, y } = modalProps.position || { x: 50, y: 50 };

  return createPortal(
    <Overlay viewOverlay={modalProps.viewOverlay ?? false}>
      {/* Actual modal */}
      <div
        className={"modal"}
        style={{
          transform: `translateX(${Math.floor(x)}px) translateY(${Math.floor(
            y
          )}px)`,
        }}
      >
        {/* <Button
          color="accent"
          onClick={closeModal}
          className="absolute p-1 right-2 top-2 border-[1px]"
        >
          <CgClose />
        </Button> */}
        {ModalElement && <ModalElement />}
      </div>
    </Overlay>,
    portal
  );
});

export default Modal;
