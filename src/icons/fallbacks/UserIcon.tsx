// src/icons/fallbacks/UserIcon.tsx
import React from "react";

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M6 21v-2a6 6 0 0112 0v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
