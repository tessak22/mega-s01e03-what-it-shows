// What #4471 actually holds: one row per problem, not per subject line. Pages explain it; this file is what runs.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

// `parser` and `hint` are the desk's causes (causes.ts), counted the desk's way: by tenant.
// `shift` is the desk's own reading (desk-notes.json oneDayMove): the date lands one day off, not
// month-for-day. Like the desk's view, those reports stay counted where they're filed and are
// footnoted there; `shift` counts them again as the problem they are.
export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For a cause row: how many of its reports are also counted under `shift`.
  alsoShift: number;
  // For the `shift` row: which cause rows its reports are filed under.
  filedUnder: Problem[];
};

export function groupByProblem(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { total: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const causes = groupByCause(merged, tenantOf);
  const span = (rs: Report[]) => {
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return { tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
  };
  const groups: ProblemGroup[] = causes.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    ...span(g.reports),
    alsoShift: readAs(g, oneDayMove),
    filedUnder: [],
  }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    groups.push({
      problem: 'shift',
      reports: moved.length,
      ...span(moved),
      alsoShift: 0,
      filedUnder: causes.filter((g) => readAs(g, oneDayMove)).map((g) => g.cause),
    });
  }
  return { total: merged.length, groups };
}
