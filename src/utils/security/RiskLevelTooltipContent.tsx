// src/utils/security/RiskLevelTooltipContent.tsx
import React from "react";
import type { SecurityLevel } from "../../types/security.types";
import { RISK_LEVEL_DEFINITIONS } from "../../types/security.types";

interface RiskLevelTooltipContentProps {
  level: SecurityLevel;
}

/**
 * Tooltip content component for risk level explanations
 * Used in permission configuration and security analysis views
 *
 * @example
 * ```tsx
 * <Tooltip content={<RiskLevelTooltipContent level="critical-destructive" />} />
 * ```
 */
export const RiskLevelTooltipContent: React.FC<
  RiskLevelTooltipContentProps
> = ({ level }) => {
  const definition = RISK_LEVEL_DEFINITIONS[level];

  return (
    <div className="space-y-2">
      <div>
        <div className="font-semibold mb-1">{definition.title}</div>
        <div className="text-gray-300 dark:text-gray-700">
          {definition.description}
        </div>
      </div>

      <div>
        <div className="font-semibold mb-1">Examples:</div>
        <ul className="space-y-0.5 text-gray-300 dark:text-gray-700">
          {definition.examples.map((example, idx) => (
            <li key={idx} className="flex items-start gap-1">
              <span className="flex-shrink-0">•</span>
              <span>{example}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-1 border-t border-gray-700 dark:border-gray-400">
        <div className="font-semibold mb-1">Guidance:</div>
        <div className="text-gray-300 dark:text-gray-700">
          {definition.guidance}
        </div>
      </div>
    </div>
  );
};
