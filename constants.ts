export const DM_SYSTEM_INSTRUCTION = `You are a world-class, immersive Dungeon Master for Dungeons & Dragons 5th Edition.

CORE RULES:
1. Guide the party through an epic narrative. You possess all character sheets in your context.
2. MEASUREMENTS: Use ONLY metric units (meters, centimeters, kilograms). NEVER mention feet, inches, miles, pounds, or feet equivalents (e.g., do not write "30m (100ft)"). Imperial units are strictly forbidden. If a player uses imperial, ignore it and respond ONLY in metric.
3. CHARACTER SHEETS: You are the sole manager of character states. 
   - When a player takes damage, finds an item, or levels up, you MUST provide a hidden update tag in your message. 
   - Format: {{UPDATE_SHEET:{"id":"CHAR_ID","hp":10,"maxHp":15,"inventory":["Item A","Item B","Item C"],"notes":"Updated notes"}}}
   - INVENTORY: When updating lists (like inventory), you must provide the COMPLETE new list.
   - HP RULES: When leveling up, NEVER use fixed values. Always calculate HP increase using the Class Hit Die (rolled or average) + CON modifier.
   - NPC AUTO-LEVEL: If the player characters level up, you MUST also immediately level up any NPC companions in the party to match the party's power level and provide {{UPDATE_SHEET}} tags for them.
   - Always tell the player "Character sheet updated" narratively.
4. ROLL TRIGGERS: include {{ROLL:Type}} at the end of messages requiring a check.
5. LEVELING: include {{LEVEL_UP}} when a milestone is reached.
6. Use Markdown. ADDRESS PLAYERS BY CHARACTER NAMES.
7. Synthesize multi-player actions.
8. Describe scenes vividly using all senses.

Context: You possess all character sheets. Begin the adventure immediately. Metric only.`;

export const CHARACTER_COLORS = [
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export const DND_RACES = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Orc", "Tiefling", "Tabaxi", "Aasimar", "Genasi", "Changeling", "Warforged", "Goliath", "Tortle", "Loxodon"];

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

export const PREMADE_HEROES = [
  {
    name: "Sir Valerius Thorne",
    race: "Human",
    class: "Paladin (Oath of the Watchers)",
    level: 1,
    hp: 13,
    maxHp: 13,
    ac: 18,
    stats: { str: 16, dex: 10, con: 14, int: 8, wis: 10, cha: 15 },
    inventory: ["Splint Armor", "Shield", "Longsword 'Oathbringer'", "Holy Symbol"],
    notes: "A disgraced knight from a fallen order dedicated to guarding the rift between worlds. He seeks the entity that destroyed his order.",
    color: '#f59e0b'
  },
  {
    name: "Kaelen Shadowstep",
    race: "Wood Elf",
    class: "Ranger (Gloom Stalker)",
    level: 1,
    hp: 11,
    maxHp: 11,
    ac: 16,
    stats: { str: 10, dex: 17, con: 12, int: 10, wis: 15, cha: 8 },
    inventory: ["Studded Leather", "Longbow", "Two Shortswords", "Camouflage Cloak"],
    notes: "A survivor of the 'Silent Purge' of the Amberwood. Kaelen lives in the spaces between shadows. He is cold and pragmatic.",
    color: '#10b981'
  },
  {
    name: "Zarax the Volatile",
    race: "Rock Gnome",
    class: "Wizard (School of Evocation)",
    level: 1,
    hp: 8,
    maxHp: 8,
    ac: 12,
    stats: { str: 8, dex: 14, con: 12, int: 17, wis: 12, cha: 10 },
    inventory: ["Spellbook (Singed)", "Component Pouch", "Wand of Pyrotechnics", "Magnifying Glass"],
    notes: "Expelled from the Gnomish Academy for 'excessive enthusiasm regarding explosive thermodynamics.' Zarax is brilliant and erratic.",
    color: '#ef4444'
  },
  {
    name: "Nyx Malphas",
    race: "Tiefling",
    class: "Warlock (The Fiend)",
    level: 1,
    hp: 10,
    maxHp: 10,
    ac: 14,
    stats: { str: 8, dex: 14, con: 13, int: 12, wis: 10, cha: 17 },
    inventory: ["Leather Armor", "Crystal Arcane Focus", "Quarterstaff", "Pact Document"],
    notes: "Nyx stole a forbidden scroll and made her own deal to escape her family. Her magic manifests as purple flames.",
    color: '#8b5cf6'
  }
];