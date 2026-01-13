import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useCustomization } from "@/contexts/CustomizationContext";

export const Clock = () => {
  const [time, setTime] = useState(new Date());
  const { hasCustomBackground } = useCustomization();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const cardClasses = hasCustomBackground
    ? "p-6 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl"
    : "p-6 bg-white/80 backdrop-blur-sm border-2 border-[#006241]/20 shadow-lg";

  return (
    <Card className={cardClasses}>
      <div className="text-center">
        <p className="text-5xl md:text-7xl font-mono font-bold text-[#006241]">
          {formatTime(time)}
        </p>
        <p className="text-lg md:text-xl text-[#006241]/70 mt-2">
          {formatDate(time)}
        </p>
      </div>
    </Card>
  );
};
