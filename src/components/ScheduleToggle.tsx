import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ScheduleToggleProps {
  isALunch: boolean;
  onToggle: (value: boolean) => void;
}

export const ScheduleToggle = ({ isALunch, onToggle }: ScheduleToggleProps) => {
  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-[#FFCD00]/50 shadow-lg">
      <div className="flex items-center justify-center gap-4">
        <Label
          htmlFor="schedule-toggle"
          className={`text-lg font-semibold transition-colors ${
            !isALunch ? "text-[#006241]" : "text-[#006241]/40"
          }`}
        >
          B-Lunch
        </Label>
        <Switch
          id="schedule-toggle"
          checked={isALunch}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-[#006241] data-[state=unchecked]:bg-[#FFCD00]"
        />
        <Label
          htmlFor="schedule-toggle"
          className={`text-lg font-semibold transition-colors ${
            isALunch ? "text-[#006241]" : "text-[#006241]/40"
          }`}
        >
          A-Lunch
        </Label>
      </div>
    </Card>
  );
};
