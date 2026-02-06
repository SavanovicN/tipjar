import { FieldDescription, FieldError } from "@/components/ui/field";

export function FieldHint({
  error,
  errorId,
  descriptionId,
  description,
}: {
  error: string | undefined;
  errorId: string;
  descriptionId: string;
  description: string;
}) {
  if (error) {
    return (
      <FieldError id={errorId} role="alert" aria-live="assertive">
        {error}
      </FieldError>
    );
  }
  return <FieldDescription id={descriptionId}>{description}</FieldDescription>;
}
