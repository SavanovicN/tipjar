import { describe, expect, it } from "vitest";
import { byBigIntDesc, cn, getTabNavIndex, sumByKey, truncateAddress } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts with last wins", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});

describe("truncateAddress", () => {
  const address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  it("truncates with default params (6...4)", () => {
    expect(truncateAddress(address)).toBe("0x7099...79C8");
  });

  it("truncates with custom start/end chars", () => {
    expect(truncateAddress(address, 10, 6)).toBe("0x70997970...dc79C8");
  });

  it("handles short addresses", () => {
    expect(truncateAddress("0x1234", 4, 2)).toBe("0x12...34");
  });
});

describe("byBigIntDesc", () => {
  it("sorts items by bigint value in descending order", () => {
    const items = [
      { name: "a", value: BigInt(1) },
      { name: "b", value: BigInt(3) },
      { name: "c", value: BigInt(2) },
    ];
    const sorted = items.toSorted(byBigIntDesc((item) => item.value));
    expect(sorted.map((i) => i.name)).toEqual(["b", "c", "a"]);
  });

  it("handles equal values", () => {
    const items = [{ value: BigInt(5) }, { value: BigInt(5) }];
    const sorted = items.toSorted(byBigIntDesc((item) => item.value));
    expect(sorted.map((i) => i.value)).toEqual([BigInt(5), BigInt(5)]);
  });

  it("handles single item", () => {
    const items = [{ value: BigInt(42) }];
    const sorted = items.toSorted(byBigIntDesc((item) => item.value));
    expect(sorted).toEqual([{ value: BigInt(42) }]);
  });

  it("handles empty array", () => {
    const sorted: { value: bigint }[] = [].toSorted(
      byBigIntDesc((item: { value: bigint }) => item.value),
    );
    expect(sorted).toEqual([]);
  });
});

describe("sumByKey", () => {
  it("sums amounts grouped by key", () => {
    const items = [
      { who: "alice", amount: BigInt(100) },
      { who: "bob", amount: BigInt(200) },
      { who: "alice", amount: BigInt(50) },
    ];
    const result = sumByKey(
      items,
      (i) => i.who,
      (i) => i.amount,
    );

    expect(result.get("alice")).toEqual({ total: BigInt(150), count: 2 });
    expect(result.get("bob")).toEqual({ total: BigInt(200), count: 1 });
  });

  it("returns empty map for empty array", () => {
    const result = sumByKey(
      [],
      (i: { k: string }) => i.k,
      (i: { v: bigint }) => i.v,
    );
    expect(result.size).toBe(0);
  });

  it("handles single item", () => {
    const result = sumByKey(
      [{ key: "x", amount: BigInt(99) }],
      (i) => i.key,
      (i) => i.amount,
    );
    expect(result.get("x")).toEqual({ total: BigInt(99), count: 1 });
  });

  it("tracks count correctly with many entries", () => {
    const items = Array.from({ length: 5 }, () => ({ key: "same", amount: BigInt(10) }));
    const result = sumByKey(
      items,
      (i) => i.key,
      (i) => i.amount,
    );
    expect(result.get("same")).toEqual({ total: BigInt(50), count: 5 });
  });
});

describe("getTabNavIndex", () => {
  const total = 4;

  it("ArrowLeft from first wraps to last", () => {
    expect(getTabNavIndex("ArrowLeft", 0, total)).toBe(3);
  });

  it("ArrowLeft from middle goes back one", () => {
    expect(getTabNavIndex("ArrowLeft", 2, total)).toBe(1);
  });

  it("ArrowRight from last wraps to first", () => {
    expect(getTabNavIndex("ArrowRight", 3, total)).toBe(0);
  });

  it("ArrowRight from middle goes forward one", () => {
    expect(getTabNavIndex("ArrowRight", 1, total)).toBe(2);
  });

  it("Home returns 0", () => {
    expect(getTabNavIndex("Home", 2, total)).toBe(0);
  });

  it("End returns last index", () => {
    expect(getTabNavIndex("End", 0, total)).toBe(3);
  });

  it("unrecognized key returns null", () => {
    expect(getTabNavIndex("Enter", 1, total)).toBeNull();
    expect(getTabNavIndex("Tab", 0, total)).toBeNull();
  });
});
