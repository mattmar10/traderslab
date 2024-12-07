import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockGrade } from "@/lib/types/fmp-types";
import { ArrowDownCircle, ArrowUpCircle, GlobeIcon, MinusCircle } from "lucide-react";
import { HiMiniArrowsUpDown } from "react-icons/hi2";
import Link from 'next/link';
export interface UpgradesAndDowngradesProps {
    grades: StockGrade[];
}

const UpgradesAndDowngrades: React.FC<UpgradesAndDowngradesProps> = ({ grades }) => {
    // Enhanced categorization of grades
    const categorizeGrade = (grade: StockGrade): 'upgrade' | 'downgrade' | 'maintain' => {
        // Direct actions
        if (grade.action === 'upgrade' || grade.action === 'downgrade') {
            return grade.action;
        }

        // Comprehensive grade values mapping
        const gradeValues = {
            // Strong positive ratings
            'strong buy': 5,
            'buy': 4,
            'outperform': 4,
            'overweight': 4,
            'positive': 4,

            // Neutral ratings
            'hold': 3,
            'neutral': 3,
            'market perform': 3,
            'equal-weight': 3,
            'in-line': 3,

            // Negative ratings
            'underweight': 2,
            'underperform': 2,
            'negative': 2,
            'sell': 1,
            'strong sell': 0
        };

        const normalizeGrade = (grade: string) => grade.toLowerCase().trim();

        console.log(grade)

        if (grade.previousGrade &&
            normalizeGrade(grade.previousGrade) === normalizeGrade(grade.newGrade)) {
            return 'maintain';
        }

        // Get values for previous and new grades
        const newGradeValue = gradeValues[normalizeGrade(grade.newGrade) as keyof typeof gradeValues] ?? 3;

        // If there's no previous grade, categorize based on the new grade value
        if (!grade.previousGrade) {
            if (newGradeValue > 3) return 'upgrade';
            if (newGradeValue < 3) return 'downgrade';
            return 'maintain';
        }

        const previousGradeValue = gradeValues[normalizeGrade(grade.previousGrade) as keyof typeof gradeValues] ?? 3;

        // Special case handling for specific actions
        if (grade.action === 'outperform') return 'upgrade';
        if (grade.action === 'underperform') return 'downgrade';

        // Compare values to determine upgrade/downgrade
        if (newGradeValue === previousGradeValue) return 'maintain';
        return newGradeValue > previousGradeValue ? 'upgrade' : 'downgrade';
    };

    // Filter out maintained ratings
    const filteredGrades = grades.filter(grade => categorizeGrade(grade) !== 'maintain');
    const upgrades = filteredGrades.filter(item => categorizeGrade(item) === 'upgrade');
    const downgrades = filteredGrades.filter(item => categorizeGrade(item) === 'downgrade');

    const getActionColor = (item: StockGrade) => {
        const category = categorizeGrade(item);
        return category === 'upgrade' ? 'text-uptrend' : 'text-red-500';
    };

    const renderGradeChange = (item: StockGrade) => {
        const category = categorizeGrade(item);
        if (category === 'maintain') return <MinusCircle className="ray-400" />;
        return category === 'upgrade' ?
            <ArrowUpCircle className="text-uptrend" /> :
            <ArrowDownCircle className="text-red-500" />;
    };


    const renderGradeList = (items: StockGrade[]) => (
        <ScrollArea className="h-full w-full max-h-[450px] overflow-auto">
            <div className="space-y-4">
                {items.map((item, index) => (
                    <Link href={`/symbol/${item.symbol}`}>
                        <div
                            key={`${item.symbol}-${item.publishedDate}-${index}`}
                            className="flex items-start space-x-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex-shrink-0 mt-1">{renderGradeChange(item)}</div>

                            <div className="flex-grow min-w-0">

                                <div className="flex items-center justify-between">
                                    <p className="font-semibold truncate">{item.symbol}</p>
                                    <p className="text-sm text-foreground/70 font-medium truncate">
                                        <p className="text-sm text-gray-500">
                                            {item.previousGrade ? (
                                                <span>{item.previousGrade} → </span>
                                            ) : (
                                                <span>New: </span>
                                            )}
                                            <span>{item.newGrade}</span>
                                        </p>
                                    </p>
                                </div>
                                <div className='text-sm text-foreground/70'>{item.gradingCompany}</div>

                            </div>


                        </div>
                    </Link>
                ))}
            </div>
        </ScrollArea>
    );

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col space-y-1">
                    <CardTitle className="text-xl">Upgrades and Downgrades</CardTitle>
                    <CardDescription>Todays Upgrades and Downgrades</CardDescription>
                </div>
                <HiMiniArrowsUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1">
                <Tabs defaultValue="upgrades" className="h-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upgrades">
                            Upgrades ({upgrades.length})
                        </TabsTrigger>
                        <TabsTrigger value="downgrades">
                            Downgrades ({downgrades.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upgrades" className="h-full">
                        {renderGradeList(upgrades)}
                    </TabsContent>
                    <TabsContent value="downgrades" className="h-full">
                        {renderGradeList(downgrades)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default UpgradesAndDowngrades;