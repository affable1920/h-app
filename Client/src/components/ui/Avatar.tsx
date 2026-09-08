import { useEffect, useState, type ChangeEvent } from "react";
import Button from "./Button";
import { AnimatePresence, motion } from "motion/react";
import { Camera, SaveAll, X } from "lucide-react";

type ImageUploaderProps = {
  initialSrc: string;
  alt: string;
  id: string;
  name: string;
  onSave: (name: string, src: string) => Promise<void>;
};

export function Avatar({
  name,
  initialSrc,
  alt,
  id,
  onSave,
}: ImageUploaderProps) {
  const [previewSrc, setPreviewSrc] = useState(initialSrc);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    function () {
      return function () {
        if (previewSrc.startsWith("blob:")) {
          URL.revokeObjectURL(previewSrc);
        }
      };
    },
    [previewSrc],
  );

  useEffect(
    function () {
      if (!error) {
        return;
      }

      const tId = setTimeout(function () {
        setError(null);
      }, 5000);

      return function () {
        clearTimeout(tId);
      };
    },
    [error],
  );

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    const nextPreview = URL.createObjectURL(file);

    setPreviewSrc(nextPreview);
    setIsDirty(true);
  }

  function handleCancel() {
    setPreviewSrc(initialSrc);
    setIsDirty(false);
  }

  async function handleSave() {
    if (!isDirty) {
      return;
    }

    setError(null);

    try {
      await onSave(name, previewSrc);
    } catch (exc) {
      const msg = (exc as { message: string }).message;
      setError(msg);
      setPreviewSrc(initialSrc);
    } finally {
      setIsDirty(false);
    }
  }

  return (
    <div className="flex w-fit flex-col items-start gap-2 relative">
      <label
        htmlFor={id}
        className="group relative block size-20 cursor-pointer overflow-hidden rounded-full"
      >
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
        />

        <img src={previewSrc} alt={alt} className="size-full object-cover" />

        {/* Hover overlay */}
        <div
          className="
          absolute inset-0 flex items-center justify-center
          bg-black/40 opacity-0 transition-opacity
          group-hover:opacity-100
          "
        >
          <Camera size={20} className="text-white" aria-hidden="true" />
        </div>
      </label>

      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 
            rounded-lg bg-background p-1 shadow-lg"
          >
            <Button
              size="sm"
              variant="icon"
              aria-label="Discard new profile picture"
              data-tooltip="Discard changes"
              onClick={handleCancel}
            >
              <X />
            </Button>

            <Button
              aria-label="Save Changes"
              data-tooltip="Save Changes"
              variant="icon"
              className="text-xs"
              onClick={handleSave}
            >
              <SaveAll />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!!error && (
          <motion.span
            initial={{ y: -4 }}
            animate={{ y: 0 }}
            exit={{ y: -2 }}
            transition={{
              ease: "easeIn",
              duration: 0.2,
            }}
            role="alert"
            className="text-red-400 text-xs first-letter:capitalize absolute -bottom-3.5 whitespace-nowrap"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
