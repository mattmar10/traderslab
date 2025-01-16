"use client";

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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export interface PTMMDashboardSettings {
  show5SMA: boolean;
  show10EMA: boolean;
  show21EMA: boolean;
  show50SMA: boolean;
  show200SMA: boolean;
}
export const defaultPTMMDashboardSettings: PTMMDashboardSettings = {
  show5SMA: true,
  show10EMA: true,
  show21EMA: true,
  show50SMA: true,
  show200SMA: true,
};

function loadPTMMSettingsFromStorage(): PTMMDashboardSettings {
  if (typeof window !== "undefined") {
    const savedSettings = localStorage.getItem("ptmmDashboardSettings");
    if (savedSettings) {
      return { ...defaultPTMMDashboardSettings, ...JSON.parse(savedSettings) };
    }
  }
  return defaultPTMMDashboardSettings;
}

export default function PTMMSettings() {
  const [settings, setPTMMSettings] = useState<PTMMDashboardSettings>(
    loadPTMMSettingsFromStorage()
  );

  const updateSetting = (key: keyof PTMMDashboardSettings, value: boolean) => {
    setPTMMSettings((prev) => ({
      ...prev!,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setPTMMSettings(defaultPTMMDashboardSettings);
  };

  useEffect(() => {
    if (settings) {
      localStorage.setItem("ptmmDashboardSettings", JSON.stringify(settings));
    }
  }, [settings]);

  return (
    <Card className="h-full min-h-[300px] max-h-[30vh] flex flex-col">
      <CardHeader className="flex-none pb-0">
        <CardTitle className="text-xl">TLMM Dashboard Settings</CardTitle>
        <CardDescription>
          Configure TLMM dashboard specific settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          defaultValue="ptmm-settings"
          className="w-full space-y-4 mt-4"
        >
          <AccordionItem
            value="ptmm-settings"
            className="border overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors">
              Percent of Stocks Above Key Moving Average
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 bg-background border-t">
              <div className="w-48 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="toggle-5SMA">Show 5 SMA</Label>
                  <Switch
                    id="toggle-5SMA"
                    checked={settings.show5SMA}
                    onCheckedChange={(value) =>
                      updateSetting("show5SMA", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="toggle-10EMA">Show 10 EMA</Label>
                  <Switch
                    id="toggle-10EMA"
                    checked={settings.show10EMA}
                    onCheckedChange={(value) =>
                      updateSetting("show10EMA", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="toggle-21EMA">Show 21 EMA</Label>
                  <Switch
                    id="toggle-21EMA"
                    checked={settings.show21EMA}
                    onCheckedChange={(value) =>
                      updateSetting("show21EMA", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="toggle-50SMA">Show 50 SMA</Label>
                  <Switch
                    id="toggle-50SMA"
                    checked={settings.show50SMA}
                    onCheckedChange={(value) =>
                      updateSetting("show50SMA", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="toggle-200SMA">Show 200 SMA</Label>
                  <Switch
                    id="toggle-200SMA"
                    checked={settings.show200SMA}
                    onCheckedChange={(value) =>
                      updateSetting("show200SMA", value)
                    }
                  />
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={resetSettings}
                className="w-full mt-8 rounded-none"
              >
                Reset to Defaults
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
