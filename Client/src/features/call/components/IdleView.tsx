import Button from "@/components/lib/button/Button";
import type { DoctorHttpMinimal } from "@/types/doctors";
import { MessageSquareText, Video } from "lucide-react";

type Props = {
  startCall: () => void;
  doctor: DoctorHttpMinimal;
};

export function IdleView({ startCall, doctor }: Props) {
  const name = doctor.name;

  return (
    <div className="flex gap-4 flex-col items-center">
      <header className="flex flex-col items-center">
        <div className="size-28 rounded-full overflow-hidden">
          <img
            src={doctor.imageUrl ?? undefined}
            alt={`doctor ${name}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center mt-2 font-semibold text-text-normal capitalize tracking-[0.1em]">
          {name}
        </div>
      </header>

      <div className="flex items-center justify-center gap-4 [&_button]:rounded-full">
        <Button
          variant="icon"
          data-tooltip="send a text"
          aria-label={`message Dr. ${name}`}
          bg={true}
          color="white"
        >
          <MessageSquareText />
        </Button>
        <Button
          data-tooltip="call now"
          aria-label={`call Dr. ${name}`}
          onClick={startCall}
          variant="icon"
          bg={true}
          color="white"
        >
          <Video />
        </Button>
      </div>
    </div>
  );
}
