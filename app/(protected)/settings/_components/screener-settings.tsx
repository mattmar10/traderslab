"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";


export interface ScreenerSettings {
    refreshInterval: number
}

export const defaultScreenerSettings: ScreenerSettings = {
    refreshInterval: 30000
}

function loadSettingsFromStorage(): ScreenerSettings {
    if (typeof window !== "undefined") {
        const savedSettings = localStorage.getItem("screenerSettings");
        if (savedSettings) {
            return { ...defaultScreenerSettings, ...JSON.parse(savedSettings) };
        }
    }
    return defaultScreenerSettings;
}


export default function ScreenerSettings() {
    const [settings, setSettings] =
        useState<ScreenerSettings>(loadSettingsFromStorage());


    useEffect(() => {

        if (settings) {
            localStorage.setItem(
                "screenerSettings",
                JSON.stringify(settings)
            );
        }
    }, [settings]);

    const updateScreenerRefreshInterval = (value: number) => {
        setSettings((prev) => ({
            ...prev!,
            refreshInterval: value,
        }));
    };

    const resetScreenerSettings = () => {
        setSettings((prev) => ({
            ...prev!,
            refreshInterval: defaultScreenerSettings.refreshInterval,
        }));

    };

    return (
        <Card className="h-full min-h-[300px] max-h-[30vh] flex flex-col">
            <CardHeader className="flex-none pb-0">
                <CardTitle className="text-xl">Screener Settings</CardTitle>
                <CardDescription>Configure screener specific settings</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" defaultValue="screener-settings" className="w-full space-y-4 mt-4">
                    <AccordionItem
                        value="screener-settings"
                        className="border overflow-hidden"
                    >
                        <AccordionTrigger className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors">
                            Screener Settings
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-4 bg-background border-t">
                            <div className="flex items-center space-x-2">
                                <Label className="w-48">Screener Refresh Interval:</Label>
                                <Select
                                    value={String(settings.refreshInterval || 30000)}
                                    onValueChange={(value) =>
                                        updateScreenerRefreshInterval(Number(value))
                                    }
                                >
                                    <SelectTrigger className="w-48 border-input bg-background">
                                        <SelectValue placeholder="Select Interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10000">10 Seconds</SelectItem>
                                        <SelectItem value="30000">30 Seconds</SelectItem>
                                        <SelectItem value="60000">1 Minute</SelectItem>
                                        <SelectItem value="300000">5 Minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="">
                                <Button
                                    variant="secondary"
                                    onClick={resetScreenerSettings}
                                    className="w-full mt-8 rounded-none"
                                >
                                    Reset to Defaults
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}