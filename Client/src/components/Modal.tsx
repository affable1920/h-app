import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import useModalStore from "../stores/modal-store";
import useInjectModalHandlers from "../hooks/use-modal-handlers";

import Overlay from "./ui/Overlay";
import MODAL_MAPPINGS from "./modals/modal-mapper";
import getModalConfig from "../utils/modal-styles";
import { useLocation } from "react-router-dom";

function Modal() {
  // Inject modal handlers for modal closers
  useInjectModalHandlers();

  const currModal = useModalStore((s) => s.currModal);
  const modalProps = useModalStore((s) => s.modalProps);
  const closeModal = useModalStore((s) => s.closeModal);

  const modalRef = useRef<HTMLDivElement | null>(null);

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
    [route, closeModal],
  );

  useEffect(
    function () {
      if (!currModal) {
        return;
      }

      const root = document.getElementById("root");

      if (!root) {
        return;
      }

      const trigger = document.activeElement as HTMLElement;

      const inertInitial = root.inert;
      const overflowInitial = document.body.style.overflow;

      root.inert = true;
      document.body.style.overflow = "hidden";

      const el = modalRef.current?.querySelector<HTMLElement>(
        "[data-modal-initial-focus]",
      );

      if (el) {
        el.focus();
      } else {
        modalRef.current?.focus();
      }

      return function () {
        root.inert = inertInitial;
        document.body.style.overflow = overflowInitial;
        if (trigger instanceof HTMLElement && trigger?.isConnected) {
          trigger?.focus();
        }
      };
    },
    [currModal],
  );

  const portal = document.getElementById("portal");
  if (!portal) {
    return null;
  }

  const ModalElement = currModal ? MODAL_MAPPINGS[currModal] : null;

  return createPortal(
    <AnimatePresence>
      {!!ModalElement && (
        <Overlay key={currModal} viewOverlay={modalProps.viewOverlay ?? true}>
          <motion.div
            ref={modalRef}
            style={{
              overscrollBehavior: "contain",
            }}
            id="modal"
            role="dialog"
            aria-modal="true"
            {...(ModalElement.title
              ? { "aria-labelledby": "modal-title" }
              : {
                  "aria-label": ModalElement.label,
                })}
            tabIndex={-1}
            variants={variants}
            {...{ ...variants }}
            className={stylesConfig}
          >
            {ModalElement.title && (
              <header id="modal-title" className="text-center my-2 mt-4">
                <h2 className="text-[13px] font-bold text-text-normal/80 uppercase">
                  {ModalElement.title}
                </h2>
              </header>
            )}
            <ModalElement.element {...modalProps} />
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>,
    portal,
  );
}

export default Modal;
