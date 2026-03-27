# SafePath: Project Overview & Deep Dive

This document provides a detailed breakdown of each file, the core logic, and the end-to-end workflow for the SafePath Hyderabad AI Navigation project.

---

## 📂 1. Detailed File-by-File Breakdown

### [app.js](file:///c:/Users/chili/Desktop/PROJECTS/safePath/app.js) (The Backend Server)
- **Primary Function:** Managed routes, API endpoints, and real-time Socket.io communication.
- **Key Logic Points:**
  - **[API Key Loader](file:///c:/Users/chili/Desktop/PROJECTS/safePath/app.js#L23-32):** Reads the Google Maps API key from `.env` or `api.txt` and serves it to the frontend via a dynamic script.
  - **[Crime Data API](file:///c:/Users/chili/Desktop/PROJECTS/safePath/app.js#L40-47):** Serves clustered crime data from JSON.
  - **[Route Safety API](file:///c:/Users/chili/Desktop/PROJECTS/safePath/app.js#L50-61):** Calculates the safety index of a path by calling the `routeService`.
  - **[Socket.IO Real-time Tracking](file:///c:/Users/chili/Desktop/PROJECTS/safePath/app.js#L64-81):** Continuous GPS updates sent to the client to warn of nearby danger.

### [services/routeService.js](file:///c:/Users/chili/Desktop/PROJECTS/safePath/services/routeService.js) (The Math & Logic Engine)
- **Primary Function:** Processes GPS data and crime hotspots to compute risk.
- **Key Logic Points:**
  - **[Haversine Formula](file:///c:/Users/chili/Desktop/PROJECTS/safePath/services/routeService.js#L24-34):** Standard mathematical formula for spherical distance (KM) between two GPS points.
  - **[Route Safety Calculation](file:///c:/Users/chili/Desktop/PROJECTS/safePath/services/routeService.js#L44-74):** Compares every point on a suggested route to the crime database within a **150-meter** radius.
  - **[Nearby Danger Discovery](file:///c:/Users/chili/Desktop/PROJECTS/safePath/services/routeService.js#L80-102):** Finds dangerous zones within a **300-meter** radius for real-time alerts.

### [public/index.html](file:///c:/Users/chili/Desktop/PROJECTS/safePath/public/index.html) (The Frontend interface)
- **Primary Function:** Renders the map, integrates Google Maps API, and displays results.
- **Key Logic Points:**
  - **[Map Initialization](file:///c:/Users/chili/Desktop/PROJECTS/safePath/public/index.html#L164-177):** Starts Google Maps, centered on Hyderabad (or user location).
  - **[Processing Suggested Routes](file:///c:/Users/chili/Desktop/PROJECTS/safePath/public/index.html#L192-235):** When multiple routes are fetched, this code draws them on the map and markers nearby crime hotspots.
  - **[Real-time Geolocation Logic](file:///c:/Users/chili/Desktop/PROJECTS/safePath/public/index.html#L282-293):** Constantly watches the user's location and sends it to the server.

### [data/hyd_clustered.json](file:///c:/Users/chili/Desktop/PROJECTS/safePath/data/hyd_clustered.json) (The Data Layer)
- **Primary Function:** A pre-processed JSON file containing crime hotspots in Hyderabad, each with a "magnitude" (danger level).

### [pythonScript/](file:///c:/Users/chili/Desktop/PROJECTS/safePath/pythonScript/) (The Pre-processing AI)
- **[kmeans_hyd.py](file:///c:/Users/chili/Desktop/PROJECTS/safePath/pythonScript/kmeans_hyd.py):** Used during development to cluster thousands of raw crime incidents into the 100+ hotspots stored in the JSON.

---

## 🔄 2. The Project Workflow (Step-by-Step)

### Phase 1: Server and Client Initialization
1.  **Launch:** You run `node app.js`, which loads the Google Maps API key from your `.env` file.
2.  **Access:** The user visits the website; the browser loads `index.html`.
3.  **Map Initialization:** The browser requests `maps-loader.js` from the server, which provides the authenticated Google Maps script. The `initMap` function is called.

### Phase 2: Finding a Route
4.  **User Input:** The user enters an origin (e.g., Charminar) and destination (e.g., Gachibowli).
5.  **Route Discovery:** The browser calls `directionsService.route`. Google returns several possible routes.
6.  **Crime Data Fetching:** The browser fetches the crime hotspots from the backend (`/api/crime-data/hyd_clustered`) **once**.

### Phase 3: Safety Analysis & Visualization
7.  **Proximity Check:** For each route, the frontend calculates if any crime markers are within 1km of the path.
8.  **Backend Scoring:** The points of the path are sent to the `/api/route-safety` API.
9.  **Calculation:** The server (via `routeService.js`) calculates a **Danger Index** (the average magnitude of crimes near the route).
10. **UI Update:** The sidebar updates with colorful cards showing:
    - Distance and Time.
    - Calculated **Danger Index**.
    - **Safe Corridors:** Green markers placed in areas with no recorded crimes.

### Phase 4: Real-time Live Tracking
11. **GPS Connection:** If the user moves, `navigator.geolocation` triggers a "watch."
12. **Socket Update:** The live GPS position is sent to the server via **Socket.io**.
13. **Danger Alerts:** If the user gets within 300m of a high-danger zone, the server pushes an immediate update/alert back to the client.

---

## 💡 Key Technical Explanations (For Interviews/Presentations)
- **The Core Innovation:** Traditional navigation systems (like Google Maps) optimize for **Time-Efficiency**. SafePath introduces **Risk-Optimization**.
- **The Math:** We use the [Haversine formula](file:///c:/Users/chili/Desktop/PROJECTS/safePath/services/routeService.js#L24) because straight-line distance (Euclidean) doesn't account for the Earth's curvature.
- **Why Clustering?** Tracking 10,000 individual crimes on a map is too slow. By using **K-Means Clustering**, we turn them into "hotspots," making the data light enough for real-time mobile browser use.
- **Backend Role:** The backend is critical because it performs the CPU-heavy proximity calculations, keeping the frontend smooth.
