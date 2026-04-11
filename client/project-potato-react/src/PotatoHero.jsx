export default function PotatoHero() {
  return (
    <svg
      viewBox="0 0 220 260"
      width="220"
      height="260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── 천장 봉 ── */}
      <rect x="10" y="18" width="200" height="7" rx="3.5" fill="#222" />

      {/* ── 왼쪽 손잡이 ── */}
      <rect x="62" y="25" width="6" height="34" rx="3" fill="#222" />
      <path
        d="M56 59 L56 70 Q56 78 65 78 L95 78 Q104 78 104 70 L104 59"
        stroke="#222"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── 오른쪽 손잡이 ── */}
      <rect x="152" y="25" width="6" height="34" rx="3" fill="#222" />
      <path
        d="M116 59 L116 70 Q116 78 125 78 L155 78 Q164 78 164 70 L164 59"
        stroke="#222"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── 손잡이 잡은 팔 ── */}
      <path
        d="M120 128 C118 108 122 90 116 78"
        stroke="#222"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── 감자 몸통 ── */}
      <ellipse cx="110" cy="168" rx="58" ry="68" fill="white" stroke="#222" strokeWidth="3" />

      {/* ── 눈 ── */}
      <circle cx="94" cy="150" r="4" fill="#222" />
      <circle cx="126" cy="150" r="4" fill="#222" />

      {/* ── 입 ── */}
      <path
        d="M96 172 Q110 186 124 172"
        stroke="#222"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── 왼팔 + 가방 ── */}
      <path
        d="M55 170 C62 162 68 158 52 155"
        stroke="#222"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 가방 본체 */}
      <rect x="24" y="156" width="30" height="22" rx="3" fill="white" stroke="#222" strokeWidth="2.5" />
      {/* 가방 손잡이 */}
      <path
        d="M31 156 L31 151 Q31 148 35 148 L43 148 Q47 148 47 151 L47 156"
        stroke="#222"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 가방 중단선 */}
      <line x1="24" y1="167" x2="54" y2="167" stroke="#222" strokeWidth="1.5" />

      {/* ── 다리 ── */}
      <path d="M94 232 L88 252" stroke="#222" strokeWidth="5" strokeLinecap="round" />
      <path d="M126 232 L132 252" stroke="#222" strokeWidth="5" strokeLinecap="round" />
      {/* 발 */}
      <path d="M88 252 L74 252" stroke="#222" strokeWidth="5" strokeLinecap="round" />
      <path d="M132 252 L146 252" stroke="#222" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
