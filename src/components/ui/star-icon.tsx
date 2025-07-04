import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  const isFilled = props.fill !== "none";
  const fillColor = isFilled
    ? "fill-yellow-400 text-yellow-400"
    : "text-gray-300";
  const strokeColor = isFilled ? "stroke-yellow-400" : "stroke-gray-300";

  const className = cn(props.className, fillColor, strokeColor);

  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
