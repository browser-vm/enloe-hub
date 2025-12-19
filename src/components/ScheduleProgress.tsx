import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Period {
  name: string;
  start: string;
  end: string;
}

const A_LUNCH_SCHEDULE: Period[] = [
  { name: "1st Period", start: "7:25", end: "8:52" },
  { name: "2nd Period", start: "8:58", end: "10:35" },
  { name: "Lunch", start: "10:41", end: "11:16" },
  { name: "3rd Period", start: "11:20", end: "12:47" },
  { name: "4th Period", start: "12:53", end: "14:20" },
];

const B_LUNCH_SCHEDULE: Period[] = [
  { name: "1st Period", start: "7:25", end: "8:52" },
  { name: "2nd Period", start: "8:58", end: "10:35" },
  { name: "3rd Period", start: "10:41", end: "12:08" },
  { name: "Lunch", start: "12:12", end: "12:47" },
  { name: "4th Period", start: "12:53", end: "14:20" },
];

const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const getCurrentMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

interface ScheduleProgressProps {
  isALunch: boolean;
}

export const ScheduleProgress = ({ isALunch }: ScheduleProgressProps) => {
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutes());
  const schedule = isALunch ? A_LUNCH_SCHEDULE : B_LUNCH_SCHEDULE;

  useEffect(() => {
    const interval = setInterval(() => setCurrentMinutes(getCurrentMinutes()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getPeriodStatus = (period: Period) => {
    const startMinutes = parseTime(period.start);
    const endMinutes = parseTime(period.end);
    const duration = endMinutes - startMinutes;

    if (currentMinutes < startMinutes) {
      return { status: "upcoming", progress: 0 };
    } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      const elapsed = currentMinutes - startMinutes;
      return { status: "active", progress: (elapsed / duration) * 100 };
    } else {
      return { status: "completed", progress: 100 };
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-[#006241]/20 shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-[#006241] text-center mb-4">
        {isALunch ? "A-Lunch" : "B-Lunch"} Schedule
      </h2>
      {schedule.map((period, index) => {
        const { status, progress } = getPeriodStatus(period);
        return (
          <div
            key={index}
            className={`p-4 rounded-lg transition-all ${
              status === "active"
                ? "bg-[#006241]/10 border-2 border-[#006241] scale-[1.02]"
                : status === "completed"
                ? "bg-gray-100 opacity-60"
                : "bg-[#FFCD00]/10"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`font-semibold ${
                  status === "active" ? "text-[#006241]" : "text-[#006241]/70"
                }`}
              >
                {period.name}
                {status === "active" && (
                  <span className="ml-2 text-sm bg-[#006241] text-white px-2 py-0.5 rounded-full">
                    NOW
                  </span>
                )}
              </span>
              <span className="text-sm text-[#006241]/60">
                {formatTimeDisplay(period.start)} - {formatTimeDisplay(period.end)}
              </span>
            </div>
            <Progress
              value={progress}
              className={`h-3 ${
                status === "active" ? "bg-[#FFCD00]/30" : "bg-gray-200"
              }`}
            />
          </div>
        );
      })}
    </Card>
  );
};
