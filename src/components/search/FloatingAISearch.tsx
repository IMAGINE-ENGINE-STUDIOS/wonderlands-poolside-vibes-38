import * as React from 'react';
const { useState, useEffect, useRef } = React;
import { Search, Bot, Mic, MicOff, Sparkles, X, Loader2, Calculator, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useInlineAISearch } from '@/hooks/useInlineAISearch';
import { InlineCalculator } from '@/components/search/InlineCalculator';
import { cn } from '@/lib/utils';

interface FloatingAISearchProps {
  isInStudio?: boolean;
  onDocked?: () => void;
}

export const FloatingAISearch = ({ isInStudio = false, onDocked }: FloatingAISearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState<'bottom' | 'docked'>('bottom');
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat } = useAIAssistant();
  const { isLoading: aiLoading, aiResponse, askAI, clearResponse, answerFollowUp, setStudioGuidance } = useInlineAISearch();
  
  // Voice input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput();

  // Handle dock animation after 10 seconds in studio
  useEffect(() => {
    if (isInStudio && position === 'bottom') {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setPosition('docked');
          setIsAnimating(false);
          onDocked?.();
        }, 600); // Animation duration
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isInStudio, position, onDocked]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setSearchQuery(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  const handleAskAI = async () => {
    const query = searchQuery.trim() || interimTranscript;
    if (!query) return;
    await askAI(query);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    clearResponse();
  };

  const handleFollowUpAnswer = (answer: string) => {
    answerFollowUp(answer, searchQuery);
  };

  const handleProductClick = (product: { name: string; price: number; category: string }) => {
    const params = new URLSearchParams({
      model: product.name,
      price: product.price.toString(),
      category: product.category,
    });
    
    // If already in studio, just update the URL params
    if (location.pathname.includes('wonderlands-studio')) {
      navigate(`/wonderlands-studio?${params.toString()}`, { replace: true });
      // Trigger guidance for the new product
      setTimeout(() => {
        setStudioGuidance(product.name, product.category);
      }, 500);
    } else {
      navigate(`/wonderlands-studio?${params.toString()}`);
    }
  };

  // Position styles based on state
  const getPositionStyles = () => {
    if (isAnimating) {
      return 'fixed bottom-4 left-1/2 -translate-x-1/2 animate-fly-to-top z-[9999] w-[95vw] max-w-2xl';
    }
    if (position === 'docked') {
      return 'relative w-full';
    }
    return 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[95vw] max-w-2xl';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-all duration-300',
        getPositionStyles()
      )}
    >
      <Card className={cn(
        'overflow-hidden shadow-2xl border-2 backdrop-blur-md',
        isExpanded ? 'border-primary/30' : 'border-primary/20',
        position === 'bottom' && 'bg-background/95'
      )}>
        {/* Collapse/Expand Handle for bottom position */}
        {position === 'bottom' && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center py-1 bg-gradient-to-r from-primary/20 to-teal/20 hover:from-primary/30 hover:to-teal/30 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}

        {/* Search Bar */}
        <div className={cn(
          "flex items-center gap-1.5 p-2 transition-all",
          isListening && "bg-red-500/10",
          aiResponse?.needsTextInput && "bg-green-500/10"
        )}>
          <div className="pl-2">
            <Search className={cn(
              "h-4 w-4 transition-colors",
              aiResponse?.needsTextInput ? "text-green-500" : "text-muted-foreground"
            )} />
          </div>
          
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              isListening ? "Speak now..." : 
              aiResponse?.needsTextInput ? "Type your answer..." :
              "Ask Sarah about products, pricing, features..."
            }
            value={isListening ? (searchQuery + interimTranscript) : searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                handleAskAI();
              }
            }}
            className={cn(
              "flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
              aiResponse?.needsTextInput && "placeholder:text-green-500/70"
            )}
          />
          
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {voiceSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={cn(
                "h-8 w-8 rounded-lg",
                isListening && "bg-red-500 text-white hover:bg-red-600 animate-pulse"
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          
          <Button
            onClick={handleAskAI}
            disabled={aiLoading || !searchQuery.trim()}
            size="sm"
            className="bg-gradient-to-r from-primary to-teal text-white px-3"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expandable AI Response Section */}
        {isExpanded && (aiLoading || aiResponse) && (
          <div className="border-t border-border">
            <ScrollArea className="max-h-80">
              <div className="p-3 space-y-3">
                {/* AI Summary */}
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Sarah is thinking...</span>
                    </div>
                  ) : aiResponse && (
                    <>
                      <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm flex-1">{aiResponse.summary}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openChat()}
                        className="h-6 w-6"
                      >
                        <Bot className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Follow-up Options */}
                {aiResponse?.options && (
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.options.map((option, idx) => (
                      <Button
                        key={idx}
                        variant={option.type === 'yes' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFollowUpAnswer(option.label)}
                        className={cn(
                          "text-xs",
                          option.type === 'yes' && "bg-green-600 hover:bg-green-700"
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Calculator */}
                {aiResponse?.showCalculator && (
                  <InlineCalculator type={aiResponse.showCalculator} onResult={(result) => console.log(result)} />
                )}

                {/* Product Results as Cards - Pool Product Card Style */}
                {aiResponse?.products && aiResponse.products.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium px-1">Suggested Products</p>
                    <Carousel opts={{ align: 'start', loop: false }}>
                      <CarouselContent className="-ml-2">
                        {aiResponse.products.map((product) => (
                          <CarouselItem key={product.id} className="pl-2 basis-1/2 sm:basis-1/3">
                            <Card
                              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all overflow-hidden group"
                              onClick={() => handleProductClick(product)}
                            >
                              {/* Product Image */}
                              {product.image && (
                                <div className="relative h-20 overflow-hidden bg-gradient-to-br from-primary/10 to-teal/10">
                                  <img loading="lazy" decoding="async" 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />
                                  <Badge className="absolute top-1 left-1 text-xs capitalize">
                                    {product.category}
                                  </Badge>
                                </div>
                              )}
                              {/* Product Info */}
                              <div className="p-2">
                                <p className="text-xs font-medium truncate">{product.name}</p>
                                <p className="text-sm font-bold text-primary">
                                  ${product.price.toLocaleString()}
                                </p>
                              </div>
                            </Card>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0" />
                      <CarouselNext className="right-0" />
                    </Carousel>
                  </div>
                )}

                {/* Quick Calculator Buttons */}
                <div className="flex gap-2 pt-1">
                  {['Pavers', 'Screen', 'Fence', 'Lanai'].map((calc) => (
                    <Button
                      key={calc}
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => askAI(`Calculate ${calc.toLowerCase()} cost for my project`)}
                    >
                      <Calculator className="h-3 w-3 mr-1" />
                      {calc}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FloatingAISearch;
