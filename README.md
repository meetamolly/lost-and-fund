# MO-TECH - Lost & Found Web Application

MO-TECH is a premium, interactive client-side web application designed to safely reunite individuals with lost valuables. It features account authentication, comprehensive lost/found item posting grids, and fully functional interactive Leaflet maps with styled dark tiles to showcase pickup coordinates.

## Features

1. **Modern Responsive Design:** A state-of-the-art interface utilizing clean typography (Outfit & Inter), custom glassmorphism, glowing micro-animations, and dynamic visual hover effects.
2. **Mock Account Registry:** Full local storage persistence allows you to sign up new accounts, sign in, log out, and filter items posted by your specific profile.
3. **Interactive Map Coordinates:** Integrated with **Leaflet.js** and **OpenStreetMap** (using CartoDB Dark Matter tiles) to let found posters pinpoint the exact pickup location on the map, which viewable users can see.
4. **Safety Verification Enforcements:** Prominent warnings display persistently after logging in and when editing/viewing posts to keep you safe:
   > *"Safety First: Only meet in a public place, open place, or police station to collect your lost item."*
5. **Robust Filtering:** Real-time character-matching live search queries, item type tabs (Lost vs. Found), and category dropdown filters.

---

## How to Run the App

Since MO-TECH is a pure client-side application built with HTML, CSS, and JS, you can open and run it instantly on your system.

### Option 1: Open Directly in Browser (Easiest)
Simply open your web browser and navigate to the local file path:
[file:///C:/Users/GOOGLE/.gemini/antigravity/scratch/lost-and-found-app/index.html](file:///C:/Users/GOOGLE/.gemini/antigravity/scratch/lost-and-found-app/index.html)

Or locate `index.html` inside the folder `C:\Users\GOOGLE\.gemini\antigravity\scratch\lost-and-found-app` and double-click it.

### Option 2: Run a Local Static Server
If you prefer testing over a local server connection, you can start one using Python or Node:

#### Using Python (Built-in)
1. Open terminal/PowerShell.
2. Run the following command:
   ```bash
   python -m http.server 8000 --directory "C:\Users\GOOGLE\.gemini\antigravity\scratch\lost-and-found-app"
   ```
3. Open your browser and navigate to: [http://localhost:8000](http://localhost:8000)

#### Using Node.js (npx)
1. Open terminal/PowerShell.
2. Run the following command:
   ```bash
   npx serve "C:\Users\GOOGLE\.gemini\antigravity\scratch\lost-and-found-app"
   ```
3. Open your browser and navigate to the address shown in the terminal (typically [http://localhost:3000](http://localhost:3000)).
