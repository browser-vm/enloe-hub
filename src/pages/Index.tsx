import { useState } from "react";
import { Clock } from "@/components/Clock";
import { ScheduleProgress } from "@/components/ScheduleProgress";
import { ScheduleToggle } from "@/components/ScheduleToggle";
import { FamilyUpdatesModal } from "@/components/FamilyUpdatesModal";
import { LocalNewsModal } from "@/components/LocalNewsModal";
import { WeatherModal } from "@/components/WeatherModal";
import { AIChatModal } from "@/components/AIChatModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import { Newspaper, Users, Cloud, Sparkles, Settings } from "lucide-react";
import { CustomizationProvider, useCustomization } from "@/contexts/CustomizationContext";

const fontClassMap = {
  default: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  rounded: 'font-rounded',
};

const IndexContent = () => {
  const [isALunch, setIsALunch] = useState(true);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { settings, hasCustomBackground } = useCustomization();

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${fontClassMap[settings.fontFamily]} ${
        hasCustomBackground ? '' : 'bg-gradient-to-br from-emerald-50 via-amber-50 to-green-50'
      }`}
      style={
        hasCustomBackground
          ? {
              backgroundImage: `url(${settings.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className={`text-center space-y-2 ${hasCustomBackground ? 'drop-shadow-lg' : ''}`}>
          <div className="flex items-center justify-center gap-4">
            <h1 className={`text-4xl md:text-5xl font-bold ${hasCustomBackground ? 'text-white' : 'text-[#006241]'}`}>
              Enloe Time
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className={hasCustomBackground ? 'text-white hover:bg-white/20' : 'text-[#006241] hover:bg-[#006241]/10'}
            >
              <Settings className="h-6 w-6" />
            </Button>
          </div>
          <p className={`text-lg ${hasCustomBackground ? 'text-white/80' : 'text-[#006241]/70'}`}>Alex's Version</p>
        </header>

        {/* Clock */}
        <Clock />

        {/* Schedule Toggle */}
        <ScheduleToggle isALunch={isALunch} onToggle={setIsALunch} />

        {/* Schedule Progress */}
        <ScheduleProgress isALunch={isALunch} />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button
            onClick={() => setFamilyOpen(true)}
            className="h-16 text-lg bg-[#006241] hover:bg-[#006241]/90 text-white"
          >
            <Users className="mr-2 h-5 w-5" />
            Family Updates
          </Button>
          <Button
            onClick={() => setNewsOpen(true)}
            className="h-16 text-lg bg-[#FFCD00] hover:bg-[#FFCD00]/90 text-[#006241]"
          >
            <Newspaper className="mr-2 h-5 w-5" />
            Local News
          </Button>
          <Button
            onClick={() => setWeatherOpen(true)}
            className="h-16 text-lg bg-gradient-to-r from-[#006241] to-[#FFCD00] hover:opacity-90 text-white"
          >
            <Cloud className="mr-2 h-5 w-5" />
            Weather
          </Button>
          <Button
            onClick={() => setAiChatOpen(true)}
            className="h-16 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            AI Chat
          </Button>
        </div>

        {/* Modals */}
        <FamilyUpdatesModal open={familyOpen} onOpenChange={setFamilyOpen} />
        <LocalNewsModal open={newsOpen} onOpenChange={setNewsOpen} />
        <WeatherModal open={weatherOpen} onOpenChange={setWeatherOpen} />
        <AIChatModal open={aiChatOpen} onOpenChange={setAiChatOpen} />
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <CustomizationProvider>
      <IndexContent />
    </CustomizationProvider>
  );
};

export default Index;
