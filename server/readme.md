BK-offer (Fullstack Deploy Guide)

Projekt typu Fullstack: frontend (React/Vite) + backend (Node.js/Express) + baza danych (MongoDB lub PostgreSQL).

📁 Struktura projektu

BK-offer/
├── client/       # Frontend (Vite/React)
│   ├── .env      # Zmienna VITE_API_URL
│   └── vercel.json
├── server/       # Backend (Express)
│   ├── .env      # PORT, MONGODB_URI, JWT_SECRET
│   └── server.js
├── render.yaml   # Konfiguracja backendu Render
└── README.md

🌐 Frontend: Vercel

Konfiguracja:

Wejdź na https://vercel.com i połącz z GitHub

Wybierz katalog client

Ustaw:

Framework: Vite lub React

Build Command: npm run build

Output directory: dist

Dodaj zmienne środowiskowe:

VITE_API_URL=https://<BACKEND-RENDER-URL>

Zatwierdź deploy ✅

Plik client/vercel.json:

{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://<BACKEND-RENDER-URL>/api/$1",
      "headers": {
        "Access-Control-Allow-Origin": "*"
      }
    }
  ]
}

🧠 Backend: Render

Krok po kroku:

Wejdź na https://render.com

Kliknij "New" → "Blueprint"

Wybierz repozytorium z plikiem render.yaml

Render utworzy usługę backendową automatycznie

Plik render.yaml:

services:
  - type: web
    name: bk-offer-backend
    env: node
    rootDir: server
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: PORT
        value: 3001
      - key: MONGODB_URI
        value: <TWOJE_URI>
      - key: JWT_SECRET
        value: <TWÓJ_SEKRET>

Upewnij się, że w server.js masz:

require('dotenv').config();

🧪 Test lokalny

# uruchom backend
cd server && npm install && npm run dev

# uruchom frontend
cd ../client && npm install && npm run dev

✅ Gotowe adresy (po deployu)

Część

Hosting

URL

Frontend

Vercel

https://bk-offer.vercel.app

Backend

Render

https://bk-offer-backend.onrender.com

Masz pytania lub coś nie działa? Zajrzyj do logów w Render lub Vercel – lub skontaktuj się ze mną 💬

