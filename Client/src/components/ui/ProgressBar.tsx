import { useEffect } from "react";

type ProgressBarProps = {
  flag?: unknown;
  label?: string;
  maxProgress: number;
  removeOnFinish?: boolean;
};

function ProgressBar({
  maxProgress = 100,
  label,
  flag,
  removeOnFinish = true,
}: ProgressBarProps) {
  useEffect(
    function () {
      const $ = (id: string) => document.getElementById(id);

      let wrapper = $("progress-box") as HTMLDivElement,
        lbl = $("progress-label") as HTMLDivElement,
        bar = $("progress-bar") as HTMLDivElement,
        progress = 0;

      wrapper.style.display = "block";

      const id = setInterval(function () {
        progress += Math.random() + 12;
        bar.style["width"] = `${progress}%`;

        if (label) {
          lbl.textContent = label;
        }

        if (progress >= maxProgress) {
          bar.style["width"] = `${maxProgress}%`;
          if (label) {
            lbl.textContent = label;
          }

          clearInterval(id);

          if (removeOnFinish) {
            setTimeout(function () {
              wrapper.style.display = "none";
            }, 300);
          }
        }
      }, 80);

      return function () {
        clearInterval(id);
      };
    },
    [flag],
  );

  return (
    <>
      <div
        id="progress-box"
        style={{ display: "none" }}
        className="w-full bg-layout-raised overflow-hidden rounded-md shadow-sm shadow-black/50 
        p-0.5 flex self-center"
      >
        <div
          id="progress-bar"
          className="h-0.5 bg-brand rounded-md w-0 transition-all duration-300 ease-in-out"
        />
      </div>
      {label && <span id="progress-label" className="ml-2" />}{" "}
    </>
  );
}

export default ProgressBar;
