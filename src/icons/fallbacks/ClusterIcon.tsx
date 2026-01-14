// src/icons/fallbacks/ClusterIcon.tsx
import React from "react";
import type { SVGProps } from "react";

export const ClusterIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Network/Cluster icon - represents interconnected nodes */}
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="5" cy="12" r="2" />
      <line x1="12" y1="7" x2="12" y2="10" />
      <line x1="14" y1="12" x2="17" y2="12" />
      <line x1="12" y1="14" x2="12" y2="17" />
      <line x1="10" y1="12" x2="7" y2="12" />
    </svg>
  );
};
