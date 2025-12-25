
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { DM_SYSTEM_INSTRUCTION } from "../constants";
import { Message } from "../types";

export class GeminiDMService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  public async startAdventure(history: Message[]): Promise<{ text: string, tokens?: number }> {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    const historyParam = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    this.chatSession = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: DM_SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
      history: historyParam,
    });

    if (history.length === 0) {
      const initialPrompt = "Greetings, Dungeon Master. I am ready to begin my adventure. Please introduce yourself and set the starting scene.";
      const response = await this.chatSession.sendMessage({ message: initialPrompt });
      return { 
        text: response.text || "The DM remains silent...",
        tokens: response.usageMetadata?.totalTokenCount
      };
    } else {
      return { text: "*(The chronicle glows with familiar magic as the story resumes...)*" };
    }
  }

  public async streamMessage(
    text: string, 
    onChunk: (chunk: string) => void,
    onComplete?: (totalTokens: number) => void
  ): Promise<void> {
    if (!this.chatSession) {
      throw new Error("Adventure not started");
    }
    const result = await this.chatSession.sendMessageStream({ message: text });
    let finalResponse: GenerateContentResponse | null = null;
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      onChunk(c.text || "");
      finalResponse = c; // The last chunk often contains final metadata in some SDK versions, or we track the sequence
    }

    if (onComplete && finalResponse?.usageMetadata?.totalTokenCount) {
      onComplete(finalResponse.usageMetadata.totalTokenCount);
    }
  }
}

export const dmService = new GeminiDMService();
