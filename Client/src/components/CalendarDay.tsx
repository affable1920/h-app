import { DateTime } from "luxon";
import Badge, { type BadgeProps } from "@/components/ui/Badge";
import type React from "react";

const CalendarDay: React.FC<{ date: DateTime<true> } & BadgeProps> = ({
  date,
  disabled,
  ...rest
}) => {
  function getTooltipText() {
    return !disabled ? "Available" : "No schedules available on this date";
  }

  const props: BadgeProps & { [key: string]: any } = {
    rotate: true,
    as: "button",
    color: "slate",
    disabled,
    content: date.day.toString(),
    ["data-tooltip"]: getTooltipText(),
    ...rest,
  };

  return <Badge {...props} />;
};

export default CalendarDay;
CalendarDay.displayName = "CalendarDay";
