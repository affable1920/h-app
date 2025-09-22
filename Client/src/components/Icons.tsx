import { Button } from "./ui/button";
import { TbUser } from "react-icons/tb";
import { SlCallOut } from "react-icons/sl";
import { BiMessage } from "react-icons/bi";
import { BsFillCalendar2CheckFill } from "react-icons/bs";

export const Consult = () => (
  <Button>
    Consult Now <SlCallOut />
  </Button>
);

export const LeaveMessage = () => (
  <Button>
    Leave a message
    <BiMessage />
  </Button>
);

export const Schedule = () => (
  <Button>
    Schedule <BsFillCalendar2CheckFill />
  </Button>
);

export const User = ({ title }: { title?: string }) => (
  <Button>
    {title} <TbUser />
  </Button>
);

export const ButtonIcon = () => {
  <Button variant="outline" size="sm"></Button>;
};
