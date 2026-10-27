/** Jour calendaire choisi par l'utilisateur -> minuit UTC de ce jour (indépendant du fuseau). */
export function toDateOnlyIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString();
}

/** Chaîne ISO du serveur -> Date locale du même jour calendaire, pour le datepicker. */
export function fromDateOnlyIso(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
