"use client";
import { memo, useCallback, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Candle } from "@/lib/types/basic-types";
import { getRRGTrail, RelativeStrengthRotationPoint } from "../rrg-types-and-utils";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import { FMPHistoricalResultsSchema } from "@/lib/types/fmp-types";
import MemoizedRRGChart from "./rrg-chart";
import PeriodForm, { PeriodSettings } from "./period-form";

// Types and Interfaces
interface SecurityRRG {
  ticker: string;
  color?: string;
  trail?: RelativeStrengthRotationPoint[];
}

interface RelativeStrengthGraphProps {
  initialBenchmark: string;
  initialData: Map<string, Candle[]>;
}


interface BenchmarkSelectorProps {
  benchmark: string;
  onBenchmarkChange: (value: string) => void;
  initialBenchmark: string;
  securities: SecurityRRG[];
}

interface SymbolInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onClear: () => void;
  hasSecurities: boolean;
}

interface SecurityTagsProps {
  securities: SecurityRRG[];
  onRemove: (ticker: string) => void;
}

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

// Constants
const colorPalette = [
  "#b366f9", // Vibrant Mauve
  "#f0476f", // Vibrant Red
  "#ff9c5e", // Vibrant Peach
  "#7cda7c", // Vibrant Green
  "#4c8efd", // Vibrant Blue
  "#ffd84d", // Vibrant Yellow
  "#41d1bf", // Vibrant Teal
  "#e65d83", // Vibrant Maroon
  "#7c89ff", // Vibrant Lavender
  "#ff70d2", // Vibrant Pink
  "#45c7e8", // Vibrant Sky
  "#ff8585", // Vibrant Flamingo
  "#9f5cff", // Vibrant Alt Mauve
  "#ff5252", // Vibrant Alt Red
  "#ff8936"  // Vibrant Alt Peach
];

// Utility Functions
const getBars = async (ticker: string) => {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), currentDate.getDate());
  const fromDateString = formatDateToEST(startDate);

  const apiEndpoint = `/api/bars/${ticker}?fromDateString=${fromDateString}`;
  const response = await fetch(apiEndpoint);
  const parsed = FMPHistoricalResultsSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Unable to fetch bars for ${ticker}`);
  }

  return parsed.data.historical.map((h) => ({
    date: new Date(h.date).getTime(),
    dateStr: h.date,
    open: h.open,
    high: h.high,
    low: h.low,
    close: h.close,
    volume: h.volume,
  })).sort((a, b) => a.date - b.date);
};

// Component Definitions
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

/*const PeriodForm = memo(({
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
    <Button type="submit" className="mb-0.5">
      <RefreshCw className="h-4 w-4 mr-2" />
      Update
    </Button>
  </form>
));*/

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

const SecurityTags = memo(({
  securities,
  onRemove
}: SecurityTagsProps) => (
  <div className="flex flex-wrap gap-2 pt-2">
    {securities.map((symbol) => (
      <div
        key={symbol.ticker}
        className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"
        style={{ borderLeft: `4px solid ${symbol.color}` }}
      >
        <span className="text-sm">{symbol.ticker}</span>
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

const RRGForm = memo(({
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
    <div className="space-y-6">
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
});
RRGForm.displayName = "RRGForm";

// Main Component
const RelativeStrengthGraph = ({ initialBenchmark, initialData }: RelativeStrengthGraphProps) => {
  const queryClient = useQueryClient();
  const [benchmark, setBenchmark] = useState<string>(initialBenchmark);
  const [newSymbol, setNewSymbol] = useState<string>("");
  const [trailLength] = useState(252);

  // Form state for period settings
  const [periodSettings, setPeriodSettings] = useState<PeriodSettings>({
    period: 125,
    momentumPeriod: 10,
    smoothingPeriod: 0
  });

  // Applied state that actually affects the chart
  const [appliedPeriodSettings, setAppliedPeriodSettings] = useState<PeriodSettings>({
    period: 125,
    momentumPeriod: 10,
    smoothingPeriod: 0
  });

  const initialSecurities = useMemo(() => {
    return Array.from(initialData.keys())
      .filter((ticker) => ticker !== initialBenchmark)
      .map((ticker, index) => ({
        ticker,
        color: colorPalette[index % colorPalette.length],
        trail: getRRGTrail(
          ticker,
          initialData.get(ticker)!,
          initialData.get(initialBenchmark)!,
          appliedPeriodSettings.period,
          trailLength,
          appliedPeriodSettings.momentumPeriod
        )
      }));
  }, [initialBenchmark, initialData, appliedPeriodSettings, trailLength]);

  const [securities, setSecurities] = useState<SecurityRRG[]>(initialSecurities);

  const handlePeriodSettingChange = useCallback((field: keyof PeriodSettings, value: number) => {
    setPeriodSettings((prev: any) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePeriodSubmit = useCallback((values: PeriodSettings) => {
    setAppliedPeriodSettings(values);
  }, []);

  const calculateSymbolTrail = useCallback((ticker: string) => {
    const symbolData = initialData.get(ticker);
    const benchmarkData = initialData.get(benchmark);

    if (!symbolData || !benchmarkData) {
      console.error(`Missing data for ${ticker} or ${benchmark}`);
      return null;
    }

    return getRRGTrail(
      ticker,
      symbolData,
      benchmarkData,
      appliedPeriodSettings.period,
      trailLength,
      appliedPeriodSettings.momentumPeriod,
      appliedPeriodSettings.smoothingPeriod
    );
  }, [benchmark, appliedPeriodSettings, trailLength, initialData]);

  const memoizedSecurities = useMemo(() => {
    return securities.map((symbol) => ({
      ...symbol,
      trail: calculateSymbolTrail(symbol.ticker) || symbol.trail,
    }));
  }, [securities, calculateSymbolTrail]);

  const addSymbolToRRG = useCallback(() => {
    if (newSymbol && !securities.find((s) => s.ticker === newSymbol)) {
      const cachedData = queryClient.getQueryData<Candle[]>(["candles", newSymbol]);
      if (cachedData) {
        setSecurities((prev) => [
          ...prev,
          {
            ticker: newSymbol.toUpperCase(),
            color: colorPalette[prev.length % colorPalette.length],
            trail: getRRGTrail(
              newSymbol,
              cachedData,
              initialData.get(benchmark)!,
              appliedPeriodSettings.period,
              trailLength,
              appliedPeriodSettings.momentumPeriod
            ),
          },
        ]);
      } else {
        fetchAndAddSymbol(newSymbol.toUpperCase());
      }
      setNewSymbol("");
    }
  }, [newSymbol, securities, benchmark, appliedPeriodSettings, trailLength, initialData, queryClient]);

  const { mutate: fetchAndAddSymbol } = useMutation({
    mutationFn: getBars,
    onSuccess: (data, ticker) => {
      queryClient.setQueryData(["candles", ticker], data);
      setSecurities((prev) => [
        ...prev,
        {
          ticker,
          color: colorPalette[prev.length % colorPalette.length],
          trail: getRRGTrail(
            ticker,
            data,
            initialData.get(benchmark)!,
            appliedPeriodSettings.period,
            trailLength,
            appliedPeriodSettings.momentumPeriod,
            appliedPeriodSettings.smoothingPeriod
          ),
        },
      ]);
    },
    onError: (error, ticker) => {
      console.error(`Failed to fetch data for ${ticker}:`, error);
    },
  });

  const removeSymbol = useCallback((ticker: string) => {
    setSecurities((prev) => prev.filter((s) => s.ticker !== ticker));
  }, []);

  const clearAllSymbols = useCallback(() => {
    setSecurities([]);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <RRGForm
          benchmark={benchmark}
          onBenchmarkChange={setBenchmark}
          initialBenchmark={initialBenchmark}
          securities={memoizedSecurities}
          periodSettings={periodSettings}
          onPeriodSettingChange={handlePeriodSettingChange}
          onPeriodSubmit={handlePeriodSubmit}
          newSymbol={newSymbol}
          onNewSymbolChange={setNewSymbol}
          onAddSymbol={addSymbolToRRG}
          onClearSymbols={clearAllSymbols}
          onRemoveSymbol={removeSymbol}
        />
      </Card>

      <Card className="p-6 h-[50vh]">
        <CardHeader className="p-2">
          <CardTitle>
            <div className="text-lg font-medium">Relative Rotation Graph</div>
          </CardTitle>
        </CardHeader>
        <MemoizedRRGChart securities={memoizedSecurities} />
      </Card>

      {/*<Card className="p-6">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Security</th>
              <th className="text-right py-2">RS-Value</th>
              <th className="text-right py-2">RS-Ratio</th>
              <th className="text-right py-2">RS-Momentum</th>
              <th className="text-right py-2">Quadrant</th>
            </tr>
          </thead>
          <tbody>
            {memoizedSecurities.map((security) => {
              const latestPoint = security.trail?.[security.trail.length - 1];
              const quadrant = latestPoint
                ? getQuadrant(latestPoint.rsRatio, latestPoint.rsMomentum)
                : "N/A";

              return (
                <tr key={security.ticker} className="border-b">
                  <td className="py-2 font-medium" style={{ color: security.color }}>
                    {security.ticker}
                  </td>
                  <td className="text-right py-2">
                    {latestPoint?.rsValue?.toFixed(2) ?? "N/A"}
                  </td>
                  <td className="text-right py-2">
                    {latestPoint?.rsRatio?.toFixed(2) ?? "N/A"}
                  </td>
                  <td className="text-right py-2">
                    {latestPoint?.rsMomentum?.toFixed(2) ?? "N/A"}
                  </td>
                  <td className="text-right py-2">{quadrant}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>*/}
    </div>
  );
};

export default RelativeStrengthGraph;