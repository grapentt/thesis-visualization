// The evidence ledger (A22, MVP subset): every logged number a scene draws comes from here, with its
// budget, seeds, molecule count, floor and source, so a scene cannot show a trained number without
// its budget chip. DOM-free; the drawing side is src/draw/thesis/evidence.js.

import ledger from '../../data/thesis/ledger.json' with { type: 'json' };

const rows = new Map(ledger.rows.map((r) => [r.id, Object.freeze(r)]));

/** The ledger row with this id; throws for an unknown id so a typo cannot pass silently. */
export function ev(id) {
  const row = rows.get(id);
  if (!row) throw new Error(`ledger: no row "${id}"`);
  return row;
}

export const ledgerIds = () => [...rows.keys()];

/** "190,350 upd (10%) · s2/s3 · 100k mol · floor 0.006 Å · #1088": the chip every trained number carries. */
export function budgetChip(row) {
  const parts = [];
  if (row.budget) parts.push(ledger.budgets[row.budget].label);
  if (row.seeds) parts.push(row.seeds);
  if (row.N) parts.push(`${row.N >= 1000 ? `${row.N / 1000}k` : row.N} mol`);
  if (row.floor !== undefined) parts.push(`floor ${row.floor} ${row.unit}`.trim());
  parts.push(row.source);
  return parts.join(' · ');
}

/**
 * Words that claim foresight need a record that the claim was declared first: "predicted" is
 * refused unless the row has a declared_before date.
 */
export function claimWord(row, word) {
  if (/predict/i.test(word) && !row.declared_before) throw new Error(`ledger: "${row.id}" has no declared_before; it cannot be called "${word}"`);
  return word;
}

/** Numbers as the programme prints them: true minus, no more digits than the source. */
export function num(v, digits) {
  if (digits === undefined) {
    const s = String(v);
    return s.startsWith('-') ? `−${s.slice(1)}` : s;
  }
  const s = Math.abs(v).toFixed(digits);
  return (v < 0 && Number(s) !== 0 ? '−' : '') + s;
}

/** "0.117 / 0.091" for per-seed pairs. */
export const seeds = (values) => values.map((v) => num(v)).join(' / ');

/** Thousands separators, e.g. 1428 → "1,428". */
export const thousands = (v) => Math.round(v).toLocaleString('en-US');
