import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AIResponse {
  summary: string;
  followUpQuestion?: string;
  options?: Array<{
    label: string;
    type: 'yes' | 'no' | 'option';
  }>;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
  }>;
}

export function useInlineAISearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const askAI = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: query }],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment.');
        }
        if (response.status === 402) {
          throw new Error('Service temporarily unavailable.');
        }
        throw new Error('Failed to get AI response');
      }

      // Parse streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullText += content;
          } catch {
            // Partial JSON, continue
          }
        }
      }

      // Parse the AI response to extract summary, products, and follow-up question
      const parsedResponse = parseAIResponse(fullText);
      setAIResponse(parsedResponse);
      
    } catch (err) {
      console.error('AI Search error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setAIResponse(null);
    setError(null);
  }, []);

  const answerFollowUp = useCallback(async (answer: string, originalQuery: string) => {
    await askAI(`${originalQuery}. My answer: ${answer}`);
  }, [askAI]);

  return {
    isLoading,
    aiResponse,
    error,
    askAI,
    clearResponse,
    answerFollowUp,
  };
}

function parseAIResponse(text: string): AIResponse {
  // Extract the first sentence as summary (before first period or newline)
  let summary = '';
  let followUpQuestion = '';
  const options: Array<{ label: string; type: 'yes' | 'no' | 'option' }> = [];
  const products: Array<{ id: string; name: string; price: number; category: string; image?: string }> = [];

  // Remove any JSON action blocks from display text
  const cleanText = text.replace(/```json[\s\S]*?```/g, '').trim();
  
  // Split into sentences
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim());
  
  if (sentences.length > 0) {
    // First meaningful sentence is the summary
    summary = sentences[0].trim();
    if (summary.length > 120) {
      summary = summary.substring(0, 117) + '...';
    }
  }

  // Look for question marks in the text - that's the follow-up question
  const questionMatch = cleanText.match(/([^.!]*\?)/g);
  if (questionMatch && questionMatch.length > 0) {
    // Get the last question as the follow-up
    followUpQuestion = questionMatch[questionMatch.length - 1].trim();
    
    // Detect if it's a yes/no question
    const yesNoPatterns = /\b(would you like|do you want|shall i|should i|are you|is that|does that|can i|may i)\b/i;
    if (yesNoPatterns.test(followUpQuestion)) {
      options.push({ label: 'Yes', type: 'yes' });
      options.push({ label: 'No', type: 'no' });
    } else {
      // Try to extract options from the text (look for bullet points or numbered lists)
      const bulletPattern = /[•\-\*]\s*\*?\*?([^•\-\*\n]+?)(?:\*?\*?)(?:\s*–|\s*-|\s*\$)/g;
      let match;
      while ((match = bulletPattern.exec(cleanText)) !== null && options.length < 4) {
        const optionText = match[1].trim();
        if (optionText.length > 0 && optionText.length < 30) {
          options.push({ label: optionText, type: 'option' });
        }
      }
      
      // If no options found, provide generic ones based on context
      if (options.length === 0) {
        if (cleanText.toLowerCase().includes('size') || cleanText.toLowerCase().includes('capacity')) {
          options.push({ label: 'Small', type: 'option' });
          options.push({ label: 'Medium', type: 'option' });
          options.push({ label: 'Large', type: 'option' });
        } else if (cleanText.toLowerCase().includes('budget') || cleanText.toLowerCase().includes('price')) {
          options.push({ label: 'Under $50k', type: 'option' });
          options.push({ label: '$50k-$80k', type: 'option' });
          options.push({ label: 'Over $80k', type: 'option' });
        }
      }
    }
  }

  // Extract product mentions from the text
  const productPatterns = [
    /\*\*([^*]+)\*\*\s*[–-]\s*\$?([\d,]+)/g,
    /•\s*([^–\-$\n]+)[–-]\s*\$?([\d,]+)/g,
  ];

  for (const pattern of productPatterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null && products.length < 6) {
      const name = match[1].trim();
      const priceStr = match[2].replace(/,/g, '');
      const price = parseInt(priceStr, 10);
      
      if (name && !isNaN(price)) {
        // Determine category from name
        let category = 'Product';
        if (name.toLowerCase().includes('spa') || name.toLowerCase().includes('tub')) {
          category = 'Spa';
        } else if (name.toLowerCase().includes('pool') || /tuscan|enchantment|olympia|corinthian|laguna/i.test(name)) {
          category = 'Pool';
        } else if (name.toLowerCase().includes('sauna')) {
          category = 'Sauna';
        } else if (name.toLowerCase().includes('paver')) {
          category = 'Paver';
        }
        
        products.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          price,
          category,
        });
      }
    }
  }

  return {
    summary: summary || "I'd be happy to help you find what you're looking for!",
    followUpQuestion: followUpQuestion || undefined,
    options: options.length > 0 ? options : undefined,
    products: products.length > 0 ? products : undefined,
  };
}
