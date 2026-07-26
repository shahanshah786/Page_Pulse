
export default function PulseMonitor({ state = 'idle', tone = 'ok', className = '' }) {
  const toneColor =
    tone === 'error' ? '#FB7185' : tone === 'warn' ? '#FBBF24' : '#22D3EE';

  const isScanning = state === 'scanning';

  return (
    <svg
      viewBox="0 0 600 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pulse-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={toneColor} stopOpacity="0" />
          <stop offset="15%" stopColor={toneColor} stopOpacity="1" />
          <stop offset="85%" stopColor={toneColor} stopOpacity="1" />
          <stop offset="100%" stopColor={toneColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />

      <path
        d="M0,60 L120,60 L145,20 L170,100 L195,60 L230,60 L250,45 L270,60 L600,60"
        stroke="url(#pulse-fade)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          isScanning
            ? {
                strokeDasharray: 900,
                strokeDashoffset: 900,
                animation: 'pulse-sweep 2.2s linear infinite',
              }
            : { opacity: state === 'idle' ? 0.5 : 1 }
        }
      />

      <style>{`
        @keyframes pulse-sweep {
          0% { stroke-dashoffset: 900; }
          100% { stroke-dashoffset: -900; }
        }
      `}</style>
    </svg>
  );
}
