import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingCart } from '@/components/ShoppingCartProvider';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: ProductAction;
}

export interface ProductAction {
  action: 'navigate' | 'add_to_cart' | 'calculate_quote';
  product?: {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    dimensions?: string;
    depth?: string;
  };
  items?: Array<{ name: string; price: number }>;
}

interface AIAssistantContextType {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  executeAction: (action: ProductAction) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
}

const STORAGE_KEY = 'wonderlands-ai-chat-history';

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  const openChat = useCallback((initialMessage?: string) => {
    setIsOpen(true);
    if (initialMessage) {
      // Add a small delay to ensure the chat is open before sending
      setTimeout(() => {
        sendMessageInternal(initialMessage);
      }, 100);
    }
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const parseActionFromResponse = (content: string): { cleanContent: string; action?: ProductAction } => {
    // Look for JSON action block at the end of the message
    const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```\s*$/);
    if (jsonMatch) {
      try {
        const action = JSON.parse(jsonMatch[1]) as ProductAction;
        const cleanContent = content.replace(/```json\s*\{[\s\S]*?\}\s*```\s*$/, '').trim();
        return { cleanContent, action };
      } catch (e) {
        console.error('Failed to parse action JSON:', e);
      }
    }
    return { cleanContent: content };
  };

  const executeAction = useCallback((action: ProductAction) => {
    switch (action.action) {
      case 'navigate':
        if (action.product) {
          const params = new URLSearchParams({
            model: action.product.name,
            price: action.product.price.toString(),
            category: action.product.category,
            ...(action.product.dimensions && { dimensions: action.product.dimensions }),
            ...(action.product.depth && { depth: action.product.depth }),
            ...(action.product.image && { image: action.product.image }),
          });
          navigate(`/wonderlands-studio?${params.toString()}`);
          closeChat();
          toast.success(`Viewing ${action.product.name}`);
        }
        break;
      case 'add_to_cart':
        if (action.product) {
          addToCart({
            id: action.product.id,
            name: action.product.name,
            price: action.product.price,
            image: action.product.image || '/placeholder.svg',
            category: action.product.category,
          });
          toast.success(`Added ${action.product.name} to cart`);
        }
        break;
      case 'calculate_quote':
        if (action.items && action.items.length > 0) {
          const total = action.items.reduce((sum, item) => sum + item.price, 0);
          toast.info(`Quote total: $${total.toLocaleString()}`);
        }
        break;
    }
  }, [navigate, addToCart, closeChat]);

  const sendMessageInternal = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 402) {
          toast.error('AI credits exhausted. Please contact support.');
        } else {
          toast.error(errorData.error || 'Failed to get response');
        }
        setIsLoading(false);
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantMessageId = (Date.now() + 1).toString();
      let textBuffer = '';

      // Add placeholder assistant message
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch {
            // Incomplete JSON, wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Parse any action from the final response
      const { cleanContent, action } = parseActionFromResponse(assistantContent);
      
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: cleanContent, action }
          : m
      ));

    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    await sendMessageInternal(content);
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Chat history cleared');
  }, []);

  return (
    <AIAssistantContext.Provider value={{
      isOpen,
      messages,
      isLoading,
      openChat,
      closeChat,
      sendMessage,
      clearHistory,
      executeAction,
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
}
