import { useState } from "react";
import { motion } from "motion/react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import { ChevronRight } from "lucide-react";

interface SelectFilterProps {
  label: string;
  options: readonly string[];
  onOptionSelect: (option: string) => void;
}

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.svg
      animate={{
        rotate: isOpen ? -90 : 0,
      }}
    >
      <ChevronRight size={12} strokeWidth={4} />
    </motion.svg>
  );
}

function SelectFilter({
  label = "",
  options = [],
  onOptionSelect,
}: SelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Dropdown
        show={isOpen}
        options={options}
        onOptionSelect={onOptionSelect}
      />
      <Button
        color="brand"
        size="md"
        className="w-full"
        border={false}
        endIcon={<Chevron isOpen={isOpen} />}
        onClick={function () {
          setIsOpen((p) => !p);
        }}
      >
        {label}
      </Button>
    </div>
  );
}

export default SelectFilter;
