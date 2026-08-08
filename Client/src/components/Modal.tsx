import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import useModalStore from "../stores/modal-store";
import useInjectModalHandlers from "../hooks/use-modal-handlers";

import Overlay from "./ui/Overlay";
import MODALS from "./modals/modal-mapper";
import getModalConfig from "../utils/modal-styles";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

function Modal() {
  // Inject modal handlers for modal closers
  useInjectModalHandlers();

  const currModal = useModalStore((s) => s.currModal);
  const modalProps = useModalStore((s) => s.modalProps);
  const closeModal = useModalStore((s) => s.closeModal);

  const { pathname: route } = useLocation();

  const { variants, stylesConfig } = useMemo(
    function () {
      return getModalConfig(modalProps.position);
    },
    [modalProps.position],
  );

  useEffect(
    function () {
      closeModal();
    },
    [route],
  );

  const portal = document.getElementById("portal");
  if (!portal) return null;

  const ModalElement = currModal ? MODALS[currModal] : null;

  return createPortal(
    <AnimatePresence mode="wait">
      {!!ModalElement && (
        <Overlay viewOverlay={modalProps.viewOverlay ?? true}>
          <motion.div
            style={{
              overscrollBehavior: "contain",
            }}
            id="modal"
            key={currModal}
            variants={variants}
            {...{ ...variants }}
            className={stylesConfig}
          >
            <ModalElement {...modalProps} />
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>,
    portal,
  );
}

export default Modal;
