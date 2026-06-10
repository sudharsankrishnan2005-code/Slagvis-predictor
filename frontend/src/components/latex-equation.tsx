"use client";

import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";

const BlockMath = dynamic(() => import("react-katex").then((m) => m.BlockMath), {
  ssr: false,
  loading: () => <div className="h-8 animate-pulse rounded bg-muted" />,
});

interface LatexEquationProps {
  math: string;
  className?: string;
}

export function LatexEquation({ math, className }: LatexEquationProps) {
  return (
    <div className={className}>
      <BlockMath math={math} />
    </div>
  );
}
