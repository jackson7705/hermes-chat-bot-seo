"use client";

import { cn } from "@/lib/cn";

interface ChatIconProps {
  size?: number;
  state?: "idle" | "thinking" | "active";
  className?: string;
}

/**
 * Generic chat-bot mascot. A friendly orb with eyes and a smile, plus a
 * thinking ring when the agent is mid-response. Replace with your own SVG
 * or <Image src="/your-icon.png" /> for branding.
 */
export function ChatIcon({ size = 56, state = "idle", className }: ChatIconProps) {
  const animate = state === "idle";
  return (
    <div
      className={cn("relative", animate && "chat-float", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={cn(
          animate
            ? "chat-glow"
            : "drop-shadow-[0_4px_12px_rgba(15,23,42,0.25)]"
        )}
      >
        <defs>
          <radialGradient id="chat-body" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>
          <radialGradient id="chat-shine" cx="30%" cy="25%" r="35%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="chat-ring" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {state === "thinking" && (
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#chat-ring)"
            strokeWidth="3"
            strokeDasharray="60 220"
            className="origin-center animate-[spin_1.6s_linear_infinite]"
            style={{ transformOrigin: "50px 50px" }}
          />
        )}

        <circle cx="50" cy="50" r="40" fill="url(#chat-body)" />
        <circle cx="50" cy="50" r="40" fill="url(#chat-shine)" />

        <g>
          <ellipse cx="38" cy="46" rx="5" ry="7" fill="#0f172a" />
          <ellipse cx="62" cy="46" rx="5" ry="7" fill="#0f172a" />
          <circle cx="40" cy="44" r="1.6" fill="#fff" />
          <circle cx="64" cy="44" r="1.6" fill="#fff" />
        </g>

        <path
          d={state === "active" ? "M 38 62 Q 50 72 62 62" : "M 38 64 Q 50 70 62 64"}
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
