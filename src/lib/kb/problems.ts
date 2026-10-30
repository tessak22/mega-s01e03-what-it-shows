// What #4471 actually holds: one row per problem, not per subject line. Pages explain it; this file is what runs.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

// A problem is one of the desk's causes (causes.ts), counted the desk's way: by tenant. Reports the
// desk read differently (desk-notes.json oneDayMove) stay counted where they're filed and are
// footnoted there, as the incident page does.
export type Problem = Cause | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  oneDayMoves: number;
};

export function groupByProblem(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { total: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf).map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    oneDayMoves: readAs(g, oneDayMove),
  }));
  return { total: merged.length, groups };
}
