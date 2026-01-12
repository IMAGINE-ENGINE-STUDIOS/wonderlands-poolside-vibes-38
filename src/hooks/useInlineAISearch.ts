import { useState, useCallback } from 'react';

interface AIResponse {
  summary: string;
  followUpQuestion?: string;
  needsTextInput?: boolean;
  showCalculator?: 'pavers' | 'screen' | 'fence' | 'lanai' | 'pool' | null;
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
        `https://bwngxlbnavnhbtahyzbf.supabase.co/functions/v1/ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bmd4bGJuYXZuaGJ0YWh5emJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzM0NjMsImV4cCI6MjA2ODU0OTQ2M30.MaEd-hUQAK9S1zaC5L1Caev2oEPCpnIzBJ1kPCv3uOU`,
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
  let summary = '';
  let followUpQuestion = '';
  let needsTextInput = false;
  let showCalculator: 'pavers' | 'screen' | 'fence' | 'lanai' | 'pool' | null = null;
  const options: Array<{ label: string; type: 'yes' | 'no' | 'option' }> = [];
  const products: Array<{ id: string; name: string; price: number; category: string; image?: string }> = [];

  // Clean markdown formatting
  let cleanText = text
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();

  // Extract the first sentence as summary
  const firstSentenceMatch = cleanText.match(/^[^.!?]*[.!?]/);
  if (firstSentenceMatch) {
    summary = firstSentenceMatch[0].trim();
  } else {
    // If no sentence ending, take first 100 chars
    summary = cleanText.substring(0, 100).trim();
  }

  // Check for calculator triggers
  const lowerText = cleanText.toLowerCase();
  if (lowerText.includes('paver') && (lowerText.includes('dimension') || lowerText.includes('area') || lowerText.includes('square'))) {
    showCalculator = 'pavers';
  } else if (lowerText.includes('screen') && (lowerText.includes('dimension') || lowerText.includes('size'))) {
    showCalculator = 'screen';
  } else if (lowerText.includes('fence') && (lowerText.includes('perimeter') || lowerText.includes('linear') || lowerText.includes('feet'))) {
    showCalculator = 'fence';
  } else if (lowerText.includes('lanai') && (lowerText.includes('dimension') || lowerText.includes('size'))) {
    showCalculator = 'lanai';
  }

  // Look for questions - determine if text input is needed
  const questionMatch = cleanText.match(/([^.!]*\?)/g);
  if (questionMatch && questionMatch.length > 0) {
    followUpQuestion = questionMatch[questionMatch.length - 1].trim();
    
    // Check if it's a yes/no question
    const yesNoPatterns = /\b(would you like|do you want|shall i|should i|are you interested|does that|can i|may i)\b/i;
    if (yesNoPatterns.test(followUpQuestion)) {
      options.push({ label: 'Yes', type: 'yes' });
      options.push({ label: 'No', type: 'no' });
    } else {
      // Questions about dimensions, sizes, budgets need text input
      const textInputPatterns = /\b(dimension|size|area|backyard|budget|price range|how (big|large|much)|what.*looking for|perimeter|length|width|feet|sqft)\b/i;
      if (textInputPatterns.test(followUpQuestion)) {
        needsTextInput = true;
      } else {
        // Provide contextual options
        if (lowerText.includes('pool')) {
          options.push({ label: 'Small', type: 'option' });
          options.push({ label: 'Medium', type: 'option' });
          options.push({ label: 'Large', type: 'option' });
        } else if (lowerText.includes('price') || lowerText.includes('budget')) {
          options.push({ label: 'Under $50k', type: 'option' });
          options.push({ label: '$50k-$80k', type: 'option' });
          options.push({ label: 'Over $80k', type: 'option' });
        } else {
          needsTextInput = true;
        }
      }
    }
  }

  // Extract products - new pattern without markdown
  const productPattern = /([A-Z][a-zA-Z\s\d.']+)\s*[-–]\s*\$?([\d,]+)/g;
  let match;
  while ((match = productPattern.exec(cleanText)) !== null && products.length < 6) {
    const name = match[1].trim();
    const priceStr = match[2].replace(/,/g, '');
    const price = parseInt(priceStr, 10);
    
    // Filter out invalid matches
    if (name && !isNaN(price) && price > 1000 && name.length > 3 && name.length < 50) {
      // Skip if it looks like a dimension (e.g., "14ft x 30ft")
      if (/^\d+ft|\d+'\s*x/i.test(name)) continue;
      
      // Determine category from name
      let category = 'Pool';
      if (name.toLowerCase().includes('spa') || name.toLowerCase().includes('tub')) {
        category = 'Spa';
      } else if (name.toLowerCase().includes('sauna')) {
        category = 'Sauna';
      } else if (name.toLowerCase().includes('paver') || name.toLowerCase().includes('appian')) {
        category = 'Paver';
      } else if (name.toLowerCase().includes('gate')) {
        category = 'Gate';
      }
      
      products.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        price,
        category,
      });
    }
  }

  return {
    summary: summary || "I'd be happy to help you find what you're looking for!",
    followUpQuestion: followUpQuestion || undefined,
    needsTextInput,
    showCalculator,
    options: options.length > 0 ? options : undefined,
    products: products.length > 0 ? products : undefined,
  };
}
