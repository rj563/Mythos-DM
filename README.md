
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

### 1. Project IDX (Recommended)
This project is optimized for [Google Project IDX](https://idx.dev/).
1.  Open the repo in Project IDX.
2.  The environment will automatically install dependencies via the configured Nix environment.
3.  The preview server will start automatically.

### 2. Manual Setup
*   [Node.js](https://nodejs.org/) (v20 or higher recommended)

```bash
git clone https://github.com/yourusername/mythos-dm.git
cd mythos-dm
npm install
npm run dev
```

---

## 🔑 API Key Configuration

To play, users must provide their own **Google Gemini API Key**.
1.  Get a key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Launch the app.
3.  Enter the key in the "Arcane Source Missing" screen.

---

## ☁️ Deployment (Firebase Hosting)

1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize: `firebase init hosting` (Choose "Use existing project" or "Create new", use `dist` as public directory, "Yes" to single-page app).
4.  Build and Deploy:
    ```bash
    npm run build
    firebase deploy
    ```

---

## 🤝 Multiplayer (The Fellowship)

Mythos DM uses **Gun.js**, a decentralized graph database, to sync game states between players without a middle-man server.

1.  **Host**: Select "The Fellowship" -> "Host Saga". Copy the generated **Saga Code**.
2.  **Join**: Other players select "The Fellowship" -> "Join the Party" and enter the code.
3.  **Sync**: Character sheets, dice rolls, and chat messages synchronize across all connected peers instantly.

---

## 🛠️ Technical Stack

*   **Engine**: Google Gemini 3 Pro / Flash
*   **Frontend**: React + TypeScript
*   **Styling**: Tailwind CSS
*   **Sync**: Gun.js
*   **Build Tool**: Vite

---

## 📜 License
This project is open-source. Please credit the original creator when branching or hosting public versions.
