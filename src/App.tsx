import { useEffect, useState } from 'react';
import { accountService } from './account/accountService';
import { progressService } from './progress/progressService';
import { sqlEngine } from './engine/sqlEngine';
import { LoginScreen } from './ui/LoginScreen';
import { WorldMapScreen } from './ui/WorldMapScreen';
import { ProgressDashboard } from './ui/ProgressDashboard';
import { PlatformLevel } from './platformer/PlatformLevel';
import { MISSIONS, BOSS_MISSION, type Mission } from './curriculum/missions';
import type { LevelDef, WorldDef } from './curriculum/worlds';

type Screen =
  | { name: 'login' }
  | { name: 'map' }
  | { name: 'dashboard' }
  | { name: 'level'; level: LevelDef; mission: Mission }
  | { name: 'boss'; world: WorldDef; mission: Mission };

interface Session {
  name: string;
  sid: string;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = accountService.getSavedIdentity();
    return saved ? { name: saved.name, sid: saved.sid } : null;
  });
  const [screen, setScreen] = useState<Screen>(session ? { name: 'map' } : { name: 'login' });
  const [levelResult, setLevelResult] = useState<{ title: string; xp: number; coins: number } | null>(null);

  // Warm up the SQL engine as soon as a student reaches the map, so it's
  // ready by the time they hit a `write` activity.
  useEffect(() => {
    if (session) sqlEngine.init();
  }, [session]);

  // Hydrate progress from the backend on login, so it follows the student
  // across devices the same way Python Legends does.
  useEffect(() => {
    if (!session) return;
    accountService.loadProgress(session.sid).then((saved) => progressService.hydrate(saved));
  }, [session]);

  const handleLoggedIn = (name: string, sid: string) => {
    setSession({ name, sid });
    setScreen({ name: 'map' });
  };

  const persist = () => {
    if (session) accountService.saveProgress(session.sid, progressService.getSnapshot());
  };

  const playLevel = (level: LevelDef) => {
    const mission = level.missionId ? MISSIONS[level.missionId] : undefined;
    if (!mission) return;
    progressService.markStarted(level.id);
    persist();
    setScreen({ name: 'level', level, mission });
  };

  const playBoss = (world: WorldDef) => {
    // Only World 1's boss is wired to real content right now; others will
    // get their own boss mission once that world is implemented.
    if (world.id !== 'world-1') return;
    setScreen({ name: 'boss', world, mission: BOSS_MISSION });
  };

  if (!session) {
    return <LoginScreen onLoggedIn={handleLoggedIn} />;
  }

  if (screen.name === 'dashboard') {
    return <ProgressDashboard studentName={session.name} onBack={() => setScreen({ name: 'map' })} />;
  }

  if (screen.name === 'level') {
    return (
      <div style={{ position: 'fixed', inset: 0 }}>
        <PlatformLevel
          mission={screen.mission}
          worldAccent="#2fae4a"
          onExit={() => setScreen({ name: 'map' })}
          onComplete={({ xp, coins }) => {
            progressService.completeLevel(screen.level.id, xp, coins);
            persist();
            setLevelResult({ title: screen.mission.title, xp, coins });
          }}
        />
        {levelResult && (
          <LevelCompleteOverlay
            result={levelResult}
            onContinue={() => { setLevelResult(null); setScreen({ name: 'map' }); }}
          />
        )}
      </div>
    );
  }

  if (screen.name === 'boss') {
    return (
      <div style={{ position: 'fixed', inset: 0 }}>
        <PlatformLevel
          mission={screen.mission}
          worldAccent="#e8463f"
          onExit={() => setScreen({ name: 'map' })}
          onComplete={({ xp, coins }) => {
            progressService.clearBoss(screen.world.id, xp, coins);
            persist();
            setLevelResult({ title: `${screen.world.bossName} defeated!`, xp, coins });
          }}
        />
        {levelResult && (
          <LevelCompleteOverlay
            result={levelResult}
            onContinue={() => { setLevelResult(null); setScreen({ name: 'map' }); }}
          />
        )}
      </div>
    );
  }

  return (
    <WorldMapScreen
      studentName={session.name}
      onPlayLevel={playLevel}
      onPlayBoss={playBoss}
      onOpenDashboard={() => setScreen({ name: 'dashboard' })}
    />
  );
}

function LevelCompleteOverlay({ result, onContinue }: { result: { title: string; xp: number; coins: number }; onContinue: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(8,18,34,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
    }}>
      <div style={{
        background: '#fffdf6', borderRadius: 20, border: '4px solid #f5a623',
        padding: '28px 32px', textAlign: 'center', maxWidth: 320,
      }}>
        <div style={{ fontSize: 40 }}>🏁</div>
        <h2 style={{ margin: '6px 0', color: '#152a4a' }}>{result.title} complete!</h2>
        <p style={{ color: '#5c6b8a', fontWeight: 700, margin: '8px 0 18px' }}>+{result.xp} XP · +{result.coins} 🪙</p>
        <button
          onClick={onContinue}
          style={{
            border: 'none', borderRadius: 999, padding: '11px 24px', fontWeight: 800,
            background: 'linear-gradient(180deg, #ffce5c, #f5a623)', color: '#5a3400', cursor: 'pointer',
          }}
        >
          Back to the Map →
        </button>
      </div>
    </div>
  );
}
