import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { RelativeStrengthResults } from "@/lib/types/relative-strength-types"
import { solarizedMagenta, solarizedViolet } from "@/lib/utils/color-utils"

export interface RelativeStrengthBarChartProps {
    rsData: RelativeStrengthResults
}


const chartConfig = {
    standard: {
        label: "Standard RS",
        color: solarizedViolet
    },
    adjusted: {
        label: "Vol Adjusted RS",
        color: solarizedMagenta
    }
} satisfies ChartConfig

const RelativeStrengthBarChart: React.FC<RelativeStrengthBarChartProps> = ({ rsData }) => {

    // Transform the data into the format required by recharts
    const chartData = [
        { period: "1M", standard: rsData.relativeStrengthStats.oneMonth, adjusted: rsData.volAdjustedRelativeStrengthStats.oneMonth },
        { period: "3M", standard: rsData.relativeStrengthStats.threeMonth, adjusted: rsData.volAdjustedRelativeStrengthStats.threeMonth },
        { period: "6M", standard: rsData.relativeStrengthStats.sixMonth, adjusted: rsData.volAdjustedRelativeStrengthStats.sixMonth },
        { period: "1Y", standard: rsData.relativeStrengthStats.oneYear, adjusted: rsData.volAdjustedRelativeStrengthStats.oneYear },
        { period: "Comp", standard: rsData.relativeStrengthStats.composite, adjusted: rsData.volAdjustedRelativeStrengthStats.composite }
    ];

    const compositeChange = ((rsData.relativeStrengthStats.composite - rsData.relativeStrengthStats.oneMonth) / rsData.relativeStrengthStats.oneMonth * 100).toFixed(1);
    const isPositive = parseFloat(compositeChange) > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Relative Strength Analysis</CardTitle>
                <CardDescription>Standard vs Volatility Adjusted Relative Strength</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className=" h-[20vh] 4xl:h-[15vh] w-full">
                    <ResponsiveContainer width="100%">

                        <BarChart data={chartData}>

                            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="period"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value.toFixed(1)}%`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />

                            <Legend />
                            <Bar dataKey="standard" fill={solarizedViolet} radius={2} />
                            <Bar dataKey="adjusted" fill={solarizedMagenta} radius={2} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>

        </Card>
    );
};

export default RelativeStrengthBarChart;