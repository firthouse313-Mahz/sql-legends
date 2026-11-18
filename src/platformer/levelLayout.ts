import type { Rect } from './physics';
import type { Mission } from '../curriculum/missions';

export interface QuestionBlock {
  activityIndex: number;
  x: number;
  y: number; // height of the block above the ground platform it sits near
}

export interface CoinSpot {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface LevelLayout {
  width: number;
  groundPlatforms: Rect[];
  floatingPlatforms: Rect[];
  pipes: { x: number; height: number }[];
  questionBlocks: QuestionBlock[];
  coins: CoinSpot[];
  castleX: number;
}

const SEGMENT_WIDTH = 520;

/** Builds a procedurally laid-out, but deterministic, level from a
 *  mission's activity list — one question block per activity, spaced into
 *  its own "segment" of the level so the camera reveals them one at a
 *  time as the student walks right, with a few floating platforms and
 *  coins around each for jump variety, and a castle door at the far end. */
export function buildLevel(mission: Mission): LevelLayout {
  const n = mission.activities.length;
  const width = 260 + n * SEGMENT_WIDTH + 400;

  const groundPlatforms: Rect[] = [{ x: 0, y: 0, w: width, h: 40 }];
  const floatingPlatforms: Rect[] = [];
  const pipes: { x: number; height: number }[] = [];
  const questionBlocks: QuestionBlock[] = [];
  const coins: CoinSpot[] = [];

  mission.activities.forEach((_, i) => {
    const segStart = 260 + i * SEGMENT_WIDTH;
    const blockX = segStart + 160;
    const blockY = 150 + (i % 2 === 0 ? 0 : 40);
    questionBlocks.push({ activityIndex: i, x: blockX, y: blockY });

    // A short run of floating platforms leading up to / away from the
    // block, alternating height so the walk has some vertical rhythm.
    floatingPlatforms.push({ x: segStart + 40, y: 90, w: 100, h: 22 });
    floatingPlatforms.push({ x: blockX - 10, y: blockY - 56, w: 120, h: 22 });
    floatingPlatforms.push({ x: segStart + 340, y: 130, w: 110, h: 22 });

    if (i % 2 === 1) pipes.push({ x: segStart + 420, height: 70 });

    for (let c = 0; c < 3; c++) {
      coins.push({ id: `${mission.id}-coin-${i}-${c}`, x: segStart + 60 + c * 70, y: 60 + c * 14, collected: false });
    }
  });

  const castleX = width - 220;

  return { width, groundPlatforms, floatingPlatforms, pipes, questionBlocks, coins, castleX };
}
