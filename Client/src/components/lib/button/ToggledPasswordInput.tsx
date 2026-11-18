import { Input, type InputProps } from "@/components/ui/Input";
import { forwardRef, useEffect, useState, type ChangeEvent } from "react";
import Button from "./Button";
import { View } from "lucide-react";

export const ToggledPasswordInput = forwardRef<HTMLInputElement, InputProps>(
  function ({ ...rest }, ref) {
    const [viewPassword, setViewPassword] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(
      function () {
        const frame = requestAnimationFrame(function () {
          if (rest.value) {
            setShowButton(true);
          }

          return function () {
            cancelAnimationFrame(frame);
          };
        });
      },
      [rest.value],
    );

    function handleChange(ev: ChangeEvent<HTMLInputElement>) {
      setShowButton(Boolean(ev.currentTarget.value));
      rest.onChange?.(ev);
    }

    return (
      <div className="flex items-center w-full relative">
        <Input.Element
          type={viewPassword ? "text" : "password"}
          {...rest}
          ref={ref}
          onChange={handleChange}
        />
        {showButton && (
          <Button
            type="button"
            onClick={function () {
              setViewPassword((p) => !p);
            }}
            data-tooltip={viewPassword ? "Hide password" : "Show password"}
            variant="icon"
          >
            <View size={10} className="absolute right-3" />
          </Button>
        )}
      </div>
    );
  },
);
