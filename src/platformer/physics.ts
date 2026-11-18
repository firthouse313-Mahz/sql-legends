// Minimal AABB platformer physics — deliberately simple and dependency-free
// (no Three.js/R3F here, unlike Python Legends' 3D runner) so SQL Legends
// reads as a completely different kind of game: a classic, player-driven
// 2D side-scroller instead of an auto-running 3D lane runner.

export interface Rect {
  x: number;
  y: number; // measured from the GROUND up — larger y = higher off the ground
  w: number;
  h: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  running: boolean;
}

export const GRAVITY = 1700; // px/s^2
export const MOVE_SPEED = 230; // px/s
export const JUMP_VELOCITY = 620; // px/s
export const PLAYER_W = 40;
export const PLAYER_H = 54;

export function createPlayer(startX: number): PlayerState {
  return { x: startX, y: 0, vx: 0, vy: 0, onGround: true, facing: 1, running: false };
}

function overlapsX(aLeft: number, aRight: number, bLeft: number, bRight: number): boolean {
  return aLeft < bRight && aRight > bLeft;
}

/** Advances the player one physics tick against a fixed list of solid
 *  platform rects. Only vertical (land-on-top) collision is modelled —
 *  enough for floating platforms you jump between, without the edge cases
 *  of full side-collision resolution that classic platformers usually hide
 *  behind years of tuning. */
export function stepPhysics(
  p: PlayerState,
  dt: number,
  input: { left: boolean; right: boolean; jump: boolean },
  platforms: Rect[],
  levelWidth: number,
): PlayerState {
  let { x, y, vx, vy, onGround, facing, running } = p;

  vx = input.left ? -MOVE_SPEED : input.right ? MOVE_SPEED : 0;
  if (vx < 0) facing = -1;
  else if (vx > 0) facing = 1;
  running = vx !== 0;

  if (input.jump && onGround) {
    vy = JUMP_VELOCITY;
    onGround = false;
  }

  vy -= GRAVITY * dt;
  const nextX = Math.max(PLAYER_W / 2, Math.min(levelWidth - PLAYER_W / 2, x + vx * dt));
  let nextY = y + vy * dt;

  const footPrevY = y;
  const footNextY = nextY;
  let landed = false;
  for (const plat of platforms) {
    const platTop = plat.y + plat.h;
    const withinX = overlapsX(nextX - PLAYER_W / 2, nextX + PLAYER_W / 2, plat.x, plat.x + plat.w);
    if (withinX && footPrevY >= platTop && footNextY <= platTop && vy <= 0) {
      nextY = platTop;
      vy = 0;
      landed = true;
    }
  }

  if (nextY <= 0) {
    nextY = 0;
    vy = 0;
    landed = true;
  }

  onGround = landed;
  x = nextX;
  y = nextY;

  return { x, y, vx, vy, onGround, facing, running };
}
