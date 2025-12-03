import { GoogleGenAI, Modality, Chat, GenerateContentResponse } from "@google/genai";
import { AARIKA_SYSTEM_PROMPT, TASK_TOOLS } from "../constants";

// Initialize the API client
// NOTE: We do not check for API key existence here to avoid errors at module load time.
// Checks should happen before usage.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export class GeminiService {
  private chat: Chat | null = null;
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      this.ai = getAIClient();
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI", e);
    }
  }

  public initializeChat() {
    if (!this.ai) return null;
    
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: AARIKA_SYSTEM_PROMPT,
        tools: [{ functionDeclarations: TASK_TOOLS }],
        temperature: 0.7,
      },
    });
    return this.chat;
  }

  public async sendMessage(message: string): Promise<GenerateContentResponse> {
    if (!this.chat) {
      throw new Error("Chat not initialized");
    }
    return await this.chat.sendMessage({ message });
  }

  public async sendToolResponse(functionResponses: any[]): Promise<GenerateContentResponse> {
    if (!this.chat) {
        throw new Error("Chat not initialized");
    }
    // sendToolResponse is handled by sending a message with specific parts in the new SDK structure
    return await this.chat.sendMessage({
        message: {
            parts: functionResponses
        }
    });
  }

  public async generateSpeech(text: string): Promise<string | null> {
    if (!this.ai) return null;
    
    // Clean text for better speech synthesis to sound more realistic/human
    // Remove markdown characters that shouldn't be spoken (like ** for bold, * for list, etc.)
    const cleanText = text
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove Bold
      .replace(/(\*|_)(.*?)\1/g, '$2')    // Remove Italic
      .replace(/`([^`]+)`/g, '$1')        // Remove Code ticks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove Link formatting, keep text
      .replace(/^[#*-]\s+/gm, '')         // Remove list bullets and headers at start of line
      .replace(/(https?:\/\/[^\s]+)/g, 'link') // Replace raw URLs with "link"
      .trim();

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is the standard female voice
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio || null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();