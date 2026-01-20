# Frontend Assignment – Project Documentation

## 📌 Project Overview

This project is a **frontend assignment** built to demonstrate core frontend development concepts such as component-based architecture, state handling, user interactions, and integration of map/geospatial features. The assignment focuses on clean UI behavior, correct data handling, and proper project structure.

The project was developed as part of a technical assessment and follows standard frontend best practices.

---

## 🛠️ Tech Stack

* **Framework / Library:** React (Vite)
* **Language:** JavaScript / TypeScript
* **Styling:** CSS / Tailwind (if applicable)
* **Map Library:** React Leaflet / Leaflet
* **Package Manager:** npm

---

## 📂 Project Structure

```
project-root/
│
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── features/           # Feature-specific logic (map, drawing tools)
│   ├── data/               # GeoJSON or mock data
│   ├── pages/              # Page-level components
│   ├── utils/              # Helper functions
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
│
├── package.json             # Dependencies & scripts
├── vite.config.js           # Vite configuration
└── README.md                # Project documentation
```

---

## ⚙️ Installation & Setup

### 1️⃣ Prerequisites

Ensure you have the following installed:

* **Node.js** (v16 or above)
* **npm** (comes with Node.js)

Check versions:

```
node -v
npm -v
```

---

### 2️⃣ Clone the Repository

```
git clone <repository-url>
cd <project-folder>
```

---

### 3️⃣ Install Dependencies

```
npm install
```

This will install all required dependencies listed in `package.json`.

---

### 4️⃣ Start the Development Server

```
npm run dev
```

The application will start locally, usually at:

```
http://localhost:5173/
```

---

## ▶️ How to Use the Application

1. Open the application in the browser.
2. View the interactive map interface.
3. Use drawing tools (circle, polygon, square) to add shapes.
4. Shapes are rendered dynamically on the map.
5. GeoJSON data is processed and displayed correctly.

---

## 🔁 Code Flow Diagram

```
┌────────────┐
│  User UI   │
└─────┬──────┘
      │ User Action (Draw / Click)
      ▼
┌────────────┐
│ Components │
│ (UI Layer) │
└─────┬──────┘
      │ State Update
      ▼
┌────────────┐
│ Map Logic  │
│ (Leaflet)  │
└─────┬──────┘
      │ Geometry Handling
      ▼
┌────────────┐
│ GeoJSON    │
│ Processing │
└─────┬──────┘
      │ Render Output
      ▼
┌────────────┐
│ Map View   │
│ (Display)  │
└────────────┘
```

---

## 🧠 Key Concepts Implemented

* Component-based UI design
* State management for map features
* Handling GeoJSON data formats
* Dynamic rendering of shapes
* Error handling for invalid geometry types

---

## 🧪 Common Issues & Fixes

**Issue:** Type errors while rendering square or polygon

* ✔️ Ensure correct GeoJSON type is passed
* ✔️ Validate coordinates format before rendering

**Issue:** Map not loading

* ✔️ Check Leaflet CSS import
* ✔️ Verify map container height

---

## 🚀 Build for Production

```
npm run build
```

The optimized build will be generated inside the `dist/` folder.

---

## 📄 Assignment Notes

* This project is frontend-only
* No backend or database integration
* Focused on correctness, UI behavior, and clean code

---

## 👤 Author

**Anant Tyagi**
Frontend Developer

---

## ✅ Conclusion

This assignment demonstrates practical frontend skills including UI rendering, map integrations, and structured project setup. It follows modern frontend standards and is easy to extend further.
