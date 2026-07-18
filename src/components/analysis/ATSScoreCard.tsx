import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ATSScoreCardProps {
  score: number;
  label: string;
}

export function ATSScoreCard({ score, label }: ATSScoreCardProps) {
  const [display, setDisplay] = useState(0);
  const size = 176;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;

  useEffect(() => {
    const start = Date.now();
    const duration = 900;
    const id = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setDisplay(Math.round(score * t));
      if (t >= 1) window.clearInterval(id);
    }, 20);
    return () => window.clearInterval(id);
  }, [score]);

  return (
    <Card className="overflow-hidden border-border/70">
      <CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row md:gap-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              className="fill-none stroke-muted"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              strokeLinecap="round"
              className="fill-none stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight text-foreground">{display}%</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Match ATS
            </span>
          </div>
        </motion.div>
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-foreground">Match ATS</h3>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
