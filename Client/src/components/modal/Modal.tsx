import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import useModalStore from "../../stores/modalStore";
import useInjectModalHandlers from "../../hooks/modalHandlers";

import Overlay from "./Overlay";
import MODALS from "./ModalElements";
import getModalConfig from "./constants";

const Modal = React.memo(() => {
  // Inject modal handlers for modal closers
  useInjectModalHandlers();

  const currModal = useModalStore((s) => s.currModal);
  const modalProps = useModalStore((s) => s.modalProps);

  const { variants, stylesConfig } = useMemo(
    function () {
      return getModalConfig(modalProps.position);
    },
    [modalProps.position],
  );

  const portal = document.getElementById("portal");
  if (!portal) return null;

  const ModalElement = currModal ? MODALS[currModal] : null;

  return createPortal(
    <AnimatePresence mode="wait">
      {!!ModalElement && (
        <Overlay viewOverlay={modalProps.viewOverlay ?? false}>
          <motion.div
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
});

export default Modal;
