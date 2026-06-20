# ResumeAI  — L8 Principal Engineer Resume Evaluator

Evaluate your technical resume like a Principal/Staff Software Engineer (L8/ICT6) at Google, Apple, Netflix, Meta, or Stripe. ResumeAI combines advanced client-side WebGL, real-time audio synthesis, and Google Gemini LLM diagnostics to analyze your engineering experience, calculate match scores, uncover technical gaps, and write metrics-driven resumes.

---

## 🚀 Key Features

* **3D Particle Hologram Canvas**: Built using **Three.js (WebGL)**, featuring a floating holographic document that tilts dynamically with mouse movements and enters a high-speed laser-scanning animation phase during analysis.
* **Cinematic Scroll Parallax**: The 3D model translates, scales, and orbits dynamically based on scroll triggers, transitioning smoothly to the side of the screen when entering the workspace.
* **Space-Dust Backdrops & Orbiting Tech Stack Nodes**: A layer of 600 twinkling particles creating parallax depth, surrounded by colored orbital 3D nodes (representing JS, Python, Docker, Kubernetes) traversing mathematical trajectories.
* **Cursor Spotlight Hover Glows**: Custom mousemove delegates calculate relative card coordinates to project a cursor-following radial spotlight mask behind card contents (inspired by Stripe and Linear layouts).
* **Tactile Audio Synthesis**: Emits synthesised high-frequency clicks, digital noise swooshes, and Major 7th chord chimes using the native browser **Web Audio API** (zero asset download latency, with built-in mute toggler).
* **L8 Senior Engineer Persona Reports**: Custom evaluation letters calibrated to the specific culture and technical depth of Google (algorithms & scale), Stripe (API craft & reliability), Netflix (resilience & microservices), and more.
* **Metrics-Driven Bullet Optimizer (Diff)**: Side-by-side comparative cards showing you exactly how to rewrite weak project statements into high-impact descriptions.
* **Dual Analysis Pipeline**:
  1. *Local Heuristics Engine (Default)*: Run instant keyword overlap and density diagnostics offline.
  2. *Gemini Live AI (Optional)*: Securely save your Gemini API Key in localStorage to execute full client-side L8 senior persona evaluations.

---

## 🛠️ System Architecture & File Structure

```
bootcamp/
├── index.html                  # SEO-optimized viewport and meta descriptors
├── src/
│   ├── main.jsx                # Entry point rendering React strict wrapper
│   ├── App.jsx                 # Core workspace state dashboard and mouse handlers
│   ├── App.css                 # Glassmorphic layout grids and circular progress SVG
│   ├── index.css               # Resets, global typography, and hover highlight filters
│   ├── components/
│   │   └── ResumeCanvas.jsx    # Three.js animation loops and scroll interpolators
│   └── utils/
│       ├── AnalysisEngine.js   # Company rubrics, local parser, and Gemini integrations
│       └── AudioHelper.js      # Web Audio API synthesizers (clicks, swooshes, success chime)
└── package.json                # Project scripts and dependencies (three, lucide-react)
```

---

## 📦 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your local machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Reddy-02/Bootcamp.git
   cd Bootcamp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch local dev server:
   ```bash
   npm run dev
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## 🔑 Configure Gemini AI

1. Go to the [Google AI Studio API Key Manager](https://aistudio.google.com/app/apikey) and generate a new key.
2. In the ResumeAI dashboard header, click the **Settings (Gear)** icon.
3. Paste your key in the API Key box. It will be saved securely directly into your browser's local storage (never sent to third parties).
4. Select a company and role, click **Run Senior Diagnostic**, and evaluate!
