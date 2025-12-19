import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface FamilyUpdatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FamilyUpdatesModal = ({ open, onOpenChange }: FamilyUpdatesModalProps) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchFeed();
    }
  }, [open]);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss", {
        body: { url: "https://nc01911451.schoolwires.net/site/RSS.aspx?DomainID=147&ModuleInstanceID=4225&PageID=346&PMIID=41120" },
      });
      if (error) throw error;
      setItems(data.items || []);
    } catch (err) {
      setError("Failed to load updates. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gradient-to-br from-emerald-50 to-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#006241]">Family Updates</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-8">{error}</p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-white border-2 border-[#006241]/10 hover:border-[#006241]/30 transition-colors"
                >
                  <h3 className="font-semibold text-[#006241] mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  <p className="text-xs text-[#006241]/50 mt-2">
                    {new Date(item.pubDate).toLocaleDateString()}
                  </p>
                </a>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
