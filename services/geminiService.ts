
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
    // Re-initialize AI client to ensure freshest API Key if it changed
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    // Format history for the Gemini API
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
      return response.text || "The DM remains silent...";
    } else {
      // If history exists, we don't necessarily need to send a new message immediately, 
      // but we might want to ask the DM to recap or simply acknowledge.
      // For this app, we'll just return a confirmation that the chronicle is restored.
      return "*(The chronicle glows with familiar magic as the story resumes...)*";
    }
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
