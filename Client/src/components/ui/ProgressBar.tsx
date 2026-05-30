import { useEffect } from "react";

function ProgressBar({ flag }: { flag: any }) {
  useEffect(
    function () {
      progress();
    },
    [flag],
  );

  function progress() {
    const $ = (id: string) => document.getElementById(id);

    let parent = $("prog") as HTMLDivElement,
      lbl = $("prog-label") as HTMLDivElement,
      bar = $("bar") as HTMLDivElement,
      progress = 0;

    parent.style.display = "block";

    const id = setInterval(function () {
      progress += Math.random() + 12;
      bar.style.width = `${progress}%`;

      lbl.textContent = `Uploading ... ${progress.toFixed(1)}%`;

      if (progress >= 100) {
        bar.style.width = `${progress}%`;
        lbl.textContent = "File uploaded successfully";
        clearInterval(id);

        setTimeout(function () {
          parent.style.display = "none";
        }, 300);
      }
    }, 80);
  }

  return (
    <div
      id="prog"
      className="text-xs space-y-1 grow"
      style={{ display: "none" }}
    >
      <div id="prog-label" className="leading-tight line-clamp-1 capitalize" />
      <div id="bar" className="h-1.5 bg-black rounded-md" />
    </div>
  );
}

export default ProgressBar;
