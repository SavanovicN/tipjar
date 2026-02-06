import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, startChars = 6, endChars = 4) {
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export const byBigIntDesc = <T>(getValue: (item: T) => bigint) => {
  return (a: T, b: T) => (getValue(a) < getValue(b) ? 1 : -1);
};

export function sumByKey<T>(
  items: T[],
  getKey: (item: T) => string,
  getAmount: (item: T) => bigint,
) {
  return items.reduce((totals, item) => {
    const key = getKey(item);
    const current = totals.get(key) ?? { total: BigInt(0), count: 0 };

    totals.set(key, { total: current.total + getAmount(item), count: current.count + 1 });

    return totals;
  }, new Map<string, { total: bigint; count: number }>());
}

export function getTabNavIndex(key: string, currentIndex: number, total: number): number | null {
  switch (key) {
    case "ArrowLeft":
      return currentIndex === 0 ? total - 1 : currentIndex - 1;
    case "ArrowRight":
      return currentIndex === total - 1 ? 0 : currentIndex + 1;
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return null;
  }
}
