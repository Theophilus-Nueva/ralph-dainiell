import React from 'react';

export default function SvgDefs() {
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="lg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#fff" />
            <g transform="translate(4.6 4.6) scale(.62)">
              <path
                fill="#4285F4"
                d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.29v3.09A12 12 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.29a12 12 0 0 0 0 10.78l4-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l4 3.09C6.23 6.86 8.88 4.75 12 4.75z"
              />
            </g>
          </symbol>
          <symbol id="lm" viewBox="0 0 64 32">
            <defs>
              <linearGradient id="lmg" x1="0" x2="1">
                <stop offset="0" stopColor="#0081fb" />
                <stop offset="1" stopColor="#0064e0" />
              </linearGradient>
            </defs>
            <path
              d="M32 16C26 6 19 3 13 5 6 8 2 15 4.5 22c2.5 6 10 6 15 1 5-4 8-9 12.5-7s8 7 12.5 11c5 4 12 3 15-3 3-7-1-15-8-17-6-2-13 1-19 11z"
              fill="none"
              stroke="url(#lmg)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </symbol>
        </defs>
      </svg>

      {/* X-Ray Negative Portrait Filter */}
      <div
        id="xrf-holder"
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <svg width="0" height="0">
          <filter id="xrf" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.88" intercept="0.05" />
              <feFuncG type="linear" slope="0.94" intercept="0.08" />
              <feFuncB type="linear" slope="1.08" intercept="0.14" />
            </feComponentTransfer>
          </filter>
        </svg>
      </div>
    </>
  );
}
