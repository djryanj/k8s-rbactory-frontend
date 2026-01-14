// src/icons/fallbacks/NetworkingIcon.tsx
import React from "react";

export const NetworkingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="5" cy="5" r="2" fill="currentColor" />
    <circle cx="19" cy="5" r="2" fill="currentColor" />
    <circle cx="5" cy="19" r="2" fill="currentColor" />
    <circle cx="19" cy="19" r="2" fill="currentColor" />
    <path
      d="M7 6l3.5 4.5M17 6l-3.5 4.5M7 18l3.5-4.5M17 18l-3.5-4.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);
