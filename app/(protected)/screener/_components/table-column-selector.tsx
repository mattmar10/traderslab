import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical } from "lucide-react";
import { Column } from "./screener-table-columns";

interface TableColumnSelectorProps {
  allColumns: Column[];
  selectedColumns: Column[];
  onColumnChange: (newSelectedColumns: Column[]) => void;
}

const TableColumnSelector: React.FC<
  TableColumnSelectorProps & { children: React.ReactNode }
> = ({ allColumns, selectedColumns, onColumnChange, children }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Column | null>(null);

  useEffect(() => {
    setColumns(allColumns);
    setSelectedKeys(new Set(selectedColumns.map((col) => col.key)));
  }, [allColumns, selectedColumns]);

  const toggleColumn = (key: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        if (key !== "profile.symbol") {
          // Prevent deselecting the Ticker column
          newSet.delete(key);
        }
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    column: Column
  ) => {
    setDraggedItem(column);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", column.key);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLLIElement>,
    targetColumn: Column
  ) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newColumns = columns.filter((col) => col.key !== draggedItem.key);
    const targetIndex = newColumns.findIndex(
      (col) => col.key === targetColumn.key
    );
    newColumns.splice(targetIndex, 0, draggedItem);

    setColumns(newColumns);
    setDraggedItem(null);
  };

  const applyChanges = () => {
    const newSelectedColumns = columns.filter((column) =>
      selectedKeys.has(column.key)
    );
    onColumnChange(newSelectedColumns);
    setIsPopoverOpen(false);
  };

  const resetColumns = () => {
    onColumnChange([]);
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[300px]">
        <h3 className="font-bold mb-2">Customize Columns</h3>
        <ul className="space-y-2 max-h-[400px] overflow-y-auto">
          {columns.map((column) => (
            <li
              key={column.key}
              draggable
              onDragStart={(e) => handleDragStart(e, column)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column)}
              className="flex items-center space-x-2 bg-background p-2 rounded cursor-move"
            >
              <span className="cursor-grab">
                <GripVertical size={16} />
              </span>
              <Checkbox
                id={`column-${column.key}`}
                checked={selectedKeys.has(column.key)}
                onCheckedChange={() => toggleColumn(column.key)}
                disabled={column.key === "profile.symbol"}
              />
              <label
                htmlFor={`column-${column.key}`}
                className="flex-grow cursor-pointer"
              >
                {column.label}
              </label>
            </li>
          ))}
        </ul>
        <Button className="mt-4 w-full" onClick={applyChanges}>
          Apply Changes
        </Button>
        <Button className="mt-4 w-full" onClick={resetColumns}>
          Reset Defaults
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default TableColumnSelector;
