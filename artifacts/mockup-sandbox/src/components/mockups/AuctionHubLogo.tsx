const AuctionHubLogoSVG = ({ size = 200 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    width={size}
    height={size}
  >
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#1a0a0a", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#2d0d0d", stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#e63946", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#c1121f", stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#e63946", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#9d0208", stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Outer ring */}
    <circle cx="100" cy="100" r="99" fill="url(#redGrad)" />
    {/* Inner background */}
    <circle cx="100" cy="100" r="95" fill="url(#bgGrad)" />
    {/* Subtle inner border */}
    <circle cx="100" cy="100" r="90" fill="none" stroke="#e63946" strokeWidth="0.8" strokeOpacity="0.35" />

    {/* Gavel head — rotated */}
    <g transform="translate(100, 86) rotate(-35)">
      <rect x="-22" y="-9" width="44" height="18" rx="4" fill="url(#redGrad)" />
      <rect x="-22" y="-2" width="44" height="4" fill="#1a0505" opacity="0.55" />
      <rect x="-22" y="-9" width="44" height="5" rx="4" fill="#ff6b6b" opacity="0.25" />
      <rect x="-27" y="-12" width="11" height="24" rx="3" fill="#c1121f" />
      <rect x="16" y="-12" width="11" height="24" rx="3" fill="#c1121f" />
      <rect x="-27" y="-12" width="11" height="6" rx="3" fill="#e63946" opacity="0.4" />
      <rect x="16" y="-12" width="11" height="6" rx="3" fill="#e63946" opacity="0.4" />
    </g>

    {/* Handle */}
    <g transform="translate(98, 93) rotate(-35)">
      <rect x="0" y="4" width="38" height="9" rx="4.5" fill="url(#handleGrad)" />
      <rect x="0" y="4" width="38" height="3" rx="2" fill="#ff9999" opacity="0.18" />
    </g>

    {/* Impact lines */}
    <g filter="url(#glow)">
      <line x1="73" y1="63" x2="66" y2="55" stroke="#e63946" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="69" y1="74" x2="59" y2="70" stroke="#e63946" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="77" y1="59" x2="73" y2="50" stroke="#e63946" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Base / anvil */}
    <g transform="translate(100, 118)">
      <rect x="-20" y="0" width="40" height="7" rx="3" fill="#c1121f" />
      <rect x="-25" y="7" width="50" height="5" rx="2.5" fill="#9d0208" />
      <rect x="-25" y="7" width="50" height="2" rx="2" fill="#e63946" opacity="0.35" />
    </g>

    {/* Name */}
    <text
      x="100"
      y="152"
      textAnchor="middle"
      fontFamily="'Arial Black', 'Arial', sans-serif"
      fontWeight="900"
      fontSize="14"
      letterSpacing="1.5"
      fill="#e63946"
      filter="url(#glow)"
    >
      AUCTION-HUB
    </text>

    {/* Tagline */}
    <text
      x="100"
      y="165"
      textAnchor="middle"
      fontFamily="'Arial', sans-serif"
      fontWeight="400"
      fontSize="5.8"
      letterSpacing="0.8"
      fill="#ffffff"
      opacity="0.55"
    >
      Fairness first. Every bid counts
    </text>

    {/* Decorative arc */}
    <path d="M 58 172 Q 100 180 142 172" stroke="#e63946" strokeWidth="0.7" fill="none" opacity="0.45" />
  </svg>
);

export default function AuctionHubLogo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "52px",
        fontFamily: "Arial, sans-serif",
        padding: "48px 24px",
      }}
    >
      <p
        style={{
          color: "#555",
          fontSize: "11px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Auction-Hub — Circle Logo
      </p>

      {/* Size variants */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "48px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "200×200", size: 200 },
          { label: "120×120", size: 120 },
          { label: "64×64", size: 64 },
          { label: "32×32", size: 32 },
        ].map(({ label, size }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ color: "#444", fontSize: "10px", letterSpacing: "1.5px" }}>
              {label}
            </span>
            <AuctionHubLogoSVG size={size} />
          </div>
        ))}
      </div>

      {/* On light background */}
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "36px 56px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <span style={{ color: "#bbb", fontSize: "10px", letterSpacing: "2px" }}>
          ON LIGHT BACKGROUND
        </span>
        <AuctionHubLogoSVG size={150} />
      </div>

      {/* Inline navbar usage */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "#1a0a0a",
          borderRadius: "12px",
          padding: "14px 28px",
          border: "1px solid rgba(193,18,31,0.3)",
        }}
      >
        <AuctionHubLogoSVG size={42} />
        <span
          style={{
            color: "#e63946",
            fontSize: "20px",
            fontWeight: 900,
            letterSpacing: "2.5px",
            fontFamily: "'Arial Black', Arial, sans-serif",
          }}
        >
          AUCTION-HUB
        </span>
      </div>

      <p style={{ color: "#333", fontSize: "11px", margin: 0 }}>
        Use &lt;AuctionHubLogoSVG /&gt; inline — no file loading needed
      </p>
    </div>
  );
}
