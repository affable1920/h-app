import { useState } from "react";
import ButtonElement from "../eventElements/Button";
import Dropdown from "../eventElements/Dropdown";
import { ChevronUpIcon } from "lucide-react";

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
      <ButtonElement
        size="lg"
        variant="outlined"
        className="card-h2 italic"
        onClick={() => setIsOpen((p) => !p)}
      >
        Filter by {label}
        <ChevronUpIcon
          size={13}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } `}
        />
      </ButtonElement>
    </div>
  );
};

export default SelectFilter;
