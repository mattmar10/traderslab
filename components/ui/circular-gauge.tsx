"use client";

import React, { useState, useEffect } from "react";

export interface CircularGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  duration?: number;
}

export default function CircularGauge({
  value,
  size = 200,
  strokeWidth = 10,
  duration = 1000,
}: CircularGaugeProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const normalizedValue = Math.min(Math.max(value, -100), 100);
  const angle = (normalizedValue + 100) * 1.8; // Convert -100 to 100 range to 0 to 360 degrees

  useEffect(() => {
    const step = (normalizedValue - currentValue) / (duration / 16);
    let animationFrame: number;

    const animate = () => {
      setCurrentValue((prev) => {
        const next = prev + step;
        if (
          (step > 0 && next >= normalizedValue) ||
          (step < 0 && next <= normalizedValue)
        ) {
          cancelAnimationFrame(animationFrame);
          return normalizedValue;
        }
        animationFrame = requestAnimationFrame(animate);
        return next;
      });
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [normalizedValue, duration]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (angle / 360) * circumference;

  const getColor = (value: number) => {
    // Map -100 to 100 to a color scheme with better contrast
    if (value <= -66) {
      return "#FF3B3B"; // Bright red
    } else if (value <= -33) {
      return "#FF8C3B"; // Bright orange
    } else if (value < 33) {
      return "#FFB23B"; // Bright amber
    } else if (value < 66) {
      return "#4CAF50"; // Medium green
    } else {
      return "#2E7D32"; // Dark green
    }
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-foreground/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={getColor(normalizedValue)}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span
        className="absolute font-semibold"
        style={{ color: getColor(normalizedValue) }}
        aria-live="polite"
        aria-valuenow={Math.round(currentValue)}
        aria-valuemin={-100}
        aria-valuemax={100}
      >
        {Math.round(currentValue)}
      </span>
    </div>
  );
}
