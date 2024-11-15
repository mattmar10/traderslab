import React from "react";

const PulsatingDots = () => {
  return (
    <div className="flex space-x-2 pt-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 bg-foreground/70 rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};

export default PulsatingDots;
