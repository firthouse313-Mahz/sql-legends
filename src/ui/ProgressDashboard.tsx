import { WORLDS } from '../curriculum/worlds';
import { progressService } from '../progress/progressService';
import './worldmap.css';
import './dashboard.css';

export function ProgressDashboard({ studentName, onBack }: { studentName: string; onBack: () => void }) {
  const overall = progressService.getOverallProgress();
  return (
    <div className="wm-root">
      <header className="wm-top">
        <button className="wm-chip" onClick={onBack}>← Map</button>
        <div className="wm-brand">📊 My Progress</div>
        <div className="wm-chip">👋 {studentName}</div>
      </header>
      <div className="db-stats">
        <div className="db-stat"><span className="db-stat-num">{overall.completed}/{overall.total}</span><span>Levels cleared</span></div>
        <div className="db-stat"><span className="db-stat-num">⭐ {progressService.getTotalXp()}</span><span>Total XP</span></div>
        <div className="db-stat"><span className="db-stat-num">🪙 {progressService.getTotalCoins()}</span><span>Coins earned</span></div>
      </div>
      <div className="db-worlds">
        {WORLDS.map((world, i) => {
          const { completed, total } = progressService.getWorldProgress(world);
          const bossCleared = progressService.isBossCleared(world.id);
          return (
            <div className="db-world-row" key={world.id}>
              <span className="db-world-name">World {i + 1}: {world.name}</span>
              <div className="db-world-bar">
                <div className="db-world-fill" style={{ width: `${world.implemented && total ? (completed / total) * 100 : 0}%` }} />
              </div>
              <span className="db-world-count">{world.implemented ? `${completed}/${total}` : 'Locked'}</span>
              <span className="db-world-badge">{bossCleared ? '🏆' : world.implemented ? '—' : '🔒'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
