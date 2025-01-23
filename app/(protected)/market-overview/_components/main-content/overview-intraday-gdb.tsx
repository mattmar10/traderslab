"use client";

import Loading from "@/components/loading";
import { MarketBreadthGDBSnapshot, MarketBreadthSnapshotArraySchema } from "@/lib/types/market-breadth-types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import IntradayGDBTVChart, { IntradayGDBChartPoint, IntradayGDBChartSeries } from "./overview-intraday-gdb-tv-chart";
//import { getSectorShortName } from "@/lib/utils";

/*type ChartDataPoint = {
  time: string; // formatted "HH:mm" string for the timestamp
  NYSE?: number;
  "S&P 500"?: number;
  NDX100?: number;
  "Russell 2000"?: number;
};

const chartConfig = {
  NYSE: { label: "NYSE", color: nyseColor },
  "S&P 500": { label: "S&P 500", color: rspColor },
  NDX100: { label: "NDX100", color: qqqeColor },
  "Russell 2000": { label: "Russell 2000", color: iwmColor },
};*/

const OverviewIntradayGDB: React.FC = () => {
  // const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [errorState, setErrorState] = useState<string | null>(null);

  const snapshotsKey = `/api/gdb-snapshots`;

  const getSnapshots = async () => {
    const res = await fetch(snapshotsKey);
    const data = await res.json();
    const parsed = MarketBreadthSnapshotArraySchema.safeParse(data);
    return parsed.success ? parsed.data : "Unable to parse quote results";
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [snapshotsKey],
    queryFn: getSnapshots,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (data && typeof data !== "string") {
      const cutoffTime = new Date();
      cutoffTime.setHours(15, 30, 0, 0); // Cutoff to 15:30
      // const cutoffTimestamp = cutoffTime.getTime();

      /*const filteredData = data
        .filter((snapshot) => snapshot.timestamp <= cutoffTimestamp)
        .map((snapshot) => ({
          time: format(new Date(snapshot.timestamp), "HH:mm"),
          NYSE: Number(
            snapshot.nyseOverview.globalDailyBreadthPercentileRank.toFixed(2)
          ),
          "S&P 500": Number(
            snapshot.rspTradingOverview.globalDailyBreadthPercentileRank.toFixed(
              2
            )
          ),
          NDX100: Number(
            snapshot.qqqETradingOverview.globalDailyBreadthPercentileRank.toFixed(
              2
            )
          ),
          "Russell 2000": Number(
            snapshot.iwmTradingOverview.globalDailyBreadthPercentileRank.toFixed(
              2
            )
          ),
        }));*/

      const series = buildChartSeries(data, true);
      setChartSeries(series);
      // setChartData(filteredData);
      setErrorState(null);
    } else if (typeof data === "string") {
      setErrorState(data);
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="place-items-center">
        <Loading />
      </div>
    );
  if (error || errorState) return <p>Error loading market data.</p>;


  return (
    <IntradayGDBTVChart series={chartSeries} />
  )
  /*const generateTicks = (data: ChartDataPoint[]): string[] => {
    const tickInterval = 30; // interval in minutes
    const ticks: string[] = [];

    data.forEach((point) => {
      const [, minutes] = point.time.split(":").map(Number);
      if (minutes % tickInterval === 0) {
        ticks.push(point.time);
      }
    });

    return ticks;
  };

 const ticks = generateTicks(chartData);
 
 return (
     <ChartContainer
       config={{
         returns: {
           label: "Returns",
           color: "text-gray-700",
         },
       }}
       className=" h-full w-full"
     >
       <ResponsiveContainer width="100%" height="100%">
         <LineChart
           data={chartData}
           margin={{ top: 20, right: 0, bottom: 20, left: 5 }}
         >
           <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
           <ReferenceLine y={0} stroke="#999" strokeWidth={1.5} />
           <XAxis dataKey="time" ticks={ticks} />
           <YAxis
             domain={["auto", "auto"]}
             tickFormatter={(value) => `${value.toFixed(2)}%`}
           />
           <ChartTooltip
             content={
               <ChartTooltipContent
                 className="w-[180px]"
                 labelFormatter={(label) => `Time: ${label}`}
                 formatter={(value, name) => {
                   const config = chartConfig[name as keyof typeof chartConfig];
                   const color = config ? config.color : "#000";
 
                   return (
                     <>
                       <div
                         className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                         style={{ backgroundColor: color }}
                       />
                       <span key="label" className="ml-2 font-semibold">
                         {config?.label || name}
                       </span>
                       <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                         {value}
                         <span className="font-normal text-muted-foreground">
                           %
                         </span>
                       </div>
                     </>
                   );
                 }}
               />
             }
             cursor={true}
           />
 
           <Legend
             verticalAlign="bottom"
             align="center"
             height={36}
             wrapperStyle={{
               bottom: 0,
               paddingTop: '0px',
               marginBottom: '-5px'
             }}
           />
           {Object.entries(chartConfig).map(([key, config]) => (
             <Line
               key={key}
               type="monotone"
               dataKey={key}
               name={config.label}
               stroke={config.color}
               dot={false}
               connectNulls
               strokeWidth={2}
             />
           ))}
         </LineChart>
       </ResponsiveContainer>
     </ChartContainer>
   );*/
};

export default OverviewIntradayGDB;

function buildChartSeries(
  data: MarketBreadthGDBSnapshot[],
  showMarkets: boolean,
  //showSectors: boolean
): IntradayGDBChartSeries[] {
  // Map for each snapshot for each overview (NYSE, RSP, QQE, IWM)
  const nyseSeries: IntradayGDBChartPoint[] = data.map((snapshot) => ({
    timestamp: snapshot.timestamp,
    value: snapshot.nyseOverview.globalDailyBreadthPercentileRank,
  }));

  const rspSeries: IntradayGDBChartPoint[] = data.map((snapshot) => ({
    timestamp: snapshot.timestamp,
    value: snapshot.rspTradingOverview.globalDailyBreadthPercentileRank,
  }));

  const qqeSeries: IntradayGDBChartPoint[] = data.map((snapshot) => ({
    timestamp: snapshot.timestamp,
    value: snapshot.qqqETradingOverview.globalDailyBreadthPercentileRank,
  }));

  const iwmSeries: IntradayGDBChartPoint[] = data.map((snapshot) => ({
    timestamp: snapshot.timestamp,
    value: snapshot.iwmTradingOverview.globalDailyBreadthPercentileRank,
  }));

  /*const generateSectorColors = () => [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Caribbean Green
    "#45B7D1", // Picton Blue
    "#FFA07A", // Light Salmon
    "#F7B731", // Buttercup Yellow
    "#C3A6FF", // Lavender Blue
    "#FF9FF3", // Lavender Pink
    "#70A1FF", // Malibu Blue
    "#5352ED", // Neon Blue
    "#FF7F50", // Coral
    "#FF6347", // Tomato
    "#20B2AA", // Light Sea Green
    "#BA55D3", // Medium Orchid
    "#FF4500", // Orange Red
    "#1E90FF", // Dodger Blue
  ];*/

  const series: IntradayGDBChartSeries[] = showMarkets
    ? [
      {
        title: "NYSE",
        dataSeries: nyseSeries,
        color: "#268bd2",
        lineThickness: 2,
      },
      {
        title: "RSP",
        dataSeries: rspSeries,
        color: "#b58900",
        lineThickness: 2,
      },
      {
        title: "QQQE",
        dataSeries: qqeSeries,
        color: "#cb4b16",
        lineThickness: 2,
      },
      {
        title: "IWM",
        dataSeries: iwmSeries,
        color: "#6c71c4",
        lineThickness: 2,
      },
    ]
    : [];

  /*if (showSectors) {
    const sectorColors = generateSectorColors();
    const sectorSeriesMap: { [key: string]: IntradayGDBChartPoint[] } = {};

    data.forEach((snapshot) => {
      snapshot.sectorsOverviews.forEach((sector: { sector: string | number; overview: { globalDailyBreadthPercentileRank: any; }; }) => {
        if (!sectorSeriesMap[sector.sector]) {
          sectorSeriesMap[sector.sector] = [];
        }
        sectorSeriesMap[sector.sector].push({
          timestamp: snapshot.timestamp,
          value: sector.overview.globalDailyBreadthPercentileRank,
        });
      });
    });

    const sectorSeries: IntradayGDBChartSeries[] = Object.keys(
      sectorSeriesMap
    ).map((sectorName, index) => ({
      title: getSectorShortName(sectorName),
      dataSeries: sectorSeriesMap[sectorName],
      color: sectorColors[index % sectorColors.length],
      lineThickness: 1,
    }));

    return [...series, ...sectorSeries];
  }*/

  return series;
}