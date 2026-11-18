// A real, live SQLite database in the browser via sql.js (SQLite compiled
// to WebAssembly) — the same role Pyodide plays in Python Legends: letting
// a `write`-type activity (activities.ts) actually run the student's SQL
// and check the real result, instead of just pattern-matching the text
// they typed.

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let initPromise: Promise<void> | null = null;

// One shared seed database every World 1-5 level/boss query runs against —
// a small CBSE-textbook-style "Student" table. More tables (Books, Club,
// Employee, …) get added here as later worlds are built; keeping the seed
// in one place means every level's expected-result queries stay in sync
// with the same live data.
const SEED_SQL = `
CREATE TABLE Student (
  RollNo INTEGER PRIMARY KEY,
  Name TEXT NOT NULL,
  Class INTEGER NOT NULL,
  Section TEXT NOT NULL,
  Marks INTEGER
);
INSERT INTO Student (RollNo, Name, Class, Section, Marks) VALUES
  (1, 'Aisha Rahman', 11, 'A', 88),
  (2, 'Kabir Singh', 11, 'A', 76),
  (3, 'Zara Khan', 11, 'B', 91),
  (4, 'Rohan Mehta', 12, 'A', 65),
  (5, 'Meera Iyer', 12, 'B', 94);
`;

async function ensureInit(): Promise<void> {
  if (db) return;
  if (!initPromise) {
    initPromise = (async () => {
      SQL = await initSqlJs({
        // Vite serves the project under /sql-legends/ on GitHub Pages
        // (see vite.config.ts) — import.meta.env.BASE_URL already carries
        // that prefix, so this resolves correctly in both dev and prod.
        locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`,
      });
      db = new SQL.Database();
      db.run(SEED_SQL);
    })();
  }
  return initPromise;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
}

// sql.js can technically return BLOB columns as Uint8Array; none of our
// seed data uses them, but this keeps a stray blob from crashing the UI —
// it just renders as a short placeholder string instead.
function toCellValue(v: string | number | Uint8Array | null): string | number | null {
  return v instanceof Uint8Array ? `<binary:${v.length}b>` : v;
}

export interface QueryOutcome {
  ok: boolean;
  result?: QueryResult;
  error?: string;
}

function runRaw(sql: string): QueryOutcome {
  if (!db) return { ok: false, error: 'The database engine is still starting up — try again in a moment.' };
  try {
    const res = db.exec(sql);
    if (res.length === 0) return { ok: true, result: { columns: [], rows: [] } };
    const { columns, values } = res[0];
    return { ok: true, result: { columns, rows: values.map((row) => row.map(toCellValue)) } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function sameResultSet(a: QueryResult, b: QueryResult): boolean {
  if (a.columns.length !== b.columns.length) return false;
  if (a.rows.length !== b.rows.length) return false;
  const norm = (rows: (string | number | null)[][]) =>
    rows.map((r) => r.map((v) => String(v)).join('\u0001')).sort();
  const an = norm(a.rows);
  const bn = norm(b.rows);
  return an.every((v, i) => v === bn[i]);
}

export const sqlEngine = {
  /** Call once, early (e.g. on the World Map), so the wasm module is warm
   *  by the time a student reaches a `write` activity. Safe to call many
   *  times — later calls just resolve once the first init finishes. */
  init(): Promise<void> {
    return ensureInit();
  },

  isReady(): boolean {
    return db !== null;
  },

  /** Runs arbitrary student SQL against the shared seed database. Never
   *  throws — a bad query comes back as `{ ok: false, error }` so the UI
   *  can show it as a normal "that didn't run" result, not a crash. */
  run(sql: string): QueryOutcome {
    return runRaw(sql);
  },

  /** Runs the student's query and the mission's expected query, and
   *  reports whether the two result sets match (column count, row count,
   *  and row contents — order-insensitive, since CBSE doesn't expect
   *  ORDER BY unless a level is specifically teaching it). */
  checkAgainstExpected(studentSql: string, expectedSql: string): { outcome: QueryOutcome; correct: boolean } {
    const outcome = runRaw(studentSql);
    if (!outcome.ok || !outcome.result) return { outcome, correct: false };
    const expected = runRaw(expectedSql);
    if (!expected.ok || !expected.result) return { outcome, correct: false };
    return { outcome, correct: sameResultSet(outcome.result, expected.result) };
  },
};
