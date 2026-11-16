import React, { useState, useEffect } from 'react';

interface YouthUnionBadgeProps {
  className?: string;
  src?: string;
}

export const YouthUnionBadge: React.FC<YouthUnionBadgeProps> = ({ 
  className = "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20",
  src
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const effectiveSrc = src || "/brand/huy_hieu_doan.svg";

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      {!imgError ? (
        <img
          src={effectiveSrc}
          alt="Huy hiệu Đoàn TNCS Hồ Chí Minh"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(220,38,38,0.5)] transition-transform duration-300 hover:scale-105 cursor-pointer"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Standalone High-Quality Vector SVG Fallback */
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(220,38,38,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="badgeGradFb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <linearGradient id="goldGradFb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="greenGradFb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Outer circle with gear cog / golden rim */}
          <circle cx="100" cy="100" r="96" fill="url(#goldGradFb)" stroke="#854d0e" strokeWidth="3" />
          <circle cx="100" cy="100" r="88" fill="url(#greenGradFb)" />
          <circle cx="100" cy="100" r="76" fill="url(#badgeGradFb)" stroke="url(#goldGradFb)" strokeWidth="3" />

          {/* Golden Star at top left of flag */}
          <polygon
            points="70,55 74,67 86,67 76,75 80,87 70,79 60,87 64,75 54,67 66,67"
            fill="#facc15"
            stroke="#b45309"
            strokeWidth="1"
          />

          {/* Hand holding the flag pole */}
          <path
            d="M50 145 C60 130, 85 110, 115 95 L125 105 C95 125, 75 145, 60 155 Z"
            fill="url(#goldGradFb)"
            stroke="#854d0e"
            strokeWidth="1.5"
          />
          <path
            d="M65 145 C75 135, 90 125, 105 120"
            stroke="#78350f"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Banner with THANH NIÊN VIỆT NAM */}
          <path
            d="M25 150 Q100 178 175 150 L170 170 Q100 198 30 170 Z"
            fill="url(#goldGradFb)"
            stroke="#854d0e"
            strokeWidth="2"
          />
          <text
            x="100"
            y="167"
            textAnchor="middle"
            fill="#7f1d1d"
            fontWeight="900"
            fontSize="10"
            letterSpacing="1"
            fontFamily="Arial, sans-serif"
          >
            THANH NIÊN VIỆT NAM
          </text>
        </svg>
      )}
    </div>
  );
};
