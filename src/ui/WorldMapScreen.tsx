import { useSyncExternalStore } from 'react';
import { WORLDS, levelsForPathway, type LevelDef, type WorldDef } from '../curriculum/worlds';
import { progressService, type LevelStatus } from '../progress/progressService';
import { Emblem } from './Emblem';
import './worldmap.css';

// progressService is a plain external store (subscribe/getSnapshot), not
// React state — it's shared with accountService's backend hydrate and must
// survive screen changes. useSyncExternalStore is what re-renders this
// screen when a hydrate() or completeLevel() happens anywhere else in the
// app, not just when App.tsx's own state changes.
function useProgressTick() {
  return useSyncExternalStore(
    (onChange) => progressService.subscribe(onChange),
    () => progressService.getStoreState(),
  );
}

const WORLD_ACCENTS: Record<string, { a: string; b: string; icon: string }> = {
  'world-1': { a: '#2fae4a', b: '#7de37d', icon: '🏝️' },
  'world-2': { a: '#3f6fe0', b: '#6fa0ff', icon: '🧪' },
  'world-3': { a: '#9b59f5', b: '#c89bff', icon: '🗺️' },
  'world-4': { a: '#f5a623', b: '#ffce5c', icon: '⛰️' },
  'world-5': { a: '#e8463f', b: '#ff8a80', icon: '🏰' },
};

export function WorldMapScreen({
  studentName,
  onPlayLevel,
  onPlayBoss,
  onOpenDashboard,
}: {
  studentName: string;
  onPlayLevel: (level: LevelDef) => void;
  onPlayBoss: (world: WorldDef) => void;
  onOpenDashboard: () => void;
}) {
  useProgressTick();
  const pathway = progressService.getPathway();
  const overall = progressService.getOverallProgress();

  return (
    <div className="wm-root">
      <header className="wm-top">
        <div className="wm-brand"><Emblem size={26} /> <span>SQL</span> Legends</div>
        <div className="wm-top-right">
          <div className="wm-pathway">
            {(['cs', 'ip'] as const).map((p) => (
              <button
                key={p}
                className={`wm-pathway-btn${pathway === p ? ' on' : ''}`}
                onClick={() => progressService.setPathway(p)}
              >
                {p === 'cs' ? 'CS (083)' : 'IP (065)'}
              </button>
            ))}
          </div>
          <button className="wm-chip" onClick={onOpenDashboard}>📊 My Progress</button>
          <div className="wm-chip">👋 {studentName}</div>
        </div>
      </header>

      <div className="wm-overall">
        <div className="wm-overall-bar">
          <div className="wm-overall-fill" style={{ width: `${overall.total ? (overall.completed / overall.total) * 100 : 0}%` }} />
        </div>
        <span>{overall.completed}/{overall.total} levels cleared</span>
        <span className="wm-coin-total">🪙 {progressService.getTotalCoins()} · ⭐ {progressService.getTotalXp()} XP</span>
      </div>

      <div className="wm-worlds">
        {WORLDS.map((world, idx) => (
          <WorldCard
            key={world.id}
            world={world}
            pathway={pathway}
            index={idx}
            onPlayLevel={onPlayLevel}
            onPlayBoss={onPlayBoss}
          />
        ))}
      </div>
    </div>
  );
}

function WorldCard({
  world,
  pathway,
  index,
  onPlayLevel,
  onPlayBoss,
}: {
  world: WorldDef;
  pathway: 'cs' | 'ip';
  index: number;
  onPlayLevel: (level: LevelDef) => void;
  onPlayBoss: (world: WorldDef) => void;
}) {
  const accent = WORLD_ACCENTS[world.id] ?? WORLD_ACCENTS['world-1'];
  const levels = levelsForPathway(world, pathway);
  const { completed, total } = progressService.getWorldProgress(world);
  const bossUnlocked = progressService.isBossUnlocked(world);
  const bossCleared = progressService.isBossCleared(world.id);

  if (!world.implemented) {
    return (
      <section className="wm-world wm-locked" style={{ ['--a' as any]: accent.a, ['--b' as any]: accent.b }}>
        <div className="wm-world-head">
          <span className="wm-world-icon">🔒</span>
          <div>
            <h2>{accent.icon} World {index + 1}: {world.name}</h2>
            <p className="wm-tagline">{world.tagline}</p>
          </div>
        </div>
        <p className="wm-coming">Coming soon — topics you'll meet here:</p>
        <ul className="wm-topic-list">
          {levels.map((l) => <li key={l.id}>{l.topic}</li>)}
        </ul>
      </section>
    );
  }

  return (
    <section className="wm-world wm-open" style={{ ['--a' as any]: accent.a, ['--b' as any]: accent.b }}>
      <div className="wm-world-head">
        <span className="wm-world-icon">{accent.icon}</span>
        <div>
          <h2>World {index + 1}: {world.name}</h2>
          <p className="wm-tagline">{world.tagline}</p>
        </div>
        <div className="wm-world-progress">{completed}/{total}</div>
      </div>
      <div className="wm-path">
        {levels.map((level) => {
          const status = progressService.getLevelStatus(level);
          return <LevelNode key={level.id} level={level} status={status} onPlay={() => onPlayLevel(level)} />;
        })}
        <BossNode world={world} unlocked={bossUnlocked} cleared={bossCleared} onPlay={() => onPlayBoss(world)} />
      </div>
    </section>
  );
}

function LevelNode({ level, status, onPlay }: { level: LevelDef; status: LevelStatus; onPlay: () => void }) {
  const locked = status === 'locked' || status === 'coming_soon';
  return (
    <button className={`wm-node wm-node-${status}`} onClick={onPlay} disabled={locked}>
      <span className="wm-node-num">{status === 'completed' ? '★' : locked ? '🔒' : level.localNumber}</span>
      <span className="wm-node-topic">{level.topic}</span>
    </button>
  );
}

function BossNode({ world, unlocked, cleared, onPlay }: { world: WorldDef; unlocked: boolean; cleared: boolean; onPlay: () => void }) {
  return (
    <button className={`wm-boss ${cleared ? 'wm-boss-cleared' : unlocked ? 'wm-boss-ready' : 'wm-boss-locked'}`} onClick={onPlay} disabled={!unlocked}>
      <span className="wm-boss-icon">{cleared ? '🏆' : unlocked ? '👹' : '🔒'}</span>
      <span>{world.bossName}</span>
    </button>
  );
}
