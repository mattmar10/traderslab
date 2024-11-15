"use client";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ExpandableDropDownOption {
  id: string;
  displayName: string;
}

export interface ExpandableDropDownListProps {
  header: string;
  items: ExpandableDropDownOption[];
  onSelectionChange: (selectedItems: ExpandableDropDownOption[]) => void;
}

const ExpandableDropDownList: React.FC<ExpandableDropDownListProps> = ({
  header,
  items,
  onSelectionChange,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<
    ExpandableDropDownOption[]
  >([]);

  const handleSelectionChange = (selected: ExpandableDropDownOption[]) => {
    setSelectedOptions(selected);
    onSelectionChange(selected.length > 0 ? selected : []);
  };

  const selectedText =
    selectedOptions.map((s) => s.displayName).join(", ") || "ALL";

  return (
    <div className="w-full max-w-xs mx-auto">
      <Popover>
        <Listbox
          value={selectedOptions}
          onChange={handleSelectionChange}
          multiple
        >
          {({ open }) => (
            <>
              <PopoverTrigger asChild>
                <div>
                  <Label className="block text-sm leading-5 font-medium text-foreground/70">
                    {header}
                  </Label>
                  <span
                    className={`inline-block w-full shadow-sm ${open ? "bg-gray-200" : "bg-background"}`}
                  >
                    <ListboxButton className="cursor-default relative w-full border border-foreground/30 bg-background pl-3 pr-10 py-2 text-left focus:outline-none focus:shadow-outline-blue focus:border-foreground/3 transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                      <span className="block truncate">{selectedText}</span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </ListboxButton>
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 z-50 w-96 h-48">
                <ListboxOptions
                  className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-background shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                  style={{
                    maxHeight: "10rem",
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  {items.map((option) => (
                    <ListboxOption key={option.id} value={option}>
                      {({ selected, active }) => (
                        <div
                          className={`${active ? " bg-foreground/5" : "text-foreground/70"
                            } cursor-default select-none relative py-2 pl-8 pr-4`}
                        >
                          <span
                            className={`${selected ? "font-semibold" : "font-normal"
                              } block truncate`}
                          >
                            {option.displayName}
                          </span>
                          {selected && (
                            <span
                              className={`${active
                                ? "text-foreground/80"
                                : "text-foreground/80"
                                } absolute inset-y-0 left-0 flex items-center pl-1.5`}
                            >
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </PopoverContent>
            </>
          )}
        </Listbox>
      </Popover>
    </div>
  );
};

export default ExpandableDropDownList;
