import { memo, useCallback, useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw } from "lucide-react";

export interface PeriodSettings {
    period: number;
    momentumPeriod: number;
    smoothingPeriod: number;
}

interface PeriodFormProps {
    values: PeriodSettings;
    onChange: (field: keyof PeriodSettings, value: number) => void;
    onSubmit: (values: PeriodSettings) => void;
}

const PeriodForm = memo(({
    values,
    onChange,
    onSubmit
}: PeriodFormProps) => {
    // Keep track of last submitted values
    const [lastSubmitted, setLastSubmitted] = useState(values);

    // Update lastSubmitted when initial values change
    useEffect(() => {
        setLastSubmitted(values);
    }, []); // Only on mount

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
        setLastSubmitted(values);
    };

    const handleChange = useCallback((
        field: keyof PeriodSettings,
        value: number
    ) => {
        onChange(field, value);
    }, [onChange]);

    // Check if there are any changes
    const hasChanges = values.period !== lastSubmitted.period ||
        values.momentumPeriod !== lastSubmitted.momentumPeriod ||
        values.smoothingPeriod !== lastSubmitted.smoothingPeriod;

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-end space-x-4"
        >
            <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <Input
                    type="number"
                    value={values.period}
                    onChange={(e) => handleChange('period', Number(e.target.value))}
                    placeholder="Enter period (e.g., 125)"
                    min={1}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Momentum Period</label>
                <Input
                    type="number"
                    value={values.momentumPeriod}
                    onChange={(e) => handleChange('momentumPeriod', Number(e.target.value))}
                    placeholder="Enter period (e.g., 10)"
                    min={1}
                />
            </div>
            <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                    id="useSmoothing"
                    checked={values.smoothingPeriod > 0}
                    onCheckedChange={(checked) => {
                        handleChange('smoothingPeriod', checked === true ? 3 : 0);
                    }}
                />
                <label
                    htmlFor="useSmoothing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Use RS Smoothing
                </label>
            </div>
            <Button
                type="submit"
                className="mb-0.5"
                disabled={!hasChanges}
            >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update
            </Button>
        </form>
    );
});

PeriodForm.displayName = "PeriodForm";

export default PeriodForm;