"use client";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fira_Code } from "next/font/google";

import { MomentumRow } from "./momentum-types";
import { calculateColorFromPercentage } from "@/lib/utils/table-utils";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export interface MomentumTableProps {
  momentumRows: MomentumRow[];
  totalStockCount: number;
  datasetName: string;
}

const MomentumTable: React.FC<MomentumTableProps> = ({
  momentumRows,
  datasetName,
}: MomentumTableProps) => {
  const { theme } = useTheme();

  const currentTheme = theme === "light" ? "light" : "dark";
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{datasetName} Momentum Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto">
            <table className="w-full table-auto text-xs">
              <thead>
                <tr className="border-b border-foreground/70">
                  <th className=" border-r border-foreground/70 px-2 py-2"></th>
                  <th
                    colSpan={6}
                    className="border-r border-foreground/70 px-2 py-2 text-left"
                  >
                    ST MOMENTUM
                  </th>
                  <th
                    colSpan={3}
                    className=" border-r border-foreground/70 px-2 py-2 text-left"
                  >
                    MT MOMENTUM (1M)
                  </th>
                  <th colSpan={3} className=" px-2 py-2 text-left ">
                    LT MOMENTUM (3M)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b text-foreground/70">
                  <td className="border-r border-foreground/70 py-2 text-left">
                    DATE
                  </td>
                  <td className="px-2 py-1 text-right">UP &gt; 4%</td>
                  <td className="px-2 py-1 text-right">DOWN &lt; 4%</td>
                  <td className="px-2 py-1 text-right">DAY RATIO</td>
                  <td className="whitespace-normal px-2 py-1 text-right">
                    5 DAY RATIO
                  </td>
                  <td className=" px-2 py-1 text-right">10 DAY RATIO</td>
                  <td className="border-r border-foreground/70 px-2 py-1 text-right">
                    DAILY MOMO
                  </td>
                  <td className="max-w-[70px] whitespace-normal px-2 py-1 text-right">
                    UP 25%
                  </td>
                  <td className="max-w-[80px] whitespace-normal px-2 py-1 text-right">
                    DOWN 25%
                  </td>
                  <td className="border-r border-foreground/70 px-2 py-1 text-right">
                    RATIO
                  </td>

                  <td className="max-w-[80px] whitespace-normal px-2 py-1 text-right">
                    UP 25%
                  </td>
                  <td className="max-w-[80px] whitespace-normal px-2 py-1 text-right">
                    DOWN 25%
                  </td>
                  <td className="px-2 py-1 text-right">RATIO</td>
                </tr>
                {momentumRows.map((mr) => {
                  const dayRatioBackground = calculateColorFromPercentage(
                    mr.stMomentumRow.dayRatio || 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  const fiveDayRatioBackground = calculateColorFromPercentage(
                    mr.stMomentumRow.fiveDayRatio || 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  const tenDayRatioBackground = calculateColorFromPercentage(
                    mr.stMomentumRow.tenDayRatio || 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  const mtRatioBackground = calculateColorFromPercentage(
                    mr.mtMomentumRow.ratio || 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  const ltRatioBackground = calculateColorFromPercentage(
                    mr.ltMomentumRow.ratio || 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  return (
                    <tr
                      className={`${firaCode.className} border-b border-foreground/20`}
                      key={mr.stMomentumRow.dateStr}
                    >
                      <td className="border-r border-foreground/70 py-2 pr-2 text-left text-foreground/70">
                        {mr?.stMomentumRow.dateStr}
                      </td>
                      <td
                        className="px-2 text-right"
                        style={{
                          background: dayRatioBackground,
                        }}
                      >
                        {mr.stMomentumRow.upFourPercent}
                      </td>
                      <td
                        className="px-2 text-right"
                        style={{
                          background: dayRatioBackground,
                        }}
                      >
                        {mr.stMomentumRow.downFourPercent}
                      </td>
                      <td
                        className="px-2 text-right"
                        style={{
                          background: dayRatioBackground,
                        }}
                      >
                        {mr.stMomentumRow.dayRatio.toFixed(2)}
                      </td>
                      <td
                        className="px-2 text-right"
                        style={{
                          background: fiveDayRatioBackground,
                        }}
                      >
                        {mr.stMomentumRow.fiveDayRatio.toFixed(2)}
                      </td>
                      <td
                        className="px-2 text-right"
                        style={{
                          background: tenDayRatioBackground,
                        }}
                      >
                        {mr.stMomentumRow.tenDayRatio.toFixed(2)}
                      </td>
                      <td
                        className="border-r border-foreground/70 px-2 text-right"
                        style={{
                          background: dayRatioBackground,
                        }}
                      >
                        {mr.stMomentumRow.dailyMomo.toFixed(2)}%
                      </td>
                      <td
                        className="px-2 text-right"
                        style={{
                          background: mtRatioBackground,
                        }}
                      >
                        {mr.mtMomentumRow.upTwentyFivePercent}
                      </td>
                      <td
                        className=" px-2 text-right"
                        style={{
                          background: mtRatioBackground,
                        }}
                      >
                        {mr.mtMomentumRow.downTwentyFivePercent}
                      </td>
                      <td
                        className="border-r border-foreground/70 pl-4 pr-2 text-right"
                        style={{
                          background: mtRatioBackground,
                        }}
                      >
                        {mr.mtMomentumRow.ratio.toFixed(2)}
                      </td>
                      <td
                        className="px-2 text-right"
                        style={{
                          background: ltRatioBackground,
                        }}
                      >
                        {mr.ltMomentumRow.upTwentyFivePercent}
                      </td>
                      <td
                        className=" px-2 text-right"
                        style={{
                          background: ltRatioBackground,
                        }}
                      >
                        {mr.ltMomentumRow.downTwentyFivePercent}
                      </td>
                      <td
                        className="pl-4 pr-2 text-right"
                        style={{
                          background: ltRatioBackground,
                        }}
                      >
                        {mr.ltMomentumRow.ratio.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MomentumTable;
