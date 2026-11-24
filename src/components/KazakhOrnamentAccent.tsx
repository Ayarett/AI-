interface KazakhOrnamentAccentProps {
  className?: string;
}

export function KazakhOrnamentStrip({ className = '' }: KazakhOrnamentAccentProps) {
  return (
    <svg
      viewBox="0 0 360 18"
      fill="none"
      aria-hidden="true"
      className={`w-full h-3.5 text-sky-500/35 dark:text-sky-400/25 ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="kz-oyu-strip" width="36" height="18" patternUnits="userSpaceOnUse">
          <path
            d="M0 9h6c2.5 0 3.5-5 6-5s3 4 6 4 3.5-4 6-4 3.5 5 6 5h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="13.5" r="1.4" fill="#d97706" fillOpacity="0.65" />
        </pattern>
      </defs>
      <rect width="360" height="18" fill="url(#kz-oyu-strip)" />
    </svg>
  );
}
