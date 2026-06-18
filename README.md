# EcoSpend AI 🪙🌱

**EcoSpend AI** is a premium, AI-powered full-stack personal finance tracker that encourages carbon-conscious spending. It empowers users to monitor their monthly transactions, analyze their financial and carbon footprints, receive customized green alternatives, compete in sustainability challenges, and earn certificates for outstanding environmental stewardship.

---

## 🌟 Features

### 1. Interactive Eco-Dashboard
- **Receipt Parsing**: Upload receipt images to extract and log transactions automatically.
- **Quick Logging**: Log expenses manually or use quick categories.
- **Eco Metrics**: View real-time tracking of carbon offset (in kg of $CO_2$) and money saved through sustainable alternatives.

### 2. AI Eco-Advisor (Gemini Powered)
- Chat with a personalized AI assistant that analyzes your spending history.
- Get actionable budgeting advice and cost-reducing, eco-friendly product alternatives.

### 3. Rich Analytics & Data Visualization
- Interactive spending-vs-carbon charts powered by **Recharts**.
- Category-wise analysis highlighting where you spend the most and how to optimize both budget and environmental impact.

### 4. Leaderboard, Challenges & Streaks
- Compete on the community leaderboard with weekly eco-scores.
- Join sustainability challenges (e.g., "Zero-Waste Week", "Public Transit Commuter") and check off tasks.
- Keep up a daily login streak to earn extra Eco Points.

### 5. Green Marketplace
- Earn **Eco Points** through green purchases and challenge check-ins.
- Redeem points in the marketplace for eco-friendly goods, solar chargers, and zero-waste items.

### 6. Sustainability Certificates
- Automatically generate and download a custom, dynamically formatted PDF certificate showing your stewardship tier (Bronze, Silver, Gold).
- Tracks total carbon offset, eco-points, and financial savings in a premium layout.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (Charts), Lucide React (Icons)
- **Effects**: Canvas Confetti (Gamified successes)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Token (JWT) secured via HttpOnly cookies
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **PDF Engine**: PDFKit

---

## 📂 Project Structure

```text
EcoSpendAI/
├── backend/
│   ├── config/             # Database connection configurations
│   ├── controllers/        # Route controllers (Auth, Expenses, Reports)
│   ├── middleware/         # Auth verification and file upload middlewares
│   ├── models/             # Mongoose database schemas (User, Expense, Category)
│   ├── routes/             # Express API routes
│   ├── utils/              # Helper utilities (Gemini API, PDF Generator)
│   ├── server.js           # Express app entry point
│   └── package.json        # Backend scripts & dependencies
│
└── frontend/
    ├── src/
    │   ├── components/     # UI Pages (Dashboard, Analytics, Leaderboard, etc.)
    │   ├── context/        # React Contexts (Auth and Theme state management)
    │   ├── App.jsx         # View router and layout assembly
    │   ├── index.css       # Core Tailwind styling tokens
    │   └── main.jsx        # App mounting point
    ├── index.html          # HTML Shell
    ├── vite.config.js      # Dev server configurations & API Proxy
    └── package.json        # Frontend scripts & dependencies
