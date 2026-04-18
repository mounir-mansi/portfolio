# Portfolio — Mounir Mansi

Full-stack developer portfolio with multilingual support, project showcase, and admin panel.

**Live:** [mandev.fr](https://mandev.fr)

---

## Stack

**Frontend**
- React 19 + Vite
- React Router v7
- i18next (FR / EN)

**Backend**
- Node.js + Express 5
- Prisma ORM + PostgreSQL
- JWT authentication (httpOnly cookies)
- Argon2 password hashing
- Cloudflare R2 (image storage)
- Resend (contact emails)
- Helmet + rate limiting

---

## Features

- Multilingual (French / English)
- Home, About, Skills, Projects, Contact pages
- Project detail pages with images
- Admin panel — manage projects, skills, messages
- Contact form with email notification
- JWT-protected admin routes

---

## Project Structure

```
portfolio/
├── backend/
│   ├── prisma/         # Schema + migrations + seed
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        └── pages/
            ├── HomePage/
            ├── AboutPage/
            ├── SkillsPage/
            ├── ProjectsPage/
            ├── ProjectDetailPage/
            ├── ContactPage/
            └── AdminScreen/
```

---

## Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev
npx prisma db seed
npm run dev            # :3002

# Frontend
cd frontend
npm install
npm run dev            # :5173
```

---

## Security

- Passwords hashed with Argon2
- JWT stored in httpOnly cookies (not localStorage)
- Helmet security headers
- Express rate limiting
- Environment variables for all secrets
