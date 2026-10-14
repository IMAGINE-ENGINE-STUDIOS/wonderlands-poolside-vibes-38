import { useState, useCallback } from 'react';
import { findProductInfo } from '@/data/poolProductLookup';
import { supabase } from '@/integrations/supabase/client';
import { answerPriceQuestion, answerIntent, buildKnowledgeDigest, intentProducts } from '@/lib/geniusKnowledge';
import { detectLanguage, translateText } from '@/lib/genius/geniusLanguage';
import { PLATFORM_TOOLS, matchPlatformTools } from '@/lib/genius/platformTools';

interface AIResponse {
  summary: string;
  followUpQuestion?: string;
  needsTextInput?: boolean;
  showCalculator?: 'pavers' | 'screen' | 'fence' | 'lanai' | 'pool' | null;
  isStudioGuide?: boolean;
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
    dimensions?: string;
    depth?: string;
  }>;
}

export function useInlineAISearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [navigatedProduct, setNavigatedProduct] = useState<{ name: string; category: string } | null>(null);

  const askAI = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Genius = one agent for the whole platform (Groq via the `genius` function).
      const clean = query.replace(/^I'm looking for:\s*/i, '').replace(/\s*\(Answer in [^)]+\.\)\s*$/, '');
      const lang = detectLanguage(clean);
      const local = answerPriceQuestion(clean) ?? (lang.startsWith('en') ? null : answerIntent(clean));
      let fullText = local ?? '';
      if (!local) {
        const tools = PLATFORM_TOOLS.map((t) => `${t.label} (${t.route}): ${t.description}`).join('\n');
        const { data, error } = await supabase.functions.invoke('genius', {
          body: {
            messages: [{ role: 'user', content: clean }],
            context: { scope: 'site search', route: window.location.pathname },
            catalog: `${buildKnowledgeDigest()}\n\nPLATFORM TOOLS\n${tools}`,
          },
        });
        if (error || !data?.reply) {
          // Service down: the catalog still answers locally instead of failing.
          const fb = answerIntent(clean);
          if (!fb) throw new Error(data?.error || 'Genius is unavailable right now');
          fullText = fb;
        } else fullText = String(data.reply);
      }
      const tool = matchPlatformTools(clean, 1)[0];
      if (tool) fullText += ` You can open the ${tool.label} at ${tool.route}.`;
      // Parse the AI response to extract summary, products, and follow-up question
      // Always answer in the guest's language (catalog answers are written in English).
      if (!lang.startsWith('en')) fullText = await translateText(fullText, lang);
      const parsedResponse = parseAIResponse(fullText);
      // Real product cards, ordered by price/size as asked (live main-page catalog).
      const picks = intentProducts(clean);
      if (picks.length) {
        parsedResponse.products = picks.map((p, i) => ({
          id: `${p.category}-${p.name}-${i}`,
          name: p.name,
          price: p.price,
          category: p.category,
          image: p.image,
          dimensions: p.dimensions,
          depth: p.depth,
        }));
      }
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
    setNavigatedProduct(null);
  }, []);

  const answerFollowUp = useCallback(async (answer: string, originalQuery: string) => {
    await askAI(`${originalQuery}. My answer: ${answer}`);
  }, [askAI]);

  // Set studio guidance when user navigates to a product
  const setStudioGuidance = useCallback((productName: string, category: string) => {
    setNavigatedProduct({ name: productName, category });
    // Ask AI for studio guidance
    askAI(`User just selected ${productName} (${category}) and is now in Wonderlands Studio. Give them a brief welcome and explain how to customize their selection.`);
  }, [askAI]);

  return {
    isLoading,
    aiResponse,
    error,
    navigatedProduct,
    askAI,
    clearResponse,
    answerFollowUp,
    setStudioGuidance,
  };
}

function parseAIResponse(text: string): AIResponse {
  let summary = '';
  let followUpQuestion = '';
  let needsTextInput = false;
  let showCalculator: 'pavers' | 'screen' | 'fence' | 'lanai' | 'pool' | null = null;
  const options: Array<{ label: string; type: 'yes' | 'no' | 'option' }> = [];
  const products: Array<{ id: string; name: string; price: number; category: string; image?: string; dimensions?: string; depth?: string }> = [];

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
      
      // Look up product info for dimensions and image
      const productInfo = findProductInfo(name);
      
      products.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: productInfo?.name || name,
        price: productInfo?.price || price,
        category: productInfo?.category || category,
        image: productInfo?.image,
        dimensions: productInfo?.dimensions,
        depth: productInfo?.depth,
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
