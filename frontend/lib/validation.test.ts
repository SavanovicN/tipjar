import { describe, expect, it } from "vitest";
import {
  addressSchema,
  amountSchema,
  isValidAddress,
  isValidAmount,
  tipFormSchema,
} from "./validation";

describe("isValidAddress", () => {
  it("accepts valid checksummed address", () => {
    expect(isValidAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")).toBe(true);
  });

  it("accepts valid lowercase address", () => {
    expect(isValidAddress("0x70997970c51812dc3a010c7d01b50e0d17dc79c8")).toBe(true);
  });

  it("rejects address without 0x prefix", () => {
    expect(isValidAddress("70997970C51812dc3A010C7d01b50e0d17dc79C8")).toBe(false);
  });

  it("rejects too short address", () => {
    expect(isValidAddress("0x1234")).toBe(false);
  });

  it("rejects too long address", () => {
    expect(isValidAddress(`0x${"a".repeat(41)}`)).toBe(false);
  });

  it("rejects address with invalid characters", () => {
    expect(isValidAddress(`0x${"g".repeat(40)}`)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAddress("")).toBe(false);
  });
});

describe("isValidAmount", () => {
  it("accepts positive integer", () => {
    expect(isValidAmount("5")).toBe(true);
  });

  it("accepts positive decimal", () => {
    expect(isValidAmount("0.001")).toBe(true);
  });

  it("accepts large amount", () => {
    expect(isValidAmount("1000000")).toBe(true);
  });

  it("rejects zero", () => {
    expect(isValidAmount("0")).toBe(false);
  });

  it("rejects negative number", () => {
    expect(isValidAmount("-1")).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(isValidAmount("abc")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAmount("")).toBe(false);
  });
});

describe("addressSchema", () => {
  it("passes for valid address", () => {
    const result = addressSchema.safeParse("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    expect(result.success).toBe(true);
  });

  it("fails for empty string with required message", () => {
    const result = addressSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Address is required");
    }
  });

  it("fails for invalid format with format message", () => {
    const result = addressSchema.safeParse("not-an-address");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("valid wallet address"))).toBe(
        true,
      );
    }
  });
});

describe("amountSchema", () => {
  it("passes for valid amount", () => {
    const result = amountSchema.safeParse("1.5");
    expect(result.success).toBe(true);
  });

  it("fails for empty string", () => {
    const result = amountSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("fails for non-numeric string", () => {
    const result = amountSchema.safeParse("abc");
    expect(result.success).toBe(false);
  });

  it("fails for zero", () => {
    const result = amountSchema.safeParse("0");
    expect(result.success).toBe(false);
  });
});

describe("tipFormSchema", () => {
  it("passes with valid address and amount", () => {
    const result = tipFormSchema.safeParse({
      creatorAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amount: "1.0",
    });
    expect(result.success).toBe(true);
  });

  it("fails when address is missing", () => {
    const result = tipFormSchema.safeParse({ amount: "1.0" });
    expect(result.success).toBe(false);
  });

  it("fails when amount is missing", () => {
    const result = tipFormSchema.safeParse({
      creatorAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    });
    expect(result.success).toBe(false);
  });

  it("fails when both fields are invalid", () => {
    const result = tipFormSchema.safeParse({
      creatorAddress: "bad",
      amount: "bad",
    });
    expect(result.success).toBe(false);
  });
});
