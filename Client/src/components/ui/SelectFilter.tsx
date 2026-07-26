import { memo, useState } from "react";
import { motion } from "motion/react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import { ChevronRight } from "lucide-react";

interface SelectFilterProps {
  label: string;
  options: readonly string[];
  onOptionSelect: (option: string) => void;
}

const SelectFilter = memo(function ({
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
        className="w-full"
        border={false}
        onClick={function () {
          setIsOpen((p) => !p);
        }}
      >
        {label}
        <motion.i animate={{ rotate: isOpen ? -90 : 0 }}>
          <ChevronRight size={14} strokeWidth={3} />
        </motion.i>
      </Button>
    </div>
  );
});

export default SelectFilter;
