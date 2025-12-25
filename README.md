
# ⚔️ Mythos DM: D&D 5e Adventure Companion

Mythos DM is an immersive, AI-powered Dungeon Master designed for Dungeons & Dragons 5th Edition. It leverages the **Gemini 3 Pro** engine to weave epic narratives, manage party stats, and facilitate real-time multiplayer sagas.

## 🌟 Features

*   **AI Dungeon Master**: A specialized Gemini-driven DM that understands 5e rules, tracks party state, and adapts to player choices.
*   **The Gate of Choice**: Play as a **Lone Hero** (local-only) or form a **Fellowship** (real-time multiplayer).
*   **Live Saga Sync**: Decentralized real-time synchronization via **Gun.js**. No central database required—just share a room code.
*   **The Armory of Chance**: Integrated 3D-logic dice roller with automatic modifier calculation.
*   **Saga Budget**: Real-time token tracking to monitor your adventure's "energy" (credits).

---

## 🚀 Installation & Setup

Follow these steps to manifest the app on your local machine.

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   An API Key from [Google AI Studio](https://aistudio.google.com/)

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
Create a `.env` file in the root directory and add your Gemini API Key:
```env
API_KEY=your_gemini_api_key_here
```

### 5. Launch the App
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🤝 Multiplayer (The Fellowship)

Mythos DM uses **Gun.js**, a decentralized graph database, to sync game states between players without a middle-man server.

1.  **Host**: Select "The Fellowship" -> "Host Session". Copy the generated **Saga Code** (e.g., `DRAGON-452`).
2.  **Join**: Other players select "The Fellowship" -> "Join the Party" and enter the code.
3.  **Sync**: All character sheet updates, dice rolls, and chat messages will synchronize across all connected peers instantly.

---

## 🛠️ Technical Stack

*   **Engine**: Google Gemini 3 Pro
*   **Frontend**: React + TypeScript
*   **Styling**: Tailwind CSS
*   **Sync**: Gun.js (Decentralized P2P)
*   **Icons**: Lucide React
*   **Deployment**: Optimized for Vercel, Netlify, or GitHub Pages.

---

## 📜 License
This project is open-source. Please credit the original creator when branching or hosting public versions.

*Happy adventuring! May your crits be many and your fumbles be legendary.*
