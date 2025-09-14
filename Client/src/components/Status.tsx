import { memo, useEffect, useState } from "react";
import { BsCalendarCheckFill } from "react-icons/bs";
import { IoCallSharp } from "react-icons/io5";

const Status = memo(({ status }: { status: string }) => {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    const setStatusConfig = () => {};

    setStatusConfig();
  }, [status]);

  console.log(status);

  return null;
});

export default Status;
