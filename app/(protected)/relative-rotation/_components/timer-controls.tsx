import { memo, useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    PlayCircle,
    PauseCircle,
    SkipForward,
    SkipBack,
    FastForward,
    Rewind,
    Clock
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface TimelineControlsProps {
    currentIndex: number;
    maxIndex: number;
    onIndexChange: (index: number) => void;
    startDate: string;
    endDate: string;
    currentDate: string;
}

const SPEEDS = {
    '0.5x': 1000,
    '1x': 500,
    '2x': 250,
    '5x': 100,
    '10x': 50
} as const;

const TimelineControls = memo(({
    currentIndex,
    maxIndex,
    onIndexChange,
    startDate,
    endDate,
    currentDate
}: TimelineControlsProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState<keyof typeof SPEEDS>('1x');

    // Handle auto-play
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            if (currentIndex >= maxIndex) {
                setIsPlaying(false);
            } else {
                onIndexChange(currentIndex + 1);
            }
        }, SPEEDS[speed]);

        return () => clearInterval(interval);
    }, [isPlaying, speed, maxIndex, onIndexChange, currentIndex]);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleStep = useCallback((step: number) => {
        const newIndex = Math.min(Math.max(0, currentIndex + step), maxIndex);
        onIndexChange(newIndex);
    }, [currentIndex, maxIndex, onIndexChange]);

    return (
        <div className="space-y-4 pl-4">

            <div className="flex justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => onIndexChange(0)}
                        disabled={currentIndex === 0}
                        className="whitespace-nowrap"
                    >
                        <Rewind className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => handleStep(-1)}
                        disabled={currentIndex === 0}
                    >
                        <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handlePlayPause}
                        className="w-24"
                    >
                        {isPlaying ? (
                            <PauseCircle className="h-4 w-4 mr-2" />
                        ) : (
                            <PlayCircle className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? 'Pause' : 'Play'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => handleStep(1)}
                        disabled={currentIndex === maxIndex}
                    >
                        <SkipForward className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => onIndexChange(maxIndex)}
                        disabled={currentIndex === maxIndex}
                        className="whitespace-nowrap"
                    >
                        <FastForward className="h-4 w-4" />
                    </Button>

                    <Select value={speed} onValueChange={(value: keyof typeof SPEEDS) => setSpeed(value)}>
                        <SelectTrigger className="w-20">
                            <SelectValue placeholder="Speed" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(SPEEDS).map((speedOption) => (
                                <SelectItem key={speedOption} value={speedOption}>
                                    {speedOption}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex justify-center items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="">Trail beginning at {currentDate}</span>
                    </div>
                </div>

            </div>


            {/* Slider with dates */}
            <div className="space-y-2">
                <Slider
                    value={[currentIndex]}
                    min={0}
                    max={maxIndex}
                    step={1}
                    onValueChange={([value]) => {
                        setIsPlaying(false);
                        onIndexChange(value);
                    }}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{startDate}</span>
                    <span>{endDate}</span>
                </div>
            </div>
        </div>
    );
});

TimelineControls.displayName = "TimelineControls";

export default TimelineControls;