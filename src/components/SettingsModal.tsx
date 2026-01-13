import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCustomization, CustomizationSettings } from "@/contexts/CustomizationContext";
import { Upload, X, RotateCcw } from "lucide-react";
import { useRef } from "react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fontOptions: { value: CustomizationSettings['fontFamily']; label: string; className: string }[] = [
  { value: 'default', label: 'Default', className: 'font-sans' },
  { value: 'serif', label: 'Serif', className: 'font-serif' },
  { value: 'mono', label: 'Monospace', className: 'font-mono' },
  { value: 'rounded', label: 'Rounded', className: 'font-rounded' },
];

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const {
    settings,
    setFontFamily,
    setBackgroundImage,
    setShowPercentage,
    resetSettings,
  } = useCustomization();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px on longest side)
        let { width, height } = img;
        const maxDim = 1920;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try WebP first, fallback to JPEG
        let result = canvas.toDataURL('image/webp', 0.85);
        if (result.length > 2 * 1024 * 1024) {
          result = canvas.toDataURL('image/webp', 0.7);
        }
        if (result.length > 2 * 1024 * 1024) {
          result = canvas.toDataURL('image/jpeg', 0.7);
        }
        
        resolve(result);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      alert('Image too large. Please choose an image under 8MB.');
      return;
    }

    try {
      // If over 2MB, compress to WebP
      if (file.size > 2 * 1024 * 1024) {
        const compressed = await compressImage(file);
        setBackgroundImage(compressed);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setBackgroundImage(result);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image. Please try another.');
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeBackground = () => {
    setBackgroundImage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-[#006241] text-xl">Customize Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Font Selection */}
          <div className="space-y-3">
            <Label className="text-[#006241] font-semibold">Font Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {fontOptions.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setFontFamily(font.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${font.className} ${
                    settings.fontFamily === font.value
                      ? 'border-[#006241] bg-[#006241]/10'
                      : 'border-[#006241]/20 hover:border-[#006241]/40'
                  }`}
                >
                  <span className="text-[#006241]">{font.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Image */}
          <div className="space-y-3">
            <Label className="text-[#006241] font-semibold">Background Image</Label>
            <div className="space-y-2">
              {settings.backgroundImage ? (
                <div className="relative">
                  <img
                    src={settings.backgroundImage}
                    alt="Background preview"
                    className="w-full h-24 object-cover rounded-lg border-2 border-[#006241]/20"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeBackground}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-[#006241]/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#006241]/50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-[#006241]/50 mb-1" />
                  <span className="text-sm text-[#006241]/50">Click to upload</span>
                  <span className="text-xs text-[#006241]/30">Max 8MB (auto-compressed)</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {settings.backgroundImage && (
                <p className="text-xs text-[#006241]/60">
                  Panels will use glassmorphism effect with custom backgrounds
                </p>
              )}
            </div>
          </div>

          {/* Show Percentage Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[#006241] font-semibold">Show Class Percentage</Label>
              <p className="text-sm text-[#006241]/60">
                Display completion % for current period
              </p>
            </div>
            <Switch
              checked={settings.showPercentage}
              onCheckedChange={setShowPercentage}
              className="data-[state=checked]:bg-[#006241]"
            />
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full border-[#006241]/20 text-[#006241] hover:bg-[#006241]/10"
            onClick={resetSettings}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
