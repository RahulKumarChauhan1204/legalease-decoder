import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult, ComparisonResult } from "../types";

const ANALYSIS_PROMPT = `
  You are an expert legal decoder. Analyze this document and provide a deep summary.
  1. PERSONA: Identify who this document targets (e.g. Student, Freelancer, Employee, Startup, Consumer).
  2. SCORE: Provide a Complexity Score from 1-10.
  3. MULTILINGUAL: Provide a summary in English and Hindi.
  4. RISKS: Identify specific red flags (predatory clauses, hidden penalties, auto-renewals, privacy risks). 
     For EACH risk:
     - Quote the specific clause.
     - Explain WHY it's risky.
     - Provide a "Suggested Safer Alternative" (Action Recommendation).
  5. CARDS: Summarize key areas into cards: Termination, Payment, Liability, Data Usage, Jurisdiction.
  6. JARGON: Create a dictionary of 5+ complex terms found in the text.

  Return ONLY valid JSON matching the AnalysisResult structure.
`;

const COMPARISON_PROMPT = `
  You are a legal comparison engine. Compare Document A (Baseline) and Document B (New).
  Identify:
  1. What was ADDED, REMOVED, or MODIFIED.
  2. The IMPACT of each change (Positive, Negative, or Neutral).
  3. A summary of how the overall risk profile has shifted.
  
  Return ONLY valid JSON matching the ComparisonResult structure.
`;

const getApiKey = () => {
  // 1. Try Vite-specific env (standard for browser apps)
  try {
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (viteKey) return viteKey;
  } catch (e) {}

  // 2. Try window-injected config (if any)
  try {
    const winKey = (window as any).VITE_GEMINI_API_KEY;
    if (winKey) return winKey;
  } catch (e) {}

  // 3. Fallback to process.env with strict check
  try {
    if (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  } catch (e) {}

  return null;
};

// Log startup status
console.log("LegalEase Decoder Service: Initialized. Key present:", !!getApiKey());

export const analyzeLegalDocument = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please create a .env.local file in your project root and add: VITE_GEMINI_API_KEY=your_key_here");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // <-- UPDATED HERE
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: {
            type: SchemaType.OBJECT,
            properties: {
              en: { type: SchemaType.STRING },
              hi: { type: SchemaType.STRING }
            },
            required: ['en', 'hi']
          },
          complexityScore: { type: SchemaType.NUMBER },
          persona: { type: SchemaType.STRING },
          verdict: { type: SchemaType.STRING },
          risks: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                category: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                severity: { type: SchemaType.STRING },
                clause: { type: SchemaType.STRING },
                whyRisky: { type: SchemaType.STRING },
                recommendation: { type: SchemaType.STRING },
                alternativeClause: { type: SchemaType.STRING }
              },
              required: ['category', 'description', 'severity', 'clause', 'whyRisky', 'recommendation']
            }
          },
          clauseCards: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                summary: { type: SchemaType.STRING },
                icon: { type: SchemaType.STRING }
              },
              required: ['title', 'summary', 'icon']
            }
          },
          hiddenFees: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                item: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                estimatedCost: { type: SchemaType.STRING }
              },
              required: ['item', 'description']
            }
          },
          jargonTranslator: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                term: { type: SchemaType.STRING },
                plainEnglish: { type: SchemaType.STRING }
              },
              required: ['term', 'plainEnglish']
            }
          }
        },
        required: ['summary', 'complexityScore', 'persona', 'verdict', 'risks', 'clauseCards', 'hiddenFees', 'jargonTranslator']
      }
    }
  });
  
  try {
    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: mimeType } },
      { text: ANALYSIS_PROMPT }
    ]);
    
    const response = await result.response;
    const text = response.text();
    console.log("AI Raw Response:", text);
    
    if (!text) throw new Error("AI returned empty content");
    
    try {
      return JSON.parse(text) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error. Text was:", text);
      throw new Error("AI returned invalid data format. Please try again.");
    }
  } catch (error) {
    console.error("Deep Analysis failed:", error);
    throw error;
  }
};

export const compareDocuments = async (file1: { data: string, mime: string, name: string }, file2: { data: string, mime: string, name: string }): Promise<ComparisonResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // <-- UPDATED HERE
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING },
          changes: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                type: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                impact: { type: SchemaType.STRING },
                originalText: { type: SchemaType.STRING },
                newText: { type: SchemaType.STRING }
              },
              required: ['type', 'description', 'impact']
            }
          },
          riskShift: { type: SchemaType.STRING }
        },
        required: ['summary', 'changes', 'riskShift']
      }
    }
  });
  
  try {
    const result = await model.generateContent([
      { text: `Document A (${file1.name}):` },
      { inlineData: { data: file1.data, mimeType: file1.mime } },
      { text: `Document B (${file2.name}):` },
      { inlineData: { data: file2.data, mimeType: file2.mime } },
      { text: COMPARISON_PROMPT }
    ]);
    
    const response = await result.response;
    const text = response.text();
    console.log("Comparison Raw Response:", text);
    
    if (!text) throw new Error("Comparison returned empty content");
    
    try {
      const parsed = JSON.parse(text);
      return { ...parsed, baselineName: file1.name, comparisonName: file2.name } as ComparisonResult;
    } catch (parseError) {
      console.error("Comparison JSON Parse Error. Text was:", text);
      throw new Error("AI returned invalid comparison data. Please try again.");
    }
  } catch (error) {
    console.error("Comparison failed:", error);
    throw error;
  }
};

export const createChatSession = (docData: string, mimeType: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // <-- UPDATED HERE
    systemInstruction: "You are a legal assistant trained to answer questions about the provided document. Use simple language. Be concise. If the user asks about risks, identify them clearly. Always add a disclaimer that you are an AI assistant and not a lawyer."
  });
  
  return model.startChat({
    history: [
      {
        role: "user",
        parts: [
          { inlineData: { data: docData, mimeType: mimeType } },
          { text: "Please read this document and prepare to answer my questions." }
        ]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have reviewed the document and am ready to answer any questions you have about it." }]
      }
    ]
  });
};

