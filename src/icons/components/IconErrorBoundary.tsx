// src/icons/components/IconErrorBoundary.tsx
import React, { Component, type ReactNode } from "react";
import { DefaultIcon } from "../fallbacks";

interface IconErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  size?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface IconErrorBoundaryState {
  hasError: boolean;
}

export class IconErrorBoundary extends Component<
  IconErrorBoundaryProps,
  IconErrorBoundaryState
> {
  constructor(props: IconErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): IconErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Icon rendering error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <DefaultIcon
          width={this.props.size ?? 20}
          height={this.props.size ?? 20}
          aria-label="Icon failed to load"
        />
      );
    }

    return this.props.children;
  }
}
