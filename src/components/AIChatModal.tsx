import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
}

interface AIChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini Flash", cost: "$0.075/M in" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini Flash Lite", cost: "$0.02/M in" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", cost: "$0.15/M in" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano", cost: "$0.05/M in" },
];

export const AIChatModal = ({ open, onOpenChange }: AIChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("google/gemini-2.5-flash");
  const [totalUsage, setTotalUsage] = useState<Usage>({
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    cost: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: [...messages, userMessage], model },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = { role: "assistant", content: data.content };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.usage) {
        setTotalUsage((prev) => ({
          prompt_tokens: prev.prompt_tokens + data.usage.prompt_tokens,
          completion_tokens: prev.completion_tokens + data.usage.completion_tokens,
          total_tokens: prev.total_tokens + data.usage.total_tokens,
          cost: prev.cost + data.usage.cost,
        }));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl text-[#006241] flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#FFCD00]" />
            AI Assistant
          </DialogTitle>
          <p className="text-sm text-[#006241]/60">By Unity AI Solutions & Alex Scott</p>
        </DialogHeader>

        {/* Model Selector & Usage */}
        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#006241]/10">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  <span className="flex items-center justify-between gap-2">
                    {m.label}
                    <span className="text-xs text-muted-foreground">{m.cost}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-[#006241]/60 text-right">
            <div>Tokens: {totalUsage.total_tokens.toLocaleString()}</div>
            <div>Est. Cost: ${totalUsage.cost.toFixed(6)}</div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center text-[#006241]/50 py-8">
                <Bot className="h-12 w-12 mx-auto mb-2 text-[#006241]/30" />
                <p>Start a conversation!</p>
                <p className="text-xs mt-1">Ask me anything about homework, school, or general questions.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#006241] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#006241] text-white"
                      : "bg-white border border-[#006241]/20"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#FFCD00] flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-[#006241]" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#006241] flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="bg-white border border-[#006241]/20 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#006241]/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-[#006241]/40 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-[#006241]/40 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t border-[#006241]/10">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-[#006241] hover:bg-[#006241]/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
