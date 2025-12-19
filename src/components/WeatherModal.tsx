import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  high: number;
  low: number;
}

interface WeatherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RALEIGH_LAT = 35.7796;
const RALEIGH_LON = -78.6382;

export const WeatherModal = ({ open, onOpenChange }: WeatherModalProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchWeather();
    }
  }, [open]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${RALEIGH_LAT}&longitude=${RALEIGH_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York`
      );
      const data = await response.json();
      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
      });
    } catch (err) {
      setError("Failed to load weather. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="h-16 w-16 text-[#FFCD00]" />;
    if (code <= 48) return <Cloud className="h-16 w-16 text-gray-400" />;
    return <CloudRain className="h-16 w-16 text-blue-400" />;
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    return "Stormy";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-sky-50 to-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#006241]">
            Weather - Raleigh, NC
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4 py-8">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-12 w-32 mx-auto" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-8">{error}</p>
        ) : weather ? (
          <div className="text-center space-y-6 py-4">
            <div className="flex flex-col items-center">
              {getWeatherIcon(weather.weatherCode)}
              <p className="text-lg text-[#006241]/70 mt-2">
                {getWeatherDescription(weather.weatherCode)}
              </p>
            </div>
            <p className="text-6xl font-bold text-[#006241]">{weather.temperature}°F</p>
            <p className="text-lg text-[#006241]/60">
              H: {weather.high}° L: {weather.low}°
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-3 bg-[#006241]/5 rounded-lg">
                <Thermometer className="h-6 w-6 mx-auto text-[#006241]" />
                <p className="text-sm text-[#006241]/60 mt-1">Feels Like</p>
                <p className="font-semibold text-[#006241]">{weather.temperature}°</p>
              </div>
              <div className="p-3 bg-[#006241]/5 rounded-lg">
                <Droplets className="h-6 w-6 mx-auto text-blue-500" />
                <p className="text-sm text-[#006241]/60 mt-1">Humidity</p>
                <p className="font-semibold text-[#006241]">{weather.humidity}%</p>
              </div>
              <div className="p-3 bg-[#006241]/5 rounded-lg">
                <Wind className="h-6 w-6 mx-auto text-gray-500" />
                <p className="text-sm text-[#006241]/60 mt-1">Wind</p>
                <p className="font-semibold text-[#006241]">{weather.windSpeed} mph</p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
