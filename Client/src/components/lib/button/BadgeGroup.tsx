import { type BadgeProps } from "@/components/ui/Badge";
import { cn } from "@/utils/utils";
import { type ReactNode } from "react";

type OptionValue = string | number;

type Option<T extends OptionValue> = {
  value: T;
  render: (props: BadgeProps) => ReactNode;
};

type Props<T extends OptionValue> = {
  options: readonly Option<T>[];
  selected: T | null;
  className?: string;
  onClick: (next: T | null) => void;
  grouplabel: ReactNode;
};

const labelStyle = "text-text-normal capitalize text-center";

export function BadgeGroup<T extends OptionValue>({
  options,
  className,
  selected,
  onClick,
  grouplabel,
}: Props<T>) {
  return (
    <div className="space-y-3">
      <p className={labelStyle}>{grouplabel}</p>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-2.5",
          className,
        )}
      >
        {options.map(function (option) {
          const isActive = option.value === selected;
          return option.render({
            selected: option.value === selected,
            className: cn("items-center gap-2 capitalize grow"),
            "aria-pressed": option.value === selected,
            onClick: function () {
              onClick(isActive ? null : option.value);
            },
          });
        })}
      </div>
    </div>
  );
}
