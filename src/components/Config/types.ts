// src/components/Config/types.ts

/**
 * Shared types for the Config module
 */

export type ThemeOption = "light" | "dark" | "system";

export interface ConfigFormState {
  endpoint: string;
  browserEnabled: boolean;
  theme: ThemeOption;
  resourceLoadSize: number;
}

/**
 * Common ref types for modal components
 */
export type FocusableRef = React.Ref<HTMLButtonElement>;
export type ModalRef = React.RefObject<HTMLDivElement>;
