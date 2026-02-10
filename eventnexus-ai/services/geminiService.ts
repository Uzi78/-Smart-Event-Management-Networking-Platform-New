
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Strictly follow initialization guidelines for GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Generates networking recommendations for a user based on their profile and a list of other attendees.
   */
  async getNetworkingRecommendations(userProfile: any, attendeePool: any[]) {
    try {
      const prompt = `Based on the following user profile:
      Name: ${userProfile.name}
      Company: ${userProfile.company}
      Industry: ${userProfile.industry}
      Interests: ${userProfile.interests?.join(', ') || 'Various tech interests'}

      Suggest 3 matches from these attendees for networking. For each match, provide:
      1. Their Name
      2. Reasoning for the match
      3. A creative conversation starter.

      Attendees: ${JSON.stringify(attendeePool.slice(0, 10))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                starter: { type: Type.STRING },
              },
              required: ['name', 'reason', 'starter']
            }
          }
        }
      });

      // Fix: Direct access to text property
      const text = response.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Recommendations Error:", error);
      return [];
    }
  },

  /**
   * Event Chatbot powered by Gemini (simulated RAG)
   */
  async getChatbotResponse(query: string, eventContext: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: `You are an AI Event Assistant for the platform 'EventNexus'. Use the provided event context to answer queries accurately and politely. If the answer isn't in the context, say you don't know but offer to connect them with staff. Context: ${eventContext}`
        }
      });
      // Fix: Direct access to text property
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      return "I'm having trouble connecting to my brain right now. Please try again!";
    }
  },

  /**
   * OCR for Business Cards
   */
  async scanBusinessCard(base64Image: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: "Extract contact details from this business card: Name, Company, Email, Phone, Role. Return as JSON." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              company: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              role: { type: Type.STRING }
            }
          }
        }
      });
      // Fix: Direct access to text property
      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (error) {
      console.error("OCR Error:", error);
      return null;
    }
  }
};
