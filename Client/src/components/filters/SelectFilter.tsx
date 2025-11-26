import { useState } from "react";
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
        size="lg"
        variant="outlined"
        className="italic"
        onClick={() => setIsOpen((p) => !p)}
        endIcon={
          <ChevronDown className={`${isOpen && "rotate-180"}`} size={12} />
        }
      >
        Filter by {label}
      </Button>
    </div>
  );
};

export default SelectFilter;
