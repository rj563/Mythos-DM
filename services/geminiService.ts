import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { DM_SYSTEM_INSTRUCTION } from "../constants";
import { Message, GeminiModelId, Character, LevelUpChoice } from "../types";

export interface ClassSuggestion {
  className: string;
  subclassName: string;
  flavorText: string;
}

export class GeminiDMService {
  private chatSession: Chat | null = null;

  private getClient(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public isActive(): boolean {
    return this.chatSession !== null;
  }

  public async suggestClasses(concept: string, race: string, modelId: GeminiModelId): Promise<ClassSuggestion | null> {
    const ai = this.getClient();
    const prompt = `You are a D&D 5e character creation expert. A player wants to create a character with this concept: "${concept}" and is playing as a ${race}. 
    
    CRITICAL INSTRUCTION:
    Do not limit yourself to standard tropes. Suggest **WILD, EXOTIC, AND UNCONVENTIONAL** combinations. 
    Use extended sourcebooks (Tasha's, Xanathar's, etc.) for inspiration. 
    Multiclassing is highly encouraged if it creates a unique flavor.
    
    Based on their description, provide exactly ONE perfect match suggestion.
    Explain why this specific combination matches their dream calling in 2-3 sentences.
    Provide the response in JSON format.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            className: { type: Type.STRING, description: "The main class or multiclass string" },
            subclassName: { type: Type.STRING, description: "The subclass name or 'Custom Mix'" },
            flavorText: { type: Type.STRING, description: "Explanation of why this is the perfect match" },
          },
          required: ["className", "subclassName", "flavorText"],
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '{}');
      return data as ClassSuggestion;
    } catch (e) {
      console.error("Failed to parse class suggestion", e);
      return null;
    }
  }

  public async getLevelUpOptions(character: Character, modelId: GeminiModelId): Promise<LevelUpChoice[]> {
    const ai = this.getClient();
    const prompt = `As a D&D 5e DM, suggest 3 thematic options for ${character.name} (a ${character.race} ${character.class} reaching Level ${character.level + 1}).
    Options can be new spells, subclass features, or specialized skills based on their current notes: "${character.notes}".
    Return as a JSON array of objects with 'category', 'name', and 'description'.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["category", "name", "description"],
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Level up parsing error", e);
      return [];
    }
  }

  public async generateCharacterSheet(name: string, race: string, className: string, backstory: string, modelId: GeminiModelId): Promise<Partial<Character>> {
    const ai = this.getClient();
    const prompt = `As a D&D 5e character designer, generate a complete starting (Level 1) character sheet for:
    Name: ${name}
    Race: ${race}
    Class: ${className}
    Backstory: ${backstory}

    MANDATORY RULES:
    1. Assign Stats using Standard Array (15, 14, 13, 12, 10, 8) optimized for this build.
    2. Calculate HP correctly: (Class Hit Die Max + CON modifier). DO NOT GUESS. Use the actual rule.
    3. Calculate AC based on appropriate starting armor for this class.
    4. Provide a rich starting Inventory (weapons, armor, tools, packs).
    5. List all starting Spells (Cantrips and 1st level) or primary Class Features (like Rage, Sneak Attack, etc.) in the 'notes' section.
    
    Make the character feel unique and "exotic" if the class allows.
    Return as JSON matching the Character interface.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stats: {
              type: Type.OBJECT,
              properties: {
                str: { type: Type.INTEGER },
                dex: { type: Type.INTEGER },
                con: { type: Type.INTEGER },
                int: { type: Type.INTEGER },
                wis: { type: Type.INTEGER },
                cha: { type: Type.INTEGER },
              },
              required: ["str", "dex", "con", "int", "wis", "cha"],
            },
            hp: { type: Type.INTEGER },
            maxHp: { type: Type.INTEGER },
            ac: { type: Type.INTEGER },
            inventory: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            notes: { type: Type.STRING, description: "Detailed list of Spells, Cantrips, and Class Features" },
          },
          required: ["stats", "hp", "maxHp", "ac", "inventory", "notes"],
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse generated character sheet", e);
      return {};
    }
  }

  public async startAdventure(party: Character[], history: Message[], modelId: GeminiModelId): Promise<{ text: string, tokens?: number }> {
    const ai = this.getClient();

    const partyContext = party.map(char => {
      return `Character: ${char.name}
Race: ${char.race}
Class: ${char.class}
Stats: STR ${char.stats.str}, DEX ${char.stats.dex}, CON ${char.stats.con}, INT ${char.stats.int}, WIS ${char.stats.wis}, CHA ${char.stats.cha}
HP: ${char.hp}/${char.maxHp}, AC: ${char.ac}
Inventory: ${char.inventory.join(', ')}
Features/Spells/Backstory: ${char.notes}`;
    }).join('\n\n---\n\n');

    const finalSystemInstruction = `${DM_SYSTEM_INSTRUCTION}

CURRENT PARTY INFORMATION:
${partyContext}

The players have completed character creation. Begin the adventure immediately. Use metric units.`;

    const historyParam = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    this.chatSession = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.8,
        topP: 0.95,
      },
      history: historyParam,
    });

    if (history.length === 0) {
      const initialPrompt = "Greetings, Dungeon Master. Our party is assembled and our character sheets are complete. We are ready to begin our journey. Please introduce yourself and set the starting scene for us.";
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
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_EXPIRED");
      }
      throw error;
    }
  }
}

export const dmService = new GeminiDMService();