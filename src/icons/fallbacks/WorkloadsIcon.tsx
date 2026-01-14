// src/icons/fallbacks/WorkloadsIcon.tsx
import React from "react";

export const WorkloadsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12 12l-9-5M12 12l9-5M12 12v10"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
