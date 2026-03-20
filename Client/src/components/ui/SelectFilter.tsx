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
        transition: { duration: 0.15 },
      }}
    >
      <ChevronRight size={12} />
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
    <div className="flex flex-col">
      <Dropdown
        show={isOpen}
        options={options}
        onOptionSelect={onOptionSelect}
      />
      <Button
        size="md"
        variant="outlined"
        className="italic"
        endIcon={<Chevron isOpen={isOpen} />}
        onClick={setIsOpen.bind(Object.create(null), (p) => !p)}
      >
        Filter by {label}
      </Button>
    </div>
  );
}

export default SelectFilter;
