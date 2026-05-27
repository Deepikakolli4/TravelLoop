# Travel Loop 🌍✈️

### AI-Powered Personalized Travel Planning Platform

Travel Loop is an intelligent travel management platform designed to simplify and personalize trip planning. The application generates customized travel itineraries based on user preferences such as destination, budget, group size, duration, and travel goals.

Built using modern full-stack technologies, Travel Loop integrates AI-powered recommendations, interactive maps, secure authentication, and real-time trip management to deliver a seamless travel planning experience.

---

## 🚀 Features

- 🔐 Secure Authentication using Clerk & JWT
- 🤖 AI-powered itinerary generation using GPT/Gemini APIs
- 🗺️ Interactive route visualization with Google Maps / Mapbox
- 📍 Personalized travel recommendations
- 💳 Subscription & usage limit management using Arcjet & Stripe
- 📦 Centralized trip storage and management
- ⚡ Real-time itinerary updates
- 📱 Responsive and modern UI
- 🧭 Dynamic trip planning based on:
  - Budget
  - Group size
  - Destination
  - Preferences
  - Duration

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Convex

### Database
- Convex DB / MongoDB

### APIs & Services
- GPT / Gemini APIs
- Google Maps API / Mapbox
- Clerk Authentication
- Arcjet Rate Limiting
- Stripe Payment Gateway

---

## 📂 Project Structure

```bash
TravelLoop/
│── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── styles/
│
│── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── utils/
│
│── database/
│── public/
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Deepikakolli4/TravelLoop.git
cd TravelLoop
```

### 2️⃣ Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

GEMINI_API_KEY=
OPENAI_API_KEY=

MONGODB_URI=
CONVEX_DEPLOYMENT=

STRIPE_SECRET_KEY=

MAPBOX_API_KEY=
GOOGLE_MAPS_API_KEY=
```

---

## ▶️ Run the Application

### Start Frontend

```bash
npm run dev
```

### Start Backend

```bash
npm start
```

---

## 📌 Core Modules

- User Authentication Module
- AI Recommendation Engine
- Trip Planning Module
- Map & Route Visualization
- Subscription & Usage Management
- Trip Storage & Retrieval

---

## 🔮 Future Enhancements

- Real-time weather integration
- Hotel & flight booking support
- AI chatbot travel assistant
- Collaborative group trip planning
- Multi-language support

---

## 👩‍💻 Contributors

- Deepika Kolli
- Chintada Sujana Priya
- Madhumitha Potharaju
- Kotana Bindu Madhuri

---

## 📄 License

This project is developed for academic and learning purposes.
