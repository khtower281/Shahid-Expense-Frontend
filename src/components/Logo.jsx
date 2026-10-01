export default function Logo({ size = 44, className = '', variant = 'default' }) {
  /* variant: 'default' (gradient tile) | 'mono' (white for dark bg) */
  const isMono = variant === 'mono';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="seTile" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="seShine" x1="0" y1="0" x2="0" y2="64">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Tile */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill={isMono ? 'rgba(255,255,255,0.14)' : 'url(#seTile)'}
        stroke={isMono ? 'rgba(255,255,255,0.3)' : 'none'}
        strokeWidth={isMono ? 1 : 0}
      />
      {/* Shine overlay */}
      <rect x="2" y="2" width="60" height="30" rx="16" fill="url(#seShine)" />

      {/* Wallet body */}
      <rect
        x="14"
        y="22"
        width="36"
        height="24"
        rx="5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
      />
      {/* Wallet flap */}
      <path
        d="M14 27h22a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H14"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Clasp dot */}
      <circle cx="38" cy="32" r="1.8" fill="#FFFFFF" />

      {/* Rupee mark above wallet */}
      <path
        d="M26 14h12M26 18h12M32 14v4c4 0 6 2 6 5s-2 5-6 5h-4l7 8"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}