import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, Trash2, X } from "lucide-react";
import { RelativeStrengthRotationPoint } from "../rrg-types-and-utils";
import { Checkbox } from "@/components/ui/checkbox";

export interface SecurityRRG {
    ticker: string;
    color?: string;
    trail?: RelativeStrengthRotationPoint[];
}

interface PeriodSettings {
    period: number;
    momentumPeriod: number;
    smoothingPeriod: number;
}

interface BenchmarkSelectorProps {
    benchmark: string;
    onBenchmarkChange: (value: string) => void;
    initialBenchmark: string;
    securities: SecurityRRG[];
}

const BenchmarkSelector = memo(({
    benchmark,
    onBenchmarkChange,
    initialBenchmark,
    securities
}: BenchmarkSelectorProps) => (
    <div>
        <label className="block text-sm font-medium mb-2">
            Benchmark Symbol
        </label>
        <Select value={benchmark} onValueChange={onBenchmarkChange}>
            <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a benchmark" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={initialBenchmark}>{initialBenchmark}</SelectItem>
                {securities.map((symbol) => (
                    <SelectItem key={symbol.ticker} value={symbol.ticker}>
                        {symbol.ticker}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
));

BenchmarkSelector.displayName = "BenchmarkSelector";

interface PeriodFormProps {
    values: PeriodSettings;
    onChange: (field: keyof PeriodSettings, value: number) => void;
    onSubmit: (values: PeriodSettings) => void;
}

const PeriodForm = memo(({
    values,
    onChange,
    onSubmit
}: PeriodFormProps) => (
    <form
        onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
        }}
        className="flex items-end space-x-4"
    >
        <div>
            <label className="block text-sm font-medium mb-2">Period</label>
            <Input
                type="number"
                value={values.period}
                onChange={(e) => onChange('period', Number(e.target.value))}
                placeholder="Enter period (e.g., 125)"
                min={1}
            />
        </div>
        <div>
            <label className="block text-sm font-medium mb-2">Momentum Period</label>
            <Input
                type="number"
                value={values.momentumPeriod}
                onChange={(e) => onChange('momentumPeriod', Number(e.target.value))}
                placeholder="Enter period (e.g., 10)"
                min={1}
            />
        </div>
        <div className="flex items-center space-x-2 mb-2">
            <Checkbox
                id="useSmoothing"
                checked={values.smoothingPeriod > 0}
                onCheckedChange={(checked) => {
                    onChange('smoothingPeriod', checked === true ? 3 : 0);
                }}
            />
            <label
                htmlFor="useSmoothing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Use RS Smoothing (3-day SMA)
            </label>
        </div>
        <Button type="submit" className="mb-0.5">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update
        </Button>
    </form>
));

PeriodForm.displayName = "PeriodForm";

interface SymbolInputProps {
    value: string;
    onChange: (value: string) => void;
    onAdd: () => void;
    onClear: () => void;
    hasSecurities: boolean;
}

const SymbolInput = memo(({
    value,
    onChange,
    onAdd,
    onClear,
    hasSecurities
}: SymbolInputProps) => (
    <div>
        <label className="block text-sm font-medium mb-2">
            Add Symbols to Compare
        </label>
        <div className="flex gap-2">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                placeholder="Enter symbol"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        onAdd();
                    }
                }}
            />
            <Button type="button" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add
            </Button>
            <Button
                type="button"
                variant="destructive"
                onClick={onClear}
                disabled={!hasSecurities}
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
            </Button>
        </div>
    </div>
));

SymbolInput.displayName = "SymbolInput";

interface SecurityTagsProps {
    securities: SecurityRRG[];
    onRemove: (ticker: string) => void;
}

const SecurityTags = memo(({
    securities,
    onRemove
}: SecurityTagsProps) => (
    <div className="flex flex-wrap gap-2">
        {securities.map((symbol) => (
            <div
                key={symbol.ticker}
                className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"
                style={{ borderLeft: `4px solid ${symbol.color}` }}
            >
                <span className="text-xs">{symbol.ticker}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onRemove(symbol.ticker)}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        ))}
    </div>
));

SecurityTags.displayName = "SecurityTags";

interface RRGFormProps {
    benchmark: string;
    onBenchmarkChange: (value: string) => void;
    initialBenchmark: string;
    securities: SecurityRRG[];
    periodSettings: PeriodSettings;
    onPeriodSettingChange: (field: keyof PeriodSettings, value: number) => void;
    onPeriodSubmit: (values: PeriodSettings) => void;
    newSymbol: string;
    onNewSymbolChange: (value: string) => void;
    onAddSymbol: () => void;
    onClearSymbols: () => void;
    onRemoveSymbol: (ticker: string) => void;
}

const RRGForm = ({
    benchmark,
    onBenchmarkChange,
    initialBenchmark,
    securities,
    periodSettings,
    onPeriodSettingChange,
    onPeriodSubmit,
    newSymbol,
    onNewSymbolChange,
    onAddSymbol,
    onClearSymbols,
    onRemoveSymbol
}: RRGFormProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-end space-x-4">
                <BenchmarkSelector
                    benchmark={benchmark}
                    onBenchmarkChange={onBenchmarkChange}
                    initialBenchmark={initialBenchmark}
                    securities={securities}
                />
                <PeriodForm
                    values={periodSettings}
                    onChange={onPeriodSettingChange}
                    onSubmit={onPeriodSubmit}
                />
            </div>

            <SymbolInput
                value={newSymbol}
                onChange={onNewSymbolChange}
                onAdd={onAddSymbol}
                onClear={onClearSymbols}
                hasSecurities={securities.length > 0}
            />

            <SecurityTags
                securities={securities}
                onRemove={onRemoveSymbol}
            />
        </div>
    );
};

export default memo(RRGForm);