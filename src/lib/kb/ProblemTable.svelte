<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // tickets: problem → its own issue URL. A problem with no entry has no ticket yet.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const WHAT: Record<Problem, string> = {
    parser: 'shared parser reads day-first dates month first',
    hint: 'booking-v3 form hints MM/DD/YYYY to day-first tenants',
    shift: 'date moves by one day (time zone), not a month flip',
    unplaced: 'no tenant on file, or tenant writes month first',
  };

  const split = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const issue = (url: string) => `#${url.split('/').pop()}`;
</script>

<p class="sum">
  <strong>{split.total}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>what it is</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{WHAT[g.problem]}</td>
        <td>{g.reports}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{issue(tickets[g.problem]!)}</a>{:else}<span class="none">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .none { color: var(--warn); font-weight: 600; }
</style>
