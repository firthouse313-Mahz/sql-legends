import { useCallback, useEffect, useRef, useState } from 'react';
import { createPlayer, stepPhysics, PLAYER_W, PLAYER_H, type PlayerState, type Rect } from './physics';
import { buildLevel } from './levelLayout';
import type { Mission } from '../curriculum/missions';
import type { Activity } from '../curriculum/activities';
import { ActivityModal } from '../ui/ActivityModal';
import './platformer.css';

export function PlatformLevel({
  mission,
  worldAccent,
  onComplete,
  onExit,
}: {
  mission: Mission;
  worldAccent: string;
  onComplete: (result: { xp: number; coins: number }) => void;
  onExit: () => void;
}) {
  const layout = useRef(buildLevel(mission)).current;
  const playerRef = useRef<PlayerState>(createPlayer(40));
  const inputRef = useRef({ left: false, right: false, jump: false });
  const [, forceRender] = useState(0);
  const [cameraX, setCameraX] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState<Set<string>>(new Set());
  const [solvedBlocks, setSolvedBlocks] = useState<Set<number>>(new Set());
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [castleOpen, setCastleOpen] = useState(false);
  const [completedOnce, setCompletedOnce] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportW = rootRef.current?.clientWidth ?? 900;

  const allSolved = solvedBlocks.size === mission.activities.length;

  useEffect(() => {
    if (allSolved) setCastleOpen(true);
  }, [allSolved]);

  // ---- keyboard input ----
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (activeBlock !== null) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = true;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.jump = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = false;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.jump = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [activeBlock]);

  // ---- game loop ----
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const allPlatforms: Rect[] = [...layout.groundPlatforms, ...layout.floatingPlatforms];

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (activeBlock === null) {
        const p = playerRef.current;
        const next = stepPhysics(p, dt, inputRef.current, allPlatforms, layout.width);
        playerRef.current = next;

        // Coin collection.
        setCoinsCollected((prev) => {
          let changed = false;
          const nextSet = new Set(prev);
          for (const coin of layout.coins) {
            if (nextSet.has(coin.id)) continue;
            const dx = Math.abs(coin.x - next.x);
            const dy = Math.abs(coin.y + 13 - next.y - PLAYER_H / 2);
            if (dx < 26 && dy < 30) {
              nextSet.add(coin.id);
              changed = true;
            }
          }
          return changed ? nextSet : prev;
        });

        // Question block touch.
        for (const block of layout.questionBlocks) {
          if (solvedBlocks.has(block.activityIndex)) continue;
          const dx = Math.abs(block.x - next.x);
          const dy = Math.abs(block.y + 23 - next.y - PLAYER_H / 2);
          if (dx < 32 && dy < 36) {
            setActiveBlock(block.activityIndex);
            break;
          }
        }

        // Camera follows player, clamped to level bounds.
        const vw = rootRef.current?.clientWidth ?? viewportW;
        const targetCam = Math.max(0, Math.min(layout.width - vw, next.x - vw / 2));
        setCameraX(targetCam);
      }
      forceRender((n) => (n + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlock, solvedBlocks]);

  const handleActivityResolved = useCallback(
    (correct: boolean) => {
      if (!correct) return;
      setActiveBlock((idx) => {
        if (idx !== null) setSolvedBlocks((prev) => new Set(prev).add(idx));
        return null;
      });
    },
    [],
  );

  const handleReachCastle = () => {
    if (!castleOpen || completedOnce) return;
    setCompletedOnce(true);
    onComplete({ xp: mission.rewardXp, coins: mission.rewardCoins });
  };

  // Check castle proximity each render.
  const p = playerRef.current;
  useEffect(() => {
    if (castleOpen && !completedOnce && p.x > layout.castleX - 10) {
      handleReachCastle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const setInput = (key: 'left' | 'right' | 'jump', val: boolean) => {
    inputRef.current[key] = val;
  };

  const activity: Activity | null = activeBlock !== null ? mission.activities[activeBlock] : null;

  return (
    <div className="pf-root" ref={rootRef}>
      <div className="pf-cloud" style={{ width: 110, height: 44, top: 40, left: (200 - cameraX * 0.2) % 2000 }} />
      <div className="pf-cloud" style={{ width: 80, height: 34, top: 90, left: (700 - cameraX * 0.2) % 2000 }} />
      <div className="pf-cloud" style={{ width: 130, height: 50, top: 30, left: (1300 - cameraX * 0.2) % 2000 }} />

      <div className="pf-hud">
        <button className="pf-hud-chip" onClick={onExit} style={{ cursor: 'pointer' }}>
          ← Map
        </button>
        <div className="pf-hud-chip">🪙 {coinsCollected.size}/{layout.coins.length}</div>
        <div className="pf-hud-chip" style={{ background: worldAccent }}>
          {mission.title} · {solvedBlocks.size}/{mission.activities.length}
        </div>
      </div>

      <div className="pf-world" style={{ transform: `translateX(${-cameraX}px)`, width: layout.width }}>
        {layout.groundPlatforms.map((g, i) => (
          <div key={`g${i}`} className="pf-ground" style={{ left: g.x, width: g.w, height: g.h + 40 }} />
        ))}
        {layout.floatingPlatforms.map((f, i) => (
          <div key={`f${i}`} className="pf-platform" style={{ left: f.x, bottom: f.y, width: f.w, height: f.h }} />
        ))}
        {layout.pipes.map((pipe, i) => (
          <div key={`p${i}`} className="pf-pipe" style={{ left: pipe.x, height: pipe.height }} />
        ))}
        {layout.coins.map((coin) => (
          <div
            key={coin.id}
            className={`pf-coin${coinsCollected.has(coin.id) ? ' pf-collected' : ''}`}
            style={{ left: coin.x, bottom: coin.y + 40 }}
          />
        ))}
        {layout.questionBlocks.map((block) => (
          <div
            key={block.activityIndex}
            className={`pf-qblock${solvedBlocks.has(block.activityIndex) ? ' pf-solved' : ''}`}
            style={{ left: block.x - 23, bottom: block.y + 40 }}
          >
            {solvedBlocks.has(block.activityIndex) ? '✓' : '?'}
          </div>
        ))}

        <div className="pf-castle" style={{ left: layout.castleX }}>
          <div className="pf-castle-flag" />
          <div className="pf-castle-tower">
            <div className={`pf-castle-door${castleOpen ? ' pf-open' : ''}`} />
          </div>
        </div>

        <div
          className={`pf-player${p.onGround ? '' : ' pf-air'}${p.running && p.onGround ? ' pf-running' : ''}${p.facing === -1 ? ' pf-facing-left' : ''}`}
          style={{ left: p.x - PLAYER_W / 2, bottom: p.y + 40 }}
        >
          <div className="pf-player-body">
            <div className="pf-player-backpack" />
            <div className="pf-player-head" />
            <div className="pf-player-goggles" />
            <div className="pf-player-torso" />
            <div className="pf-player-leg left" />
            <div className="pf-player-leg right" />
          </div>
        </div>
      </div>

      <div className="pf-controls">
        <div className="pf-dpad">
          <button
            className="pf-btn"
            onPointerDown={() => setInput('left', true)}
            onPointerUp={() => setInput('left', false)}
            onPointerLeave={() => setInput('left', false)}
          >
            ◀
          </button>
          <button
            className="pf-btn"
            onPointerDown={() => setInput('right', true)}
            onPointerUp={() => setInput('right', false)}
            onPointerLeave={() => setInput('right', false)}
          >
            ▶
          </button>
        </div>
        <div className="pf-jumpzone">
          <button
            className="pf-btn pf-btn-jump"
            onPointerDown={() => setInput('jump', true)}
            onPointerUp={() => setInput('jump', false)}
            onPointerLeave={() => setInput('jump', false)}
          >
            JUMP
          </button>
        </div>
      </div>

      {activity && (
        <ActivityModal
          activity={activity}
          onResolved={handleActivityResolved}
        />
      )}
    </div>
  );
}
