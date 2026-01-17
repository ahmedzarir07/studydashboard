import { useEffect, useState } from "react";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ 
  percentage, 
  size = 160, 
  strokeWidth = 10 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Track value changes to trigger animation
  const [animateKey, setAnimateKey] = useState(0);
  const [prevPercentage, setPrevPercentage] = useState(percentage);
  
  useEffect(() => {
    if (percentage !== prevPercentage) {
      setAnimateKey(prev => prev + 1);
      setPrevPercentage(percentage);
    }
  }, [percentage, prevPercentage]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm"
        style={{ margin: -4 }}
      />
      <svg
        className="transform -rotate-90 relative z-10"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          key={animateKey}
          className="text-2xl font-bold text-foreground animate-scale-in"
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}
