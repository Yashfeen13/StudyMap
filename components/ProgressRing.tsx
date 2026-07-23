'use client';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 6,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`Progress: ${percentage}%`}
      className="rotate-[-90deg]"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-slate-200 dark:text-slate-700"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-indigo-500 dark:text-indigo-400 transition-all duration-700 ease-out"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      {/* Centered text — rotate back */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-slate-800 dark:fill-slate-100"
        style={{
          fontSize: size * 0.22,
          fontWeight: 700,
          fontFamily: 'var(--font-inter)',
          transform: `rotate(90deg) translate(0, -${size}px)`,
          transformOrigin: `${size / 2}px ${size / 2}px`,
        }}
      >
        {percentage}%
      </text>
    </svg>
  );
}
