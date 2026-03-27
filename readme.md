# Safe Path Recommender: Hyderabad

**"Look before you leave!"**

SafePath is a navigation enhancement tool that prioritizes **personal safety** over just travel time. While traditional GPS systems (like Google Maps) focus on the fastest route, SafePath evaluates the **Danger Index** along potential paths using historical crime data and real-time proximity alerts.

---

## 🚀 Project Overview

In rapidly growing urban hubs like Hyderabad and the surrounding GHMC areas, safety patterns change across neighborhoods. SafePath helps users make informed decisions by visualizing high-risk areas ("hotspots") and calculating the safest possible route between two locations.

### Key Features
*   🛡️ **Safety-First Routing**: Calculates a "Danger Index" for multiple route options.
*   📍 **Hyderabad Specific**: Mapped across 500+ micro-level data points including Hitech City, Madhapur, Mehdipatnam, Uppal, and the ORR corridor.
*   ⚠️ **Real-Time Alerts**: Uses Socket.io and GPS tracking to warn users when they approach dangerous zones (within 300m).
*   📊 **AI-Driven Data**: Uses **K-Means Clustering** to process raw crime incidents into manageable, high-impact hotspots.
*   🚦 **Visual Legend**: Intuitive markers ranging from Green Ticks (Safe) to Red Skulls (High Danger).

---

## 🛠️ Tech Stack

*   **Frontend**: Vanilla HTML5, CSS3, JavaScript (Google Maps JS API).
*   **Backend**: Node.js, Express.js.
*   **Real-time**: Socket.io for live GPS tracking and safety updates.
*   **Data Processing**: Python (Scikit-Learn for K-Means Clustering).
*   **APIs**: Google Maps Directions, Places, and Geolocation APIs.

---

## 📝 Development & Implementation Notes

For a deep dive into the architecture, file-by-file logic, and the end-to-end workflow of this project, please refer to the building notes:

👉 **[PROJECT_NOTES.md](PROJECT_NOTES.md)**
> *This document contains the technical breakdown and internal logic captured during the development process.*

---

## 🚦 How it Works (The Workflow)

1.  **Input**: User enters origin and destination in the search interface.
2.  **Route Discovery**: Google Maps API fetches potential routes.
3.  **Risk Analysis**: The backend server processes the route coordinates against clustered crime data (retrieved via the `routeService`).
4.  **Scoring**: Each path is assigned a score based on nearby crime magnitude.
5.  **Visualization**: The map displays markers, and the sidebar highlights the safest path with color-coded safety indices.

---

## 📜 Credits & Acknowledgments

This project was refined and simplified from its original version to focus on a lightweight, public-facing interface for the Hyderabad region.

*Original concept by [Ishank Agarwal](https://www.github.com/ishank62).*