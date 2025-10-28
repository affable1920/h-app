import React from "react";
import { createPortal } from "react-dom";
import Overlay from "./Overlay";
import useModalStore from "../stores/modalStore";
import useInjectModalHandlers from "../hooks/useModalHandlers";
import useDoctorsStore from "../stores/doctorsStore";
import ScheduleModal from "./ScheduleModal";
import DirectoryFilter from "./DirectoryFilter";
import { AnimatePresence, motion, type Variant } from "motion/react";

const modalProperties: Record<string, string> = {
  bottom: "bottom",
  center: "center",
};

const bottomModalVariants: Record<string, Variant> = {
  initial: {
    y: "100%",
  },
  animate: {
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.075, type: "spring" },
  },
};

const centerModalVariants: Record<string, Variant> = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    scale: 0,
    opacity: 0,
  },
};

const modalVariants: Record<"center" | "bottom", Record<string, Variant>> = {
  bottom: bottomModalVariants,
  center: centerModalVariants,
};

const MODALS: Record<string, React.ElementType> = {
  AIGenerateModal() {
    return (
      <div>
        <h2>Hello there !</h2>
      </div>
    );
  },

  schedule: ScheduleModal,

  directoryFilter: DirectoryFilter,

  call() {
    const { currDoctor } = useDoctorsStore.getState();

    return (
      <article>
        <h2 className="card-h2">{currDoctor?.name}</h2>
      </article>
    );
  },
};

const Modal = React.memo(() => {
  // Inject modal handlers for modal closers
  useInjectModalHandlers();

  const currModal = useModalStore((s) => s.currModal);
  const modalProps = useModalStore((s) => s.modalProps);

  function getModalStyleConfig() {
    let classes: string = "";
    let variants: Record<string, Variant> = {};

    if (typeof modalProps?.position === "string") {
      classes = ["modal", modalProperties[modalProps.position ?? "center"]]
        .filter(Boolean)
        .join(" ");
      variants = modalVariants[modalProps.position ?? "center"];
    }

    return { classes, variants };
  }

  const portal = document.getElementById("portal");
  if (!portal) return null;

  const ModalElement = currModal ? MODALS[currModal] : null;
  const { classes, variants } = getModalStyleConfig();

  return createPortal(
    <AnimatePresence mode="wait">
      {currModal && ModalElement && (
        <Overlay
          key="modalOverlay"
          viewOverlay={modalProps.viewOverlay ?? false}
        >
          <motion.div
            key={currModal}
            className={classes}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ModalElement {...modalProps} />
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>,
    portal
  );
});

export default Modal;
