"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { Candle } from "@/lib/types/basic-types";

interface Symbol {
  ticker: string;
  color?: string;
}

interface RelativeStrengthGraphProps {
  initialBenchmark: string;
  initialData: Map<string, Candle[]>;
}

const RelativeStrengthGraph = ({ initialBenchmark }: RelativeStrengthGraphProps) => {
  const [benchmark, setBenchmark] = useState<string>(initialBenchmark);
  const [newSymbol, setNewSymbol] = useState<string>("");
  const [symbols, setSymbols] = useState<Symbol[]>([]);

  const addSymbol = () => {
    if (newSymbol && !symbols.find(s => s.ticker === newSymbol)) {
      setSymbols([...symbols, {
        ticker: newSymbol.toUpperCase(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }]);
      setNewSymbol("");
    }
  };

  const removeSymbol = (ticker: string) => {
    setSymbols(symbols.filter(s => s.ticker !== ticker));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Benchmark Symbol
            </label>
            <Input
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value.toUpperCase())}
              placeholder="Enter benchmark symbol (e.g. SPY)"
              className="w-48"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Add Symbols to Compare
            </label>
            <div className="flex gap-2">
              <Input
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSymbol();
                  }
                }}
              />
              <Button onClick={addSymbol}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {symbols.map((symbol) => (
              <div
                key={symbol.ticker}
                className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"
                style={{ borderLeft: `4px solid ${symbol.color}` }}
              >
                <span>{symbol.ticker}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeSymbol(symbol.ticker)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 h-[600px] flex items-center justify-center">
        {/* This is where we'll implement the actual RRG chart */}
        <div className="text-muted-foreground">
          RRG Chart will be implemented here showing {benchmark} as benchmark and {symbols.length} comparison symbols
        </div>
      </Card>
    </div>
  );
};

export default RelativeStrengthGraph;

