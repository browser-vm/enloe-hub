import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CustomizationSettings {
  fontFamily: 'default' | 'serif' | 'mono' | 'rounded';
  backgroundImage: string | null;
  showPercentage: boolean;
}

const defaultSettings: CustomizationSettings = {
  fontFamily: 'default',
  backgroundImage: null,
  showPercentage: true,
};

interface CustomizationContextType {
  settings: CustomizationSettings;
  setFontFamily: (font: CustomizationSettings['fontFamily']) => void;
  setBackgroundImage: (image: string | null) => void;
  setShowPercentage: (show: boolean) => void;
  hasCustomBackground: boolean;
  resetSettings: () => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

const STORAGE_KEY = 'enloe-customization';

export const CustomizationProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<CustomizationSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load customization settings:', e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save customization settings:', e);
    }
  }, [settings]);

  const setFontFamily = (fontFamily: CustomizationSettings['fontFamily']) => {
    setSettings(prev => ({ ...prev, fontFamily }));
  };

  const setBackgroundImage = (backgroundImage: string | null) => {
    setSettings(prev => ({ ...prev, backgroundImage }));
  };

  const setShowPercentage = (showPercentage: boolean) => {
    setSettings(prev => ({ ...prev, showPercentage }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasCustomBackground = !!settings.backgroundImage;

  return (
    <CustomizationContext.Provider
      value={{
        settings,
        setFontFamily,
        setBackgroundImage,
        setShowPercentage,
        hasCustomBackground,
        resetSettings,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (context === undefined) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};
