import { memo } from "react";
import { DateTime } from "luxon";

import Badge, { type BadgeProps } from "@components/common/Badge";
import { useSchedule } from "./providers/ScheduleProvider";

const CalendarDay = memo(
  ({
    date,
    disabled = false,
    ...rest
  }: { date: DateTime } & BadgeProps<"button">) => {
    const {
      state,
      actions: { setDate, clearField },
    } = useSchedule();

    function getTooltipText() {
      return !disabled ? "Available" : "No schedules available on this date";
    }

    function handleStateUpdate() {
      setDate(date);

      if (state?.day !== date.weekday) {
        clearField("day");
      }
    }

    return (
      <Badge
        rotate
        as="button"
        color="slate"
        disabled={disabled}
        onClick={handleStateUpdate}
        content={date.day.toString()}
        data-tooltip={getTooltipText()}
        {...rest}
      />
    );
  }
);

export default CalendarDay;
CalendarDay.displayName = "CalendarDay";
