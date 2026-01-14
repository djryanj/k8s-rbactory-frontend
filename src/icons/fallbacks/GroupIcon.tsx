// src/icons/fallbacks/GroupIcon.tsx
import React from "react";

export const GroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 21v-2a5 5 0 015-5h2a5 5 0 015 5v2M14 21v-2a5 5 0 015-5h2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
