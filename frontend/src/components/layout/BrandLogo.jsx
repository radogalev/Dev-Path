export default function BrandLogo({
  className = 'h-9 w-auto',
  showText = true,
}) {
  const iconOnly = !showText;

  return (
    <svg
      viewBox={iconOnly ? '0 0 96 96' : '0 0 420 96'}
      role="img"
      aria-label="Dev Path"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={iconOnly ? 'translate(17,18)' : 'translate(8,10)'}>
        <path
          d="M18 8 L62 32 L62 44 L18 68"
          fill="none"
          stroke="#36d483"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 8 L18 24"
          fill="none"
          stroke="#36d483"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M18 52 L18 68"
          fill="none"
          stroke="#36d483"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </g>

      {!iconOnly ? (
        <text
          x="98"
          y="62"
          fill="currentColor"
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          Dev Path
        </text>
      ) : null}
    </svg>
  );
}