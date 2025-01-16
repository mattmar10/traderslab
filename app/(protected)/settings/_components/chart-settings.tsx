"use client";

import ColorPicker from "@/components/color-picker";
import {
  ChartSettings,
  defaultChartSettings,
  MovingAverageSetting,
  VolumeMovingAverageSetting,
} from "@/components/settings/chart-settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit2, X } from "lucide-react";
import { useEffect, useState } from "react";

function loadSettignsFromStorage(): ChartSettings {
  if (typeof window !== "undefined") {
    const savedSettings = localStorage.getItem("chartSettings");
    if (savedSettings) {
      return { ...defaultChartSettings, ...JSON.parse(savedSettings) };
    }
  }
  return defaultChartSettings;
}

export default function ChartSettingsCard() {
  const [settings, setSettings] = useState<ChartSettings>(
    loadSettignsFromStorage()
  );
  const [newMA, setNewMA] = useState<MovingAverageSetting>({
    id: 0,
    type: "SMA",
    period: 20,
    color: "#268bd2",
  });
  const [editingMA, setEditingMA] = useState<MovingAverageSetting | null>(null);
  const [sortedPriceMovingAverages, setSortedPriceMovingAverages] = useState<
    MovingAverageSetting[]
  >(settings.priceMovingAverages);

  useEffect(() => {
    if (settings) {
      localStorage.setItem("chartSettings", JSON.stringify(settings));
      setSortedPriceMovingAverages(
        sortMovingAverages(settings.priceMovingAverages)
      );
    }
  }, [settings]);

  const updateSeriesColor = (colorType: keyof ChartSettings, value: string) => {
    setSettings((prev) => ({
      ...prev!,
      [colorType]: value,
    }));
  };

  const updateSeriesType = (value: "candlestick" | "bar") => {
    setSettings((prev) => ({
      ...prev!,
      seriesType: value,
      useThinBars: value === "bar" ? prev?.useThinBars ?? false : undefined, // Reset if changing from bar
    }));
  };

  function sortMovingAverages(
    movingAverages: MovingAverageSetting[]
  ): MovingAverageSetting[] {
    return [...movingAverages].sort((a, b) => a.period - b.period);
  }

  const updateAvwapColor = (value: string) => {
    setSettings((prev) => ({
      ...prev!,
      avwapSettings: {
        ...prev!.avwapSettings, // Preserve other properties in avwapSettings
        color: value, // Update only the color
      },
    }));
  };

  const toggleShowAVWAPLegend = () => {
    setSettings((prev) => ({
      ...prev!,
      avwapSettings: {
        ...prev!.avwapSettings,
        showLegend: !prev!.avwapSettings.showLegend,
      },
    }));
  };

  const addNewMA = () => {
    if (settings && settings.priceMovingAverages.length < 5) {
      setSettings((prev) => ({
        ...prev!,
        priceMovingAverages: [
          ...prev!.priceMovingAverages,
          { ...newMA, id: Date.now() },
        ],
      }));
      setNewMA({ id: 0, type: "SMA", period: 20, color: "#268bd2" });
    }
  };

  const updateNewMA = (
    field: keyof MovingAverageSetting,
    value: string | number
  ) => {
    setNewMA((prev) => ({ ...prev, [field]: value }));
  };

  const removeMovingAverage = (id: number) => {
    setSettings((prev) => ({
      ...prev!,
      priceMovingAverages: prev!.priceMovingAverages.filter(
        (ma) => ma.id !== id
      ),
    }));
  };

  const startEditingMA = (ma: MovingAverageSetting) => {
    setEditingMA({ ...ma });
  };

  const cancelEditingMA = () => {
    setEditingMA(null);
  };

  const saveEditedMA = () => {
    if (editingMA) {
      setSettings((prev) => ({
        ...prev!,
        priceMovingAverages: prev!.priceMovingAverages.map((ma) =>
          ma.id === editingMA.id ? editingMA : ma
        ),
      }));
      setEditingMA(null);
    }
  };

  const toggleShowPriceMALegends = () => {
    setSettings((prev) => ({
      ...prev!,
      showPriceMovingAvgLegends: !prev!.showPriceMovingAvgLegends,
    }));
  };

  const updateVolumeMA = (
    field: keyof VolumeMovingAverageSetting,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev!,
      volumeMA: { ...prev!.volumeMA, [field]: value },
    }));
  };

  const toggleVolumeShowMALegend = () => {
    setSettings((prev) => ({
      ...prev!,
      showVolumeMovingAvgLegends: !prev!.showVolumeMovingAvgLegends,
    }));
  };
  const resetToDefaults = () => {
    setSettings(defaultChartSettings);
  };

  return (
    <Card className="h-full max-h-[50vh] overflow-y-auto flex flex-col">
      <CardHeader className="flex-none pb-0">
        <CardTitle className="text-xl">Chart Settings</CardTitle>
        <CardDescription>Configure chart specific settings</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="series-type" className="border overflow-hidden">
            <AccordionTrigger className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors">
              Series Type and Colors
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 bg-background border-t">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label className="w-24">Chart Type:</Label>
                  <Select
                    value={settings.seriesType}
                    onValueChange={(value) =>
                      updateSeriesType(value as "candlestick" | "bar")
                    }
                  >
                    <SelectTrigger className="w-[140px] border-input bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candlestick">Candlestick</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.seriesType === "bar" && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="use-thin-bars" className="w-32">
                      Use Thin Bars:
                    </Label>
                    <Switch
                      id="use-thin-bars"
                      checked={settings.useThinBars}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev!,
                          useThinBars: checked,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Label className="w-24">Up:</Label>
                      <ColorPicker
                        color={settings.upColor}
                        onChange={(value) =>
                          updateSeriesColor("upColor", value)
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="w-24">Down:</Label>
                      <ColorPicker
                        color={settings.downColor}
                        onChange={(value) =>
                          updateSeriesColor("downColor", value)
                        }
                      />
                    </div>
                  </div>
                  {settings.seriesType === "candlestick" && (
                    <>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <Label className="w-24">Wick Up:</Label>
                          <ColorPicker
                            color={settings.wickUpColor}
                            onChange={(value) =>
                              updateSeriesColor("wickUpColor", value)
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="w-24">Wick Down:</Label>
                          <ColorPicker
                            color={settings.wickDownColor}
                            onChange={(value) =>
                              updateSeriesColor("wickDownColor", value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <Label className="w-24">Border Up:</Label>
                          <ColorPicker
                            color={settings.upBorderColor || settings.upColor}
                            onChange={(value) =>
                              updateSeriesColor("upBorderColor", value)
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="w-24">Border Down:</Label>
                          <ColorPicker
                            color={
                              settings.downBorderColor || settings.downColor
                            }
                            onChange={(value) =>
                              updateSeriesColor("downBorderColor", value)
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="price-moving-averages"
            className="border overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors">
              Price Moving Averages
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 bg-background border-t">
              <div className="space-y-4">
                <Card className="bg-muted/30 border border-border/50">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-3">
                      Add New Moving Average
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={newMA.type}
                        onValueChange={(value) =>
                          updateNewMA("type", value as "SMA" | "EMA")
                        }
                      >
                        <SelectTrigger className="w-[100px] border-input bg-background">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SMA">SMA</SelectItem>
                          <SelectItem value="EMA">EMA</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={newMA.period}
                        onChange={(e) =>
                          updateNewMA("period", parseInt(e.target.value))
                        }
                        className="w-[75px] border-input bg-background"
                        min={1}
                      />
                      <ColorPicker
                        color={newMA.color}
                        onChange={(value) => updateNewMA("color", value)}
                      />
                      <Button
                        className="w-full lg:w-16"
                        size={"sm"}
                        onClick={addNewMA}
                        disabled={settings.priceMovingAverages.length >= 5}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="font-semibold mt-4 mb-2">
                  Selected Moving Averages
                </div>
                <div className="space-y-2">
                  {sortedPriceMovingAverages.map((ma) => (
                    <Card
                      key={ma.id}
                      className="bg-muted/30 border border-border/50"
                    >
                      <CardContent className="py-2 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: ma.color }}
                            ></div>
                            <span className="font-medium">
                              {ma.type} {ma.period}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingMA(ma)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMovingAverage(ma.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Checkbox
                  id="show-ma-legends"
                  checked={settings.showPriceMovingAvgLegends}
                  onCheckedChange={toggleShowPriceMALegends}
                />
                <Label htmlFor="show-ma-legends">
                  Show Moving Average Legends
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="volume-moving-average"
            className="border  overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors">
              Volume Moving Average
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 bg-background border-t">
              <div className="flex items-center space-x-2 mb-4 ">
                <Switch
                  id="volume-ma-toggle"
                  checked={settings.volumeMA.enabled}
                  onCheckedChange={(checked) =>
                    updateVolumeMA("enabled", checked)
                  }
                />
                <Label htmlFor="volume-ma-toggle">Enable Volume MA</Label>
              </div>
              {settings.volumeMA.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label className="w-20">Type:</Label>
                    <Select
                      value={settings.volumeMA.type}
                      onValueChange={(value) =>
                        updateVolumeMA("type", value as "SMA" | "EMA")
                      }
                    >
                      <SelectTrigger className="w-40 border-input bg-background">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMA">SMA</SelectItem>
                        <SelectItem value="EMA">EMA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="w-20">Period:</Label>
                    <Input
                      type="number"
                      value={settings.volumeMA.period}
                      onChange={(e) =>
                        updateVolumeMA("period", parseInt(e.target.value))
                      }
                      className="w-40 border-input bg-background"
                      min={1}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="w-20">Color:</Label>
                    <ColorPicker
                      color={settings.volumeMA.color}
                      onChange={(value) => updateVolumeMA("color", value)}
                    />
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <Checkbox
                      id="show-volume-ma-legends"
                      checked={settings.showVolumeMovingAvgLegends}
                      onCheckedChange={toggleVolumeShowMALegend}
                    />
                    <Label htmlFor="show-ma-legends">
                      Show Moving Average Legend
                    </Label>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="avwap-settings"
            className="border overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors">
              AVWAP Settings
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 bg-background border-t">
              <div className="flex items-center space-x-2">
                <Label className="w-20">Color:</Label>
                <ColorPicker
                  color={settings.avwapSettings.color}
                  onChange={(value) => updateAvwapColor(value)}
                />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Checkbox
                  id="show-avwap-legends"
                  checked={settings.avwapSettings.showLegend}
                  onCheckedChange={toggleShowAVWAPLegend}
                />
                <Label htmlFor="show-ma-legends">Show AVWAP Legends</Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          variant="secondary"
          onClick={resetToDefaults}
          className="w-full mt-8 rounded-none"
        >
          Reset to Defaults
        </Button>
      </CardContent>

      {editingMA && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Edit Moving Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label className="w-20">Type:</Label>
                  <Select
                    value={editingMA.type}
                    onValueChange={(value) =>
                      setEditingMA({
                        ...editingMA,
                        type: value as "SMA" | "EMA",
                      })
                    }
                  >
                    <SelectTrigger className="w-full border-input bg-background">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMA">SMA</SelectItem>
                      <SelectItem value="EMA">EMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="w-20">Period:</Label>
                  <Input
                    type="number"
                    value={editingMA.period}
                    onChange={(e) =>
                      setEditingMA({
                        ...editingMA,
                        period: parseInt(e.target.value),
                      })
                    }
                    className="w-full border-input bg-background"
                    min={1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="w-20">Color:</Label>
                  <ColorPicker
                    color={editingMA.color}
                    onChange={(value) =>
                      setEditingMA({ ...editingMA, color: value })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-4">
              <Button variant="outline" onClick={cancelEditingMA}>
                Cancel
              </Button>
              <Button onClick={saveEditedMA}>Save</Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
