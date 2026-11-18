// SQL Legends' own emblem — a small table grid with a key resting on its
// primary-key column, not a borrowed Mario mushroom. The brief asked for a
// classic-platformer *feel*, not literally reused Nintendo iconography, and
// a found power-up glyph standing in for a game's identity is exactly the
// kind of "this wasn't made for us" tell students notice.
export function Emblem({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="url(#sl-emblem-bg)" stroke="#a85e00" strokeWidth="2" />
      <rect x="10" y="13" width="22" height="22" rx="2.5" fill="#fffdf6" stroke="#7a5200" strokeWidth="2" />
      <line x1="10" y1="20.3" x2="32" y2="20.3" stroke="#e3cf9a" strokeWidth="1.6" />
      <line x1="10" y1="27.6" x2="32" y2="27.6" stroke="#e3cf9a" strokeWidth="1.6" />
      <line x1="17.3" y1="13" x2="17.3" y2="35" stroke="#e3cf9a" strokeWidth="1.6" />
      <line x1="24.6" y1="13" x2="24.6" y2="35" stroke="#e3cf9a" strokeWidth="1.6" />
      <rect x="10" y="13" width="7.3" height="22" fill="#ffe8a3" opacity="0.6" />
      <g transform="translate(29 29) rotate(45)">
        <circle cx="0" cy="0" r="5" fill="#2fae4a" stroke="#176b2c" strokeWidth="1.6" />
        <circle cx="0" cy="0" r="1.8" fill="#fffdf6" />
        <rect x="-1.1" y="4.2" width="2.2" height="7" rx="1" fill="#2fae4a" stroke="#176b2c" strokeWidth="1.3" />
        <rect x="-3" y="9" width="2.4" height="2.4" fill="#2fae4a" stroke="#176b2c" strokeWidth="1.1" />
      </g>
      <defs>
        <linearGradient id="sl-emblem-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd34d" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>
    </svg>
  );
}
