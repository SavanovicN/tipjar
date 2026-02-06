import { describe, expect, it } from "vitest";
import { aggregateByCreator, aggregateByTipper } from "./useTipEvents";

interface TipEvent {
  tipper: string;
  creator: string;
  amount: bigint;
}

const events: TipEvent[] = [
  { tipper: "0xAlice", creator: "0xCreator1", amount: BigInt(5e18) },
  { tipper: "0xBob", creator: "0xCreator1", amount: BigInt(2.5e18) },
  { tipper: "0xAlice", creator: "0xCreator2", amount: BigInt(3e18) },
  { tipper: "0xCharlie", creator: "0xCreator2", amount: BigInt(1e18) },
  { tipper: "0xBob", creator: "0xCreator3", amount: BigInt(0.5e18) },
];

describe("aggregateByTipper", () => {
  it("groups and sums by tipper address", () => {
    const result = aggregateByTipper(events);

    expect(result).toHaveLength(3);
    expect(result[0].address).toBe("0xAlice");
    expect(result[0].totalAmount).toBe(BigInt(8e18));
  });

  it("sorts in descending order by total amount", () => {
    const result = aggregateByTipper(events);

    // Alice: 8, Bob: 3, Charlie: 1
    expect(result.map((r) => r.address)).toEqual(["0xAlice", "0xBob", "0xCharlie"]);
  });

  it("returns empty array for no events", () => {
    expect(aggregateByTipper([])).toEqual([]);
  });

  it("handles single event", () => {
    const result = aggregateByTipper([events[0]]);
    expect(result).toEqual([{ address: "0xAlice", totalAmount: BigInt(5e18) }]);
  });
});

describe("aggregateByCreator", () => {
  it("groups and sums by creator address", () => {
    const result = aggregateByCreator(events);

    expect(result).toHaveLength(3);
    expect(result[0].address).toBe("0xCreator1");
    expect(result[0].totalReceived).toBe(BigInt(7.5e18));
    expect(result[0].tipCount).toBe(2);
  });

  it("sorts in descending order by total received", () => {
    const result = aggregateByCreator(events);

    // Creator1: 7.5, Creator2: 4, Creator3: 0.5
    expect(result.map((r) => r.address)).toEqual(["0xCreator1", "0xCreator2", "0xCreator3"]);
  });

  it("tracks tip count correctly", () => {
    const result = aggregateByCreator(events);

    const creator2 = result.find((r) => r.address === "0xCreator2");
    expect(creator2?.tipCount).toBe(2);

    const creator3 = result.find((r) => r.address === "0xCreator3");
    expect(creator3?.tipCount).toBe(1);
  });

  it("returns empty array for no events", () => {
    expect(aggregateByCreator([])).toEqual([]);
  });
});
