"use client";

import { useState } from "react";
import { colors, typography, spacing } from "@/styles/tokens";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy Link" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: `${spacing.padding.xs} ${spacing.padding.md}`,
        background: "transparent",
        border: `1px solid ${colors.border.light}`,
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.caption,
        color: colors.text.secondary,
        cursor: "pointer",
      }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

