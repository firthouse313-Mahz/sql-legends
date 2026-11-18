// The SQL Legends curriculum map, mirroring Python Legends' data-driven
// world/level model (see python-legends/src/curriculum/worlds.ts) so the
// two games share an architecture even though their gameplay and visuals
// are completely different.
//
// `pathway` tags each level for CBSE Computer Science (083) vs Informatics
// Practices (065): 'common' levels are on-syllabus for both, 'cs'/'ip' are
// specific to one. A student's own subject (read from their DigiClass
// class section) filters which 'cs'/'ip'-only levels they see; 'common'
// levels show for everyone. This is a reasonable mapping from the CBSE
// Class XI-XII SQL units, not an independently syllabus-audited one —
// verify against the current official syllabus documents before treating
// level numbering as exam-authoritative.
//
// `implemented` is honest bookkeeping, exactly like Python Legends: only
// World 1 (Database Island) has real, playable levels right now. Worlds
// 2-5 exist here as labelled topic data so the map can show the whole
// curriculum, but they render as locked "coming soon" previews, never as
// empty levels pretending to be real.

export type Pathway = 'common' | 'cs' | 'ip';
/** A student's own chosen subject — never 'common', which is only a level
 *  tag meaning "shown to every pathway". */
export type PathwayChoice = 'cs' | 'ip';

export interface LevelDef {
  /** Stable id, e.g. "w1-l2". */
  id: string;
  worldId: string;
  /** Level number within its world (1-based). */
  localNumber: number;
  /** Level number across the whole curriculum. */
  globalNumber: number;
  topic: string;
  pathway: Pathway;
  /** True once a real platformer level + question set exists. */
  implemented: boolean;
  /** Id into the mission registry, once implemented. */
  missionId?: string;
}

export interface WorldDef {
  id: string;
  name: string;
  tagline: string;
  difficulty: string;
  /** The boss encounter at the end of this world. Name only until the
   *  world's real content exists. */
  bossName: string;
  /** True once this world has real, playable levels. */
  implemented: boolean;
  levels: LevelDef[];
}

export const WORLDS: WorldDef[] = [
  {
    id: 'world-1',
    name: 'Database Island',
    tagline: 'Where every SQL Legend begins.',
    difficulty: 'Beginner',
    bossName: 'The Redundancy Raider',
    implemented: true,
    levels: [
      { id: 'w1-l1', worldId: 'world-1', localNumber: 1, globalNumber: 1, topic: 'What is a database?', pathway: 'common', implemented: true, missionId: 'w1-l1' },
      { id: 'w1-l2', worldId: 'world-1', localNumber: 2, globalNumber: 2, topic: 'Relational databases', pathway: 'common', implemented: true, missionId: 'w1-l2' },
      { id: 'w1-l3', worldId: 'world-1', localNumber: 3, globalNumber: 3, topic: 'Tables, records and fields', pathway: 'common', implemented: true, missionId: 'w1-l3' },
      { id: 'w1-l4', worldId: 'world-1', localNumber: 4, globalNumber: 4, topic: 'Primary keys', pathway: 'common', implemented: true, missionId: 'w1-l4' },
    ],
  },
  {
    id: 'world-2',
    name: 'SQL Starter World',
    tagline: 'Speak your first words of SQL.',
    difficulty: 'Foundation',
    bossName: 'The Syntax Sentinel',
    implemented: false,
    levels: [
      { id: 'w2-l1', worldId: 'world-2', localNumber: 1, globalNumber: 5, topic: 'Introduction to SQL & MySQL', pathway: 'common', implemented: false },
      { id: 'w2-l2', worldId: 'world-2', localNumber: 2, globalNumber: 6, topic: 'Data types', pathway: 'common', implemented: false },
      { id: 'w2-l3', worldId: 'world-2', localNumber: 3, globalNumber: 7, topic: 'Constraints', pathway: 'common', implemented: false },
      { id: 'w2-l4', worldId: 'world-2', localNumber: 4, globalNumber: 8, topic: 'CREATE TABLE', pathway: 'common', implemented: false },
      { id: 'w2-l5', worldId: 'world-2', localNumber: 5, globalNumber: 9, topic: 'ALTER TABLE', pathway: 'common', implemented: false },
      { id: 'w2-l6', worldId: 'world-2', localNumber: 6, globalNumber: 10, topic: 'DROP TABLE', pathway: 'common', implemented: false },
    ],
  },
  {
    id: 'world-3',
    name: 'Query Adventure',
    tagline: 'Ask the database exactly what you need.',
    difficulty: 'Intermediate',
    bossName: 'The Filter Phantom',
    implemented: false,
    levels: [
      { id: 'w3-l1', worldId: 'world-3', localNumber: 1, globalNumber: 11, topic: 'SELECT & DISTINCT', pathway: 'common', implemented: false },
      { id: 'w3-l2', worldId: 'world-3', localNumber: 2, globalNumber: 12, topic: 'WHERE & comparison operators', pathway: 'common', implemented: false },
      { id: 'w3-l3', worldId: 'world-3', localNumber: 3, globalNumber: 13, topic: 'Logical operators', pathway: 'common', implemented: false },
      { id: 'w3-l4', worldId: 'world-3', localNumber: 4, globalNumber: 14, topic: 'BETWEEN & IN', pathway: 'common', implemented: false },
      { id: 'w3-l5', worldId: 'world-3', localNumber: 5, globalNumber: 15, topic: 'LIKE & IS NULL', pathway: 'common', implemented: false },
      { id: 'w3-l6', worldId: 'world-3', localNumber: 6, globalNumber: 16, topic: 'ORDER BY', pathway: 'common', implemented: false },
    ],
  },
  {
    id: 'world-4',
    name: 'Function Mountain',
    tagline: 'Climb through every built-in SQL function.',
    difficulty: 'Advanced',
    bossName: 'The Aggregate Avalanche',
    implemented: false,
    levels: [
      { id: 'w4-l1', worldId: 'world-4', localNumber: 1, globalNumber: 17, topic: 'Aggregate functions: COUNT, SUM, AVG, MIN, MAX', pathway: 'common', implemented: false },
      { id: 'w4-l2', worldId: 'world-4', localNumber: 2, globalNumber: 18, topic: 'String functions', pathway: 'common', implemented: false },
      { id: 'w4-l3', worldId: 'world-4', localNumber: 3, globalNumber: 19, topic: 'Numeric functions', pathway: 'common', implemented: false },
      { id: 'w4-l4', worldId: 'world-4', localNumber: 4, globalNumber: 20, topic: 'Date functions', pathway: 'common', implemented: false },
    ],
  },
  {
    id: 'world-5',
    name: 'Join Castle',
    tagline: 'Bring tables together and conquer the final trials.',
    difficulty: 'Master',
    bossName: 'The Cartesian King',
    implemented: false,
    levels: [
      { id: 'w5-l1', worldId: 'world-5', localNumber: 1, globalNumber: 21, topic: 'GROUP BY & HAVING', pathway: 'common', implemented: false },
      { id: 'w5-l2', worldId: 'world-5', localNumber: 2, globalNumber: 22, topic: 'Joins', pathway: 'common', implemented: false },
      // Subqueries are explicit CBSE CS (083) content; IP (065) touches them
      // far more lightly, so this level is CS-only until verified otherwise.
      { id: 'w5-l3', worldId: 'world-5', localNumber: 3, globalNumber: 23, topic: 'Subqueries', pathway: 'cs', implemented: false },
    ],
  },
];

export function getWorld(worldId: string): WorldDef | undefined {
  return WORLDS.find((w) => w.id === worldId);
}

export function getLevel(levelId: string): LevelDef | undefined {
  for (const world of WORLDS) {
    const level = world.levels.find((l) => l.id === levelId);
    if (level) return level;
  }
  return undefined;
}

export function levelsForPathway(world: WorldDef, pathway: PathwayChoice): LevelDef[] {
  return world.levels.filter((l) => l.pathway === 'common' || l.pathway === pathway);
}

export function getNextPlayableLevel(levelId: string, pathway: PathwayChoice): LevelDef | undefined {
  const world = WORLDS.find((w) => w.levels.some((l) => l.id === levelId));
  if (!world) return undefined;
  const list = levelsForPathway(world, pathway);
  const idx = list.findIndex((l) => l.id === levelId);
  const next = list[idx + 1];
  return next && next.implemented && next.missionId ? next : undefined;
}
