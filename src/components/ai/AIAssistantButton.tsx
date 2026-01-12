import React from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { cn } from '@/lib/utils';

interface AIAssistantButtonProps {
  className?: string;
}

export function AIAssistantButton({ className }: AIAssistantButtonProps) {
  const { openChat, isOpen } = useAIAssistant();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => openChat()}
          className={cn(
            'relative rounded-full w-11 h-11 bg-gradient-to-r from-purple-500 to-blue-500',
            'hover:from-purple-600 hover:to-blue-600 shadow-lg transition-all duration-300',
            'hover:scale-105 hover:shadow-purple-500/25 hover:shadow-xl',
            isOpen && 'ring-2 ring-purple-400 ring-offset-2 ring-offset-background',
            className
          )}
        >
          <Bot className="h-5 w-5 text-white" />
          {/* Pulse indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          {/* Glow effect */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-md opacity-50 -z-10" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium">
        <p>AI Assistant</p>
        <p className="text-xs text-muted-foreground">Ask me anything about our products</p>
      </TooltipContent>
    </Tooltip>
  );
}
