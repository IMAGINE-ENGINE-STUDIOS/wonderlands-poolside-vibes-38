import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Trash2, Sparkles, ShoppingCart, ExternalLink, Receipt, SlidersHorizontal, Box, Calculator, Compass, PenLine, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIAssistant, Message, ProductAction } from '@/contexts/AIAssistantContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

const quickActions = [
  { label: 'Find a pool', message: 'Help me find the right pool for my backyard' },
  { label: 'Compare options', message: 'What are the differences between your pool models?' },
  { label: 'Get a quote', message: 'I want to get a quote for a complete pool package' },
  { label: 'Paver pricing', message: 'What are your paver options and pricing?' },
];

/* The Genius menu — the same flagship design language as Foss Theory:
   gradient medallion cards, layered shadows, the orb's own palette. */
const CAPABILITIES = [
  { icon: Sparkles, title: 'Find my pool', sub: 'Matched to your yard, family and budget', message: 'Help me find the right pool for my backyard', tone: 'linear-gradient(135deg,#38bdf8,#2563eb)' },
  { icon: Receipt, title: 'Build a quote', sub: 'Itemized, from real catalog prices', message: 'I want to get a quote for a complete pool package', tone: 'linear-gradient(135deg,#60a5fa,#1e40af)' },
  { icon: SlidersHorizontal, title: 'Finishes & options', sub: 'See any pool in the finish you love', message: 'Help me choose the finish and options for my pool', tone: 'linear-gradient(135deg,#22d3ee,#0e7490)' },
  { icon: Box, title: 'Design my backyard', sub: 'Lay it out in the 2D and 3D studios', message: 'I want to design my backyard — take me to the design studio', tone: 'linear-gradient(135deg,#818cf8,#4338ca)' },
  { icon: Calculator, title: 'Cost calculator', sub: 'Running cost, energy and upkeep', message: 'Help me calculate the cost of owning a pool', tone: 'linear-gradient(135deg,#93c5fd,#1d4ed8)' },
  { icon: Compass, title: 'Browse the catalog', sub: 'Every pool, spa and outdoor product', message: 'Show me the full catalog', tone: 'linear-gradient(135deg,#7dd3fc,#0369a1)' },
  { icon: PenLine, title: 'Write it for me', sub: 'Posts, descriptions, messages — done', message: 'Write something for me', tone: 'linear-gradient(135deg,#a78bfa,#6d28d9)' },
  { icon: Video, title: 'Talk to the team, live', sub: 'Face to face, right in the browser', message: 'I want to talk to a person live about my project', tone: 'linear-gradient(135deg,#4f46e5,#172554)' },
];

function Orb({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full bg-[radial-gradient(circle_at_32%_30%,#93c5fd,#2563eb_58%,#1e3a8a)] shadow-[0_0_18px_rgba(37,99,235,0.45)]',
        className,
      )}
    />
  );
}

function AIMessageBubble({ message, onAction }: { message: Message; onAction: (action: ProductAction) => void }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && <Orb className="mt-1 h-8 w-8" />}
      <div className={cn(
        'max-w-[80%] rounded-[20px] px-4 py-3',
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-muted text-foreground rounded-bl-md'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {message.action && (
          <div className="mt-3 pt-3 border-t border-border/50">
            {message.action.action === 'navigate' && message.action.product && (
              <button
                onClick={() => onAction(message.action!)}
                className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_22px_-10px_rgba(0,0,0,0.55)] transition hover:bg-zinc-700 active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View {message.action.product.name}
              </button>
            )}
            {message.action.action === 'add_to_cart' && message.action.product && (
              <button
                onClick={() => onAction(message.action!)}
                className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-10px_rgba(37,99,235,0.65)] transition hover:brightness-110 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart - ${message.action.product.price.toLocaleString()}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AIAssistantChat() {
  const { isOpen, messages, isLoading, closeChat, sendMessage, clearHistory, executeAction } = useAIAssistant();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: voiceSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setInput('');
    await sendMessage(message);
  };

  const handleQuickAction = async (message: string) => {
    if (isLoading) return;
    await sendMessage(message);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-[linear-gradient(120deg,rgba(59,130,246,0.10),rgba(14,116,144,0.07))] p-4">
        <div className="flex items-center gap-3">
          <Orb className="h-10 w-10" />
          <div>
            <h2 className="font-semibold tracking-tight text-foreground">Genius</h2>
            <p className="text-xs text-muted-foreground">Your pool & outdoor expert</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeChat}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="relative px-5 py-5">
            {/* Ambient light behind the header — the orb's own weather. */}
            <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent_65%)]" />
            <div className="relative">
              <Orb className="h-12 w-12" />
              <h3 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-foreground">
                What are we creating?
              </h3>
              <p className="mt-1.5 max-w-[320px] text-sm leading-relaxed text-muted-foreground">
                Everything Genius can do is right here — or just type or talk below.
              </p>
            </div>
            <div className="relative mt-5 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <button
                  key={c.title}
                  onClick={() => handleQuickAction(c.message)}
                  disabled={isLoading}
                  className="group flex flex-col items-start gap-3 rounded-[24px] bg-[linear-gradient(180deg,#ffffff,#fafafa)] px-4 py-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_36px_-20px_rgba(15,23,42,0.25)] ring-1 ring-zinc-900/[0.07] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(16,24,40,0.06),0_24px_44px_-20px_rgba(15,23,42,0.32)] hover:ring-zinc-900/[0.12] active:scale-[0.98] disabled:opacity-50"
                >
                  <span
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_18px_-8px_rgba(30,58,138,0.55)]"
                    style={{ background: c.tone }}
                  >
                    <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent_55%)]" />
                    <c.icon className="relative h-[22px] w-[22px] text-white" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-snug tracking-tight text-zinc-900">{c.title}</span>
                    <span className="mt-1 block text-xs leading-snug text-zinc-500">{c.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            {messages.map((message) => (
              <AIMessageBubble
                key={message.id}
                message={message}
                onAction={executeAction}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <Orb className="h-8 w-8 animate-pulse" />
                <div className="bg-muted rounded-[20px] rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Voice status indicator */}
      {isListening && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <div className="flex items-center gap-2 text-sm text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening... {interimTranscript && <span className="text-muted-foreground">"{interimTranscript}"</span>}
          </div>
        </div>
      )}

      {voiceError && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-xs text-destructive">{voiceError}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          {voiceSupported && (
            <Button
              type="button"
              variant={isListening ? 'destructive' : 'outline'}
              size="icon"
              onClick={toggleVoice}
              className={cn(
                'flex-shrink-0',
                isListening && 'animate-pulse'
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about pools..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] shadow-[0_10px_22px_-10px_rgba(37,99,235,0.7)] transition hover:brightness-110"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick actions when chat has messages */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {quickActions.slice(0, 2).map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.message)}
                disabled={isLoading}
                className="rounded-full bg-white/85 px-3.5 py-2 text-[13px] font-medium text-zinc-800 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_8px_20px_-12px_rgba(15,23,42,0.35)] ring-1 ring-zinc-900/10 backdrop-blur transition hover:bg-zinc-900 hover:text-white active:scale-95 disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
