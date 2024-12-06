export interface Column {
  key: string;
  label: string;
  alignment: "left" | "right" | "center";
  minWidth?: string;
  maxWidth?: string;
}

export const allColumns: Column[] = [
  {
    key: "rsRank",
    label: "RS Rank",
    alignment: "center",
    minWidth: "3rem",
    maxWidth: "3rem",
  },

  {
    key: "profile.symbol",
    label: "Ticker",
    alignment: "left",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "profile.companyName",
    label: "Name",
    alignment: "left",
    minWidth: "5rem",
    maxWidth: "8rem",
  },
  {
    key: "industry",
    label: "Industry",
    alignment: "left",
    minWidth: "4rem",
    maxWidth: "6rem",
  },
  {
    key: "sector",
    label: "Sector",
    alignment: "left",
    minWidth: "4rem",
    maxWidth: "6rem",
  },
  {
    key: "quote.price",
    label: "Price",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "oneDayReturnPercent",
    label: "Day",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "oneWeekReturnPercent",
    label: "Week",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "oneMonthReturnPercent",
    label: "1M",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "threeMonthReturnPercent",
    label: "3M",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "sixMonthReturnPercent",
    label: "6M",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "percentFromFiftyTwoWeekLow",
    label: "% From 52W Low",
    alignment: "right",
    minWidth: "4rem",
    maxWidth: "4rem",
  },
  {
    key: "percentFromFiftyTwoWeekHigh",
    label: "% From 52W High",
    alignment: "right",
    minWidth: "4rem",
    maxWidth: "4rem",
  },
  {
    key: "nextEarnings",
    label: "Next Earnings",
    alignment: "right",
    minWidth: "4rem",
    maxWidth: "5rem",
  },
  {
    key: "relativeVolume",
    label: "RVol",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "3rem",
  },
  {
    key: "oneMonthRS",
    label: "1M RS",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "threeMonthRS",
    label: "3M RS",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "sixMonthRS",
    label: "6M RS",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "oneYearRS",
    label: "1Y RS",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "compositeRS",
    label: "Composite RS",
    alignment: "right",
    minWidth: "2.5rem",
    maxWidth: "2.5rem",
  },
  {
    key: "breakoutIntensityScore",
    label: "BIS",
    alignment: "right",
    minWidth: "2.5rem",
    maxWidth: "2.5rem",
  },
];

export const defaultColumns: Column[] = [
  {
    key: "rsRank",
    label: "RS Rank",
    alignment: "center",
    minWidth: "2.25rem",
    maxWidth: "2.25rem",
  },
  {
    key: "profile.symbol",
    label: "Ticker",
    alignment: "left",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "profile.companyName",
    label: "Name",
    alignment: "left",
    minWidth: "5rem",
    maxWidth: "8rem",
  },
  {
    key: "industry",
    label: "Industry",
    alignment: "left",
    minWidth: "4rem",
    maxWidth: "6rem",
  },
  {
    key: "quote.price",
    label: "Price",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "oneDayReturnPercent",
    label: "Day",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "oneWeekReturnPercent",
    label: "Week",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "oneMonthReturnPercent",
    label: "1M",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "threeMonthReturnPercent",
    label: "3M",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "sixMonthReturnPercent",
    label: "6M",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
];

export const defaultEtfColumns: Column[] = [
  {
    key: "weightPercentage",
    label: "% Weight",
    alignment: "right",
    minWidth: "2rem",
    maxWidth: "2rem",
  }, ...defaultColumns]

export const mobileColumns: Column[] = [
  {
    key: "rsRank",
    label: "RS Rank",
    alignment: "center",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "profile.symbol",
    label: "Ticker",
    alignment: "left",
    minWidth: "2rem",
    maxWidth: "2rem",
  },
  {
    key: "quote.price",
    label: "Price",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "oneDayReturnPercent",
    label: "Day",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
  {
    key: "oneWeekReturnPercent",
    label: "Week",
    alignment: "right",
    minWidth: "3rem",
    maxWidth: "3rem",
  },
];
