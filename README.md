
# ⚔️ Mythos DM: D&D 5e Adventure Companion

Mythos DM is an immersive, AI-powered Dungeon Master designed for Dungeons & Dragons 5th Edition. It leverages the **Gemini 3 Pro** engine to weave epic narratives, manage party stats, and facilitate real-time multiplayer sagas.

## 🌟 New Features (v2.0)

*   **🛡️ The Iron Lock (Security)**: Multiplayer sessions now enforce strict ownership. Players can only control their own characters in the UI. The Host retains control over NPCs.
*   **🎲 True Rules Engine**: HP leveling is no longer arbitrary. The DM strictly calculates Health Points using Class Hit Die + Constitution modifiers.
*   **🔥 The Wild Forge**: The character creation engine has been tuned to suggest "Wild, Exotic, and Unconventional" class/race combinations for unique playthroughs.
*   **📈 Dynamic World**: NPC Companions now auto-level immediately alongside the party to ensure balanced encounters.

## 核心 Features

*   **AI Dungeon Master**: A specialized Gemini-driven DM that understands 5e rules, tracks party state, and adapts to player choices.
*   **The Gate of Choice**: Play as a **Lone Hero** (local-only) or form a **Fellowship** (real-time multiplayer).
*   **Live Saga Sync**: Decentralized real-time synchronization via **Gun.js**. No central database required—just share a room code.
*   **The Armory of Chance**: Integrated 3D-logic dice roller with automatic modifier calculation.


---

## 🚀 Installation & Setup

Follow these steps to manifest the app on your local machine. This project uses a modern build pipeline (Vite recommended) to handle TypeScript and Environment Variables.

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   An API Key from [Google AI Studio](https://aistudio.google.com/) (Ensure you have access to Gemini 1.5/2.5/3 models)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/mythos-dm.git
cd mythos-dm
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory. This key is injected into the client at build time.
```env
API_KEY=your_gemini_api_key_here
```

### 5. Launch the Portal
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or similar port).

---

## 🤝 Multiplayer (The Fellowship)

Mythos DM uses **Gun.js**, a decentralized graph database, to sync game states between players without a middle-man server.

1.  **Host**: Select "The Fellowship" -> "Host Saga". Copy the generated **Saga Code** (e.g., `DRAGON-452`).
2.  **Join**: Other players select "The Fellowship" -> "Join the Party" and enter the code.
3.  **Sync**: 
    *   **Character Injection**: When a player creates a character in a lobby, they claim ownership of that specific hero.
    *   **State**: All character sheet updates, dice rolls, and chat messages synchronize across all connected peers instantly.
    *   **Lock**: You will only see "Identity" buttons for characters you created. The Host can control NPCs.

---

## 🛠️ Technical Stack

*   **Engine**: Google Gemini 3 Pro / Flash
*   **Frontend**: React + TypeScript
*   **Styling**: Tailwind CSS
*   **Sync**: Gun.js (Decentralized P2P)
*   **Icons**: Lucide React
*   **Build Tool**: Vite (Implicit)

---

## 📜 License
This project is open-source. Please credit the original creator when branching or hosting public versions.

*Happy adventuring! May your crits be many and your fumbles be legendary.*
