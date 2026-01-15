// src/components/ClusterConnection/linkParser.tsx
import React, { Fragment } from "react";

/**
 * URL regex pattern to detect URLs in text
 */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Parses text and converts URLs into clickable links
 * @param text - Text that may contain URLs
 * @returns Array of React nodes with text and links
 */
export const parseTextWithLinks = (text: string): React.ReactNode => {
  const parts = text.split(URL_REGEX);

  return parts.map((part, index) => {
    // Check if this part is a URL
    if (URL_REGEX.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline decoration-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded transition-colors"
          aria-label={`Open documentation: ${part}`}
        >
          {part}
        </a>
      );
    }

    // Regular text
    return <Fragment key={index}>{part}</Fragment>;
  });
};
