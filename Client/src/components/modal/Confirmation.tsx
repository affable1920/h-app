import Button from "../common/Button";
import { Check, X } from "lucide-react";
import useModalStore from "@/stores/modalStore";

interface ConfirmationProps {
  resolve: () => void;
  reject: () => void;
  text: string;
}

const Confirmation = ({ resolve, reject, text = "" }: ConfirmationProps) => {
  const closeModal = useModalStore((s) => s.closeModal);

  function onConfirmation(accept: boolean) {
    console.log("Offer accepted -> ", accept);

    if (accept) {
      resolve();
    } else {
      reject();
    }

    closeModal();
  }

  return (
    <div className="space-y-8 py-4 font-semibold">
      <div
        style={{ lineHeight: 1.2 }}
        className="text-center text-md first-letter:capitalize"
      >
        {text}
      </div>
      <div className="flex items-center justify-between px-4">
        <Button variant="outlined" onClick={onConfirmation.bind(null, false)}>
          Decline <X strokeWidth={4} />
        </Button>
        <Button color="secondary" onClick={onConfirmation.bind(null, true)}>
          Accept <Check strokeWidth={4} />
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
