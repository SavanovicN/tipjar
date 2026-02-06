import { z } from "zod";

/**
 * Ethereum address validation regex
 */
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Zod schema for Ethereum address
 */
export const addressSchema = z
  .string()
  .min(1, "Address is required")
  .regex(ETH_ADDRESS_REGEX, "Please enter a valid wallet address (0x...)");

/**
 * Zod schema for tip amount
 */
export const amountSchema = z
  .string()
  .min(1, "Amount is required")
  .refine((val) => !Number.isNaN(parseFloat(val)), "Please enter a valid number")
  .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0");

/**
 * Zod schema for the tip form
 */
export const tipFormSchema = z.object({
  creatorAddress: addressSchema,
  amount: amountSchema,
});

export type TipFormValues = z.infer<typeof tipFormSchema>;

/**
 * Validates an Ethereum address format.
 * @param address - The address string to validate
 * @returns true if the address is a valid Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return ETH_ADDRESS_REGEX.test(address);
}

/**
 * Validates a positive numeric amount.
 * @param amount - The amount string to validate
 * @returns true if the amount is a valid positive number
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !Number.isNaN(num) && num > 0;
}
