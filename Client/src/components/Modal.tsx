import React from "react";
import { createPortal } from "react-dom";
import Overlay from "./Overlay";
import useModalStore from "../stores/modalStore";
import useInjectModalHandlers from "../hooks/useModalHandlers";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import useDocStore from "../stores/doctorsStore";

const MODALS: Record<string, React.ElementType> = {
  AIGenerateModal: () => {
    return (
      <div>
        <h2>Hello there !</h2>
      </div>
    );
  },
  schedule: ({ docID }: { docID: string }) => {
    return (
      <motion.ul
        layout
        className="flex flex-col italic font-semibold justify-center"
        initial={{ y: -10, opacity: 0, fontSize: "var(--text-sm)" }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.29 }}
      >
        <h2 className="underline underline-offset-2 mb-1">Schedule on</h2>
        {["Nearest Date", "Specific date", "Check doctor's schedule"].map(
          (item, i) => (
            <motion.li
              key={item}
              layoutId={item}
              transition={{ delay: i * 0.1, staggerChildren: 0.1 }}
            >
              <Link to={`doctors/${docID}/schedule`}>{item}</Link>
            </motion.li>
          )
        )}
      </motion.ul>
    );
  },

  call() {
    const { currDoctor } = useDocStore.getState();

    return (
      <article>
        <h2 className="card-h2">{currDoctor?.name}</h2>
      </article>
    );
  },
};

const Modal = React.memo(() => {
  useInjectModalHandlers();

  const currModal = useModalStore((s) => s.currModal);
  // Inject modal handlers for modal closers

  const portal = document.getElementById("portal");
  const modalProps = useModalStore((s) => s.modalProps);

  const { x, y } = modalProps.position || { x: 50, y: 50 };

  const transform = modalProps.viewOverlay
    ? ""
    : `translateX(${Math.floor(x)}px) translateY(${Math.floor(y)}px)`;

  if (!portal || !currModal) return null;

  const ModalElement = MODALS[currModal];
  if (!ModalElement) return null;

  return createPortal(
    <Overlay viewOverlay={modalProps.viewOverlay ?? false}>
      {/* Actual modal */}
      <div
        className={"modal"}
        style={{
          transform,
        }}
      >
        {ModalElement && <ModalElement {...modalProps} />}
      </div>
    </Overlay>,
    portal
  );
});

export default Modal;
