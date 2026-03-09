import { useEffect, useState } from "react";
import axios from "axios";

type DotLoadingConfig = {
  dotCount?: number;
  dotSize?: number;
  gap?: number;
  color?: string;
  speedMs?: number;
  text?: string;
};

type DotLoadingProps = {
  text?: string;
  fullHeight?: number | string;
};

const DEFAULT_CONFIG: Required<DotLoadingConfig> = {
  dotCount: 4,
  dotSize: 10,
  gap: 8,
  color: "#0f172a",
  speedMs: 850,
  text: "Loading...",
};

function clampNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(minimum, Math.min(maximum, value));
}

export default function DotLoading({
  text,
  fullHeight = 260,
}: DotLoadingProps) {
  const [config, setConfig] = useState<Required<DotLoadingConfig>>(DEFAULT_CONFIG);

  useEffect(() => {
    let mounted = true;

    void axios
      .get<DotLoadingConfig>("/dot_loading.json")
      .then((response) => {
        if (!mounted || !response?.data) return;

        setConfig({
          dotCount: clampNumber(response.data.dotCount, DEFAULT_CONFIG.dotCount, 3, 8),
          dotSize: clampNumber(response.data.dotSize, DEFAULT_CONFIG.dotSize, 6, 18),
          gap: clampNumber(response.data.gap, DEFAULT_CONFIG.gap, 4, 16),
          color: typeof response.data.color === "string" && response.data.color.trim()
            ? response.data.color
            : DEFAULT_CONFIG.color,
          speedMs: clampNumber(response.data.speedMs, DEFAULT_CONFIG.speedMs, 450, 1800),
          text: typeof response.data.text === "string" && response.data.text.trim()
            ? response.data.text
            : DEFAULT_CONFIG.text,
        });
      })
      .catch(() => {
        // Keep default loader config when the JSON file is unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const label = text?.trim() || config.text;

  return (
    <>
      <style>
        {`
          @keyframes dot-loading-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
            40% { transform: translateY(-8px); opacity: 1; }
          }
        `}
      </style>
      <div
        style={{
          width: "100%",
          minHeight: fullHeight,
          display: "grid",
          placeItems: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: config.gap, alignItems: "flex-end" }}>
            {Array.from({ length: config.dotCount }, (_, index) => (
              <span
                key={`loader-dot-${index}`}
                style={{
                  width: config.dotSize,
                  height: config.dotSize,
                  borderRadius: "50%",
                  background: config.color,
                  display: "inline-block",
                  animation: `dot-loading-bounce ${config.speedMs}ms ease-in-out ${index * 120}ms infinite`,
                }}
              />
            ))}
          </div>
          <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>{label}</span>
        </div>
      </div>
    </>
  );
}
