// Types
import { Candle } from "@/lib/types/basic-types";
import { isMovingAverageError, smaSeq } from "@/lib/utils/moving-average";

export interface RelativeStrengthRotationPoint {
    symbol: string;
    date: number;
    dateStr: string;
    price: number;
    benchmarkPrice: number;
    rsValue: number;      // Price relative to benchmark (price/benchmarkPrice)
    rsRatio: number;      // Normalized RS value (around 100)
    rsMomentum: number;   // Rate of change in RS Ratio
    color?: string;       // For visualization
}

// Weighted Moving Average (WMA)
function wma(data: number[], period: number): number {
    if (data.length < period) return NaN;

    let sum = 0;
    let weightSum = 0;

    for (let i = 0; i < period; i++) {
        const weight = period - i;
        sum += data[i] * weight;
        weightSum += weight;
    }

    return sum / weightSum;
}

/*
function calculateRRGPoint(
    symbolCandles: Candle[],
    benchmarkCandles: Candle[],
    rsPeriod: number,
    momentumPeriod: number
): { rsRatio: number; rsMomentum: number } {
    const prices = symbolCandles.map(c => c.close);
    const benchmarkPrices = benchmarkCandles.map(c => c.close);

    if (prices.length !== benchmarkPrices.length) {
        throw new Error("Symbol and benchmark candles must have the same length.");
    }

    // Step 1: Calculate RS (Relative Strength)
    const rs = prices.map((price, i) => price / benchmarkPrices[i]);

    // Step 2: Calculate RS Ratio
    const rsRollingMean = rollingMean(rs, rsPeriod);
    const rsRollingStd = rollingStdDev(rs, rsPeriod);
    const rsRatio = rs.map((r, i) => {
        if (rsRollingMean[i] === undefined || rsRollingStd[i] === undefined) return NaN;
        return 100 + ((r - rsRollingMean[i]) / rsRollingStd[i]);
    });

    // Step 3: Calculate RS Momentum (Rate of Change of RS Ratio)
    const rsMomentumROC = rsRatio.map((r, i) => {
        if (i < momentumPeriod || rsRatio[i - momentumPeriod] === undefined) return NaN;
        return 100 * ((r / rsRatio[i - momentumPeriod]) - 1);
    });

    // Step 4: Normalize RS Momentum around 100
    const rsMomentumRollingMean = rollingMean(rsMomentumROC, momentumPeriod);
    const rsMomentumRollingStd = rollingStdDev(rsMomentumROC, momentumPeriod);
    const rsMomentum = rsMomentumROC.map((roc, i) => {
        if (rsMomentumRollingMean[i] === undefined || rsMomentumRollingStd[i] === undefined) return NaN;
        return 101 + ((roc - rsMomentumRollingMean[i]) / rsMomentumRollingStd[i]);
    });

    // Return the most recent RS Ratio and RS Momentum
    const latestRsRatio = rsRatio[rsRatio.length - 1];
    const latestRsMomentum = rsMomentum[rsMomentum.length - 1];

    return {
        rsRatio: latestRsRatio,
        rsMomentum: latestRsMomentum
    };
}

function getRRGTrail(
    ticker: string,
    symbolCandles: Candle[],
    benchmarkCandles: Candle[],
    rsPeriod: number = 20,
    trailLength: number = 10,
    momentumPeriod: number = 20
): RelativeStrengthRotationPoint[] {
    const points: RelativeStrengthRotationPoint[] = [];

    // Calculate the total candles required for one point
    const totalPeriod = rsPeriod + 2 * momentumPeriod - 1;

    for (let i = 0; i < trailLength; i++) {
        const startIdx = symbolCandles.length - (totalPeriod + i);
        if (startIdx < 0) break; // Not enough data for this point

        // Slice enough candles for RS Ratio and RS Momentum calculations
        const windowSymbol = symbolCandles.slice(startIdx, startIdx + totalPeriod);
        const windowBench = windowSymbol
            .map(c => benchmarkCandles.find(b => b.date === c.date))
            .filter(c => c !== undefined) as Candle[];

        // Ensure enough data for calculations
        if (windowSymbol.length < totalPeriod || windowBench.length < totalPeriod) {
            break;
        }

        const { rsRatio, rsMomentum } = calculateRRGPoint(
            windowSymbol,
            windowBench,
            rsPeriod,
            momentumPeriod
        );

        points.push({
            date: windowSymbol[0].date,
            symbol: ticker,
            price: windowSymbol[0].close,
            benchmarkPrice: windowBench[0].close,
            rsValue: windowSymbol[0].close / windowBench[0].close,
            rsRatio,
            rsMomentum
        });
    }

    return points;
}



function rollingMean(data: number[], window: number): (number | undefined)[] {
    const result: (number | undefined)[] = [];
    for (let i = 0; i < data.length; i++) {
        if (i < window - 1) {
            result.push(undefined);
        } else {
            const windowSlice = data.slice(i - window + 1, i + 1);
            result.push(windowSlice.reduce((sum, val) => sum + val, 0) / window);
        }
    }
    return result;
}

function rollingStdDev(data: number[], window: number): (number | undefined)[] {
    const result: (number | undefined)[] = [];
    for (let i = 0; i < data.length; i++) {
        if (i < window - 1) {
            result.push(undefined);
        } else {
            const windowSlice = data.slice(i - window + 1, i + 1);
            const mean = windowSlice.reduce((sum, val) => sum + val, 0) / window;
            const variance = windowSlice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / window;
            result.push(Math.sqrt(variance));
        }
    }
    return result;
}
*/

function calculateRRGPoint(
    symbolCandles: Candle[],
    benchmarkCandles: Candle[],
    rsPeriod: number,
    momentumPeriod: number,
    smoothingPeriod: number = 3
): { rsRatio: number; rsMomentum: number } {
    // Calculate total required periods for each step
    // smoothingPeriod: need smoothingPeriod days for first SMA
    // rsPeriod: need rsPeriod days for WMA after smoothing
    // momentumPeriod: need momentumPeriod days for final momentum calculation
    const totalRequiredPeriods = smoothingPeriod + rsPeriod + momentumPeriod;

    // Ensure we have enough data points
    if (symbolCandles.length < totalRequiredPeriods || benchmarkCandles.length < totalRequiredPeriods) {
        throw new Error(`Insufficient data. Need at least ${totalRequiredPeriods} candles for calculation with smoothing=${smoothingPeriod}, rsPeriod=${rsPeriod}, momentumPeriod=${momentumPeriod}`);
    }

    const prices = symbolCandles.map(c => c.close);
    const benchmarkPrices = benchmarkCandles.map(c => c.close);

    if (prices.length !== benchmarkPrices.length) {
        throw new Error("Symbol and benchmark candles must have the same length.");
    }

    // Step 1: Calculate RS (Relative Strength)
    const rs = prices.map((price, i) => price / benchmarkPrices[i]);

    // Apply SMA smoothing to RS
    const smoothedRs = smoothingPeriod > 1 ? smaSeq(smoothingPeriod, rs) : rs;

    if (isMovingAverageError(smoothedRs)) {
        throw new Error("Error smoothing RS values");
    }

    // Step 2: Calculate RS-Ratio using smoothed RS
    // Start from smoothingPeriod to account for the initial SMA calculation
    const rsRatios: number[] = [];
    for (let i = rsPeriod - 1; i < smoothedRs.length; i++) {
        const windowRs = smoothedRs.slice(i - rsPeriod + 1, i + 1);
        const rsWMA = wma(windowRs, rsPeriod);
        // RS-Ratio is the ratio of current smoothed RS to its WMA, scaled to 100
        rsRatios.push((smoothedRs[i] / rsWMA) * 100);
    }

    // Step 3: Calculate RS-Momentum
    // Need to account for both smoothing and RS-Ratio periods
    const rsMomentums: number[] = [];
    for (let i = momentumPeriod; i < rsRatios.length; i++) {
        const windowRatios = rsRatios.slice(i - momentumPeriod, i + 1);
        const ratioWMA = wma(windowRatios, momentumPeriod);
        // RS-Momentum is the ratio of current RS-Ratio to its WMA, scaled to 100
        rsMomentums.push((rsRatios[i] / ratioWMA) * 100);
    }

    // Check if we have valid results
    if (rsRatios.length === 0 || rsMomentums.length === 0) {
        throw new Error("Failed to calculate valid RRG points");
    }

    return {
        rsRatio: rsRatios[rsRatios.length - 1],
        rsMomentum: rsMomentums[rsMomentums.length - 1]
    };
}

function getRRGTrail(
    ticker: string,
    symbolCandles: Candle[],
    benchmarkCandles: Candle[],
    rsPeriod: number = 125,
    numberOfObservations: number = 10,
    momentumPeriod: number = 10,
    smoothingPeriod: number = 0 //no smoothing
): RelativeStrengthRotationPoint[] {
    const points: RelativeStrengthRotationPoint[] = [];

    // Need enough data for both RS-Ratio and Momentum calculations
    const totalPeriod = rsPeriod + momentumPeriod + smoothingPeriod;

    for (let i = 0; i < numberOfObservations; i++) {
        const startIdx = symbolCandles.length - (totalPeriod + i);
        if (startIdx < 0) break;

        const windowSymbol = symbolCandles.slice(startIdx, startIdx + totalPeriod);
        const windowBench = windowSymbol
            .map(c => benchmarkCandles.find(b => b.dateStr === c.dateStr))
            .filter(c => c !== undefined) as Candle[];

        if (windowSymbol.length < totalPeriod || windowBench.length < totalPeriod) {
            break;
        }

        const { rsRatio, rsMomentum } = calculateRRGPoint(
            windowSymbol,
            windowBench,
            rsPeriod,
            momentumPeriod,
            smoothingPeriod
        );

        points.push({
            date: windowSymbol[windowSymbol.length - 1].date,
            dateStr: windowSymbol[windowSymbol.length - 1].dateStr!,
            symbol: ticker,
            price: windowSymbol[windowSymbol.length - 1].close,
            benchmarkPrice: windowBench[windowBench.length - 1].close,
            rsValue: windowSymbol[windowSymbol.length - 1].close /
                windowBench[windowBench.length - 1].close,
            rsRatio,
            rsMomentum
        });
    }

    return points;
}

// Export Functions
export { calculateRRGPoint, getRRGTrail };
