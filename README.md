# BK-offer (Fullstack Deploy Guide)

Projekt typu **Fullstack**: frontend (React/Vite) + backend (Node.js/Express) + baza danych (MongoDB lub PostgreSQL).

---

## 📁 Struktura projektu
```
BK-offer/
├── client/       # Frontend (React)
│   ├── .env      # Zmienna REACT_APP_API_URL
├── server/       # Backend (Express)
│   ├── .env      # PORT, MONGODB_URI, JWT_SECRET
│   └── server.js
└── README.md

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
konfiguracja NGINX:

location / {
	proxy_pass http://localhost:3008;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
}
location /api/ {
	proxy_pass http://localhost:3009;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
}
---

> Masz pytania lub coś nie działa? Zajrzyj do logów w Render lub Vercel – lub skontaktuj się ze mną 💬

