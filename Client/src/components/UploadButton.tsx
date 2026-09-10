import { type InputHTMLAttributes } from "react";
import { Stack } from "./ui/Stack";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  src?: string;
  clear?: () => void;
  error?: string;
}
const accent = "#4f6ef7";

function UploadButton({ src, error }: Props) {
  return (
    <Stack align="center" gap="md" className="p-5 rounded-xl bg-layout-raised">
      <Stack
        justify="center"
        align="center"
        orientation="V"
        style={{
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            cursor: "pointer",
            overflow: "hidden",
            flexShrink: 0,
            fontSize: 28,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {src ? <img src={src} className="size-full object-cover" /> : "👨🏻‍⚕️"}
        </div>

        {error && <div className="text-red-400 text-[10px]">{error}</div>}
      </Stack>

      <div>
        <div
          className="font-bold text-text-normal"
          style={{
            fontSize: 14,
          }}
        >
          Profile Photo
        </div>
        <div
          style={{
            color: "var(--color-text-teritiary)",
            fontSize: 12,
            marginBottom: 4,
            lineHeight: 1.25,
            fontWeight: 600,
          }}
        >
          A clear headshot works best.
          <br /> PNG or JPG, <strong>max 1 MB</strong>.
        </div>
        <label
          style={{
            display: "inline-flex",
            marginTop: 4,
            padding: "5px 14px",
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Upload Photo
          <input type="file" accept="image/*" style={{ display: "none" }} />
        </label>
      </div>
    </Stack>
  );
}

export default UploadButton;
