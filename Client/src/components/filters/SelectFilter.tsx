import { useState } from "react";
import { motion } from "motion/react";
import Button from "../common/Button";
import Dropdown from "../common/Dropdown";
import { ChevronDown } from "lucide-react";

interface SelectFilterProps {
  label: string;
  options: readonly string[];
  onOptionSelect: (option: string) => void;
}

const SelectFilter = ({
  label = "",
  options = [],
  onOptionSelect,
}: SelectFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Dropdown
        show={isOpen}
        options={options}
        onOptionSelect={onOptionSelect}
      />
      <Button
        size="md"
        variant="outlined"
        className="italic"
        onClick={() => setIsOpen((p) => !p)}
      >
        Filter by {label}
        <motion.svg
          animate={{
            rotate: isOpen ? -180 : 0,
            transition: { duration: 0.15 },
          }}
        >
          <ChevronDown size={12} />
        </motion.svg>
      </Button>
    </div>
  );
};

export default SelectFilter;
