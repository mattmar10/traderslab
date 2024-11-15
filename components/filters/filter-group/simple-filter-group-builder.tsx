import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ExpandableDropDownOption } from "../custom-multi-select";
import MovingAverageFilters from "../moving-average-filters";
import PerformanceFilters from "../performance-filters";
import ProfileFilters from "../profile-filters";
import RelativeStrengthFilters from "../relative-strength-filters";
import VolatilityFilters from "../volatility-filters";
import VolumeFilters from "../volume-filters";
import FundamentalFilters from "../fundamental-filters";

interface SimpleFilterEditorProps {
    filters: FilterCriteria;
    onFiltersChange: (key: keyof FilterCriteria, value: any) => void;
    ranges: ScreenerRanges;
    sectors: ExpandableDropDownOption[];
    industries: ExpandableDropDownOption[];
    countryCodes: Record<string, string>;
}

const filterCategories = [
    { id: "profile", name: "Profile" },
    { id: "technical", name: "Technical" },
    { id: "moving-average", name: "Moving Average" },
    { id: "volatility", name: "Volatility" },
    { id: "volume", name: "Volume" },
    { id: "performance", name: "Performance" },
    { id: "relative-strength", name: "Relative Strength" },
    { id: "fundamental", name: "Fundamental" },
];

const categoryComponents: Record<string, React.FC<any>> = {
    profile: ProfileFilters,
    technical: TechnicalFilters,
    "moving-average": MovingAverageFilters,
    volatility: VolatilityFilters,
    volume: VolumeFilters,
    performance: PerformanceFilters,
    "relative-strength": RelativeStrengthFilters,
    fundamental: FundamentalFilters,
};
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { FilterCriteria, InclusionExclusion, ScreenerRanges } from "@/lib/types/screener-types";
import TechnicalFilters from "../technical-filters";

const SimpleFilterEditor: React.FC<SimpleFilterEditorProps> = ({
    filters,
    onFiltersChange,
    ranges,
    sectors,
    industries,
    countryCodes,
}) => {
    const isMobile = window.innerWidth < 768;
    const [activeCategory, setActiveCategory] = React.useState(
        filterCategories[0].id
    );

    const count = filters ? countActiveCriteria(filters) : 0;

    return (
        <div className="w-full">
            {isMobile ? (
                <>
                    {count > 0 && (
                        <div className="flex justify-end text-foreground/50 text-xs">
                            {count} Filters Applied
                        </div>
                    )}
                    <Accordion type="single" collapsible>
                        {filterCategories.map((category) => {
                            const CategoryComponent = categoryComponents[category.id];
                            return (
                                <AccordionItem key={category.id} value={category.id}>
                                    <AccordionTrigger>{category.name}</AccordionTrigger>
                                    <AccordionContent
                                        style={{
                                            overflow: "visible",
                                            position: "relative",
                                            zIndex: 10,
                                        }}
                                    >
                                        {CategoryComponent && (
                                            <div className="px-3">
                                                <CategoryComponent
                                                    filters={filters || {}}
                                                    handleFilterChange={onFiltersChange}
                                                    ranges={ranges}
                                                    sectors={sectors}
                                                    industries={industries}
                                                    countryCodes={countryCodes}
                                                />
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </>
            ) : (
                <Tabs
                    value={activeCategory}
                    onValueChange={(value) => setActiveCategory(value)}
                    className="w-full"
                >
                    <TabsList className="tabs-list">
                        {filterCategories.map((category) => (
                            <TabsTrigger key={category.id} value={category.id}>
                                {category.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {filterCategories.map((category) => {
                        const CategoryComponent = categoryComponents[category.id];
                        return (
                            <TabsContent
                                key={category.id}
                                value={category.id}
                                className="mt-4"
                            >
                                {CategoryComponent && (
                                    <div className="px-3">
                                        <CategoryComponent
                                            filters={filters || {}}
                                            handleFilterChange={onFiltersChange}
                                            ranges={ranges}
                                            sectors={sectors}
                                            industries={industries}
                                            countryCodes={countryCodes}
                                        />
                                    </div>
                                )}
                            </TabsContent>
                        );
                    })}
                </Tabs>
            )}
        </div>
    );
};
export default SimpleFilterEditor;

function countActiveCriteria(filters: FilterCriteria): number {
    return Object.entries(filters).reduce((count, [key, value]) => {
        if (key === "sector" || key === "industry" || key === "country") {
            const { include, exclude } = value as InclusionExclusion;
            return (
                count +
                ((include?.length || 0) >= 1 || (exclude?.length || 0) >= 1 ? 1 : 0)
            );
        } else if (Array.isArray(value)) {
            // Check if array is non-empty
            return count + (value.length > 0 ? 1 : 0);
        } else if (value !== null && value !== undefined) {
            // Count any non-null and non-undefined value
            return count + 1;
        }
        return count;
    }, 0);
}
