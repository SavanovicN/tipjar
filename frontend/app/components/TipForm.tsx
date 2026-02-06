"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useId } from "react";
import { BalanceDisplay } from "@/app/components/shared/BalanceDisplay";
import { FormField } from "@/app/components/shared/FormField";
import { SubmitButton } from "@/app/components/shared/SubmitButton";
import { addressSchema, amountSchema } from "@/lib/validation";

function extractError(raw: unknown): string | undefined {
  if (!raw) {
    return;
  }

  return typeof raw === "string" ? raw : (raw as Error)?.message;
}

interface TipFormProps {
  isConnected: boolean;
  isBusy: boolean;
  statusLabel: string;
  srText?: string;
  currencySymbol: string | undefined;
  networkName: string | undefined;
  balance: number;
  balanceFormatted: string;
  onSubmit: (creatorAddress: string, amount: string) => void;
}

export function TipForm({
  isConnected,
  isBusy,
  statusLabel,
  srText,
  currencySymbol,
  networkName,
  balance,
  balanceFormatted,
  onSubmit,
}: TipFormProps) {
  const formId = useId();
  const addressInputId = `${formId}-creator-address`;
  const addressDescId = `${formId}-creator-address-desc`;
  const addressErrorId = `${formId}-creator-address-error`;
  const amountInputId = `${formId}-tip-amount`;
  const amountDescId = `${formId}-tip-amount-desc`;
  const amountErrorId = `${formId}-tip-amount-error`;

  const form = useForm({
    defaultValues: { creatorAddress: "", amount: "" },
    onSubmit: async ({ value }) => {
      onSubmit(value.creatorAddress, value.amount);
    },
  });

  const amountValue = useStore(form.store, (state) => state.values.amount);
  const insufficientFunds = (parseFloat(amountValue) || 0) > balance;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
      aria-label="Send tip form"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Tip a Creator</h2>
        <p className="text-sm text-muted-foreground">
          Send {currencySymbol} directly to support your favorite creators
        </p>
      </div>

      <BalanceDisplay
        balance={balanceFormatted}
        currencySymbol={currencySymbol}
        insufficientFunds={insufficientFunds}
      />

      <form.Field name="creatorAddress" validators={{ onBlur: addressSchema }}>
        {(field) => {
          const error = extractError(field.state.meta.errors?.[0]);
          return (
            <FormField
              id={addressInputId}
              errorId={addressErrorId}
              descriptionId={addressDescId}
              label="Creator Address"
              description="Enter the wallet address of the creator you want to tip"
              placeholder="0x..."
              value={field.state.value}
              error={error}
              disabled={!isConnected || isBusy}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              className="font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />
          );
        }}
      </form.Field>

      <form.Field name="amount" validators={{ onBlur: amountSchema }}>
        {(field) => {
          const zodError = extractError(field.state.meta.errors?.[0]);
          const fundsError =
            insufficientFunds && field.state.meta.isTouched
              ? `Insufficient funds. You have ${balanceFormatted} ${currencySymbol ?? ""} available.`
              : null;
          const error = fundsError || zodError;

          return (
            <FormField
              id={amountInputId}
              errorId={amountErrorId}
              descriptionId={amountDescId}
              label="Tip Amount"
              description={`Minimum tip: 0.001 ${currencySymbol}`}
              type="number"
              step="0.001"
              min="0.001"
              placeholder="0.001"
              value={field.state.value}
              error={error}
              disabled={!isConnected || isBusy}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              className="pr-16"
              inputMode="decimal"
              suffix={
                <span className="text-sm font-medium text-muted-foreground">{currencySymbol}</span>
              }
            />
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <SubmitButton
            isConnected={isConnected}
            isBusy={isBusy}
            disabled={!canSubmit || isSubmitting || isBusy || insufficientFunds}
            label={statusLabel}
          />
        )}
      </form.Subscribe>

      <div className="sr-only" role="status" aria-live="polite">
        {srText}
      </div>

      <p className="text-center text-xs text-muted-foreground">Transactions are on {networkName}</p>
    </form>
  );
}
