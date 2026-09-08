import { memo, useRef, useState, type KeyboardEvent } from "react";
import { Stack } from "../ui/Stack";
import Button from "../ui/Button";
import { Edit, X, Save } from "lucide-react";

interface EditableFieldProps {
  initialValue: string;
  onSave: (key: string, val: string) => void;
  name: string;
}

export const EditableField = memo(function EditableField({
  name,
  initialValue,
  onSave,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);

  function handleEdit() {
    setIsEditing(true);

    requestAnimationFrame(function () {
      editorRef.current?.focus();

      const range = document.createRange();
      const selection = document.getSelection();

      if (!editorRef.current || !selection) {
        return;
      }

      range.selectNodeContents(editorRef.current);
      range.collapse(false);

      selection.removeAllRanges();
      selection.addRange(range);
    });
  }

  function handleCancel() {
    const el = editorRef.current;

    if (!el) {
      return;
    }

    el.textContent = initialValue;

    setIsDirty(false);
    setIsEditing(false);
  }

  function handleSave() {
    const el = editorRef.current;

    if (!isDirty || !el) {
      return;
    }

    const value = el.textContent ?? "";
    onSave(name, value);

    setIsDirty(false);
    setIsEditing(false);
  }

  function handleKeyDown(ev: KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Escape") {
      handleCancel();
      return;
    }

    if (ev.key === "Enter") {
      ev.preventDefault();
      handleSave();
    }
  }

  return (
    <Stack align="center" className={`group/${name} relative`}>
      <div
        spellCheck={false}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        ref={editorRef}
        translate="no"
        role="textbox"
        enterKeyHint="enter"
        aria-multiline="false"
        onInput={function (ev) {
          const value = ev.currentTarget.textContent?.trim();
          setIsDirty(value !== initialValue.trim());
        }}
        defaultValue={initialValue}
        className="text-md flex items-center gap-2 capitalize text-text-normal group-hover/name:text-text
        group-hover/name:cursor-pointer font-semibold outline-none focus:ring-2 hover:cursor-text
        focus:ring-blue-400/20 rounded-md w-fit focus:ring-offset-2 focus:ring-offset-blue-400/15
        py-1"
        onKeyDown={handleKeyDown}
      >
        {initialValue}
      </div>

      <Stack className="min-w-18" align="center">
        {!isEditing ? (
          <Button
            data-tooltip={`Edit your ${name}`}
            aria-label={`edit ${name}`}
            className="opacity-75 hover:opacity-100 transition-opacity duration-150"
            variant="icon"
            size="sm"
            onClick={handleEdit}
          >
            <Edit />
          </Button>
        ) : (
          <Stack align="center" gap={4}>
            <Button
              data-tooltip={isDirty ? "Discard changes" : "Cancel"}
              aria-label="discard changes"
              onClick={handleCancel}
              variant="icon"
              size="sm"
            >
              <X />
            </Button>
            <Button
              aria-label="save changes"
              data-tooltip="Save changes"
              type="submit"
              id="save-button"
              variant="icon"
              size="sm"
              disabled={!isDirty}
              onClick={handleSave}
            >
              <Save />
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
});
