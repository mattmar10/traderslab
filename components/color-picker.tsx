import React from "react";
import { SketchPicker } from "react-color";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const handleChangeComplete = (color: any) => {
        onChange(color.hex);
    };

    return (
        <div className="flex items-center space-x-2">
            <Input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 hidden lg:block"
                placeholder="#000000"
            />

            <Popover key={color}>
                <PopoverTrigger>
                    <div
                        className="w-6 h-6 rounded-full cursor-pointer border border-gray-300"
                        style={{ backgroundColor: color }}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0 shadow-none border-none">
                    <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ColorPicker;