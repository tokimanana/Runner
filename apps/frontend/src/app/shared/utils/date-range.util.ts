import { AbstractControl, ValidationErrors } from '@angular/forms';

export function isValidDateRange(start: Date, end: Date): boolean {
  return end > start;
}

export function dateRangeValidator(
  group: AbstractControl
): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;
  if (!start || !end) return null;
  return isValidDateRange(new Date(start), new Date(end))
    ? null
    : { dateRange: true };
}

export function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && startB < endA;
}
