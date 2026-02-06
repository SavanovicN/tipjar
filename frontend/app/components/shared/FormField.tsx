import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldHint } from "./FieldHint";

interface FormFieldProps {
  id: string;
  errorId: string;
  descriptionId: string;
  label: string;
  description: string;
  placeholder: string;
  value: string;
  error: string | undefined;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  type?: string;
  step?: string;
  min?: string;
  className?: string;
  inputMode?: "text" | "decimal" | "numeric";
  autoComplete?: string;
  spellCheck?: boolean;
  suffix?: React.ReactNode;
}

export function FormField({
  id,
  errorId,
  descriptionId,
  label,
  description,
  placeholder,
  value,
  error,
  disabled,
  onChange,
  onBlur,
  type = "text",
  step,
  min,
  className,
  inputMode,
  autoComplete,
  spellCheck,
  suffix,
}: FormFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={type}
          step={step}
          min={min}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : descriptionId}
          disabled={disabled}
          className={`h-12 ${className ?? ""}`}
          inputMode={inputMode}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
        />
        {suffix && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4"
            aria-hidden="true"
          >
            {suffix}
          </div>
        )}
      </div>
      <FieldHint
        error={error}
        errorId={errorId}
        descriptionId={descriptionId}
        description={description}
      />
    </Field>
  );
}
