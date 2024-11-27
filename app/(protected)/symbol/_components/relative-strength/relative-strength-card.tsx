import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RelativeStrengthResults } from '@/lib/types/relative-strength-types';


export interface RelativeStrengthCardProps {
    rsData: RelativeStrengthResults
}

const RelativeStrengthCard: React.FC<RelativeStrengthCardProps> = ({ rsData }) => {


    const formatValue = (data: number) => {
        return data.toFixed(2);
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Relative Strength Statistics</CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Standard RS</h3>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">1 Month</span>
                                <span className="font-medium">{formatValue(rsData.relativeStrengthStats.oneMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">3 Month</span>
                                <span className="font-medium">{formatValue(rsData.relativeStrengthStats.threeMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">6 Month</span>
                                <span className="font-medium">{formatValue(rsData.relativeStrengthStats.sixMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">1 Year</span>
                                <span className="font-medium">{formatValue(rsData.relativeStrengthStats.oneYear)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t">
                                <span className="text-muted-foreground">Composite</span>
                                <span className="font-medium">{formatValue(rsData.relativeStrengthStats.composite)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 mt-2">
                        <h3 className="text-sm font-semibold">Volatility Adjusted RS</h3>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">1 Month</span>
                                <span className="font-medium">{formatValue(rsData.volAdjustedRelativeStrengthStats.oneMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">3 Month</span>
                                <span className="font-medium">{formatValue(rsData.volAdjustedRelativeStrengthStats.threeMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">6 Month</span>
                                <span className="font-medium">{formatValue(rsData.volAdjustedRelativeStrengthStats.sixMonth)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">1 Year</span>
                                <span className="font-medium">{formatValue(rsData.volAdjustedRelativeStrengthStats.oneYear)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t">
                                <span className="text-sm font-medium">Composite</span>
                                <span className="font-medium">{formatValue(rsData.volAdjustedRelativeStrengthStats.composite)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RelativeStrengthCard;