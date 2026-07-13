import Button from "@/components/ui/Button";
import { AudioLines, MessageSquareText, Video } from "lucide-react";

type Props = {
  drName: string;
  drImg: string;
  startCall: () => void;
};

export function IdleView({ drImg, drName, startCall }: Props) {
  return (
    <div className="flex gap-4 flex-col items-center">
      <header className="flex flex-col items-center">
        <div className="max-w-20 max-h-20 rounded-full overflow-hidden">
          <img
            src={drImg}
            alt="Doctor"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center mt-2 font-semibold text-text-normal">
          {drName}
        </div>
      </header>

      <div className="flex items-center justify-center gap-4 [&>*]:rounded-full">
        <Button variant="icon" bg={true} color="white">
          <AudioLines />
        </Button>
        <Button variant="icon" bg={true} color="white">
          <MessageSquareText />
        </Button>
        <Button onClick={startCall} variant="icon" bg={true} color="white">
          <Video />
        </Button>
      </div>
    </div>
  );
}
