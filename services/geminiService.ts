
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { DM_SYSTEM_INSTRUCTION } from "../constants";
import { Message } from "../types";

export class GeminiDMService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  public async startAdventure(history: Message[]): Promise<string> {
    const formattedHistory = history.map(msg => ({
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
      // Note: In some SDK versions history is passed differently, 
      // but usually provided at creation or through consecutive sends.
    });

    // If there's existing history, we'd need to rebuild the state. 
    // For simplicity in this demo, we'll start fresh or simulate.
    const initialPrompt = history.length === 0 
      ? "Greetings, Dungeon Master. I am ready to begin my adventure. Please introduce yourself and set the starting scene."
      : "Continuing from our last session: " + history[history.length - 1].text;

    const response = await this.chatSession.sendMessage({ message: initialPrompt });
    return response.text || "The DM remains silent...";
  }

  public async sendMessage(text: string): Promise<string> {
    if (!this.chatSession) {
      throw new Error("Adventure not started");
    }
    const response = await this.chatSession.sendMessage({ message: text });
    return response.text || "The DM nods, but says nothing.";
  }
  
  public async streamMessage(text: string, onChunk: (chunk: string) => void): Promise<void> {
     if (!this.chatSession) {
      throw new Error("Adventure not started");
    }
    const result = await this.chatSession.sendMessageStream({ message: text });
    for await (const chunk of result) {
      onChunk(chunk.text || "");
    }
  }
}

export const dmService = new GeminiDMService();
