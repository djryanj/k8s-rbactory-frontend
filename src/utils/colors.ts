// src/utils/colors.ts
import {
  XOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Combine multiple Tailwind classes safely
 * Useful for merging color classes with other utilities
 * 
 * @param classes - Array of class strings
 * @returns Combined class string
 * 
 * @example
 * ```typescript
 * const classes = combineClasses(
 *   ACCESSIBLE_COLORS.info.bg,
 *   ACCESSIBLE_COLORS.info.border,
 *   "p-4 rounded-lg"
 * );
 * ```
 */
export function combineClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Accessible color palette with WCAG AA compliant contrast ratios
 * All combinations are tested for colorblind accessibility in BOTH light and dark modes
 */
export const ACCESSIBLE_COLORS = {
  critical: {
    bg: "bg-rose-50 dark:bg-rose-950",
    text: "text-rose-900 dark:text-rose-50",
    border: "border-rose-300 dark:border-rose-700",
    hover: "hover:bg-rose-100 dark:hover:bg-rose-900",
    icon: "text-rose-700 dark:text-rose-300",
    ring: "focus:ring-rose-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-900 dark:text-amber-50",
    border: "border-amber-300 dark:border-amber-700",
    hover: "hover:bg-amber-100 dark:hover:bg-amber-900",
    icon: "text-amber-700 dark:text-amber-300",
    ring: "focus:ring-amber-500",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-900 dark:text-orange-50",
    border: "border-orange-300 dark:border-orange-700",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900",
    icon: "text-orange-700 dark:text-orange-300",
    ring: "focus:ring-orange-500",
  },
  success: {
    bg: "bg-teal-50 dark:bg-teal-950",
    text: "text-teal-900 dark:text-teal-50",
    border: "border-teal-300 dark:border-teal-700",
    hover: "hover:bg-teal-100 dark:hover:bg-teal-900",
    icon: "text-teal-700 dark:text-teal-300",
    ring: "focus:ring-teal-500",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-900 dark:text-blue-50",
    border: "border-blue-300 dark:border-blue-700",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900",
    icon: "text-blue-700 dark:text-blue-300",
    ring: "focus:ring-blue-500",
  },
  neutral: {
    bg: "bg-gray-50 dark:bg-gray-900",
    text: "text-gray-900 dark:text-gray-50",
    border: "border-gray-300 dark:border-gray-700",
    hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
    icon: "text-gray-600 dark:text-gray-400",
    ring: "focus:ring-gray-500",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-900 dark:text-purple-50",
    border: "border-purple-300 dark:border-purple-700",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900",
    icon: "text-purple-700 dark:text-purple-300",
    ring: "focus:ring-purple-500",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    text: "text-indigo-900 dark:text-indigo-50",
    border: "border-indigo-300 dark:border-indigo-700",
    hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900",
    icon: "text-indigo-700 dark:text-indigo-300",
    ring: "focus:ring-indigo-500",
  },
  slate: {
    bg: "bg-slate-50 dark:bg-slate-950",
    text: "text-slate-900 dark:text-slate-50",
    border: "border-slate-300 dark:border-slate-700",
    hover: "hover:bg-slate-100 dark:hover:bg-slate-900",
    icon: "text-slate-700 dark:text-slate-300",
    ring: "focus:ring-slate-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-900 dark:text-emerald-50",
    border: "border-emerald-300 dark:border-emerald-700",
    hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900",
    icon: "text-emerald-700 dark:text-emerald-300",
    ring: "focus:ring-emerald-500",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950",
    text: "text-cyan-900 dark:text-cyan-50",
    border: "border-cyan-300 dark:border-cyan-700",
    hover: "hover:bg-cyan-100 dark:hover:bg-cyan-900",
    icon: "text-cyan-700 dark:text-cyan-300",
    ring: "focus:ring-cyan-500",
  },
} as const;

/**
 * Button variant styles with consistent accessibility
 * All button variants maintain WCAG AA contrast ratios
 */
export const BUTTON_VARIANTS = {
  primary: {
    neutral: {
      base: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border border-gray-900 dark:border-gray-100",
      hover: "hover:bg-gray-800 dark:hover:bg-gray-200",
      active: "active:bg-gray-950 dark:active:bg-gray-50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    },
    slate: {
      base: "bg-slate-700 dark:bg-slate-600 text-white border border-slate-800 dark:border-slate-700",
      hover: "hover:bg-slate-800 dark:hover:bg-slate-500",
      active: "active:bg-slate-900 dark:active:bg-slate-400",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
    },
    indigo: {
      base: "bg-indigo-600 dark:bg-indigo-700 text-white border border-indigo-700 dark:border-indigo-800",
      hover: "hover:bg-indigo-700 dark:hover:bg-indigo-600",
      active: "active:bg-indigo-800 dark:active:bg-indigo-500",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    },
    purple: {
      base: "bg-purple-600 dark:bg-purple-700 text-white border border-purple-700 dark:border-purple-800",
      hover: "hover:bg-purple-700 dark:hover:bg-purple-600",
      active: "active:bg-purple-800 dark:active:bg-purple-500",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    },
    blue: {
      base: "bg-blue-600 dark:bg-blue-700 text-white border border-blue-700 dark:border-blue-800",
      hover: "hover:bg-blue-700 dark:hover:bg-blue-600",
      active: "active:bg-blue-800 dark:active:bg-blue-500",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    },
    red: {
      base: "bg-red-600 dark:bg-red-700 text-white border border-red-700 dark:border-red-800",
      hover: "hover:bg-red-700 dark:hover:bg-red-600",
      active: "active:bg-red-800 dark:active:bg-red-500",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
    },
  },
  secondary: {
    neutral: {
      base: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 border-2 border-gray-900 dark:border-gray-100",
      hover: "hover:bg-gray-50 dark:hover:bg-gray-700",
      active: "active:bg-gray-100 dark:active:bg-gray-600",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    },
    slate: {
      base: "bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-2 border-slate-600 dark:border-slate-500",
      hover: "hover:bg-slate-50 dark:hover:bg-slate-950/30",
      active: "active:bg-slate-100 dark:active:bg-slate-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
    },
    indigo: {
      base: "bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-600 dark:border-indigo-500",
      hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
      active: "active:bg-indigo-100 dark:active:bg-indigo-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    },
    purple: {
      base: "bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 border-2 border-purple-600 dark:border-purple-500",
      hover: "hover:bg-purple-50 dark:hover:bg-purple-950/30",
      active: "active:bg-purple-100 dark:active:bg-purple-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    },
    blue: {
      base: "bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-2 border-blue-600 dark:border-blue-500",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
      active: "active:bg-blue-100 dark:active:bg-blue-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    },
    red: {
      base: "bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 border-2 border-red-600 dark:border-red-500",
      hover: "hover:bg-red-50 dark:hover:bg-red-950/30",
      active: "active:bg-red-100 dark:active:bg-red-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
    },
  },
  ghost: {
    neutral: {
      base: "bg-transparent text-gray-900 dark:text-gray-50 border border-transparent",
      hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
      active: "active:bg-gray-200 dark:active:bg-gray-700",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    },
    slate: {
      base: "bg-transparent text-slate-700 dark:text-slate-300 border border-transparent",
      hover: "hover:bg-slate-50 dark:hover:bg-slate-950/30",
      active: "active:bg-slate-100 dark:active:bg-slate-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
    },
    indigo: {
      base: "bg-transparent text-indigo-700 dark:text-indigo-300 border border-transparent",
      hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
      active: "active:bg-indigo-100 dark:active:bg-indigo-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    },
    purple: {
      base: "bg-transparent text-purple-700 dark:text-purple-300 border border-transparent",
      hover: "hover:bg-purple-50 dark:hover:bg-purple-950/30",
      active: "active:bg-purple-100 dark:active:bg-purple-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    },
    blue: {
      base: "bg-transparent text-blue-700 dark:text-blue-300 border border-transparent",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
      active: "active:bg-blue-100 dark:active:bg-blue-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    },
    red: {
      base: "bg-transparent text-red-700 dark:text-red-300 border border-transparent",
      hover: "hover:bg-red-50 dark:hover:bg-red-950/30",
      active: "active:bg-red-100 dark:active:bg-red-950/50",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      ring: "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
    },
  },
} as const;

/**
 * Card/Container variants for action sections
 */
export const CARD_VARIANTS = {
  neutral: {
    base: combineClasses(
      ACCESSIBLE_COLORS.neutral.bg,
      ACCESSIBLE_COLORS.neutral.border,
      "border-2"
    ),
    hover: "hover:border-gray-300 dark:hover:border-gray-600 transition-colors",
  },
  accent: {
    slate: {
      base: combineClasses(
        ACCESSIBLE_COLORS.neutral.bg,
        "border-2 border-slate-300 dark:border-slate-700/40"
      ),
      hover: "hover:border-slate-400 dark:hover:border-slate-600/60 transition-colors",
    },
    indigo: {
      base: combineClasses(
        ACCESSIBLE_COLORS.neutral.bg,
        "border-2 border-indigo-200 dark:border-indigo-800/30"
      ),
      hover: "hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors",
    },
    purple: {
      base: combineClasses(
        ACCESSIBLE_COLORS.neutral.bg,
        "border-2 border-purple-200 dark:border-purple-800/30"
      ),
      hover: "hover:border-purple-300 dark:hover:border-purple-700/50 transition-colors",
    },
    blue: {
      base: combineClasses(
        ACCESSIBLE_COLORS.neutral.bg,
        "border-2 border-blue-200 dark:border-blue-800/30"
      ),
      hover: "hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors",
    },
  },
} as const;

/**
 * Type for color scheme keys
 */
export type ColorScheme = keyof typeof ACCESSIBLE_COLORS;

/**
 * Type for individual color properties
 */
export type ColorProperties = (typeof ACCESSIBLE_COLORS)[ColorScheme];

/**
 * Type for button color options
 */
export type ButtonColor = keyof typeof BUTTON_VARIANTS.primary;

/**
 * Type for card accent colors
 */
export type CardAccentColor = keyof typeof CARD_VARIANTS.accent;

/**
 * Severity levels for security and validation messages
 */
import type { SecurityLevel } from "../types/security.types";

/**
 * Severity style configuration including colors and icons
 */
export interface SeverityStyle {
  colors: ColorProperties;
  icon: LucideIcon;
  label: string;
  ariaLabel: string;
}

/**
 * Get color scheme and icon for a given severity level
 * Provides consistent styling across the application
 * 
 * @param severity - The severity level
 * @returns Style configuration with colors, icon, and labels
 */
export function getSeverityStyle(severity: SecurityLevel): SeverityStyle {
  switch (severity) {
    case "critical-destructive":
      return {
        colors: ACCESSIBLE_COLORS.critical,
        icon: XOctagon,
        label: "Critical",
        ariaLabel: "Critical severity - destructive permissions",
      };
          case "critical-sensitive":
      return {
        colors: ACCESSIBLE_COLORS.critical,
        icon: Shield,
        label: "Critical",
        ariaLabel: "Critical severity - sensitive resource access",
      };
    case "high":
      return {
        colors: ACCESSIBLE_COLORS.orange, 
        icon: AlertCircle,
        label: "High",
        ariaLabel: "High severity",
      };
    case "medium":
      return {
        colors: ACCESSIBLE_COLORS.warning,
        icon: AlertTriangle,
        label: "Warning",
        ariaLabel: "Warning severity",
      };
    case "low":
      return {
        colors: ACCESSIBLE_COLORS.info,
        icon: AlertCircle,
        label: "Low",
        ariaLabel: "Low severity",
      };
    case "safe":
      return {
        colors: ACCESSIBLE_COLORS.success,
        icon: CheckCircle,
        label: "Safe",
        ariaLabel: "Safe - minimal risk",
      };
    default:
      return {
        colors: ACCESSIBLE_COLORS.neutral,
        icon: Info,
        label: "Unknown",
        ariaLabel: "Unknown severity",
      };
  }
}

/**
 * Get color scheme by name
 * Useful for non-severity related color usage
 * 
 * @param scheme - The color scheme name
 * @returns Color properties object
 */
export function getColorScheme(scheme: ColorScheme): ColorProperties {
  return ACCESSIBLE_COLORS[scheme];
}

/**
 * Helper function to get complete button classes
 * @param variant - Button variant (primary, secondary, ghost)
 * @param color - Color scheme
 * @param size - Button size (sm, md, lg)
 * @returns Combined class string
 */
export function getButtonClasses(
  variant: keyof typeof BUTTON_VARIANTS,
  color: ButtonColor,
  size: "sm" | "md" | "lg" = "md"
): string {
  const buttonStyle = BUTTON_VARIANTS[variant][color];
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return combineClasses(
    buttonStyle.base,
    buttonStyle.hover,
    buttonStyle.active,
    buttonStyle.disabled,
    buttonStyle.ring,
    sizeClasses[size],
    "rounded-md font-medium shadow-sm transition-colors",
    "flex items-center justify-center gap-2"
  );
}

/**
 * Helper function to get card classes
 * @param variant - Card variant (neutral or accent)
 * @param accentColor - Accent color if using accent variant
 * @returns Combined class string
 */
export function getCardClasses(
  variant: "neutral" | "accent",
  accentColor?: CardAccentColor
): string {
  if (variant === "neutral") {
    return combineClasses(
      CARD_VARIANTS.neutral.base,
      CARD_VARIANTS.neutral.hover,
      "p-4 rounded-lg"
    );
  }
  
  if (variant === "accent" && accentColor) {
    return combineClasses(
      CARD_VARIANTS.accent[accentColor].base,
      CARD_VARIANTS.accent[accentColor].hover,
      "p-4 rounded-lg"
    );
  }
  
  return combineClasses(CARD_VARIANTS.neutral.base, "p-4 rounded-lg");
}

/**
 * Resource type to color scheme mapping
 * Maps Kubernetes resource types to appropriate color schemes
 */
export const RESOURCE_TYPE_COLORS: Record<string, ColorScheme> = {
  Role: "success",
  ClusterRole: "success",
  RoleBinding: "purple",
  ClusterRoleBinding: "purple",
  ServiceAccount: "indigo",
  User: "cyan",
  Group: "emerald",
  Pod: "info",
  Deployment: "info",
  Secret: "critical",
  ConfigMap: "neutral",
} as const;

/**
 * Get color scheme for a Kubernetes resource type
 * 
 * @param resourceType - The Kubernetes resource kind
 * @returns Color scheme for the resource type
 */
export function getResourceTypeColor(resourceType: string): ColorProperties {
  const scheme = RESOURCE_TYPE_COLORS[resourceType] || "neutral";
  return ACCESSIBLE_COLORS[scheme];
}

/**
 * Helper function to get disabled button classes
 * Provides consistent disabled state styling
 * @param size - Button size (sm, md, lg)
 * @returns Combined class string for disabled buttons
 */
export function getDisabledButtonClasses(
  size: "sm" | "md" | "lg" = "md"
): string {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return combineClasses(
    sizeClasses[size],
    "rounded-md font-medium shadow-sm",
    "flex items-center justify-center gap-2",
    "bg-gray-300 dark:bg-gray-700",
    "text-gray-500 dark:text-gray-500",
    "border border-gray-400 dark:border-gray-600",
    "cursor-not-allowed opacity-60"
  );
}