import React from "react";
import { cn } from "@/lib/utils";

interface HeartIconProps {
  filled?: boolean;
  className?: string;
  onClick?: () => void;
}

const HeartIcon: React.FC<HeartIconProps> = ({ filled = false, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative transition-all duration-200 ease-in-out cursor-pointer",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-background rounded-full p-1",
        className
      )}
      aria-label={filled ? "Unlike" : "Like"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "transition-all duration-200",
          filled ? "text-red-500" : "text-gray-400 hover:text-red-400",
          filled && "animate-heartBeat"
        )}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {filled && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        </div>
      )}
    </button>
  );
};

export default HeartIcon;