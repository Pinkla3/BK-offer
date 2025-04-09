# BK-offer (Fullstack Deploy Guide)

Projekt typu **Fullstack**: frontend (React/Vite) + backend (Node.js/Express) + baza danych (MongoDB lub PostgreSQL).

---

## 📁 Struktura projektu
```
BK-offer/
├── client/       # Frontend (Vite/React)
│   ├── .env      # Zmienna VITE_API_URL
│   └── vercel.json
├── server/       # Backend (Express)
│   ├── .env      # PORT, MONGODB_URI, JWT_SECRET
│   └── server.js
├── render.yaml   # Konfiguracja backendu Render
└── README.md
```

---

## 🌐 Frontend: Vercel

### Konfiguracja:
1. Wejdź na https://vercel.com i połącz z GitHub
2. Wybierz katalog `client`
3. Ustaw:
   - Framework: **Vite** lub **React**
   - Build Command: `npm run build`
   - Output directory: `dist`
4. Dodaj zmienne środowiskowe:
   ```env
   VITE_API_URL=https://<BACKEND-RENDER-URL>
   ```
5. Zatwierdź deploy ✅

#### Plik `client/vercel.json`:
```json
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
```

---

## 🧠 Backend: Render

### Krok po kroku:
1. Wejdź na https://render.com
2. Kliknij **"New" → "Blueprint"**
3. Wybierz repozytorium z plikiem `render.yaml`
4. Render utworzy usługę backendową automatycznie

#### Plik `render.yaml`:
```yaml
services:
  - type: web
    name: bk-offer-backend
    env: node
    rootDir: server
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: PORT
        value: 3009
      - key: MONGODB_URI
        value: <TWOJE_URI>
      - key: JWT_SECRET
        value: <TWÓJ_SEKRET>
```

#### Upewnij się, że w `server.js` masz:
```js
require('dotenv').config();
```

---

## 🧪 Test lokalny
```bash
# uruchom backend
cd server && npm install && npm run dev

# uruchom frontend
cd ../client && npm install && npm run dev
```

---

## ✅ Gotowe adresy (po deployu)

| Część    | Hosting | URL                                      |
|----------|---------|------------------------------------------|
| Frontend | Vercel  | https://bk-offer.vercel.app              |
| Backend  | Render  | https://bk-offer-backend.onrender.com    |

---

> Masz pytania lub coś nie działa? Zajrzyj do logów w Render lub Vercel – lub skontaktuj się ze mną 💬

