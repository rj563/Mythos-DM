
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { DM_SYSTEM_INSTRUCTION } from "../constants";
import { Message } from "../types";

export class GeminiDMService {
  private chatSession: Chat | null = null;

  private getClient(): GoogleGenAI {
    // Creating a fresh instance to ensure the latest API key from the environment/dialog is used
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  public async startAdventure(history: Message[]): Promise<{ text: string, tokens?: number }> {
    const ai = this.getClient();

    const historyParam = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    this.chatSession = ai.chats.create({
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
      // Re-initialize if session was lost but history exists (simplified for demo)
      throw new Error("Adventure not started");
    }

    try {
      const result = await this.chatSession.sendMessageStream({ message: text });
      let finalResponse: GenerateContentResponse | null = null;
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        onChunk(c.text || "");
        finalResponse = c;
      }

      if (onComplete && finalResponse?.usageMetadata?.totalTokenCount) {
        onComplete(finalResponse.usageMetadata.totalTokenCount);
      }
    } catch (error: any) {
      // If the error suggests the key is invalid or not found, we trigger a re-selection flow in the UI
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_EXPIRED");
      }
      throw error;
    }
  }
}

export const dmService = new GeminiDMService();
