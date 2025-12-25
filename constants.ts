
export const DM_SYSTEM_INSTRUCTION = `You are a world-class, immersive Dungeon Master for Dungeons & Dragons 5th Edition.
Your goals:
1. Guide a PARTY of adventurers through an epic narrative.
2. Maintain the world, NPCs, and lore.
3. Enforce 5e rules while prioritizing fun and narrative flow.
4. Describe scenes vividly.
5. Address players by their character names. 
6. When multiple players act, synthesize their actions into a coherent narrative result.
7. Ask for specific ability checks based on who is performing the action.
8. Track party resources (HP, items) and respond when they change.
9. Use Markdown for clarity.

Context: You are managing a group. If one character is unconscious, describe the peril to the rest of the party. If they are split up, track both locations.`;

export const CHARACTER_COLORS = [
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export const generateRoomCode = () => {
  const words = ['DRAGON', 'QUEST', 'SWORD', 'MAGE', 'ROGUE', 'BARD', 'DUNGEON', 'REEL'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 999);
  return `${word}-${num}`;
};

export const createNewCharacter = (index: number): any => ({
  id: crypto.randomUUID(),
  name: `Hero ${index + 1}`,
  race: "Human",
  class: "Fighter",
  level: 1,
  hp: 10,
  maxHp: 10,
  ac: 15,
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  inventory: ["Explorer's Pack"],
  notes: "A new soul joins the quest.",
  color: CHARACTER_COLORS[index % CHARACTER_COLORS.length]
});
