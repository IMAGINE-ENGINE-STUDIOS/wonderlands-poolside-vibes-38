import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Mic, MicOff, Trash2, Sparkles, ShoppingCart, ExternalLink } from 'lucide-react';
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

function AIMessageBubble({ message, onAction }: { message: Message; onAction: (action: ProductAction) => void }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isUser 
          ? 'bg-primary text-primary-foreground rounded-br-md' 
          : 'bg-muted text-foreground rounded-bl-md'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.action && (
          <div className="mt-3 pt-3 border-t border-border/50">
            {message.action.action === 'navigate' && message.action.product && (
              <Button 
                size="sm" 
                variant="secondary"
                className="gap-2"
                onClick={() => onAction(message.action!)}
              >
                <ExternalLink className="w-3 h-3" />
                View {message.action.product.name}
              </Button>
            )}
            {message.action.action === 'add_to_cart' && message.action.product && (
              <Button 
                size="sm" 
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => onAction(message.action!)}
              >
                <ShoppingCart className="w-3 h-3" />
                Add to Cart - ${message.action.product.price.toLocaleString()}
              </Button>
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Wonderlands AI</h2>
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
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Welcome to Wonderlands AI!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              I can help you find the perfect pool, calculate costs, and answer any questions about our products.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.message)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <AIMessageBubble 
                key={message.id} 
                message={message} 
                onAction={executeAction}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
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
            className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick actions when chat has messages */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {quickActions.slice(0, 2).map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction(action.message)}
                disabled={isLoading}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
