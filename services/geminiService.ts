import { GoogleGenAI, Type } from "@google/genai";
import { ExperimentPlan } from '../types';

export const generateExperimentPlan = async (goal: string): Promise<ExperimentPlan> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert Machine Learning Engineer and Data Scientist.
    Your task is to design a comparative experiment plan for the following user goal: "${goal}".
    
    1. Identify 3-4 distinct models or algorithms that would be suitable candidates to test against this goal.
    2. For each candidate, provide a realistic simulation of the results you might expect (Accuracy, Latency in ms, Model Size in MB).
    3. Ensure the metrics reflect the typical trade-offs (e.g., lighter models might have lower latency but slightly lower accuracy).
    4. Choose a "winner" based on the user's specific constraint (e.g., if they asked for speed, prioritize latency).
    5. Provide a brief analysis of the user's goal.
    
    Return the response strictly as a JSON object matching the schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 2048 },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          planTitle: { type: Type.STRING, description: "A catchy title for the experiment suite" },
          goalAnalysis: { type: Type.STRING, description: "Brief analysis of what the user wants to achieve" },
          experiments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING, description: "Name of the model/algorithm (e.g. ResNet50)" },
                description: { type: Type.STRING, description: "Why this model was chosen" },
                simulatedMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    accuracy: { type: Type.NUMBER, description: "Value between 0 and 1" },
                    latencyMs: { type: Type.NUMBER },
                    modelSizeMb: { type: Type.NUMBER }
                  },
                  required: ["accuracy", "latencyMs", "modelSizeMb"]
                }
              },
              required: ["id", "name", "description", "simulatedMetrics"]
            }
          },
          recommendedWinnerId: { type: Type.STRING },
          summary: { type: Type.STRING, description: "A concluding insight about the best model" }
        },
        required: ["planTitle", "goalAnalysis", "experiments", "recommendedWinnerId", "summary"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  try {
    const data = JSON.parse(response.text);
    // Add initial status and progress to the parsed data
    return {
      ...data,
      experiments: data.experiments.map((exp: any) => ({ 
        ...exp, 
        status: 'pending',
        progress: 0
      }))
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid JSON response from Gemini");
  }
};