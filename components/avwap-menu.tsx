import React, { useState } from "react";
import { FiAnchor, FiPlus, FiX, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface AVWAPMenuProps {
  isDrawingMode: boolean;
  setDrawingMode: (mode: boolean) => void;
  handleAddAvwap: () => void;
  handleClearAvwaps: () => void;
}

const AVWAPMenu: React.FC<AVWAPMenuProps> = ({
  isDrawingMode,
  setDrawingMode,
  handleAddAvwap,
  handleClearAvwaps,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = (): void => setIsExpanded(!isExpanded);

  return (
    <div className="hidden lg:block">
      <div
        className="absolute top-8 left-2 z-20 flex items-center bg-background rounded-md shadow-md overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: isExpanded ? "auto" : "40px" }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
          title="Open AVWAP Toolbar"
        >
          <FiAnchor className="h-4 w-4" />
        </Button>

        {isExpanded && (
          <>
            <div className="h-6 w-px bg-border"></div>

            <Button
              variant={isDrawingMode ? "default" : "ghost"}
              size="icon"
              onClick={() => {
                setDrawingMode(!isDrawingMode);
                handleAddAvwap();
              }}
              title={isDrawingMode ? "Stop Adding AVWAP" : "Start Adding AVWAP"}
            >
              <FiPlus className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border"></div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearAvwaps}
              title="Clear AVWAPs"
            >
              <FiX className="h-4 w-4" />
            </Button>
          </>
        )}

        <div className="h-6 w-px bg-border"></div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpand}
          title={isExpanded ? "Collapse Menu" : "Expand Menu"}
        >
          <FiChevronRight
            className={`h-4 w-4 transform transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>
    </div>
  );
};

export default AVWAPMenu;
