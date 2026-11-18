// The activity model that every SQL Legends level is built from — the game
// brief's "every level must contain" list, implemented as six concrete
// interaction kinds. "Write a query" and "execute and verify" are combined
// into one `write` activity: in practice a student writing a query and
// running it against the live database is a single interaction, not two.
//
// World 1 (Database Island) is pre-SQL-syntax by design — it teaches what
// a database/table/record/field/primary key *is*, before World 2 teaches
// the SQL language itself — so most World 1 levels use concept/predict/
// arrange/find-error/complete, with one guided `write` demo at the very
// end of World 1 (level 4) that lets a student run their first real query
// against the database they'll use throughout the game, as a preview of
// what's coming in World 2.

import type { Pathway } from './worlds';

export type ActivityKind = 'concept' | 'predict' | 'arrange' | 'find-error' | 'complete' | 'write';

interface ActivityBase {
  id: string;
  kind: ActivityKind;
  /** CBSE board-style tag shown in the UI, e.g. "CBSE 083 · Very Short Answer". */
  examTag?: string;
  pathway: Pathway;
}

export interface ConceptActivity extends ActivityBase {
  kind: 'concept';
  title: string;
  body: string[];
  /** Small table/diagram shown alongside the text, if any. */
  table?: { columns: string[]; rows: (string | number)[][] };
}

export interface PredictActivity extends ActivityBase {
  kind: 'predict';
  prompt: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ArrangeActivity extends ActivityBase {
  kind: 'arrange';
  prompt: string;
  /** Tokens in scrambled order; the student taps them into the answer strip. */
  tokens: string[];
  correctOrder: number[];
  explanation: string;
}

export interface FindErrorActivity extends ActivityBase {
  kind: 'find-error';
  prompt: string;
  snippet: string[];
  /** Index into `snippet` of the faulty line. */
  errorIndex: number;
  explanation: string;
}

export interface CompleteActivity extends ActivityBase {
  kind: 'complete';
  prompt: string;
  template: string; // contains a single "____" placeholder
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WriteActivity extends ActivityBase {
  kind: 'write';
  prompt: string;
  starter: string;
  /** Expected result, compared (order-insensitive, by row contents) against
   *  what the student's query actually returns when run through sql.js. */
  expectedSql: string;
  hint: string;
}

export type Activity =
  | ConceptActivity
  | PredictActivity
  | ArrangeActivity
  | FindErrorActivity
  | CompleteActivity
  | WriteActivity;
