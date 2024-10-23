import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toZonedTime } from "date-fns-tz";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sectorsNameMap: Map<string, string> = new Map([
  ["utilities", "UTILITIES"],
  ["consumer-defensive", "CONS. DEFENSIVE"],
  ["real-estate", "REAL ESTATE"],
  ["industrials", "INDUSTRIALS"],
  ["basic-materials", "BASIC MATERIALS"],
  ["healthcare", "HEALTHCARE"],
  ["consumer-cyclical", "CONS. CYCLICAL"],
  ["technology", "TECHNOLOGY"],
  ["financial-services", "FINANCIAL SVCS."],
  ["energy", "ENERGY"],
  ["communication-services", "COMMUNICATION SVCS."],
]);

export function getSectorShortName(sectorName: string) {
  const key = sectorName.trim().replaceAll(" ", "-").toLowerCase();
  return sectorsNameMap.get(key) || "UNKNOWN";
}

export const isWithinMarketHours = () => {
  const now = new Date();
  const timeZone = "America/Chicago"; // CST/CDT timezone
  const zonedNow = toZonedTime(now, timeZone);

  const dayOfWeek = zonedNow.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // 0 = Sunday, 6 = Saturday
    return false;
  }

  // Market open and close times
  const marketOpen = new Date(zonedNow);
  marketOpen.setHours(8, 30, 0, 0);
  const marketClose = new Date(zonedNow);
  marketClose.setHours(15, 0, 0, 0);

  return zonedNow >= marketOpen && zonedNow <= marketClose;
};

export type Left<L> = { tag: "left"; value: L };
export type Right<R> = { tag: "right"; value: R };
export type Either<L, R> = Left<L> | Right<R>;

export function Left<L>(data: L): Left<L> {
  return {
    tag: "left",
    value: data,
  };
}

export function Right<R>(data: R): Right<R> {
  return {
    tag: "right",
    value: data,
  };
}

export function match<T, L, R>(
  input: Either<L, R>,
  left: (left: L) => T,
  right: (right: R) => T
) {
  switch (input.tag) {
    case "left":
      return left(input.value);
    case "right":
      return right(input.value);
  }
}

export function isRight<L, R>(input: Either<L, R>): input is Right<R> {
  return input.tag === "right";
}

export function isLeft<L, R>(input: Either<L, R>): input is Right<R> {
  return input.tag === "left";
}
