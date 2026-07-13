import Button from "@/components/ui/Button";
import type { Color } from "@/types/ui";
import { memo, type ReactNode } from "react";

export type ToggledControlProps = {
  onToggle: () => void;
  isToggled: boolean;
  toggledIcon: ReactNode;
  unToggledIcon: ReactNode;
  toggledTooltip: string;
  unToggledTooltip: string;
  toggledColor: Color;
  unToggledColor: Color;
};

export const ToggledControl = memo(function ({
  onToggle,
  isToggled,
  toggledColor,
  toggledIcon,
  toggledTooltip,
  unToggledColor,
  unToggledIcon,
  unToggledTooltip,
}: ToggledControlProps) {
  // This is a helper button component, which acts on a given conditional, to render different icons and tooltips
  return (
    <Button
      variant="icon"
      bg={true}
      data-tooltip={isToggled ? toggledTooltip : unToggledTooltip}
      color={isToggled ? toggledColor : unToggledColor}
      onClick={onToggle}
    >
      {isToggled ? toggledIcon : unToggledIcon}
    </Button>
  );
});
