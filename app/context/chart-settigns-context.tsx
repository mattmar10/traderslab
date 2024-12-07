"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ChartSettings, defaultChartSettings } from "@/components/settings/chart-settings";

interface ChartSettingsContextProps {
    chartSettings: ChartSettings;
    setChartSettings: (settings: ChartSettings) => void;
}

const ChartSettingsContext = createContext<ChartSettingsContextProps | undefined>(undefined);

export const useChartSettings = () => {
    const context = useContext(ChartSettingsContext);
    if (!context) {
        throw new Error("useChartSettings must be used within a ChartSettingsProvider");
    }
    return context;
};

export const ChartSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize with default settings
    const [chartSettings, setChartSettings] = useState<ChartSettings>(defaultChartSettings);

    // Load settings from localStorage after component mounts
    useEffect(() => {
        const savedSettings = localStorage.getItem("chartSettings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setChartSettings(parsed);
            } catch (error) {
                console.error("Error parsing stored chart settings:", error);
                // If parsing fails, fallback to default settings
                localStorage.removeItem("chartSettings");
            }
        }
    }, []);

    // Update localStorage whenever chartSettings changes
    const updateChartSettings = (settings: ChartSettings) => {
        setChartSettings(settings);
        localStorage.setItem("chartSettings", JSON.stringify(settings));
    };

    return (
        <ChartSettingsContext.Provider value={{ chartSettings, setChartSettings: updateChartSettings }}>
            {children}
        </ChartSettingsContext.Provider>
    );
};
