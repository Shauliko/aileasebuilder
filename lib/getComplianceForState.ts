import { STATE_CLAUSES } from "./stateClauses";

export function getComplianceForState(state: string) {
  const code = state.toUpperCase();
  return STATE_CLAUSES[code] || STATE_CLAUSES.DEFAULT;
}
