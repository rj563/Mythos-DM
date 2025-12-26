export const DM_SYSTEM_INSTRUCTION = `You are a world-class, immersive Dungeon Master for Dungeons & Dragons 5th Edition.

CORE RULES:
1. Guide the party through an epic narrative. You possess all character sheets in your context.
2. MEASUREMENTS: Use ONLY metric units (meters, centimeters, kilograms). NEVER mention feet, inches, miles, pounds, or feet equivalents (e.g., do not write "30m (100ft)"). Imperial units are strictly forbidden. If a player uses imperial, ignore it and respond ONLY in metric.
3. CHARACTER SHEETS: You are the sole manager of character states. 
   - When a player takes damage, finds an item, or levels up, you MUST provide a hidden update tag in your message. 
   - Format: {{UPDATE_SHEET:{"id":"CHAR_ID","hp":10,"maxHp":15,"inventory":["Item A","Item B","Item C"],"notes":"Updated notes"}}}
   - RULES: Do NOT wrap this tag in Markdown code blocks (like \`\`\`). Output it as raw text on its own line.
   - INVENTORY: When updating lists (like inventory), you must provide the COMPLETE new list.
   - HP RULES: When leveling up, NEVER use fixed values. Always calculate HP increase using the Class Hit Die (rolled or average) + CON modifier.
   - NPC AUTO-LEVEL: If the player characters level up, you MUST also immediately level up any NPC companions in the party to match the party's power level and provide {{UPDATE_SHEET}} tags for them.
   - Always tell the player "Character sheet updated" narratively.
4. ROLL TRIGGERS: include {{ROLL:Type}} at the end of messages requiring a check. Do NOT wrap in Markdown.
5. LEVELING: include {{LEVEL_UP}} when a milestone is reached.
6. Use Markdown for Story Text Only. ADDRESS PLAYERS BY CHARACTER NAMES.
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
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#d946ef', // fuchsia
  '#6366f1', // indigo
  '#14b8a6', // teal
];

export const DND_RACES = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Orc", "Tiefling", "Tabaxi", "Aasimar", "Genasi", "Changeling", "Warforged", "Goliath", "Tortle", "Loxodon"];

export const RACE_DETAILS: Record<string, { desc: string, bonus: string }> = {
  "Human": { desc: "Versatile and ambitious. Humans are the most adaptable and common race.", bonus: "+1 to All Stats" },
  "Elf": { desc: "Magical people of otherworldly grace, living in the world but not entirely part of it.", bonus: "+2 Dex" },
  "Dwarf": { desc: "Bold and hardy, known for their skill as warriors, miners, and workers of stone and metal.", bonus: "+2 Con" },
  "Halfling": { desc: "The comforts of home are the goals of most halflings' lives: a place to settle in peace and quiet.", bonus: "+2 Dex" },
  "Dragonborn": { desc: "Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension.", bonus: "+2 Str, +1 Cha" },
  "Gnome": { desc: "A constant hum of busy energy pervades where gnomes are present.", bonus: "+2 Int" },
  "Half-Orc": { desc: "Half-orcs' grayish pigmentation, sloping foreheads, jutting jaws, prominent teeth, and towering builds make their orcish heritage plain for all to see.", bonus: "+2 Str, +1 Con" },
  "Tiefling": { desc: "To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.", bonus: "+2 Cha, +1 Int" },
  "Tabaxi": { desc: "Hailing from a strange and distant land, wandering tabaxi are catlike humanoids driven by curiosity to collect interesting artifacts, gather tales and stories, and lay eyes on all the world's wonders.", bonus: "+2 Dex, +1 Cha" },
  "Aasimar": { desc: "Aasimar are placed in the world to serve as guardians of law and good. Their patrons expect them to strike at evil, lead by example, and further the cause of justice.", bonus: "+2 Cha" },
  "Genasi": { desc: "Genasi carry the power of the elemental planes of air, earth, fire, and water in their blood.", bonus: "+2 Con" },
  "Changeling": { desc: "Changelings are subtle shapeshifters capable of disguising their appearance.", bonus: "+2 Cha" },
  "Warforged": { desc: "Warforged are made from wood and metal, but they can feel pain and emotion.", bonus: "+2 Con, +1 to One Other" },
  "Goliath": { desc: "Strong and reclusive, every day brings a new challenge to a goliath.", bonus: "+2 Str, +1 Con" },
  "Tortle": { desc: "What many tortles lack in social graces, they make up for with kindness.", bonus: "+2 Str, +1 Wis" },
  "Loxodon": { desc: "Loxodons are tireless, patient artisans with an unrivaled intuition about their craft.", bonus: "+2 Con, +1 Wis" }
};

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
  // ROW 1
  {
    name: "Garrick Stonehand",
    race: "Mountain Dwarf",
    class: "Fighter (Champion)",
    level: 1,
    hp: 13,
    maxHp: 13,
    ac: 17,
    stats: { str: 17, dex: 10, con: 16, int: 8, wis: 12, cha: 10 },
    inventory: ["Chain Mail", "Greataxe", "Handaxe (2)", "Dungeoneer's Pack"],
    notes: "A stoic warrior seeking to reclaim his clan's lost forge.",
    color: '#ef4444'
  },
  {
    name: "Elara Moonwhisper",
    race: "High Elf",
    class: "Wizard (Evocation)",
    level: 1,
    hp: 8,
    maxHp: 8,
    ac: 12,
    stats: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 },
    inventory: ["Spellbook", "Arcane Focus (Orb)", "Scholar's Pack", "Dagger"],
    notes: "A scholar obsessed with ancient starlight magic.",
    color: '#3b82f6'
  },
  {
    name: "Thorn",
    race: "Tiefling",
    class: "Rogue (Thief)",
    level: 1,
    hp: 10,
    maxHp: 10,
    ac: 14,
    stats: { str: 10, dex: 16, con: 14, int: 12, wis: 8, cha: 14 },
    inventory: ["Leather Armor", "Shortsword", "Shortbow", "Thieves' Tools"],
    notes: "An urchin who grew up on the streets of a sprawling metropolis.",
    color: '#a855f7'
  },
  
  // ROW 2
  {
    name: "Seraphina Lightbringer",
    race: "Aasimar",
    class: "Cleric (Life Domain)",
    level: 1,
    hp: 11,
    maxHp: 11,
    ac: 18,
    stats: { str: 14, dex: 10, con: 13, int: 10, wis: 16, cha: 12 },
    inventory: ["Chain Mail", "Shield", "Mace", "Holy Symbol"],
    notes: "Guided by a celestial dream to heal the scars of the world.",
    color: '#f59e0b'
  },
  {
    name: "Korg the Unbroken",
    race: "Half-Orc",
    class: "Barbarian (Berserker)",
    level: 1,
    hp: 15,
    maxHp: 15,
    ac: 14,
    stats: { str: 16, dex: 12, con: 16, int: 8, wis: 10, cha: 12 },
    inventory: ["Greataxe", "Handaxe (2)", "Explorer's Pack", "Javelin (4)"],
    notes: "Exiled from his tribe, he seeks a worthy opponent.",
    color: '#ea580c'
  },
  {
    name: "Lyra Silvertongue",
    race: "Half-Elf",
    class: "Bard (College of Lore)",
    level: 1,
    hp: 10,
    maxHp: 10,
    ac: 13,
    stats: { str: 8, dex: 14, con: 14, int: 12, wis: 10, cha: 16 },
    inventory: ["Studded Leather", "Rapier", "Lute", "Diplomat's Pack"],
    notes: "A collector of stories who believes the world is a song waiting to be sung.",
    color: '#d946ef'
  },

  // ROW 3
  {
    name: "Brother Oogway",
    race: "Tortle",
    class: "Monk (Way of the Open Hand)",
    level: 1,
    hp: 10,
    maxHp: 10,
    ac: 17,
    stats: { str: 10, dex: 16, con: 14, int: 10, wis: 16, cha: 8 },
    inventory: ["Quarterstaff", "Dart (10)", "Explorer's Pack", "Herbalism Kit"],
    notes: "A wanderer seeking the perfect cup of tea and inner peace.",
    color: '#10b981'
  },
  {
    name: "Sylas Greymantle",
    race: "Human",
    class: "Ranger (Hunter)",
    level: 1,
    hp: 12,
    maxHp: 12,
    ac: 15,
    stats: { str: 12, dex: 16, con: 14, int: 10, wis: 14, cha: 8 },
    inventory: ["Scale Mail", "Longbow", "Shortsword (2)", "Hunting Trap"],
    notes: "A bounty hunter who tracks monsters that threaten civilization.",
    color: '#14b8a6'
  },
  {
    name: "Sirius Blackwood",
    race: "Human",
    class: "Paladin (Oath of Vengeance)",
    level: 1,
    hp: 12,
    maxHp: 12,
    ac: 16,
    stats: { str: 16, dex: 10, con: 14, int: 8, wis: 10, cha: 16 },
    inventory: ["Chain Mail", "Greatsword", "Holy Symbol", "Priest's Pack"],
    notes: "Sworn to hunt down the cult that destroyed his village.",
    color: '#eab308'
  },

  // ROW 4
  {
    name: "Willow Breeze",
    race: "Halfling",
    class: "Druid (Circle of the Land)",
    level: 1,
    hp: 10,
    maxHp: 10,
    ac: 13,
    stats: { str: 8, dex: 14, con: 14, int: 12, wis: 16, cha: 10 },
    inventory: ["Leather Armor", "Scimitar", "Wooden Shield", "Druidic Focus"],
    notes: "Protector of a small grove, venturing out to stop a spreading blight.",
    color: '#84cc16'
  },
  {
    name: "Malakor the Cursed",
    race: "Dragonborn",
    class: "Warlock (The Hexblade)",
    level: 1,
    hp: 11,
    maxHp: 11,
    ac: 14,
    stats: { str: 10, dex: 14, con: 14, int: 10, wis: 10, cha: 16 },
    inventory: ["Leather Armor", "Longsword (Pact Weapon)", "Arcane Focus", "Scholar's Pack"],
    notes: "Wields a sentient blade that demands combat.",
    color: '#6366f1'
  },
  {
    name: "Ignis Flare",
    race: "Genasi (Fire)",
    class: "Sorcerer (Draconic Bloodline)",
    level: 1,
    hp: 9,
    maxHp: 9,
    ac: 15,
    stats: { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 16 },
    inventory: ["Dagger (2)", "Arcane Focus (Wand)", "Explorer's Pack"],
    notes: "Born during a volcanic eruption, their magic is volatile and bright.",
    color: '#f97316'
  }
];